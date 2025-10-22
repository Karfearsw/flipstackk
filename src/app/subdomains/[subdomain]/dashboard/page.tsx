import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import DashboardPage from '@/app/dashboard/page';

interface SubdomainDashboardProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainDashboard({ params }: SubdomainDashboardProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/dashboard');
  }
  
  // Render the main dashboard component with subdomain context
  return <DashboardPage />;
}