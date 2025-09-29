import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Zen Zone Cleaning organization
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

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Email: owner@zenzonecleaning.com');
  console.log('Password: password123');
  console.log('Organization: /t/zenzone');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

