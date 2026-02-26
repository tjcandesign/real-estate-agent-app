'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42A1 1 0 003 13h1v7a2 2 0 002 2h12a2 2 0 002-2v-7h1a1 1 0 00.71-1.71zM9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5zm7 0v-5a3 3 0 00-3-3h-4a3 3 0 00-3 3v5H6v-7.59l6-6 6 6V20z" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-white text-sm tracking-tight">Agent Pro</div>
          <div className="text-[10px] text-purple-400/70 font-medium tracking-wider uppercase">Real Estate Suite</div>
        </div>
      </Link>

      {/* Clerk Sign In — no extra wrapper */}
      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
            },
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-blue-200/50 relative z-10">
        <p>&copy; {new Date().getFullYear()} Agent Pro</p>
      </div>
    </div>
  );
}
