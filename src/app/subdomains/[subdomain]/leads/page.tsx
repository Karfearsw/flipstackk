import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import LeadsPage from '@/app/leads/page';

interface SubdomainLeadsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainLeads({ params }: SubdomainLeadsProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/leads');
  }
  
  // Render the main leads component with subdomain context
  return <LeadsPage />;
}