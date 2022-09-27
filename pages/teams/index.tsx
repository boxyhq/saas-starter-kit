import type { NextPageWithLayout } from "types";
import { Button } from "react-daisyui";
import { useState } from "react";

import { CreateTeam, Teams } from "@/components/interfaces/Team";

const AllTeams: NextPageWithLayout = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h4>All Teams</h4>
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          Create Team
        </Button>
      </div>
      <CreateTeam visible={visible} setVisible={setVisible} />
      <Teams />
    </>
  );
};

export default AllTeams;
