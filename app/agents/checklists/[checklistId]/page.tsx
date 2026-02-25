'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DeleteConfirmationModal } from '@/components/checklists/DeleteConfirmationModal';

interface ChecklistItem {
  id: string;
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [isLoaded, userId, checklistId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/checklists/${checklistId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete checklist');
      }

      // Redirect to checklists page after successful deletion
      router.push('/agents/checklists');
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
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
      {/* Header */}
      <div className="mb-8">
        <Link href="/agents/checklists" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Checklists
        </Link>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {checklist.name}
        </h1>
        {checklist.description && (
          <p className="text-lg text-slate-600">{checklist.description}</p>
        )}
      </div>

      {/* Checklist Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="text-sm text-slate-600 mb-2">Total Items</div>
          <div className="text-3xl font-bold text-slate-900">{checklist.items.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="text-sm text-slate-600 mb-2">Status</div>
          <div className="inline-flex items-center gap-2">
            {checklist.isDefault && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                Default
              </span>
            )}
            {!checklist.isDefault && (
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-semibold rounded-full">
                Custom
              </span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="text-sm text-slate-600 mb-2">Created</div>
          <div className="text-sm font-medium text-slate-900">
            {new Date(checklist.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Checklist Items</h2>

        {checklist.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No items in this checklist yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checklist.items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.name}</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer flex-shrink-0 mt-1"
                  disabled
                  title="Item completion tracking coming soon"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-end">
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-8 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
        >
          Delete Checklist
        </button>
        <Link
          href="/agents/checklists"
          className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
        >
          Close
        </Link>
        <button
          onClick={() => alert('Edit functionality coming soon')}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
        >
          Edit Checklist
        </button>
      </div>

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
