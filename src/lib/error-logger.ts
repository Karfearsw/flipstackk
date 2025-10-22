interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  source: 'client' | 'server' | 'database' | 'auth' | 'api';
}

interface AlertConfig {
  enabled: boolean;
  webhookUrl?: string;
  emailRecipients?: string[];
  slackChannel?: string;
  discordWebhook?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 1000;
  private alertConfig: AlertConfig = {
    enabled: true,
  };

  constructor() {
    // Initialize with environment-based alert configuration
    this.alertConfig = {
      enabled: process.env.NODE_ENV === 'production',
      webhookUrl: process.env.ERROR_WEBHOOK_URL,
      emailRecipients: process.env.ERROR_EMAIL_RECIPIENTS?.split(','),
      slackChannel: process.env.SLACK_ERROR_CHANNEL,
      discordWebhook: process.env.DISCORD_ERROR_WEBHOOK,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendAlert(errorLog: ErrorLog): Promise<void> {
    if (!this.alertConfig.enabled) return;

    try {
      // Send to webhook if configured
      if (this.alertConfig.webhookUrl) {
        await this.sendWebhookAlert(errorLog);
      }

      // Send to Slack if configured
      if (this.alertConfig.slackChannel) {
        await this.sendSlackAlert(errorLog);
      }

      // Send to Discord if configured
      if (this.alertConfig.discordWebhook) {
        await this.sendDiscordAlert(errorLog);
      }

      // Add system alert
      await this.addSystemAlert(errorLog);
    } catch (alertError) {
      console.error('Failed to send error alert:', alertError);
    }
  }

  private async sendWebhookAlert(errorLog: ErrorLog): Promise<void> {
    if (!this.alertConfig.webhookUrl) return;

    const payload = {
      timestamp: errorLog.timestamp,
      level: errorLog.level,
      message: errorLog.message,
      source: errorLog.source,
      context: errorLog.context,
      stack: errorLog.stack,
      url: errorLog.url,
    };

    await fetch(this.alertConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  private async sendSlackAlert(errorLog: ErrorLog): Promise<void> {
    // Implementation would depend on Slack webhook setup
    console.log('Slack alert would be sent:', errorLog);
  }

  private async sendDiscordAlert(errorLog: ErrorLog): Promise<void> {
    if (!this.alertConfig.discordWebhook) return;

    const embed = {
      title: `🚨 ${errorLog.level.toUpperCase()} Alert`,
      description: errorLog.message,
      color: this.getAlertColor(errorLog.level),
      fields: [
        {
          name: 'Source',
          value: errorLog.source,
          inline: true,
        },
        {
          name: 'Timestamp',
          value: new Date(errorLog.timestamp).toLocaleString(),
          inline: true,
        },
        {
          name: 'URL',
          value: errorLog.url || 'N/A',
          inline: true,
        },
      ],
      footer: {
        text: `Error ID: ${errorLog.id}`,
      },
    };

    if (errorLog.stack) {
      embed.fields.push({
        name: 'Stack Trace',
        value: `\`\`\`${errorLog.stack.substring(0, 1000)}\`\`\``,
        inline: false,
      });
    }

    await fetch(this.alertConfig.discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  }

  private async addSystemAlert(errorLog: ErrorLog): Promise<void> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/health/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-alert',
          level: errorLog.level === 'critical' ? 'error' : errorLog.level,
          message: `${errorLog.source}: ${errorLog.message}`,
        }),
      });
    } catch (error) {
      console.error('Failed to add system alert:', error);
    }
  }

  private getAlertColor(level: string): number {
    switch (level) {
      case 'critical':
        return 0xff0000; // Red
      case 'error':
        return 0xff6600; // Orange
      case 'warning':
        return 0xffff00; // Yellow
      case 'info':
        return 0x0099ff; // Blue
      default:
        return 0x808080; // Gray
    }
  }

  async log(
    level: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    options: {
      error?: Error;
      context?: Record<string, any>;
      userId?: string;
      sessionId?: string;
      url?: string;
      userAgent?: string;
      source?: 'client' | 'server' | 'database' | 'auth' | 'api';
    } = {}
  ): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      stack: options.error?.stack,
      context: options.context,
      userId: options.userId,
      sessionId: options.sessionId,
      url: options.url,
      userAgent: options.userAgent,
      source: options.source || 'server',
    };

    // Add to in-memory logs
    this.logs.unshift(errorLog);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${message}`, {
        context: options.context,
        stack: options.error?.stack,
      });
    }

    // Send alerts for errors and critical issues
    if (level === 'error' || level === 'critical') {
      await this.sendAlert(errorLog);
    }

    // Store in database for production (if needed)
    if (process.env.NODE_ENV === 'production') {
      await this.storeInDatabase(errorLog);
    }
  }

  private async storeInDatabase(errorLog: ErrorLog): Promise<void> {
    try {
      // This would store in your database
      // Implementation depends on your database setup
      console.log('Would store in database:', errorLog);
    } catch (error) {
      console.error('Failed to store error log in database:', error);
    }
  }

  async info(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    return this.log('info', message, options);
  }

  async warning(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    return this.log('warning', message, options);
  }

  async error(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    return this.log('error', message, options);
  }

  async critical(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    return this.log('critical', message, options);
  }

  getLogs(
    filters: {
      level?: 'info' | 'warning' | 'error' | 'critical';
      source?: 'client' | 'server' | 'database' | 'auth' | 'api';
      limit?: number;
      since?: Date;
    } = {}
  ): ErrorLog[] {
    let filteredLogs = [...this.logs];

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.source) {
      filteredLogs = filteredLogs.filter(log => log.source === filters.source);
    }

    if (filters.since) {
      filteredLogs = filteredLogs.filter(
        log => new Date(log.timestamp) >= filters.since!
      );
    }

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    bySource: Record<string, number>;
    recentErrors: number;
  } {
    const byLevel: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    let recentErrors = 0;

    this.logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      bySource[log.source] = (bySource[log.source] || 0) + 1;

      if (
        new Date(log.timestamp) >= oneHourAgo &&
        (log.level === 'error' || log.level === 'critical')
      ) {
        recentErrors++;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      bySource,
      recentErrors,
    };
  }

  clearLogs(): void {
    this.logs = [];
  }

  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export types
export type { ErrorLog, AlertConfig };