import { useSession } from "next-auth/react";

import type { NextPageWithLayout } from "types";
import { Card } from "@/components/ui";

const Dashboard: NextPageWithLayout = () => {
  const { data: session } = useSession();

  return (
    <Card heading="Dashboard">
      <Card.Body>
        <div className="p-3">
          <p className="text-sm">
            {`Hi, ${session?.user.name} You have logged in using ${session?.user.email}`}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;
