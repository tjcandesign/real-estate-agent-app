import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const onboardingLink = await prisma.clientOnboardingLink.findUnique({
      where: { token },
    });

    if (!onboardingLink) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isExpired = new Date() > onboardingLink.expiresAt;

    if (!onboardingLink.clientId) {
      return new Response(JSON.stringify({ error: 'Link has not been used yet', isExpired }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: onboardingLink.clientId },
      include: { agent: true },
    });

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      agentName: `${client.agent.firstName} ${client.agent.lastName}`,
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
