'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function AgentHeader() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/agents/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <div className="font-semibold text-slate-900">Agent Pro</div>
            <div className="text-xs text-slate-500">Real Estate Suite</div>
          </div>
        </Link>

        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/agents/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Dashboard
            </Link>
            <Link href="/agents/clients" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Clients
            </Link>
            <Link href="/agents/checklists" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Checklists
            </Link>
            <Link href="/agents/settings" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Settings
            </Link>
          </nav>
        )}

        {isSignedIn && <UserButton afterSignOutUrl="/agents/sign-in" />}
      </div>
    </header>
  );
}
