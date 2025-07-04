
import { Users } from 'lucide-react';

const TenantsEmptyState = () => {
  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Current Tenants</h3>
      <p className="text-gray-600">
        Active tenancies for this property will appear here once tenants are assigned to units.
      </p>
    </div>
  );
};

export default TenantsEmptyState;
