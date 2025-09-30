// Test script to verify Zoom SDK setup
// Run with: node test-zoom-setup.js

import jwt from "jsonwebtoken";

// Test configuration
const testConfig = {
  ZOOM_SDK_KEY: "gcHNMjRhPnQkT7E_XvYA",
  ZOOM_SDK_SECRET: "RMkELKT4sE5VCOURY6XvgQ554hG8G0Or",
  meetingNumber: "123456789",
};

function generateTestSignature(sdkKey, sdkSecret, meetingNumber, role = 0) {
  try {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 hours

    const oHeader = {
      alg: "HS256",
      typ: "JWT",
    };

    const oPayload = {
      iss: sdkKey,
      exp: exp,
      iat: iat,
      aud: "zoom",
      appKey: sdkKey,
      tokenExp: exp,
      alg: "HS256",
    };

    const signature = jwt.sign(oPayload, sdkSecret, { header: oHeader });

    console.log("✅ Signature generated successfully!");
    console.log("Signature:", signature.substring(0, 50) + "...");
    return signature;
  } catch (error) {
    console.error("❌ Error generating signature:", error.message);
    return null;
  }
}

function testZoomSetup() {
  console.log("🧪 Testing Zoom SDK Setup...\n");

  // Check if credentials are provided
  if (testConfig.ZOOM_SDK_KEY === "your_sdk_key_here") {
    console.log("❌ Please update ZOOM_SDK_KEY in the test script");
    return;
  }

  if (testConfig.ZOOM_SDK_SECRET === "your_sdk_secret_here") {
    console.log("❌ Please update ZOOM_SDK_SECRET in the test script");
    return;
  }

  console.log("📋 Configuration:");
  console.log("SDK Key:", testConfig.ZOOM_SDK_KEY.substring(0, 10) + "...");
  console.log("Meeting Number:", testConfig.meetingNumber);
  console.log("");

  // Test signature generation
  const signature = generateTestSignature(
    testConfig.ZOOM_SDK_KEY,
    testConfig.ZOOM_SDK_SECRET,
    testConfig.meetingNumber
  );

  if (signature) {
    console.log("\n✅ Zoom SDK setup appears to be working!");
    console.log("You can now use these credentials in your .env.local file");
  } else {
    console.log(
      "\n❌ Zoom SDK setup has issues. Please check your credentials."
    );
  }
}

// Run the test
testZoomSetup();
