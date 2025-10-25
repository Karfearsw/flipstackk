import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Fallback signup without database - for testing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Mock user creation (no database)
    const user = {
      id: `user_${Date.now()}`,
      username,
      email,
      firstName,
      lastName,
      role: dbRole,
      createdAt: new Date().toISOString()
    };

    console.log('✅ Mock user created successfully:', {
      username: user.username,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({
      message: 'User created successfully (fallback mode - no database)',
      user
    });

  } catch (error) {
    console.error('❌ Signup fallback error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    });
  }
}