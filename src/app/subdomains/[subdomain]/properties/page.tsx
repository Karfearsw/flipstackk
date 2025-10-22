import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import PropertiesPage from '@/app/properties/page';

interface SubdomainPropertiesProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainProperties({ params }: SubdomainPropertiesProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/properties');
  }
  
  // Render the main properties component with subdomain context
  return <PropertiesPage />;
}