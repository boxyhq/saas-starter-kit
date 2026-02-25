import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { TrashIcon } from '@heroicons/react/24/outline';

interface MdrMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface MdrInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

interface MdrMemberListProps {
  members: MdrMember[];
  invitations: MdrInvitation[];
  teamSlug: string;
  mdrId: string;
  onUpdate: () => void;
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    ADMIN: 'badge-error',
    EDITOR: 'badge-warning',
    VIEWER: 'badge-info',
  };
  return map[role] ?? 'badge-neutral';
};

const MdrMemberList = ({
  members,
  invitations,
  teamSlug,
  mdrId,
  onUpdate,
}: MdrMemberListProps) => {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the project?')) return;
    setRemoving(memberId);
    try {
      const res = await fetch(
        `/api/teams/${teamSlug}/mdr/${mdrId}/members/${memberId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message || 'Failed to remove member');
        return;
      }
      onUpdate();
    } finally {
      setRemoving(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    const res = await fetch(
      `/api/teams/${teamSlug}/mdr/${mdrId}/invitations/${invitationId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message || 'Failed to revoke invitation');
      return;
    }
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Members ({members.length})</h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.name}</td>
                  <td className="text-gray-500">{member.user.email}</td>
                  <td>
                    <span className={`badge badge-sm ${roleBadge(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="xs"
                      color="ghost"
                      className="text-error"
                      loading={removing === member.id}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invitations.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">
            Pending Invitations ({invitations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>
                      <span className={`badge badge-sm ${roleBadge(inv.role)}`}>
                        {inv.role}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        size="xs"
                        color="ghost"
                        className="text-error"
                        onClick={() => handleRevokeInvitation(inv.id)}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MdrMemberList;
