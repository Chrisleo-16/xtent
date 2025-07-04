
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import LandlordDashboard from "@/pages/LandlordDashboard";
import TenantDashboard from "@/pages/TenantDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import CaretakerDashboard from "@/pages/CaretakerDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import AddProperty from "@/pages/AddProperty";
import Properties from "@/pages/Properties";
import LandlordProperties from "@/pages/LandlordProperties";
import ManageProperty from "@/pages/ManageProperty";
import PropertyDetails from "@/pages/PropertyDetails";
import Tenants from "@/pages/Tenants";
import LandlordApplications from "@/pages/LandlordApplications";
import Maintenance from "@/pages/Maintenance";
import MaintenanceRequests from "@/pages/MaintenanceRequests";
import Billing from "@/pages/Billing";
import Utilities from "@/pages/Utilities";
import Settings from "@/pages/Settings";
import Chat from "@/pages/Chat";
import Auth from "@/pages/Auth";
import Verification from "@/pages/Verification";
import PublicListings from "@/pages/PublicListings";
import TenantApplications from "@/pages/TenantApplications";
import Apply from "@/pages/Apply";
import EnhancedTenantDashboard from "@/pages/EnhancedTenantDashboard";
import Tools from "@/pages/Tools";
import ListProperty from "@/pages/tools/ListProperty";
import Calendar from "@/pages/tools/Calendar";
import Analytics from "@/pages/tools/Analytics";
import Reports from "@/pages/tools/Reports";
import TenantBills from "@/pages/TenantBills";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
              <Route path="/tenant-dashboard" element={<TenantDashboard />} />
              <Route path="/enhanced-tenant-dashboard" element={<EnhancedTenantDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/caretaker-dashboard" element={<CaretakerDashboard />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/landlord-properties" element={<LandlordProperties />} />
              <Route path="/manage-property/:id" element={<ManageProperty />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/landlord-applications" element={<LandlordApplications />} />
              <Route path="/tenant-applications" element={<TenantApplications />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance-requests" element={<MaintenanceRequests />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/listings" element={<PublicListings />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/list-property" element={<ListProperty />} />
              <Route path="/tools/calendar" element={<Calendar />} />
              <Route path="/tools/analytics" element={<Analytics />} />
              <Route path="/tools/reports" element={<Reports />} />
              <Route path="/tenant-bills" element={<TenantBills />} />
              <Route path="/apply" element={<Apply />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
