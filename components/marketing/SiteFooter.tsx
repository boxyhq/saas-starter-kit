import Link from 'next/link';

interface FooterLink {
  label: string;
  url: string;
}

interface Props {
  siteName?: string;
  footerLinks?: FooterLink[];
}

const SiteFooter: React.FC<Props> = ({ siteName = 'SaaS', footerLinks = [] }) => (
  <footer className="border-t border-base-300 bg-base-100 py-12 px-6 mt-16">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="text-base-content/60 text-sm">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </span>
        {footerLinks.length > 0 && (
          <nav className="flex flex-wrap gap-6">
            {footerLinks.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="text-sm text-base-content/60 hover:text-base-content transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  </footer>
);

export default SiteFooter;
