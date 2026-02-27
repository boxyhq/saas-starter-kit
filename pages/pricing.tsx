import { GetServerSidePropsContext } from 'next';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import PricingTable from '@/components/marketing/PricingTable';

interface Props {
  plans: any[];
  siteName: string;
  highlightPlanId: string | null;
}

const PricingPage = ({ plans, siteName, highlightPlanId }: Props) => (
  <MarketingLayout siteName={siteName}>
    <div className="pt-10">
      <PricingTable plans={plans} highlightPlanId={highlightPlanId ?? undefined} />
    </div>
  </MarketingLayout>
);

export async function getServerSideProps(_ctx: GetServerSidePropsContext) {
  const [plans, settings] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: { features: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.siteSetting.findMany({ where: { key: { in: ['site_name', 'highlight_plan_id'] } } }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return {
    props: {
      plans: JSON.parse(JSON.stringify(plans)),
      siteName: (settingsMap.site_name as string) ?? 'SaaS Platform',
      highlightPlanId: (settingsMap.highlight_plan_id as string) ?? null,
    },
  };
}

export default PricingPage;
