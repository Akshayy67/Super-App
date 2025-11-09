// n8n Integration Service - Triggers n8n workflows from the main app
import axios from 'axios';

class N8nIntegrationService {
  private readonly n8nBaseUrl: string;
  private readonly webhookSecret: string;

  constructor() {
    this.n8nBaseUrl = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';
    this.webhookSecret = import.meta.env.VITE_N8N_WEBHOOK_SECRET || '';
  }

  // Trigger job hunt workflow
  async triggerJobHunt(userId: string, preferences?: {
    role?: string;
    location?: string;
    experience?: string;
    remoteOnly?: boolean;
  }) {
    try {
      const response = await axios.post(
        `${this.n8nBaseUrl}/webhook/job-hunt`,
        {
          userId,
          preferences: preferences || {},
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Job hunt workflow triggered successfully',
      };
    } catch (error: any) {
      console.error('Error triggering job hunt workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to trigger job hunt workflow',
      };
    }
  }

  // Trigger daily email workflow (usually triggered by cron, but can be manual)
  async triggerDailyEmail(userId: string, email: string) {
    try {
      const response = await axios.post(
        `${this.n8nBaseUrl}/webhook/daily-email`,
        {
          userId,
          email,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Daily email sent successfully',
      };
    } catch (error: any) {
      console.error('Error triggering daily email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send daily email',
      };
    }
  }

  // Trigger monthly summary workflow
  async triggerMonthlySummary(userId: string, email: string) {
    try {
      const response = await axios.post(
        `${this.n8nBaseUrl}/webhook/monthly-summary`,
        {
          userId,
          email,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Monthly summary generated successfully',
      };
    } catch (error: any) {
      console.error('Error triggering monthly summary:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate monthly summary',
      };
    }
  }

  // Trigger SWOT analysis after contest completion
  async triggerContestSWOT(userId: string, contestId: string, contestResult: any) {
    try {
      const response = await axios.post(
        `${this.n8nBaseUrl}/webhook/contest-swot`,
        {
          userId,
          contestId,
          contestResult,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'SWOT analysis triggered successfully',
      };
    } catch (error: any) {
      console.error('Error triggering SWOT analysis:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to trigger SWOT analysis',
      };
    }
  }

  // Check n8n connection status
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/healthz`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('n8n connection check failed:', error);
      return false;
    }
  }

  // Get workflow execution status
  async getExecutionStatus(executionId: string) {
    try {
      const response = await axios.get(
        `${this.n8nBaseUrl}/api/v1/executions/${executionId}`,
        {
          headers: {
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching execution status:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Batch trigger job hunt for multiple users (admin only)
  async batchTriggerJobHunt(userIds: string[], preferences: any) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.triggerJobHunt(userId, preferences))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      total: results.length,
      successful,
      failed,
      results,
    };
  }

  // Subscribe user to daily emails
  async subscribeToDailyEmails(userId: string, email: string, preferences: {
    timezone?: string;
    timePreference?: string;
  } = {}) {
    try {
      // This would typically update user preferences in Firebase
      // and n8n cron would pick it up automatically
      console.log(`User ${userId} subscribed to daily emails`);
      
      return {
        success: true,
        message: 'Successfully subscribed to daily emails',
      };
    } catch (error: any) {
      console.error('Error subscribing to daily emails:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Unsubscribe from daily emails
  async unsubscribeFromDailyEmails(userId: string) {
    try {
      console.log(`User ${userId} unsubscribed from daily emails`);
      
      return {
        success: true,
        message: 'Successfully unsubscribed from daily emails',
      };
    } catch (error: any) {
      console.error('Error unsubscribing from daily emails:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const n8nIntegrationService = new N8nIntegrationService();
