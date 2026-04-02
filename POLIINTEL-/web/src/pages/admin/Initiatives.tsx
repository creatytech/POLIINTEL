// web/src/pages/admin/Initiatives.tsx
import { useEffect, useState } from 'react';
import { Link }                from 'react-router-dom';
import { Plus, Edit2, Copy, Eye, Trash2 } from 'lucide-react';
import { supabase }            from '../../lib/supabase';
import type { Database }       from '../../types/database';

type Initiative = Database['public']['Tables']['initiatives']['Row'];

function getStatus(init: Initiative): string {
  if (!init.active) return 'archived';
  if (init.published) return 'active';
  return 'draft';
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-slate-100 text-slate-600',
  active:   'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS: Record<string, string> = {
  draft:    'Borrador',
  active:   'Activa',
  archived: 'Archivada',
};

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    supabase
      .from('initiatives')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInitiatives((data ?? []) as Initiative[]);
        setLoading(false);
      });
  }, []);

  async function duplicate(init: Initiative) {
    const { data } = await supabase
      .from('initiatives')
      .insert({
        ...init,
        id:         undefined,
        slug:       `${init.slug}-copia-${Date.now()}`,
        active:     false,
        published:  false,
        created_at: undefined,
        updated_at: undefined,
      })
      .select('id')
      .single();
    if (data) {
      window.location.href = `/admin/initiatives/${data.id}/edit`;
    }
  }

  async function archive(id: string) {
    if (!confirm('¿Archivar esta iniciativa?')) return;
    await supabase.from('initiatives').update({ active: false }).eq('id', id);
    setInitiatives(prev => prev.map(i => i.id === id ? { ...i, active: false } : i));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-slate-400 animate-pulse">Cargando…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciativas</h1>
          <p className="text-slate-500 text-sm mt-1">{initiatives.length} iniciativas</p>
        </div>
        <Link
          to="/admin/initiatives/new"
          className="flex items-center gap-2 py-2.5 px-5 bg-indigo-600 text-white
                     rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva iniciativa
        </Link>
      </div>

      {initiatives.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileIcon />
          <p className="mt-4 font-medium">No hay iniciativas aún</p>
          <p className="text-sm mt-1">Crea tu primera iniciativa con el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initiatives.map(init => (
            <div
              key={init.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
            >
              {/* Color dot */}
              <div
                className="h-10 w-10 rounded-xl shrink-0"
                style={{ backgroundColor: init.brand_color ?? '#6366f1' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {init.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${STATUS_STYLES[getStatus(init)] ?? STATUS_STYLES['draft']}`}
                  >
                    {STATUS_LABELS[getStatus(init)] ?? getStatus(init)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">/{init.slug}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/${init.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600
                             hover:bg-indigo-50 transition-colors"
                  title="Ver pública"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <Link
                  to={`/admin/initiatives/${init.id}/edit`}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600
                             hover:bg-indigo-50 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => duplicate(init)}
                  className="p-2 rounded-lg text-slate-400 hover:text-amber-600
                             hover:bg-amber-50 transition-colors"
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {init.active !== false && (
                  <button
                    onClick={() => archive(init.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600
                               hover:bg-red-50 transition-colors"
                    title="Archivar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg className="h-12 w-12 mx-auto text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414
           a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
