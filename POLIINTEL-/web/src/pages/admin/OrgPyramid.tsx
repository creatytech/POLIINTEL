// web/src/pages/admin/OrgPyramid.tsx  — POLIINTEL-05
import { useEffect, useState }   from 'react';
import { useForm }               from 'react-hook-form';
import { zodResolver }           from '@hookform/resolvers/zod';
import { z }                     from 'zod';
import { UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase }              from '../../lib/supabase';
import { useAuthStore }          from '../../store/authStore';
import type { Database }         from '../../types/database';

type Affiliation = Database['public']['Tables']['affiliations']['Row'];

const LEVEL_LABELS: Record<number, string> = {
  1: 'Coordinador Nacional',
  2: 'Coordinador Regional',
  3: 'Coordinador Provincial',
  4: 'Coordinador Municipal',
  5: 'Líder de Sector',
  6: 'Afiliado Base',
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#6366f1',
  2: '#8b5cf6',
  3: '#3b82f6',
  4: '#10b981',
  5: '#f59e0b',
  6: '#64748b',
};

const AffiliateSchema = z.object({
  full_name:   z.string().min(2).max(150),
  cedula:      z.string().regex(/^\d{3}-\d{7}-\d{1}$/, 'Formato: 000-0000000-0'),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().min(10).optional().or(z.literal('')),
  level:       z.coerce.number().int().min(1).max(6),
  region_id:   z.string().uuid().optional().or(z.literal('')),
  parent_user_id: z.string().uuid().optional().or(z.literal('')),
});

type AffiliateFormValues = z.infer<typeof AffiliateSchema>;


export default function OrgPyramid() {
  const { user, userLevel }             = useAuthStore();
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [loading, setLoading]           = useState(true);
  const [stats, setStats]               = useState<Record<number, number>>({});

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AffiliateFormValues>({
    resolver: zodResolver(AffiliateSchema),
    defaultValues: { level: ((userLevel ?? 1) + 1) as number },
  });

  useEffect(() => {
    supabase
      .from('affiliations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAffiliations((data ?? []) as Affiliation[]);
        // Build stats per level
        const s: Record<number, number> = {};
        for (const a of (data ?? []) as Affiliation[]) {
          s[a.level] = (s[a.level] ?? 0) + 1;
        }
        setStats(s);
        setLoading(false);
      });
  }, []);

  async function onSubmit(values: AffiliateFormValues) {
    const payload = {
      ...values,
      parent_user_id: values.parent_user_id || user?.id || null,
      region_id:      values.region_id || null,
      user_id:        null,  // will be linked when user creates account
      affiliate_code: `AF-${Date.now()}`,
      status:         'active',
    };
    const { data, error } = await supabase.from('affiliations').insert(payload).select().single();
    if (!error && data) {
      setAffiliations(prev => [data as Affiliation, ...prev]);
      setStats(prev => ({ ...prev, [(data as Affiliation).level]: (prev[(data as Affiliation).level] ?? 0) + 1 }));
    }
    setShowForm(false);
    reset();
  }

  // Pyramid summary
  const levels = [1, 2, 3, 4, 5, 6];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pirámide Organizacional</h1>
          <p className="text-slate-500 text-sm mt-1">Estructura de 6 niveles</p>
        </div>
        {(userLevel ?? 0) <= 5 && (
          <button
            onClick={() => { reset(); setShowForm(true); }}
            className="flex items-center gap-2 py-2.5 px-5 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            <UserPlus className="h-4 w-4" />
            Registrar afiliado
          </button>
        )}
      </div>

      {/* Pyramid visualization */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-5">Distribución por nivel</h3>
        <div className="space-y-3">
          {levels.map(lvl => {
            const count = stats[lvl] ?? 0;
            const max   = Math.max(...Object.values(stats), 1);
            const width = count > 0 ? Math.max(8, (count / max) * 100) : 0;
            return (
              <div key={lvl} className="flex items-center gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-medium text-slate-600">
                    Nivel {lvl} · {LEVEL_LABELS[lvl]}
                  </span>
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden relative">
                  <motion.div
                    className="h-7 rounded-full flex items-center px-3"
                    style={{ backgroundColor: LEVEL_COLORS[lvl] }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.8, delay: lvl * 0.08 }}
                  >
                    {count > 0 && (
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        {count}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affiliates table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Afiliados recientes</h3>
          <span className="text-xs text-slate-400">{affiliations.length} total</span>
        </div>
        {loading ? (
          <p className="text-center py-10 text-slate-400 animate-pulse">Cargando…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase text-left">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Nivel</th>
                  <th className="px-6 py-3 font-medium">Cédula</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {affiliations.slice(0, 50).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{a.full_name}</td>
                    <td className="px-6 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: LEVEL_COLORS[a.level] ?? '#64748b' }}
                      >
                        N{a.level} · {LEVEL_LABELS[a.level] ?? `Nivel ${a.level}`}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{a.cedula}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${a.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'}`}>
                        {a.status === 'active' ? 'Activo' : a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('es-DO') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register affiliate modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-12 bottom-12 md:inset-auto md:left-1/2 md:top-1/2
                         md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md
                         bg-white rounded-2xl z-50 overflow-y-auto shadow-2xl p-6"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 className="text-lg font-bold text-slate-900 mb-5">Registrar nuevo afiliado</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                  <input {...register('full_name')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cédula *</label>
                  <input
                    {...register('cedula')}
                    placeholder="000-0000000-0"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono"
                  />
                  {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nivel *</label>
                  <select {...register('level')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm">
                    {levels
                      .filter(l => l > (userLevel ?? 0))
                      .map(l => (
                        <option key={l} value={l}>Nivel {l} · {LEVEL_LABELS[l]}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input {...register('email')} type="email" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input {...register('phone')} type="tel" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border rounded-xl text-slate-600 text-sm">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">
                    Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
