// web/src/pages/admin/InitiativeEditor.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate }           from 'react-router-dom';
import { useForm }                          from 'react-hook-form';
import { zodResolver }                      from '@hookform/resolvers/zod';
import { z }                                from 'zod';
import { supabase }                         from '../../lib/supabase';
import type { Database }                    from '../../types/database';

type Goal       = Database['public']['Tables']['goals']['Row'];
type Milestone  = Database['public']['Tables']['milestones']['Row'];

const InitiativeSchema = z.object({
  title:          z.string().min(3).max(200),
  slug:           z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  type:           z.string().min(1),
  description:    z.string().optional(),
  candidate_name: z.string().optional(),
  active:         z.boolean().optional(),
  published:      z.boolean().optional(),
  brand_color:    z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
  logo_url:       z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof InitiativeSchema>;

type Tab = 'general' | 'blocks' | 'branding' | 'goals';
const TABS: { id: Tab; label: string }[] = [
  { id: 'general',  label: 'General'  },
  { id: 'branding', label: 'Marca'    },
  { id: 'blocks',   label: 'Bloques'  },
  { id: 'goals',    label: 'Objetivos'},
];

export default function InitiativeEditor() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const isNew       = id === 'new';
  const [tab, setTab]               = useState<Tab>('general');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugTaken, setSlugTaken]   = useState(false);
  const [goals, setGoals]           = useState<Partial<Goal>[]>([]);
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>([]);
  const [saving, setSaving]         = useState(false);

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(InitiativeSchema),
    defaultValues: { type: 'petition', active: false, published: false, brand_color: '#6366f1' },
  });

  const slugValue = watch('slug');

  // Load existing
  useEffect(() => {
    if (isNew) return;
    supabase.from('initiatives').select('*').eq('id', id!).single()
      .then(({ data }) => {
        if (data) reset(data as unknown as FormValues);
      });
    supabase.from('goals').select('*').eq('initiative_id', id!)
      .then(({ data }) => setGoals(data ?? []));
    supabase.from('milestones').select('*').eq('initiative_id', id!).order('threshold_value')
      .then(({ data }) => setMilestones(data ?? []));
  }, [id, isNew, reset]);

  // Slug uniqueness debounce
  useEffect(() => {
    if (!slugValue || slugValue.length < 2) return;
    const t = setTimeout(async () => {
      setSlugChecking(true);
      const { data } = await supabase
        .from('initiatives')
        .select('id')
        .eq('slug', slugValue)
        .neq('id', id ?? '')
        .maybeSingle();
      setSlugTaken(!!data);
      setSlugChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [slugValue, id]);

  const onSubmit = useCallback(async (values: FormValues) => {
    if (slugTaken) return;
    setSaving(true);
    try {
      let initiativeId = id;
      if (isNew) {
        const { data, error } = await supabase
          .from('initiatives')
          .insert({ ...values })
          .select('id')
          .single();
        if (error) throw error;
        initiativeId = data.id;
      } else {
        await supabase.from('initiatives').update({ ...values }).eq('id', id!);
      }

      // Upsert goals
      if (goals.length > 0 && initiativeId) {
        const payload = goals.map(g => ({ ...g, initiative_id: initiativeId }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('goals') as any).upsert(payload);
      }
      // Upsert milestones
      if (milestones.length > 0 && initiativeId) {
        const payload = milestones.map(m => ({ ...m, initiative_id: initiativeId }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('milestones') as any).upsert(payload);
      }

      navigate('/admin/initiatives');
    } finally {
      setSaving(false);
    }
  }, [id, isNew, goals, milestones, slugTaken, navigate]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isNew ? 'Nueva iniciativa' : 'Editar iniciativa'}
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {tab === 'general' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input {...register('title')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) *</label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="px-3 text-slate-400 text-sm border-r border-slate-200 bg-slate-50 h-full flex items-center py-3">
                  /
                </span>
                <input {...register('slug')} className="flex-1 px-3 py-3 text-sm outline-none" />
              </div>
              {slugChecking && <p className="text-slate-400 text-xs mt-1">Verificando…</p>}
              {slugTaken    && <p className="text-red-500 text-xs mt-1">Este slug ya está en uso</p>}
              {errors.slug  && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select {...register('type')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm">
                <option value="petition">Petición</option>
                <option value="campaign">Campaña</option>
                <option value="poll">Encuesta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del candidato</label>
              <input {...register('candidate_name')} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input {...register('active')} type="checkbox" className="rounded" />
                Activa
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input {...register('published')} type="checkbox" className="rounded" />
                Publicada
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea {...register('description')} rows={4} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm resize-none" />
            </div>
          </>
        )}

        {tab === 'branding' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color de marca</label>
              <div className="flex items-center gap-3">
                <input
                  {...register('brand_color')}
                  type="color"
                  className="h-10 w-16 border border-slate-300 rounded-lg cursor-pointer p-1"
                />
                <input
                  {...register('brand_color')}
                  type="text"
                  placeholder="#6366f1"
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL del Logo</label>
              <input {...register('logo_url')} type="url" placeholder="https://…" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
            </div>


          </>
        )}

        {tab === 'blocks' && (
          <div className="py-4 text-center text-slate-400">
            <p className="text-sm">Editor de bloques disponible en la próxima versión.</p>
            <p className="text-xs mt-1">Los bloques se configuran automáticamente con la información de la iniciativa.</p>
          </div>
        )}

        {tab === 'goals' && (
          <GoalsEditor
            goals={goals}
            milestones={milestones}
            onChange={setGoals}
            onMilestonesChange={setMilestones}
          />
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/initiatives')}
            className="flex-1 py-3 border border-slate-300 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || slugTaken}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm
                       hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Goals sub-editor ---
interface GoalsEditorProps {
  goals:        Partial<Goal>[];
  milestones:   Partial<Milestone>[];
  onChange:     (g: Partial<Goal>[]) => void;
  onMilestonesChange: (m: Partial<Milestone>[]) => void;
}

function GoalsEditor({ goals, milestones, onChange, onMilestonesChange }: GoalsEditorProps) {
  function addGoal() {
    onChange([...goals, { type: 'signatures', scope: 'national', target_value: 1000 }]);
  }
  function removeGoal(i: number) {
    onChange(goals.filter((_, idx) => idx !== i));
  }
  function updateGoal(i: number, field: string, value: unknown) {
    onChange(goals.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  }

  function addMilestone() {
    onMilestonesChange([...milestones, { label: '', threshold_value: 0 }]);
  }
  function removeMilestone(i: number) {
    onMilestonesChange(milestones.filter((_, idx) => idx !== i));
  }
  function updateMilestone(i: number, field: string, value: unknown) {
    onMilestonesChange(milestones.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Objetivos</h3>
          <button type="button" onClick={addGoal} className="text-xs text-indigo-600 hover:underline">+ Agregar</button>
        </div>
        {goals.map((g, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 mb-2 space-y-2">
            <div className="flex gap-2">
              <select
                value={g.type ?? 'signatures'}
                onChange={e => updateGoal(i, 'type', e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="signatures">Firmas</option>
                <option value="donations">Donaciones</option>
                <option value="volunteers">Voluntarios</option>
              </select>
              <input
                value={g.target_value ?? ''}
                type="number"
                onChange={e => updateGoal(i, 'target_value', Number(e.target.value))}
                placeholder="Valor meta"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeGoal(i)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Hitos</h3>
          <button type="button" onClick={addMilestone} className="text-xs text-indigo-600 hover:underline">+ Agregar</button>
        </div>
        {milestones.map((m, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 mb-2 space-y-2">
            <div className="flex gap-2">
              <input
                value={m.label ?? ''}
                onChange={e => updateMilestone(i, 'label', e.target.value)}
                placeholder="Etiqueta del hito"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={m.threshold_value ?? ''}
                type="number"
                onChange={e => updateMilestone(i, 'threshold_value', Number(e.target.value))}
                placeholder="Firmas necesarias"
                className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
            </div>
            <input
              value={m.badge ?? ''}
              onChange={e => updateMilestone(i, 'badge', e.target.value)}
              placeholder="Badge / trofeo (opcional)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
