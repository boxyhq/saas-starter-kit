import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavLink {
  label: string;
  url: string;
}

interface Props {
  siteName?: string;
  navLinks?: NavLink[];
}

const SiteHeader: React.FC<Props> = ({ siteName = 'SaaS', navLinks = [] }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-shadow ${
        scrolled ? 'bg-base-100/95 backdrop-blur shadow-sm border-base-300' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
          {siteName}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.url}
              className="text-sm text-base-content/70 hover:text-base-content transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn btn-ghost btn-sm">
            Sign In
          </Link>
          <Link href="/auth/join" className="btn btn-primary btn-sm">
            Sign Up Free
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
