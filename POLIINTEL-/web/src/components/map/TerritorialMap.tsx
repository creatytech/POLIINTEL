import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from 'leaflet';

/** Tabla Supabase → zoom mínimo para cargar esa capa */
const LAYER_CONFIG: Record<string, { table: string; minZoom: number; color: string }> = {
  regiones:             { table: 'regiones',             minZoom: 6,  color: '#3b82f6' },
  provincias:           { table: 'provincias',            minZoom: 7,  color: '#8b5cf6' },
  municipios:           { table: 'municipios',            minZoom: 8,  color: '#10b981' },
  distritos_municipales:{ table: 'distritos_municipales', minZoom: 9,  color: '#f59e0b' },
  secciones:            { table: 'secciones',             minZoom: 10, color: '#ef4444' },
  barrios_parajes:      { table: 'barrios_parajes',       minZoom: 11, color: '#ec4899' },
};

export type TerritoryLayer = keyof typeof LAYER_CONFIG;

interface TerritorialMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  activeLayer?: TerritoryLayer | null;
  onFeatureClick?: (feature: { nombre: string; codigo: string }) => void;
}

async function fetchGeoJSON(table: string): Promise<GeoJSON.FeatureCollection | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const url = `${supabaseUrl}/rest/v1/${table}?select=nombre,codigo,geom&limit=15000`;
  const res = await fetch(url, {
    headers: {
      'apikey':        supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Accept':        'application/geo+json',
    },
  });
  if (!res.ok) return null;
  return res.json() as Promise<GeoJSON.FeatureCollection>;
}

export default function TerritorialMap({
  center = [18.7357, -70.1627],
  zoom = 8,
  className = 'h-96',
  activeLayer,
  onFeatureClick,
}: TerritorialMapProps) {
  const mapRef       = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonRef   = useRef<LeafletGeoJSON | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialise map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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

  // Load & display GeoJSON layer when activeLayer changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous layer
    if (geoJsonRef.current) {
      geoJsonRef.current.remove();
      geoJsonRef.current = null;
    }
    if (!activeLayer) return;

    const cfg = LAYER_CONFIG[activeLayer];
    setLoading(true);

    import('leaflet').then(async (L) => {
      const data = await fetchGeoJSON(cfg.table);
      setLoading(false);
      if (!data || !mapRef.current) return;

      geoJsonRef.current = L.geoJSON(data, {
        style: {
          color:       cfg.color,
          weight:      1.5,
          opacity:     0.8,
          fillOpacity: 0.15,
        },
        onEachFeature(feature, layer) {
          const { nombre, codigo } = feature.properties ?? {};
          if (nombre) {
            layer.bindTooltip(`${nombre} (${codigo})`, { sticky: true });
          }
          layer.on('click', () => {
            if (onFeatureClick && nombre) onFeatureClick({ nombre, codigo });
          });
        },
      }).addTo(mapRef.current);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayer]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-2 right-2 z-[500] bg-white rounded shadow px-2 py-1 text-xs text-gray-500">
          Cargando capa…
        </div>
      )}
      <div ref={containerRef} className={className} />
    </div>
  );
}

