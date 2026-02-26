'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function AgentHeader() {
  const { isLoaded, isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoaded) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-sm'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/agents/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42A1 1 0 003 13h1v7a2 2 0 002 2h12a2 2 0 002-2v-7h1a1 1 0 00.71-1.71zM9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5zm7 0v-5a3 3 0 00-3-3h-4a3 3 0 00-3 3v5H6v-7.59l6-6 6 6V20z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight">Agent Pro</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Real Estate Suite</div>
          </div>
        </Link>

        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/agents/dashboard', label: 'Dashboard' },
              { href: '/agents/clients', label: 'Clients' },
              { href: '/agents/checklists', label: 'Checklists' },
              { href: '/agents/settings', label: 'Settings' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {isSignedIn && (
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/agents/sign-in" />
          </div>
        )}
      </div>
    </header>
  );
}
