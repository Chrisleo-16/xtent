
// This component is deprecated in favor of the dedicated ManageProperty page
// Redirecting users to the proper manage property route

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PropertyManagementPanelProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyManagementPanel = ({ property, isOpen, onClose }: PropertyManagementPanelProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && property) {
      // Redirect to the dedicated manage property page
      navigate(`/manage-property/${property.id}`);
      onClose();
    }
  }, [isOpen, property, navigate, onClose]);

  return null;
};

export default PropertyManagementPanel;
