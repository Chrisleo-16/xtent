
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'pdf' | 'excel' | 'both';
  category: string;
  estimatedTime: string;
}

interface ReportTemplateCardProps {
  template: ReportTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export const ReportTemplateCard = ({ template, isSelected, onClick }: ReportTemplateCardProps) => {
  const Icon = template.icon;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-green-500 bg-green-50 border-green-200' 
          : 'hover:shadow-md border-gray-200'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${
            isSelected ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Icon className={`h-5 w-5 ${
              isSelected ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold">
          {template.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">
          {template.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.estimatedTime}
          </span>
          <div className="flex gap-1">
            {template.type === 'both' || template.type === 'pdf' ? (
              <Badge variant="outline" className="text-xs px-1 py-0">PDF</Badge>
            ) : null}
            {template.type === 'both' || template.type === 'excel' ? (
              <Badge variant="outline" className="text-xs px-1 py-0">Excel</Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
