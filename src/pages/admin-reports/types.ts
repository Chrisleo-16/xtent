
export interface UserDistribution {
  role: string;
  count: number;
  color: string;
}

export interface SystemMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalProperties: number;
  occupancyRate: number;
  monthlyGrowth: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  properties: number;
}

export interface PropertyTypeData {
  type: string;
  count: number;
  percentage: number;
}
