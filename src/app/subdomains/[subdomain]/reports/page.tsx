import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import ReportsPage from '@/app/reports/page';

interface SubdomainReportsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainReports({ params }: SubdomainReportsProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/reports');
  }
  
  // Render the main reports component with subdomain context
  return <ReportsPage />;
}