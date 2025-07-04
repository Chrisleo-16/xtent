
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Loader2, AlertTriangle } from 'lucide-react';

interface MapContainerProps {
  isLoaded: boolean;
  loadError: boolean;
  latitude?: number;
  longitude?: number;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
  onMarkerDragEnd: (event: google.maps.MapMouseEvent) => void;
  mapError: string;
}

const MapContainer = ({
  isLoaded,
  loadError,
  latitude,
  longitude,
  onMapClick,
  onMarkerDragEnd,
  mapError
}: MapContainerProps) => {
  const mapCenter = latitude && longitude 
    ? { lat: latitude, lng: longitude }
    : { lat: -1.2921, lng: 36.8219 };

  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  if (loadError) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-red-500">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Error loading Google Maps</p>
          <p className="text-sm text-gray-600">Please check your internet connection and API key configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-80 w-full rounded-lg border-2 transition-colors ${
      mapError ? 'border-red-500' : 'border-gray-300'
    }`}>
      {!isLoaded ? (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
          center={mapCenter}
          zoom={latitude && longitude ? 15 : 12}
          options={mapOptions}
          onClick={onMapClick}
        >
          {latitude && longitude && (
            <Marker
              position={{ lat: latitude, lng: longitude }}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default MapContainer;
