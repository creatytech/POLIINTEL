export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** Niveles de la jerarquía territorial RD, del más amplio al más fino */
export const TERRITORY_LEVELS = [
  { key: 'nacional',             label: 'Nacional' },
  { key: 'region',               label: 'Región' },
  { key: 'provincia',            label: 'Provincia' },
  { key: 'municipio',            label: 'Municipio' },
  { key: 'distrito_municipal',   label: 'Distrito Municipal' },
  { key: 'seccion',              label: 'Sección' },
  { key: 'barrio',               label: 'Barrio / Paraje' },
] as const;

export type TerritoryLevelKey = (typeof TERRITORY_LEVELS)[number]['key'];

/** Resultado jerárquico completo de un punto geográfico */
export interface TerritoryResult {
  region_id:    string | null;
  provincia_id: string | null;
  municipio_id: string | null;
  distrito_id:  string | null;
  seccion_id:   string | null;
  barrio_id:    string | null;
  recinto_id:   string | null;
}

export async function lookupTerritory(lat: number, lng: number): Promise<TerritoryResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/geo-lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ lat, lng }),
  });

  if (!response.ok) {
    throw new Error(`Geo lookup failed: ${response.statusText}`);
  }

  return response.json() as Promise<TerritoryResult>;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const earthRadiusKm = 6371;
  const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(degreesToRadians(lat));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
