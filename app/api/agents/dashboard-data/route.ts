import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      });
    }

    let agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          clerkUserId: userId,
          email: '',
          firstName: '',
          lastName: '',
        },
      });
    }

    // Get all clients with their statuses
    const clients = await prisma.client.findMany({
      where: { agentId: agent.id },
      include: {
        preferences: true,
        documentChecklist: true,
      },
    });

    const clientCount = clients.length;
    const activeClientsCount = clients.filter(c => c.status === 'ACTIVE').length;
    const prospectCount = clients.filter(c => c.status === 'PROSPECT').length;
    const closedCount = clients.filter(c => c.status === 'CLOSED').length;
    const onboardingInProgress = clients.filter(c => !c.onboardingCompleted).length;

    // Calculate deals closed this month vs last month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const dealsThisMonth = clients.filter(c =>
      c.status === 'CLOSED' && c.updatedAt >= startOfMonth
    ).length;

    const dealsLastMonth = clients.filter(c =>
      c.status === 'CLOSED' && c.updatedAt >= startOfLastMonth && c.updatedAt < startOfMonth
    ).length;

    // Build pipeline data for sales cycle visualization
    const pipeline = {
      prospect: prospectCount,
      active: activeClientsCount,
      onboarding: onboardingInProgress,
      closed: closedCount,
    };

    // Industry averages (NAR 2024 data)
    const industryAverages = {
      avgDealsPerMonth: 2.1,
      avgConversionRate: 0.32,
      avgDaysToClose: 47,
    };

    // Calculate conversion rate
    const conversionRate = clientCount > 0
      ? Math.round((closedCount / clientCount) * 100)
      : 0;

    // Recent client activity
    const recentClients = clients
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        status: c.status,
        onboardingCompleted: c.onboardingCompleted,
        updatedAt: c.updatedAt,
      }));

    return Response.json({
      clientCount,
      activeClientsCount,
      prospectCount,
      closedCount,
      onboardingInProgress,
      dealsThisMonth,
      dealsLastMonth,
      pipeline,
      industryAverages,
      conversionRate,
      recentClients,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage,
    }), {
      status: 500,
      headers,
    });
  }
}
