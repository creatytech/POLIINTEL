// web/src/components/landing/HeroBlock.tsx
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Database } from '../../types/database';

type Initiative = Database['public']['Tables']['initiatives']['Row'];

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initiative: Initiative & { goals?: any[] };
  liveCount:  number;
  pct:        number;
  config?:    Record<string, unknown>;
}

export function HeroBlock({ initiative, liveCount, pct }: Props) {
  const { t }      = useTranslation();
  const goal        = initiative.goals?.[0]?.target_value ?? 0;
  const brandColor  = initiative.brand_color ?? '#6366f1';

  const springCount = useSpring(0, { stiffness: 60, damping: 20 });
  const displayCount = useTransform(springCount, v => Math.round(v).toLocaleString('es-DO'));

  useEffect(() => {
    springCount.set(liveCount);
  }, [liveCount, springCount]);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center
                 bg-slate-950 text-white overflow-hidden px-4 py-20"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(ellipse at center, ${brandColor} 0%, transparent 70%)`,
        }}
      />

      {initiative.logo_url && (
        <motion.img
          src={initiative.logo_url}
          alt={initiative.title}
          className="h-16 w-auto mb-8 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.h1
        className="text-4xl md:text-6xl font-black text-center max-w-4xl relative z-10 leading-tight mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        {initiative.title}
      </motion.h1>

      {initiative.description && (
        <motion.p
          className="text-lg text-slate-400 text-center max-w-2xl relative z-10 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {initiative.description}
        </motion.p>
      )}

      <motion.div
        className="relative z-10 my-8 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <motion.span
          className="text-7xl md:text-9xl font-black tabular-nums"
          style={{ color: brandColor }}
        >
          {displayCount}
        </motion.span>
        <p className="text-xl text-slate-400 mt-2">
          {t('landing.counter', { count: liveCount })}
          {goal > 0 && (
            <span className="ml-2 text-slate-500">
              {t('landing.goalOf', { target: goal })}
            </span>
          )}
        </p>
      </motion.div>

      {goal > 0 && (
        <div className="relative z-10 w-full max-w-2xl mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{t('landing.progressPct', { pct: pct.toFixed(1) })}</span>
            <span>{goal.toLocaleString('es-DO')}</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: brandColor }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
        </div>
      )}

      <motion.a
        href="#firmar"
        className="relative z-10 px-10 py-4 rounded-full text-lg font-bold
                   text-white shadow-lg transition-transform hover:scale-105
                   active:scale-95 cursor-pointer"
        style={{ backgroundColor: brandColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {t('landing.signBtn')}
      </motion.a>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-slate-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
