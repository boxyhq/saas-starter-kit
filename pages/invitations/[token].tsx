import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import { Button } from "react-daisyui";

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
      <div className="rounded-md bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="font-bold">{`${invitation.tenant.name} is inviting you to join their organization.`}</h2>
          <h3 className="text-center">
            {status === "authenticated"
              ? "You can accept the invitation to join the organization by clicking the button below."
              : "To continue, you must either create a new account or login to an existing account."}
          </h3>
          {status === "unauthenticated" ? (
            <>
              <Button
                fullWidth
                onClick={() => {
                  router.push(`/auth/join`);
                }}
              >
                Create a new account
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  router.push(`/auth/login`);
                }}
              >
                Login using an existing account
              </Button>
            </>
          ) : (
            <Button onClick={acceptInvitation} fullWidth>
              Accept invitation
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

AcceptOrganizationInvitation.getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <AuthLayout
      heading="Accept organization invite"
      description="Check out the our website if you'd like to learn more before diving in."
    >
      {page}
    </AuthLayout>
  );
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
