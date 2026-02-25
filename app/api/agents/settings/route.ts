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

    return Response.json({
      workspaceName: agent.workspaceName,
      mlsIntegrationEnabled: agent.mlsIntegrationEnabled,
      mlsProvider: (agent.featureFlags as { mlsProvider?: string | null })?.mlsProvider || null,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { workspaceName, mlsIntegrationEnabled, mlsProvider } = body;

    const agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        workspaceName,
        mlsIntegrationEnabled,
        featureFlags: {
          mlsProvider,
        },
      },
    });

    return Response.json({
      workspaceName: updatedAgent.workspaceName,
      mlsIntegrationEnabled: updatedAgent.mlsIntegrationEnabled,
      mlsProvider: (updatedAgent.featureFlags as { mlsProvider?: string | null })?.mlsProvider || null,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
