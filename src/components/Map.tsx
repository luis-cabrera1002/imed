import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

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

interface MapProps {
  locations: MapLocation[];
  selectedLocationId?: string;
  onSelectLocation?: (locationId: string, type: LocationType) => void;
  showLegend?: boolean;
}

// Helper to calculate map center and zoom
const calculateMapView = (
  locations: MapLocation[],
  selectedLocationId?: string
): { center: [number, number]; zoom: number } => {
  if (selectedLocationId) {
    const selected = locations.find(loc => loc.id === selectedLocationId);
    if (selected) {
      return {
        center: [selected.coordinates.lat, selected.coordinates.lng],
        zoom: 15
      };
    }
  }
  
  if (locations.length === 0) {
    return { center: [14.6349, -90.5069], zoom: 13 };
  }
  
  // Calculate bounds and center
  const lats = locations.map(loc => loc.coordinates.lat);
  const lngs = locations.map(loc => loc.coordinates.lng);
  const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
  const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
  
  return { center: [centerLat, centerLng], zoom: 12 };
};

// Custom marker icons
const createCustomIcon = (type: LocationType, emergency?: boolean) => {
  let color = '#0A86F2';
  let symbol = '●';
  let bgColor = '#DBEAFE';
  
  switch (type) {
    case 'hospital':
      color = emergency ? '#DC2626' : '#EF4444';
      symbol = 'H';
      bgColor = '#FEE2E2';
      break;
    case 'pharmacy':
      color = '#10B981';
      symbol = '+';
      bgColor = '#D1FAE5';
      break;
    case 'insurance':
      color = '#F59E0B';
      symbol = '$';
      bgColor = '#FEF3C7';
      break;
    case 'clinic':
    default:
      color = '#0A86F2';
      symbol = '●';
      bgColor = '#DBEAFE';
      break;
  }

  const iconHtml = `
    <div style="
      background: ${color};
      width: 44px;
      height: 44px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
    " class="marker-icon">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 20px;
        text-align: center;
      ">${symbol}</div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
};

const Map = ({ locations, selectedLocationId, onSelectLocation, showLegend = false }: MapProps) => {
  const navigate = useNavigate();
  
  const getTypeLabel = (type: LocationType): string => {
    switch (type) {
      case 'hospital':
        return 'Hospital';
      case 'clinic':
        return 'Clínica';
      case 'pharmacy':
        return 'Farmacia';
      case 'insurance':
        return 'Agencia de Seguros';
      default:
        return '';
    }
  };

  const handleViewDetails = (location: MapLocation, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    switch (location.type) {
      case 'clinic':
      case 'hospital':
        navigate(`/clinicas/${location.id}`);
        break;
      case 'pharmacy':
        navigate('/medicinas');
        break;
      case 'insurance':
        // Could navigate to an insurance page if it exists
        break;
    }
  };

  const mapView = useMemo(
    () => calculateMapView(locations, selectedLocationId),
    [locations, selectedLocationId]
  );

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg border-2 border-border">
      <MapContainer
        key={`${mapView.center[0]}-${mapView.center[1]}-${mapView.zoom}`}
        center={mapView.center}
        zoom={mapView.zoom}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        className="z-0"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={createCustomIcon(location.type, location.emergency)}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-3 min-w-[220px]">
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                    style={{
                      backgroundColor: location.type === 'hospital' ? '#FEE2E2' : 
                                     location.type === 'pharmacy' ? '#D1FAE5' : 
                                     location.type === 'insurance' ? '#FEF3C7' : '#DBEAFE',
                      color: location.type === 'hospital' ? '#991B1B' : 
                             location.type === 'pharmacy' ? '#065F46' : 
                             location.type === 'insurance' ? '#92400E' : '#1E40AF'
                    }}
                  >
                    {getTypeLabel(location.type)}
                  </span>
                  {location.emergency && (
                    <span className="text-xs font-bold text-red-600 animate-pulse">🚨 EMERGENCIAS 24/7</span>
                  )}
                </div>
                <h3 className="font-bold text-base mb-2 text-gray-900">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-3 flex items-start gap-1">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span>{location.address}</span>
                </p>
                {(location.type === 'clinic' || location.type === 'hospital') && (
                  <button 
                    className="w-full mt-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium shadow-sm"
                    onClick={(e) => handleViewDetails(location, e)}
                  >
                    Ver detalles completos →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-card rounded-lg shadow-2xl p-4 space-y-2 z-[1000] border-2 border-border">
          <h4 className="font-semibold text-sm mb-3 text-foreground">Tipos de Ubicaciones</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">H</div>
              <span className="text-foreground font-medium">Hospitales</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">●</div>
              <span className="text-foreground font-medium">Clínicas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-white">+</div>
              <span className="text-foreground font-medium">Farmacias</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">$</div>
              <span className="text-foreground font-medium">Seguros</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
