import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";

import { Loading, Error } from "@/components/ui";
import { Card } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import { ConfigureSAML } from "@/components/interfaces/SAML";
import useSAMLConfig from "hooks/useSAMLConfig";
import useTeam from "hooks/useTeam";

const TeamSSO: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [visible, setVisible] = useState(false);

  const { isLoading, isError, team } = useTeam(slug as string);
  const { samlConfig } = useSAMLConfig(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const samlConfigExists = samlConfig && "idpMetadata" in samlConfig.config;

  return (
    <>
      <h3 className="text-2xl font-bold">{team.name}</h3>
      <TeamTab team={team} activeTab="saml" />
      <Card heading="SAML Single Sign-On">
        <Card.Body className="px-3 py-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">
              Allow team members to login using an Identity Provider.
            </p>
            <Button
              size="sm"
              onClick={() => setVisible(!visible)}
              variant="outline"
              color="secondary"
            >
              Configure
            </Button>
          </div>
          {samlConfigExists && (
            <div className="flex flex-col justify-between space-y-2 border-t text-sm">
              <p className="mt-3 text-sm">
                Identity Provider will ask you for the following information to
                configure your SAML app.
              </p>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Entity ID</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  defaultValue={samlConfig.issuer}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">ACS URL</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  defaultValue={samlConfig.acs}
                />
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
      <ConfigureSAML team={team} visible={visible} setVisible={setVisible} />
    </>
  );
};

export default TeamSSO;
