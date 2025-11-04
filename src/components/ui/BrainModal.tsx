import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import * as THREE from "three";
import { MonthlyCompletionTracker } from "../../utils/monthlyCompletionTracker";

interface BrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const BrainModal: React.FC<BrainModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brainRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>();
  const progressRef = useRef<number>(0);
  const [completionData, setCompletionData] = useState(
    MonthlyCompletionTracker.getCompletionData(userId)
  );
  const [progress, setProgress] = useState(
    MonthlyCompletionTracker.getProgress(userId)
  );

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create brain geometry with more detail
    const createBrainGeometry = () => {
      const geometry = new THREE.IcosahedronGeometry(2, 3);
      
      // Modify vertices to create brain-like folds and texture
      const positions = geometry.attributes.position;
      const v3 = new THREE.Vector3();
      
      for (let i = 0; i < positions.count; i++) {
        v3.fromBufferAttribute(positions, i);
        // Create brain-like texture with multiple noise layers
        const noise1 = Math.sin(v3.x * 8) * Math.cos(v3.y * 8) * 0.15;
        const noise2 = Math.sin(v3.z * 6) * Math.cos(v3.x * 6) * 0.1;
        const noise3 = Math.sin(v3.y * 10) * Math.cos(v3.z * 10) * 0.08;
        const combinedNoise = noise1 + noise2 + noise3;
        
        v3.normalize();
        v3.multiplyScalar(2 + combinedNoise);
        positions.setXYZ(i, v3.x, v3.y, v3.z);
      }
      
      geometry.computeVertexNormals();
      return geometry;
    };

    const brainGeometry = createBrainGeometry();

    // Create shader material for progressive glow effect
    const createBrainMaterial = (progress: number) => {
      // Calculate glow color based on progress
      const baseColor = new THREE.Color(0x4f46e5); // Indigo base
      const glowColor = new THREE.Color(0x06b6d4); // Cyan glow
      const finalColor = baseColor.lerp(glowColor, progress);

      // Create custom shader material for progressive glow
      const material = new THREE.ShaderMaterial({
        uniforms: {
          progress: { value: progress },
          baseColor: { value: baseColor },
          glowColor: { value: glowColor },
          time: { value: 0 },
          glowIntensity: { value: 0.5 + progress * 1.5 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vProgress;
          
          uniform float progress;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vProgress = progress;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float progress;
          uniform vec3 baseColor;
          uniform vec3 glowColor;
          uniform float time;
          uniform float glowIntensity;
          
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vProgress;
          
          void main() {
            // Calculate glow direction (from left to right)
            float glowDirection = (vPosition.x + 2.0) / 4.0; // Normalize from -2 to 2
            float glowFactor = smoothstep(0.0, 1.0, glowDirection * vProgress);
            
            // Base color with progress-based interpolation
            vec3 color = mix(baseColor, glowColor, glowFactor * vProgress);
            
            // Add pulsing glow effect
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            color += glowColor * glowFactor * vProgress * pulse * glowIntensity;
            
            // Fresnel effect for edge glow
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            color += glowColor * fresnel * vProgress * 0.5;
            
            // Final color with alpha
            gl_FragColor = vec4(color, 0.85 + vProgress * 0.15);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      return material;
    };

    const brainMaterial = createBrainMaterial(progress);
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brain);
    brainRef.current = brain;

    // Add particles/sparkles around the brain
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 3, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4f46e5, 2, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Position camera
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    // Mouse interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isMouseDown = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isMouseDown) {
        targetRotationY = x * 0.5;
        targetRotationX = y * 0.5;
      } else {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
      }

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
      containerRef.current.addEventListener("mousedown", handleMouseDown);
      containerRef.current.addEventListener("mouseup", handleMouseUp);
      containerRef.current.addEventListener("mouseleave", handleMouseUp);
    }

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Update progress in shader
      if (brainMaterial && brainMaterial instanceof THREE.ShaderMaterial) {
        brainMaterial.uniforms.progress.value = progressRef.current;
        brainMaterial.uniforms.time.value = time;
        brainMaterial.uniforms.glowIntensity.value = 0.5 + progressRef.current * 1.5;
      }

      // Smooth rotation based on mouse
      if (brain) {
        brain.rotation.y += (targetRotationY - brain.rotation.y) * 0.05;
        brain.rotation.x += (targetRotationX - brain.rotation.x) * 0.05;
        
        // Subtle pulsing animation
        const pulse = 1 + Math.sin(time * 0.5) * 0.02;
        brain.scale.setScalar(pulse);
      }

      // Rotate particles
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // Update particle opacity based on progress
      const particlesMat = particles.material as THREE.PointsMaterial;
      particlesMat.opacity = 0.3 + progressRef.current * 0.4;

      // Animate lights
      pointLight1.intensity = 3 + Math.sin(time) * 1;
      pointLight2.intensity = 2 + Math.cos(time * 1.2) * 0.8;

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.1) * 0.2;
      camera.position.y = Math.cos(time * 0.15) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener("mousedown", handleMouseDown);
        containerRef.current.removeEventListener("mouseup", handleMouseUp);
        containerRef.current.removeEventListener("mouseleave", handleMouseUp);
      }
      renderer.dispose();
      brainGeometry.dispose();
      if (brainMaterial instanceof THREE.Material) {
        brainMaterial.dispose();
      }
      particlesGeometry.dispose();
      if (particlesMaterial instanceof THREE.Material) {
        particlesMaterial.dispose();
      }
    };
  }, [isOpen, userId]);

  // Update progress when completion data changes
  useEffect(() => {
    if (isOpen) {
      const data = MonthlyCompletionTracker.getCompletionData(userId);
      const newProgress = MonthlyCompletionTracker.getProgress(userId);
      setCompletionData(data);
      setProgress(newProgress);
      
      // Animate progress change
      gsap.to(progressRef, {
        current: newProgress,
        duration: 1.5,
        ease: "power2.out",
      });
    }
  }, [isOpen, userId]);

  // Update progress ref when progress changes
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  if (!isOpen) return null;

  const progressPercentage = MonthlyCompletionTracker.getProgressPercentage(userId);
  const remaining = MonthlyCompletionTracker.getRemaining(userId);
  const daysRemaining = MonthlyCompletionTracker.getDaysRemainingInMonth();

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Monthly Brain Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete 50 things this month to fully activate your brain!
          </p>
        </div>

        {/* 3D Brain Canvas */}
        <div
          ref={containerRef}
          className="relative w-full h-[400px] bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          
          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {completionData.completions} / {completionData.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>{remaining} remaining</span>
              <span>{daysRemaining} days left in month</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {completionData.completions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {progressPercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Progress
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {daysRemaining}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Days Left
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Complete tasks, upload files, create notes, and more to fill your brain! 
            The glow progresses from left to right as you complete more things.
          </p>
        </div>
      </div>
    </div>
  );
};

