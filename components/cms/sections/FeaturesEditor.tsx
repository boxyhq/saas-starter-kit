import { Button } from 'react-daisyui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

const FeaturesEditor: React.FC<Props> = ({ content, onChange }) => {
  const cards: FeatureCard[] = (content.cards as FeatureCard[]) ?? [];

  const updateCard = (index: number, patch: Partial<FeatureCard>) => {
    const updated = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...content, cards: updated });
  };

  const addCard = () => {
    onChange({ ...content, cards: [...cards, { icon: 'StarIcon', title: '', description: '' }] });
  };

  const removeCard = (index: number) => {
    onChange({ ...content, cards: cards.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label-text font-medium">Feature Cards</label>
        <Button size="xs" color="primary" onClick={addCard}>
          <PlusIcon className="h-3 w-3 mr-1" /> Add Card
        </Button>
      </div>
      {cards.length === 0 && (
        <p className="text-sm text-base-content/40 italic">No feature cards yet. Add one above.</p>
      )}
      {cards.map((card, i) => (
        <div key={i} className="border border-base-300 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-base-content/50">Card {i + 1}</span>
            <Button size="xs" color="ghost" onClick={() => removeCard(i)}>
              <TrashIcon className="h-3 w-3 text-error" />
            </Button>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs">Icon name (Heroicon)</span></label>
            <input className="input input-bordered input-sm" value={card.icon} onChange={(e) => updateCard(i, { icon: e.target.value })} placeholder="StarIcon" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs">Title</span></label>
            <input className="input input-bordered input-sm" value={card.title} onChange={(e) => updateCard(i, { title: e.target.value })} placeholder="Feature title" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs">Description</span></label>
            <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={card.description} onChange={(e) => updateCard(i, { description: e.target.value })} placeholder="Feature description" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturesEditor;
