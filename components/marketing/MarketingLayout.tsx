import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

interface NavLink { label: string; url: string }
interface FooterLink { label: string; url: string }

interface Props {
  children: React.ReactNode;
  siteName?: string;
  navLinks?: NavLink[];
  footerLinks?: FooterLink[];
}

const MarketingLayout: React.FC<Props> = ({
  children,
  siteName,
  navLinks,
  footerLinks,
}) => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader siteName={siteName} navLinks={navLinks} />
    <main className="flex-1">{children}</main>
    <SiteFooter siteName={siteName} footerLinks={footerLinks} />
  </div>
);

export default MarketingLayout;
