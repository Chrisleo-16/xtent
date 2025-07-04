
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLandlordDashboardData } from '@/hooks/useLandlordDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const ChartSkeleton = () => (
    <Card className="shadow-md p-4">
        <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
            <div className="flex justify-center items-center h-[200px]">
                <Skeleton className="h-40 w-40 rounded-full" />
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
            </div>
        </CardContent>
    </Card>
);

const BarChartSkeleton = () => (
    <Card className="shadow-md p-4">
        <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-[200px] w-full" />
        </CardContent>
    </Card>
);


const DashboardCharts = () => {
  const { data, isLoading } = useLandlordDashboardData();

  const rentCollectionData = [
    { name: 'Collected', value: data?.rentCollectionStats?.collected || 0, color: '#22c55e' },
    { name: 'Pending', value: data?.rentCollectionStats?.pending || 0, color: '#f59e0b' },
    { name: 'Overdue', value: data?.rentCollectionStats?.overdue || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const occupancyTrend = data?.occupancyTrend || [];

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <BarChartSkeleton />
            <ChartSkeleton />
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
      <Card className="shadow-md p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Occupancy Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {occupancyTrend.length > 0 && occupancyTrend.some(d => d.occupied > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancyTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Bar dataKey="occupied" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-gray-500">No occupancy data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Rent Collection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
            {rentCollectionData.length > 0 ? (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                        <Pie
                            data={rentCollectionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {rentCollectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {rentCollectionData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm">{entry.name}: {entry.value}%</span>
                        </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-[200px]">
                    <p className="text-gray-500">No rent data for this month.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
