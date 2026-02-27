import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';

interface PlanFeature {
  feature: string;
  enabled: boolean;
  limit: number | null;
}

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  stripePriceId?: string | null;
  sortOrder: number;
  features: PlanFeature[];
}

interface Props {
  plans: Plan[];
  highlightPlanId?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  mdr_projects: 'MDR Projects',
  mdr_members: 'Team Members per Project',
  mdr_storage_gb: 'Storage (GB)',
  mdr_transmittals: 'Transmittals',
  mdr_share_links: 'Share Links',
  mdr_templates: 'Document Templates',
  mdr_export: 'Register Export (.xlsx)',
  mdr_email_inbox: 'Email Inbox',
  mdr_pdf_compilation: 'PDF Compilation',
  api_access: 'API Access',
  custom_branding: 'Custom Branding',
  audit_log: 'Audit Log',
  sso: 'SSO / SAML',
  priority_support: 'Priority Support',
};

const formatLimit = (feature: string, limit: number | null) => {
  if (limit === null || limit === -1) return 'Unlimited';
  if (feature.endsWith('_gb')) return `${limit} GB`;
  return String(limit);
};

const PricingTable: React.FC<Props> = ({ plans, highlightPlanId }) => {
  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="py-20 px-6 bg-base-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-base-content/60 text-lg">Choose the plan that works for your team</p>
        </div>

        <div className={`grid gap-8 ${sorted.length <= 3 ? `md:grid-cols-${sorted.length}` : 'md:grid-cols-3'}`}>
          {sorted.map((plan) => {
            const isHighlighted = plan.id === highlightPlanId;
            return (
              <div
                key={plan.id}
                className={`card shadow-lg border-2 ${isHighlighted ? 'border-primary bg-primary/5' : 'border-base-200 bg-base-100'}`}
              >
                <div className="card-body">
                  {isHighlighted && (
                    <div className="badge badge-primary badge-sm mb-2">Most Popular</div>
                  )}
                  <h3 className="card-title text-xl">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-base-content/60 mb-4">{plan.description}</p>
                  )}

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features
                      .filter((f) => f.enabled)
                      .map((f) => (
                        <li key={f.feature} className="flex items-start gap-2 text-sm">
                          <CheckIcon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-medium">
                              {f.limit !== null && f.limit !== -1
                                ? `${formatLimit(f.feature, f.limit)} `
                                : ''}
                            </span>
                            {FEATURE_LABELS[f.feature] ?? f.feature.replace(/_/g, ' ')}
                            {f.limit === -1 && ' (unlimited)'}
                          </span>
                        </li>
                      ))}
                  </ul>

                  <div className="card-actions">
                    {plan.stripePriceId ? (
                      <Link
                        href={`/api/checkout?priceId=${plan.stripePriceId}`}
                        className={`btn w-full ${isHighlighted ? 'btn-primary' : 'btn-outline'}`}
                      >
                        Get started
                      </Link>
                    ) : (
                      <Link href="/auth/join" className={`btn w-full ${isHighlighted ? 'btn-primary' : 'btn-outline'}`}>
                        Get started
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-base-content/40 mt-10">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
};

export default PricingTable;
