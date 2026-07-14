import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting schema tables...');
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
  await prisma.leadTagMap.deleteMany({});
  await prisma.leadTag.deleteMany({});
  await prisma.leadActivity.deleteMany({});
  await prisma.leadNote.deleteMany({});
  await prisma.importRow.deleteMany({});
  await prisma.importBatch.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.leadSource.deleteMany({});
  await prisma.leadStatus.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

  console.log('Seeding baseline tables...');

  // Setup roles
  const adminRole = await prisma.role.create({
    data: {
      role_name: 'Admin',
      description: 'System Admin: Dashboard, imports, setup and user privileges.',
      can_manage_leads: true,
      can_send_email: true,
      can_manage_users: true,
      can_manage_settings: true,
    },
  });

  const staffRole = await prisma.role.create({
    data: {
      role_name: 'Staff',
      description: 'Pipeline Agent: View and update target accounts.',
      can_manage_leads: true,
      can_send_email: true,
      can_manage_users: false,
      can_manage_settings: false,
    },
  });

// Seed default admin
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      first_name: 'emelio',
      last_name: 'Innovations',
      email: 'emelio@cubetech.com',
      password_hash: hash,
      avatar_initials: 'EI',
      status: 'active',
      role_id: adminRole.id,
    },
  });

  

  // Seed standard status stages
  const statuses = [
    { status_name: 'New', display_order: 1, color_hex: '#3b82f6', is_final: false },
    { status_name: 'Not Emailed', display_order: 2, color_hex: '#64748b', is_final: false },
    { status_name: 'Emailed', display_order: 3, color_hex: '#06b6d4', is_final: false },
    { status_name: 'Replied', display_order: 4, color_hex: '#a855f7', is_final: false },
    { status_name: 'Follow-up', display_order: 5, color_hex: '#eab308', is_final: false },
    { status_name: 'Demo Scheduled', display_order: 6, color_hex: '#f97316', is_final: false },
    { status_name: 'Converted', display_order: 7, color_hex: '#22c55e', is_final: true },
    { status_name: 'Not Interested', display_order: 8, color_hex: '#ef4444', is_final: true },
  ];
  

  for (const status of statuses) {
    await prisma.leadStatus.create({ data: status });
  }

  // Seed standard sources
  const sources = [
    { source_name: 'LinkedIn', description: 'Leads from LinkedIn outreach' },
    { source_name: 'Website', description: 'Leads from landing page forms' },
    { source_name: 'Referral', description: 'Leads from industry relationships' },
    { source_name: 'Cold Email', description: 'Cold B2B email sequence targets' },
    { source_name: 'Conference', description: 'In-person tech exhibitions' },
  ];

  for (const source of sources) {
    await prisma.leadSource.create({ data: source });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });