// web/src/pages/PresentMode.tsx  — POLIINTEL-06
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams }    from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2 }  from 'lucide-react';
import { supabase, subscribeToInitiativeCount } from '../lib/supabase';
import type { Database } from '../types/database';

type Initiative  = Database['public']['Tables']['initiatives']['Row'];
type Candidate   = Database['public']['Tables']['candidates']['Row'];
type Milestone   = Database['public']['Tables']['milestones']['Row'];

const SLIDE_DURATION = 8000;

type Slide = 'counter' | 'bar_chart' | 'donut_chart' | 'milestone' | 'kpi_strip';

const SLIDES: Slide[] = ['counter', 'bar_chart', 'donut_chart', 'milestone', 'kpi_strip'];

export default function PresentMode() {
  const { slug }  = useParams<{ slug: string }>();

  const [initiative, setInitiative]   = useState<Initiative | null>(null);
  const [candidates, setCandidates]   = useState<Candidate[]>([]);
  const [milestones, setMilestones]   = useState<Milestone[]>([]);
  const [count, setCount]             = useState(0);
  const [today, setToday]             = useState(0);
  const [hourly, setHourly]           = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused]           = useState(false);
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load initiative
  useEffect(() => {
    if (!slug) return;
    supabase
      .from('initiatives')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) setInitiative(data as Initiative);
      });
  }, [slug]);

  // Load candidates + milestones once initiative loaded
  useEffect(() => {
    if (!initiative) return;
    supabase
      .from('candidates')
      .select('*')
      .eq('initiative_id', initiative.id)
      .order('order')
      .then(({ data }) => setCandidates((data ?? []) as Candidate[]));

    supabase
      .from('milestones')
      .select('*')
      .eq('initiative_id', initiative.id)
      .order('threshold_value')
      .then(({ data }) => setMilestones((data ?? []) as Milestone[]));
  }, [initiative]);

  // Realtime count
  useEffect(() => {
    if (!initiative) return;
    supabase
      .from('mv_initiative_counts')
      .select('total_signatures, today_signatures, avg_per_hour')
      .eq('initiative_id', initiative.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCount(data.total_signatures ?? 0);
          setToday(data.today_signatures ?? 0);
          setHourly(data.avg_per_hour    ?? 0);
        }
      });

    const refetch = () => {
      supabase
        .from('mv_initiative_counts')
        .select('total_signatures, today_signatures, avg_per_hour')
        .eq('initiative_id', initiative.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setCount(data.total_signatures ?? 0);
            setToday(data.today_signatures ?? 0);
            setHourly(data.avg_per_hour    ?? 0);
          }
        });
    };
    const unsub = subscribeToInitiativeCount(initiative.id, refetch);
    return () => { unsub(); };
  }, [initiative]);

  // Auto-fullscreen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide(s => (s + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setCurrentSlide(s => (s + 1) % SLIDES.length);
      if (e.key === 'ArrowLeft')  setCurrentSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
      if (e.key === ' ')          setPaused(v => !v);
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const advance = useCallback((dir: 1 | -1) => {
    setCurrentSlide(s => (s + dir + SLIDES.length) % SLIDES.length);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  if (!initiative) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xl animate-pulse">Cargando…</span>
      </div>
    );
  }

  const color  = initiative.brand_color ?? '#6366f1';
  const goal   = 10000;
  const pct    = Math.min(100, (count / goal) * 100);

  // Candidate chart data
  const barData = candidates.map(c => ({
    name:  c.name,
    score: c.order ?? 0,
    fill:  c.color ?? color,
  }));

  const donutData = candidates.map(c => ({
    name:  c.name,
    value: c.order ?? 1,
    fill:  c.color ?? color,
  }));

  const currentMilestone = milestones.find(m => count < m.threshold_value);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col select-none"
      style={{ background: `linear-gradient(135deg, ${color}22 0%, #0f172a 60%)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-10 pt-6 pb-2">
        <div>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            POLIINTEL Live
          </p>
          <h1 className="text-2xl font-extrabold text-white leading-tight mt-0.5">
            {initiative.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-3xl font-black tabular-nums"
            style={{ color }}
          >
            {count.toLocaleString('es-DO')}
          </span>
          <span className="text-white/50 text-sm">firmas</span>
          <button
            onClick={() => setPaused(v => !v)}
            className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-10 h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center px-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={SLIDES[currentSlide]}
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {SLIDES[currentSlide] === 'counter' && (
              <div className="text-center">
                <p className="text-white/60 mb-4 text-lg">Total de firmas</p>
                <p className="text-[8rem] font-black leading-none tabular-nums"
                   style={{ color }}>
                  {count.toLocaleString('es-DO')}
                </p>
                <div className="flex justify-center gap-12 mt-8 text-white/60 text-sm">
                  <div><span className="text-white font-bold text-lg">+{today.toLocaleString('es-DO')}</span><br/>Hoy</div>
                  <div><span className="text-white font-bold text-lg">{pct.toFixed(1)}%</span><br/>del objetivo</div>
                  <div><span className="text-white font-bold text-lg">{hourly.toFixed(1)}/h</span><br/>Ritmo</div>
                </div>
              </div>
            )}

            {SLIDES[currentSlide] === 'bar_chart' && barData.length > 0 && (
              <div>
                <p className="text-white/60 mb-6 text-center">Adhesión por candidato</p>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={barData} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{ fill: '#ffffff80', fontSize: 13 }} />
                    <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {SLIDES[currentSlide] === 'donut_chart' && donutData.length > 0 && (
              <div>
                <p className="text-white/60 mb-4 text-center">Distribución de apoyo</p>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={3}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(v) => (
                        <span style={{ color: '#ffffffcc', fontSize: 13 }}>{v}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {SLIDES[currentSlide] === 'milestone' && currentMilestone && (
              <div className="text-center">
                <p className="text-white/60 mb-2">Próximo hito</p>
                <p className="text-4xl font-extrabold text-white mb-4">
                  {currentMilestone.label}
                </p>
                <p className="text-white/40 text-lg mb-6">
                  Objetivo: {currentMilestone.threshold_value.toLocaleString('es-DO')} firmas
                </p>
                <div className="max-w-lg mx-auto bg-white/10 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-4 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${Math.min(100, (count / currentMilestone.threshold_value) * 100).toFixed(1)}%`,
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-white/40 text-sm mt-3">
                  {(currentMilestone.threshold_value - count).toLocaleString('es-DO')} restantes
                </p>
                {currentMilestone.badge && (
                  <p className="mt-6 text-amber-400 font-semibold text-lg">
                    🏆 {currentMilestone.badge}
                  </p>
                )}
              </div>
            )}

            {SLIDES[currentSlide] === 'kpi_strip' && (
              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: 'Total firmas', value: count.toLocaleString('es-DO'), suffix: '' },
                  { label: 'Hoy',          value: `+${today.toLocaleString('es-DO')}`, suffix: '' },
                  { label: 'Por hora',     value: hourly.toFixed(1), suffix: '/h' },
                ].map(k => (
                  <div key={k.label} className="bg-white/5 rounded-3xl p-8 text-center backdrop-blur-sm">
                    <p className="text-5xl font-black text-white mb-2">{k.value}{k.suffix}</p>
                    <p className="text-white/50 text-sm">{k.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide dots + nav */}
      <div className="flex items-center justify-center gap-3 py-5">
        <button onClick={() => advance(-1)} className="text-white/40 hover:text-white px-2 text-xl">‹</button>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6' : 'w-2 bg-white/20'}`}
            style={i === currentSlide ? { backgroundColor: color, width: '24px' } : {}}
          />
        ))}
        <button onClick={() => advance(1)} className="text-white/40 hover:text-white px-2 text-xl">›</button>
      </div>
    </div>
  );
}
