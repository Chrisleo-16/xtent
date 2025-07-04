
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users } from 'lucide-react';

interface ManagePropertyNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ManagePropertyNavigation = ({ activeTab, onTabChange }: ManagePropertyNavigationProps) => {
  return (
    <TabsList className="grid w-full grid-cols-1 lg:grid-cols-1 lg:flex lg:flex-col lg:h-auto lg:bg-transparent lg:p-0 gap-2">
      <TabsTrigger 
        value="units" 
        className="lg:w-full lg:justify-start lg:px-4 lg:py-3 lg:data-[state=active]:bg-green-100 lg:data-[state=active]:text-green-800"
        onClick={() => onTabChange('units')}
      >
        <Building className="h-4 w-4 mr-2" />
        Units Management
      </TabsTrigger>
      
      <TabsTrigger 
        value="tenants" 
        className="lg:w-full lg:justify-start lg:px-4 lg:py-3 lg:data-[state=active]:bg-green-100 lg:data-[state=active]:text-green-800"
        onClick={() => onTabChange('tenants')}
      >
        <Users className="h-4 w-4 mr-2" />
        Tenant Management
      </TabsTrigger>
    </TabsList>
  );
};

export default ManagePropertyNavigation;
