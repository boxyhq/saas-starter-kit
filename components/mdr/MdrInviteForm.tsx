import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Select } from 'react-daisyui';

interface MdrInviteFormProps {
  teamSlug: string;
  mdrId: string;
  onInvited: () => void;
}

const MdrInviteForm = ({ teamSlug, mdrId, onInvited }: MdrInviteFormProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('EDITOR');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/teams/${teamSlug}/mdr/${mdrId}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), role }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || 'Failed to send invitation');
        return;
      }

      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onInvited();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-base-200 rounded-lg p-4">
      <h3 className="font-medium mb-3">Invite to Project</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <Input
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="sm"
          className="flex-1 min-w-48"
          required
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          size="sm"
        >
          <Select.Option value="VIEWER">Viewer</Select.Option>
          <Select.Option value="EDITOR">Editor</Select.Option>
          <Select.Option value="ADMIN">Admin</Select.Option>
        </Select>
        <Button
          type="submit"
          color="primary"
          size="sm"
          loading={loading}
          disabled={!email.trim() || loading}
        >
          Send Invite
        </Button>
      </form>
    </div>
  );
};

export default MdrInviteForm;
