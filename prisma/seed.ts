import { PrismaClient, UserRole, LeadStatus, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords for test users
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const agentPasswordHash = await bcrypt.hash('stackk10m', 12);
  const ibbyPasswordHash = await bcrypt.hash('stackk10m', 12);

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@flipstackk.com',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'whoisotp' },
    update: {
      passwordHash: agentPasswordHash,
    },
    create: {
      email: 'whoisotp@flipstackk.com',
      firstName: 'Agent',
      lastName: 'Smith',
      username: 'whoisotp',
      passwordHash: agentPasswordHash,
      role: 'AGENT',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { username: 'ibby' },
    update: {
      passwordHash: ibbyPasswordHash,
    },
    create: {
      email: 'ibby@flipstackk.com',
      firstName: 'Ibby',
      lastName: 'Johnson',
      username: 'ibby',
      passwordHash: ibbyPasswordHash,
      role: 'ACQUISITIONS',
    },
  });

  console.log('✅ Created users');

  // Create sample buyers
  const sampleBuyers = [
    {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 111-2222',
      maxBudget: 400000,
      preferredAreas: 'Austin, Dallas, Houston',
      propertyTypes: 'Single Family Home, Townhouse',
      status: 'ACTIVE',
      notes: 'Experienced investor looking for fix-and-flip opportunities',
    },
    {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.martinez@email.com',
      phone: '(555) 333-4444',
      maxBudget: 600000,
      preferredAreas: 'Austin, San Antonio',
      propertyTypes: 'Single Family Home, Condo, Duplex',
      status: 'ACTIVE',
      notes: 'Looking for rental properties in good neighborhoods',
    },
    {
      firstName: 'Michael',
      lastName: 'Chang',
      email: 'michael.chang@email.com',
      phone: '(555) 555-6666',
      maxBudget: 350000,
      preferredAreas: 'Fort Worth, Plano',
      propertyTypes: 'Condo, Townhouse',
      status: 'QUALIFIED',
      notes: 'First-time investor, interested in turnkey properties',
    },
    {
      firstName: 'Amanda',
      lastName: 'Foster',
      email: 'amanda.foster@email.com',
      phone: '(555) 777-8888',
      maxBudget: 800000,
      preferredAreas: 'Houston, Dallas, Austin, San Antonio',
      propertyTypes: 'Single Family Home, Multi-Family, Commercial',
      status: 'ACTIVE',
      notes: 'High-volume investor, can close quickly on multiple properties',
    },
  ];

  for (const buyerData of sampleBuyers) {
    // Check if buyer already exists
    const existingBuyer = await prisma.buyer.findFirst({
      where: { email: buyerData.email },
    });

    if (existingBuyer) {
      // Update existing buyer
      const buyer = await prisma.buyer.update({
        where: { id: existingBuyer.id },
        data: buyerData,
      });
      console.log(`✅ Updated buyer: ${buyerData.firstName} ${buyerData.lastName}`);
    } else {
      // Create new buyer
      const buyer = await prisma.buyer.create({
        data: buyerData,
      });
      console.log(`✅ Created buyer: ${buyerData.firstName} ${buyerData.lastName}`);
    }
  }

  // Create sample leads
  const sampleLeads = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      propertyType: 'Single Family Home',
      estimatedValue: 450000,
      motivation: 'Relocating for work, need quick sale',
      timeline: 'Within 30 days',
      status: 'NEW',
      source: 'Website',
      notes: 'Motivated seller, needs quick close',
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 987-6543',
      address: '456 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      propertyType: 'Townhouse',
      estimatedValue: 320000,
      motivation: 'Downsizing after retirement',
      timeline: '60-90 days',
      status: 'CONTACTED',
      source: 'Referral',
      notes: 'Flexible on timing, wants fair market value',
    },
    {
      firstName: 'Mike',
      lastName: 'Rodriguez',
      email: 'mike.rodriguez@email.com',
      phone: '(555) 456-7890',
      address: '789 Pine Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      propertyType: 'Condo',
      estimatedValue: 280000,
      motivation: 'Job relocation',
      timeline: '30-45 days',
      status: 'QUALIFIED',
      source: 'Cold Call',
      notes: 'Pre-approved buyer lined up, needs quick close',
    },
  ];

  for (const leadData of sampleLeads) {
    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email: leadData.email }
    });

    if (existingLead) {
      // Update existing lead
      const lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: leadData,
      });
      console.log(`✅ Updated lead: ${lead.firstName} ${lead.lastName}`);
    } else {
      // Create new lead
      const lead = await prisma.lead.create({
        data: leadData,
      });
      console.log(`✅ Created lead: ${lead.firstName} ${lead.lastName}`);
    }
  }

  // Create sample tasks
  const leads = await prisma.lead.findMany();
  const buyers = await prisma.buyer.findMany();
  const users = await prisma.user.findMany();

  const sampleTasks = [
    {
      title: 'Follow up with John Smith',
      description: 'Initial contact with lead about property at 123 Main Street',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      leadId: leads[0]?.id,
      assignedToId: users[1]?.id, // Agent
    },
    {
      title: 'Schedule property visit - Sarah Johnson',
      description: 'Schedule property walkthrough for townhouse on Oak Avenue',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      leadId: leads[1]?.id,
      assignedToId: users[2]?.id, // Acquisitions
    },
    {
      title: 'Show properties to David Thompson',
      description: 'Schedule and conduct property showings for investor',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      buyerId: buyers[0]?.id,
      assignedToId: users[1]?.id, // Agent
    },
  ];

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: taskData,
    });
  }

  console.log('✅ Created tasks');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });