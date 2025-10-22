import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import SignupPage from '@/app/signup/page';

interface SubdomainSignupProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainSignup({ params }: SubdomainSignupProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/signup');
  }
  
  // Render the main signup component with subdomain context
  return <SignupPage />;
}