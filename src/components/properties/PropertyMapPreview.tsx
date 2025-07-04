
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface PropertyMapPreviewProps {
  latitude: number | string;
  longitude: number | string;
  address: string;
}

const PropertyMapPreview = ({ latitude, longitude, address }: PropertyMapPreviewProps) => {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
  // Generate Google Maps static map image URL
  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO5EgBurkT9MQ8`;

  const handleMapClick = () => {
    // Open Google Maps in a new tab
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="relative cursor-pointer group"
          onClick={handleMapClick}
        >
          <img
            src={mapImageUrl}
            alt={`Map location for ${address}`}
            className="w-full h-64 object-cover transition-opacity group-hover:opacity-90"
            onError={(e) => {
              // Fallback to a simple map placeholder
              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="18" fill="%236b7280">Map Preview Unavailable</text></svg>`;
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <MapPin className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <p className="text-white text-sm font-medium">{address}</p>
            <p className="text-white text-xs opacity-75">Click to view in Google Maps</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMapPreview;
