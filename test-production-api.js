const { PrismaClient } = require('@prisma/client');

// Use the exact DATABASE_URL from vercel.json
const DATABASE_URL = "postgresql://postgres.octipyiqduroxelobtli:stackkwallet@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

console.log("🔍 Testing production database connection...");
console.log("🔍 Using DATABASE_URL:", DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log("🔍 Attempting to connect to database...");
    
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");
    
    // Test if leads table exists and get count
    console.log("🔍 Testing leads table...");
    const leadCount = await prisma.lead.count();
    console.log(`✅ Leads table accessible. Total leads: ${leadCount}`);
    
    // Test if we can fetch some leads
    if (leadCount > 0) {
      console.log("🔍 Fetching sample leads...");
      const sampleLeads = await prisma.lead.findMany({
        take: 3,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true
        }
      });
      console.log("✅ Sample leads:", JSON.stringify(sampleLeads, null, 2));
    } else {
      console.log("⚠️ No leads found in database");
    }
    
    // Test the exact query from the tRPC endpoint
    console.log("🔍 Testing exact tRPC query...");
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 0,
        take: 10,
      }),
      prisma.lead.count(),
    ]);
    
    console.log("✅ tRPC query successful!");
    console.log(`✅ Found ${leads.length} leads, total: ${total}`);
    

    
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error message:", error.message);
    if (error.meta) {
      console.error("❌ Error meta:", error.meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log("🔍 Database connection closed");
  }
}

testConnection();