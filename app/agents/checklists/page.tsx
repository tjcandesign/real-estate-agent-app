'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TemplateModal } from '@/components/checklists/TemplateModal';

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  itemCount: number;
}

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'home-inspection',
    title: 'Home Inspection',
    description: 'Track inspection requirements and findings',
    icon: '🏠',
    items: ['Schedule inspection', 'Review report', 'Negotiate repairs', 'Final walkthrough']
  },
  {
    id: 'document-prep',
    title: 'Document Prep',
    description: 'Organize and verify all required documents',
    icon: '📋',
    items: ['ID verification', 'Income documentation', 'Bank statements', 'Employment verification']
  },
  {
    id: 'financial-ready',
    title: 'Financial Ready',
    description: 'Ensure financial readiness for purchase',
    icon: '💰',
    items: ['Pre-approval letter', 'Down payment saved', 'Credit check completed', 'Funds cleared to close']
  },
  {
    id: 'closing-prep',
    title: 'Closing Prep',
    description: 'Final steps before closing day',
    icon: '✅',
    items: ['Final walkthrough', 'Clear to close', 'Wire funds', 'Review closing documents']
  }
];

export default function ChecklistsPage() {
  const { userId, isLoaded } = useAuth();
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchChecklists = async () => {
      try {
        const response = await fetch('/api/agents/checklists');
        if (!response.ok) throw new Error('Failed to fetch checklists');
        const data = await response.json();
        setChecklists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, [isLoaded, userId]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Readiness Checklists
          </h1>
          <p className="text-lg text-slate-600">Create and manage document checklists to track client readiness</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Checklist
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-8 flex items-start gap-4">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {/* Templates Section */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Checklist Templates</h2>
          <p className="text-slate-600">Start with a template and customize it for your clients</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition p-6 cursor-pointer group">
              <div className="text-4xl mb-4">{template.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                {template.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4">{template.description}</p>
              <ul className="text-xs text-slate-600 space-y-1 mb-6">
                {template.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedTemplate(template)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Your Checklists Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Your Checklists</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse h-40 border border-slate-100"></div>
          ))}
        </div>
      ) : checklists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No checklists yet</h3>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto">Create a checklist to help track client document requirements and readiness status.</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Checklist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => (
            <Link
              key={checklist.id}
              href={`/agents/checklists/${checklist.id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                {checklist.isDefault && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                {checklist.name}
              </h3>
              {checklist.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{checklist.description}</p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500 font-medium">{checklist.itemCount} {checklist.itemCount === 1 ? 'item' : 'items'}</span>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Template Modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
