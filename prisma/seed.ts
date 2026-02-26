import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  // Find the agent by Clerk user ID (you'll need to update this after signing in)
  // For now, we'll find the first agent or create a demo one
  let agent = await prisma.agent.findFirst();

  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        clerkUserId: 'demo_user',
        email: 'demo@agentpro.com',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        brokerage: 'Premier Realty Group',
        licenseNumber: 'RE-2024-78432',
        phoneNumber: '(555) 234-5678',
        workspaceName: 'Sarah Mitchell Real Estate',
      },
    });
    console.log('Created demo agent:', agent.firstName, agent.lastName);
  } else {
    // Update existing agent with demo info
    agent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        firstName: agent.firstName || 'Sarah',
        lastName: agent.lastName || 'Mitchell',
        brokerage: agent.brokerage || 'Premier Realty Group',
        licenseNumber: agent.licenseNumber || 'RE-2024-78432',
        phoneNumber: agent.phoneNumber || '(555) 234-5678',
        workspaceName: agent.workspaceName || 'Sarah Mitchell Real Estate',
      },
    });
    console.log('Updated existing agent:', agent.firstName, agent.lastName);
  }

  // Clean existing demo data
  await prisma.documentChecklistItem.deleteMany({ where: { checklist: { client: { agentId: agent.id } } } });
  await prisma.documentChecklist.deleteMany({ where: { client: { agentId: agent.id } } });
  await prisma.checklistTemplateItem.deleteMany({ where: { template: { agentId: agent.id } } });
  await prisma.checklistTemplate.deleteMany({ where: { agentId: agent.id } });
  await prisma.clientPreferences.deleteMany({ where: { client: { agentId: agent.id } } });
  await prisma.intakeResponse.deleteMany({ where: { client: { agentId: agent.id } } });
  await prisma.clientOnboardingLink.deleteMany({ where: { agentId: agent.id } });
  await prisma.auditLog.deleteMany({ where: { agentId: agent.id } });
  await prisma.client.deleteMany({ where: { agentId: agent.id } });
  console.log('Cleared existing data');

  // Create diverse clients at different stages
  const clientsData = [
    // CLOSED deals (recent)
    { firstName: 'James', lastName: 'Henderson', email: 'james.henderson@email.com', phone: '(555) 111-2233', status: 'CLOSED' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(5), updatedAt: daysAgo(2) },
    { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@email.com', phone: '(555) 222-3344', status: 'CLOSED' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(15), updatedAt: daysAgo(8) },
    { firstName: 'Robert', lastName: 'Chen', email: 'robert.chen@email.com', phone: '(555) 333-4455', status: 'CLOSED' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(20), updatedAt: daysAgo(12) },
    { firstName: 'Lisa', lastName: 'Patel', email: 'lisa.patel@email.com', phone: '(555) 444-5566', status: 'CLOSED' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(45), updatedAt: daysAgo(35) },
    { firstName: 'David', lastName: 'Thompson', email: 'david.thompson@email.com', phone: '(555) 555-6677', status: 'CLOSED' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(60), updatedAt: daysAgo(42) },

    // ACTIVE clients (in the sales cycle)
    { firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@email.com', phone: '(555) 666-7788', status: 'ACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(3), updatedAt: daysAgo(1) },
    { firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@email.com', phone: '(555) 777-8899', status: 'ACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(7), updatedAt: daysAgo(2) },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@email.com', phone: '(555) 888-9900', status: 'ACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(10), updatedAt: daysAgo(3) },
    { firstName: 'Kevin', lastName: 'Brown', email: 'kevin.brown@email.com', phone: '(555) 999-0011', status: 'ACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(14), updatedAt: daysAgo(5) },
    { firstName: 'Amanda', lastName: 'Davis', email: 'amanda.davis@email.com', phone: '(555) 100-1122', status: 'ACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(18), updatedAt: daysAgo(4) },
    { firstName: 'Chris', lastName: 'Martinez', email: 'chris.martinez@email.com', phone: '(555) 200-2233', status: 'ACTIVE' as const, onboardingCompleted: false, updatedAt: daysAgo(2) },

    // PROSPECT clients (new leads)
    { firstName: 'Jennifer', lastName: 'Taylor', email: 'jennifer.taylor@email.com', phone: '(555) 300-3344', status: 'PROSPECT' as const, onboardingCompleted: false, updatedAt: daysAgo(1) },
    { firstName: 'Daniel', lastName: 'Anderson', email: 'daniel.anderson@email.com', phone: '(555) 400-4455', status: 'PROSPECT' as const, onboardingCompleted: false, updatedAt: daysAgo(2) },
    { firstName: 'Rachel', lastName: 'Wilson', email: 'rachel.wilson@email.com', phone: '(555) 500-5566', status: 'PROSPECT' as const, onboardingCompleted: false, updatedAt: daysAgo(3) },
    { firstName: 'Thomas', lastName: 'Moore', email: 'thomas.moore@email.com', phone: '(555) 600-6677', status: 'PROSPECT' as const, onboardingCompleted: false, updatedAt: daysAgo(4) },
    { firstName: 'Nicole', lastName: 'Garcia', email: 'nicole.garcia@email.com', phone: '(555) 700-7788', status: 'PROSPECT' as const, onboardingCompleted: false, updatedAt: daysAgo(6) },

    // INACTIVE
    { firstName: 'Brian', lastName: 'Lee', email: 'brian.lee@email.com', phone: '(555) 800-8899', status: 'INACTIVE' as const, onboardingCompleted: true, onboardingCompletedAt: daysAgo(90), updatedAt: daysAgo(60) },
  ];

  const createdClients = [];
  for (const data of clientsData) {
    const client = await prisma.client.create({
      data: {
        agentId: agent.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        status: data.status,
        onboardingCompleted: data.onboardingCompleted,
        onboardingCompletedAt: data.onboardingCompletedAt || null,
        updatedAt: data.updatedAt,
      },
    });
    createdClients.push(client);
  }
  console.log(`Created ${createdClients.length} clients`);

  // Add preferences for completed onboarding clients
  const preferencesData = [
    { clientIdx: 0, propertyType: ['SINGLE_FAMILY'], minPrice: 450000, maxPrice: 650000, areas: ['North Raleigh', 'Wake Forest'], schools: ['Wakefield High'], hasPool: true, parking: 2, petFriendly: true, moveDate: daysAgo(-30), flexibility: 'MEDIUM' },
    { clientIdx: 1, propertyType: ['CONDO', 'TOWNHOUSE'], minPrice: 280000, maxPrice: 400000, areas: ['Downtown', 'Midtown'], schools: [], hasPool: false, parking: 1, petFriendly: true, moveDate: daysAgo(-45), flexibility: 'HIGH' },
    { clientIdx: 2, propertyType: ['SINGLE_FAMILY'], minPrice: 550000, maxPrice: 800000, areas: ['Cary', 'Apex'], schools: ['Green Hope High', 'Panther Creek'], hasPool: true, parking: 3, petFriendly: false, moveDate: daysAgo(-15), flexibility: 'LOW' },
    { clientIdx: 3, propertyType: ['MULTI_FAMILY'], minPrice: 350000, maxPrice: 500000, areas: ['Durham', 'Chapel Hill'], schools: [], hasPool: false, parking: 2, petFriendly: true, moveDate: daysAgo(-60), flexibility: 'HIGH', isInvestment: true, targetCashFlow: 1500 },
    { clientIdx: 5, propertyType: ['SINGLE_FAMILY', 'TOWNHOUSE'], minPrice: 380000, maxPrice: 520000, areas: ['Holly Springs', 'Fuquay-Varina'], schools: ['Holly Springs High'], hasPool: false, parking: 2, petFriendly: true, moveDate: daysAgo(-20), flexibility: 'MEDIUM' },
    { clientIdx: 6, propertyType: ['SINGLE_FAMILY'], minPrice: 600000, maxPrice: 900000, areas: ['North Hills', 'Five Points'], schools: ['Broughton High'], hasPool: true, parking: 2, petFriendly: false, moveDate: daysAgo(-10), flexibility: 'LOW' },
    { clientIdx: 7, propertyType: ['CONDO'], minPrice: 200000, maxPrice: 350000, areas: ['Glenwood South', 'Warehouse District'], schools: [], hasPool: false, parking: 1, petFriendly: true, moveDate: daysAgo(-25), flexibility: 'HIGH' },
    { clientIdx: 8, propertyType: ['SINGLE_FAMILY'], minPrice: 500000, maxPrice: 700000, areas: ['Morrisville', 'RTP'], schools: ['Panther Creek'], hasPool: true, parking: 3, petFriendly: true, moveDate: daysAgo(-35), flexibility: 'MEDIUM' },
    { clientIdx: 9, propertyType: ['TOWNHOUSE'], minPrice: 300000, maxPrice: 450000, areas: ['Knightdale', 'Wendell'], schools: [], hasPool: false, parking: 2, petFriendly: true, moveDate: daysAgo(-40), flexibility: 'HIGH' },
  ];

  for (const pref of preferencesData) {
    await prisma.clientPreferences.create({
      data: {
        clientId: createdClients[pref.clientIdx].id,
        propertyType: pref.propertyType,
        minPrice: pref.minPrice,
        maxPrice: pref.maxPrice,
        desiredAreas: pref.areas,
        schoolDistricts: pref.schools,
        hasPool: pref.hasPool,
        parkingRequired: pref.parking,
        petFriendly: pref.petFriendly,
        desiredMoveDate: pref.moveDate,
        flexibilityLevel: pref.flexibility,
        isInvestment: pref.isInvestment || false,
        targetCashFlow: pref.targetCashFlow || null,
      },
    });
  }
  console.log(`Created ${preferencesData.length} client preferences`);

  // Create checklist templates
  const buyerTemplate = await prisma.checklistTemplate.create({
    data: {
      agentId: agent.id,
      name: 'First-Time Buyer Checklist',
      description: 'Complete checklist for first-time home buyers covering pre-approval through closing.',
      isDefault: true,
      items: {
        create: [
          { name: 'Pre-Approval Letter', description: 'Get mortgage pre-approval from a lender', order: 1 },
          { name: 'Proof of Income', description: 'W-2s, pay stubs, or tax returns for last 2 years', order: 2 },
          { name: 'Bank Statements', description: 'Last 3 months of bank statements showing savings', order: 3 },
          { name: 'Credit Report Review', description: 'Review credit score and address any issues', order: 4 },
          { name: 'Buyer Agency Agreement', description: 'Sign the buyer-agent representation agreement', order: 5 },
          { name: 'Property Search Criteria', description: 'Define must-haves, nice-to-haves, and dealbreakers', order: 6 },
          { name: 'Home Inspection', description: 'Schedule and complete a professional home inspection', order: 7 },
          { name: 'Appraisal Ordered', description: 'Lender orders property appraisal', order: 8 },
          { name: 'Title Search Complete', description: 'Title company verifies clean title', order: 9 },
          { name: 'Final Walkthrough', description: 'Conduct final walkthrough before closing', order: 10 },
        ],
      },
    },
    include: { items: true },
  });

  const investorTemplate = await prisma.checklistTemplate.create({
    data: {
      agentId: agent.id,
      name: 'Investment Property Checklist',
      description: 'Due diligence checklist for investment property purchases.',
      items: {
        create: [
          { name: 'Market Analysis Report', description: 'Comparative market analysis for the area', order: 1 },
          { name: 'Rental Income Projection', description: 'Projected monthly rental income analysis', order: 2 },
          { name: 'Property Inspection', description: 'Full structural and systems inspection', order: 3 },
          { name: 'ROI Calculation', description: 'Calculate expected return on investment', order: 4 },
          { name: 'Insurance Quote', description: 'Get landlord insurance quote', order: 5 },
          { name: 'Property Management Plan', description: 'Set up property management or self-manage plan', order: 6 },
          { name: 'Tenant Screening Process', description: 'Establish tenant screening criteria', order: 7 },
        ],
      },
    },
    include: { items: true },
  });

  const sellerTemplate = await prisma.checklistTemplate.create({
    data: {
      agentId: agent.id,
      name: 'Seller Listing Checklist',
      description: 'Prepare a property for listing on the market.',
      items: {
        create: [
          { name: 'Listing Agreement Signed', description: 'Execute the listing agreement with seller', order: 1 },
          { name: 'Home Staging', description: 'Professional staging or declutter recommendations', order: 2 },
          { name: 'Professional Photography', description: 'Schedule professional photos and virtual tour', order: 3 },
          { name: 'MLS Listing Created', description: 'Create and publish MLS listing', order: 4 },
          { name: 'Marketing Materials', description: 'Flyers, social media posts, and email campaigns', order: 5 },
          { name: 'Open House Scheduled', description: 'Plan and promote open house events', order: 6 },
        ],
      },
    },
    include: { items: true },
  });

  console.log('Created 3 checklist templates');

  // Assign checklists to some clients with progress
  const clientChecklistAssignments = [
    { clientIdx: 5, template: buyerTemplate, completedItems: [0, 1, 2, 3, 4, 5] },  // Emily - 60% done
    { clientIdx: 6, template: buyerTemplate, completedItems: [0, 1, 2, 3, 4, 5, 6, 7] },  // Michael - 80% done
    { clientIdx: 7, template: buyerTemplate, completedItems: [0, 1, 2] },  // Sarah - 30% done
    { clientIdx: 3, template: investorTemplate, completedItems: [0, 1, 2, 3, 4, 5, 6] },  // Lisa - 100% done
    { clientIdx: 8, template: buyerTemplate, completedItems: [0, 1, 2, 3] },  // Kevin - 40% done
  ];

  for (const assignment of clientChecklistAssignments) {
    const completionPct = Math.round((assignment.completedItems.length / assignment.template.items.length) * 100);
    const checklist = await prisma.documentChecklist.create({
      data: {
        clientId: createdClients[assignment.clientIdx].id,
        templateId: assignment.template.id,
        completionPercentage: completionPct,
        isComplete: completionPct === 100,
        completedAt: completionPct === 100 ? new Date() : null,
        items: {
          create: assignment.template.items.map((item, idx) => ({
            templateItemId: item.id,
            isCompleted: assignment.completedItems.includes(idx),
            completedAt: assignment.completedItems.includes(idx) ? daysAgo(Math.floor(Math.random() * 14)) : null,
          })),
        },
      },
    });
    console.log(`Assigned checklist to client ${createdClients[assignment.clientIdx].firstName} (${completionPct}% complete)`);
  }

  // Create some onboarding links
  for (const client of createdClients.slice(11, 16)) {
    await prisma.clientOnboardingLink.create({
      data: {
        agentId: agent.id,
        clientId: client.id,
        token: `demo_${client.id.slice(0, 8)}_${Date.now()}`,
        expiresAt: daysAgo(-7), // expires in 7 days
      },
    });
  }
  console.log('Created onboarding links for prospects');

  // Create audit logs for recent activity
  const auditActions = [
    { action: 'CREATE_CLIENT', resourceType: 'Client', resourceId: createdClients[11].id, newValue: { name: 'Jennifer Taylor' } },
    { action: 'UPDATE_PREFERENCES', resourceType: 'ClientPreferences', resourceId: createdClients[5].id, newValue: { updated: 'price range' } },
    { action: 'CREATE_CHECKLIST', resourceType: 'ChecklistTemplate', resourceId: buyerTemplate.id, newValue: { name: buyerTemplate.name } },
    { action: 'CLOSE_DEAL', resourceType: 'Client', resourceId: createdClients[0].id, newValue: { status: 'CLOSED' } },
    { action: 'CREATE_CLIENT', resourceType: 'Client', resourceId: createdClients[12].id, newValue: { name: 'Daniel Anderson' } },
  ];

  for (const log of auditActions) {
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        ...log,
      },
    });
  }
  console.log('Created audit logs');

  console.log('\n--- SEED COMPLETE ---');
  console.log(`Agent: ${agent.firstName} ${agent.lastName}`);
  console.log(`Clients: ${createdClients.length}`);
  console.log(`  - Closed: ${clientsData.filter(c => c.status === 'CLOSED').length}`);
  console.log(`  - Active: ${clientsData.filter(c => c.status === 'ACTIVE').length}`);
  console.log(`  - Prospects: ${clientsData.filter(c => c.status === 'PROSPECT').length}`);
  console.log(`  - Inactive: ${clientsData.filter(c => c.status === 'INACTIVE').length}`);
  console.log(`Checklist Templates: 3`);
  console.log(`Client Checklists: ${clientChecklistAssignments.length}`);
  console.log('---');
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
