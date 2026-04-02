interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface HeatmapLayerProps {
  points: HeatmapPoint[];
}

// Placeholder component — integrates with Leaflet.heat plugin in production
export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  // In a real implementation, this would use leaflet.heat or similar
  // to render heatmap tiles onto the Leaflet map
  return (
    <div className="hidden" aria-hidden="true" data-heatmap-points={points.length} />
  );
}
