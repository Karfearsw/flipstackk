const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL from vercel.json
const prodDatabaseUrl = "postgresql://postgres:MG5sHkfVc04o91yU@db.brzgqeirdkpqxenjafan.supabase.co:5432/postgres";

console.log('🔍 Using production DATABASE_URL:', prodDatabaseUrl.substring(0, 50) + '...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl
    }
  }
});

async function testProductionDatabase() {
  try {
    console.log('🔍 Testing production database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if leads table exists and has data
    const leadCount = await prisma.lead.count();
    console.log(`📊 Total leads in database: ${leadCount}`);
    
    if (leadCount > 0) {
      const sampleLeads = await prisma.lead.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true
        }
      });
      console.log('📋 Sample leads:');
      console.log(JSON.stringify(sampleLeads, null, 2));
    } else {
      console.log('⚠️  No leads found in database');
    }
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`👥 Total users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionDatabase();