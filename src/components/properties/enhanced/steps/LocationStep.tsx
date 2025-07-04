
import { UseFormReturn } from 'react-hook-form';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { AlertTriangle } from 'lucide-react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

import AddressSearch from './location/AddressSearch';
import MapContainer from './location/MapContainer';
import LocationInstructions from './location/LocationInstructions';

interface LocationStepProps {
  form: UseFormReturn<any>;
}

const libraries: ("places")[] = ["places"];

const LocationStep = ({ form }: LocationStepProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries,
  });

  const latitude = form.watch('latitude');
  const longitude = form.watch('longitude');
  const address = form.watch('address');

  useEffect(() => {
    if (!latitude || !longitude) {
      setMapError('Please select a location on the map');
    } else {
      setMapError('');
    }
  }, [latitude, longitude]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!window.google) return;
    
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      });
      
      if (response.results[0]) {
        form.setValue('address', response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  }, [form]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);
        setMapError('');
        reverseGeocode(latitude, longitude);
        setIsSearching(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location.');
        setIsSearching(false);
      }
    );
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      form.setValue('latitude', lat);
      form.setValue('longitude', lng);
      setMapError('');
      reverseGeocode(lat, lng);
    }
  }, [form, reverseGeocode]);

  const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      form.setValue('latitude', lat);
      form.setValue('longitude', lng);
      reverseGeocode(lat, lng);
    }
  }, [form, reverseGeocode]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
        form.setValue('address', place.formatted_address || '');
        setMapError('');
      }
    }
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">Error loading Google Maps</p>
            <p className="text-sm text-gray-600">Please check your internet connection and API key configuration.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Property Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddressSearch
            isLoaded={isLoaded}
            isSearching={isSearching}
            onPlaceChanged={onPlaceChanged}
            onCurrentLocation={getCurrentLocation}
            autocompleteRef={autocompleteRef}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full property address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Click on map to set location *</label>
            <MapContainer
              isLoaded={isLoaded}
              loadError={!!loadError}
              latitude={latitude}
              longitude={longitude}
              onMapClick={handleMapClick}
              onMarkerDragEnd={handleMarkerDragEnd}
              mapError={mapError}
            />
            {mapError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {mapError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Latitude</label>
              <Input
                value={latitude?.toFixed(6) || ''}
                readOnly
                placeholder="Select location"
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Longitude</label>
              <Input
                value={longitude?.toFixed(6) || ''}
                readOnly
                placeholder="Select location"
                className="bg-gray-50"
              />
            </div>
          </div>

          <LocationInstructions />
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationStep;
