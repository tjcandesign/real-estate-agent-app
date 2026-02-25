import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, description, items } = body;

    // Get the agent
    const agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the checklist template
    const checklist = await prisma.checklistTemplate.create({
      data: {
        agentId: agent.id,
        name,
        description,
      },
    });

    // Create checklist template items
    if (items && items.length > 0) {
      await Promise.all(
        items.map((item: string, index: number) =>
          prisma.checklistTemplateItem.create({
            data: {
              templateId: checklist.id,
              name: item,
              order: index,
            },
          })
        )
      );
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'CREATE_CHECKLIST',
        resourceType: 'ChecklistTemplate',
        resourceId: checklist.id,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      },
    });

    return Response.json({ id: checklist.id, ...checklist });
  } catch (error) {
    console.error('Create checklist from template error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : '' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
