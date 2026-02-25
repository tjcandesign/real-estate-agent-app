'use client';

import { useState } from 'react';

interface DeleteConfirmationModalProps {
  checklistName: string;
  isOpen: boolean;
  isDeleting?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  checklistName,
  isOpen,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText.toLowerCase() === 'delete';

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setError('Please type "delete" to confirm');
      return;
    }

    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Delete Checklist?</h2>
          <p className="text-slate-600">
            You are about to permanently delete <span className="font-semibold">"{checklistName}"</span>
          </p>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900 font-medium mb-2">This action cannot be undone.</p>
          <p className="text-sm text-red-800">
            The checklist and all associated items will be permanently deleted. Any clients linked to this checklist will lose access to it.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Type <span className="font-mono text-red-600">"delete"</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError(null);
            }}
            placeholder='Type "delete"'
            disabled={isDeleting}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              isConfirmed && !isDeleting
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isDeleting && (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isDeleting ? 'Deleting...' : 'Delete Checklist'}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
