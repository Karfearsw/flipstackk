'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export type StatusType = 'healthy' | 'warning' | 'critical';

interface StatusFlagProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const statusConfig = {
  healthy: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    text: 'Healthy',
    emoji: '🟢'
  },
  warning: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    text: 'Warning',
    emoji: '🟡'
  },
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    text: 'Critical',
    emoji: '🔴'
  }
};

const sizeConfig = {
  sm: {
    flag: 'w-3 h-3',
    icon: 'w-3 h-3',
    text: 'text-xs',
    container: 'gap-1'
  },
  md: {
    flag: 'w-4 h-4',
    icon: 'w-4 h-4',
    text: 'text-sm',
    container: 'gap-2'
  },
  lg: {
    flag: 'w-6 h-6',
    icon: 'w-5 h-5',
    text: 'text-base',
    container: 'gap-2'
  }
};

export function StatusFlag({ 
  status, 
  size = 'md', 
  showIcon = false, 
  showText = false,
  className 
}: StatusFlagProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  if (showText) {
    return (
      <div className={cn(
        'inline-flex items-center px-2 py-1 rounded-full border',
        config.bgColor,
        config.borderColor,
        sizes.container,
        className
      )}>
        {showIcon ? (
          <Icon className={cn(sizes.icon, config.textColor)} />
        ) : (
          <div className={cn('rounded-full', sizes.flag, config.color)} />
        )}
        <span className={cn(sizes.text, config.textColor, 'font-medium')}>
          {config.text}
        </span>
      </div>
    );
  }

  if (showIcon) {
    return (
      <Icon className={cn(sizes.icon, config.textColor, className)} />
    );
  }

  return (
    <div 
      className={cn(
        'rounded-full',
        sizes.flag,
        config.color,
        className
      )}
      title={config.text}
    />
  );
}

// Animated pulse version for real-time updates
export function AnimatedStatusFlag({ status, ...props }: StatusFlagProps) {
  return (
    <div className="relative">
      <StatusFlag status={status} {...props} />
      {status === 'critical' && (
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
      )}
    </div>
  );
}

// Status indicator with emoji (for better visual distinction)
export function EmojiStatusFlag({ status, className }: { status: StatusType; className?: string }) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('text-lg', className)} title={config.text}>
      {config.emoji}
    </span>
  );
}