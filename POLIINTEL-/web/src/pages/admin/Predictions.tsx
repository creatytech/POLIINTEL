// web/src/pages/admin/Predictions.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw }           from 'lucide-react';
import { supabase }            from '../../lib/supabase';
import type { Database }       from '../../types/database';

type Prediction  = Database['public']['Tables']['ml_predictions']['Row'];

export default function Predictions() {
  const [predictions, setPredictions]   = useState<Prediction[]>([]);
  const [loading, setLoading]           = useState(false);
  const [rev, setRev]                   = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    supabase
      .from('ml_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setPredictions((data ?? []) as Prediction[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load, rev]);

  // Extract numeric value from prediction JSON
  function extractValue(p: Prediction): number {
    const pred = p.prediction as Record<string, unknown>;
    return typeof pred?.value === 'number' ? pred.value :
           typeof p.confidence === 'number' ? p.confidence * 100 : 0;
  }

  // Bar data grouped by model_name (latest per model)
  const latestPerModel: Record<string, Prediction> = {};
  for (const p of predictions) {
    if (!latestPerModel[p.model_name] ||
        new Date(p.created_at ?? 0) > new Date(latestPerModel[p.model_name].created_at ?? 0)) {
      latestPerModel[p.model_name] = p;
    }
  }
  const barData = Object.values(latestPerModel).map(p => ({
    name:       p.model_name,
    Confianza:  (p.confidence ?? 0) * 100,
    fill:       '#6366f1',
  }));

  // Time series by model_name
  const timeBuckets: Record<string, Record<string, number | string>> = {};
  for (const p of [...predictions].reverse()) {
    const date = (p.created_at ?? '').slice(0, 10);
    if (!date) continue;
    if (!timeBuckets[date]) timeBuckets[date] = { date };
    timeBuckets[date][p.model_name] = extractValue(p);
  }
  const lineData = Object.values(timeBuckets);
  const modelNames = [...new Set(predictions.map(p => p.model_name))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Predicciones ML</h1>
          <p className="text-slate-500 text-sm mt-1">Motor Bayesiano + Monte Carlo</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRev(r => r + 1)}
            className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Actualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-16 animate-pulse">Cargando predicciones…</p>
      ) : (
        <div className="space-y-8">
          {/* Bar chart — latest prediction per model */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Confianza por modelo</h3>
            {barData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No hay predicciones aún.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Confianza']} />
                  <Bar dataKey="Confianza" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Line chart — trend over time */}
          {lineData.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Tendencia histórica</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {modelNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Prediction table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Historial de predicciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase text-left">
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Modelo</th>
                    <th className="px-6 py-3 font-medium">Predicción</th>
                    <th className="px-6 py-3 font-medium">Conf.</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.slice(0, 30).map(p => {
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium">{p.prediction_type}</td>
                        <td className="px-6 py-3 text-slate-500">{p.model_name}</td>
                        <td className="px-6 py-3 font-semibold text-indigo-600">
                          {extractValue(p).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {p.confidence != null ? `${(p.confidence * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td className="px-6 py-3 text-slate-400 text-xs">
                          {p.created_at ? new Date(p.created_at).toLocaleString('es-DO') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
