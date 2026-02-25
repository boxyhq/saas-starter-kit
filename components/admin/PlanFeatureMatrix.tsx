import { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';

export interface FeatureRow {
  feature: string;
  enabled: boolean;
  limit: number | null;
}

interface FeatureDef {
  key: string;
  label: string;
  hasLimit: boolean;
  group: 'MDR' | 'Team' | 'Advanced';
}

const FEATURE_DEFS: FeatureDef[] = [
  // MDR group
  { key: 'mdr_projects',      label: 'MDR Projects',               hasLimit: true,  group: 'MDR' },
  { key: 'compilation',       label: 'Compile to PDF',              hasLimit: false, group: 'MDR' },
  { key: 'branding',          label: 'Custom Branding',             hasLimit: false, group: 'MDR' },
  { key: 'transmittals',      label: 'Transmittal System',          hasLimit: false, group: 'MDR' },
  { key: 'share_links',       label: 'Public Share Links',          hasLimit: false, group: 'MDR' },
  { key: 'version_history',   label: 'Document Version History',    hasLimit: false, group: 'MDR' },
  { key: 'export_excel',      label: 'Excel/CSV Export',            hasLimit: false, group: 'MDR' },
  { key: 'cross_mdr_sharing', label: 'Cross-MDR Section Sharing',   hasLimit: false, group: 'MDR' },
  { key: 'email_inbox',       label: 'Email Inbox',                 hasLimit: false, group: 'MDR' },
  { key: 'file_conversion',   label: 'DOCX/XLSX → PDF Conversion',  hasLimit: false, group: 'MDR' },
  { key: 'storage_gb',        label: 'Storage (GB)',                 hasLimit: true,  group: 'MDR' },
  // Team group
  { key: 'team_members',      label: 'Team Members',                hasLimit: true,  group: 'Team' },
  { key: 'api_keys',          label: 'API Keys',                    hasLimit: false, group: 'Team' },
  { key: 'webhooks',          label: 'Outbound Webhooks',           hasLimit: false, group: 'Team' },
  { key: 'audit_log',         label: 'Audit Log',                   hasLimit: false, group: 'Team' },
  // Advanced group
  { key: 'sso',               label: 'SAML/OIDC SSO',               hasLimit: false, group: 'Advanced' },
  { key: 'dsync',             label: 'SCIM Directory Sync',          hasLimit: false, group: 'Advanced' },
];

interface Props {
  features: FeatureRow[];
  onChange: (features: FeatureRow[]) => void;
}

const PlanFeatureMatrix: React.FC<Props> = ({ features, onChange }) => {
  const [rows, setRows] = useState<FeatureRow[]>([]);

  useEffect(() => {
    // Merge provided features with full feature definition list (fill missing with disabled)
    const merged = FEATURE_DEFS.map((def) => {
      const existing = features.find((f) => f.feature === def.key);
      return existing ?? { feature: def.key, enabled: false, limit: null };
    });
    setRows(merged);
  }, [features]);

  const update = (key: string, patch: Partial<FeatureRow>) => {
    const updated = rows.map((r) => (r.feature === key ? { ...r, ...patch } : r));
    setRows(updated);
    onChange(updated);
  };

  const groups: Array<'MDR' | 'Team' | 'Advanced'> = ['MDR', 'Team', 'Advanced'];

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const defs = FEATURE_DEFS.filter((d) => d.group === group);
        return (
          <div key={group}>
            <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
              {group}
            </h4>
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <table className="table table-sm w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-64">Feature</th>
                    <th className="w-24 text-center">Enabled</th>
                    <th>Limit (blank = not applicable, -1 = unlimited)</th>
                  </tr>
                </thead>
                <tbody>
                  {defs.map((def) => {
                    const row = rows.find((r) => r.feature === def.key) ?? {
                      feature: def.key, enabled: false, limit: null,
                    };
                    return (
                      <tr key={def.key}>
                        <td className="font-medium text-sm">{def.label}</td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="toggle toggle-sm toggle-primary"
                            checked={row.enabled}
                            onChange={(e) => update(def.key, { enabled: e.target.checked })}
                          />
                        </td>
                        <td>
                          {def.hasLimit ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input input-bordered input-sm w-28"
                                value={row.limit === null ? '' : row.limit}
                                disabled={!row.enabled}
                                min={-1}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : parseInt(e.target.value);
                                  update(def.key, { limit: val });
                                }}
                                placeholder="e.g. 5"
                              />
                              <Button
                                size="xs"
                                color="ghost"
                                className="text-xs"
                                disabled={!row.enabled}
                                onClick={() => update(def.key, { limit: -1 })}
                                title="Set unlimited"
                              >
                                ∞
                              </Button>
                              {row.limit === -1 && (
                                <span className="text-xs text-success font-medium">Unlimited</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-base-content/40">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanFeatureMatrix;
