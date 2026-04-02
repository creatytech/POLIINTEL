import TerritorialMap from '../components/map/TerritorialMap';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';

export default function MapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mapa Electoral</h1>
      <Card padding="none">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Mapa Territorial — República Dominicana</CardTitle>
        </CardHeader>
        <TerritorialMap
          center={[18.7357, -70.1627]}
          zoom={8}
          className="h-[600px] w-full rounded-b-xl"
        />
      </Card>
    </div>
  );
}
