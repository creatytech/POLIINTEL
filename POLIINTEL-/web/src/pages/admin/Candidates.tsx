// web/src/pages/admin/Candidates.tsx
import { useEffect, useState }    from 'react';
import { useForm }                         from 'react-hook-form';
import { zodResolver }                     from '@hookform/resolvers/zod';
import { z }                               from 'zod';
import { Plus, Edit2, Trash2, Download }   from 'lucide-react';
import { AnimatePresence, motion }         from 'framer-motion';
import { supabase }                        from '../../lib/supabase';
import { useSocialExport }                 from '../../hooks/useSocialExport';
import type { Database }                   from '../../types/database';

type Candidate  = Database['public']['Tables']['candidates']['Row'];
type Initiative = Database['public']['Tables']['initiatives']['Row'];

const CandidateSchema = z.object({
  name:          z.string().min(2).max(150),
  role_label:    z.string().max(100).optional().or(z.literal('')),
  photo_url:     z.string().url().optional().or(z.literal('')),
  color:         z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
  order:         z.coerce.number().int().optional(),
  initiative_id: z.string().uuid(),
});

type FormValues = z.infer<typeof CandidateSchema>;

export default function Candidates() {
  const [candidates, setCandidates]     = useState<Candidate[]>([]);
  const [initiatives, setInitiatives]   = useState<Initiative[]>([]);
  const [selectedInit, setSelectedInit] = useState<string>('');
  const [editing, setEditing]           = useState<Candidate | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [previewCard, setPreviewCard]   = useState<Candidate | null>(null);
  const { containerRef, exportImage }   = useSocialExport();

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(CandidateSchema) });

  useEffect(() => {
    supabase.from('initiatives').select('id, title').order('title')
      .then(({ data }) => {
        const list = (data ?? []) as Initiative[];
        setInitiatives(list);
        if (list[0]) setSelectedInit(list[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedInit) return;
    supabase.from('candidates').select('*').eq('initiative_id', selectedInit).order('order')
      .then(({ data }) => setCandidates((data ?? []) as Candidate[]));
  }, [selectedInit]);

  function openNew() {
    reset({ initiative_id: selectedInit, color: '#6366f1', order: candidates.length });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(c: Candidate) {
    reset(c as unknown as FormValues);
    setEditing(c);
    setShowForm(true);
  }

  async function onSubmit(values: FormValues) {
    if (editing) {
      const { data } = await supabase.from('candidates').update(values).eq('id', editing.id).select().single();
      if (data) setCandidates(prev => prev.map(c => c.id === editing.id ? data as Candidate : c));
    } else {
      const { data } = await supabase.from('candidates').insert(values).select().single();
      if (data) setCandidates(prev => [...prev, data as Candidate]);
    }
    setShowForm(false);
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar candidato?')) return;
    await supabase.from('candidates').delete().eq('id', id);
    setCandidates(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidatos</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedInit}
            onChange={e => setSelectedInit(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm"
          >
            {initiatives.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>
      </div>

      {/* Candidate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            {/* card header */}
            <div className="h-3" style={{ backgroundColor: c.color ?? '#6366f1' }} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: c.color ?? '#6366f1' }}
                  >
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                  {c.role_label && <p className="text-slate-400 text-xs">{c.role_label}</p>}
                </div>
              </div>
              <div className="flex gap-1 justify-end">
                <button
                  onClick={() => setPreviewCard(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  title="Exportar tarjeta"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-16 bottom-16 md:inset-x-auto md:left-1/2 md:-translate-x-1/2
                         md:w-full md:max-w-md bg-white rounded-2xl z-50 overflow-y-auto shadow-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            >
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                {editing ? 'Editar candidato' : 'Nuevo candidato'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register('initiative_id')} />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input {...register('name')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Rol</label>
                  <input {...register('role_label')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL foto</label>
                  <input {...register('photo_url')} type="url" placeholder="https://…" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color de marca</label>
                  <div className="flex gap-2">
                    <input {...register('color')} type="color" className="h-10 w-14 border rounded-lg p-1" />
                    <input {...register('color')} placeholder="#6366f1" className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border rounded-xl text-slate-600 text-sm">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Social card preview + export */}
      <AnimatePresence>
        {previewCard && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewCard(null)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/4 md:inset-auto md:left-1/2 md:top-1/2
                         md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 bg-white rounded-2xl z-50 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Exportar tarjeta social</h3>

              {/* Card preview */}
              <div
                ref={containerRef as React.RefObject<HTMLDivElement>}
                className="rounded-xl overflow-hidden mb-4"
                style={{
                  background: `linear-gradient(135deg, ${previewCard.color ?? '#6366f1'}22, white)`,
                  padding: '24px',
                }}
              >
                <div className="flex items-center gap-4">
                  {previewCard.photo_url ? (
                    <img src={previewCard.photo_url} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                         style={{ backgroundColor: previewCard.color ?? '#6366f1' }}>
                      {previewCard.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{previewCard.name}</p>
                    <p className="text-slate-500 text-sm">{previewCard.role_label ?? ''}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-right">POLIINTEL</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => exportImage('landscape', `${previewCard.name.replace(/\s+/, '-')}-1200x630.png`)}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Paisaje 1200×630
                </button>
                <button
                  onClick={() => exportImage('square', `${previewCard.name.replace(/\s+/, '-')}-1080x1080.png`)}
                  className="flex-1 py-2 border border-indigo-500 text-indigo-600 rounded-xl text-sm font-semibold"
                >
                  Cuadrada 1080×1080
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
