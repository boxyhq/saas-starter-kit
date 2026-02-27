import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

interface Props {
  teamSlug: string;
  mdrId: string;
  compact?: boolean;
}

const MdrProgressBar: React.FC<Props> = ({ teamSlug, mdrId, compact = false }) => {
  const { data } = useSWR(
    teamSlug && mdrId ? `/api/teams/${teamSlug}/mdr/${mdrId}/progress` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const progress = data?.data;
  if (!progress) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-base-300 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${progress.overallPercent === 100 ? 'bg-success' : 'bg-primary'}`}
            style={{ width: `${progress.overallPercent}%` }}
          />
        </div>
        <span className="text-xs text-base-content/50 flex-shrink-0">
          {progress.overallPercent}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Document Completeness</span>
        <span className={`text-sm font-bold ${progress.overallPercent === 100 ? 'text-success' : 'text-primary'}`}>
          {progress.overallPercent}%
        </span>
      </div>

      {/* Overall bar */}
      <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all ${progress.overallPercent === 100 ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${progress.overallPercent}%` }}
        />
      </div>

      {/* Per-section breakdown */}
      {progress.sections.filter((s: any) => s.required > 0).length > 0 && (
        <div className="space-y-2 mt-3">
          {progress.sections
            .filter((s: any) => s.required > 0)
            .map((section: any) => (
              <div key={section.sectionId} className="flex items-center gap-3 text-xs">
                <span className="w-40 truncate text-base-content/70">{section.title}</span>
                <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${section.complete ? 'bg-success' : 'bg-primary/60'}`}
                    style={{ width: `${section.percent}%` }}
                  />
                </div>
                <span className="w-16 text-right text-base-content/50">
                  {section.current}/{section.required}
                </span>
                {section.complete && <span className="text-success">✓</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MdrProgressBar;
