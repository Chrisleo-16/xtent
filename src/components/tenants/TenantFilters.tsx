
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import InviteUser from '@/components/landlord-dashboard/InviteUser';

const TenantFilters = () => {
  return (
    <Card className="shadow-md mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search tenants by name, property, or unit..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <div className="w-full sm:w-auto">
              <InviteUser />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantFilters;
