interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

const field = (label: string, key: string, content: Record<string, unknown>, onChange: Props['onChange'], placeholder?: string) => (
  <div className="form-control" key={key}>
    <label className="label"><span className="label-text">{label}</span></label>
    <input
      className="input input-bordered"
      value={(content[key] as string) ?? ''}
      onChange={(e) => onChange({ ...content, [key]: e.target.value })}
      placeholder={placeholder}
    />
  </div>
);

const HeroEditor: React.FC<Props> = ({ content, onChange }) => (
  <div className="space-y-3">
    {field('Headline', 'headline', content, onChange, 'The main heading')}
    <div className="form-control">
      <label className="label"><span className="label-text">Subtext</span></label>
      <textarea
        className="textarea textarea-bordered"
        rows={3}
        value={(content.subtext as string) ?? ''}
        onChange={(e) => onChange({ ...content, subtext: e.target.value })}
        placeholder="Supporting description…"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {field('CTA 1 Label', 'cta1Label', content, onChange, 'Get Started')}
      {field('CTA 1 URL', 'cta1Url', content, onChange, '/auth/join')}
      {field('CTA 2 Label', 'cta2Label', content, onChange, 'Learn More')}
      {field('CTA 2 URL', 'cta2Url', content, onChange, '#features')}
    </div>
    {field('Background Image URL (optional)', 'bgImage', content, onChange, 'https://…')}
  </div>
);

export default HeroEditor;
