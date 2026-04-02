// web/src/components/landing/MilestoneTracker.tsx
import { motion }             from 'framer-motion';
import { CheckCircle, Trophy, Circle } from 'lucide-react';
import type { Database }      from '../../types/database';

type Milestone = Database['public']['Tables']['milestones']['Row'];

interface Props {
  milestones:  Milestone[];
  currentCount: number;
  color?:       string;
}

export function MilestoneTracker({ milestones, currentCount, color = '#6366f1' }: Props) {
  if (!milestones?.length) return null;

  const sorted = [...milestones].sort((a, b) => a.threshold_value - b.threshold_value);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-10 text-center">
          Hitos de la iniciativa
        </h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-8 pl-14">
            {sorted.map((m, i) => {
              const reached  = currentCount >= m.threshold_value;
              const isCurr   = !reached && (i === 0 || currentCount >= sorted[i - 1].threshold_value);
              const progress = isCurr
                ? Math.min(100, ((currentCount - (sorted[i - 1]?.threshold_value ?? 0)) /
                    (m.threshold_value - (sorted[i - 1]?.threshold_value ?? 0))) * 100)
                : 0;

              return (
                <div key={m.id} className="relative">
                  {/* Icon dot */}
                  <div
                    className={`absolute -left-8 flex items-center justify-center h-8 w-8 rounded-full
                      ${reached ? 'text-emerald-500' : isCurr ? 'text-white ring-4 ring-indigo-200' : 'text-slate-300'}`}
                    style={isCurr ? { backgroundColor: color } : {}}
                  >
                    {reached ? (
                      m.badge ? <Trophy className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <p className={`font-semibold text-sm
                      ${reached ? 'text-emerald-700' : isCurr ? 'text-slate-900' : 'text-slate-400'}`}>
                      {m.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${reached ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {m.threshold_value.toLocaleString('es-DO')} firmas
                    </p>

                    {m.badge && (
                      <p className="text-xs mt-1 text-amber-600 font-medium">
                        🏆 {m.badge}
                      </p>
                    )}

                    {isCurr && (
                      <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden w-40">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
