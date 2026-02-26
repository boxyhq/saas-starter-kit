import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import type { JSONContent } from '@tiptap/react';

const extensions = [StarterKit, Image, Link, Table, TableRow, TableCell, TableHeader];

interface Props {
  content: JSONContent;
  className?: string;
}

const RichTextRenderer: React.FC<Props> = ({ content, className }) => {
  if (!content) return null;

  let html = '';
  try {
    html = generateHTML(content, extensions);
  } catch {
    return null;
  }

  return (
    <div
      className={`prose prose-slate max-w-none ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichTextRenderer;
