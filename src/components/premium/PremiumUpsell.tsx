import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkles, Zap, TrendingUp, Award, Crown, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumUpsellProps {
  featureName?: string;
}

export const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ featureName = 'this feature' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: '#8b5cf6',
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create glowing spheres
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const spheres: THREE.Mesh[] = [];

    for (let i = 0; i < 5; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
        emissive: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
        emissiveIntensity: 0.5,
        shininess: 100,
        transparent: true,
        opacity: 0.6,
      });

      const sphere = new THREE.Mesh(sphereGeometry, material);
      const angle = (i / 5) * Math.PI * 2;
      sphere.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, -5);
      spheres.push(sphere);
      scene.add(sphere);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    camera.position.z = 5;

    // Animation
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotate particles
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.03;

      // Animate spheres
      spheres.forEach((sphere, index) => {
        const angle = (index / 5) * Math.PI * 2 + elapsedTime * 0.5;
        sphere.position.x = Math.cos(angle) * 3;
        sphere.position.y = Math.sin(angle) * 3;
        sphere.rotation.x = elapsedTime;
        sphere.rotation.y = elapsedTime;
      });

      // Pulsate lights
      pointLight1.intensity = 2 + Math.sin(elapsedTime * 2) * 0.5;
      pointLight2.intensity = 2 + Math.cos(elapsedTime * 2) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      sphereGeometry.dispose();
    };
  }, []);

  const features = [
    { icon: Zap, title: 'AI-Powered Learning', description: 'Personalized study paths' },
    { icon: TrendingUp, title: 'Performance Analytics', description: 'Track your progress' },
    { icon: Award, title: 'Gamification', description: 'Earn badges and compete' },
    { icon: Sparkles, title: 'Study Tools', description: 'Flashcards, mind maps & more' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-12 text-center">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Crown className="w-24 h-24 text-yellow-300 drop-shadow-2xl animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Crown className="w-24 h-24 text-yellow-200 opacity-20" />
                    </div>
                  </div>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Just One Step Away!
                </h1>
                <p className="text-2xl text-purple-100 mb-2">
                  Transform Your Learning Journey
                </p>
                <p className="text-lg text-purple-200">
                  Unlock {featureName} and 50+ premium features
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="p-8 bg-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-purple-200">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/payment')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative flex items-center gap-3">
                    <Rocket className="w-6 h-6" />
                    <span>Upgrade to Premium</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl border-2 border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-purple-200 mb-2">
                  <span className="font-semibold">Special Offer:</span> Get 30% off for students
                </p>
                <p className="text-sm text-purple-300">
                  Cancel anytime • No hidden fees • 7-day money-back guarantee
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-purple-200">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">4.9★</div>
              <div className="text-sm text-purple-200">User Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-purple-200">Features</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
