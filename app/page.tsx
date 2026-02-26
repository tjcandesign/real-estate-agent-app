'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

function AnimatedGrid({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 60;
      const cols = Math.ceil(canvas.width / gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridSize) + 1;

      // Animated grid lines
      for (let i = 0; i < cols; i++) {
        const x = i * gridSize;
        const wave = Math.sin(time + i * 0.15) * 8;
        ctx.beginPath();
        ctx.moveTo(x + wave, 0);
        ctx.lineTo(x - wave, canvas.height);
        const alpha = 0.03 + Math.sin(time + i * 0.3) * 0.015;
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        const y = j * gridSize;
        const wave = Math.sin(time + j * 0.15) * 8;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(canvas.width, y - wave);
        const alpha = 0.03 + Math.sin(time + j * 0.3) * 0.015;
        ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Floating particles
      for (let k = 0; k < 30; k++) {
        const px = ((Math.sin(time * 0.7 + k * 2.1) + 1) / 2) * canvas.width;
        const py = ((Math.cos(time * 0.5 + k * 1.7) + 1) / 2) * canvas.height;
        const size = 1.5 + Math.sin(time + k) * 1;
        const alpha = 0.15 + Math.sin(time * 2 + k) * 0.1;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = k % 2 === 0
          ? `rgba(168, 85, 247, ${alpha})`
          : `rgba(236, 72, 153, ${alpha})`;
        ctx.fill();
      }

      // Radial glow from center
      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.4, 0,
        canvas.width / 2, canvas.height * 0.4, canvas.width * 0.5
      );
      grd.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
      grd.addColorStop(0.5, 'rgba(236, 72, 153, 0.02)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);

  return null;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />
      <AnimatedGrid canvasRef={canvasRef} />

      {/* Static gradient blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42A1 1 0 003 13h1v7a2 2 0 002 2h12a2 2 0 002-2v-7h1a1 1 0 00.71-1.71zM9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5zm7 0v-5a3 3 0 00-3-3h-4a3 3 0 00-3 3v5H6v-7.59l6-6 6 6V20z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">Agent Pro</div>
            <div className="text-[10px] text-purple-400/60 font-medium tracking-wider uppercase">Real Estate Suite</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/agents/sign-in" className="text-sm text-slate-400 hover:text-white transition font-medium">
            Sign In
          </Link>
          <Link
            href="/agents/sign-up"
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-purple-300">Built for closers</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="block text-white">Unleash</span>
            <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Agent Pro
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
            The platform that turns real estate agents into deal-closing machines.
            Track clients, manage transactions, and unlock your full potential.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/agents/sign-up"
              className="group relative px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl shadow-purple-600/25 hover:shadow-purple-500/40 w-full sm:w-auto text-center"
            >
              <span className="relative z-10">Start Free Today</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-40 group-hover:opacity-60 transition" />
            </Link>
            <Link
              href="/agents/sign-in"
              className="px-8 py-4 rounded-xl font-semibold text-slate-300 border border-slate-700 hover:border-purple-500/50 hover:text-white transition-all w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: '📋', text: 'Client Onboarding' },
              { icon: '📊', text: 'Pipeline Tracking' },
              { icon: '✅', text: 'Readiness Checklists' },
              { icon: '📱', text: 'QR Code Sharing' },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300"
              >
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-2xl mx-auto mt-24 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10x', label: 'Faster onboarding' },
            { value: '100%', label: 'Cloud-based' },
            { value: '24/7', label: 'Always accessible' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()} Agent Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
