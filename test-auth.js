const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function testAuthentication() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔐 Testing authentication flow...\n');
    
    // Test users to authenticate
    const testUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'whoisotp', password: 'stackk10m' },
      { username: 'ibby', password: 'stackk10m' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`Testing user: ${testUser.username}`);
      
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { username: testUser.username }
      });
      
      if (!user) {
        console.log(`❌ User ${testUser.username} not found in database`);
        continue;
      }
      
      console.log(`✅ User found: ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash: ${user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'NULL/UNDEFINED'}`);
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare(testUser.password, user.passwordHash);
      
      if (isPasswordValid) {
        console.log(`✅ Password verification successful for ${testUser.username}`);
      } else {
        console.log(`❌ Password verification failed for ${testUser.username}`);
        
        // Test if password is stored as plain text (debugging)
        if (user.passwordHash === testUser.password) {
          console.log(`⚠️  Password stored as plain text for ${testUser.username}`);
        }
      }
      
      console.log('---');
    }
    
    // Test bcrypt functionality
    console.log('\n🧪 Testing bcrypt functionality:');
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`Test hash: ${hashedPassword}`);
    console.log(`Verification result: ${isValid ? '✅ Success' : '❌ Failed'}`);
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthentication();