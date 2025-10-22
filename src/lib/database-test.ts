import { prisma } from './prisma';

export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 User count: ${userCount}`);
    
    return { success: true, userCount };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  } finally {
    await prisma.$disconnect();
  }
}