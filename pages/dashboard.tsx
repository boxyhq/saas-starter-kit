import { useSession } from "next-auth/react";

import type { NextPageWithLayout } from "types";
import { Card } from "@/components/ui";
import { useTranslation } from "next-i18next";

const Dashboard: NextPageWithLayout = () => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  return (
    <Card heading="Dashboard">
      <Card.Body>
        <div className="p-3">
          <p className="text-sm">
            {`${t("hi")}, ${session?.user.name} ${t("logged-in-using")} ${
              session?.user.email
            }`}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;
