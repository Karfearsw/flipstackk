const { PrismaClient } = require('@prisma/client');

async function testProductionDatabase() {
  console.log('🧪 TESTING PRODUCTION DATABASE CONNECTION...\n');
  
  // Use production DATABASE_URL
  const prodDatabaseUrl = process.env.DATABASE_URL;
  
  if (!prodDatabaseUrl) {
    console.error('❌ DATABASE_URL environment variable not found');
    return;
  }
  
  console.log('🔗 Database URL found (first 50 chars):', prodDatabaseUrl.substring(0, 50) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: prodDatabaseUrl
      }
    }
  });
  
  try {
    console.log('📡 Attempting to connect to database...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if User table exists and is accessible
    console.log('📊 Testing User table access...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Current user count: ${userCount}`);
    
    // Test creating a test user (will rollback)
    console.log('🧪 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        username: 'test_prod_' + Date.now(),
        email: 'test_prod_' + Date.now() + '@example.com',
        firstName: 'Test',
        lastName: 'Production',
        passwordHash: '$2a$12$test.hash.for.production.test',
        role: 'ACQUISITIONS'
      }
    });
    console.log('✅ Test user created successfully:', testUser.id);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('🧹 Test user cleaned up');
    
    console.log('\n🎉 ALL DATABASE TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('P1001')) {
      console.error('🔌 Connection refused - database server unreachable');
    } else if (error.message.includes('P1008')) {
      console.error('⏰ Connection timeout - database server too slow');
    } else if (error.message.includes('P1017')) {
      console.error('🔐 Authentication failed - wrong credentials');
    } else if (error.message.includes('P2002')) {
      console.error('🔄 Unique constraint violation');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

testProductionDatabase();