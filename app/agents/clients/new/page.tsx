'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export default function NewClientPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingLink, setOnboardingLink] = useState<{
    token: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>();

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/clients/create-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create onboarding link');
      }

      const result = await response.json();
      setOnboardingLink(result);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Add New Client
        </h1>
        <p className="text-lg text-slate-600">Create an onboarding link and send it to your client</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-8 flex items-start gap-4">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {onboardingLink ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Onboarding Link Created</h2>
              <p className="text-green-800">Your client can now start the intake process</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 border border-green-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">Share this link with your client:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={onboardingLink.url}
                readOnly
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm font-mono text-slate-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(onboardingLink.url);
                  alert('Link copied to clipboard!');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-4">Expires on:</p>
            <p className="text-lg font-bold text-slate-900">{new Date(onboardingLink.expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-slate-600 mt-2">This link will be valid for 30 days</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setOnboardingLink(null);
                reset();
              }}
              className="px-6 py-3 rounded-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Create Another
            </button>
            <button
              onClick={() => window.location.href = '/agents/clients'}
              className="px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              Back to Clients
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">First Name *</label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.firstName ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-2">{errors.firstName.message}</p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Last Name *</label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.lastName ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-2">{errors.lastName.message}</p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Email *</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-10">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Phone Number (Optional)</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="(555) 123-4567"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            }`}
          >
            {isSubmitting && (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isSubmitting ? 'Creating Link...' : 'Create Onboarding Link'}
          </button>
        </form>
      )}
    </div>
  );
}
