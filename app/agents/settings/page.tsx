'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface AgentSettings {
  workspaceName: string;
  mlsIntegrationEnabled: boolean;
  mlsProvider?: string;
}

export default function SettingsPage() {
  const { userId, isLoaded } = useAuth();
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/agents/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isLoaded, userId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/agents/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save settings' });
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

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Settings
        </h1>
        <p className="text-lg text-slate-600">Configure your workspace and preferences</p>
      </div>

      {message && (
        <div
          className={`mb-8 p-6 rounded-xl flex items-start gap-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <div>
            <p className={`font-semibold ${message.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Workspace Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Workspace</h2>
              <p className="text-sm text-slate-600">Manage your workspace settings</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Workspace Name</label>
            <input
              type="text"
              value={settings.workspaceName}
              onChange={(e) => setSettings({ ...settings, workspaceName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="My Real Estate Workspace"
            />
            <p className="text-sm text-slate-500 mt-2">This name appears in your dashboard and communications</p>
          </div>
        </div>

        {/* MLS Integration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">MLS Integration</h2>
                <p className="text-sm text-slate-600">Connect to property listings</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative inline-block w-12 h-7 bg-slate-300 rounded-full transition" style={{ backgroundColor: settings.mlsIntegrationEnabled ? '#2563eb' : undefined }}>
                  <div
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform"
                    style={{ transform: settings.mlsIntegrationEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                  ></div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mlsIntegrationEnabled}
                  onChange={(e) => setSettings({ ...settings, mlsIntegrationEnabled: e.target.checked })}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {settings.mlsIntegrationEnabled && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-indigo-900 mb-6 flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <span><strong>Note:</strong> MLS integration requires additional setup. Your MLS credentials will be encrypted and stored securely.</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">MLS Provider</label>
                  <select
                    value={settings.mlsProvider || ''}
                    onChange={(e) => setSettings({ ...settings, mlsProvider: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a provider...</option>
                    <option value="NAR_MLS">NAR MLS</option>
                    <option value="REGIONAL_MLS">Regional MLS</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>MLS credential setup will be completed in a secure wizard. Contact support if you need help.</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.24l-.707.707M5.343 15.343l.707.707A9 9 0 0021 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Features</h2>
              <p className="text-sm text-slate-600">Available tools and capabilities</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900 block">Client Intake Forms</span>
                <span className="text-sm text-slate-600">Gather client preferences and information</span>
              </div>
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </label>

            <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900 block">Document Checklists</span>
                <span className="text-sm text-slate-600">Track document and readiness status</span>
              </div>
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </label>

            <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 rounded-lg opacity-60 pointer-events-none">
              <input type="checkbox" disabled className="w-5 h-5 text-slate-300 rounded" />
              <div className="flex-1">
                <span className="font-semibold text-slate-700 block">E-Signature</span>
                <span className="text-sm text-slate-600">Collect signatures on documents</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Coming Soon</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-8 border-t border-slate-200">
          <button
            type="button"
            onClick={() => window.location.href = '/agents/dashboard'}
            className="px-8 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-semibold text-slate-900"
          >
            Cancel
          </button>
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
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
