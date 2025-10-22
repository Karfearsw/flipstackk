"use client";

import { KPIWidget } from './KPIWidget';
import { trpc } from '@/lib/trpc-client';
import { Users, UserCheck, CheckSquare, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface KPIGridProps {
  className?: string;
}

export function KPIGrid({ className }: KPIGridProps) {
  const { data: kpis, isLoading, error } = trpc.analytics.getKPIs.useQuery();

  if (error) {
    return (
      <div className={className}>
        <div className="text-red-500 text-center p-4">
          Error loading KPI data
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      <KPIWidget
        title="Total Leads"
        value={kpis?.totalLeads ?? 0}
        change={kpis?.leadsChange ? {
          value: kpis.leadsChange,
          type: kpis.leadsChange >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        } : undefined}
        icon={Users}
        color="blue"
        isLoading={isLoading}
      />
      
      <KPIWidget
        title="Active Buyers"
        value={kpis?.activeBuyers ?? 0}
        change={kpis?.buyersChange ? {
          value: kpis.buyersChange,
          type: kpis.buyersChange >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        } : undefined}
        icon={UserCheck}
        color="green"
        isLoading={isLoading}
      />
      
      <KPIWidget
        title="Pending Tasks"
        value={kpis?.pendingTasks ?? 0}
        icon={Clock}
        color="yellow"
        isLoading={isLoading}
      />
      
      <KPIWidget
        title="Completed Tasks"
        value={kpis?.completedTasks ?? 0}
        change={kpis?.tasksChange ? {
          value: kpis.tasksChange,
          type: kpis.tasksChange >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        } : undefined}
        icon={CheckSquare}
        color="green"
        isLoading={isLoading}
      />
      
      <KPIWidget
        title="Total Revenue"
        value={kpis?.totalRevenue ? `$${kpis.totalRevenue.toLocaleString()}` : '$0'}
        change={kpis?.revenueChange ? {
          value: kpis.revenueChange,
          type: kpis.revenueChange >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        } : undefined}
        icon={DollarSign}
        color="purple"
        isLoading={isLoading}
      />
      
      <KPIWidget
        title="Conversion Rate"
        value={kpis?.conversionRate ? `${kpis.conversionRate.toFixed(1)}%` : '0%'}
        change={kpis?.conversionChange ? {
          value: kpis.conversionChange,
          type: kpis.conversionChange >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        } : undefined}
        icon={TrendingUp}
        color="blue"
        isLoading={isLoading}
      />
    </div>
  );
}