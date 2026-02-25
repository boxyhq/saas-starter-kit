import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Input, Select } from 'react-daisyui';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const MdrBrandingPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [placements, setPlacements] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#1a56db');
  const [saving, setSaving] = useState(false);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: brandingData, mutate: mutateBranding } = useSWR(
    team?.slug ? `/api/teams/${team.slug}/branding` : null,
    fetcher,
    {
      onSuccess: (d) => {
        if (d?.data) {
          const b = d.data;
          setPlacements(b.logoPlacements ? JSON.parse(b.logoPlacements) : []);
          if (b.primaryColor) setPrimaryColor(b.primaryColor);
          if (b.logoUrl) setLogoPreview(b.logoUrl);
        }
      },
    }
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  const project = projectData?.data;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const togglePlacement = (p: string) => {
    setPlacements((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setUploading(true);
    try {
      const urlRes = await fetch(`/api/teams/${team.slug}/branding/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: logoFile.type, filename: logoFile.name }),
      });
      const urlJson = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlJson.error?.message || 'Failed to get upload URL');

      const { uploadUrl, s3Key } = urlJson.data;
      await fetch(uploadUrl, { method: 'PUT', body: logoFile, headers: { 'Content-Type': logoFile.type } });
      await fetch(`/api/teams/${team.slug}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoS3Key: s3Key }),
      });
      toast.success('Logo uploaded!');
      mutateBranding();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoPlacements: JSON.stringify(placements), primaryColor }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Save failed');
      toast.success('Branding saved!');
      mutateBranding();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="branding"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body space-y-6">
          <h2 className="card-title text-lg">{t('mdr-branding')}</h2>
          <p className="text-sm text-base-content/60">
            Customise the cover page, header, and footer of compiled MDR PDFs with your logo and brand colours.
          </p>

          {/* Logo upload */}
          <div className="space-y-3">
            <label className="label"><span className="label-text font-medium">Team Logo</span></label>
            {logoPreview && (
              <div className="w-48 h-24 border border-base-300 rounded-lg flex items-center justify-center overflow-hidden bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain p-2" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="file-input file-input-bordered file-input-sm"
                onChange={handleFileChange}
              />
              <Button
                size="sm"
                color="primary"
                onClick={handleLogoUpload}
                disabled={!logoFile || uploading}
                loading={uploading}
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>

          {/* Logo placement */}
          <div className="space-y-2">
            <label className="label"><span className="label-text font-medium">Logo Placement</span></label>
            <div className="flex gap-4">
              {['cover', 'header', 'footer'].map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={placements.includes(p)}
                    onChange={() => togglePlacement(p)}
                  />
                  <span className="text-sm capitalize">{p} page</span>
                </label>
              ))}
            </div>
          </div>

          {/* Primary colour */}
          <div className="space-y-2">
            <label className="label"><span className="label-text font-medium">Primary Colour</span></label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded border border-base-300 cursor-pointer"
              />
              <Input
                size="sm"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#1a56db"
                className="w-32 font-mono"
              />
              <span className="text-sm text-base-content/60">Used for section divider backgrounds and heading text in generated pages.</span>
            </div>
          </div>

          <div className="card-actions justify-end">
            <Button color="primary" onClick={handleSave} disabled={saving} loading={saving}>
              Save Branding
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  if (!env.teamFeatures.mdr) {
    return { notFound: true };
  }
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default MdrBrandingPage;
