const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user table query
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible - Found ${userCount} users`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('📋 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt}`);
    });
    
    // Test specific user lookup
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.username);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();