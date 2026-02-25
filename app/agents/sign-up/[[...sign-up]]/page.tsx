'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="mb-8">
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <div>
              <div className="font-bold text-white text-lg">Agent Pro</div>
              <div className="text-xs text-blue-200">Real Estate Suite</div>
            </div>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-blue-100">Join thousands of real estate agents</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <SignUp />
          </div>
          <div className="bg-slate-50 px-8 py-6 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/agents/sign-in" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl text-blue-300 mb-2">⚡</div>
            <p className="text-xs text-blue-100">Fast Setup</p>
          </div>
          <div>
            <div className="text-2xl text-indigo-300 mb-2">🔒</div>
            <p className="text-xs text-blue-100">Secure</p>
          </div>
          <div>
            <div className="text-2xl text-purple-300 mb-2">🚀</div>
            <p className="text-xs text-blue-100">Powerful</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-100">
          <p>© 2024 Agent Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
