
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'pdf' | 'excel' | 'both';
  category: string;
  estimatedTime: string;
}

interface PropertyData {
  id: string;
  title: string;
}

interface ReportConfigurationPanelProps {
  selectedTemplate: ReportTemplate;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
  isLoading: boolean;
  reportData: any;
  isGenerating: boolean;
  onGenerateReport: () => void;
  propertiesData: PropertyData[];
}

export const ReportConfigurationPanel = ({
  selectedTemplate,
  dateRange,
  onDateRangeChange,
  selectedProperty,
  onPropertyChange,
  isLoading,
  reportData,
  isGenerating,
  onGenerateReport,
  propertiesData
}: ReportConfigurationPanelProps) => {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <selectedTemplate.icon className="h-5 w-5 text-green-600" />
          Configure {selectedTemplate.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Selection */}
          <div className="space-y-2">
            <Label>Property</Label>
            <Select value={selectedProperty} onValueChange={onPropertyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {propertiesData.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select defaultValue="pdf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(selectedTemplate.type === 'both' || selectedTemplate.type === 'pdf') && (
                  <SelectItem value="pdf">PDF Document</SelectItem>
                )}
                {(selectedTemplate.type === 'both' || selectedTemplate.type === 'excel') && (
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>
        )}

        {/* Data Preview */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading report data...
          </div>
        )}

        {reportData && !isLoading && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Data Preview</h4>
            <p className="text-sm text-gray-600">
              Found {Array.isArray(reportData) ? reportData.length : 0} records for this report
            </p>
            {Array.isArray(reportData) && reportData.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Date range: {dateRange.replace('-', ' ')} | 
                Property: {selectedProperty === 'all' ? 'All Properties' : 
                  propertiesData.find(p => p.id === selectedProperty)?.title || 'Unknown'}
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center gap-4 pt-4">
          <Button 
            onClick={onGenerateReport}
            disabled={isGenerating || isLoading || !reportData || (Array.isArray(reportData) && reportData.length === 0)}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="text-sm text-gray-600">
              Estimated time: {selectedTemplate.estimatedTime}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
