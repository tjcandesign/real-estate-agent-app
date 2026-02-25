import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, token, preferences } = body;

    // Validate token
    const onboardingLink = await prisma.clientOnboardingLink.findUnique({
      where: { token },
    });

    if (!onboardingLink || new Date() > onboardingLink.expiresAt) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update client preferences
    const preferenceData = await prisma.clientPreferences.upsert({
      where: { clientId },
      update: {
        propertyType: preferences.propertyType || [],
        minPrice: preferences.minPrice || null,
        maxPrice: preferences.maxPrice || null,
        desiredMoveDate: preferences.desiredMoveDate ? new Date(preferences.desiredMoveDate) : null,
        hasPool: preferences.hasPool || null,
        petFriendly: preferences.petFriendly || null,
        flexibilityLevel: preferences.timeline || 'MEDIUM',
      },
      create: {
        clientId,
        propertyType: preferences.propertyType || [],
        minPrice: preferences.minPrice || null,
        maxPrice: preferences.maxPrice || null,
        desiredMoveDate: preferences.desiredMoveDate ? new Date(preferences.desiredMoveDate) : null,
        hasPool: preferences.hasPool || null,
        petFriendly: preferences.petFriendly || null,
        flexibilityLevel: preferences.timeline || 'MEDIUM',
      },
    });

    // Mark onboarding as complete
    await prisma.client.update({
      where: { id: clientId },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Mark link as used
    await prisma.clientOnboardingLink.update({
      where: { token },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Intake submit error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
