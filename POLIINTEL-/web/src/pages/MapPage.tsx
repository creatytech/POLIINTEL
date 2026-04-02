import { useState } from 'react';
import TerritorialMap, { type TerritoryLayer } from '../components/map/TerritorialMap';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';

const LAYER_LABELS: Record<TerritoryLayer, string> = {
  regiones:             'Regiones',
  provincias:           'Provincias',
  municipios:           'Municipios',
  distritos_municipales:'Distritos Municipales',
  secciones:            'Secciones',
  barrios_parajes:      'Barrios / Parajes',
};

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState<TerritoryLayer | null>('provincias');
  const [selected, setSelected] = useState<{ nombre: string; codigo: string } | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mapa Electoral</h1>
      <Card padding="none">
        <CardHeader className="px-5 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Mapa Territorial — República Dominicana</CardTitle>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveLayer(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeLayer === null
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sin capa
              </button>
              {(Object.keys(LAYER_LABELS) as TerritoryLayer[]).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    activeLayer === layer
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {LAYER_LABELS[layer]}
                </button>
              ))}
            </div>
          </div>
          {selected && (
            <p className="mt-2 text-sm text-blue-700 font-medium">
              Seleccionado: {selected.nombre} <span className="text-gray-400">({selected.codigo})</span>
            </p>
          )}
        </CardHeader>
        <TerritorialMap
          center={[18.7357, -70.1627]}
          zoom={8}
          className="h-[600px] w-full rounded-b-xl"
          activeLayer={activeLayer}
          onFeatureClick={setSelected}
        />
      </Card>
    </div>
  );
}

