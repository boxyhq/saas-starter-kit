import type { NextPageWithLayout } from "types";
import type { ReactElement } from "react";
import Link from "next/link";

import FeatureSection from "@/components/ui/landing/FeatureSection";
import HeroSection from "@/components/ui/landing/HeroSection";
import PricingSection from "@/components/ui/landing/PricingSection";
import FAQSection from "@/components/ui/landing/FAQSection";

const Home: NextPageWithLayout = () => {
  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <Link href="/">
            <a className="btn-ghost btn text-xl normal-case">BoxyHQ</a>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <a>Sign up</a>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>
      </div>
      <HeroSection />
      <div className="divider"></div>
      <FeatureSection />
      <div className="divider"></div>
      <PricingSection />
      <div className="divider"></div>
      <FAQSection />
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
