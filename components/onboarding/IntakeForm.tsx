'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface IntakeFormProps {
  clientId: string;
  token: string;
}

interface BuyerPreferences {
  propertyType: string[];
  minPrice: number | null;
  maxPrice: number | null;
  desiredAreas: string[];
  hasPool: boolean | null;
  petFriendly: boolean | null;
  schoolDistricts: boolean;
  desiredMoveDate: string;
  timeline: string;
}

export default function IntakeForm({ clientId, token }: IntakeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BuyerPreferences>({
    defaultValues: {
      propertyType: [],
      minPrice: null,
      maxPrice: null,
      desiredAreas: [],
      hasPool: null,
      petFriendly: null,
      schoolDistricts: false,
      timeline: 'MEDIUM',
    },
  });

  const propertyTypes = watch('propertyType');
  const timeline = watch('timeline');

  const onSubmit = async (data: BuyerPreferences) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/clients/intake-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          token,
          preferences: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Redirect to success page
      router.push(`/clients/onboard/${token}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700">Step {step} of 2</div>
          <div className="text-xs text-slate-500">{step === 1 ? 'Property Preferences' : 'Lifestyle & Timeline'}</div>
        </div>
        <div className="flex gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'
                }`}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="text-red-700 text-sm font-medium">{error}</div>
        </div>
      )}

      <div className="p-8">
        {step === 1 ? (
          // Step 1: Property Preferences
          <>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Property Preferences</h2>
            <p className="text-slate-600 mb-8">Let's start with what you're looking for in your next home</p>

            {/* Property Type */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                What type of property are you interested in? *
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
              {propertyTypes.length === 0 && (
                <p className="text-red-600 text-sm mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Please select at least one property type
                </p>
              )}
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
            <div className="mb-10">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                When are you looking to move? *
              </label>
              <input
                type="date"
                {...register('desiredMoveDate', { required: 'Move date is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.desiredMoveDate ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.desiredMoveDate && (
                <p className="text-red-600 text-sm mt-2">{errors.desiredMoveDate.message}</p>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={propertyTypes.length === 0}
                className={`px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                  propertyTypes.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                }`}
              >
                Next Step
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          // Step 2: Lifestyle & Timeline
          <>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Lifestyle & Timeline</h2>
            <p className="text-slate-600 mb-8">Tell us more about your lifestyle needs and moving timeline</p>

            {/* Lifestyle Preferences */}
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

            {/* Timeline */}
            <div className="pt-8 border-t border-slate-200">
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                How flexible are you with your moving timeline? *
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
                      {...register('timeline')}
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

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 mt-10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || propertyTypes.length === 0}
                className={`px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                  isSubmitting || propertyTypes.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                }`}
              >
                {isSubmitting && (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
