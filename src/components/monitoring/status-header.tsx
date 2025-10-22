'use client';

import { useState, useEffect } from 'react';
import { StatusFlag, EmojiStatusFlag } from '@/components/ui/status-flag';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusHeaderProps {
  variant?: 'flag' | 'emoji' | 'minimal';
  showTooltip?: boolean;
  className?: string;
}

export function StatusHeader({ 
  variant = 'flag', 
  showTooltip = true,
  className 
}: StatusHeaderProps) {
  const { data: healthData } = trpc.health.getSystemHealth.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  const getStatusMessage = () => {
    if (!healthData) return 'Loading system status...';
    
    const criticalCount = Object.values(healthData.services).filter(s => s.status === 'critical').length;
    const warningCount = Object.values(healthData.services).filter(s => s.status === 'warning').length;
    
    if (criticalCount > 0) {
      return `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} detected`;
    }
    if (warningCount > 0) {
      return `${warningCount} service${warningCount > 1 ? 's' : ''} need attention`;
    }
    return 'All systems operational';
  };

  const renderStatusIndicator = () => {
    if (!healthData) {
      return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />;
    }

    switch (variant) {
      case 'emoji':
        return <EmojiStatusFlag status={healthData.overall} />;
      case 'minimal':
        return <StatusFlag status={healthData.overall} size="sm" />;
      default:
        return <StatusFlag status={healthData.overall} size="sm" />;
    }
  };

  const statusIndicator = renderStatusIndicator();

  if (!showTooltip) {
    return (
      <div className={cn('flex items-center', className)}>
        {statusIndicator}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center cursor-help', className)}>
            {statusIndicator}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{getStatusMessage()}</div>
            {healthData && (
              <div className="text-xs space-y-1">
                <div>Last checked: {new Date(healthData.timestamp).toLocaleTimeString()}</div>
                <div>Uptime: {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for navigation bars
export function CompactStatusHeader({ className }: { className?: string }) {
  return (
    <StatusHeader 
      variant="minimal" 
      showTooltip={true}
      className={cn('ml-2', className)}
    />
  );
}

// Emoji version for fun/casual interfaces
export function EmojiStatusHeader({ className }: { className?: string }) {
  return (
    <StatusHeader 
      variant="emoji" 
      showTooltip={true}
      className={className}
    />
  );
}