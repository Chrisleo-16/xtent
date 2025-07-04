
import { 
  DollarSign, 
  AlertCircle, 
  Wrench, 
  Receipt,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'pdf' | 'excel' | 'both';
  category: string;
  estimatedTime: string;
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: 'monthly-income',
    title: 'Monthly Income Report',
    description: 'Comprehensive breakdown of rental income, late fees, and other revenue streams',
    icon: DollarSign,
    type: 'both',
    category: 'Financial',
    estimatedTime: '2-3 min'
  },
  {
    id: 'outstanding-payments',
    title: 'Outstanding Payments',
    description: 'List of overdue rent payments and outstanding balances by tenant',
    icon: AlertCircle,
    type: 'both',
    category: 'Financial',
    estimatedTime: '1-2 min'
  },
  {
    id: 'maintenance-logs',
    title: 'Maintenance Logs',
    description: 'Complete maintenance request history with costs and completion status',
    icon: Wrench,
    type: 'both',
    category: 'Operations',
    estimatedTime: '3-4 min'
  },
  {
    id: 'tax-summary',
    title: 'Tax Filing Summary',
    description: 'Annual summary for tax purposes including income, expenses, and deductions',
    icon: Receipt,
    type: 'pdf',
    category: 'Tax & Legal',
    estimatedTime: '4-5 min'
  },
  {
    id: 'occupancy-report',
    title: 'Occupancy Analysis',
    description: 'Detailed occupancy rates, vacancy periods, and turnover analysis',
    icon: FileText,
    type: 'both',
    category: 'Analytics',
    estimatedTime: '2-3 min'
  },
  {
    id: 'tenant-ledger',
    title: 'Tenant Ledger',
    description: 'Individual tenant payment history and account statements',
    icon: FileSpreadsheet,
    type: 'both',
    category: 'Financial',
    estimatedTime: '1-2 min'
  }
];
