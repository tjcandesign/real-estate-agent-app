import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function DELETE(
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

    // Delete all checklist items first (cascade delete)
    await prisma.checklistTemplateItem.deleteMany({
      where: { templateId: checklistId },
    });

    // Delete the checklist
    await prisma.checklistTemplate.delete({
      where: { id: checklistId },
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'DELETE_CHECKLIST',
        resourceType: 'ChecklistTemplate',
        resourceId: checklistId,
        newValue: {
          deletedAt: new Date().toISOString(),
          checklistName: checklist.name,
        },
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete checklist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
