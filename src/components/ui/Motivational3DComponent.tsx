import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as THREE from "three";

interface Motivational3DComponentProps {
  className?: string;
  height?: string;
  userName?: string;
}

const motivationalSentences = [
  "You've got this! 🌟",
  "Every day is a fresh start ✨",
  "Progress over perfection 🚀",
  "Believe in yourself 💪",
  "Small steps, big dreams 🎯",
  "You're stronger than you think 💫",
  "Success is a journey 📈",
  "Keep pushing forward 🔥",
];

export const Motivational3DComponent: React.FC<Motivational3DComponentProps> = ({
  className = "",
  height = "500px",
  userName = "User",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>();
  const [currentSentence, setCurrentSentence] = useState(motivationalSentences[0]);
  const sentenceRef = useRef<string>(motivationalSentences[0]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Set renderer size
    const updateSize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    updateSize();
    
    // Set pixel ratio for better performance on high-DPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create holographic polyhedron (like in the image)
    const geometry = new THREE.OctahedronGeometry(1.2, 0);
    
    // Main holographic material with iridescent effect
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0066ff,
      emissiveIntensity: 1.5,
      metalness: 1.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const polyhedron = new THREE.Mesh(geometry, material);
    scene.add(polyhedron);
    sphereRef.current = polyhedron;

    // Add more polyhedrons for layered effect
    const outerGeometry = new THREE.OctahedronGeometry(1.5, 0);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const outerPolyhedron = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(outerPolyhedron);

    // Add floating particles/sparks around the polyhedron
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 1.5;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = (Math.random() - 0.5) * 3;
      positions[i + 2] = Math.sin(angle) * radius;
      
      // Iridescent colors
      const hue = (Math.random() * 360) / 360;
      const color = new THREE.Color().setHSL(hue, 1.0, 0.7);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Enhanced lighting for holographic effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Dynamic colored lights
    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-5, -3, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 1.5, 100);
    pointLight3.position.set(0, 5, 0);
    scene.add(pointLight3);

    // Directional light for holographic look
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 5;

    // Mouse tracking for rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseX = x;
      mouseY = y;
      
      // More responsive rotation based on mouse position
      targetRotationY = x * 0.8;
      targetRotationX = y * 0.8;
    };

    containerRef.current.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Smooth rotation based on mouse - polyhedron follows mouse naturally
      if (polyhedron) {
        polyhedron.rotation.y += (targetRotationY - polyhedron.rotation.y) * 0.08;
        polyhedron.rotation.x += (targetRotationX - polyhedron.rotation.x) * 0.08;
      }

      // Outer polyhedron rotates slower
      if (outerPolyhedron) {
        outerPolyhedron.rotation.y += 0.005;
        outerPolyhedron.rotation.x += 0.003;
      }

      // Rotate particles
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;

      // Animate particles position
      const positions = particleGeometry.attributes.position;
      for (let i = 0; i < particleCount * 3; i += 3) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.3;
        const radius = 2.5 + Math.sin(time * 0.5 + i * 0.1) * 0.3;
        positions.array[i] = Math.cos(angle) * radius;
        positions.array[i + 2] = Math.sin(angle) * radius;
      }
      positions.needsUpdate = true;

      // Pulsing glow effect
      if (material) {
        material.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
      }

      // Animate camera for subtle movement
      camera.position.x = Math.sin(time * 0.2) * 0.3;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Change motivational sentence periodically
    const sentenceInterval = setInterval(() => {
      const currentIndex = motivationalSentences.indexOf(sentenceRef.current);
      const nextIndex = (currentIndex + 1) % motivationalSentences.length;
      sentenceRef.current = motivationalSentences[nextIndex];
      
      // Animate sentence change
      gsap.to({}, {
        duration: 0.5,
        onComplete: () => {
          setCurrentSentence(motivationalSentences[nextIndex]);
        }
      });
    }, 4000);

    // Handle resize
    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearInterval(sentenceInterval);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      outerGeometry.dispose();
      outerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Centered Welcome Message */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none z-10">
        <div className="text-center">
          <p
            key={currentSentence}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 drop-shadow-2xl mb-4"
            style={{
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '-0.02em',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
              animation: 'fadeInOut 3s ease-in-out infinite'
            }}
          >
            {currentSentence}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Move your mouse to explore
          </div>
        </div>
      </div>

      {/* Glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 dark:from-purple-900/20 via-transparent to-cyan-200/30 dark:to-cyan-900/20 pointer-events-none" />
    </div>
  );
};

