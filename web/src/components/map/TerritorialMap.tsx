import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface TerritorialMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function TerritorialMap({
  center = [18.7357, -70.1627],
  zoom = 8,
  className = 'h-96',
}: TerritorialMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dependencies (center, zoom) are intentionally excluded: the map is initialized
    // once on mount and Leaflet manages its own state thereafter. Reinitializing on
    // prop changes would destroy and recreate the map, losing user interactions.
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!containerRef.current) return;

      mapRef.current = L.map(containerRef.current, {
        center: L.latLng(center[0], center[1]),
        zoom,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className} />;
}
