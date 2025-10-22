'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import Link from 'next/link';
import { analytics } from '../../lib/analytics';

export default function SignupPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.firstName || 
        !formData.lastName || !formData.password || !formData.confirmPassword || !formData.role) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Track signup attempt
    await analytics.trackSignupAttempt('organic');

    const startTime = Date.now();

    try {
      console.log('🚀 Starting signup process...');
      
      // Primary: Try Supabase signup first
      console.log('📡 Attempting Supabase signup...');
      const supabaseResponse = await fetch('/api/auth/signup-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role
        })
      });

      const supabaseData = await supabaseResponse.json();
      const duration = Date.now() - startTime;

      if (supabaseResponse.ok) {
        console.log('✅ Supabase signup successful!');
        await analytics.trackSignupSuccess(supabaseData.user.id, 'organic');
        await analytics.trackAuthPerformance('/api/auth/signup-supabase', duration, true);
        setSuccess('Account created successfully! You can now sign in.');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          role: 'investor'
        });
        return;
      }

      console.log('❌ Supabase signup failed:', supabaseData.error);
      await analytics.trackAuthPerformance('/api/auth/signup-supabase', duration, false);

      // Secondary: Try Prisma signup
      console.log('📡 Attempting Prisma signup fallback...');
      const prismaResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role
        })
      });

      const prismaData = await prismaResponse.json();

      if (prismaResponse.ok) {
        console.log('✅ Prisma signup successful!');
        await analytics.trackSignupSuccess(prismaData.user.id, 'organic');
        setSuccess('Account created successfully! You can now sign in.');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          role: 'investor'
        });
        return;
      }

      console.log('❌ Prisma signup failed:', prismaData.error);

      // Tertiary: If Prisma fails with database connection error, try fallback
      if (prismaData.error === 'Database connection failed') {
        console.log('📡 Attempting fallback signup...');
        const fallbackResponse = await fetch('/api/auth/signup-fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.password,
            role: formData.role
          })
        });

        const fallbackData = await fallbackResponse.json();

        if (fallbackResponse.ok) {
          console.log('✅ Fallback signup successful!');
          await analytics.trackSignupSuccess('fallback_user', 'organic');
          setSuccess('Account created successfully in fallback mode! Please contact support to complete setup.');
          
          // Reset form
          setFormData({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
            role: 'investor'
          });
          return;
        }

        console.log('❌ Fallback signup failed:', fallbackData.error);
        await analytics.trackSignupFailure(fallbackData.error, 'organic');
        setError(fallbackData.error || 'All signup methods failed. Please try again later.');
      } else {
        await analytics.trackSignupFailure(prismaData.error, 'organic');
        setError(prismaData.error || 'Failed to create account. Please try again.');
      }

    } catch (error) {
      console.error('💥 Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      await analytics.trackSignupFailure(errorMessage, 'organic');
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex flex-col space-y-2 text-center">
              <CardTitle className="text-2xl font-bold text-center text-black">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm text-center text-black">
                Join FlipStackk to access the live data dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-black">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-black">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-black">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="flipper">House Flipper</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Start Your Trial'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}