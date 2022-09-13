import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";

import {
  InviteMember,
  InvitationsList,
  MembersList,
} from "@/components/interfaces/Member";
import { inferSSRProps } from "@/lib/inferSSRProps";
import { availableRoles } from "@/lib/roles";
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
        <h4>{organization.name}</h4>
        <Button
          size="sm"
          color="primary"
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
