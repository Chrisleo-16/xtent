
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TenantBillsSummaryCardsProps {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

const TenantBillsSummaryCards = ({
  totalAmount,
  paidAmount,
  pendingAmount,
  overdueAmount
}: TenantBillsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Bills</CardTitle>
          <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
            <Receipt className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-black bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
            KES {totalAmount.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">All time total</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-green-50 to-green-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Paid</CardTitle>
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            KES {paidAmount.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Successfully paid</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-yellow-50 to-yellow-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Pending</CardTitle>
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
            KES {pendingAmount.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Awaiting payment</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-red-50 to-red-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Overdue</CardTitle>
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            KES {overdueAmount.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Past due date</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantBillsSummaryCards;
