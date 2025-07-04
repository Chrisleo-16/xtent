
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useState } from 'react';
import { CalendarEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useCalendarEvents';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

export const EventDetailModal = ({ event, isOpen, onClose, canEdit }: EventDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CalendarEvent>>({});
  
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  if (!event) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      priority: event.priority,
      start_date: event.start_date,
      end_date: event.end_date
    });
  };

  const handleSave = () => {
    updateEvent.mutate({
      id: event.id,
      updates: editData
    }, {
      onSuccess: () => {
        setIsEditing(false);
        onClose();
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent.mutate(event.id, {
        onSuccess: () => {
          onClose();
        }
      });
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rent': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'inspection': return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'meeting': return <User className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getEventTypeIcon(event.event_type)}
              {isEditing ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="text-lg font-semibold"
                />
              ) : (
                event.title
              )}
            </div>
            <Badge className={getPriorityColor(event.priority)}>
              {event.priority}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(event.start_date).toLocaleString()}
              {event.end_date && ` - ${new Date(event.end_date).toLocaleString()}`}
            </span>
          </div>

          {event.property_id && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Property Event</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={editData.description || ''}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                placeholder="Event description"
              />
            ) : (
              <p className="text-gray-700">{event.description || 'No description'}</p>
            )}
          </div>

          {isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editData.event_type}
                  onValueChange={(value) => setEditData({...editData, event_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent Collection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editData.priority}
                  onValueChange={(value) => setEditData({...editData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {event.is_recurring && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Recurring Event ({event.recurring_frequency})
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {canEdit && !isEditing && (
              <>
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateEvent.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
