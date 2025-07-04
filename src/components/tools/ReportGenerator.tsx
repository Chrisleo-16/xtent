
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReportTemplateCard } from './reports/ReportTemplateCard';
import { ReportConfigurationPanel } from './reports/ReportConfigurationPanel';
import { RecentReportsSection } from './reports/RecentReportsSection';
import { reportTemplates } from './reports/reportTemplates';
import { useReportData } from './reports/useReportData';
import { useReportGeneration } from './reports/useReportGeneration';

interface ReportGeneratorProps {
  userRole: string;
}

export const ReportGenerator = ({ userRole }: ReportGeneratorProps) => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last-month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch user's properties for filter dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('landlord_id', user.id)
        .order('title');

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: reportData, isLoading } = useReportData(selectedReport, dateRange, selectedProperty);
  const { handleGenerateReport } = useReportGeneration();

  // Fetch recent reports (this could be stored in database in the future)
  const recentReports = [
    {
      name: `Monthly Income - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      type: 'PDF',
      generated: '2 hours ago',
      status: 'ready',
      size: '2.3 MB'
    },
    {
      name: 'Outstanding Payments - Current',
      type: 'Excel',
      generated: '1 day ago',
      status: 'ready',
      size: '1.8 MB'
    },
    {
      name: 'Maintenance Logs - Last Quarter',
      type: 'PDF',
      generated: '3 days ago',
      status: 'ready',
      size: '4.1 MB'
    }
  ];

  const onGenerateReport = async () => {
    if (!selectedReport || !reportData) return;
    
    setIsGenerating(true);
    
    try {
      await handleGenerateReport(selectedReport, reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = reportTemplates.find(t => t.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map((template) => (
          <ReportTemplateCard
            key={template.id}
            template={template}
            isSelected={selectedReport === template.id}
            onClick={() => setSelectedReport(template.id)}
          />
        ))}
      </div>

      {selectedTemplate && (
        <>
          <Separator />
          
          {/* Report Configuration */}
          <ReportConfigurationPanel
            selectedTemplate={selectedTemplate}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
            isLoading={isLoading}
            reportData={reportData}
            isGenerating={isGenerating}
            onGenerateReport={onGenerateReport}
            propertiesData={propertiesData || []}
          />
        </>
      )}

      {/* Recent Reports */}
      <RecentReportsSection reports={recentReports} />
    </div>
  );
};
