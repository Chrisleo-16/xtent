
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { Calendar, MapPin, DollarSign, Wrench, Home, Users, Clock } from 'lucide-react';

interface EventSidebarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const EventSidebar = ({ events, onEventClick }: EventSidebarProps) => {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rent': return DollarSign;
      case 'maintenance': return Wrench;
      case 'inspection': return Home;
      case 'meeting': return Users;
      case 'reminder': return Clock;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'rent': return 'bg-green-100 text-green-700 border-green-200';
      case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'inspection': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events?.slice(0, 5).map((event) => {
            const Icon = getEventTypeIcon(event.event_type);
            return (
              <div 
                key={event.id} 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className={`p-1 rounded ${getEventTypeColor(event.event_type)}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(event.start_date).toLocaleDateString()} at {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      {event.property_id && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Property Event
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(event.priority)}`}
                  >
                    {event.priority}
                  </Badge>
                </div>
              </div>
            );
          })}
          
          {(!events || events.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Events</span>
            <span className="font-medium">{events?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Rent Due</span>
            <span className="font-medium text-green-600">
              {events?.filter(e => e.event_type === 'rent').length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Maintenance</span>
            <span className="font-medium text-orange-600">
              {events?.filter(e => e.event_type === 'maintenance').length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Inspections</span>
            <span className="font-medium text-blue-600">
              {events?.filter(e => e.event_type === 'inspection').length || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
