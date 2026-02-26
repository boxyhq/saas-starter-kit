import { GetStaticProps } from 'next';
import Head from 'next/head';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import BlogCard from '@/components/marketing/BlogCard';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  seoDesc: string | null;
  publishedAt: string | null;
}

interface SiteSettings {
  siteName?: string;
  navLinks?: { label: string; url: string }[];
  footerLinks?: { label: string; url: string }[];
}

interface Props {
  posts: BlogPost[];
  settings: SiteSettings;
}

export default function BlogIndex({ posts, settings }: Props) {
  const siteName = settings.siteName ?? 'Blog';

  return (
    <>
      <Head>
        <title>Blog — {siteName}</title>
        <meta name="description" content={`Latest posts from ${siteName}`} />
      </Head>
      <MarketingLayout
        siteName={settings.siteName}
        navLinks={settings.navLinks}
        footerLinks={settings.footerLinks}
      >
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-10">Blog</h1>
            {posts.length === 0 ? (
              <p className="text-base-content/60">No posts published yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    seoDesc={post.seoDesc}
                    publishedAt={post.publishedAt}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </MarketingLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [posts, rawSettings] = await Promise.all([
    prisma.page.findMany({
      where: { status: 'PUBLISHED', template: 'BLOG_POST' },
      select: {
        id: true,
        slug: true,
        title: true,
        seoDesc: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settings: SiteSettings = {};
  for (const s of rawSettings) {
    (settings as any)[s.key] = s.value;
  }

  return {
    props: {
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        seoDesc: p.seoDesc ?? null,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      })),
      settings,
    },
    revalidate: 60,
  };
};
