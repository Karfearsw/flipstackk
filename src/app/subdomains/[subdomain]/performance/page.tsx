import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import PerformancePage from '@/app/performance/page';

interface SubdomainPerformanceProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainPerformance({ params }: SubdomainPerformanceProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/performance');
  }
  
  // Render the main performance component with subdomain context
  return <PerformancePage />;
}