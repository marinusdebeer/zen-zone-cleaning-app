import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const isDev = process.env.NODE_ENV === 'development';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isProd = process.env.VERCEL_ENV === 'production';

  const environment = isDev ? 'development' : isPreview ? 'preview' : isProd ? 'production' : 'unknown';
  console.log(`🌱 Seeding database for ${environment} environment...`);
  console.log('ℹ️  This seed supports multiple businesses - each organization is isolated by RLS');

  // ==================================================================
  // ORGANIZATION 1: Zen Zone Cleaning (Primary/Demo Organization)
  // ==================================================================
  const zenZoneOrg = await prisma.organization.upsert({
    where: { slug: 'zenzone' },
    update: {},
    create: {
      name: 'Zen Zone Cleaning',
      slug: 'zenzone',
      industry: 'cleaning',
      settings: {
        ui_prefs: {
          theme: {
            primary: '#2E3D2F',
            accent: '#78A265',
            surface: '#FAFFFA',
            cta: '#6B5B95',
          },
        },
        features: {
          quotes: true,
          invoices: true,
          routePlanning: false,
          customerPortal: false,
        },
        workflows: {
          jobLifecycle: {
            states: ['Draft', 'Scheduled', 'InProgress', 'Completed', 'QA', 'Paid', 'Canceled'],
            transitions: {
              Draft: ['Scheduled', 'Canceled'],
              Scheduled: ['InProgress', 'Canceled'],
              InProgress: ['Completed', 'Canceled'],
              Completed: ['QA', 'Paid'],
              QA: ['Completed', 'Paid'],
              Paid: [],
              Canceled: [],
            },
            createWizard: {
              steps: [
                {
                  name: 'Client',
                  fields: ['clientId'],
                },
                {
                  name: 'Details',
                  fields: ['title', 'scheduledAt', 'custom.squareFootage', 'custom.floorType', 'custom.petNotes'],
                },
                {
                  name: 'Assign',
                  fields: ['assignees'],
                },
              ],
            },
          },
        },
        forms: {
          job: {
            showFields: ['title', 'scheduledAt', 'custom.squareFootage', 'custom.floorType', 'custom.petNotes'],
            required: ['title', 'clientId'],
          },
        },
      },
    },
  });

  console.log(`✅ Created organization: ${zenZoneOrg.name}`);

  // Create owner user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@zenzonecleaning.com' },
    update: {},
    create: {
      email: 'owner@zenzonecleaning.com',
      name: 'Zen Zone Owner',
      passwordHash: hashedPassword,
    },
  });

  console.log(`✅ Created user: ${ownerUser.email}`);

  // Create membership
  const membership = await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: ownerUser.id,
        orgId: zenZoneOrg.id,
      },
    },
    update: {},
    create: {
      userId: ownerUser.id,
      orgId: zenZoneOrg.id,
      role: 'OWNER',
    },
  });

  console.log(`✅ Created membership: ${membership.role} for ${ownerUser.email} in ${zenZoneOrg.name}`);

  // ==================================================================
  // SEED DATA: Complete Business Workflow
  // Leads → Estimates → Clients → Jobs → Visits → Invoices → Payments
  // ==================================================================
  console.log('\n📊 Creating comprehensive test data...');

  // 1. LEADS (Potential clients, not yet converted)
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'David Wilson',
        emails: ['david.wilson@email.com'],
        phones: ['(705) 555-0201'],
        addresses: ['999 Prospect Ave, Barrie, ON'],
        source: 'website',
        status: 'Contacted',
        notes: 'Interested in bi-weekly home cleaning',
      },
    }),
    prisma.lead.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'ABC Corporation',
        emails: ['contact@abccorp.com'],
        phones: ['(705) 555-0202'],
        addresses: ['1000 Enterprise Dr, Barrie, ON'],
        source: 'referral',
        status: 'Qualified',
        notes: 'Large office space, needs estimate',
      },
    }),
  ]);
  console.log(`✅ Created ${leads.length} leads`);

  // 2. CLIENTS (Converted from leads or direct)
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'Sarah Johnson',
        emails: ['sarah.johnson@gmail.com'],
        phones: ['(705) 555-0101'],
        addresses: ['123 Main St, Barrie, ON L4N 1A1'],
        custom: { preferredContact: 'email', petNotes: '2 cats - friendly' },
      },
    }),
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'Mike Chen',
        emails: ['mike@techcorp.com', 'mike.chen@gmail.com'],
        phones: ['(705) 555-0102'],
        addresses: ['456 Business Blvd, Barrie, ON L4N 2B2'],
        custom: { businessClient: true, billingEmail: 'accounting@techcorp.com' },
      },
    }),
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'Lisa Davis',
        emails: ['lisa.davis@outlook.com'],
        phones: ['(705) 555-0103', '(705) 555-0104'],
        addresses: ['789 Oak Ave, Barrie, ON L4N 3C3'],
        custom: { petNotes: 'Large dog - keep gates closed' },
      },
    }),
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'Robert & Emily Martinez',
        emails: ['martinez.family@gmail.com'],
        phones: ['(705) 555-0105'],
        addresses: ['321 Pine St, Barrie, ON L4N 4D4'],
        custom: { accessCode: '1234', gateCode: '5678' },
      },
    }),
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'BuildCo Construction',
        emails: ['admin@buildco.ca'],
        phones: ['(705) 555-0106'],
        addresses: ['555 Commercial Rd, Barrie, ON L4N 5E5'],
        custom: { businessClient: true, recurringWeekly: true },
      },
    }),
    prisma.client.create({
      data: {
        orgId: zenZoneOrg.id,
        name: 'Jennifer Thompson',
        emails: ['jen.thompson@yahoo.com'],
        phones: ['(705) 555-0107'],
        addresses: ['888 Maple Dr, Orillia, ON L3V 1F1'],
        custom: {},
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[0].id,
        address: '123 Main St, Barrie, ON L4N 1A1',
        notes: '3 bedroom house, 2 bathrooms',
        custom: { squareFeet: 1800, floors: 2 },
      },
    }),
    prisma.property.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[1].id,
        address: '456 Business Blvd, Barrie, ON L4N 2B2',
        notes: 'Office space - 5000 sq ft',
        custom: { squareFeet: 5000, floors: 1, afterHours: true },
      },
    }),
    prisma.property.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[2].id,
        address: '789 Oak Ave, Barrie, ON L4N 3C3',
        notes: 'Large family home with basement',
        custom: { squareFeet: 2400, floors: 2, basement: true },
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // 3. ESTIMATES (For leads and clients)
  const estimates = await Promise.all([
    // Estimate for lead
    prisma.estimate.create({
      data: {
        orgId: zenZoneOrg.id,
        leadId: leads[0].id,
        title: 'Bi-Weekly Home Cleaning',
        description: 'Regular cleaning service every two weeks',
        amount: 250.00,
        status: 'Sent',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    // Approved estimate (will be converted to job)
    prisma.estimate.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[0].id,
        propertyId: properties[0].id,
        title: 'Deep Clean Service',
        description: 'Complete deep cleaning with carpet treatment',
        amount: 450.00,
        status: 'Approved',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`✅ Created ${estimates.length} estimates`);

  // 4. JOBS (Some converted from estimates, some direct)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const jobs = await Promise.all([
    // Job converted from approved estimate - with multiple visits
    prisma.job.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[0].id,
        propertyId: properties[0].id,
        convertedFromEstimateId: estimates[1].id,
        title: 'Deep Clean Service',
        description: 'Complete deep cleaning with carpet treatment',
        status: 'Active',
        isRecurring: false,
        estimatedCost: 450.00,
        priority: 'normal',
      },
    }),
    // Recurring job with weekly pattern
    prisma.job.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[1].id,
        propertyId: properties[1].id,
        title: 'Weekly Office Cleaning',
        description: 'Regular office maintenance',
        status: 'Active',
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [1, 3, 5], // Monday, Wednesday, Friday
        estimatedCost: 200.00,
        priority: 'normal',
      },
    }),
    // One-time job with multiple visits
    prisma.job.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[2].id,
        propertyId: properties[2].id,
        title: 'Post-Renovation Cleanup',
        description: 'Multi-phase cleaning after renovation',
        status: 'Active',
        isRecurring: false,
        estimatedCost: 1200.00,
        priority: 'high',
      },
    }),
    // Draft job
    prisma.job.create({
      data: {
        orgId: zenZoneOrg.id,
        clientId: clients[3].id,
        title: 'Move In Cleaning',
        description: 'Prepare home for new residents',
        status: 'Draft',
        isRecurring: false,
        estimatedCost: 350.00,
        priority: 'normal',
      },
    }),
  ]);

  console.log(`✅ Created ${jobs.length} jobs`);

  // 5. LINE ITEMS (Attached to jobs, transferred to visits)
  const lineItems = await Promise.all([
    prisma.lineItem.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[0].id,
        name: 'Deep Clean Service',
        qty: 1,
        unitPrice: 300.00,
        taxRate: 13.00,
      },
    }),
    prisma.lineItem.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[0].id,
        name: 'Carpet Cleaning - 2 Rooms',
        qty: 1,
        unitPrice: 150.00,
        taxRate: 13.00,
      },
    }),
    prisma.lineItem.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[1].id,
        name: 'Office Cleaning Service',
        qty: 1,
        unitPrice: 200.00,
        taxRate: 13.00,
      },
    }),
    prisma.lineItem.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[2].id,
        name: 'Renovation Phase 1 Cleaning',
        qty: 1,
        unitPrice: 400.00,
        taxRate: 13.00,
      },
    }),
    prisma.lineItem.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[2].id,
        name: 'Renovation Phase 2 Cleaning',
        qty: 1,
        unitPrice: 400.00,
        taxRate: 13.00,
      },
    }),
  ]);

  console.log(`✅ Created ${lineItems.length} line items`);

  // 6. VISITS (Individual appointments on the calendar)
  const visits = await Promise.all([
    // Visit 1 for Job 1 (Deep Clean) - Completed
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[0].id,
        scheduledAt: yesterday,
        completedAt: yesterday,
        status: 'Completed',
        assignees: ['John Smith', 'Emily Davis'],
        notes: 'Completed successfully. Client very happy!',
      },
    }),
    // Visit 1 for Job 2 (Recurring Office) - Completed
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[1].id,
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 18, 0),
        completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 20, 0),
        status: 'Completed',
        assignees: ['Team B'],
      },
    }),
    // Visit 2 for Job 2 (Recurring Office) - Today
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[1].id,
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
        status: 'Scheduled',
        assignees: ['Team B'],
      },
    }),
    // Visit 3 for Job 2 (Recurring Office) - Future
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[1].id,
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0),
        status: 'Scheduled',
        assignees: ['Team B'],
      },
    }),
    // Visit 1 for Job 3 (Multi-visit renovation) - Completed
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[2].id,
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 9, 0),
        completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 13, 0),
        status: 'Completed',
        assignees: ['Team A'],
        notes: 'Phase 1 complete - rough cleanup done',
      },
    }),
    // Visit 2 for Job 3 - Scheduled for tomorrow
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[2].id,
        scheduledAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
        status: 'Scheduled',
        assignees: ['Team A', 'Team B'],
        notes: 'Phase 2 - detail cleaning',
      },
    }),
    // Visit 3 for Job 3 - Scheduled next week
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[2].id,
        scheduledAt: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 9, 0),
        status: 'Scheduled',
        assignees: ['Team A'],
        notes: 'Phase 3 - final touch-up',
      },
    }),
    // Manual visit added to recurring job
    prisma.visit.create({
      data: {
        orgId: zenZoneOrg.id,
        jobId: jobs[1].id,
        scheduledAt: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 14, 0),
        status: 'Scheduled',
        assignees: ['Team A'],
        isManual: true,
        notes: 'Extra visit requested by client for special event',
      },
    }),
  ]);

  console.log(`✅ Created ${visits.length} visits`);

  // 7. INVOICES (Generated from completed visits)
  const subtotal1 = 450.00;
  const tax1 = subtotal1 * 0.13;
  const invoice1 = await prisma.invoice.create({
    data: {
      orgId: zenZoneOrg.id,
      jobId: jobs[0].id,
      clientId: clients[0].id,
      visitIds: [visits[0].id],
      subtotal: subtotal1,
      taxAmount: tax1,
      total: subtotal1 + tax1,
      status: 'Paid',
      issuedAt: yesterday,
      dueAt: new Date(yesterday.getTime() + 14 * 24 * 60 * 60 * 1000),
      paidAt: yesterday,
    },
  });

  const subtotal2 = 400.00;
  const tax2 = subtotal2 * 0.13;
  const invoice2 = await prisma.invoice.create({
    data: {
      orgId: zenZoneOrg.id,
      jobId: jobs[2].id,
      clientId: clients[2].id,
      visitIds: [visits[4].id], // Phase 1 visit
      subtotal: subtotal2,
      taxAmount: tax2,
      total: subtotal2 + tax2,
      status: 'Sent',
      issuedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      dueAt: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Created 2 invoices`);

  // 8. PAYMENTS (For paid invoice)
  const payment = await prisma.payment.create({
    data: {
      orgId: zenZoneOrg.id,
      invoiceId: invoice1.id,
      amount: invoice1.total,
      method: 'credit_card',
      reference: 'VISA-****1234',
      paidAt: yesterday,
    },
  });

  console.log(`✅ Created payment: $${payment.amount.toString()}`);

  // ==================================================================
  // ADDITIONAL ORGANIZATIONS (Optional - Add your clients here)
  // ==================================================================
  // Example: Add more organizations as needed for your multi-business setup
  // Each organization's data will be isolated by Row Level Security
  
  // Uncomment and customize to add more organizations:
  /*
  const org2 = await prisma.organization.upsert({
    where: { slug: 'acme-cleaning' },
    update: {},
    create: {
      name: 'Acme Cleaning Services',
      slug: 'acme-cleaning',
      industry: 'cleaning',
      settings: {
        features: {
          quotes: true,
          invoices: true,
        },
      },
    },
  });

  const org2Owner = await prisma.user.upsert({
    where: { email: 'owner@acmecleaning.com' },
    update: {},
    create: {
      email: 'owner@acmecleaning.com',
      name: 'Acme Owner',
      passwordHash: await bcrypt.hash('password123', 10),
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: org2Owner.id,
        orgId: org2.id,
      },
    },
    update: {},
    create: {
      userId: org2Owner.id,
      orgId: org2.id,
      role: 'OWNER',
    },
  });

  console.log(`✅ Created organization: ${org2.name}`);
  */

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Email: owner@zenzonecleaning.com');
  console.log('Password: password123');
  console.log('Organization: Zen Zone Cleaning');
  console.log('\n💡 To add more organizations, edit prisma/seed.ts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

