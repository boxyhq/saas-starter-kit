import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { Button, Typography } from "@supabase/ui";
import React from "react";

import { Card, LetterAvatar, InviteMember } from "@components/ui";
import { inferSSRProps } from "@lib/inferSSRProps";
import tenants from "models/tenants";
import { availableRoles } from "@lib/roles";

const Members: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  organization,
  availableRoles,
  members,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <Typography.Title level={4}>{organization.name}</Typography.Title>
        <Button
          htmlType="button"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          Invite Members
        </Button>
      </div>
      <Card heading="Members">
        <Card.Body>
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                return (
                  <tr
                    key={member.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <LetterAvatar name={member.user.name} />
                        <span>{member.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">{member.user.email}</td>
                    <td className="px-6 py-3">{member.role}</td>
                    <td className="px-6 py-3">
                      {member.user.createdAt.toISOString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card.Body>
      </Card>
      <InviteMember
        visible={visible}
        setVisible={setVisible}
        availableRoles={availableRoles}
        organization={organization}
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const slug = context.query.slug as string;

  const organization = await tenants.getTenantBySlug(slug);

  if (!organization) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      organization,
      availableRoles,
      members: await tenants.getTenantMembers(slug),
    },
  };
};

export default Members;
