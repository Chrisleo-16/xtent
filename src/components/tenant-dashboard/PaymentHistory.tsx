
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface PaymentHistoryProps {
  paymentHistory: Array<{ month: string; amount: number; }>;
}

const PaymentHistory = ({ paymentHistory }: PaymentHistoryProps) => (
  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/20 hover:shadow-2xl transition-all duration-300">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-xl font-bold">
        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        Payment History & Trends
      </CardTitle>
    </CardHeader>
    <CardContent>
      {paymentHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={paymentHistory}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `KES ${value/1000}k`} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#22c55e" 
              strokeWidth={3}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-10 text-gray-500">No payment history to display.</div>
      )}
    </CardContent>
  </Card>
);

export default PaymentHistory;
