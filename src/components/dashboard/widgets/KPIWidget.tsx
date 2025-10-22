"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  className?: string;
  isLoading?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function KPIWidget({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className,
  isLoading = false,
  color = 'blue'
}: KPIWidgetProps) {
  const colorClasses = {
    blue: 'text-black bg-gray-100',
    green: 'text-black bg-gray-100',
    yellow: 'text-black bg-gray-100',
    red: 'text-white bg-red-500',
    purple: 'text-black bg-gray-100',
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">{title}</CardTitle>
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-black">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">{value}</div>
        {change && (
          <p className="text-xs text-black mt-1">
            <span className={cn(
              'font-medium',
              change.type === 'increase' ? 'text-red-500' : 'text-black'
            )}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            {' '}from {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
}