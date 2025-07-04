
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { EventDetailModal } from './EventDetailModal';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { EventSidebar } from './calendar/EventSidebar';
import { AddEventModal } from './calendar/AddEventModal';

interface PropertyCalendarProps {
  userRole: string;
}

export const PropertyCalendar = ({ userRole }: PropertyCalendarProps) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const { data: events, isLoading } = useCalendarEvents();

  const canAddEvents = ['landlord', 'admin', 'caretaker'].includes(userRole);
  const canEditEvents = ['landlord', 'admin'].includes(userRole);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canAddEvents={canAddEvents}
        onAddEventClick={() => setShowAddEvent(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CalendarGrid events={events || []} onEventClick={handleEventClick} />
        </div>

        <div>
          <EventSidebar events={events || []} onEventClick={handleEventClick} />
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        canEdit={canEditEvents}
      />

      <AddEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
      />
    </div>
  );
};
