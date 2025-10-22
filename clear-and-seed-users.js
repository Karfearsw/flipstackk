const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function clearAndSeedUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 CLEARING ALL EXISTING USERS...\n');
    
    // Delete all existing users
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing users\n`);
    
    console.log('🌱 CREATING NEW TEST USERS WITH PROPER PASSWORDS...\n');
    
    // Define test users with simple, known passwords
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@flipstackk.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      },
      {
        username: 'test',
        email: 'test@flipstackk.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'ACQUISITIONS'
      },
      {
        username: 'user',
        email: 'user@flipstackk.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        role: 'ACQUISITIONS'
      }
    ];
    
    // Create users with hashed passwords
    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.username}`);
      
      // Hash password with bcrypt
      const passwordHash = await bcrypt.hash(userData.password, 12);
      console.log(`  Password: ${userData.password}`);
      console.log(`  Hash: ${passwordHash.substring(0, 30)}...`);
      
      // Create user in database
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          passwordHash: passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });
      
      console.log(`  ✅ Created user: ${user.username} (${user.email})`);
      
      // Verify password immediately
      const isValid = await bcrypt.compare(userData.password, passwordHash);
      console.log(`  🔐 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log('  ---');
    }
    
    console.log('\n🎯 VERIFICATION - Testing all created users:');
    
    // Verify all users were created correctly
    for (const userData of testUsers) {
      const user = await prisma.user.findUnique({
        where: { username: userData.username }
      });
      
      if (user && user.passwordHash) {
        const isPasswordValid = await bcrypt.compare(userData.password, user.passwordHash);
        console.log(`${userData.username}/${userData.password}: ${isPasswordValid ? '✅ WORKS' : '❌ BROKEN'}`);
      } else {
        console.log(`${userData.username}: ❌ USER NOT FOUND OR NO PASSWORD HASH`);
      }
    }
    
    console.log('\n🎉 USER SEEDING COMPLETE!');
    console.log('\n📋 TEST CREDENTIALS:');
    testUsers.forEach(user => {
      console.log(`  ${user.username} / ${user.password} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Clear and seed failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSeedUsers();