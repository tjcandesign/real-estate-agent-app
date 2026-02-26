'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RecentClient {
  id: string;
  name: string;
  status: string;
  onboardingCompleted: boolean;
  updatedAt: string;
}

interface DashboardData {
  clientCount: number;
  activeClientsCount: number;
  prospectCount: number;
  closedCount: number;
  onboardingInProgress: number;
  dealsThisMonth: number;
  dealsLastMonth: number;
  pipeline: {
    prospect: number;
    active: number;
    onboarding: number;
    closed: number;
  };
  industryAverages: {
    avgDealsPerMonth: number;
    avgConversionRate: number;
    avgDaysToClose: number;
  };
  conversionRate: number;
  recentClients: RecentClient[];
}

const statusColors: Record<string, string> = {
  PROSPECT: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-100 text-slate-600',
  CLOSED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  CLOSED: 'Closed',
};

export default function AgentDashboard() {
  const { userId, isLoaded } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/agents/dashboard-data');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const pipelineTotal = dashboardData
    ? dashboardData.pipeline.prospect + dashboardData.pipeline.active + dashboardData.pipeline.closed
    : 0;

  const getPipelinePercent = (val: number) =>
    pipelineTotal > 0 ? Math.round((val / pipelineTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500">Welcome back. Here&apos;s your business overview.</p>
          </div>
          <Link
            href="/agents/clients/new"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-600/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse h-24 border border-slate-100"></div>
            ))}
          </div>
        ) : dashboardData ? (
          <>
            {/* Top Stats Row - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Link href="/agents/clients" className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-blue-200 transition block group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition">{dashboardData.clientCount}</div>
                    <div className="text-xs text-slate-500">Total Clients</div>
                  </div>
                </div>
              </Link>

              <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{dashboardData.activeClientsCount}</div>
                    <div className="text-xs text-slate-500">Active Clients</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{dashboardData.closedCount}</div>
                    <div className="text-xs text-slate-500">Deals Closed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{dashboardData.onboardingInProgress}</div>
                    <div className="text-xs text-slate-500">Onboarding</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Sales Pipeline + Monthly Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Sales Pipeline */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Sales Pipeline</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Prospects', value: dashboardData.pipeline.prospect, color: 'bg-yellow-400', lightColor: 'bg-yellow-50' },
                    { label: 'Active Clients', value: dashboardData.pipeline.active, color: 'bg-green-500', lightColor: 'bg-green-50' },
                    { label: 'Closed Deals', value: dashboardData.pipeline.closed, color: 'bg-blue-600', lightColor: 'bg-blue-50' },
                  ].map((stage) => (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                        <span className="text-sm font-bold text-slate-900">{stage.value} <span className="text-slate-400 font-normal">({getPipelinePercent(stage.value)}%)</span></span>
                      </div>
                      <div className={`h-3 rounded-full ${stage.lightColor} overflow-hidden`}>
                        <div
                          className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                          style={{ width: `${Math.max(getPipelinePercent(stage.value), 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Conversion Rate</span>
                  <span className="font-bold text-slate-900">{dashboardData.conversionRate}%
                    <span className="text-slate-400 font-normal ml-1">
                      (Avg: {Math.round(dashboardData.industryAverages.avgConversionRate * 100)}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Monthly Performance */}
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Performance</h2>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-slate-900">{dashboardData.dealsThisMonth}</div>
                  <div className="text-sm text-slate-500 mt-1">Deals closed this month</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last month</span>
                    <span className="font-semibold text-slate-700">{dashboardData.dealsLastMonth} deals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Industry avg</span>
                    <span className="font-semibold text-slate-700">{dashboardData.industryAverages.avgDealsPerMonth}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Avg days to close</span>
                    <span className="font-semibold text-slate-700">{dashboardData.industryAverages.avgDaysToClose} days</span>
                  </div>
                </div>

                {dashboardData.dealsThisMonth > dashboardData.industryAverages.avgDealsPerMonth ? (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-green-800">
                      {Math.round(((dashboardData.dealsThisMonth - dashboardData.industryAverages.avgDealsPerMonth) / dashboardData.industryAverages.avgDealsPerMonth) * 100)}% above industry avg
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-blue-800">
                      Keep building your pipeline!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Quick Actions + Pipeline (left) | Recent Clients (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Quick Actions */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">Quick Actions</h2>
                {[
                  { href: '/agents/clients/new', label: 'Add New Client', desc: 'Create a client and generate onboarding link or QR code', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                  { href: '/agents/clients/import', label: 'Import Clients', desc: 'Upload a CSV or paste from a spreadsheet to onboard in bulk', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { href: '/agents/checklists', label: 'Manage Checklists', desc: 'Create and edit readiness checklists for your clients', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                  { href: '/agents/settings', label: 'Account Settings', desc: 'Configure your profile, MLS integration, and preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition`}>
                      <svg className={`w-5 h-5 ${action.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition">{action.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{action.desc}</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Right column: Recent Clients */}
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Recent Clients</h2>
                  <Link href="/agents/clients" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all
                  </Link>
                </div>
                {dashboardData.recentClients.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/agents/clients/${client.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition">{client.name}</div>
                            <div className="text-xs text-slate-400">
                              {new Date(client.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[client.status] || 'bg-slate-100 text-slate-600'}`}>
                          {statusLabels[client.status] || client.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm6-13.5h0" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">No clients yet</p>
                    <Link href="/agents/clients/new" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block">
                      Add your first client
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
