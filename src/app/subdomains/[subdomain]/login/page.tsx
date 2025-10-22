import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import LoginPage from '@/app/login/page';

interface SubdomainLoginProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainLogin({ params }: SubdomainLoginProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/login');
  }
  
  // Render the main login component with subdomain context
  return <LoginPage />;
}