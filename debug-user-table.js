const { PrismaClient } = require('@prisma/client');

async function debugUserTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DEBUGGING USER TABLE STRUCTURE AND DATA...\n');
    
    // Get all users with ALL fields
    const users = await prisma.user.findMany();
    
    console.log(`📊 Total users found: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`👤 USER ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   First Name: ${user.firstName}`);
      console.log(`   Last Name: ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.passwordHash ? 'EXISTS (' + user.passwordHash.length + ' chars)' : 'NULL/MISSING'}`);
      console.log(`   Password Hash Preview: ${user.passwordHash ? user.passwordHash.substring(0, 30) + '...' : 'N/A'}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log(`   Updated At: ${user.updatedAt}`);
      console.log('   ---');
    });
    
    // Check for specific test users
    console.log('\n🎯 CHECKING SPECIFIC TEST USERS:');
    
    const testUsernames = ['admin', 'test', 'user', 'whoisotp', 'ibby'];
    
    for (const username of testUsernames) {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      if (user) {
        console.log(`✅ ${username}: EXISTS - Password Hash: ${user.passwordHash ? 'PRESENT' : 'MISSING'}`);
      } else {
        console.log(`❌ ${username}: NOT FOUND`);
      }
    }
    
    // Check database schema info
    console.log('\n📋 CHECKING TABLE SCHEMA:');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    
    console.log('User table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserTable();