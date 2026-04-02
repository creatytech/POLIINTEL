import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Prediction {
  prediction_type: string;
  prediction: {
    winner?: string;
    probability?: number;
    confidence_interval?: [number, number];
    trend?: 'up' | 'down' | 'stable';
  };
  confidence?: number;
  model_name?: string;
  created_at: string;
}

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const trendIcon = {
    up: '↑',
    down: '↓',
    stable: '→',
  }[prediction.prediction.trend ?? 'stable'];

  const trendVariant = {
    up: 'success' as const,
    down: 'danger' as const,
    stable: 'default' as const,
  }[prediction.prediction.trend ?? 'stable'];

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {prediction.prediction_type.replace(/_/g, ' ')}
          </p>
          {prediction.prediction.winner && (
            <p className="text-lg font-bold text-gray-900 mt-1">
              {prediction.prediction.winner}
            </p>
          )}
        </div>
        <Badge variant={trendVariant}>
          {trendIcon} {prediction.prediction.trend ?? 'stable'}
        </Badge>
      </div>
      {prediction.prediction.probability !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Probabilidad</span>
            <span className="font-semibold">
              {(prediction.prediction.probability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${prediction.prediction.probability * 100}%` }}
            />
          </div>
        </div>
      )}
      {prediction.confidence !== undefined && (
        <p className="text-xs text-gray-500">
          Confianza: {(prediction.confidence * 100).toFixed(0)}% · {prediction.model_name}
        </p>
      )}
    </Card>
  );
}
