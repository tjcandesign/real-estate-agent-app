import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
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

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        agentId: agent.id,
      },
      include: {
        preferences: true,
        documentChecklist: {
          include: {
            items: {
              include: {
                templateItem: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phoneNumber: client.phoneNumber,
      status: client.status,
      onboardingCompleted: client.onboardingCompleted,
      createdAt: client.createdAt.toISOString(),
      preferences: client.preferences ? {
        propertyType: client.preferences.propertyType,
        minPrice: client.preferences.minPrice,
        maxPrice: client.preferences.maxPrice,
        desiredMoveDate: client.preferences.desiredMoveDate?.toISOString(),
        hasPool: client.preferences.hasPool,
        petFriendly: client.preferences.petFriendly,
        flexibilityLevel: client.preferences.flexibilityLevel,
      } : null,
      checklist: client.documentChecklist ? {
        completionPercentage: client.documentChecklist.completionPercentage,
        isComplete: client.documentChecklist.isComplete,
        items: client.documentChecklist.items.map((item) => ({
          id: item.id,
          name: item.templateItem.name,
          isCompleted: item.isCompleted,
        })),
      } : null,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Get client error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
