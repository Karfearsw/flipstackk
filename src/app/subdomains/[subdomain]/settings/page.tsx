import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import SettingsPage from '@/app/settings/page';

interface SubdomainSettingsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainSettings({ params }: SubdomainSettingsProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/settings');
  }
  
  // Render the main settings component with subdomain context
  return <SettingsPage />;
}