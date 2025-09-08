import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useToast } from '@/hooks/use-toast';
import { roomsAPI } from '@/lib/api';

interface AddMemberProps {
  roomId: string;
}

export const AddMember = ({ roomId }: AddMemberProps) => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleAddMember = async () => {
    if (!email.trim()) return;

    try {
      await roomsAPI.addMember(roomId, email);
      toast({ title: 'Success', description: `${email} added to the room` });
      setEmail('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <Input
        placeholder="Invite user by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleAddMember}>Add</Button>
    </div>
  );
};
