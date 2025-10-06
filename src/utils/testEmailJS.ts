import { sendFeedbackEmail } from '../services/emailService';

/**
 * Test function to verify EmailJS configuration
 * Call this from browser console: testEmailJSConfiguration()
 */
export const testEmailJSConfiguration = async () => {
  console.log('🧪 Testing EmailJS Configuration...');
  
  const testFeedback = {
    type: 'feedback' as const,
    rating: 5,
    category: 'Testing',
    title: 'EmailJS Configuration Test',
    description: 'This is a test email to verify that the EmailJS configuration is working correctly. If you receive this email, the feedback system is properly set up!',
    email: 'test@example.com',
    priority: 'medium' as const,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('📧 Sending test email...');
    const success = await sendFeedbackEmail(testFeedback);
    
    if (success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check these inboxes:');
      console.log('   - akshay.juluri@super-app.tech');
      console.log('   - gyanmote.akhil@super-app.tech');
      console.log('   - support@super-app.tech');
      console.log('   - admin@super-app.tech');
      return true;
    } else {
      console.log('❌ Test email failed to send');
      console.log('💾 Check localStorage for saved feedback');
      return false;
    }
  } catch (error) {
    console.error('🚨 Test failed with error:', error);
    return false;
  }
};

/**
 * Test urgent notification
 */
export const testUrgentNotification = async () => {
  console.log('🚨 Testing Urgent Notification...');
  
  const urgentFeedback = {
    type: 'bug' as const,
    rating: 1,
    category: 'Critical Bug',
    title: 'URGENT: Test Critical Bug Report',
    description: 'This is a test urgent notification for a critical bug. This should trigger the urgent email template.',
    email: 'test@example.com',
    priority: 'high' as const,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🚨 Sending urgent test email...');
    const success = await sendFeedbackEmail(urgentFeedback);
    
    if (success) {
      console.log('✅ Urgent test email sent successfully!');
      console.log('📬 Check all 4 inboxes for both regular and urgent emails');
      return true;
    } else {
      console.log('❌ Urgent test email failed to send');
      return false;
    }
  } catch (error) {
    console.error('🚨 Urgent test failed with error:', error);
    return false;
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testEmailJSConfiguration = testEmailJSConfiguration;
  (window as any).testUrgentNotification = testUrgentNotification;
  
  console.log('🧪 EmailJS Test Functions Available:');
  console.log('   - testEmailJSConfiguration() - Test regular feedback email');
  console.log('   - testUrgentNotification() - Test urgent notification email');
}
