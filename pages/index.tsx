import { ReactElement } from "react";
import { Link, Navbar } from "react-daisyui";
import FeatureSection  from "@/components/ui/FeatureSection";
import HeroSection from "@/components/ui/HeroSection";

import { NextPageWithLayout } from "types";

const Home: NextPageWithLayout = () => {
  return (
    <div className="bg-base-100">
      <Navbar>
        <img className="w-10" src="https://boxyhq.com/img/logo.png" alt="BoxyHQ" />
        <Link className="text-xl normal-case font-bold p-2" color="ghost" href="/">
          BoxyHQ
        </Link>
      </Navbar>
      <HeroSection/>
      <FeatureSection/>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
