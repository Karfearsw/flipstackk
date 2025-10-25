import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only log debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SIGNUP API DEBUG:');
      console.log('Environment:', process.env.VERCEL_ENV || 'local');
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    }
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

    // Validate role - map frontend roles to database enum values
    const roleMapping: { [key: string]: string } = {
      'investor': 'ADMIN',
      'agent': 'AGENT',
      'wholesaler': 'ACQUISITIONS',
      'flipper': 'ACQUISITIONS',
      'other': 'AGENT'
    };

    const dbRole = roleMapping[role];
    if (!dbRole) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    // Check if user already exists
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
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        role: dbRole
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ User created successfully:', {
        username: user.username,
        email: user.email,
        role: user.role
      });
    }

    return res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (error.message.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Handle Prisma connection errors
    if (error instanceof Error && (
      error.message.includes('Can\'t reach database server') ||
      error.message.includes('Connection refused') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('P1001') ||
      error.message.includes('timeout')
    )) {
      console.error('🔌 Database connection error:', error.message);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Handle bcrypt errors
    if (error instanceof Error && error.message.includes('bcrypt')) {
      console.error('🔐 Password hashing error');
      return res.status(500).json({ error: 'Password processing failed' });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}