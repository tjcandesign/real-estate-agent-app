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

    const checklists = await prisma.checklistTemplate.findMany({
      where: { agentId: agent.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const response = checklists.map((checklist) => ({
      id: checklist.id,
      name: checklist.name,
      description: checklist.description,
      isDefault: checklist.isDefault,
      itemCount: checklist.items.length,
    }));

    return Response.json(response);
  } catch (error) {
    console.error('Get checklists error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
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
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, description, items } = body;

    const checklist = await prisma.checklistTemplate.create({
      data: {
        agentId: agent.id,
        name,
        description,
        items: {
          create: items.map((item: { name: string; description?: string }, index: number) => ({
            name: item.name,
            description: item.description,
            order: index,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return Response.json({
      id: checklist.id,
      name: checklist.name,
      description: checklist.description,
      isDefault: checklist.isDefault,
      itemCount: checklist.items.length,
    });
  } catch (error) {
    console.error('Create checklist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
