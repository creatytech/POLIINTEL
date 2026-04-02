// web/src/components/landing/SignatureForm.tsx
import { useEffect, useRef, useState } from 'react';
import { useForm }                      from 'react-hook-form';
import { zodResolver }                  from '@hookform/resolvers/zod';
import { z }                            from 'zod';
import SignaturePad                     from 'signature_pad';
import { useTranslation }               from 'react-i18next';
import { motion, AnimatePresence }      from 'framer-motion';
import { supabase, callEdgeFunction }   from '../../lib/supabase';
import { useSyncStore }                 from '../../store/syncStore';
import type { Database }                from '../../types/database';

type Initiative = Database['public']['Tables']['initiatives']['Row'];

const SignatureFormSchema = z.object({
  full_name:       z.string().min(3, 'errors.required').max(100),
  province_id:     z.string().uuid('errors.required'),
  municipality_id: z.string().uuid('errors.required'),
  email:           z.string().email('errors.invalidEmail').optional().or(z.literal('')),
  phone:           z.string().min(10, 'errors.invalidPhone').optional().or(z.literal('')),
  consent_bool:    z.literal(true, { errorMap: () => ({ message: 'errors.consentRequired' }) }),
});

type FormValues = z.infer<typeof SignatureFormSchema>;

interface Props {
  initiative: Initiative;
  refChannel: string;
  mode:       string;
}

type Step = 'form' | 'signature' | 'success';

export function SignatureForm({ initiative, refChannel }: Props) {
  const { t }                                   = useTranslation();
  const { isOnline, queueItem }                 = useSyncStore();
  const canvasRef                               = useRef<HTMLCanvasElement>(null);
  const padRef                                  = useRef<SignaturePad | null>(null);
  const [step, setStep]                         = useState<Step>('form');
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [verifyId, setVerifyId]                 = useState<string | null>(null);
  const [provinces, setProvinces]               = useState<{ id: string; name: string }[]>([]);
  const [municipalities, setMunicipalities]     = useState<{ id: string; name: string }[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(SignatureFormSchema),
  });

  const selectedProvince = watch('province_id');

  useEffect(() => {
    supabase
      .from('regions')
      .select('id, name')
      .eq('type', 'province')
      .order('name')
      .then(({ data }) => setProvinces((data ?? []) as { id: string; name: string }[]));
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;
    supabase
      .from('regions')
      .select('id, name')
      .eq('type', 'municipality')
      .eq('parent_id', selectedProvince)
      .order('name')
      .then(({ data }) => setMunicipalities((data ?? []) as { id: string; name: string }[]));
  }, [selectedProvince]);

  useEffect(() => {
    if (step !== 'signature' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr    = window.devicePixelRatio || 1;
    const rect   = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    canvas.getContext('2d')!.scale(dpr, dpr);

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255,255,255,0)',
      penColor:        '#1e293b',
      minWidth:        1.5,
      maxWidth:        3.5,
    } as ConstructorParameters<typeof SignaturePad>[1]);

    return () => padRef.current?.off();
  }, [step]);

  async function onFormValid(_data: FormValues) {
    setStep('signature');
  }

  async function onSubmitSignature(formData: FormValues) {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert(t('errors.signatureEmpty'));
      return;
    }
    setIsSubmitting(true);

    const svgPath   = padRef.current.toSVG();
    const pngBlob   = padRef.current.toDataURL('image/png');
    const timestamp = new Date().toISOString();

    try {
      if (isOnline) {
        await supabase.rpc('record_consent', {
          p_citizen_identifier: formData.email || formData.phone || formData.full_name,
          p_initiative_id:      initiative.id,
          p_purpose:            'petition_signature',
          p_consent_text:       'Acepto el tratamiento de datos según Ley 172-13',
          p_consent_version:    '1.0',
          p_ip_address:         null,
        } as Parameters<typeof supabase.rpc>[1]);

        let signatureHash = timestamp;
        try {
          const hashResult = await callEdgeFunction<{ hash: string }>('hash-signature', {
            full_name:    formData.full_name,
            id_document:  null,
            initiative_id: initiative.id,
            timestamp,
          });
          signatureHash = hashResult.hash;
        } catch {
          // Edge function no disponible localmente, usar timestamp como hash provisional
        }

        const { data: signatory, error: sErr } = await supabase
          .from('signatories')
          .insert({
            initiative_id:   initiative.id,
            full_name:       formData.full_name,
            email:           formData.email || null,
            phone:           formData.phone || null,
            province_id:     formData.province_id,
            municipality_id: formData.municipality_id,
            channel:         refChannel === 'direct' ? 'web' : 'web',
            consent_bool:    true,
            consent_text:    'Acepto tratamiento de datos según Ley 172-13',
            consent_version: '1.0',
          })
          .select('id')
          .single();
        if (sErr) throw sErr;

        const { data: sig, error: sigErr } = await supabase
          .from('signatures')
          .insert({
            signatory_id:   signatory.id,
            initiative_id:  initiative.id,
            svg_path:       svgPath,
            png_blob:       pngBlob,
            signature_hash: signatureHash,
          })
          .select('id')
          .single();
        if (sigErr) throw sigErr;

        setVerifyId(sig.id);
        setStep('success');
      } else {
        await queueItem('signature', {
          initiative_id:   initiative.id,
          full_name:       formData.full_name,
          email:           formData.email,
          phone:           formData.phone,
          province_id:     formData.province_id,
          municipality_id: formData.municipality_id,
          svg_path:        svgPath,
          png_blob:        pngBlob,
          timestamp,
          channel:         'web',
          consent_bool:    true,
        }, initiative.id);
        setStep('success');
      }
    } catch (err) {
      console.error('[POLIINTEL] Error al enviar firma:', err);
      alert(t('errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="firmar" className="py-20 px-4 bg-white">
      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {t('signature.formTitle')}
              </h2>
              <form onSubmit={handleSubmit(onFormValid)} className="space-y-4" noValidate>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('signature.fullName')} *
                  </label>
                  <input
                    {...register('full_name')}
                    placeholder={t('signature.fullNameHint')}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               text-slate-900 placeholder-slate-400"
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">{t(errors.full_name.message!)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('signature.province')} *
                  </label>
                  <select
                    {...register('province_id')}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    <option value="">— Selecciona —</option>
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.province_id && (
                    <p className="text-red-500 text-sm mt-1">{t('errors.required')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('signature.municipality')} *
                  </label>
                  <select
                    {...register('municipality_id')}
                    disabled={!selectedProvince}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-indigo-500 text-slate-900
                               disabled:opacity-50"
                  >
                    <option value="">— Selecciona —</option>
                    {municipalities.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.municipality_id && (
                    <p className="text-red-500 text-sm mt-1">{t('errors.required')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('signature.email')}
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{t('errors.invalidEmail')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('signature.phone')}
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                {/* Consent Gate — Ley 172-13 */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {t('signature.consentTitle')}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Tus datos serán utilizados únicamente para esta iniciativa conforme a la
                    Ley 172-13 de Protección de Datos Personales de la República Dominicana.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      {...register('consent_bool')}
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600
                                 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{t('signature.consentAccept')}</span>
                  </label>
                  {errors.consent_bool && (
                    <p className="text-red-500 text-sm mt-2">{t('signature.consentRequired')}</p>
                  )}
                </div>

                {!isOnline && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">⚠️ {t('signature.offlineMsg')}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-full font-bold text-white text-lg
                             transition-colors hover:opacity-90"
                  style={{ backgroundColor: initiative.brand_color ?? '#6366f1' }}
                >
                  {t('common.next')} →
                </button>
              </form>
            </motion.div>
          )}

          {step === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t('signature.drawSignature')}
              </h2>
              <p className="text-slate-500 text-sm mb-4">Usa tu dedo o lápiz táctil para firmar</p>

              <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner mb-4">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none"
                  style={{ height: '200px' }}
                />
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => padRef.current?.clear()}
                  className="flex-1 py-3 border border-slate-300 rounded-full text-slate-600
                             font-medium hover:bg-slate-50"
                >
                  {t('signature.clearSignature')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="py-3 px-6 border border-slate-300 rounded-full text-slate-600
                             font-medium hover:bg-slate-50"
                >
                  {t('common.back')}
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitSignature)}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full font-bold text-white text-lg
                             disabled:opacity-50 transition-colors hover:opacity-90"
                  style={{ backgroundColor: initiative.brand_color ?? '#6366f1' }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white
                                       border-t-transparent rounded-full" />
                      Enviando...
                    </span>
                  ) : t('signature.submitSigning')}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                className="text-7xl mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                ✅
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t('signature.successTitle')}
              </h2>

              {!isOnline && (
                <p className="text-amber-700 bg-amber-50 rounded-lg p-3 text-sm my-4">
                  {t('signature.offlineMsg')}
                </p>
              )}

              {typeof navigator.share === 'function' && (
                <button
                  onClick={() => navigator.share({
                    title: initiative.title,
                    text:  '¡Acabo de firmar! Únete tú también.',
                    url:   `${import.meta.env['VITE_APP_URL']}/${initiative.slug}`,
                  })}
                  className="mt-6 w-full py-3 rounded-full border-2 font-semibold
                             border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                >
                  {t('common.share')} 📲
                </button>
              )}

              {verifyId && (
                <a
                  href={`/verify/${verifyId}`}
                  className="block mt-3 text-sm text-slate-500 underline"
                >
                  {t('signature.verifyId')}
                </a>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
