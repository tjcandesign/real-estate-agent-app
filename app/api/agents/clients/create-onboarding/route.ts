import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
    const { firstName, lastName, email, phoneNumber } = body;

    // Validate input — only first name is truly required
    if (!firstName) {
      return new Response(JSON.stringify({ error: 'First name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get agent
    let agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          clerkUserId: userId,
          email: `${userId}@placeholder.agentpro.app`,
          firstName: '',
          lastName: '',
        },
      });
    }

    // Create or get client
    let client = await prisma.client.findFirst({
      where: {
        agentId: agent.id,
        email: email,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          agentId: agent.id,
          firstName,
          lastName,
          email,
          phoneNumber: phoneNumber || null,
          status: 'PROSPECT',
        },
      });
    }

    // Create onboarding link that expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const onboardingLink = await prisma.clientOnboardingLink.create({
      data: {
        agentId: agent.id,
        clientId: client.id,
        token: uuidv4(),
        expiresAt,
      },
    });

    // Use NEXT_PUBLIC_APP_URL if set, otherwise derive from the request URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const onboardingUrl = `${baseUrl}/clients/onboard/${onboardingLink.token}`;

    return Response.json({
      token: onboardingLink.token,
      url: onboardingUrl,
      expiresAt: onboardingLink.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Create onboarding error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
