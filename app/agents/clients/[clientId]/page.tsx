'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  onboardingCompleted: boolean;
  createdAt: string;
  preferences?: {
    propertyType: string[];
    minPrice: number | null;
    maxPrice: number | null;
    desiredMoveDate: string | null;
    hasPool: boolean | null;
    petFriendly: boolean | null;
    flexibilityLevel: string;
  };
  checklist?: {
    completionPercentage: number;
    isComplete: boolean;
    items: Array<{
      id: string;
      name: string;
      isCompleted: boolean;
    }>;
  };
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/agents/clients/${clientId}`);
        if (!response.ok) throw new Error('Failed to fetch client');
        const data = await response.json();
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Client not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/agents/clients" className="text-blue-600 hover:text-blue-700 mb-4 block">
            ← Back to Clients
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-slate-600 mt-1">{client.email}</p>
        </div>

        <div className="text-right">
          <span className={`inline-block px-4 py-2 rounded-full font-medium ${
            client.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {client.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Client Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-slate-900 font-medium">{client.email}</p>
              </div>
              {client.phoneNumber && (
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="text-slate-900 font-medium">{client.phoneNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-600">Joined</p>
                <p className="text-slate-900 font-medium">
                  {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Onboarding</p>
                <p className={`font-medium ${client.onboardingCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                  {client.onboardingCompleted ? '✓ Complete' : 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          {client.preferences && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Property Preferences</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Property Types</p>
                  <div className="flex flex-wrap gap-2">
                    {client.preferences.propertyType.map((type) => (
                      <span key={type} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {(client.preferences.minPrice || client.preferences.maxPrice) && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Price Range</p>
                    <p className="text-slate-900 font-medium">
                      ${client.preferences.minPrice?.toLocaleString() || 'Any'} - $
                      {client.preferences.maxPrice?.toLocaleString() || 'Any'}
                    </p>
                  </div>
                )}

                {client.preferences.desiredMoveDate && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Desired Move Date</p>
                    <p className="text-slate-900 font-medium">
                      {new Date(client.preferences.desiredMoveDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-600 mb-2">Timeline Flexibility</p>
                  <p className="text-slate-900 font-medium capitalize">
                    {client.preferences.flexibilityLevel === 'HIGH'
                      ? 'Very Flexible'
                      : client.preferences.flexibilityLevel === 'MEDIUM'
                      ? 'Somewhat Flexible'
                      : 'Not Flexible'}
                  </p>
                </div>

                {(client.preferences.hasPool !== null || client.preferences.petFriendly !== null) && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Additional Requirements</p>
                    <ul className="space-y-1">
                      {client.preferences.hasPool && <li className="text-slate-700">• Must have pool</li>}
                      {client.preferences.petFriendly && <li className="text-slate-700">• Pet-friendly</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Readiness Checklist */}
          {client.checklist && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Readiness Checklist</h2>
                <span className="text-sm font-medium text-slate-600">
                  {client.checklist.completionPercentage}% Complete
                </span>
              </div>

              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition"
                    style={{ width: `${client.checklist.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {client.checklist.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      disabled
                      className="w-5 h-5 cursor-default"
                    />
                    <span className={item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                Send Property Matches
              </button>
              <button className="w-full bg-slate-100 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium text-sm">
                Edit Preferences
              </button>
              <button className="w-full bg-slate-100 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium text-sm">
                Export Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
