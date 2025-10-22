'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialAuthErrorProps {
  error: string;
  provider?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const getErrorMessage = (error: string, provider?: string) => {
  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Social';
  
  switch (error) {
    case 'OAuthSignin':
      return `Error occurred during ${providerName} sign-in. Please try again.`;
    case 'OAuthCallback':
      return `${providerName} authentication callback failed. Please try again.`;
    case 'OAuthCreateAccount':
      return `Failed to create account with ${providerName}. The email might already be registered.`;
    case 'EmailCreateAccount':
      return 'An account with this email already exists. Please sign in instead.';
    case 'Callback':
      return `Authentication callback error. Please try signing in again.`;
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with another account. Please sign in with your original method.';
    case 'EmailSignin':
      return 'Failed to send sign-in email. Please check your email address.';
    case 'CredentialsSignin':
      return 'Invalid credentials. Please check your email and password.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    case 'AccessDenied':
      return `Access denied by ${providerName}. Please check your permissions and try again.`;
    case 'Verification':
      return 'Verification token has expired or is invalid. Please try signing in again.';
    default:
      return error || `${providerName} authentication failed. Please try again.`;
  }
};

const getErrorType = (error: string) => {
  const retryableErrors = [
    'OAuthSignin',
    'OAuthCallback', 
    'Callback',
    'EmailSignin',
    'AccessDenied'
  ];
  
  const accountLinkingErrors = [
    'OAuthCreateAccount',
    'EmailCreateAccount', 
    'OAuthAccountNotLinked'
  ];
  
  if (retryableErrors.includes(error)) {
    return 'retryable';
  } else if (accountLinkingErrors.includes(error)) {
    return 'account-linking';
  } else {
    return 'general';
  }
};

export function SocialAuthError({ error, provider, onRetry, onDismiss }: SocialAuthErrorProps) {
  const errorMessage = getErrorMessage(error, provider);
  const errorType = getErrorType(error);
  
  return (
    <Alert className="border-red-200 bg-red-50 mb-4">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 pr-8">
        <div className="flex flex-col space-y-2">
          <span>{errorMessage}</span>
          
          {errorType === 'account-linking' && (
            <div className="text-sm text-red-700 mt-2">
              <p>💡 <strong>Tip:</strong> Try signing in with your original method, then link your accounts in settings.</p>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            {errorType === 'retryable' && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8 text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 text-red-600 hover:bg-red-100"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}