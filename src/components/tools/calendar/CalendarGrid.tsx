
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { DollarSign, Wrench, Home, Users, Clock, Calendar } from 'lucide-react';

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarGrid = ({ events, onEventClick }: CalendarGridProps) => {
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

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    if (!events) return [];
    const dateStr = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(event => event.start_date.startsWith(dateStr));
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-gray-100 rounded-lg ${
                day ? 'hover:bg-gray-50 cursor-pointer' : ''
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).slice(0, 2).map((event) => {
                      const Icon = getEventTypeIcon(event.event_type);
                      return (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.event_type)}`}
                          onClick={() => onEventClick(event)}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      );
                    })}
                    {getEventsForDate(day).length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{getEventsForDate(day).length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
