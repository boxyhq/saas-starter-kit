import { useRouter } from "next/router";
import { ReactElement } from "react";
import { useEffect } from "react";

import { NextPageWithLayout } from "types";

const Home: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  });

  return <>Home</>;
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
