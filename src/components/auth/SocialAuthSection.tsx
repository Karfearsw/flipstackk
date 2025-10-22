'use client';

import { SocialAuthButton } from './SocialAuthButton';
import { Separator } from '@/components/ui/separator';

interface SocialAuthSectionProps {
  mode: 'signin' | 'signup';
  disabled?: boolean;
  className?: string;
}

export function SocialAuthSection({ mode, disabled, className = '' }: SocialAuthSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Social Authentication Buttons */}
      <div className="space-y-3">
        <SocialAuthButton 
          provider="google" 
          mode={mode} 
          disabled={disabled}
        />
        <SocialAuthButton 
          provider="github" 
          mode={mode} 
          disabled={disabled}
        />
        <SocialAuthButton 
          provider="facebook" 
          mode={mode} 
          disabled={disabled}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}