import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import Link from 'next/link';

const MdrInvitePage = ({ token, invitation }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === 'loading') return null;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
          <div className="card-body text-center">
            <h1 className="text-xl font-bold">Project Invitation</h1>
            <p className="text-gray-500">
              You need to sign in to accept this invitation.
            </p>
            <div className="card-actions justify-center mt-4">
              <Link
                href={`/auth/login?callbackUrl=/mdr/invite/${token}`}
                className="btn btn-primary"
              >
                Sign in to accept
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invitation Not Found</h1>
          <p className="text-gray-500">
            This invitation may have expired or already been accepted.
          </p>
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mdr/invite/${token}`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || 'Failed to accept invitation');
        return;
      }

      toast.success('Invitation accepted!');
      router.push(json.data.redirectUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
        <div className="card-body">
          <h1 className="card-title">Project Invitation</h1>
          <p className="text-gray-600">
            You have been invited to join{' '}
            <strong>{invitation.projectName}</strong> as{' '}
            <strong>{invitation.role}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            Invited by: {invitation.invitedBy}
          </p>
          <div className="card-actions justify-end mt-4">
            <Button
              color="primary"
              onClick={handleAccept}
              loading={loading}
              disabled={loading}
            >
              Accept Invitation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({
  locale,
  params,
}: GetServerSidePropsContext) {
  const token = params?.token as string;

  try {
    const { prisma } = await import('@/lib/prisma');

    const invitation = await prisma.mdrProjectInvitation.findUnique({
      where: { token },
      include: {
        mdrProject: {
          select: { name: true },
        },
      },
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      return {
        props: {
          ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
          token,
          invitation: null,
        },
      };
    }

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        token,
        invitation: {
          projectName: invitation.mdrProject.name,
          role: invitation.role,
          invitedBy: invitation.invitedBy,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      },
    };
  } catch {
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        token,
        invitation: null,
      },
    };
  }
}

export default MdrInvitePage;
