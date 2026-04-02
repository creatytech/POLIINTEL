// web/src/components/landing/KpiStrip.tsx
import { motion }          from 'framer-motion';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface Props {
  total?:       number;
  today?:       number;
  avgPerHour?:  number;
  color?:       string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   (i: number) => ({
    opacity:    1,
    y:          0,
    transition: { delay: i * 0.12, duration: 0.4 },
  }),
};

export function KpiStrip({ total = 0, today = 0, avgPerHour = 0, color = '#6366f1' }: Props) {
  const hourlyRate = avgPerHour;

  const kpis = [
    {
      icon:  <Users  className="h-6 w-6" />,
      label: 'Firmas totales',
      value: total.toLocaleString('es-DO'),
    },
    {
      icon:  <TrendingUp className="h-6 w-6" />,
      label: 'Hoy',
      value: `+${today.toLocaleString('es-DO')}`,
    },
    {
      icon:  <Clock className="h-6 w-6" />,
      label: 'Por hora',
      value: `${hourlyRate.toLocaleString('es-DO', { maximumFractionDigits: 1 })}/h`,
    },
  ];

  return (
    <section className="py-10 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-5 shadow-sm text-center"
          >
            <div
              className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {kpi.icon}
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">
              {kpi.value}
            </p>
            <p className="text-sm text-slate-500">{kpi.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
