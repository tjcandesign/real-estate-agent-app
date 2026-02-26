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
          ? 'bg-slate-950/80 backdrop-blur-xl border-purple-500/20 shadow-lg shadow-purple-900/10'
          : 'bg-slate-950 border-slate-800'
      }`}
    >
      {/* Subtle gradient glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/agents/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 blur-sm opacity-50 group-hover:opacity-80 transition" />
            <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42A1 1 0 003 13h1v7a2 2 0 002 2h12a2 2 0 002-2v-7h1a1 1 0 00.71-1.71zM9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5zm7 0v-5a3 3 0 00-3-3h-4a3 3 0 00-3 3v5H6v-7.59l6-6 6 6V20z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight group-hover:text-purple-200 transition">Agent Pro</div>
            <div className="text-[10px] text-purple-400/70 font-medium tracking-wider uppercase">Real Estate Suite</div>
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
                className={`relative text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive(link.href) && (
                  <>
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                  </>
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {isSignedIn && (
          <div className="flex items-center gap-3">
            <UserButton
              afterSignOutUrl="/agents/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'ring-2 ring-purple-500/30 ring-offset-2 ring-offset-slate-950',
                },
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
