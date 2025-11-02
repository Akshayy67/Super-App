import { realTimeAuth } from './realTimeAuth';

/**
 * Test function to fetch and update phone number from Google People API
 * Call this from browser console: fetchMyPhoneNumber()
 */
export const fetchMyPhoneNumber = async () => {
  console.log('📱 Fetching phone number from Google People API...');
  
  try {
    const phoneNumber = await realTimeAuth.fetchAndUpdatePhoneNumber();
    
    if (phoneNumber) {
      console.log('✅ Phone number fetched successfully:', phoneNumber);
      console.log('💾 Phone number has been saved to your user profile in Firestore');
      return phoneNumber;
    } else {
      console.log('📱 No phone number found in your Google profile');
      console.log('💡 Make sure your phone number is added to your Google account:');
      console.log('   1. Go to https://myaccount.google.com/');
      console.log('   2. Click on "Personal info"');
      console.log('   3. Add or verify your phone number');
      console.log('   4. Run fetchMyPhoneNumber() again');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching phone number:', error);
    console.log('💡 Possible issues:');
    console.log('   - Google People API might not be enabled');
    console.log('   - Missing phone number scope permission');
    console.log('   - Your phone number is not in your Google profile');
    return null;
  }
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).fetchMyPhoneNumber = fetchMyPhoneNumber;
  console.log('📱 Phone Number Test Function Available:');
  console.log('   - fetchMyPhoneNumber() - Fetch and update your phone number from Google');
}

