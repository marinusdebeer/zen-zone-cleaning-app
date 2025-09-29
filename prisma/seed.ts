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

