#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 EmailJS Setup Helper');
console.log('========================\n');

const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('VITE_EMAILJS_SERVICE_ID')) {
    console.log('✅ EmailJS configuration already present');
    console.log('\n📧 Your EmailJS is already configured!');
    console.log('🚀 You can now test sending real emails.');
  } else {
    console.log('⚠️  .env file exists but EmailJS configuration is missing');
    appendEmailJSConfig();
  }
} else {
  console.log('📝 Creating new .env file...');
  createEnvFile();
}

function createEnvFile() {
  const envContent = `# EmailJS Configuration
# Get these values from https://www.emailjs.com/
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Example:
# VITE_EMAILJS_SERVICE_ID=service_abc123
# VITE_EMAILJS_TEMPLATE_ID=template_xyz789
# VITE_EMAILJS_PUBLIC_KEY=user_def456
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
  console.log('\n📝 Please edit the .env file with your EmailJS credentials');
}

function appendEmailJSConfig() {
  const emailJSConfig = `

# EmailJS Configuration
# Get these values from https://www.emailjs.com/
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Example:
# VITE_EMAILJS_SERVICE_ID=service_abc123
# VITE_EMAILJS_TEMPLATE_ID=template_xyz789
# VITE_EMAILJS_PUBLIC_KEY=user_def456
`;

  fs.appendFileSync(envPath, emailJSConfig);
  console.log('✅ EmailJS configuration added to .env file');
  console.log('\n📝 Please edit the .env file with your actual EmailJS credentials');
}

console.log('\n📚 Next Steps:');
console.log('1. Go to https://www.emailjs.com/ and create an account');
console.log('2. Create an email service (Gmail recommended)');
console.log('3. Create an email template (see EMAILJS_SETUP_GUIDE.md)');
console.log('4. Copy your Service ID, Template ID, and Public Key');
console.log('5. Update the .env file with your credentials');
console.log('6. Restart your development server: npm run dev');
console.log('7. Test the email service in Team Space → Settings');

console.log('\n📖 For detailed instructions, see: EMAILJS_SETUP_GUIDE.md');
console.log('\n🎯 Your team invitation system is ready for real emails!');
