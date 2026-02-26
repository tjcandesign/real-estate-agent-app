import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params;
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

    const checklist = await prisma.checklistTemplate.findUnique({
      where: { id: checklistId },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!checklist) {
      return new Response(JSON.stringify({ error: 'Checklist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify the checklist belongs to this agent
    if (checklist.agentId !== agent.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      id: checklist.id,
      name: checklist.name,
      description: checklist.description,
      isDefault: checklist.isDefault,
      items: checklist.items.map((item) => ({
        id: item.id,
        name: item.name,
        order: item.order,
      })),
      createdAt: checklist.createdAt,
    });
  } catch (error) {
    console.error('Get checklist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params;
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

    const checklist = await prisma.checklistTemplate.findUnique({
      where: { id: checklistId },
    });

    if (!checklist || checklist.agentId !== agent.id) {
      return new Response(JSON.stringify({ error: 'Checklist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, description, items } = body as {
      name: string;
      description: string | null;
      items: { id?: string; name: string; order: number }[];
    };

    // Update checklist name and description
    await prisma.checklistTemplate.update({
      where: { id: checklistId },
      data: { name, description },
    });

    // Delete all existing items and recreate (simplest approach for reordering)
    await prisma.checklistTemplateItem.deleteMany({
      where: { checklistTemplateId: checklistId },
    });

    // Create new items
    if (items && items.length > 0) {
      await prisma.checklistTemplateItem.createMany({
        data: items.map((item, index) => ({
          checklistTemplateId: checklistId,
          name: item.name,
          order: index,
        })),
      });
    }

    // Fetch and return the updated checklist
    const updated = await prisma.checklistTemplate.findUnique({
      where: { id: checklistId },
      include: {
        items: { orderBy: { order: 'asc' } },
      },
    });

    return Response.json({
      id: updated!.id,
      name: updated!.name,
      description: updated!.description,
      isDefault: updated!.isDefault,
      items: updated!.items.map((item) => ({
        id: item.id,
        name: item.name,
        order: item.order,
      })),
      createdAt: updated!.createdAt,
    });
  } catch (error) {
    console.error('Update checklist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
