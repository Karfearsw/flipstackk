"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Settings, Bell } from 'lucide-react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { StatusHeader } from '@/components/monitoring/status-header';
import { useState } from 'react';

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { refreshNow, isAutoRefreshEnabled, startAutoRefresh, stopAutoRefresh } = useRealTimeData({
    onUpdate: () => setLastRefresh(new Date())
  });

  const handleRefresh = () => {
    refreshNow();
    setLastRefresh(new Date());
  };

  const toggleAutoRefresh = () => {
    if (isAutoRefreshEnabled) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time insights and analytics for your CRM
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <StatusHeader 
          variant="flag" 
          showTooltip={true}
          className="mr-2"
        />
        
        <div className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
        
        <Badge variant={isAutoRefreshEnabled ? "default" : "secondary"} className="text-xs">
          {isAutoRefreshEnabled ? "Live" : "Manual"}
        </Badge>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoRefresh}
          className="text-xs"
        >
          <Bell className="h-3 w-3 mr-1" />
          {isAutoRefreshEnabled ? "Disable Live" : "Enable Live"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>
    </div>
  );
}