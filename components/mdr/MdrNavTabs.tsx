import Link from 'next/link';
import { useTranslation } from 'next-i18next';

interface MdrNavTabsProps {
  activeTab:
    | 'overview'
    | 'structure'
    | 'documents'
    | 'compile'
    | 'members'
    | 'transmittals'
    | 'share'
    | 'inbox'
    | 'templates';
  teamSlug: string;
  mdrId: string;
  projectName?: string;
}

const MdrNavTabs = ({
  activeTab,
  teamSlug,
  mdrId,
  projectName,
}: MdrNavTabsProps) => {
  const { t } = useTranslation('common');
  const base = `/teams/${teamSlug}/mdr/${mdrId}`;

  const tabs = [
    { key: 'overview', label: 'Overview', href: base },
    { key: 'structure', label: t('mdr-structure'), href: `${base}/structure` },
    {
      key: 'documents',
      label: t('mdr-documents'),
      href: `${base}/documents`,
    },
    { key: 'compile', label: t('mdr-compile'), href: `${base}/compile` },
    {
      key: 'transmittals',
      label: t('mdr-transmittals'),
      href: `${base}/transmittals`,
    },
    { key: 'share', label: t('mdr-share'), href: `${base}/share` },
    { key: 'inbox', label: t('mdr-inbox'), href: `${base}/inbox` },
    { key: 'members', label: t('mdr-members'), href: `${base}/members` },
    {
      key: 'templates',
      label: t('mdr-templates'),
      href: `${base}/templates`,
    },
  ];

  return (
    <div>
      {projectName && (
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/teams/${teamSlug}/mdr`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            MDR Projects
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-medium">{projectName}</span>
        </div>
      )}
      <div className="tabs tabs-bordered overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`tab tab-bordered whitespace-nowrap ${
              activeTab === tab.key ? 'tab-active' : ''
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MdrNavTabs;
