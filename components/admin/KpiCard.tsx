interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subLabel,
  trend,
  colorClass = 'text-base-content',
}) => {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : '';

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-5">
        <p className="text-sm text-base-content/60 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${colorClass}`}>
          {trendIcon && <span className={`text-lg mr-1 ${trendColor}`}>{trendIcon}</span>}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subLabel && (
          <p className="text-xs text-base-content/40 mt-1">{subLabel}</p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
