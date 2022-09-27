import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import type { ReactElement } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import { Button } from "react-daisyui";

import { AuthLayout } from "@/components/layouts";
import axios from "axios";
import useInvitation from "hooks/useInvitation";
import { Loading, Error } from "@/components/ui";

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();

  const { token } = router.query;

  const { isLoading, isError, invitation } = useInvitation(token as string);

  if (isLoading || !invitation) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const acceptInvitation = async () => {
    const response = await axios.put(
      `/api/teams/${invitation.team.slug}/invitations`,
      {
        inviteToken: invitation.token,
      }
    );

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      router.push("/teams/switch");
    }
  };

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="font-bold">{`${invitation.team.name} is inviting you to join their team.`}</h2>
          <h3 className="text-center">
            {status === "authenticated"
              ? "You can accept the invitation to join the team by clicking the button below."
              : "To continue, you must either create a new account or login to an existing account."}
          </h3>
          {status === "unauthenticated" ? (
            <>
              <Button
                color="secondary"
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join`);
                }}
              >
                Create a new account
              </Button>
              <Button
                color="secondary"
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/login`);
                }}
              >
                Login using an existing account
              </Button>
            </>
          ) : (
            <Button onClick={acceptInvitation} fullWidth color="primary">
              Accept invitation
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

AcceptTeamInvitation.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Accept team invite"
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
    props: {},
  };
};

export default AcceptTeamInvitation;
