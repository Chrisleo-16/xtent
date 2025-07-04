
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { PropertyTypeData } from '../types';

interface PropertyTypesSectionProps {
  propertyTypes: PropertyTypeData[] | undefined;
  isLoading: boolean;
}

export const PropertyTypesSection = ({ propertyTypes, isLoading }: PropertyTypesSectionProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Property Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {propertyTypes?.map((type) => (
              <div key={type.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{type.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{type.count} properties</span>
                    <Badge variant="outline">{type.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
