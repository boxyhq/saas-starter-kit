import type { NextPageWithLayout } from "types";
import type { ReactElement } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import FeatureSection from "@/components/ui/landing/FeatureSection";
import HeroSection from "@/components/ui/landing/HeroSection";
import PricingSection from "@/components/ui/landing/PricingSection";
import FAQSection from "@/components/ui/landing/FAQSection";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext } from "next";

const Home: NextPageWithLayout = () => {
  const { t } = useTranslation("common");

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
              <a>{t("sign-up")}</a>
            </li>
            <li>
              <a>{t("item-3")}</a>
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

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      // Will be passed to the page component as props
    },
  };
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
