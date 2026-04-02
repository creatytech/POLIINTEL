import { useState, useEffect, useCallback } from 'react';
import { lookupTerritory, type TerritoryResult } from '../lib/geo';

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface GeoState {
  position: GeoPosition | null;
  territory: TerritoryResult | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook para obtener la posición GPS del dispositivo.
 * Si `lookupOnPosition` es true, también llama a `find_territory_by_point`
 * para obtener región/provincia/municipio/sección/barrio del punto.
 */
export function useGeoLocation(autoStart = false, lookupOnPosition = false) {
  const [state, setState] = useState<GeoState>({
    position: null,
    territory: null,
    error: null,
    isLoading: false,
  });

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const position: GeoPosition = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setState({ position, territory: null, error: null, isLoading: false });

        if (lookupOnPosition) {
          try {
            const territory = await lookupTerritory(position.lat, position.lng);
            setState((prev) => ({ ...prev, territory }));
          } catch {
            // territory lookup is best-effort; do not override position
          }
        }
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          error: err.message,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [lookupOnPosition]);

  useEffect(() => {
    if (autoStart) {
      getPosition();
    }
  }, [autoStart, getPosition]);

  return { ...state, getPosition };
}

