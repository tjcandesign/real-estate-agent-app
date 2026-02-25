'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import IntakeForm from '@/components/onboarding/IntakeForm';

interface OnboardingData {
  clientId: string;
  clientName: string;
  agentName: string;
  isExpired: boolean;
}

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/clients/validate-onboarding-token/${token}`);
        if (!response.ok) {
          throw new Error('Invalid or expired onboarding link');
        }
        const data = await response.json();
        setOnboardingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-1 bg-white rounded-full"></div>
          </div>
          <p className="text-slate-600 font-medium">Setting up your onboarding...</p>
        </div>
      </div>
    );
  }

  if (error || !onboardingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Invalid Link</h1>
          <p className="text-slate-600 mb-4">{error || 'This onboarding link is no longer valid.'}</p>
          <p className="text-sm text-slate-500">Please contact your real estate agent for a new link.</p>
        </div>
      </div>
    );
  }

  if (onboardingData.isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Link Expired</h1>
          <p className="text-slate-600 mb-4">This onboarding link has expired.</p>
          <p className="text-sm text-slate-500">Please ask {onboardingData.agentName} to send you a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Welcome!
          </h1>
          <p className="text-lg text-slate-600">
            Hi <span className="font-semibold text-slate-900">{onboardingData.clientName}</span>, let's get you matched with the perfect home
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Working with <span className="font-medium">{onboardingData.agentName}</span>
          </p>
        </div>

        <IntakeForm
          clientId={onboardingData.clientId}
          token={token}
        />

        {/* Trust Badge */}
        <div className="mt-12 flex justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Your data is secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Takes ~5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
