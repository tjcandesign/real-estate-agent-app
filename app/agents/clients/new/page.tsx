'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

type Step = 'input' | 'result';
type Mode = 'quick' | 'full';

interface OnboardingResult {
  token: string;
  url: string;
  expiresAt: string;
  clientName: string;
}

export default function NewClientPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('input');
  const [mode, setMode] = useState<Mode>('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // For quick mode, generate a placeholder email if none provided
      const clientEmail = email.trim() || `${firstName.trim().toLowerCase()}.${(lastName.trim() || 'client').toLowerCase()}@pending.agentpro.app`;

      const response = await fetch('/api/agents/clients/create-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || '—',
          email: clientEmail,
          phoneNumber: phoneNumber.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create client');

      const data = await response.json();
      setResult({
        ...data,
        clientName: `${firstName.trim()} ${lastName.trim() || ''}`.trim(),
      });
      setInviteEmail(email.trim());
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!inviteEmail.trim() || !result) return;
    setSendingEmail(true);
    // For now, copy to clipboard with email context — email sending requires backend setup
    const emailBody = `Hi ${result.clientName},\n\nPlease complete your onboarding at:\n${result.url}\n\nThis link expires on ${new Date(result.expiresAt).toLocaleDateString()}.`;
    await navigator.clipboard.writeText(emailBody);
    setEmailSent(true);
    setSendingEmail(false);
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${result?.clientName || 'client'}-onboarding-qr.png`;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleReset = () => {
    setStep('input');
    setResult(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setCopied(false);
    setEmailSent(false);
    setInviteEmail('');
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // ─── RESULT SCREEN ───
  if (step === 'result' && result) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Back */}
        <button
          onClick={() => router.push('/agents/clients')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </button>

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {result.clientName} Added
          </h1>
          <p className="text-slate-500">
            Choose how to get them started
          </p>
        </div>

        {/* Three options in a clean layout */}
        <div className="space-y-4">

          {/* Option 1: QR Code */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Show QR Code</h3>
                  <p className="text-sm text-slate-500">Client scans with their phone to fill in their details</p>
                </div>
              </div>

              {/* QR code display */}
              <div className="mt-6 flex flex-col items-center">
                <div ref={qrRef} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <QRCodeSVG
                    value={result.url}
                    size={200}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
                <button
                  onClick={downloadQR}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR image
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Copy Link */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Copy Link</h3>
                <p className="text-sm text-slate-500">Send via text, iMessage, WhatsApp, etc.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={result.url}
                readOnly
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-600 truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition flex items-center gap-2 flex-shrink-0 ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 3: Email Invite */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Email Invite</h3>
                <p className="text-sm text-slate-500">Send them a link to fill out their details later</p>
              </div>
            </div>
            {emailSent ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email text copied to clipboard — paste into your email app
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!inviteEmail.trim() || sendingEmail}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition flex-shrink-0 ${
                    inviteEmail.trim()
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {sendingEmail ? 'Sending...' : 'Copy Email'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expiry note */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Link expires {new Date(result.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Bottom actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
          >
            Add Another Client
          </button>
          <button
            onClick={() => router.push('/agents/clients')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── INPUT SCREEN ───
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.push('/agents/clients')}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Client</h1>
        <p className="text-slate-500">Enter minimal info now — they can fill in the rest themselves</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6 flex items-center gap-3 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setMode('quick')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition ${
            mode === 'quick'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Quick Add
        </button>
        <button
          onClick={() => setMode('full')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition ${
            mode === 'full'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Full Details
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* First name — always visible */}
          <div className="p-6 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              autoFocus
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
            />
          </div>

          {/* Quick mode hint */}
          {mode === 'quick' && (
            <div className="px-6 py-4 bg-blue-50/50 border-b border-slate-100">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Just a name is enough — your client will fill in their own details via the onboarding link
              </p>
            </div>
          )}

          {/* Additional fields — only in full mode */}
          {mode === 'full' && (
            <>
              <div className="p-6 border-b border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                />
              </div>
              <div className="p-6 border-b border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                />
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !firstName.trim()}
          className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
            isSubmitting || !firstName.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              Add Client & Get Onboarding Link
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
