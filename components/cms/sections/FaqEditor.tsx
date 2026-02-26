import { Button } from 'react-daisyui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

const FaqEditor: React.FC<Props> = ({ content, onChange }) => {
  const items: FaqItem[] = (content.items as FaqItem[]) ?? [];

  const update = (index: number, patch: Partial<FaqItem>) => {
    onChange({ ...content, items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  };

  const add = () => onChange({ ...content, items: [...items, { question: '', answer: '' }] });
  const remove = (i: number) => onChange({ ...content, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label-text font-medium">FAQ Items</label>
        <Button size="xs" color="primary" onClick={add}>
          <PlusIcon className="h-3 w-3 mr-1" /> Add Q&A
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-base-content/40 italic">No FAQ items yet.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="border border-base-300 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-base-content/50">Item {i + 1}</span>
            <Button size="xs" color="ghost" onClick={() => remove(i)}>
              <TrashIcon className="h-3 w-3 text-error" />
            </Button>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs">Question</span></label>
            <input className="input input-bordered input-sm" value={item.question} onChange={(e) => update(i, { question: e.target.value })} placeholder="How does it work?" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs">Answer</span></label>
            <textarea className="textarea textarea-bordered textarea-sm" rows={3} value={item.answer} onChange={(e) => update(i, { answer: e.target.value })} placeholder="It works by…" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqEditor;
