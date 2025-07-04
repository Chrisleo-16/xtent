import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Building,
  Users,
  Settings,
  Receipt,
  Wrench,
  MessageSquare,
  FileText,
  BarChart3,
  Calendar,
  CreditCard,
  Zap,
  User,
  LogOut,
  Bell
} from 'lucide-react';
import XtentLogo from './XtentLogo';
import { supabase } from '@/integrations/supabase/client';

interface AppSidebarProps {
  role: 'landlord' | 'tenant' | 'admin' | 'caretaker';
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate =  useNavigate()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getLandlordMenuItems = () => [
    {
      title: 'Dashboard',
      url: '/landlord-dashboard',
      icon: Home,
    },
    {
      title: 'Properties',
      url: '/landlord-properties',
      icon: Building,
    },
    {
      title: 'Tenants',
      url: '/tenants',
      icon: Users,
    },
    {
      title: 'Bills & Payments',
      url: '/billing',
      icon: Receipt,
    },
    {
      title: 'Maintenance',
      url: '/maintenance-requests',
      icon: Wrench,
    },
    {
      title: 'Messages',
      url: '/chat',
      icon: MessageSquare,
    },
    {
      title: 'Tools',
      url: '/tools',
      icon: BarChart3,
    },
    {
      title: 'Utilities',
      url: '/utilities',
      icon: Zap,
    },
  ];

  const getTenantMenuItems = () => [
    {
      title: 'Dashboard',
      url: '/tenant-dashboard',
      icon: Home,
    },
    {
      title: 'My Property',
      url: '/tenant/property',
      icon: Building,
    },
    {
      title: 'Bills & Payments',
      url: '/tenant-bills',
      icon: Receipt,
    },
    {
      title: 'Maintenance',
      url: '/maintenance',
      icon: Wrench,
    },
    {
      title: 'Messages',
      url: '/tenant-chat',
      icon: MessageSquare,
    },
    {
      title: 'Applications',
      url: '/tenant-applications',
      icon: FileText,
    },
    {
      title: 'Properties',
      url: '/listings',
      icon: Building,
    },
  ];

  const getAdminMenuItems = () => [
    {
      title: 'Dashboard',
      url: '/admin-dashboard',
      icon: Home,
    },
    {
      title: 'Users',
      url: '/admin-users',
      icon: Users,
    },
    {
      title: 'Properties',
      url: '/admin-properties',
      icon: Building,
    },
    {
      title: 'Verifications',
      url: '/admin-verifications',
      icon: FileText,
    },
    {
      title: 'Reports',
      url: '/admin-reports',
      icon: BarChart3,
    },
    {
      title: 'Logs',
      url: '/admin-logs',
      icon: FileText,
    },
  ];

  const getCaretakerMenuItems = () => [
    {
      title: 'Dashboard',
      url: '/caretaker-dashboard',
      icon: Home,
    },
    {
      title: 'Properties',
      url: '/caretaker-properties',
      icon: Building,
    },
    {
      title: 'Maintenance',
      url: '/caretaker-maintenance',
      icon: Wrench,
    },
    {
      title: 'Tenants',
      url: '/caretaker-tenants',
      icon: Users,
    },
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'landlord':
        return getLandlordMenuItems();
      case 'tenant':
        return getTenantMenuItems();
      case 'admin':
        return getAdminMenuItems();
      case 'caretaker':
        return getCaretakerMenuItems();
      default:
        return getTenantMenuItems();
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <XtentLogo />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {role === 'landlord' && 'Property Management'}
            {role === 'tenant' && 'Tenant Portal'}
            {role === 'admin' && 'Administration'}
            {role === 'caretaker' && 'Caretaker Tools'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/settings')}>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
