'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OnboardingQRModal } from '@/components/clients/OnboardingQRModal';

interface ClientSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  onboardingCompleted: boolean;
  createdAt: string;
  preferencesSet: boolean;
  checklistCompletion: number;
}

export default function ClientsPage() {
  const { userId, isLoaded } = useAuth();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string>('');

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchClients = async () => {
      try {
        const response = await fetch('/api/agents/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [isLoaded, userId]);

  const handleShareQR = async (client: ClientSummary) => {
    setSelectedClient(client);
    try {
      const response = await fetch('/api/agents/clients/create-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
        }),
      });

      if (!response.ok) throw new Error('Failed to create onboarding link');
      const data = await response.json();
      setOnboardingUrl(data.url);
      setQrModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create onboarding link');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Your Clients
          </h1>
          <p className="text-lg text-slate-600">Manage client profiles and track their readiness</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/agents/clients/import"
            className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 transition font-medium flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import
          </Link>
          <Link
            href="/agents/clients/new"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-8 flex items-start gap-4">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse h-24 border border-slate-100"></div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm6-13.5h0m0 0h0" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No clients yet</h3>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto">Start by creating an onboarding link. Your clients will complete their intake and preferences automatically.</p>
          <Link
            href="/agents/clients/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Client Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Onboarding</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Readiness</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-5 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{client.firstName} {client.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{client.email}</td>
                  <td className="px-6 py-5 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        client.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : client.status === 'PROSPECT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    {client.onboardingCompleted ? (
                      <span className="inline-flex items-center gap-2 text-green-700 font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-amber-700 font-medium">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${client.checklistCompletion}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{client.checklistCompletion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShareQR(client)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
                        title="Share Onboarding QR Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Share
                      </button>
                      <Link
                        href={`/agents/clients/${client.id}/preferences`}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-purple-50 transition"
                        title="Edit Preferences"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Preferences
                      </Link>
                      <Link
                        href={`/agents/clients/${client.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition"
                        title="View Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedClient && (
        <OnboardingQRModal
          clientName={`${selectedClient.firstName} ${selectedClient.lastName}`}
          onboardingUrl={onboardingUrl}
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedClient(null);
            setOnboardingUrl('');
          }}
        />
      )}
    </div>
  );
}
