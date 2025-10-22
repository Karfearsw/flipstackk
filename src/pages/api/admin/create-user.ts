import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 ADMIN API: Direct user creation started');
    console.log('Environment:', process.env.VERCEL_ENV || 'local');
    
    const { username, email, firstName, lastName, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !firstName || !lastName || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate role
    const validRoles = ['ADMIN', 'ACQUISITIONS', 'MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    console.log('📡 ADMIN API: Testing database connection...');
    
    // Test database connection first
    await prisma.$connect();
    console.log('✅ ADMIN API: Database connection successful');

    // Check if user already exists
    console.log('🔍 ADMIN API: Checking for existing users...');
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    console.log('🔐 ADMIN API: Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ ADMIN API: Password hashed successfully');

    // Create user
    console.log('👤 ADMIN API: Creating user in database...');
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('🎉 ADMIN API: User created successfully:', newUser.id);

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });

  } catch (error: any) {
    console.error('❌ ADMIN API: Error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (target?.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(400).json({ error: 'User with this information already exists' });
    }

    // Handle database connection errors
    if (error.name === 'PrismaClientInitializationError') {
      console.error('🔌 ADMIN API: Database connection failed');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Handle bcrypt errors
    if (error.message?.includes('bcrypt')) {
      console.error('🔐 ADMIN API: Password hashing failed');
      return res.status(500).json({ error: 'Password processing failed' });
    }

    // Generic error response
    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      error: 'Internal server error',
      ...(isDevelopment && { details: error.message })
    });

  } finally {
    await prisma.$disconnect();
    console.log('🔌 ADMIN API: Database connection closed');
  }
}