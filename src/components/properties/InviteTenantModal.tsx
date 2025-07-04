
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';
import { useTenantInvitations } from '@/hooks/useTenantInvitations';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';

interface InviteTenantModalProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
}

export const InviteTenantModal = ({ propertyId, propertyTitle, trigger }: InviteTenantModalProps) => {
  const { profile } = useVerification();
  const navigate = useNavigate();
  const { createInvitation } = useTenantInvitations();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is verified
    if (profile?.verification_status !== 'verified') {
      navigate('/verification');
      return;
    }

    if (!email.trim()) return;

    try {
      await createInvitation.mutateAsync({
        propertyId,
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined
      });
      
      // Reset form and close modal
      setEmail('');
      setPhone('');
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Tenant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Tenant to {propertyTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenant@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!email.trim() || createInvitation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {createInvitation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
