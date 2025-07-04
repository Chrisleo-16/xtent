
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListPropertyTool } from '@/components/tools/ListPropertyTool';

const ListProperty = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link 
          to="/tools" 
          className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Link>
        <h1 className="text-2xl font-bold text-green-800 mb-2">List Property</h1>
        <p className="text-gray-600">
          Make your properties visible to potential tenants
        </p>
      </div>

      <ListPropertyTool />
    </div>
  );
};

export default ListProperty;
