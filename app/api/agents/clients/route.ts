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

    const agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      return Response.json([]);
    }

    const clients = await prisma.client.findMany({
      where: { agentId: agent.id },
      include: {
        preferences: true,
        documentChecklist: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const clientSummaries = clients.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      status: client.status,
      onboardingCompleted: client.onboardingCompleted,
      createdAt: client.createdAt.toISOString(),
      preferencesSet: !!client.preferences,
      checklistCompletion: client.documentChecklist?.completionPercentage ?? 0,
    }));

    return Response.json(clientSummaries);
  } catch (error) {
    console.error('Get clients error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
