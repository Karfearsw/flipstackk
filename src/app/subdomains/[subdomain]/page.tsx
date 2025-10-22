import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';

interface SubdomainPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/');
  }
  
  // For now, redirect to the main dashboard
  // In the future, this could be customized per subdomain
  redirect('/dashboard');
}

// Generate static params for known subdomains (optional)
export async function generateStaticParams() {
  // You can define known subdomains here
  const knownSubdomains = ['app', 'admin', 'api', 'demo'];
  
  return knownSubdomains.map((subdomain) => ({
    subdomain,
  }));
}