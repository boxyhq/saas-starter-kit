import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string; slug: string; title: string; description: string | null; icon: string | null;
  _count: { articles: number };
}
interface Article { id: string; slug: string; title: string; excerpt: string | null; }
interface Props { categories: Category[]; popular: Article[]; siteName: string; }

const HelpHomePage = ({ categories, popular, siteName }: Props) => {
  const router = useRouter();
  const [q, setQ] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/help/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <MarketingLayout siteName={siteName}>
      {/* Hero */}
      <div className="bg-primary text-primary-content py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
        <form onSubmit={handleSearch} className="flex max-w-lg mx-auto gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search help articles…"
            className="input input-lg flex-1 text-base-content"
          />
          <button type="submit" className="btn btn-lg btn-secondary">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold mb-8">Browse Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/help/${cat.slug}`} className="card bg-base-100 border border-base-200 hover:border-primary hover:shadow-md transition-all">
              <div className="card-body">
                {cat.icon && <div className="text-3xl mb-2">{cat.icon}</div>}
                <h3 className="card-title text-base">{cat.title}</h3>
                {cat.description && <p className="text-sm text-base-content/60">{cat.description}</p>}
                <p className="text-xs text-base-content/40 mt-2">{cat._count.articles} articles</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Articles */}
        {popular.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <ul className="space-y-2">
              {popular.map((a) => (
                <li key={a.id}>
                  <Link href={`/help/${a.slug}`} className="link link-hover">
                    {a.title}
                  </Link>
                  {a.excerpt && <p className="text-sm text-base-content/50">{a.excerpt}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MarketingLayout>
  );
};

export async function getServerSideProps(_ctx: GetServerSidePropsContext) {
  const [categories, popular, settings] = await Promise.all([
    prisma.helpCategory.findMany({
      where: { parentId: null },
      include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { order: 'asc' },
    }),
    prisma.helpArticle.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, excerpt: true },
      orderBy: { views: 'desc' },
      take: 6,
    }),
    prisma.siteSetting.findMany({ where: { key: 'site_name' } }),
  ]);
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      popular: JSON.parse(JSON.stringify(popular)),
      siteName: (settingsMap.site_name as string) ?? 'SaaS Platform',
    },
  };
}

export default HelpHomePage;
