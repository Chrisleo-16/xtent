
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, User, LogOut, Building, MessageSquare, ClipboardList, Package, Users, Receipt, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MobileNavigationProps {
  role: string;
}

// Define types for navigation items
type NavigationItemWithPath = {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
};

type NavigationItemWithAction = {
  label: string;
  icon: React.ComponentType<any>;
  action: () => Promise<void>;
};

type NavigationItem = NavigationItemWithPath | NavigationItemWithAction;

// Type guard functions
const hasPath = (item: NavigationItem): item is NavigationItemWithPath => {
  return 'path' in item;
};

const hasAction = (item: NavigationItem): item is NavigationItemWithAction => {
  return 'action' in item;
};

const MobileNavigation = ({ role }: MobileNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getNavItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: `/${role}-dashboard`,
      },
    ];

    switch (role) {
      case 'landlord':
        return [
          ...baseItems,
          {
            label: 'Properties',
            icon: Building,
            path: '/landlord-properties',
          },
          {
            label: 'Utilities',
            icon: Zap,
            path: '/utilities',
          },
          {
            label: 'Chat',
            icon: MessageSquare,
            path: '/chat',
          },
          {
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
          },
        ];
      case 'tenant':
        return [
          ...baseItems,
          {
            label: 'Bills',
            icon: Receipt,
            path: '/tenant-bills',
          },
          {
            label: 'Utilities',
            icon: Zap,
            path: '/utilities',
          },
          {
            label: 'Chat',
            icon: MessageSquare,
            path: '/chat',
          },
          {
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
          },
        ];
      case 'caretaker':
        return [
          ...baseItems,
          {
            label: 'Tasks',
            icon: ClipboardList,
            path: '/maintenance',
          },
          {
            label: 'Properties',
            icon: Building,
            path: '/properties',
          },
          {
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
          },
        ];
      case 'vendor':
        return [
          ...baseItems,
          {
            label: 'Jobs',
            icon: Package,
            path: '/jobs',
          },
          {
            label: 'Chat',
            icon: MessageSquare,
            path: '/chat',
          },
          {
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
          },
        ];
      default:
        return [
          ...baseItems,
          {
            label: 'Profile',
            icon: User,
            path: '/profile',
          },
          {
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.slice(0, 4).map((item, index) => {
          const Icon = item.icon;
          const active = hasPath(item) ? isActive(item.path) : false;
          
          if (hasAction(item)) {
            return (
              <button
                key={`${item.label}-${index}`}
                onClick={item.action}
                className="flex flex-col items-center justify-center h-full transition-all duration-200 hover:bg-red-50 active:scale-95"
              >
                <Icon className="h-5 w-5 text-red-600 mb-1" />
                <span className="text-xs font-medium text-red-600">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={`${item.label}-${index}`}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 active:scale-95 ${
                active 
                  ? 'bg-green-50 text-green-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
