
import { useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface AddressSearchProps {
  isLoaded: boolean;
  isSearching: boolean;
  onPlaceChanged: () => void;
  onCurrentLocation: () => void;
  autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>;
}

const AddressSearch = ({ 
  isLoaded, 
  isSearching, 
  onPlaceChanged, 
  onCurrentLocation, 
  autocompleteRef 
}: AddressSearchProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Search Address</label>
      <div className="flex gap-2">
        {isLoaded ? (
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "ke" },
              fields: ["formatted_address", "geometry"]
            }}
          >
            <Input
              placeholder="Search for an address in Kenya..."
              className="flex-1"
            />
          </Autocomplete>
        ) : (
          <Input
            placeholder="Loading autocomplete..."
            disabled
            className="flex-1"
          />
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCurrentLocation}
          disabled={isSearching}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          {isSearching ? 'Getting...' : 'Current Location'}
        </Button>
      </div>
    </div>
  );
};

export default AddressSearch;
