import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import RichtextEditor from './RichtextEditor';
import HeroEditor from './HeroEditor';
import FeaturesEditor from './FeaturesEditor';
import CtaEditor from './CtaEditor';
import FaqEditor from './FaqEditor';

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

interface Props {
  section: Section | null;
  pageId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  richtext: 'Rich Text',
  hero: 'Hero Banner',
  features_grid: 'Features Grid',
  cta: 'Call to Action',
  faq: 'FAQ',
  testimonials: 'Testimonials',
};

const SectionEditorModal: React.FC<Props> = ({ section, pageId, open, onClose, onSaved }) => {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (section) setContent(section.content ?? {});
  }, [section]);

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/cms/pages/${pageId}/sections/${section.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to save');
      }
      toast.success('Section saved');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    if (!section) return null;
    const props = { content, onChange: setContent };
    switch (section.type) {
      case 'richtext': return <RichtextEditor {...props} />;
      case 'hero': return <HeroEditor {...props} />;
      case 'features_grid': return <FeaturesEditor {...props} />;
      case 'cta': return <CtaEditor {...props} />;
      case 'faq': return <FaqEditor {...props} />;
      default:
        return (
          <div>
            <p className="text-sm text-base-content/60 mb-2">
              Section type <code className="font-mono">{section.type}</code> — editing raw JSON:
            </p>
            <textarea
              className="textarea textarea-bordered w-full font-mono text-xs"
              rows={10}
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try { setContent(JSON.parse(e.target.value)); } catch { /* ignore parse errors while typing */ }
              }}
            />
          </div>
        );
    }
  };

  return (
    <Modal.Legacy open={open} onClickBackdrop={onClose} className="max-w-2xl w-full">
      <Modal.Header className="font-bold">
        Edit Section — {SECTION_TYPE_LABELS[section?.type ?? ''] ?? section?.type}
      </Modal.Header>
      <Modal.Body className="max-h-[70vh] overflow-y-auto">
        {renderEditor()}
      </Modal.Body>
      <Modal.Actions>
        <Button color="ghost" onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={handleSave} disabled={saving} loading={saving}>
          Save Section
        </Button>
      </Modal.Actions>
    </Modal.Legacy>
  );
};

export default SectionEditorModal;
