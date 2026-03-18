import mapDemoImage from "@/assets/map-demo.jpg";

export type LocationType = 'clinic' | 'pharmacy' | 'insurance' | 'hospital';

export interface MapLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: LocationType;
  emergency?: boolean;
}

interface MapDemoProps {
  locations: MapLocation[];
  selectedLocationId?: string;
  onSelectLocation?: (locationId: string) => void;
  showLegend?: boolean;
}

const MapDemo = ({ showLegend = false }: MapDemoProps) => {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      <img 
        src={mapDemoImage} 
        alt="Mapa de ubicaciones" 
        className="w-full h-full object-cover"
      />
      
      {showLegend && (
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Leyenda</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">Clínicas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Hospitales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Farmacias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">Seguros</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDemo;
