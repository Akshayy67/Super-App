import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { MonthlyCompletionTracker } from "../../utils/monthlyCompletionTracker";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface Motivational3DComponentProps {
  className?: string;
  height?: string;
  userName?: string;
}

const motivationalMessages = [
  "Your brain grows with every task completed 🧠✨",
  "Productivity powers your mind's glow 💪",
  "Complete tasks, watch your brain illuminate 🌟",
  "Every completion strengthens your neural pathways 🔥",
  "Your productivity is transforming your brain 🚀",
  "Keep going - your brain is evolving! 💫",
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
  const brainRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>();
  const progressRef = useRef<number>(0);
  const brainMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);
  const messageRef = useRef<string>(motivationalMessages[0]);
  const [completionData, setCompletionData] = useState(() => {
    const user = realTimeAuth.getCurrentUser();
    if (user) {
      return MonthlyCompletionTracker.getCompletionData(user.id);
    }
    return { completions: 0, goal: 50, currentMonth: "" };
  });

  // Update progress periodically and on window focus
  useEffect(() => {
    const updateProgress = () => {
      const user = realTimeAuth.getCurrentUser();
      if (user) {
        const data = MonthlyCompletionTracker.getCompletionData(user.id);
        const progress = MonthlyCompletionTracker.getProgress(user.id);
        setCompletionData(data);
        gsap.to(progressRef, {
          current: progress,
          duration: 1.5,
          ease: "power2.out",
        });
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 500); // Update every 500ms for more responsive updates
    
    // Also update when window gains focus (in case user completed tasks in another tab)
    const handleFocus = () => updateProgress();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       document.documentElement.getAttribute('data-theme') === 'dark' ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Create anatomically accurate brain geometry
    const createBrainGeometry = () => {
      // Use high-resolution sphere as base for smooth brain surface
      const geometry = new THREE.SphereGeometry(2, 64, 64);
      
      // Modify vertices to create realistic anatomical brain structure
      const positions = geometry.attributes.position;
      const v3 = new THREE.Vector3();
      
      // Create array to store fold depth for shader
      const foldDepths = new Float32Array(positions.count);
      
      for (let i = 0; i < positions.count; i++) {
        v3.fromBufferAttribute(positions, i);
        const originalPos = v3.clone();
        
        // Normalize to get direction from center
        v3.normalize();
        
        // Create left and right hemisphere separation (brain fissure)
        const hemisphereSeparation = Math.abs(v3.x) * 0.15; // Deeper in the middle
        const hemisphereOffset = Math.sign(v3.x) * 0.08 * (1.0 - Math.abs(v3.x)); // Split left/right
        
        // Create realistic brain fold patterns based on actual anatomy
        // These patterns simulate the characteristic sulci and gyri of a human brain
        
        // Central sulcus (divides frontal and parietal lobes)
        const centralSulcus = Math.sin((v3.y + 0.3) * 20) * Math.exp(-Math.abs(v3.x) * 3) * 0.4;
        
        // Longitudinal fissure (deep groove between hemispheres)
        const longitudinalFissure = -Math.abs(v3.x) * 0.25;
        
        // Lateral sulcus (Sylvian fissure - horizontal groove)
        const lateralSulcus = Math.sin(v3.y * 8) * Math.cos(v3.z * 6) * Math.exp(-Math.abs(v3.x - 0.5) * 2) * 0.3;
        
        // Parieto-occipital sulcus
        const parietoOccipital = Math.sin((v3.y - 0.4) * 15) * Math.exp(-Math.abs(v3.x) * 2.5) * 0.35;
        
        // Primary gyri (raised ridges) - these create the characteristic brain texture
        const gyri1 = Math.abs(Math.sin(v3.y * 25 + v3.z * 20)) * 0.12;
        const gyri2 = Math.abs(Math.sin(v3.x * 22 + v3.y * 18)) * 0.1;
        const gyri3 = Math.abs(Math.sin(v3.z * 24 + v3.x * 20)) * 0.15;
        
        // Secondary folds - finer detail
        const secondaryFolds1 = Math.sin(v3.y * 35) * Math.cos(v3.z * 30) * 0.08;
        const secondaryFolds2 = Math.sin(v3.x * 32) * Math.cos(v3.y * 28) * 0.06;
        
        // Tertiary micro-folds for realistic texture
        const microFolds = Math.sin(v3.x * 50) * Math.cos(v3.y * 48) * Math.sin(v3.z * 45) * 0.04;
        
        // Combine all anatomical features
        const allFolds = centralSulcus + longitudinalFissure + lateralSulcus + parietoOccipital +
                        gyri1 + gyri2 + gyri3 + secondaryFolds1 + secondaryFolds2 + microFolds;
        
        // Calculate fold depth for glow - deeper sulci glow more
        const deepSulci = Math.abs(centralSulcus) + Math.abs(longitudinalFissure) + 
                         Math.abs(lateralSulcus) + Math.abs(parietoOccipital);
        const foldDepth = (deepSulci * 1.5 + Math.abs(gyri1 + gyri2 + gyri3) * 0.8) / 1.2;
        foldDepths[i] = Math.min(Math.max(foldDepth, 0), 1); // Clamp to 0-1
        
        // Apply anatomical structure to geometry
        const baseRadius = 2;
        const foldOffset = allFolds + hemisphereOffset + hemisphereSeparation;
        v3.multiplyScalar(baseRadius + foldOffset);
        
        positions.setXYZ(i, v3.x, v3.y, v3.z);
      }
      
      // Add fold depth as a custom attribute for the shader
      geometry.setAttribute('foldDepth', new THREE.BufferAttribute(foldDepths, 1));
      
      // Recompute normals for proper lighting
      geometry.computeVertexNormals();
      
      return geometry;
    };

    const brainGeometry = createBrainGeometry();

    // Create shader material for progressive glow effect
    const createBrainMaterial = (progress: number) => {
      // Use different colors for light/dark mode
      let baseColor, glowColor;
      if (isDarkMode) {
        baseColor = new THREE.Color(0x4f46e5); // Indigo base for dark mode
        glowColor = new THREE.Color(0x06b6d4); // Cyan glow for dark mode
      } else {
        baseColor = new THREE.Color(0x6366f1); // Brighter indigo for light mode
        glowColor = new THREE.Color(0x0891b2); // Deeper cyan for light mode
      }
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
          varying float vFoldDepth;
          
          attribute float foldDepth;
          uniform float progress;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vProgress = progress;
            vFoldDepth = foldDepth;
            
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
          varying float vFoldDepth;
          
          void main() {
            // Fill color - using bright red for visibility
            vec3 fillTestColor = vec3(1.0, 0.2, 0.2); // Bright red
            
            // Calculate diagonal fill from bottom-left to top-right
            // vPosition is in object/model space
            // Brain is centered at origin with radius ~2, but with folds can extend to ~3
            // Find the actual min/max by using reasonable bounds
            float minBound = -3.5;
            float maxBound = 3.5;
            float range = maxBound - minBound;
            
            // Normalize position coordinates to 0-1 range
            // For bottom-left to top-right: 
            // bottom-left = (x_min, y_min) -> (0, 0)
            // top-right = (x_max, y_max) -> (1, 1)
            float normalizedX = (vPosition.x - minBound) / range;
            float normalizedY = (vPosition.y - minBound) / range;
            
            // Clamp to valid range
            normalizedX = clamp(normalizedX, 0.0, 1.0);
            normalizedY = clamp(normalizedY, 0.0, 1.0);
            
            // Create diagonal gradient: bottom-left (0,0) -> 0.0, top-right (1,1) -> 1.0
            // Use weighted average: more weight on the diagonal direction
            float diagonalProgress = (normalizedX + normalizedY) / 2.0;
            
            // The fill threshold: progress value (0.0 = no fill, 1.0 = full fill)
            float fillThreshold = vProgress;
            
            // Calculate fill: we want to fill where diagonalProgress <= fillThreshold
            // For diagonal: bottom-left (diagonalProgress=0) to top-right (diagonalProgress=1)
            // We fill where diagonalProgress <= fillThreshold
            
            // Calculate if this pixel should be filled
            // diagonalProgress ranges from 0 (bottom-left) to 1 (top-right)
            // fillThreshold ranges from 0 (no progress) to 1 (full progress)
            // Fill pixels where diagonalProgress <= fillThreshold
            // step(edge, x) returns 1.0 if x >= edge, 0.0 if x < edge
            // So step(fillThreshold, diagonalProgress) returns 1.0 if diagonalProgress >= fillThreshold
            // We want the inverse: 1.0 if diagonalProgress <= fillThreshold
            float fillAmount = 1.0 - step(fillThreshold, diagonalProgress);
            
            // Add smooth edge transition for a gradient effect
            float edgeWidth = 0.1;
            float smoothFill = smoothstep(
              fillThreshold - edgeWidth, 
              fillThreshold + edgeWidth * 0.3, 
              diagonalProgress
            );
            smoothFill = 1.0 - smoothFill; // Invert: 1.0 = filled, 0.0 = not filled
            
            // Ensure fill is visible - clamp to valid range
            smoothFill = clamp(smoothFill, 0.0, 1.0);
            
            // Anatomical brain color - realistic brain tissue colors
            // Pinkish-gray for brain matter, with subtle variations
            vec3 brainBaseColor = vec3(0.4, 0.35, 0.45); // Pinkish-gray brain tissue
            vec3 brainTissueVariation = vec3(0.35, 0.3, 0.4); // Slightly darker variation
            
            // Add subtle color variation based on position (simulates different brain regions)
            float tissueVariation = sin(vPosition.y * 3.0 + vPosition.z * 2.0) * 0.5 + 0.5;
            vec3 brainColor = mix(brainBaseColor, brainTissueVariation, tissueVariation * 0.3);
            
            // Calculate sulci (grooves) and gyri (ridges) glow intensity
            // Deeper sulci (grooves) glow more intensely - these are the neural pathways
            float foldGlow = pow(vFoldDepth * 1.8, 1.8);
            foldGlow = clamp(foldGlow, 0.0, 1.0);
            
            // Neural pathway glow - electric blue for active neural connections
            vec3 neuralGlowColor = vec3(0.0, 0.75, 1.0); // Bright electric blue for neural pathways
            vec3 neuralGlowColor2 = vec3(0.4, 0.65, 1.0); // Softer blue-purple
            
            // Make neural pathways glow with pulsing effect (simulating neural activity)
            float neuralPulse = sin(time * 2.5 + vFoldDepth * 12.0) * 0.25 + 0.75;
            float glowIntensityMultiplier = 3.8; // Strong glow to highlight neural pathways
            vec3 neuralGlow = neuralGlowColor * foldGlow * neuralPulse * glowIntensityMultiplier;
            neuralGlow += neuralGlowColor2 * foldGlow * 1.2;
            
            // Mix realistic brain color with progress-based fill
            // Simple red fill - no extra glow effects
            vec3 fillColor = mix(brainColor, fillTestColor, smoothFill); // Pure red fill
            
            // Combine brain tissue color with neural pathway glow
            vec3 finalColor = fillColor;
            
            // Only add neural glow where NOT filled (to not override the red)
            float notFilled = 1.0 - smoothFill;
            finalColor += neuralGlow * notFilled * 0.5; // Reduced so it doesn't override fill
            
            // Anatomical brain transparency
            float alpha = 0.9; // Consistent opacity
            alpha = clamp(alpha, 0.85, 0.95);
            
            // Final color with alpha - THIS IS WHAT GETS DISPLAYED
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      return material;
    };

    const user = realTimeAuth.getCurrentUser();
    const initialProgress = user ? MonthlyCompletionTracker.getProgress(user.id) : 0;
    progressRef.current = initialProgress;

    const brainMaterial = createBrainMaterial(initialProgress);
    brainMaterialRef.current = brainMaterial; // Store in ref for access outside
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brain);
    brainRef.current = brain;

    // Add particles/sparkles around the brain
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
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

    // Set scene background - adapts to light/dark mode
    if (isDarkMode) {
      scene.background = new THREE.Color(0x0a1628); // Deep dark blue for dark mode
    } else {
      scene.background = new THREE.Color(0xe0f2fe); // Light blue for light mode
    }
    
    // Lighting - adapts to light/dark mode
    // Declare lights outside if/else so they're accessible in animate function
    // Initialize them to ensure they're always defined
    let ambientLight: THREE.AmbientLight;
    let pointLight1: THREE.PointLight | undefined;
    let pointLight2: THREE.PointLight | undefined;
    let directionalLight: THREE.DirectionalLight;
    let rimLight: THREE.DirectionalLight;

    if (isDarkMode) {
      // Dark mode lighting - more dramatic
      ambientLight = new THREE.AmbientLight(0x2a3f5f, 0.3); // Soft blue ambient
      scene.add(ambientLight);

      pointLight1 = new THREE.PointLight(0x00ccff, 4, 100);
      pointLight1.position.set(5, 5, 5);
      scene.add(pointLight1);

      pointLight2 = new THREE.PointLight(0x4a5a8a, 2.5, 100);
      pointLight2.position.set(-5, -5, 5);
      scene.add(pointLight2);

      directionalLight = new THREE.DirectionalLight(0x6a7fff, 0.6);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      rimLight = new THREE.DirectionalLight(0x00aaff, 0.4);
      rimLight.position.set(-2, -2, -3);
      scene.add(rimLight);
    } else {
      // Light mode lighting - brighter and more contrast
      ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Brighter ambient
      scene.add(ambientLight);

      pointLight1 = new THREE.PointLight(0x0284c7, 6, 100); // Brighter cyan
      pointLight1.position.set(5, 5, 5);
      scene.add(pointLight1);

      pointLight2 = new THREE.PointLight(0x6366f1, 4, 100); // Brighter indigo
      pointLight2.position.set(-5, -5, 5);
      scene.add(pointLight2);

      directionalLight = new THREE.DirectionalLight(0x3b82f6, 1.0); // Stronger blue
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      rimLight = new THREE.DirectionalLight(0x0284c7, 0.8); // Brighter rim
      rimLight.position.set(-2, -2, -3);
      scene.add(rimLight);
    }

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

      // Update progress in shader - ensure it's always updated and clamped
      if (brainMaterialRef.current) {
        const currentProgress = Math.max(0, Math.min(1, progressRef.current)); // Clamp to 0-1
        brainMaterialRef.current.uniforms.progress.value = currentProgress;
        brainMaterialRef.current.uniforms.time.value = time;
        brainMaterialRef.current.uniforms.glowIntensity.value = 0.5 + currentProgress * 1.5;
      }

      // Smooth rotation based on mouse
      if (brain) {
        brain.rotation.y += (targetRotationY - brain.rotation.y) * 0.05;
        brain.rotation.x += (targetRotationX - brain.rotation.x) * 0.05;
        
                // Calculate growth scale based on tasks completed beyond 50
        const user = realTimeAuth.getCurrentUser();
        let targetGrowthScale = 1.0; // Base scale

        if (user) {
          const data = MonthlyCompletionTracker.getCompletionData(user.id);
          const completions = data.completions;
          const goal = data.goal; // 50

          // If 50+ tasks completed, grow the brain
          if (completions >= goal) {
            const extraTasks = completions - goal; // Tasks beyond 50
            // Grow 0.05 (5%) per extra task, with a maximum growth of 2.0x (100% larger)
            const maxGrowth = 1.0; // Maximum additional 100% size
            const growthPerTask = 0.05; // 5% per task
            const calculatedGrowth = Math.min(extraTasks * growthPerTask, maxGrowth);
            targetGrowthScale = 1.0 + calculatedGrowth; // Base size + growth
          }
        }

        // Smoothly interpolate to target growth scale for smooth animation
        // Store the base scale (without pulse) in a way that persists
        let currentBaseScale = brain.userData.baseScale || 1.0;
        currentBaseScale += (targetGrowthScale - currentBaseScale) * 0.05; // Smooth interpolation (5% per frame)
        brain.userData.baseScale = currentBaseScale;
        
        // Subtle pulsing animation on top of growth
        const pulse = 1 + Math.sin(time * 0.5) * 0.02;
        brain.scale.setScalar(currentBaseScale * pulse);
      }

      // Rotate particles
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // Update particle opacity based on progress
      const particlesMat = particles.material as THREE.PointsMaterial;
      particlesMat.opacity = 0.3 + progressRef.current * 0.4;

      // Animate lights (only if they exist)
      if (pointLight1 && pointLight2) {
        pointLight1.intensity = 3 + Math.sin(time) * 1;
        pointLight2.intensity = 2 + Math.cos(time * 1.2) * 0.8;
      }

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.1) * 0.2;
      camera.position.y = Math.cos(time * 0.15) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Change motivational message periodically
    const messageInterval = setInterval(() => {
      const currentIndex = motivationalMessages.indexOf(messageRef.current);
      const nextIndex = (currentIndex + 1) % motivationalMessages.length;
      messageRef.current = motivationalMessages[nextIndex];

      gsap.to({}, {
        duration: 0.5,
        onComplete: () => {
          setCurrentMessage(motivationalMessages[nextIndex]);
        },
      });
    }, 5000);

    // Handle resize
    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearInterval(messageInterval);
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
      if (brainMaterialRef.current instanceof THREE.Material) {
        brainMaterialRef.current.dispose();
      }
      brainMaterialRef.current = null;
      particlesGeometry.dispose();
      if (particlesMaterial instanceof THREE.Material) {
        particlesMaterial.dispose();
      }
    };
  }, []);

  // Update progress ref when it changes
  useEffect(() => {
    const user = realTimeAuth.getCurrentUser();
    if (user) {
      const progress = MonthlyCompletionTracker.getProgress(user.id);
      progressRef.current = progress;
      // Force immediate update to shader
      if (brainMaterialRef.current) {
        brainMaterialRef.current.uniforms.progress.value = progress;
      }
    }
  }, [completionData]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Centered Motivational Message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none z-10">
        <div className="text-center max-w-4xl">
          <p
            key={currentMessage}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-blue-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-blue-400 drop-shadow-2xl mb-4"
            style={{
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '-0.02em',
              textShadow: '0 0 30px rgba(79, 70, 229, 0.4)',
              animation: 'fadeInOut 3s ease-in-out infinite'
            }}
          >
            {currentMessage}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 mt-4 font-medium">
            Complete tasks to watch your brain glow brighter! 🧠✨
          </p>
        </div>
      </div>

      {/* Background gradient overlay - adapts to light/dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100/60 via-blue-50/40 to-blue-200/70 dark:from-blue-950/60 dark:via-blue-900/40 dark:to-blue-950/80 pointer-events-none" />
    </div>
  );
};
