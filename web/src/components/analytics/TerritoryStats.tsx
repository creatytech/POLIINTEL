import { Card } from '../ui/Card';

interface TerritoryStatsProps {
  territoryName: string;
  totalResponses: number;
  validResponses: number;
  completionRate?: number;
  avgQualityScore?: number;
  topCandidate?: { candidate_id: string; percentage: number; trend?: string };
}

export default function TerritoryStats({
  territoryName,
  totalResponses,
  validResponses,
  completionRate,
  avgQualityScore,
  topCandidate,
}: TerritoryStatsProps) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-4">{territoryName}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-blue-600">{totalResponses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total respuestas</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{validResponses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Respuestas válidas</p>
        </div>
        {completionRate !== undefined && (
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {(completionRate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Tasa completitud</p>
          </div>
        )}
        {avgQualityScore !== undefined && (
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {(avgQualityScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">Calidad promedio</p>
          </div>
        )}
      </div>
      {topCandidate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Candidato líder</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{topCandidate.candidate_id}</p>
            <p className="text-sm font-bold text-blue-600">
              {topCandidate.percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
