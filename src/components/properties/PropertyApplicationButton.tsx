
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Send } from 'lucide-react';
import PropertyApplicationModal from './PropertyApplicationModal';

interface PropertyApplicationButtonProps {
  propertyId: string;
  propertyOwnerId: string;
  propertyTitle?: string;
  className?: string;
}

const PropertyApplicationButton = ({ 
  propertyId, 
  propertyOwnerId, 
  propertyTitle = 'Property',
  className 
}: PropertyApplicationButtonProps) => {
  const { user } = useAuth();
  const { role: userRole } = useUserRole();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user has already applied
  const { data: existingApplication } = useQuery({
    queryKey: ['application', propertyId, user?.id],
    queryFn: async () => {
      if (!user?.id || !user?.email) return null;
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', propertyId)
        .eq('applicant_email', user.email)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!user?.email,
  });

  // Use centralized role system - no fallbacks for security
  const currentRole = userRole;

  // Don't show button if user is the property owner OR if user is a landlord
  if (user?.id === propertyOwnerId || currentRole === 'landlord') {
    return null;
  }

  // Show application status if user has already applied
  if (existingApplication) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <Badge variant="secondary">
          Applied • {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
        </Badge>
      </div>
    );
  }

  // Show apply button for authenticated tenants only
  if (user && currentRole === 'tenant') {
    return (
      <>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className={`bg-green-600 hover:bg-green-700 ${className}`}
        >
          <Send className="h-4 w-4 mr-2" />
          Apply Now
        </Button>
        
        <PropertyApplicationModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Show login prompt for non-authenticated users
  return (
    <Link to={`/auth?redirect=${encodeURIComponent(`/property/${propertyId}`)}`}>
      <Button className={`bg-green-600 hover:bg-green-700 ${className}`}>
        <Send className="h-4 w-4 mr-2" />
        Apply Now
      </Button>
    </Link>
  );
};

export default PropertyApplicationButton;
