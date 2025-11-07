import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Check, Star, Sparkles, Gift, TrendingUp, Crown, Loader2, LogIn, LogOut, User, Briefcase, Target, BookOpen, MessageSquare, Rocket } from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';

export const PaymentPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'student'>('monthly');
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const mouseDownRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, targetRotationX: 0, targetRotationY: 0, rotationX: 0, rotationY: 0 });

  // Check current user on mount and auth changes
  useEffect(() => {
    const checkUser = () => {
      const user = realTimeAuth.getCurrentUser();
      setCurrentUser(user);
    };
    
    checkUser();
    
    // Listen for auth state changes
    const unsubscribe = realTimeAuth.onAuthStateChange((user) => {
      setCurrentUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  // Prevent redirects away from payment page while user is on it
  useEffect(() => {
    // Add a flag to prevent App.tsx from redirecting away from payment page
    sessionStorage.setItem('onPaymentPage', 'true');
    
    return () => {
      // Remove flag when leaving payment page
      sessionStorage.removeItem('onPaymentPage');
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Premium scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / 2 / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    
    const canvasWidth = window.innerWidth / 2;
    const canvasHeight = window.innerHeight;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    // Premium WebGL Globe - similar to blocked page
    const globeRadius = 9;
    const globeSegments = 128;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, globeSegments, globeSegments);
    
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: `
        precision highp float;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normal);
          vUv = uv;
          
          vec3 pos = position;
          float wave = sin(time * 0.3 + length(position) * 0.5) * 0.15;
          pos += normalize(position) * wave;
          
          float noise = sin(pos.x * 2.0 + time * 0.5) * sin(pos.y * 2.0 + time * 0.5) * sin(pos.z * 2.0 + time * 0.5) * 0.05;
          pos += normalize(position) * noise;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          float elevation = (vNormal.y + 1.0) * 0.5;
          
          // Premium gold/blue colors
          vec3 darkColor = vec3(0.2, 0.4, 0.8);
          vec3 mediumColor = vec3(0.4, 0.6, 1.0);
          vec3 brightColor = vec3(0.6, 0.8, 1.0);
          
          vec3 baseColor = mix(darkColor, mediumColor, elevation);
          baseColor = mix(baseColor, brightColor, elevation * elevation);
          
          float pattern = sin(vUv.x * 20.0) * sin(vUv.y * 20.0) * 0.02;
          baseColor += vec3(pattern);
          
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float light = max(dot(vNormal, lightDir), 0.3);
          baseColor *= light;
          
          float edgeGlow = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          baseColor += vec3(edgeGlow * 0.15);
          
          vec3 fdx = dFdx(vPosition);
          vec3 fdy = dFdy(vPosition);
          vec3 normal = normalize(cross(fdx, fdy));
          float wireframe = abs(dot(vNormal, normal));
          wireframe = smoothstep(0.98, 1.0, wireframe);
          
          vec3 finalColor = mix(baseColor * 1.3, baseColor, wireframe);
          
          gl_FragColor = vec4(finalColor, 0.3);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    const wireframeGeometry = new THREE.SphereGeometry(globeRadius + 0.02, 64, 64);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeMesh);

    const innerGlowGeometry = new THREE.SphereGeometry(globeRadius - 0.5, 32, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    scene.add(innerGlowMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 1.0, 100);
    pointLight.position.set(15, 15, 15);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x4a90e2, 0.8, 100);
    pointLight2.position.set(-15, -15, -15);
    scene.add(pointLight2);

    camera.position.z = 25;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.clientX <= window.innerWidth / 2 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right) {
          mouseDownRef.current = true;
          mouseRef.current.x = event.clientX;
          mouseRef.current.y = event.clientY;
          event.preventDefault();
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseRef.current && mouseDownRef.current) {
        const deltaX = event.clientX - mouseRef.current.x;
        const deltaY = event.clientY - mouseRef.current.y;
        
        mouseRef.current.targetRotationY += deltaX * 0.01;
        mouseRef.current.targetRotationX += deltaY * 0.01;
        
        mouseRef.current.x = event.clientX;
        mouseRef.current.y = event.clientY;
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
    };

    const handleMouseWheel = (event: WheelEvent) => {
      if (event.clientX <= window.innerWidth / 2 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right) {
          event.preventDefault();
          camera.position.z += event.deltaY * 0.05;
          camera.position.z = Math.max(15, Math.min(40, camera.position.z));
        }
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = Date.now() * 0.001;
      globeMaterial.uniforms.time.value = currentTime;

      mouseRef.current.rotationY += (mouseRef.current.targetRotationY - mouseRef.current.rotationY) * 0.1;
      mouseRef.current.rotationX += (mouseRef.current.targetRotationX - mouseRef.current.rotationX) * 0.1;
      
      globeMesh.rotation.y = mouseRef.current.rotationY;
      globeMesh.rotation.x = mouseRef.current.rotationX;
      wireframeMesh.rotation.y = mouseRef.current.rotationY;
      wireframeMesh.rotation.x = mouseRef.current.rotationX;
      innerGlowMesh.rotation.y = mouseRef.current.rotationY;
      innerGlowMesh.rotation.x = mouseRef.current.rotationX;

      if (!mouseDownRef.current) {
        mouseRef.current.targetRotationY += 0.003;
      }

      camera.position.x = Math.sin(currentTime * 0.1) * 1;
      camera.position.y = Math.cos(currentTime * 0.08) * 1;
      camera.lookAt(0, 0, 0);

      pointLight.position.x = Math.sin(currentTime * 0.3) * 15;
      pointLight.position.y = Math.cos(currentTime * 0.3) * 15;
      pointLight2.position.x = Math.cos(currentTime * 0.25) * -15;
      pointLight2.position.y = Math.sin(currentTime * 0.25) * -15;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    const handleResize = () => {
      const canvasWidth = window.innerWidth / 2;
      const canvasHeight = window.innerHeight;
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
    };

    window.addEventListener('resize', handleResize);

    // GSAP animations
    gsap.fromTo('.payment-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
    );

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('wheel', handleMouseWheel);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      globeMaterial.dispose();
      globeGeometry.dispose();
      wireframeMaterial.dispose();
      wireframeGeometry.dispose();
      innerGlowMaterial.dispose();
      innerGlowGeometry.dispose();
    };
  }, []);

  const plans = {
    monthly: { price: 299, originalPrice: 999, savings: 70, launchOffer: true },
    yearly: { price: 999, originalPrice: 11988, savings: 92, launchOffer: true },
    student: { price: 99, originalPrice: 999, savings: 90, launchOffer: true },
  };

  const handleReferralCode = async () => {
    if (!referralCode.trim()) {
      alert('Please enter a referral or voucher code');
      return;
    }
    
    try {
      const user = realTimeAuth.getCurrentUser();
      if (!user) {
        alert('Please sign in to use a code');
        return;
      }

      // Import referral code service
      const { 
        redeemReferralCode, 
        validateDiscountCode 
      } = await import('../services/referralCodeService');
      
      // First, try to validate as discount code
      const discountValidation = await validateDiscountCode(referralCode.trim());
      
      if (discountValidation.valid) {
        // It's a discount code - store it for use during payment
        setDiscountCode(referralCode.trim().toUpperCase());
        setDiscountPercentage(discountValidation.discountPercentage || 50);
        setReferralApplied(true);
        alert(`✅ Discount code applied! You'll get ${discountValidation.discountPercentage}% off when you proceed to payment!`);
        return;
      } else if (discountValidation.error) {
        // Show specific error for discount codes
        alert(discountValidation.error);
        return;
      }
      
      // If not a discount code, try to redeem as referral/voucher (pass selected plan type)
      const result = await redeemReferralCode(
        referralCode.trim(),
        user.id,
        user.email,
        selectedPlan
      );

      if (result.success) {
        setReferralApplied(true);
        const codeTypeLabel = result.codeType === "voucher" ? "Voucher" : "Referral code";
        alert(`🎉 ${codeTypeLabel} applied! You now have ${result.premiumMonths} month${result.premiumMonths !== 1 ? 's' : ''} of premium access for free!`);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        // Check if it's a discount code error
        if (result.error?.includes('discount code')) {
          // Try validating as discount code
          const discountCheck = await validateDiscountCode(referralCode.trim());
          if (discountCheck.valid) {
            setDiscountCode(referralCode.trim().toUpperCase());
            setDiscountPercentage(discountCheck.discountPercentage || 50);
            setReferralApplied(true);
            alert(`✅ Discount code applied! You'll get ${discountCheck.discountPercentage}% off when you proceed to payment!`);
          } else {
            alert(discountCheck.error || 'Invalid code. Please check and try again.');
          }
        } else {
          alert(result.error || 'Invalid code. Please check and try again.');
        }
      }
    } catch (error: any) {
      console.error('Code error:', error);
      alert(error.message || 'Failed to apply code. Please try again.');
    }
  };

  const handlePayment = async (planType: 'monthly' | 'yearly' | 'student') => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Wait a bit for auth state to be ready, then check user
      let user = realTimeAuth.getCurrentUser();
      if (!user) {
        // Wait a moment and try again (auth state might still be initializing)
        await new Promise(resolve => setTimeout(resolve, 500));
        user = realTimeAuth.getCurrentUser();
      }
      
      if (!user) {
        throw new Error('Please sign in to continue. If you are already signed in, please refresh the page.');
      }

      // For student plan, prompt user to submit verification request (but allow payment to proceed)
      if (planType === 'student') {
        const { isVerifiedStudent, getStudentVerificationByUserId } = await import('../services/studentVerificationService');
        const isVerified = await isVerifiedStudent(user.id);
        
        if (!isVerified) {
          // Check if there's a verification request
          const verification = await getStudentVerificationByUserId(user.id);
          
          if (!verification) {
            // No verification request exists - prompt user to submit one
            const submit = window.confirm(
              'Student discount requires manual verification.\n\n' +
              '📧 You will receive email updates about your verification status.\n' +
              '⏱️ Approval typically takes 1-7 business days.\n' +
              '🚀 Need faster approval? Email: support@super-app.tech\n\n' +
              'You can proceed with payment, but your student status will need to be verified by our team.\n\n' +
              'Would you like to submit a verification request now? (You can also do this after payment)'
            );
            
            if (submit) {
              const email = window.prompt('Enter your Email ID:', user.email || '');
              const mobileNumber = window.prompt('Enter your Mobile Number (with country code, e.g., +91XXXXXXXXXX):');
              const studentId = window.prompt('Enter your Student ID:');
              const institution = window.prompt('Enter your School/University name:');
              const notes = window.prompt('Additional notes (optional):');
              
              if (email && mobileNumber && studentId && institution) {
                const { createStudentVerificationRequest } = await import('../services/studentVerificationService');
                await createStudentVerificationRequest(
                  user.id,
                  email,
                  mobileNumber,
                  studentId,
                  institution,
                  notes || undefined
                );
                alert(
                  '✅ Student verification request submitted!\n\n' +
                  '📧 Please check your email for confirmation.\n\n' +
                  '⏱️ Approval typically takes 1-7 business days.\n\n' +
                  '🚀 Need faster approval or have questions?\n' +
                  'Email us at: support@super-app.tech\n\n' +
                  'You can proceed with payment now.'
                );
              } else {
                alert(
                  '⚠️ Email, Mobile Number, Student ID, and Institution are required.\n\n' +
                  'Verification request cancelled. You can still proceed with payment and submit verification later.\n\n' +
                  '📧 For help or faster approval, email: support@super-app.tech'
                );
              }
            }
            // Continue with payment even if verification request wasn't submitted
          } else if (verification.status === 'rejected') {
            const proceed = window.confirm(
              `Your previous student verification was rejected. ${verification.rejectionReason ? 'Reason: ' + verification.rejectionReason : ''}\n\n` +
              '📧 Approval typically takes 1-7 business days.\n' +
              '🚀 Need faster approval or have questions? Email: support@super-app.tech\n\n' +
              'Would you like to proceed with payment anyway? You can submit a new verification request after payment.'
            );
            if (!proceed) {
              setIsProcessing(false);
              return;
            }
          }
          // If pending or no verification, allow payment to proceed (will be verified manually by admin)
        }
      }

      // Get plan details
      const plan = plans[planType];
      let amount = plan.price * 100; // Convert to paise
      
      // Apply discount if discount code is applied
      if (discountCode && discountPercentage) {
        const discountAmount = Math.round(amount * (discountPercentage / 100));
        amount = amount - discountAmount;
        console.log(`💰 Applying ${discountPercentage}% discount: Original ₹${plan.price}, Discounted ₹${amount / 100}`);
      }

      // Import payment service
      const { initiatePayment } = await import('../services/paymentService');
      
      // Initiate payment (will redirect to callback URL on success/failure)
      const result = await initiatePayment({
        amount: amount,
        currency: 'INR',
        planType: planType,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.username || user.email || 'User',
      });
      
      // If discount code was used, mark it as applied (will be finalized after payment success)
      if (discountCode && result.success) {
        // Store discount code in sessionStorage to apply after payment verification
        sessionStorage.setItem('pendingDiscountCode', discountCode);
      }

      if (result.success) {
        // Payment modal opened - user will be redirected to callback URL
        // The callback URL (/payment-success) will handle verification
        console.log('✅ Payment modal opened. User will be redirected after payment.');
        // Don't redirect here - Razorpay will handle redirect via callback_url
        // Note: If user cancels, the promise will resolve with success: false and error message
      } else {
        // Payment was cancelled or failed to open
        const errorMessage = result.error || 'Failed to open payment gateway. Please try again.';
        if (errorMessage.includes('cancelled')) {
          // Show cancellation message specifically
          setPaymentError('Payment is cancelled by user');
        } else {
          setPaymentError(errorMessage);
        }
        setIsProcessing(false);
        return; // Don't throw error, just show the message
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-black flex flex-row"
    >
      {/* Three.js Canvas - Interactive Globe on left side */}
      <div 
        className="relative w-1/2 h-full overflow-hidden" 
        style={{ zIndex: 1 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ 
            opacity: isLoaded ? 1 : 0, 
            transition: 'opacity 1s ease-in',
          }}
        />
        <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 text-sm font-light pointer-events-none" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)', zIndex: 10 }}>
          Drag to rotate • Scroll to zoom
        </p>
      </div>

      {/* Right Side - Payment Content */}
      <div 
        className="relative w-1/2 h-full overflow-y-auto px-8 md:px-16 py-12" 
        style={{ 
          backgroundColor: '#000000',
          zIndex: 100,
        }}
      >
        {/* Sign In/Out Button */}
        <div className="absolute top-4 right-4 z-50">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
                <User className="w-4 h-4" />
                <span className="max-w-[200px] truncate">{currentUser.email || currentUser.username}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await realTimeAuth.logout();
                    setCurrentUser(null);
                    setReferralApplied(false);
                    setDiscountCode(null);
                    setDiscountPercentage(null);
                    setReferralCode('');
                    // Redirect to landing page
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    alert('Failed to sign out. Please try again.');
                  }
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                // Redirect to landing page to sign in
                window.location.href = '/';
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
        
        <div className="payment-content max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-5xl md:text-6xl font-black text-white">
                GO PREMIUM
              </h1>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              Unlock the full potential of Super Study
            </p>
            <p className="text-lg text-gray-400">
              Join thousands of students already using premium features
            </p>
          </div>

          {/* Special Offers Banner */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-6 mb-8 animate-pulse">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse">
                  🎉 LAUNCH SPECIAL - LIMITED TIME!
                </h3>
                <p className="text-gray-200">
                  Monthly: ₹299 (70% OFF) • Student: ₹99 (90% OFF) • Use referral code for FREE premium!
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Monthly Plan */}
            <div 
              className={`relative bg-gray-900 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === 'monthly' 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/50 scale-105' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              {plans.monthly.launchOffer && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🎉 LAUNCH OFFER
                </div>
              )}
              {selectedPlan === 'monthly' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black text-white">₹{plans.monthly.price}</span>
                  <span className="text-gray-400 line-through">₹{plans.monthly.originalPrice}</span>
                </div>
                <p className="text-sm text-green-400 mt-2 font-semibold">
                  {plans.monthly.savings}% OFF
                </p>
                <p className="text-gray-400 text-sm mt-1">per month</p>
              </div>
              <ul className="space-y-3 mb-6">
                {['Unlimited AI Chat', 'All Study Tools', 'HD Video Meetings', 'Priority Support'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Plan - Best Value */}
            <div 
              className={`relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === 'yearly' 
                  ? 'border-yellow-500 shadow-2xl shadow-yellow-500/50 scale-105' 
                  : 'border-yellow-500/50 hover:border-yellow-500'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Yearly</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black text-white">₹{plans.yearly.price}</span>
                  <span className="text-gray-400 line-through">₹{plans.yearly.originalPrice}</span>
                </div>
                <p className="text-sm text-green-400 mt-2 font-semibold">
                  {plans.yearly.savings}% OFF
                </p>
                <p className="text-gray-400 text-sm mt-1">per year</p>
                <p className="text-yellow-400 text-sm font-bold mt-2">
                  Save ₹9,589/year!
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                {['Everything in Monthly', '2 Months FREE', 'Advanced Analytics', 'Early Access to Features', 'Dedicated Support'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Plan */}
            <div 
              className={`relative bg-green-900/30 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === 'student' 
                  ? 'border-green-500 shadow-2xl shadow-green-500/50 scale-105' 
                  : 'border-green-700 hover:border-green-600'
              }`}
              onClick={() => setSelectedPlan('student')}
            >
              {plans.student.launchOffer && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🎉 LAUNCH OFFER
                </div>
              )}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                STUDENT
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Student</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black text-white">₹{plans.student.price}</span>
                  <span className="text-gray-400 line-through">₹{plans.student.originalPrice}</span>
                </div>
                <p className="text-sm text-green-400 mt-2 font-semibold">
                  {plans.student.savings}% OFF
                </p>
                <p className="text-gray-400 text-sm mt-1">per month</p>
                <p className="text-green-400 text-sm font-bold mt-2">
                  Valid ID Required
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                {['All Premium Features', 'Student Discount', 'Email Verification', 'Special Student Community', 'Career Resources'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <Gift className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Have a Referral or Voucher Code?</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Have a referral or voucher code? Enter it below to unlock premium benefits!
            </p>
            {referralApplied ? (
              <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-6 h-6 text-green-400" />
                  {discountCode ? (
                    <>
                      <p className="text-lg font-bold text-green-400">Discount Code Applied!</p>
                      <p className="text-gray-300 mt-2">
                        You'll get <span className="font-bold text-yellow-400">{discountPercentage}% OFF</span> when you proceed to payment!
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Code: <code className="font-mono">{discountCode}</code></p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-green-400">Referral or Voucher Code Applied!</p>
                      <p className="text-gray-300">You now have premium access for free!</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">
                  Referral or Voucher Code
                </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral or voucher code here"
                  className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-purple-500 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleReferralCode();
                    }
                  }}
                />
                <button 
                  onClick={handleReferralCode}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Apply Code
                </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Briefcase, text: 'Priority AI Processing' },
              { icon: Target, text: 'Dream Job to Action Plan AI' },
              { icon: BookOpen, text: 'Personalized Study Plans' },
              { icon: TrendingUp, text: 'Career Path Recommendations' },
              { icon: MessageSquare, text: 'Unlimited AI Interview Prep' },
              { icon: Rocket, text: 'Advanced Interview Analytics' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Payment Button */}
          <div className="text-center">
            {paymentError && (
              <div className="mb-4 bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-300 font-semibold">{paymentError}</p>
              </div>
            )}
            <button
              onClick={() => handlePayment(selectedPlan)}
              disabled={isProcessing}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {discountCode && discountPercentage ? (
                    <>
                      Subscribe Now - 
                      <span className="line-through opacity-75 ml-1">₹{plans[selectedPlan].price}</span>
                      <span className="ml-2">
                        ₹{Math.round(plans[selectedPlan].price * (1 - discountPercentage / 100))}
                      </span>
                      <span className="text-yellow-300 text-sm ml-1">({discountPercentage}% OFF)</span>
                      {selectedPlan === 'yearly' && '/year'}
                      {selectedPlan !== 'yearly' && '/month'}
                    </>
                  ) : (
                    <>
                      Subscribe Now - ₹{plans[selectedPlan].price}
                      {selectedPlan === 'yearly' && '/year'}
                      {selectedPlan !== 'yearly' && '/month'}
                    </>
                  )}
                </>
              )}
            </button>
            <p className="text-gray-400 text-sm">
              🔒 Secure payment via Razorpay • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm">Instant Access</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>

          {/* Policy Links */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4 text-center">
              By subscribing, you agree to our policies:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <a 
                href="/policies/terms-and-conditions.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
              >
                Terms and Conditions
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/policies/privacy-policy.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/policies/cancellation-refund.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
              >
                Cancellation & Refund Policy
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/policies/contact-us.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
              >
                Contact Us
              </a>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Secure payment via Razorpay • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

