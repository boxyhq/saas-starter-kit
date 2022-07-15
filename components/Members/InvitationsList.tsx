import { ApiResponse } from "types";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@supabase/ui";
import useSWR, { useSWRConfig } from "swr";
import axios from "axios";

import fetcher from "@lib/fetcher";
import { Card, LetterAvatar } from "@components/ui";
import { Tenant, Invitation } from "@prisma/client";

const InvitationsList = ({ organization }: { organization: Tenant }) => {
  const { mutate } = useSWRConfig();
  const url = `/api/organizations/${organization.slug}/invitations`;

  const { data } = useSWR<ApiResponse<Invitation[]>>(url, fetcher);

  const invitations = data?.data || [];

  const deleteInvitation = async (invitation: Invitation) => {
    const { data: response } = await axios.delete<ApiResponse<unknown>>(url, {
      data: {
        invitationToken: invitation.token,
      },
      validateStatus: () => true,
    });

    mutate(url);

    if (response.error) {
      toast.error(response.error.message);
    }

    if (response.data) {
      toast.success("Invitation deleted");
    }
  };

  return (
    <Card heading="Sent Invitations">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => {
              return (
                <tr
                  key={invitation.token}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={invitation.email} />
                      <span>{invitation.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{invitation.role}</td>
                  <td className="px-6 py-3">{invitation.createdAt}</td>
                  <td className="px-6 py-3">
                    <Button
                      danger
                      type="default"
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

export default InvitationsList;
