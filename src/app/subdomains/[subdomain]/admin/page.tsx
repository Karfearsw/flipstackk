import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import AdminPage from '@/app/admin/page';

interface SubdomainAdminProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainAdmin({ params }: SubdomainAdminProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain - only allow admin subdomain for admin pages
  if (!subdomain || subdomain === 'www' || subdomain !== 'admin') {
    redirect('/admin');
  }
  
  // Render the main admin component with subdomain context
  return <AdminPage />;
}