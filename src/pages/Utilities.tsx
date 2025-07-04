
import React from 'react';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Zap, Calculator, Settings } from "lucide-react";
import WaterBillingTab from '@/components/utilities/WaterBillingTab';
import ElectricityBillingTab from '@/components/utilities/ElectricityBillingTab';
import UtilityHubTab from '@/components/utilities/UtilityHubTab';
import { LandlordUtilityQuestionnaire } from '@/components/utilities/LandlordUtilityQuestionnaire';

const Utilities = () => {
  return (
    <ResponsiveSidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilities Management</h1>
          <p className="text-gray-600 mt-2">
            Manage water, electricity, and other utility bills for your properties
          </p>
        </div>

        <Tabs defaultValue="hub" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hub" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Utility Hub
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Water Billing
            </TabsTrigger>
            <TabsTrigger value="electricity" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Electricity
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hub">
            <UtilityHubTab />
          </TabsContent>

          <TabsContent value="water">
            <WaterBillingTab />
          </TabsContent>

          <TabsContent value="electricity">
            <ElectricityBillingTab />
          </TabsContent>

          <TabsContent value="questionnaire">
            <Card>
              <CardHeader>
                <CardTitle>Property Utility Setup</CardTitle>
                <CardDescription>
                  Configure utility billing settings for your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandlordUtilityQuestionnaire propertyId="" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveSidebarLayout>
  );
};

export default Utilities;
