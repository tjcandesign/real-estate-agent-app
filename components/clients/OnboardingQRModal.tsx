'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface OnboardingQRModalProps {
  clientName: string;
  onboardingUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingQRModal({
  clientName,
  onboardingUrl,
  isOpen,
  onClose,
}: OnboardingQRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

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
        link.download = `${clientName}-onboarding-qr.png`;
        link.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(onboardingUrl);
    // Show toast notification (you can add this later)
    alert('Link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Onboarding Link</h2>
          <p className="text-slate-600">Send this to <span className="font-semibold">{clientName}</span></p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8 p-4 bg-slate-50 rounded-xl">
          <div ref={qrRef}>
            <QRCodeSVG
              value={onboardingUrl}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>

        {/* URL Display */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 mb-2 font-semibold">Direct Link:</p>
          <p className="text-sm text-slate-900 break-all font-mono bg-white p-2 rounded border border-slate-200">
            {onboardingUrl}
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">How to share:</span>
            <ul className="mt-2 space-y-1 ml-2">
              <li>• Scan with phone camera</li>
              <li>• Send via text or email</li>
              <li>• Share the direct link below</li>
            </ul>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={downloadQR}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download QR Code
          </button>
          <button
            onClick={copyLink}
            className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
