// web/src/components/landing/TransparencyBlock.tsx
import { Shield, Database, FileText } from 'lucide-react';
import type { Database as DB }        from '../../types/database';

type Initiative = DB['public']['Tables']['initiatives']['Row'];

interface Props {
  initiative: Initiative;
}

export function TransparencyBlock({ initiative }: Props) {
  return (
    <section className="py-14 px-4 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Transparencia y datos
        </h3>
        <p className="text-slate-500 text-sm text-center mb-8">
          Esta iniciativa opera con total transparencia y cumple la Ley 172-13.
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Database className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Datos protegidos</p>
              <p className="text-slate-500 text-sm mt-0.5">
                Tus datos se almacenan de forma encriptada y nunca serán vendidos ni compartidos
                con terceros sin tu consentimiento.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Firma verificable</p>
              <p className="text-slate-500 text-sm mt-0.5">
                Cada firma recibe un hash criptográfico único que permite verificar su validez sin
                exponer datos personales.
              </p>
            </div>
          </div>

          {initiative.description && (
            <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Objetivos declarados</p>
                <p className="text-slate-500 text-sm mt-0.5">
                  {initiative.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Plataforma POLIINTEL · Todos los derechos reservados ·{' '}
          <a href="/privacy" className="underline hover:text-slate-600">Política de privacidad</a>
        </p>
      </div>
    </section>
  );
}
