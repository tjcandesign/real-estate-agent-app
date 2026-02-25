'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: string[];
}

interface TemplateModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateModal({ template, isOpen, onClose }: TemplateModalProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [checklistName, setChecklistName] = useState(template.title);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFromTemplate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/checklists/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          name: checklistName,
          description: template.description,
          items: template.items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checklist');
      }

      // Close modal and redirect
      onClose();
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        router.push(`/agents/checklists/${data.id}`);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="text-5xl mb-4">{template.icon}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{template.title}</h2>
          <p className="text-slate-600">{template.description}</p>
        </div>

        {/* Template Items */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">Included items:</p>
          <ul className="space-y-2">
            {template.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Checklist Name
          </label>
          <input
            type="text"
            value={checklistName}
            onChange={(e) => setChecklistName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="My custom checklist"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFromTemplate}
            disabled={isCreating || !checklistName.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              isCreating || !checklistName.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            }`}
          >
            {isCreating && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isCreating ? 'Creating...' : 'Create Checklist'}
          </button>
        </div>
      </div>
    </div>
  );
}
