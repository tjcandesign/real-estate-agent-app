import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface ImportClient {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
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

    let agent = await prisma.agent.findUnique({
      where: { clerkUserId: userId },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          clerkUserId: userId,
          email: '',
          firstName: '',
          lastName: '',
        },
      });
    }

    const body = await request.json();
    const { clients } = body as { clients: ImportClient[] };

    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return new Response(JSON.stringify({ error: 'No clients to import' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (clients.length > 200) {
      return new Response(JSON.stringify({ error: 'Maximum 200 clients per batch' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const results: {
      success: { name: string; url: string }[];
      skipped: { name: string; reason: string }[];
      failed: { name: string; reason: string }[];
    } = {
      success: [],
      skipped: [],
      failed: [],
    };

    for (const c of clients) {
      const firstName = c.firstName?.trim();
      if (!firstName) {
        results.failed.push({ name: '(empty)', reason: 'Missing first name' });
        continue;
      }

      const lastName = c.lastName?.trim() || '—';
      const email = c.email?.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase().replace('—', 'client')}@pending.agentpro.app`;
      const phoneNumber = c.phoneNumber?.trim() || null;

      try {
        // Check for existing client by email (skip duplicates)
        const existing = await prisma.client.findFirst({
          where: { agentId: agent.id, email },
        });

        if (existing && !email.includes('@pending.agentpro.app')) {
          results.skipped.push({
            name: `${firstName} ${lastName}`,
            reason: 'Client with this email already exists',
          });
          continue;
        }

        // Create client
        const client = await prisma.client.create({
          data: {
            agentId: agent.id,
            firstName,
            lastName,
            email,
            phoneNumber,
            status: 'PROSPECT',
          },
        });

        // Create onboarding link
        const onboardingLink = await prisma.clientOnboardingLink.create({
          data: {
            agentId: agent.id,
            clientId: client.id,
            token: uuidv4(),
            expiresAt,
          },
        });

        const url = `${baseUrl}/clients/onboard/${onboardingLink.token}`;
        results.success.push({ name: `${firstName} ${lastName}`, url });
      } catch (err) {
        results.failed.push({
          name: `${firstName} ${lastName}`,
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return Response.json({
      imported: results.success.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
      results,
    });
  } catch (error) {
    console.error('Batch import error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
