import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { Button, Typography } from "@supabase/ui";
import { ReactElement } from "react";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import { useSession } from "next-auth/react";

import { inferSSRProps } from "@lib/inferSSRProps";
import invitations from "models/invitations";
import { AuthLayout } from "@components/layouts";
import { put } from "@lib/fetch";

const AcceptOrganizationInvitation: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ invitation }) => {
  const { status } = useSession();
  const router = useRouter();

  const acceptInvitation = async () => {
    const { data, error } = await put(
      `/api/organizations/${invitation.tenant.slug}/invitations`,
      {
        invitationToken: invitation.token,
      }
    );

    if (error) {
      toast.error(error.message);
    }

    if (data) {
      router.push("/organizations/switch");
    }
  };

  return (
    <>
      <div className="flex flex-col flex-wrap items-center gap-4 rounded border-2 border-gray-300 p-6">
        <Typography.Title level={3}>
          Accept organization invite
        </Typography.Title>
        <Typography.Title level={5}>
          <strong>{invitation.tenant.name}</strong> is inviting you to join
          their organization.
        </Typography.Title>
        <Typography.Title level={5}>
          To continue, you must either create a new account, or login to an
          existing account.
        </Typography.Title>
        {status === "unauthenticated" ? (
          <div className="flex w-full flex-wrap justify-center gap-4">
            <Button
              size="medium"
              onClick={() => {
                router.push(`/auth/join`);
              }}
            >
              Create a new account
            </Button>
            <Button
              size="medium"
              type="outline"
              onClick={() => {
                router.push(`/auth/login`);
              }}
            >
              Login using an existing account
            </Button>
          </div>
        ) : (
          <Button size="medium" onClick={acceptInvitation}>
            Accept invitation
          </Button>
        )}
      </div>
    </>
  );
};

AcceptOrganizationInvitation.getLayout = function getLayout(
  page: ReactElement
) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res, query } = context;
  const { token } = query;

  const invitation = await invitations.getInvitation(token as string);

  if (!invitation) {
    return {
      notFound: true,
    };
  }

  setCookie(
    "pending-invite",
    {
      token,
      url: context.resolvedUrl,
    },
    {
      req,
      res,
      maxAge: 60 * 6 * 24,
      httpOnly: true,
      sameSite: "lax",
    }
  );

  return {
    props: {
      invitation,
    },
  };
};

export default AcceptOrganizationInvitation;
