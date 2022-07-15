import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { Button, Typography } from "@supabase/ui";
import React from "react";

import { InviteMember, InvitationsList, MembersList } from "@components/ui";
import { inferSSRProps } from "@lib/inferSSRProps";
import { availableRoles } from "@lib/roles";
import tenants from "models/tenants";

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
      <InviteMember
        visible={visible}
        setVisible={setVisible}
        availableRoles={availableRoles}
        organization={organization}
      />
      <MembersList members={members} />
      <InvitationsList organization={organization} />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { slug } = context.query;

  const organization = await tenants.getTenant({ slug: slug as string });

  if (!organization) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      organization,
      availableRoles,
      members: await tenants.getTenantMembers(slug as string),
    },
  };
};

export default Members;
