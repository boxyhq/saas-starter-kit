import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input } from 'react-daisyui';
import {
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface MdrSection {
  id: string;
  title: string;
  order: number;
  parentSectionId: string | null;
  _count?: { documentLinks?: number; children?: number };
}

interface MdrSectionTreeProps {
  sections: MdrSection[];
  teamSlug: string;
  mdrId: string;
  onUpdate: () => void;
}

const MdrSectionTree = ({
  sections,
  teamSlug,
  mdrId,
  onUpdate,
}: MdrSectionTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  const roots = sections
    .filter((s) => !s.parentSectionId)
    .sort((a, b) => a.order - b.order);

  const childrenOf = (id: string) =>
    sections
      .filter((s) => s.parentSectionId === id)
      .sort((a, b) => a.order - b.order);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSection = async (pId: string | null) => {
    if (!newSectionTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/teams/${teamSlug}/mdr/${mdrId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSectionTitle.trim(),
          parentSectionId: pId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || 'Failed to add section');
        return;
      }
      setNewSectionTitle('');
      setParentId(null);
      onUpdate();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Delete this section and all its sub-sections?')) return;
    const res = await fetch(
      `/api/teams/${teamSlug}/mdr/${mdrId}/sections/${sectionId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message || 'Failed to delete section');
      return;
    }
    onUpdate();
  };

  const renderSection = (section: MdrSection, depth = 0) => {
    const children = childrenOf(section.id);
    const isExpanded = expanded.has(section.id);

    return (
      <div key={section.id} style={{ marginLeft: depth * 20 }}>
        <div className="flex items-center gap-2 py-1.5 hover:bg-base-200 px-2 rounded group">
          <button
            onClick={() => toggleExpand(section.id)}
            className="w-4 shrink-0"
          >
            {children.length > 0 ? (
              isExpanded ? (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronRightIcon className="h-3.5 w-3.5" />
              )
            ) : (
              <span className="w-3.5" />
            )}
          </button>
          <span className="flex-1 text-sm">{section.title}</span>
          {section._count?.documentLinks !== undefined && (
            <span className="text-xs text-gray-400 hidden group-hover:inline">
              {section._count.documentLinks} docs
            </span>
          )}
          <button
            onClick={() => {
              setParentId(section.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-xs text-primary"
            title="Add sub-section"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(section.id)}
            className="opacity-0 group-hover:opacity-100 text-error"
            title="Delete section"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {parentId === section.id && (
          <div
            className="flex gap-2 mt-1 mb-1"
            style={{ marginLeft: (depth + 1) * 20 + 20 }}
          >
            <Input
              size="xs"
              placeholder="Sub-section title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSection(section.id);
                if (e.key === 'Escape') {
                  setParentId(null);
                  setNewSectionTitle('');
                }
              }}
              autoFocus
              className="flex-1"
            />
            <Button
              size="xs"
              color="primary"
              loading={adding}
              onClick={() => handleAddSection(section.id)}
            >
              Add
            </Button>
            <Button
              size="xs"
              color="ghost"
              onClick={() => {
                setParentId(null);
                setNewSectionTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {isExpanded && children.map((child) => renderSection(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Section Structure</h2>
      </div>

      <div className="border border-base-200 rounded-lg p-2 bg-base-100 min-h-32">
        {roots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No sections yet. Add your first section below.
          </p>
        ) : (
          roots.map((section) => renderSection(section))
        )}
      </div>

      {parentId === null && (
        <div className="flex gap-2">
          <Input
            size="sm"
            placeholder="New top-level section title"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection(null);
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            color="primary"
            loading={adding}
            onClick={() => handleAddSection(null)}
            disabled={!newSectionTitle.trim()}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default MdrSectionTree;
