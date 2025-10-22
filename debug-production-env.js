// Debug production environment variables
console.log('🔍 PRODUCTION ENVIRONMENT DEBUG');
console.log('================================');

// Check all environment variables that should be available
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_USER',
  'POSTGRES_HOST',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL'
];

console.log('\n📋 Environment Variables Check:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
});

// Test database connection specifically
console.log('\n🔌 Testing Database Connection...');
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('📡 Attempting database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`📊 User count: ${userCount}`);
    
    // Test user creation (will rollback)
    console.log('🧪 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        username: 'prod_debug_' + Date.now(),
        email: 'prod_debug_' + Date.now() + '@test.com',
        firstName: 'Production',
        lastName: 'Debug',
        passwordHash: '$2a$12$test.hash.for.production.debug',
        role: 'ACQUISITIONS'
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('P1001')) {
      console.error('🔌 Connection refused - database server unreachable');
    } else if (error.message.includes('P1008')) {
      console.error('⏰ Connection timeout - database server too slow');
    } else if (error.message.includes('P1017')) {
      console.error('🔐 Authentication failed - wrong credentials');
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

testDatabaseConnection();