import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  category: any;
  articles: any[];
  siteName: string;
}

const HelpCategoryPage = ({ category, articles, siteName }: Props) => (
  <MarketingLayout siteName={siteName}>
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-base-content/50 mb-6">
        <Link href="/help" className="hover:text-base-content flex items-center gap-1"><HomeIcon className="h-4 w-4" />Help</Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-base-content font-medium">{category.title}</span>
      </nav>

      <div className="flex items-start gap-4 mb-8">
        {category.icon && <span className="text-4xl">{category.icon}</span>}
        <div>
          <h1 className="text-3xl font-bold">{category.title}</h1>
          {category.description && <p className="text-base-content/60 mt-1">{category.description}</p>}
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-base-content/50">No articles in this category yet.</p>
      ) : (
        <ul className="space-y-3">
          {articles.map((a: any) => (
            <li key={a.id} className="card bg-base-100 border border-base-200 hover:border-primary transition-colors">
              <Link href={`/help/${category.slug}/${a.slug}`} className="card-body py-4">
                <h3 className="font-semibold">{a.title}</h3>
                {a.excerpt && <p className="text-sm text-base-content/60">{a.excerpt}</p>}
                <p className="text-xs text-base-content/40">{a.views} views</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  </MarketingLayout>
);

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const { categorySlug } = params as { categorySlug: string };
  const [category, settings] = await Promise.all([
    prisma.helpCategory.findUnique({
      where: { slug: categorySlug },
      include: { articles: { where: { status: 'PUBLISHED' }, orderBy: { title: 'asc' } } },
    }),
    prisma.siteSetting.findMany({ where: { key: 'site_name' } }),
  ]);
  if (!category) return { notFound: true };
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    props: {
      category: JSON.parse(JSON.stringify({ ...category, articles: undefined })),
      articles: JSON.parse(JSON.stringify(category.articles)),
      siteName: (settingsMap.site_name as string) ?? 'SaaS Platform',
    },
  };
}

export default HelpCategoryPage;
