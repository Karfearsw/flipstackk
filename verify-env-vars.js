const { PrismaClient } = require('@prisma/client');

async function verifyEnvironmentVariables() {
  console.log('🔍 VERIFYING ENVIRONMENT VARIABLES...\n');
  
  // Check local environment variables
  console.log('📋 LOCAL ENVIRONMENT VARIABLES:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING'}`);
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING'}`);
  console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  
  if (process.env.DATABASE_URL) {
    console.log(`DATABASE_URL value: ${process.env.DATABASE_URL.substring(0, 50)}...`);
  }
  
  if (process.env.NEXTAUTH_URL) {
    console.log(`NEXTAUTH_URL value: ${process.env.NEXTAUTH_URL}`);
  }
  
  if (process.env.NEXTAUTH_SECRET) {
    console.log(`NEXTAUTH_SECRET value: ${process.env.NEXTAUTH_SECRET.substring(0, 20)}...`);
  }
  
  console.log('\n🔌 TESTING DATABASE CONNECTION...');
  
  try {
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test specific user lookup
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found in database');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password Hash: ${adminUser.passwordHash ? 'PRESENT' : 'MISSING'}`);
    } else {
      console.log('❌ Admin user NOT found in database');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  console.log('\n🎯 CRITICAL CHECKS FOR PRODUCTION:');
  console.log('1. DATABASE_URL should match Vercel production environment');
  console.log('2. NEXTAUTH_URL should be set to production domain');
  console.log('3. NEXTAUTH_SECRET should be consistent across environments');
  console.log('4. Users should exist with proper password hashes');
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Verify Vercel environment variables match local');
  console.log('2. Deploy to production');
  console.log('3. Test authentication on production domain');
}

verifyEnvironmentVariables();