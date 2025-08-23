import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Settings, TestTube } from 'lucide-react';
import { emailJSService } from '../utils/emailJSService';
import { emailTemplates } from '../utils/emailTemplates';

export const EmailTestPanel: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testEmailService = async () => {
    if (!testEmail.trim()) return;

    setLoading(true);
    setResult(null);

    try {
             // Test EmailJS connection first
      const connectionTest = await emailJSService.testConnection();
     
      if (!connectionTest.success) {
        setResult({
          success: false,
          message: `Connection test failed: ${connectionTest.error}`
        });
        return;
      }

      // Generate test email content
      const emailData = {
        teamName: 'Test Team',
        inviterName: 'Test User',
        inviteeEmail: testEmail,
        inviteCode: 'TEST123',
        teamId: 'test-team',
        appUrl: window.location.origin
      };

      const emailSubject = emailTemplates.generateTeamInviteSubject(emailData);
      const emailHTML = emailTemplates.generateTeamInviteHTML(emailData);
      const emailText = emailTemplates.generateTeamInviteText(emailData);

                    // Send test email
      const emailResult = await emailJSService.sendTeamInvite({
        to: testEmail,
        subject: emailSubject,
        html: emailHTML,
        text: emailText,
        teamName: 'Test Team',
        inviterName: 'Test User',
        inviteCode: 'TEST123'
      });

      if (emailResult.success) {
        setResult({
          success: true,
          message: `Test email sent successfully to ${testEmail}! Check your inbox.`
        });
      } else {
        setResult({
          success: false,
          message: `Failed to send test email: ${emailResult.error}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <TestTube className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Email Service Test</h2>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Settings className="w-4 h-4" />
                         <span>
              Test your EmailJS configuration
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {result && (
          <div className={`mb-4 p-3 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </span>
            </div>
          </div>
        )}

        {/* Email Log */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Email Log</span>
                         <button
              onClick={() => {
                emailJSService.clearEmailLog();
                window.location.reload();
              }}
             className="text-xs text-red-600 hover:text-red-800"
           >
             Clear Log
           </button>
          </div>
          <div className="max-h-32 overflow-y-auto">
                       {emailJSService.getEmailLog().length > 0 ? (
            emailJSService.getEmailLog().slice(-3).map((email: any) => (
               <div key={email.id} className="text-xs text-gray-600 mb-1">
                 <span className="font-medium">{email.to}</span> - {email.subject}
                 <br />
                 <span className="text-gray-500">{new Date(email.timestamp).toLocaleString()}</span>
               </div>
             ))
           ) : (
             <span className="text-xs text-gray-500">No emails sent yet</span>
           )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            Close
          </button>
          <button
            onClick={testEmailService}
            disabled={loading || !testEmail.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Test Email Service
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
