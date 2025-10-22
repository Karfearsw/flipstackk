import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../../lib/supabase';

// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 SUPABASE SIGNUP API DEBUG:');
    console.log('Environment:', process.env.VERCEL_ENV || 'local');
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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

    // Check if user already exists by username
    const { data: existingUserByUsername, error: usernameCheckError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('username', username)
      .single();

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      console.error('Username check error:', usernameCheckError);
      return res.status(500).json({ error: 'Database error during username check' });
    }

    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if user already exists by email
    const { data: existingUserByEmail, error: emailCheckError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Email check error:', emailCheckError);
      return res.status(500).json({ error: 'Database error during email check' });
    }

    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for the user ID
    const userId = generateUUID();

    // Create user in Supabase - include ID and use correct column name 'passwordHash'
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('User')
      .insert([
        {
          id: userId, // Explicitly provide ID
          username,
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword, // Use correct column name
          role: dbRole, // Use mapped database role
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    console.log('✅ User created successfully:', newUser.id);

    // Return success response (don't include password)
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('💥 Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}