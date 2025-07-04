
export const useReportGeneration = () => {
  const generateReportContent = (reportType: string, data: any) => {
    switch (reportType) {
      case 'monthly-income':
        const totalIncome = data?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
        return {
          title: 'Monthly Income Report',
          totalIncome,
          paymentCount: data?.length || 0,
          payments: data || []
        };
      
      case 'outstanding-payments':
        const totalOutstanding = data?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
        return {
          title: 'Outstanding Payments Report',
          totalOutstanding,
          overdueCount: data?.length || 0,
          overduePayments: data || []
        };
      
      case 'maintenance-logs':
        const totalCost = data?.reduce((sum: number, req: any) => sum + (req.actual_cost || req.estimated_cost || 0), 0) || 0;
        return {
          title: 'Maintenance Logs Report',
          totalRequests: data?.length || 0,
          totalCost,
          requests: data || []
        };
      
      case 'tenant-ledger':
        return {
          title: 'Tenant Ledger Report',
          totalTransactions: data?.length || 0,
          transactions: data || []
        };
      
      default:
        return { title: 'Report', data: data || [] };
    }
  };

  const handleGenerateReport = async (selectedReport: string, reportData: any) => {
    if (!selectedReport || !reportData) return;
    
    try {
      // Generate the report based on data
      const reportContent = generateReportContent(selectedReport, reportData);
      
      // Simulate report generation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generated report:', {
        reportId: selectedReport,
        content: reportContent
      });
      
      // For demo purposes, create a simple text file
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-report.json`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };

  return { handleGenerateReport };
};
