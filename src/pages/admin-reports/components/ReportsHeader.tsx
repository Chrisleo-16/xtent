
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Download } from 'lucide-react';

interface ReportsHeaderProps {
  reportPeriod: string;
  onReportPeriodChange: (value: string) => void;
  onExportReport: (type: string) => void;
}

export const ReportsHeader = ({ reportPeriod, onReportPeriodChange, onExportReport }: ReportsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-green-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">Comprehensive system analytics and reporting</p>
      </div>
      <div className="flex gap-2">
        <Select value={reportPeriod} onValueChange={onReportPeriodChange}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => onExportReport('full')}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
};
