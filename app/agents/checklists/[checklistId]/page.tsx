'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { DeleteConfirmationModal } from '@/components/checklists/DeleteConfirmationModal';

interface ChecklistItem {
  id?: string;
  name: string;
  order: number;
}

interface Checklist {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  items: ChecklistItem[];
  createdAt: string;
}

export default function ChecklistDetailPage() {
  const { userId, isLoaded } = useAuth();
  const params = useParams();
  const router = useRouter();
  const checklistId = params.checklistId as string;

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const newItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchChecklist = async () => {
      try {
        const response = await fetch(`/api/agents/checklists/${checklistId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch checklist');
        }
        const data = await response.json();
        setChecklist(data);
        setName(data.name);
        setDescription(data.description || '');
        setItems(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [isLoaded, userId, checklistId]);

  // Track changes
  useEffect(() => {
    if (!checklist) return;
    const nameChanged = name !== checklist.name;
    const descChanged = description !== (checklist.description || '');
    const itemsChanged = JSON.stringify(items.map(i => i.name)) !== JSON.stringify(checklist.items.map(i => i.name));
    setHasChanges(nameChanged || descChanged || itemsChanged);
  }, [name, description, items, checklist]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    // Don't save empty names
    if (!name.trim()) return;

    // Filter out empty items
    const validItems = items.filter(item => item.name.trim());

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const response = await fetch(`/api/agents/checklists/${checklistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          items: validItems.map((item, index) => ({
            name: item.name.trim(),
            order: index,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setChecklist(updated);
      setName(updated.name);
      setDescription(updated.description || '');
      setItems(updated.items);
      setHasChanges(false);
      setSaveStatus('saved');

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, name, description, items, checklistId]);

  const addItem = () => {
    const newItem: ChecklistItem = {
      name: '',
      order: items.length,
    };
    setItems([...items, newItem]);
    // Focus the new input after render
    setTimeout(() => newItemRef.current?.focus(), 50);
  };

  const updateItem = (index: number, newName: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], name: newName };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If this is the last item, add a new one
      if (index === items.length - 1) {
        addItem();
      } else {
        // Focus next item
        const nextInput = document.querySelector(`[data-item-index="${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
    if (e.key === 'Backspace' && items[index].name === '' && items.length > 1) {
      e.preventDefault();
      removeItem(index);
      // Focus previous item
      const prevInput = document.querySelector(`[data-item-index="${Math.max(0, index - 1)}"]`) as HTMLInputElement;
      setTimeout(() => prevInput?.focus(), 50);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...items];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setItems(updated.map((item, i) => ({ ...item, order: i })));
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/checklists/${checklistId}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete checklist');
      router.push('/agents/checklists');
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading checklist...</div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Checklist Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'This checklist does not exist.'}</p>
          <Link
            href="/agents/checklists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checklists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header with back + save status */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/agents/checklists" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Checklists
        </Link>

        {/* Save status indicator */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-sm text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600">Failed to save</span>
          )}
          {checklist.isDefault && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Editable name */}
      <div className="mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Checklist name"
          className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0"
        />
      </div>

      {/* Editable description */}
      <div className="mb-10">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          className="w-full text-lg text-slate-500 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0"
        />
      </div>

      {/* Checklist Items — always editable */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Items header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </h2>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-500 mb-4">No items yet</p>
            <button
              onClick={addItem}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div>
            {items.map((item, index) => (
              <div
                key={`item-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                className={`
                  flex items-center gap-3 px-6 py-3 border-b border-slate-50 last:border-b-0
                  transition-all group
                  ${dragIndex === index ? 'opacity-40' : ''}
                  ${dragOverIndex === index && dragIndex !== index ? 'border-t-2 border-t-blue-400' : ''}
                `}
              >
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </div>

                {/* Order number */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {index + 1}
                </div>

                {/* Editable item name */}
                <input
                  type="text"
                  data-item-index={index}
                  ref={index === items.length - 1 ? newItemRef : undefined}
                  value={item.name}
                  onChange={(e) => updateItem(index, e.target.value)}
                  onKeyDown={(e) => handleItemKeyDown(e, index)}
                  placeholder="Item name..."
                  className="flex-1 text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 text-sm font-medium py-1"
                />

                {/* Remove button */}
                <button
                  onClick={() => removeItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition flex-shrink-0"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Quick add at bottom */}
            <button
              onClick={addItem}
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-blue-600 hover:bg-slate-50/50 transition text-sm"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="pl-9">Add item...</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3 justify-between">
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-6 py-2.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
        >
          Delete
        </button>

        <div className="flex gap-3">
          <Link
            href="/agents/checklists"
            className="px-6 py-2.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            {hasChanges ? 'Discard & Close' : 'Close'}
          </Link>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`px-8 py-2.5 text-sm rounded-lg font-medium transition ${
              hasChanges
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Checklist'}
          </button>
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-50">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium">You have unsaved changes</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm font-semibold bg-white text-slate-900 px-4 py-1.5 rounded-full hover:bg-slate-100 transition"
          >
            {isSaving ? 'Saving...' : 'Save now'}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        checklistName={checklist.name}
        isOpen={deleteModalOpen}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
