import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { prisma } from '@/lib/prisma';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import RichTextRenderer from '@/components/marketing/RichTextRenderer';
import { HomeIcon, ChevronRightIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import type { JSONContent } from '@tiptap/react';

interface Props { article: any; siteName: string; }

const HelpArticlePage = ({ article, siteName }: Props) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not' | null>(null);

  const sendFeedback = async (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'not');
    await fetch(`/api/help/articles/${article.slug}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful }),
    });
  };

  return (
    <MarketingLayout siteName={siteName}>
      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-base-content/50 mb-6 flex-wrap">
          <Link href="/help" className="hover:text-base-content flex items-center gap-1"><HomeIcon className="h-4 w-4" />Help</Link>
          <ChevronRightIcon className="h-3 w-3" />
          {article.category && (
            <>
              <Link href={`/help/${article.category.slug}`} className="hover:text-base-content">{article.category.title}</Link>
              <ChevronRightIcon className="h-3 w-3" />
            </>
          )}
          <span className="text-base-content font-medium">{article.title}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>

        <div className="prose max-w-none">
          <RichTextRenderer content={article.content as JSONContent} />
        </div>

        {/* Feedback */}
        <div className="mt-12 pt-8 border-t border-base-300">
          <p className="text-sm font-medium mb-3">Was this article helpful?</p>
          {feedback ? (
            <p className="text-sm text-base-content/60">Thanks for your feedback!</p>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => sendFeedback(true)} className="btn btn-sm btn-outline gap-2">
                <HandThumbUpIcon className="h-4 w-4" /> Yes
              </button>
              <button onClick={() => sendFeedback(false)} className="btn btn-sm btn-outline gap-2">
                <HandThumbDownIcon className="h-4 w-4" /> No
              </button>
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
};

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const { categorySlug, articleSlug } = params as { categorySlug: string; articleSlug: string };
  const [article, settings] = await Promise.all([
    prisma.helpArticle.findUnique({
      where: { slug: articleSlug },
      include: { category: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.siteSetting.findMany({ where: { key: 'site_name' } }),
  ]);
  if (!article || article.status !== 'PUBLISHED') return { notFound: true };
  // Increment views
  prisma.helpArticle.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
      siteName: (settingsMap.site_name as string) ?? 'SaaS Platform',
    },
  };
}

export default HelpArticlePage;
