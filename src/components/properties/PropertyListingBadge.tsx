
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { usePropertyListing } from '@/hooks/usePropertyListing';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PropertyListingBadgeProps {
  propertyId: string;
  isListed: boolean;
  onListingChange?: (isListed: boolean) => void;
}

export const PropertyListingBadge = ({ 
  propertyId, 
  isListed: initialIsListed, 
  onListingChange 
}: PropertyListingBadgeProps) => {
  const { profile } = useVerification();
  const navigate = useNavigate();
  const { listProperty, unlistProperty } = usePropertyListing();
  const [isListed, setIsListed] = useState(initialIsListed);

  // Set up real-time subscription for property status changes
  useEffect(() => {
    const channel = supabase
      .channel('property-listing-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${propertyId}`
        },
        (payload) => {
          const newIsListed = payload.new.status === 'available';
          setIsListed(newIsListed);
          onListingChange?.(newIsListed);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, onListingChange]);

  const handleBadgeClick = () => {
    // Check if user is verified
    const isVerified = profile?.verification_status === 'verified';
    
    if (!isVerified) {
      navigate('/verification');
      return;
    }

    if (!isListed) {
      // Navigate to tools page with focus on list property
      navigate('/tools#list-property');
    }
  };

  const handleToggleListing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is verified for listing actions
    const isVerified = profile?.verification_status === 'verified';
    
    if (!isVerified) {
      navigate('/verification');
      return;
    }
    
    try {
      if (isListed) {
        await unlistProperty.mutateAsync(propertyId);
      } else {
        await listProperty.mutateAsync(propertyId);
      }
    } catch (error) {
      console.error('Failed to toggle listing status:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isListed ? "default" : "secondary"}
        className={`cursor-pointer transition-colors ${
          isListed 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={handleBadgeClick}
      >
        {isListed ? (
          <>
            <Eye className="h-3 w-3 mr-1" />
            Listed
          </>
        ) : (
          <>
            <EyeOff className="h-3 w-3 mr-1" />
            Not Listed
          </>
        )}
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleListing}
        disabled={listProperty.isPending || unlistProperty.isPending}
        className="h-6 w-6 p-0"
      >
        {isListed ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};
