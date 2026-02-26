import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { useEffect } from 'react';

interface Props {
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`px-2 py-1 rounded text-sm transition-colors ${
      active ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
    }`}
  >
    {children}
  </button>
);

const TiptapEditor: React.FC<Props> = ({ value, onChange, placeholder, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={`border border-base-300 rounded-lg overflow-hidden ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-base-300 bg-base-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <div className="w-px h-5 bg-base-300 mx-1" />
        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}
        <div className="w-px h-5 bg-base-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          &ldquo;&rdquo;
        </ToolbarButton>
        <div className="w-px h-5 bg-base-300 mx-1" />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Link URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')}
          title="Link"
        >
          🔗
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Image"
        >
          🖼
        </ToolbarButton>
        <div className="w-px h-5 bg-base-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          ✕
        </ToolbarButton>
      </div>
      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
};

export default TiptapEditor;
