// web/src/components/landing/SupportersWall.tsx
import { useEffect, useState } from 'react';
import { motion }              from 'framer-motion';
import { supabase }            from '../../lib/supabase';

interface Props {
  initiativeId: string;
  color?:       string;
}

interface Supporter { id: string; full_name: string; created_at: string }

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');
}

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function SupportersWall({ initiativeId, color }: Props) {
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    supabase
      .from('signatories')
      .select('id, full_name, created_at')
      .eq('initiative_id', initiativeId)
      .order('created_at', { ascending: false })
      .limit(48)
      .then(({ data }) => setSupporters((data ?? []) as Supporter[]));

    const channel = supabase
      .channel(`supporters-${initiativeId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'signatories',
        filter: `initiative_id=eq.${initiativeId}`,
      }, (payload) => {
        const s = payload.new as Supporter;
        setSupporters(prev => [s, ...prev].slice(0, 48));
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [initiativeId]);

  if (!supporters.length) return null;

  return (
    <section className="py-14 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
          Quienes ya firmaron
        </h3>
        <p className="text-slate-400 text-sm text-center mb-8">
          Últimos {supporters.length} firmantes
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {supporters.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              title={s.full_name.split(' ')[0]}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center
                           text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: avatarColor(s.full_name) }}
              >
                {initials(s.full_name)}
              </div>
              <span className="text-[10px] text-slate-500 max-w-[44px] truncate text-center">
                {s.full_name.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>
        {color && (
          <div className="text-center mt-8">
            <a
              href="#firmar"
              className="inline-block py-3 px-8 rounded-full text-white font-semibold text-sm
                         hover:opacity-90 transition-opacity"
              style={{ backgroundColor: color }}
            >
              Únete a ellos →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
