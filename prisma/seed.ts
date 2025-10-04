import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================================================================
  // ORGANIZATION: Zen Zone Cleaning
  // ==================================================================
  const zenZoneOrg = await prisma.organization.upsert({
    where: { slug: 'zen-zone-cleaning' },
    update: {},
    create: {
      name: 'Zen Zone Cleaning',
      slug: 'zen-zone-cleaning',
      industry: 'cleaning',
      timezone: 'America/Toronto',
      settings: {},
    },
  });

  console.log(`✅ Created organization: ${zenZoneOrg.name}`);

  // ==================================================================
  // USERS & MEMBERSHIPS
  // ==================================================================
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'marinusdebeer@gmail.com' },
    update: {},
    create: {
      email: 'marinusdebeer@gmail.com',
      name: 'Marinus de Beer',
      passwordHash: hashedPassword,
      isSuperAdmin: true,
    },
  });

  // Organization Admin
  const zenZoneAdmin = await prisma.user.upsert({
    where: { email: 'admin@zenzonecleaning.com' },
    update: {},
    create: {
      email: 'admin@zenzonecleaning.com',
      name: 'Zen Zone Admin',
      passwordHash: hashedPassword,
      isSuperAdmin: false,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: zenZoneAdmin.id,
        orgId: zenZoneOrg.id,
      },
    },
    update: {},
    create: {
      userId: zenZoneAdmin.id,
      orgId: zenZoneOrg.id,
      role: 'OWNER',
    },
  });

  console.log(`✅ Created users and memberships`);

  // ==================================================================
  // LOOKUP TABLES (Form Ingestion)
  // ==================================================================
  
  // Industries
  const homeIndustry = await prisma.industry.upsert({
    where: { slug: 'home-cleaning' },
    update: {},
    create: {
      slug: 'home-cleaning',
      label: 'Home Cleaning',
      active: true,
    },
  });

  const officeIndustry = await prisma.industry.upsert({
    where: { slug: 'office' },
    update: {},
    create: {
      slug: 'office',
      label: 'Office Cleaning',
      active: true,
    },
  });

  const airbnbIndustry = await prisma.industry.upsert({
    where: { slug: 'airbnb' },
    update: {},
    create: {
      slug: 'airbnb',
      label: 'Airbnb Cleaning',
      active: true,
    },
  });

  console.log(`✅ Created 3 industries`);

  // Service Types
  const serviceTypes = [
    { industryId: homeIndustry.id, slug: 'standard', label: 'Standard Cleaning' },
    { industryId: homeIndustry.id, slug: 'deep', label: 'Deep Cleaning' },
    { industryId: homeIndustry.id, slug: 'moving-standard', label: 'Moving Standard Cleaning' },
    { industryId: homeIndustry.id, slug: 'moving-deep', label: 'Moving Deep Cleaning' },
    { industryId: homeIndustry.id, slug: 'post-renovation', label: 'Post-Renovation Cleaning' },
    { industryId: homeIndustry.id, slug: 'recurring', label: 'Recurring Cleaning' },
    { industryId: officeIndustry.id, slug: 'office', label: 'Office Cleaning' },
    { industryId: airbnbIndustry.id, slug: 'airbnb', label: 'Airbnb Cleaning' },
  ];

  for (const st of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { slug: st.slug },
      update: {},
      create: st,
    });
  }

  console.log(`✅ Created ${serviceTypes.length} service types`);

  // Hear About options
  const hearAboutOptions = [
    { slug: 'gbp', label: 'Google Maps or GBP' },
    { slug: 'google-guaranteed', label: 'Google Guaranteed' },
    { slug: 'brochure', label: 'Brochure' },
    { slug: 'referral', label: 'Referral' },
    { slug: 'other', label: 'Other' },
  ];

  for (const option of hearAboutOptions) {
    await prisma.hearAbout.upsert({
      where: { slug: option.slug },
      update: {},
      create: option,
    });
  }

  console.log(`✅ Created ${hearAboutOptions.length} hear-about options`);

  // Access Methods
  const accessMethods = [
    { industryId: homeIndustry.id, slug: 'home-let-in', label: 'I\'ll be home to let you in' },
    { industryId: homeIndustry.id, slug: 'home-lockbox', label: 'Lockbox or keypad code' },
    { industryId: homeIndustry.id, slug: 'home-key-hidden', label: 'Key hidden on premises' },
    { industryId: homeIndustry.id, slug: 'home-neighbor', label: 'Key left with neighbor or concierge' },
    { industryId: homeIndustry.id, slug: 'home-other', label: 'Other' },
    { industryId: officeIndustry.id, slug: 'office-guard', label: 'Security guard on site' },
    { industryId: officeIndustry.id, slug: 'office-manager', label: 'Building manager will provide access' },
    { industryId: officeIndustry.id, slug: 'office-keypad', label: 'Keypad entry system' },
    { industryId: officeIndustry.id, slug: 'office-keycard', label: 'Key or card provided to crew' },
    { industryId: officeIndustry.id, slug: 'office-after-hours', label: 'Cleaning outside business hours' },
    { industryId: officeIndustry.id, slug: 'office-other', label: 'Other' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-lockbox', label: 'Lockbox on premises' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-code', label: 'Electronic lock with code' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-exchange', label: 'Key exchange with guest' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-manager', label: 'Property manager provides access' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-concierge', label: 'Concierge or front desk' },
    { industryId: airbnbIndustry.id, slug: 'airbnb-other', label: 'Other' },
  ];

  for (const method of accessMethods) {
    await prisma.accessMethod.upsert({
      where: { slug: method.slug },
      update: {},
      create: method,
    });
  }

  console.log(`✅ Created ${accessMethods.length} access methods`);

  // Reasons
  const reasons = [
    { industryId: homeIndustry.id, slug: 'spring-clean', label: 'Spring cleaning' },
    { industryId: homeIndustry.id, slug: 'moving', label: 'Moving' },
    { industryId: homeIndustry.id, slug: 'post-renovation', label: 'Post renovation' },
    { industryId: homeIndustry.id, slug: 'recurring', label: 'Recurring upkeep' },
    { industryId: officeIndustry.id, slug: 'routine', label: 'Routine janitorial' },
    { industryId: officeIndustry.id, slug: 'deep', label: 'Deep clean' },
    { industryId: airbnbIndustry.id, slug: 'turnover', label: 'Turnover prep' },
    { industryId: airbnbIndustry.id, slug: 'seasonal', label: 'Seasonal reset' },
  ];

  for (const reason of reasons) {
    await prisma.reason.upsert({
      where: { slug: reason.slug },
      update: {},
      create: reason,
    });
  }

  console.log(`✅ Created ${reasons.length} reasons`);

  // ==================================================================
  // INITIALIZE ORG COUNTERS
  // ==================================================================
  // Set counters to match our seed data so new entities don't conflict
  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'client' } },
    update: { value: 5 }, // We're creating 5 clients
    create: { orgId: zenZoneOrg.id, scope: 'client', value: 5 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'request' } },
    update: { value: 1 }, // We're creating 1 request
    create: { orgId: zenZoneOrg.id, scope: 'request', value: 1 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'estimate' } },
    update: { value: 2 }, // We're creating 2 estimates
    create: { orgId: zenZoneOrg.id, scope: 'estimate', value: 2 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'job' } },
    update: { value: 2 }, // We're creating 2 jobs
    create: { orgId: zenZoneOrg.id, scope: 'job', value: 2 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'visit' } },
    update: { value: 2 }, // We're creating 2 visits
    create: { orgId: zenZoneOrg.id, scope: 'visit', value: 2 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'invoice' } },
    update: { value: 1 }, // We're creating 1 invoice
    create: { orgId: zenZoneOrg.id, scope: 'invoice', value: 1 },
  });

  await prisma.orgCounter.upsert({
    where: { orgId_scope: { orgId: zenZoneOrg.id, scope: 'payment' } },
    update: { value: 1 }, // We're creating 1 payment
    create: { orgId: zenZoneOrg.id, scope: 'payment', value: 1 },
  });

  console.log(`✅ Initialized org counters`);

  // ==================================================================
  // CLIENTS (Unified - includes leads and active clients)
  // ==================================================================
  const client1 = await prisma.client.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      emails: ['sarah.johnson@gmail.com'],
      phones: ['(705) 555-0101'],
      addresses: ['123 Main St, Barrie, ON L4N 1A1'],
      clientStatus: 'ACTIVE',
      notes: 'Preferred client - weekly service',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 2 } },
    update: {},
    create: {
      number: 2,
      orgId: zenZoneOrg.id,
      firstName: 'Mike',
      lastName: 'Chen',
      companyName: 'TechCorp Office',
      emails: ['mike@techcorp.com'],
      phones: ['(705) 555-0102'],
      addresses: ['456 Business Blvd, Barrie, ON'],
      clientStatus: 'ACTIVE',
    },
  });

  const client3 = await prisma.client.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 3 } },
    update: {},
    create: {
      number: 3,
      orgId: zenZoneOrg.id,
      firstName: 'Lisa',
      lastName: 'Davis',
      emails: ['lisa.davis@outlook.com'],
      phones: ['(705) 555-0103'],
      addresses: ['789 Oak Ave, Barrie, ON'],
      clientStatus: 'ACTIVE',
      notes: 'Large dog - keep gates closed',
    },
  });

  const client4 = await prisma.client.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 4 } },
    update: {},
    create: {
      number: 4,
      orgId: zenZoneOrg.id,
      firstName: 'David',
      lastName: 'Wilson',
      emails: ['david.wilson@email.com'],
      phones: ['(705) 555-0201'],
      addresses: ['999 Prospect Ave, Barrie, ON'],
      clientStatus: 'LEAD',
      leadSource: 'website',
      leadStatus: 'CONTACTED',
      notes: 'Interested in bi-weekly home cleaning',
    },
  });

  const client5 = await prisma.client.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 5 } },
    update: {},
    create: {
      number: 5,
      orgId: zenZoneOrg.id,
      companyName: 'ABC Corporation',
      emails: ['contact@abccorp.com'],
      phones: ['(705) 555-0202'],
      clientStatus: 'LEAD',
      leadSource: 'referral',
      leadStatus: 'QUALIFIED',
      notes: 'Large office space, needs estimate',
    },
  });

  const clients = [client1, client2, client3, client4, client5];

  console.log(`✅ Created ${clients.length} clients (3 active, 2 leads)`);

  // ==================================================================
  // PROPERTIES
  // ==================================================================
  // Find or create properties by checking unique constraint (orgId + clientId + address)
  const property1 = await prisma.property.findFirst({
    where: {
      orgId: zenZoneOrg.id,
      clientId: clients[0].id,
      address: '123 Main St, Barrie, ON L4N 1A1',
    },
  }) || await prisma.property.create({
    data: {
      orgId: zenZoneOrg.id,
      clientId: clients[0].id,
      address: '123 Main St, Barrie, ON L4N 1A1',
      notes: '3 bedroom house, 2 bathrooms',
    },
  });

  const property2 = await prisma.property.findFirst({
    where: {
      orgId: zenZoneOrg.id,
      clientId: clients[1].id,
      address: '456 Business Blvd, Barrie, ON L4N 2B2',
    },
  }) || await prisma.property.create({
    data: {
      orgId: zenZoneOrg.id,
      clientId: clients[1].id,
      address: '456 Business Blvd, Barrie, ON L4N 2B2',
      notes: 'Office space - 5000 sq ft, after hours access',
    },
  });

  const property3 = await prisma.property.findFirst({
    where: {
      orgId: zenZoneOrg.id,
      clientId: clients[2].id,
      address: '789 Oak Ave, Barrie, ON L4N 3C3',
    },
  }) || await prisma.property.create({
    data: {
      orgId: zenZoneOrg.id,
      clientId: clients[2].id,
      address: '789 Oak Ave, Barrie, ON L4N 3C3',
      notes: 'Large family home with basement',
    },
  });

  const properties = [property1, property2, property3];

  console.log(`✅ Created ${properties.length} properties`);

  // ==================================================================
  // REQUESTS (Customer inquiries)
  // ==================================================================
  const request1 = await prisma.request.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      clientId: clients[3].id, // Lead
      title: 'Bi-Weekly Home Cleaning Request',
      description: 'Looking for regular cleaning service',
      source: 'website',
      urgency: 'normal',
      status: 'CONTACTED',
      lineItems: {
        create: [
          { name: 'General Cleaning', quantity: 1, order: 0 },
          { name: 'Kitchen Deep Clean', quantity: 1, order: 1 },
        ],
      },
    },
  });

  const requests = [request1];

  console.log(`✅ Created ${requests.length} requests`);

  // ==================================================================
  // ESTIMATES (Quotes with pricing)
  // ==================================================================
  const estimate1 = await prisma.estimate.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      clientId: clients[3].id, // Lead
      convertedFromRequestId: requests[0].id,
      title: 'Bi-Weekly Home Cleaning',
      description: 'Regular cleaning service every two weeks',
      taxRate: 13, // Cost calculated from line items
      status: 'SENT',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: {
        create: [
          { name: 'General Cleaning', quantity: 1, unitPrice: 150, total: 150, order: 0 },
          { name: 'Kitchen Deep Clean', quantity: 1, unitPrice: 50, total: 50, order: 1 },
        ],
      },
    },
  });

  const estimate2 = await prisma.estimate.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 2 } },
    update: {},
    create: {
      number: 2,
      orgId: zenZoneOrg.id,
      clientId: clients[0].id, // Active client
      propertyId: properties[0].id,
      title: 'Deep Clean Service',
      description: 'Complete deep cleaning with carpet treatment',
      taxRate: 13, // Cost calculated from line items
      depositRequired: true,
      depositType: 'percentage',
      depositValue: 25, // 25% deposit
      status: 'APPROVED',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      lineItems: {
        create: [
          { name: 'Deep Clean Service', quantity: 1, unitPrice: 300, total: 300, order: 0 },
          { name: 'Carpet Cleaning - 2 Rooms', quantity: 2, unitPrice: 75, total: 150, order: 1 },
        ],
      },
    },
  });

  const estimates = [estimate1, estimate2];

  console.log(`✅ Created ${estimates.length} estimates`);

  // ==================================================================
  // JOBS (Scheduled work)
  // ==================================================================
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Job converted from estimate
  const job1 = await prisma.job.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      clientId: clients[0].id,
      propertyId: properties[0].id,
      convertedFromEstimateId: estimates[1].id,
      title: 'Deep Clean Service',
      description: 'Complete deep cleaning with carpet treatment',
      status: 'Active',
      isRecurring: false,
      startDate: yesterday,
      taxRate: 13, // Default tax rate - cost comes from line items
      priority: 'normal',
      lineItems: {
        create: [
          { name: 'Deep Clean Service', quantity: 1, unitPrice: 300, total: 300, order: 0 },
          { name: 'Carpet Cleaning - 2 Rooms', quantity: 2, unitPrice: 75, total: 150, order: 1 },
        ],
      },
    },
  });

  // Recurring job
  const job2 = await prisma.job.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 2 } },
    update: {},
    create: {
      number: 2,
      orgId: zenZoneOrg.id,
      clientId: clients[1].id,
      propertyId: properties[1].id,
      title: 'Weekly Office Cleaning',
      description: 'Regular office maintenance',
      status: 'Active',
      isRecurring: true,
      recurringPattern: 'weekly',
      recurringDays: [1, 3, 5], // Mon, Wed, Fri
      startDate: new Date('2025-10-01'),
      recurringEndDate: new Date('2026-01-01'),
      taxRate: 13, // Default tax rate - cost comes from line items
      billingFrequency: 'WEEKLY',
      priority: 'normal',
      lineItems: {
        create: [
          { name: 'Office Cleaning Service', quantity: 1, unitPrice: 200, total: 200, order: 0 },
        ],
      },
    },
  });

  const jobs = [job1, job2];

  console.log(`✅ Created ${jobs.length} jobs`);

  // ==================================================================
  // VISITS
  // ==================================================================
  const visit1 = await prisma.visit.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      jobId: jobs[0].id,
      scheduledAt: yesterday,
      completedAt: yesterday,
      status: 'Completed',
      assignees: ['Team A'],
      notes: 'Completed successfully. Client very happy!',
      lineItems: {
        create: [
          { name: 'Deep Clean Service', quantity: 1, unitPrice: 300, total: 300, order: 0 },
          { name: 'Carpet Cleaning - 2 Rooms', quantity: 2, unitPrice: 75, total: 150, order: 1 },
        ],
      },
    },
  });

  const visit2 = await prisma.visit.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 2 } },
    update: {},
    create: {
      number: 2,
      orgId: zenZoneOrg.id,
      jobId: jobs[1].id,
      scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
      status: 'Scheduled',
      assignees: ['Team B'],
      lineItems: {
        create: [
          { name: 'Office Cleaning Service', quantity: 1, unitPrice: 200, total: 200, order: 0 },
        ],
      },
    },
  });

  const visits = [visit1, visit2];

  console.log(`✅ Created ${visits.length} visits`);

  // ==================================================================
  // INVOICES
  // ==================================================================
  const invoice = await prisma.invoice.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      jobId: jobs[0].id,
      clientId: clients[0].id,
      propertyId: properties[0].id,
      visitIds: [visits[0].id],
      taxRate: 13, // Cost calculated from line items
      status: 'PAID',
      issuedAt: yesterday,
      dueAt: new Date(yesterday.getTime() + 14 * 24 * 60 * 60 * 1000),
      paidAt: yesterday,
      lineItems: {
        create: [
          { name: 'Deep Clean Service', quantity: 1, unitPrice: 300, total: 300, order: 0 },
          { name: 'Carpet Cleaning - 2 Rooms', quantity: 2, unitPrice: 75, total: 150, order: 1 },
        ],
      },
    },
  });
  
  // Link visit to invoice (only if not already linked)
  if (!visits[0].invoiceId) {
    await prisma.visit.update({
      where: { id: visits[0].id },
      data: { invoiceId: invoice.id },
    });
  }

  console.log(`✅ Created invoice`);

  // ==================================================================
  // PAYMENTS
  // ==================================================================
  // Calculate invoice total from line items for payment
  const invoiceLineItemsTotal = 300 + 150; // $450
  const invoiceTax = invoiceLineItemsTotal * 0.13; // $58.50
  const invoiceTotal = invoiceLineItemsTotal + invoiceTax; // $508.50
  
  const payment = await prisma.payment.upsert({
    where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } },
    update: {},
    create: {
      number: 1,
      orgId: zenZoneOrg.id,
      invoiceId: invoice.id,
      amount: invoiceTotal,
      invoiceTotal,
      method: 'credit_card',
      reference: 'VISA-****1234',
      paidAt: yesterday,
    },
  });

  console.log(`✅ Created payment: $${payment.amount.toString()}`);

  // Note: Conversion relationships are already set during entity creation
  // Request → Estimate link set in estimate1 creation (convertedFromRequestId)
  // Estimate → Job link set in job1 creation (convertedFromEstimateId)
  // These create bidirectional relationships automatically

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('\n🔧 SUPER ADMIN:');
  console.log('   Email: marinusdebeer@gmail.com');
  console.log('   Password: password123');
  console.log('\n👤 ORG ADMIN:');
  console.log('   Email: admin@zenzonecleaning.com');
  console.log('   Password: password123');
  console.log('   Organization: Zen Zone Cleaning');
  console.log('\n📊 Lookup Data:');
  console.log('   • 3 industries');
  console.log('   • 8 service types');
  console.log('   • 5 hear-about options');
  console.log('   • 17 access methods');
  console.log('   • 8 reasons');
  console.log('\n📊 Test Data:');
  console.log(`   • ${clients.length} clients (3 active, 2 leads)`);
  console.log(`   • ${properties.length} properties`);
  console.log(`   • ${requests.length} requests`);
  console.log(`   • ${estimates.length} estimates`);
  console.log(`   • ${jobs.length} jobs`);
  console.log(`   • ${visits.length} visits`);
  console.log(`   • 1 invoice (paid)`);
  console.log(`   • 1 payment`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
