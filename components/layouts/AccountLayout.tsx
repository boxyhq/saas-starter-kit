import React from "react";

import { Sidebar, Navbar } from "@/components/ui";
import { Tenant } from "@prisma/client";
import { get } from "@/lib/fetch";

export default function AccountLayout({ children }: Props) {
  const [tenants, setTenants] = React.useState<Tenant[] | null>(null);

  React.useEffect(() => {
    const getTenants = async () => {
      const { data: tenants } = await get<Tenant[]>("/api/organizations");

      setTenants(tenants);
    };

    getTenants();
  }, []);

  if (!tenants) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="flex overflow-hidden pt-16">
        <Sidebar tenants={tenants} />
        <div className="relative h-full w-full overflow-y-auto  lg:ml-64">
          <main>
            <div className="flex h-screen w-full justify-center">
              <div className="w-3/4 px-6 py-6 ">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

type Props = {
  children: React.ReactNode;
};
