import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import SectionRenderer from '@/components/marketing/SectionRenderer';

interface PageSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDesc: string | null;
  sections: PageSection[];
}

interface SiteSettings {
  siteName?: string;
  navLinks?: { label: string; url: string }[];
  footerLinks?: { label: string; url: string }[];
}

interface Props {
  page: PageData;
  settings: SiteSettings;
}

export default function CmsPage({ page, settings }: Props) {
  const title = page.seoTitle || page.title;

  return (
    <>
      <Head>
        <title>{title}</title>
        {page.seoDesc && <meta name="description" content={page.seoDesc} />}
      </Head>
      <MarketingLayout
        siteName={settings.siteName}
        navLinks={settings.navLinks}
        footerLinks={settings.footerLinks}
      >
        <SectionRenderer sections={page.sections} />
      </MarketingLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await prisma.page.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  });

  return {
    paths: pages.map((p) => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;

  const [page, rawSettings] = await Promise.all([
    prisma.page.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { sections: { orderBy: { order: 'asc' } } },
    }),
    prisma.siteSetting.findMany(),
  ]);

  if (!page) {
    return { notFound: true };
  }

  const settings: SiteSettings = {};
  for (const s of rawSettings) {
    (settings as any)[s.key] = s.value;
  }

  return {
    props: {
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        seoTitle: page.seoTitle ?? null,
        seoDesc: page.seoDesc ?? null,
        sections: page.sections.map((s) => ({
          id: s.id,
          type: s.type,
          content: s.content as Record<string, unknown>,
          order: s.order,
        })),
      },
      settings,
    },
    revalidate: 60,
  };
};
