import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🔄 Creating new user account...');

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'whoisotp' },
          { email: 'benji.jelleh@flipstackk.com' },
        ],
      },
    });

    if (existingUser) {
      console.log('❌ User with this username or email already exists');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('stackk10m', 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: 'whoisotp',
        email: 'benji.jelleh@flipstackk.com',
        passwordHash,
        firstName: 'Benji Stackk',
        lastName: 'Jelleh',
        role: 'ACQUISITIONS',
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('✅ User created successfully:');
    console.log(JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();