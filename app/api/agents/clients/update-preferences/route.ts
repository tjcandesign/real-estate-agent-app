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
    const { clientId, preferences } = body;

    // Verify the client belongs to this agent
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { agent: true },
    });

    if (!client || client.agent.clerkUserId !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update or create preferences
    const preferenceData = await prisma.clientPreferences.upsert({
      where: { clientId },
      update: {
        propertyType: preferences.propertyType || [],
        minPrice: preferences.minPrice || null,
        maxPrice: preferences.maxPrice || null,
        desiredMoveDate: preferences.desiredMoveDate ? new Date(preferences.desiredMoveDate) : null,
        hasPool: preferences.hasPool || null,
        petFriendly: preferences.petFriendly || null,
        schoolDistricts: preferences.schoolDistricts || null,
        flexibilityLevel: preferences.flexibilityLevel || 'MEDIUM',
      },
      create: {
        clientId,
        propertyType: preferences.propertyType || [],
        minPrice: preferences.minPrice || null,
        maxPrice: preferences.maxPrice || null,
        desiredMoveDate: preferences.desiredMoveDate ? new Date(preferences.desiredMoveDate) : null,
        hasPool: preferences.hasPool || null,
        petFriendly: preferences.petFriendly || null,
        schoolDistricts: preferences.schoolDistricts || null,
        flexibilityLevel: preferences.flexibilityLevel || 'MEDIUM',
      },
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        agentId: client.agentId,
        action: 'UPDATE_CLIENT_PREFERENCES',
        clientId,
        metadata: {
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return Response.json({ success: true, data: preferenceData });
  } catch (error) {
    console.error('Update preferences error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
