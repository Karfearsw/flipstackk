import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  // Connection pool configuration
  __internal: {
    engine: {
      connectTimeout: 60000, // 60 seconds
      queryTimeout: 60000,   // 60 seconds
    },
  },
});

// Connection management
let isConnected = false;

// Ensure connection is established with proper error handling
if (!globalForPrisma.prisma) {
  prisma.$connect()
    .then(() => {
      isConnected = true;
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Failed to connect to database:', error);
      isConnected = false;
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
});

process.on('SIGINT', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
  process.exit(0);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;