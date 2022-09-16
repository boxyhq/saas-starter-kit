import React from "react";
import { Button } from "react-daisyui";
import axios from "axios";
import toast from "react-hot-toast";

import { Card, LetterAvatar, Loading, Error } from "@/components/ui";
import { Invitation, Team } from "@prisma/client";
import useInvitations from "hooks/useInvitations";
import { ApiResponse } from "types";

const PendingInvitations = ({ team }: { team: Team }) => {
  const { isLoading, isError, invitations, mutateInvitation } = useInvitations(
    team.slug
  );

  if (isLoading || !invitations) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const deleteInvitation = async (invitation: Invitation) => {
    const { data: response } = await axios.delete<ApiResponse<unknown>>(
      `/api/teams/${team.slug}/invitations`,
      {
        data: {
          id: invitation.id,
        },
        validateStatus: () => true,
      }
    );

    if (response.error) {
      toast.error(response.error.message);
    }

    if (response.data) {
      mutateInvitation();
      toast.success("Invitation deleted");
    }
  };

  if (!invitations.length) {
    return null;
  }

  return (
    <Card heading="Invitations Sent">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3" colSpan={2}>
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => {
              return (
                <tr
                  key={invitation.token}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3" colSpan={2}>
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={invitation.email} />
                      <span>{invitation.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{invitation.role}</td>
                  <td className="px-6 py-3">
                    {new Date(invitation.createdAt).toDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      color="secondary"
                      onClick={() => {
                        deleteInvitation(invitation);
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default PendingInvitations;
