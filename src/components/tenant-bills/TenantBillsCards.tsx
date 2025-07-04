
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Receipt } from 'lucide-react';
import { Bill, getStatusBadge } from './utils';

interface TenantBillsCardsProps {
  bills: Bill[];
}

const TenantBillsCards = ({ bills }: TenantBillsCardsProps) => {
  return (
    <div className="md:hidden space-y-4">
      {bills.map((bill) => (
        <Card key={bill.id} className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/20 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{bill.description}</h3>
                <p className="text-sm text-gray-600 capitalize bg-gray-100 rounded-full px-3 py-1 inline-block">{bill.type}</p>
              </div>
              <div className="ml-4">
                {getStatusBadge(bill.status)}
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-gray-900">KES {bill.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Due Date:</span>
                <span className="text-sm font-semibold">{new Date(bill.dueDate).toLocaleDateString()}</span>
              </div>
              {bill.paidDate && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Paid Date:</span>
                  <span className="text-sm font-semibold text-green-600">{new Date(bill.paidDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {bill.status !== 'paid' && (
                <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}
              {bill.status === 'paid' && (
                <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TenantBillsCards;
