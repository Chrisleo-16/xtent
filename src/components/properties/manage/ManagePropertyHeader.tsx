
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ManagePropertyHeaderProps {
  property: {
    title: string;
    address: string;
  };
}

const ManagePropertyHeader = ({ property }: ManagePropertyHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/landlord-properties')}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600">{property.address}</p>
        </div>
      </div>
    </div>
  );
};

export default ManagePropertyHeader;
