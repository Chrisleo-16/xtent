
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const TenantBillsEmptyState = () => {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/20">
      <CardContent className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <Receipt className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No bills found</h3>
        <p className="text-gray-600 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
      </CardContent>
    </Card>
  );
};

export default TenantBillsEmptyState;
