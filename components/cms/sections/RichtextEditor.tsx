import TiptapEditor from '../TiptapEditor';
import { JSONContent } from '@tiptap/react';

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

const RichtextEditor: React.FC<Props> = ({ content, onChange }) => {
  return (
    <div>
      <label className="label"><span className="label-text font-medium">Content</span></label>
      <TiptapEditor
        value={(content.doc as JSONContent) ?? null}
        onChange={(doc) => onChange({ ...content, doc })}
        placeholder="Start writing your content…"
      />
    </div>
  );
};

export default RichtextEditor;
