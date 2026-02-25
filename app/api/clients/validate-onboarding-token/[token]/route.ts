import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    const onboardingLink = await prisma.clientOnboardingLink.findUnique({
      where: { token },
      include: {
        client: {
          include: {
            agent: true,
          },
        },
      },
    });

    if (!onboardingLink) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isExpired = new Date() > onboardingLink.expiresAt;

    return Response.json({
      clientId: onboardingLink.client.id,
      clientName: `${onboardingLink.client.firstName} ${onboardingLink.client.lastName}`,
      agentName: `${onboardingLink.client.agent.firstName} ${onboardingLink.client.agent.lastName}`,
      isExpired,
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
