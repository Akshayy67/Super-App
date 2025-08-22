#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Email Service for Team Invitations\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
}

// Read existing .env content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if SendGrid config already exists
if (envContent.includes('VITE_SENDGRID_API_KEY')) {
  console.log('✅ SendGrid configuration already exists in .env');
} else {
  console.log('\n📧 Adding SendGrid configuration to .env...');
  
  const sendGridConfig = `

# SendGrid Email Service Configuration
# Get your API key from: https://app.sendgrid.com/settings/api_keys
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Example with actual values (replace with your real values):
# VITE_SENDGRID_API_KEY=SG.ABC123xyz789...
# VITE_SENDGRID_FROM_EMAIL=noreply@super-app.tech
`;

  // Append to existing .env or create new one
  if (envExists) {
    fs.appendFileSync(envPath, sendGridConfig);
  } else {
    fs.writeFileSync(envPath, sendGridConfig);
  }
  
  console.log('✅ SendGrid configuration added to .env');
}

console.log('\n🎯 Next Steps:');
console.log('1. Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys');
console.log('2. Update the .env file with your actual API key');
console.log('3. Verify your sender domain in SendGrid dashboard');
console.log('4. Restart your development server');
console.log('5. Test the email service in Team Space → Settings');

console.log('\n📚 For detailed setup instructions, see: SENDGRID_SETUP.md');
console.log('\n✨ Your team invitation system is now ready for real email delivery!');
