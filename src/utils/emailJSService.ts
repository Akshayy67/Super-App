import emailjs from '@emailjs/browser';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  teamName?: string;
  inviterName?: string;
  inviteCode?: string;
}

export class EmailJSService {
  private isInitialized = false;
  private emailjsServiceId: string;
  private emailjsTemplateId: string;
  private emailjsPublicKey: string;

  constructor() {
    // Get EmailJS configuration from environment variables
    this.emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    
    if (this.emailjsServiceId && this.emailjsTemplateId && this.emailjsPublicKey) {
      this.isInitialized = true;
      console.log('✅ EmailJS service initialized successfully');
    } else {
      console.warn('⚠️ EmailJS configuration incomplete. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file');
    }
  }

  /**
   * Send a team invitation email using EmailJS
   */
  async sendTeamInvite(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { 
        success: false, 
        error: 'EmailJS not initialized. Please check your configuration.' 
      };
    }

    try {
      console.log('📧 Sending email via EmailJS:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });

      // Prepare template parameters for EmailJS
      const templateParams = {
        to_email: emailData.to,
        to_name: emailData.to.split('@')[0], // Extract name from email
        team_name: emailData.teamName || 'Team',
        inviter_name: emailData.inviterName || 'Team Member',
        invite_code: emailData.inviteCode || 'INVITE123',
        app_url: window.location.origin,
        message: emailData.text, // Fallback for simple templates
        reply_to: 'noreply@yourdomain.com'
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        this.emailjsServiceId,
        this.emailjsTemplateId,
        templateParams,
        this.emailjsPublicKey
      );

      console.log('✅ Email sent successfully via EmailJS:', result);

      // Store email log for debugging
      const emailLog = {
        id: Date.now(),
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html.length,
        textLength: emailData.text.length,
        timestamp: new Date().toISOString(),
        status: 'sent',
        emailjsResult: result
      };

      // Store in localStorage for debugging
      const existingEmails = JSON.parse(localStorage.getItem('emailLog') || '[]');
      existingEmails.push(emailLog);
      localStorage.setItem('emailLog', JSON.stringify(existingEmails));

      return { success: true };
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      
      // Store error log
      const errorLog = {
        id: Date.now(),
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      const existingEmails = JSON.parse(localStorage.getItem('emailLog') || '[]');
      existingEmails.push(errorLog);
      localStorage.setItem('emailLog', JSON.stringify(existingEmails));

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Test EmailJS connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { 
        success: false, 
        error: 'EmailJS not initialized. Please check your configuration.' 
      };
    }

    try {
      // Test EmailJS connection by sending a test email
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        team_name: 'Test Team',
        inviter_name: 'Test User',
        invite_code: 'TEST123',
        app_url: window.location.origin,
        message: 'This is a test email to verify EmailJS connection.',
        reply_to: 'noreply@yourdomain.com'
      };

      const result = await emailjs.send(
        this.emailjsServiceId,
        this.emailjsTemplateId,
        testParams,
        this.emailjsPublicKey
      );

      console.log('✅ EmailJS connection test successful:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ EmailJS connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  /**
   * Get email log from localStorage (for debugging)
   */
  getEmailLog() {
    try {
      return JSON.parse(localStorage.getItem('emailLog') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear email log
   */
  clearEmailLog() {
    localStorage.removeItem('emailLog');
  }
}

export const emailJSService = new EmailJSService();
