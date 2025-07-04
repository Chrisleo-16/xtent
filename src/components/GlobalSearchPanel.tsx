
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'property' | 'tenant' | 'maintenance';
  title: string;
  subtitle: string;
  url: string;
}

export const GlobalSearchPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Global search query with debounce
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['global-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const results: SearchResult[] = [];
      
      // Search properties
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, address')
        .eq('landlord_id', user?.id)
        .ilike('title', `%${searchTerm}%`)
        .limit(3);

      if (properties) {
        results.push(...properties.map(p => ({
          id: p.id,
          type: 'property' as const,
          title: p.title,
          subtitle: p.address,
          url: `/property/${p.id}`
        })));
      }

      // Search maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select('id, title, property_id')
        .eq('landlord_id', user?.id)
        .ilike('title', `%${searchTerm}%`)
        .limit(3);

      if (maintenance) {
        results.push(...maintenance.map(m => ({
          id: m.id,
          type: 'maintenance' as const,
          title: m.title,
          subtitle: 'Maintenance Request',
          url: `/maintenance/${m.id}`
        })));
      }

      return results;
    },
    enabled: !!searchTerm.trim() && !!user,
  });

  // Notification count query
  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowResults(true);
  };

  const handleSearchResultClick = (url: string) => {
    navigate(url);
    setShowResults(false);
    setIsSearchFocused(false);
    setSearchTerm('');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-green-600">XTENT</div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search properties, tenants, tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              className={cn(
                "pl-10 transition-all duration-200 ease-in-out",
                isSearchFocused ? "w-full" : "w-64"
              )}
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto">
              <CardContent className="p-2">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults?.length ? (
                  <div className="space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchResultClick(result.url)}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900">{result.title}</div>
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                ) : (
                  <div className="p-4 text-center text-gray-500">Start typing to search...</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="sm" className="relative">
            <MessageCircle className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500">
              2
            </Badge>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.user_metadata?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
