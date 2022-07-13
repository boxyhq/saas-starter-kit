import type { NextPageWithLayout } from "types";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { Input, Button, Typography } from "@supabase/ui";
import { ReactElement, useState } from "react";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

import type { User } from "@prisma/client";
import { getSession } from "@lib/session";
import { put } from "@lib/fetch";
import { inferSSRProps } from "@lib/inferSSRProps";
import users from "models/users";
import invitations from "models/invitations";
import { AuthLayout } from "@components/layouts";

const AcceptInvitation: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ invitation }) => {
  const router = useRouter();
  console.log(invitation);

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
        <div className="flex w-full flex-wrap justify-center gap-4">
          <Button
            size="medium"
            onClick={() => {
              router.push(`/auth/join/?invitationToken=${invitation.token}`);
            }}
          >
            Create a new account
          </Button>
          <Button
            size="medium"
            type="outline"
            onClick={() => {
              router.push(`/auth/login/?invitationToken=${invitation.token}`);
            }}
          >
            Login using an existing account
          </Button>
        </div>
      </div>
    </>
  );
};

AcceptInvitation.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { token } = context.query;

  const invitation = await invitations.getInvitation(token as string);

  if (!invitation) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      invitation,
    },
  };
};

export default AcceptInvitation;
