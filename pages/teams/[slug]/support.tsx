import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Loading } from '@/components/shared';
import env from '@/lib/env';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SupportPage = () => {
  const { team } = useTeam();
  const [q, setQ] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const { data: searchData, isLoading: searching } = useSWR(
    searchQ.length >= 2 ? `/api/help/search?q=${encodeURIComponent(searchQ)}` : null,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQ(q);
  };

  const results = searchData?.data?.results ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Support & Help</h1>
        <p className="text-base-content/60 text-sm">Search our knowledge base or browse articles below.</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search help articles…"
          className="input input-bordered flex-1"
        />
        <button type="submit" className="btn btn-primary">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>

      {/* Search results */}
      {searchQ && (
        <div>
          <h2 className="font-semibold mb-3">Results for &ldquo;{searchQ}&rdquo;</h2>
          {searching && <Loading />}
          {!searching && results.length === 0 && <p className="text-base-content/50 text-sm">No results found.</p>}
          <ul className="space-y-2">
            {results.map((a: any) => (
              <li key={a.id}>
                <Link href={`/help/${a.slug}`} className="link font-medium">{a.title}</Link>
                {a.excerpt && <p className="text-sm text-base-content/50">{a.excerpt}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Browse all */}
      {!searchQ && (
        <div>
          <h2 className="font-semibold mb-3">Browse Knowledge Base</h2>
          <Link href="/help" className="btn btn-outline btn-sm mb-4">Open full Help Centre →</Link>
        </div>
      )}

      {/* Contact support */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h3 className="font-semibold">Still need help?</h3>
          <p className="text-sm text-base-content/60">
            Our support team is here to help. Include your team slug (<code className="bg-base-300 px-1 rounded">{team?.slug}</code>) when contacting us.
          </p>
          <div className="card-actions mt-2">
            <a href="mailto:support@example.com" className="btn btn-primary btn-sm">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default SupportPage;
