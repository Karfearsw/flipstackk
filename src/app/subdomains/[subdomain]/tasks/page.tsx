import { redirect } from 'next/navigation';
import { getDomainConfig } from '@/lib/domain';
import TasksPage from '@/app/tasks/page';

interface SubdomainTasksProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainTasks({ params }: SubdomainTasksProps) {
  const { subdomain } = await params;
  const domainConfig = await getDomainConfig();
  
  // Validate subdomain
  if (!subdomain || subdomain === 'www') {
    redirect('/tasks');
  }
  
  // Render the main tasks component with subdomain context
  return <TasksPage />;
}