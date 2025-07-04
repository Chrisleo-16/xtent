
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const TenanciesEmptyState = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tenancies</h3>
        <p className="text-gray-600">No tenants have been assigned to this property yet.</p>
      </CardContent>
    </Card>
  );
};

export default TenanciesEmptyState;
