import type { Metadata } from 'next';
import { AgentHeader } from '@/components/AgentHeader';

export const metadata: Metadata = {
  title: 'Agent Pro - Real Estate Dashboard',
  description: 'Manage clients, preferences, and readiness checklists',
};

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AgentHeader />
      {children}
    </div>
  );
}
