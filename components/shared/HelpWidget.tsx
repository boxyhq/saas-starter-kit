import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Article { id: string; title: string; excerpt: string | null; slug: string; }

const HelpWidget = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  // Load context articles when opened
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/help/context?pathname=${encodeURIComponent(router.pathname)}`)
      .then((r) => r.json())
      .then((json) => setArticles(json.data?.articles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, router.pathname]);

  // Debounced search
  useEffect(() => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/help/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json.data?.results ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const displayed = q.length >= 2 ? searchResults : articles;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn btn-circle btn-primary shadow-lg"
        aria-label="Help"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-base-100 border border-base-300 rounded-2xl shadow-2xl flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <span className="font-semibold">Help Centre</span>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs btn-circle">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search help articles…"
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {loading && <p className="text-xs text-base-content/50 text-center py-4">Loading…</p>}
            {!loading && displayed.length === 0 && (
              <p className="text-xs text-base-content/50 text-center py-4">
                {q.length >= 2 ? 'No results found' : 'No contextual articles'}
              </p>
            )}
            {displayed.map((a) => (
              <Link
                key={a.id}
                href={`/help/${a.slug}`}
                target="_blank"
                className="block p-2 rounded-lg hover:bg-base-200 transition-colors"
                onClick={() => setOpen(false)}
              >
                <p className="text-sm font-medium">{a.title}</p>
                {a.excerpt && <p className="text-xs text-base-content/50 line-clamp-2">{a.excerpt}</p>}
              </Link>
            ))}
          </div>

          <div className="p-3 border-t border-base-300">
            <Link href="/help" className="btn btn-ghost btn-sm w-full">Browse all articles</Link>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpWidget;
