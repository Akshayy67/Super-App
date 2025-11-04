import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface TodoCelebrationEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  priority?: 'low' | 'medium' | 'high';
}

export const TodoCelebrationEffect: React.FC<TodoCelebrationEffectProps> = ({
  isActive,
  onComplete,
  priority = 'medium',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Priority-based colors
  const getPriorityColors = () => {
    switch (priority) {
      case 'high':
        return {
          primary: new THREE.Color(0xff6b6b), // Red
          secondary: new THREE.Color(0xffd93d), // Gold
          accent: new THREE.Color(0xff4757), // Bright red
        };
      case 'medium':
        return {
          primary: new THREE.Color(0x4ecdc4), // Teal
          secondary: new THREE.Color(0x45b7d1), // Blue
          accent: new THREE.Color(0x96ceb4), // Mint
        };
      case 'low':
        return {
          primary: new THREE.Color(0x95e1d3), // Light green
          secondary: new THREE.Color(0xfce38a), // Yellow
          accent: new THREE.Color(0xa8e6cf), // Soft green
        };
      default:
        return {
          primary: new THREE.Color(0x4ecdc4),
          secondary: new THREE.Color(0x45b7d1),
          accent: new THREE.Color(0x96ceb4),
        };
    }
  };

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const colors = getPriorityColors();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create multiple particle systems for different effects
    const particleSystems: THREE.Points[] = [];

    // 1. Burst particles (explosion effect)
    const burstGeometry = new THREE.BufferGeometry();
    const burstCount = 200;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocities = new Float32Array(burstCount * 3);
    const burstColors = new Float32Array(burstCount * 3);

    for (let i = 0; i < burstCount; i++) {
      const i3 = i * 3;
      // Start from center
      burstPositions[i3] = 0;
      burstPositions[i3 + 1] = 0;
      burstPositions[i3 + 2] = 0;

      // Random velocity direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 1.5;
      burstVelocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      burstVelocities[i3 + 1] = Math.cos(phi) * speed;
      burstVelocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      // Random color from priority palette
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.4) color = colors.primary;
      else if (colorChoice < 0.7) color = colors.secondary;
      else color = colors.accent;

      burstColors[i3] = color.r;
      burstColors[i3 + 1] = color.g;
      burstColors[i3 + 2] = color.b;
    }

    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    burstGeometry.setAttribute('color', new THREE.BufferAttribute(burstColors, 3));

    const burstMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const burstParticles = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burstParticles);
    particleSystems.push(burstParticles);

    // 2. Sparkle particles (twinkling stars)
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 100;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);
    const sparkleSizes = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      sparklePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      sparklePositions[i3 + 1] = radius * Math.cos(phi);
      sparklePositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.5) color = colors.primary;
      else color = colors.secondary;

      sparkleColors[i3] = color.r;
      sparkleColors[i3 + 1] = color.g;
      sparkleColors[i3 + 2] = color.b;

      sparkleSizes[i] = 0.05 + Math.random() * 0.1;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));
    sparkleGeometry.setAttribute('size', new THREE.BufferAttribute(sparkleSizes, 1));

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const sparkleParticles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkleParticles);
    particleSystems.push(sparkleParticles);

    // 3. Confetti particles (falling effect)
    const confettiGeometry = new THREE.BufferGeometry();
    const confettiCount = 150;
    const confettiPositions = new Float32Array(confettiCount * 3);
    const confettiVelocities = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    for (let i = 0; i < confettiCount; i++) {
      const i3 = i * 3;
      // Start from random positions above
      confettiPositions[i3] = (Math.random() - 0.5) * 4;
      confettiPositions[i3 + 1] = 3 + Math.random() * 2;
      confettiPositions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Downward velocity with some randomness
      confettiVelocities[i3] = (Math.random() - 0.5) * 0.1;
      confettiVelocities[i3 + 1] = -0.3 - Math.random() * 0.5;
      confettiVelocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // Random color
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.33) color = colors.primary;
      else if (colorChoice < 0.66) color = colors.secondary;
      else color = colors.accent;

      confettiColors[i3] = color.r;
      confettiColors[i3 + 1] = color.g;
      confettiColors[i3 + 2] = color.b;
    }

    confettiGeometry.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
    confettiGeometry.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

    const confettiMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const confettiParticles = new THREE.Points(confettiGeometry, confettiMaterial);
    scene.add(confettiParticles);
    particleSystems.push(confettiParticles);

    particlesRef.current = particleSystems;

    // Store velocities and sizes for animation
    const particleData = {
      burst: { velocities: burstVelocities, geometry: burstGeometry },
      sparkle: { sizes: sparkleSizes, geometry: sparkleGeometry },
      confetti: { velocities: confettiVelocities, geometry: confettiGeometry },
    };

    startTimeRef.current = Date.now();
    const duration = 3000; // 3 seconds

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Update burst particles
      const burstPositions = particleData.burst.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < burstCount; i++) {
        const i3 = i * 3;
        burstPositions[i3] += particleData.burst.velocities[i3] * 0.016;
        burstPositions[i3 + 1] += particleData.burst.velocities[i3 + 1] * 0.016;
        burstPositions[i3 + 2] += particleData.burst.velocities[i3 + 2] * 0.016;

        // Apply gravity and fade
        particleData.burst.velocities[i3 + 1] -= 0.01;
        const distance = Math.sqrt(
          burstPositions[i3] ** 2 +
          burstPositions[i3 + 1] ** 2 +
          burstPositions[i3 + 2] ** 2
        );
        if (distance > 5) {
          burstParticles.material.opacity = Math.max(0, 1 - progress);
        }
      }
      particleData.burst.geometry.attributes.position.needsUpdate = true;

      // Update sparkle particles (twinkling effect)
      const sparklePositions = particleData.sparkle.geometry.attributes.position.array as Float32Array;
      const sparkleSizeAttr = particleData.sparkle.geometry.attributes.size;
      for (let i = 0; i < sparkleCount; i++) {
        const i3 = i * 3;
        // Twinkling animation
        const twinkle = Math.sin(elapsed * 0.003 + i) * 0.5 + 0.5;
        sparkleSizeAttr.array[i] = particleData.sparkle.sizes[i] * (0.5 + twinkle * 0.5);
        sparkleParticles.material.opacity = 0.3 + twinkle * 0.5;
      }
      sparkleSizeAttr.needsUpdate = true;

      // Update confetti particles
      const confettiPositions = particleData.confetti.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < confettiCount; i++) {
        const i3 = i * 3;
        confettiPositions[i3] += particleData.confetti.velocities[i3] * 0.016;
        confettiPositions[i3 + 1] += particleData.confetti.velocities[i3 + 1] * 0.016;
        confettiPositions[i3 + 2] += particleData.confetti.velocities[i3 + 2] * 0.016;

        // Reset if fallen too far
        if (confettiPositions[i3 + 1] < -3) {
          confettiPositions[i3] = (Math.random() - 0.5) * 4;
          confettiPositions[i3 + 1] = 3 + Math.random() * 2;
          confettiPositions[i3 + 2] = (Math.random() - 0.5) * 2;
        }
      }
      particleData.confetti.geometry.attributes.position.needsUpdate = true;

      // Rotate camera for dynamic effect
      camera.position.x = Math.sin(elapsed * 0.001) * 0.5;
      camera.position.y = Math.cos(elapsed * 0.001) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer || !container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      particleSystems.forEach((particles) => {
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
        scene.remove(particles);
      });
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isActive, priority, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        background: 'transparent',
        overflow: 'hidden'
      }}
    />
  );
};

