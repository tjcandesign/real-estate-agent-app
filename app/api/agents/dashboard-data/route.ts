import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or create agent record
    let agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      // First time login - create agent record
      agent = await prisma.agent.create({
        data: {
          clerkUserId: userId,
          email: '', // Will be populated from Clerk user
          firstName: '',
          lastName: '',
        },
      });
    }

    // Get dashboard stats
    const [clientCount, activeClientsCount, onboardingInProgress] = await Promise.all([
      prisma.client.count({ where: { agentId: agent.id } }),
      prisma.client.count({
        where: {
          agentId: agent.id,
          status: 'ACTIVE',
        },
      }),
      prisma.client.count({
        where: {
          agentId: agent.id,
          onboardingCompleted: false,
        },
      }),
    ]);

    return Response.json({
      clientCount,
      activeClientsCount,
      onboardingInProgress,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
