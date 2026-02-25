'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface ClientPreferences {
  propertyType: string[];
  minPrice: number | null;
  maxPrice: number | null;
  desiredMoveDate: string | null;
  hasPool: boolean | null;
  petFriendly: boolean | null;
  schoolDistricts: boolean | null;
  flexibilityLevel: string;
}

interface ClientData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ClientPreferencesPage() {
  const { userId, isLoaded } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ClientPreferences>({
    defaultValues: {
      propertyType: [],
      minPrice: null,
      maxPrice: null,
      desiredMoveDate: null,
      hasPool: null,
      petFriendly: null,
      schoolDistricts: null,
      flexibilityLevel: 'MEDIUM',
    },
  });

  const propertyTypes = watch('propertyType');

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchData = async () => {
      try {
        // Fetch client data
        const clientResponse = await fetch(`/api/agents/clients/${clientId}`);
        if (!clientResponse.ok) throw new Error('Failed to fetch client');
        const client = await clientResponse.json();
        setClientData(client);

        // TODO: Fetch existing preferences
        // For now, we'll just load the client data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, userId, clientId]);

  const onSubmit = async (data: ClientPreferences) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/agents/clients/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          preferences: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/agents/clients/${clientId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
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
        <div className="text-slate-600">Loading preferences...</div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Client not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/agents/clients/${clientId}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </Link>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Client Preferences
        </h1>
        <p className="text-lg text-slate-600">
          Edit preferences for <span className="font-semibold">{clientData.firstName} {clientData.lastName}</span>
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-green-900">Preferences saved successfully!</p>
            <p className="text-sm text-green-800">Redirecting to client profile...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Property Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2.422 1.265c.638.34 1.578.34 2.216 0L9 12m0 0l2.422 1.265c.638.34 1.578.34 2.216 0L15 12m0 0l2.422 1.265c.638.34 1.578.34 2.216 0L21 12M3 6l2.422 1.265c.638.34 1.578.34 2.216 0L9 6m0 0l2.422 1.265c.638.34 1.578.34 2.216 0L15 6m0 0l2.422 1.265c.638.34 1.578.34 2.216 0L21 6M9 12l6-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Property Preferences</h2>
              <p className="text-sm text-slate-600">Types, budget, and timeline</p>
            </div>
          </div>

          {/* Property Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-4">
              Property Types
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Single Family Home', 'Condo', 'Townhouse', 'Multi-Family', 'Land'].map((type) => (
                <label key={type} className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
                  <input
                    type="checkbox"
                    value={type}
                    {...register('propertyType')}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-slate-700 font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Minimum Price</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500">$</span>
                <input
                  type="number"
                  {...register('minPrice')}
                  placeholder="300,000"
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Maximum Price</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500">$</span>
                <input
                  type="number"
                  {...register('maxPrice')}
                  placeholder="800,000"
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Move Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Desired Move Date
            </label>
            <input
              type="date"
              {...register('desiredMoveDate')}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Lifestyle Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Lifestyle & Timeline</h2>
              <p className="text-sm text-slate-600">Features and flexibility</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <label className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
              <input
                type="checkbox"
                {...register('hasPool')}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="ml-4 flex-1">
                <span className="font-medium text-slate-900 block">Must have a pool</span>
                <span className="text-sm text-slate-500">Swimming or water recreation is important</span>
              </div>
            </label>

            <label className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
              <input
                type="checkbox"
                {...register('petFriendly')}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="ml-4 flex-1">
                <span className="font-medium text-slate-900 block">Pet-friendly property</span>
                <span className="text-sm text-slate-500">You have or plan to get pets</span>
              </div>
            </label>

            <label className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
              <input
                type="checkbox"
                {...register('schoolDistricts')}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="ml-4 flex-1">
                <span className="font-medium text-slate-900 block">Good school district</span>
                <span className="text-sm text-slate-500">School quality is a priority</span>
              </div>
            </label>
          </div>

          {/* Timeline Flexibility */}
          <div className="pt-8 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-4">
              Timeline Flexibility
            </label>
            <div className="space-y-3">
              {[
                { value: 'HIGH', label: 'Very flexible', desc: 'Open timeline, can wait for the right property' },
                { value: 'MEDIUM', label: 'Somewhat flexible', desc: 'Prefer to move within 6-12 months' },
                { value: 'LOW', label: 'Not flexible', desc: 'Need to move within 3 months' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('flexibilityLevel')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <div className="ml-4 flex-1">
                    <span className="font-medium text-slate-900 block">{option.label}</span>
                    <span className="text-sm text-slate-500">{option.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-8 border-t border-slate-200">
          <Link
            href={`/agents/clients/${clientId}`}
            className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              isSaving
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            }`}
          >
            {isSaving && (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
