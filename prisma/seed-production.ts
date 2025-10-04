import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database (lookup tables + super admin only)...');

  // ==================================================================
  // SUPER ADMIN USER
  // ==================================================================
  const hashedPassword = await bcrypt.hash('password123', 10);
  
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

  console.log(`✅ Created super admin: ${superAdmin.email}`);

  // ==================================================================
  // LOOKUP TABLES (Form Ingestion)
  // ==================================================================
  
  // Industries
  const homeIndustry = await prisma.industry.upsert({
    where: { slug: 'home-cleaning' },
    update: {},
    create: { slug: 'home-cleaning', label: 'Home Cleaning', active: true },
  });

  const officeIndustry = await prisma.industry.upsert({
    where: { slug: 'office' },
    update: {},
    create: { slug: 'office', label: 'Office Cleaning', active: true },
  });

  const airbnbIndustry = await prisma.industry.upsert({
    where: { slug: 'airbnb' },
    update: {},
    create: { slug: 'airbnb', label: 'Airbnb Cleaning', active: true },
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

  console.log('\n🎉 Production seeding completed successfully!');
  console.log('\n📝 Super Admin Login:');
  console.log('   Email: marinusdebeer@gmail.com');
  console.log('   Password: password123');
  console.log('\n⚠️  IMPORTANT: Change your password after first login!');
  console.log('\n📊 Lookup Data:');
  console.log('   • 3 industries');
  console.log('   • 8 service types');
  console.log('   • 5 hear-about options');
  console.log('   • 17 access methods');
  console.log('   • 8 reasons');
  console.log('\n✅ Ready to create your organization!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
