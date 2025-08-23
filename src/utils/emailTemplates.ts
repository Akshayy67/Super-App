export interface EmailTemplateData {
  teamName: string;
  inviterName: string;
  inviteeEmail: string;
  inviteCode: string;
  teamId: string;
  appUrl: string;
}

export const emailTemplates = {
  /**
   * Generate HTML content for team invitation email
   */
  generateTeamInviteHTML: (data: EmailTemplateData): string => {
    const { teamName, inviterName, inviteeEmail, inviteCode, appUrl, teamId } = data;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're invited to join ${teamName}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            background: #f8f9fa; 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
          }
          .invite-code { 
            background: #e3f2fd; 
            border: 2px dashed #2196f3; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
            margin: 20px 0;
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
          }
          .button { 
            display: inline-block; 
            background: #2196f3; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 500;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 You're Invited!</h1>
          <p>${inviterName} has invited you to join their team</p>
        </div>
        
        <div class="content">
          <h2>Join ${teamName}</h2>
          <p>Hello ${inviteeEmail},</p>
          
          <p><strong>${inviterName}</strong> has invited you to join their team <strong>${teamName}</strong> on our collaboration platform.</p>
          
          <p>This is your personal invitation code:</p>
          <div class="invite-code">${inviteCode}</div>
          
          <p>To accept this invitation:</p>
          <ol>
            <li>Click the "Join Team Now" button below to directly join the team</li>
            <li>Or visit our app at <a href="${appUrl}">${appUrl}</a> and enter the invitation code</li>
            <li>Start collaborating with your team!</li>
          </ol>
          
          <p><strong>Note:</strong> This invitation will expire in 7 days for security reasons.</p>
          
          <div style="text-align: center;">
            <a href="${appUrl}?invite=${inviteCode}&team=${teamId}" class="button">Join Team Now</a>
          </div>
          
          <p>If you have any questions, feel free to reach out to ${inviterName} or our support team.</p>
          
          <p>Best regards,<br>The Team Collaboration Platform</p>
        </div>
        
        <div class="footer">
          <p>This is an automated invitation email. Please do not reply to this message.</p>
          <p>If you didn't expect this invitation, you can safely ignore it.</p>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Generate plain text content for team invitation email
   */
  generateTeamInviteText: (data: EmailTemplateData): string => {
    const { teamName, inviterName, inviteeEmail, inviteCode, appUrl, teamId } = data;
    
    return `
You're Invited to Join ${teamName}!

Hello ${inviteeEmail},

${inviterName} has invited you to join their team ${teamName} on our collaboration platform.

Your personal invitation code is: ${inviteCode}

To accept this invitation:
1. Click the "Join Team Now" button in the email to directly join the team
2. Or visit our app at ${appUrl}?invite=${inviteCode}&team=${teamId}
3. Start collaborating with your team!

Note: This invitation will expire in 7 days for security reasons.

If you have any questions, feel free to reach out to ${inviterName} or our support team.

Best regards,
The Team Collaboration Platform

---
This is an automated invitation email. Please do not reply to this message.
If you didn't expect this invitation, you can safely ignore it.
    `.trim();
  },

  /**
   * Generate email subject line for team invitation
   */
  generateTeamInviteSubject: (data: EmailTemplateData): string => {
    return `You're invited to join ${data.teamName} - Team Collaboration Platform`;
  }
};
