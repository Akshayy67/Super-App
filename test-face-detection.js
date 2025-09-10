/**
 * Test script for Face Detection Integration
 * Run this in the browser console to test the face detection functionality
 */

// Test Face Detection Service
async function testFaceDetectionService() {
  console.log('🎯 Testing Face Detection Service...');
  
  try {
    // Import the face detection service (adjust path as needed)
    const { faceDetectionService } = await import('./src/utils/faceDetection.ts');
    
    // Test initialization
    console.log('📋 Testing initialization...');
    const initialized = await faceDetectionService.initialize();
    console.log('✅ Initialization result:', initialized);
    
    // Test settings update
    console.log('📋 Testing settings update...');
    faceDetectionService.updateSettings({
      yawThreshold: 20,
      pitchThreshold: 20,
      confidenceThreshold: 0.8
    });
    console.log('✅ Settings updated successfully');
    
    console.log('🎉 Face Detection Service tests completed!');
    
  } catch (error) {
    console.error('❌ Face Detection Service test failed:', error);
  }
}

// Test Video Element Integration
function testVideoIntegration() {
  console.log('📹 Testing Video Integration...');
  
  // Find video elements in the page
  const videoElements = document.querySelectorAll('video');
  console.log(`📋 Found ${videoElements.length} video element(s)`);
  
  videoElements.forEach((video, index) => {
    console.log(`📹 Video ${index + 1}:`, {
      width: video.videoWidth,
      height: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused,
      srcObject: !!video.srcObject
    });
  });
  
  if (videoElements.length === 0) {
    console.log('⚠️ No video elements found. Make sure camera is active.');
  }
}

// Test Face Detection Components
function testFaceDetectionComponents() {
  console.log('🧩 Testing Face Detection Components...');
  
  // Check for face detection controls
  const faceDetectionToggle = document.querySelector('[data-testid="face-detection-toggle"]') ||
                              document.querySelector('button:contains("Face Detection")');
  
  if (faceDetectionToggle) {
    console.log('✅ Face detection toggle found');
  } else {
    console.log('⚠️ Face detection toggle not found');
  }
  
  // Check for overlay canvas
  const overlayCanvas = document.querySelector('canvas');
  if (overlayCanvas) {
    console.log('✅ Overlay canvas found:', {
      width: overlayCanvas.width,
      height: overlayCanvas.height
    });
  } else {
    console.log('⚠️ Overlay canvas not found');
  }
  
  // Check for eye contact status
  const eyeContactStatus = document.querySelector('[data-testid="eye-contact-status"]') ||
                          document.querySelector('*:contains("Eye Contact")');
  
  if (eyeContactStatus) {
    console.log('✅ Eye contact status component found');
  } else {
    console.log('⚠️ Eye contact status component not found');
  }
}

// Test Camera Permissions
async function testCameraPermissions() {
  console.log('📷 Testing Camera Permissions...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });
    
    console.log('✅ Camera access granted:', {
      tracks: stream.getTracks().length,
      video: stream.getVideoTracks().length,
      audio: stream.getAudioTracks().length
    });
    
    // Clean up
    stream.getTracks().forEach(track => track.stop());
    
  } catch (error) {
    console.error('❌ Camera access failed:', error.message);
    
    if (error.name === 'NotAllowedError') {
      console.log('💡 Tip: Grant camera permissions and try again');
    } else if (error.name === 'NotFoundError') {
      console.log('💡 Tip: Make sure a camera is connected');
    }
  }
}

// Test Browser Compatibility
function testBrowserCompatibility() {
  console.log('🌐 Testing Browser Compatibility...');
  
  const features = {
    'getUserMedia': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    'Canvas 2D': !!(document.createElement('canvas').getContext('2d')),
    'RequestAnimationFrame': !!window.requestAnimationFrame,
    'WebGL': !!(document.createElement('canvas').getContext('webgl')),
    'Web Workers': !!window.Worker,
    'ES6 Modules': typeof import !== 'undefined'
  };
  
  console.log('📋 Browser Feature Support:');
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`${supported ? '✅' : '❌'} ${feature}: ${supported}`);
  });
  
  // Check for specific APIs that might be needed
  const advancedFeatures = {
    'MediaPipe': typeof window.MediaPipe !== 'undefined',
    'TensorFlow.js': typeof window.tf !== 'undefined',
    'WebAssembly': typeof WebAssembly !== 'undefined'
  };
  
  console.log('📋 Advanced Feature Support:');
  Object.entries(advancedFeatures).forEach(([feature, supported]) => {
    console.log(`${supported ? '✅' : '⚠️'} ${feature}: ${supported}`);
  });
}

// Performance Test
function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  let frameCount = 0;
  let startTime = performance.now();
  
  function measureFPS() {
    frameCount++;
    const elapsed = performance.now() - startTime;
    
    if (elapsed >= 1000) { // 1 second
      const fps = (frameCount / elapsed) * 1000;
      console.log(`📊 Current FPS: ${fps.toFixed(1)}`);
      
      frameCount = 0;
      startTime = performance.now();
    }
    
    requestAnimationFrame(measureFPS);
  }
  
  console.log('📋 Starting FPS measurement (check console for updates)...');
  requestAnimationFrame(measureFPS);
  
  // Stop after 10 seconds
  setTimeout(() => {
    console.log('⏹️ FPS measurement stopped');
  }, 10000);
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Face Detection Integration Tests...');
  console.log('=====================================');
  
  await testCameraPermissions();
  console.log('');
  
  testBrowserCompatibility();
  console.log('');
  
  testVideoIntegration();
  console.log('');
  
  testFaceDetectionComponents();
  console.log('');
  
  await testFaceDetectionService();
  console.log('');
  
  testPerformance();
  
  console.log('=====================================');
  console.log('🎉 All tests completed!');
  console.log('💡 Check the console output above for any issues');
}

// Export functions for manual testing
window.faceDetectionTests = {
  runAllTests,
  testCameraPermissions,
  testBrowserCompatibility,
  testVideoIntegration,
  testFaceDetectionComponents,
  testFaceDetectionService,
  testPerformance
};

// Instructions
console.log('🎯 Face Detection Test Suite Loaded!');
console.log('');
console.log('📋 Available Commands:');
console.log('• faceDetectionTests.runAllTests() - Run all tests');
console.log('• faceDetectionTests.testCameraPermissions() - Test camera access');
console.log('• faceDetectionTests.testBrowserCompatibility() - Check browser support');
console.log('• faceDetectionTests.testVideoIntegration() - Test video elements');
console.log('• faceDetectionTests.testFaceDetectionComponents() - Test UI components');
console.log('• faceDetectionTests.testFaceDetectionService() - Test face detection service');
console.log('• faceDetectionTests.testPerformance() - Measure FPS performance');
console.log('');
console.log('🚀 Run faceDetectionTests.runAllTests() to start testing!');

// Auto-run basic tests if this script is executed directly
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    console.log('🔄 Auto-running basic compatibility tests...');
    testBrowserCompatibility();
  }, 1000);
}
