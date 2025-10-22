// Analytics and Performance Monitoring for Flipstackk
import { supabase } from './supabase';

export interface UserEvent {
  event_type: 'signup_attempt' | 'signup_success' | 'signup_failure' | 'login_attempt' | 'login_success' | 'login_failure' | 'trial_start' | 'activation_complete';
  user_id?: string;
  session_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
  error_message?: string;
  conversion_source?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface ConversionMetrics {
  signupConversionRate: number;
  trialToPaidRate: number;
  averageTimeToActivation: number;
  userRetention7d: number;
  userRetention30d: number;
  totalSignups: number;
  totalTrials: number;
  totalActivations: number;
}

class AnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track user events for conversion analysis
  async trackEvent(event: Omit<UserEvent, 'session_id' | 'timestamp'>): Promise<void> {
    try {
      const eventData: UserEvent = {
        ...event,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      };

      // Store in Supabase for analysis
      const { error } = await supabase
        .from('user_events')
        .insert([eventData]);

      if (error) {
        console.error('Analytics tracking error:', error);
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', eventData);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Track signup attempts and outcomes
  async trackSignupAttempt(source?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'signup_attempt',
      conversion_source: source,
      metadata: {
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      }
    });
  }

  async trackSignupSuccess(userId: string, source?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'signup_success',
      user_id: userId,
      conversion_source: source,
    });
  }

  async trackSignupFailure(error: string, source?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'signup_failure',
      error_message: error,
      conversion_source: source,
    });
  }

  // Track trial start (when user completes onboarding)
  async trackTrialStart(userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'trial_start',
      user_id: userId,
    });
  }

  // Track user activation (first meaningful action)
  async trackActivation(userId: string, activationType: string): Promise<void> {
    await this.trackEvent({
      event_type: 'activation_complete',
      user_id: userId,
      metadata: {
        activation_type: activationType,
      }
    });
  }

  // Calculate conversion metrics
  async getConversionMetrics(dateRange: { start: Date; end: Date }): Promise<ConversionMetrics> {
    try {
      const { data: events, error } = await supabase
        .from('user_events')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (error) {
        console.error('Error fetching conversion metrics:', error);
        return this.getDefaultMetrics();
      }

      const signupAttempts = events?.filter(e => e.event_type === 'signup_attempt').length || 0;
      const signupSuccesses = events?.filter(e => e.event_type === 'signup_success').length || 0;
      const trialStarts = events?.filter(e => e.event_type === 'trial_start').length || 0;
      const activations = events?.filter(e => e.event_type === 'activation_complete').length || 0;

      return {
        signupConversionRate: signupAttempts > 0 ? (signupSuccesses / signupAttempts) * 100 : 0,
        trialToPaidRate: trialStarts > 0 ? (activations / trialStarts) * 100 : 0,
        averageTimeToActivation: this.calculateAverageTimeToActivation(events || []),
        userRetention7d: 0, // Requires more complex calculation
        userRetention30d: 0, // Requires more complex calculation
        totalSignups: signupSuccesses,
        totalTrials: trialStarts,
        totalActivations: activations
      };
    } catch (error) {
      console.error('Failed to get conversion metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // Helper method to get default metrics
  private getDefaultMetrics(): ConversionMetrics {
    return {
      signupConversionRate: 0,
      trialToPaidRate: 0,
      averageTimeToActivation: 0,
      userRetention7d: 0,
      userRetention30d: 0,
      totalSignups: 0,
      totalTrials: 0,
      totalActivations: 0
    };
  }

  // Helper method to calculate average time to activation
  private calculateAverageTimeToActivation(events: UserEvent[]): number {
    const signupEvents = events.filter(e => e.event_type === 'signup_success');
    const activationEvents = events.filter(e => e.event_type === 'activation_complete');
    
    if (signupEvents.length === 0 || activationEvents.length === 0) {
      return 0;
    }

    let totalTime = 0;
    let count = 0;

    activationEvents.forEach(activation => {
      const signup = signupEvents.find(s => s.user_id === activation.user_id);
      if (signup) {
        const timeDiff = new Date(activation.timestamp).getTime() - new Date(signup.timestamp).getTime();
        totalTime += timeDiff;
        count++;
      }
    });

    return count > 0 ? totalTime / count / (1000 * 60 * 60) : 0; // Convert to hours
  }

  // Performance monitoring for authentication endpoints
  async trackAuthPerformance(endpoint: string, duration: number, success: boolean): Promise<void> {
    await this.trackEvent({
      event_type: success ? 'login_success' : 'login_failure',
      metadata: {
        endpoint,
        duration_ms: duration,
        performance_metric: true,
      }
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Utility functions for common tracking scenarios
export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined') {
    analytics.trackEvent({
      event_type: 'signup_attempt', // Using as generic page view for now
      metadata: {
        page,
        timestamp: new Date().toISOString(),
      }
    });
  }
};

export const trackButtonClick = (buttonName: string, location: string) => {
  analytics.trackEvent({
    event_type: 'signup_attempt', // Using as generic interaction for now
    metadata: {
      button_name: buttonName,
      location,
      interaction_type: 'button_click',
    }
  });
};