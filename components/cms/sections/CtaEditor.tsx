interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

const CtaEditor: React.FC<Props> = ({ content, onChange }) => {
  const update = (key: string, value: string) => onChange({ ...content, [key]: value });

  return (
    <div className="space-y-3">
      <div className="form-control">
        <label className="label"><span className="label-text">Headline</span></label>
        <input className="input input-bordered" value={(content.headline as string) ?? ''} onChange={(e) => update('headline', e.target.value)} placeholder="Ready to get started?" />
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Subtext</span></label>
        <textarea className="textarea textarea-bordered" rows={2} value={(content.subtext as string) ?? ''} onChange={(e) => update('subtext', e.target.value)} placeholder="Join thousands of teams…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Button Label</span></label>
          <input className="input input-bordered" value={(content.buttonLabel as string) ?? ''} onChange={(e) => update('buttonLabel', e.target.value)} placeholder="Sign Up Free" />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Button URL</span></label>
          <input className="input input-bordered" value={(content.buttonUrl as string) ?? ''} onChange={(e) => update('buttonUrl', e.target.value)} placeholder="/auth/join" />
        </div>
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Background Colour (hex)</span></label>
        <div className="flex items-center gap-2">
          <input type="color" value={(content.bgColor as string) ?? '#1a56db'} onChange={(e) => update('bgColor', e.target.value)} className="w-10 h-10 rounded border border-base-300 cursor-pointer" />
          <input className="input input-bordered font-mono w-32" value={(content.bgColor as string) ?? '#1a56db'} onChange={(e) => update('bgColor', e.target.value)} placeholder="#1a56db" />
        </div>
      </div>
    </div>
  );
};

export default CtaEditor;
