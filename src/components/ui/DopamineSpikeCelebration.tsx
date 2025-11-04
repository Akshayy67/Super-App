import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import confetti from "canvas-confetti";

interface DopamineSpikeCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  taskTitle?: string;
  priority?: "low" | "medium" | "high";
}

export const DopamineSpikeCelebration: React.FC<DopamineSpikeCelebrationProps> = ({
  isVisible,
  onComplete,
  taskTitle = "",
  priority = "medium",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points[]>([]);
  const animationFrameRef = useRef<number>();
  const [showBull, setShowBull] = useState(false);
  const [phase, setPhase] = useState<"burst" | "bull" | "fade">("burst");

  useEffect(() => {
    if (!isVisible) return;

    // Phase 1: Initial burst with confetti
    const burstConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = priority === "high" 
        ? ["#ff0000", "#ff6b6b", "#ffa500", "#ffff00"]
        : priority === "medium"
        ? ["#4ecdc4", "#44a08d", "#f7b731", "#f0932b"]
        : ["#10b981", "#34d399", "#60a5fa", "#3b82f6"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    };

    // Phase 2: Three.js particle explosion
    if (canvasRef.current && containerRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });

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

      sceneRef.current = scene;
      rendererRef.current = renderer;

      // Create multiple particle systems
      const particleCount = 200;
      const particles: THREE.Points[] = [];

      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = priority === "high"
          ? [new THREE.Color(0xff0000), new THREE.Color(0xff6b6b), new THREE.Color(0xffa500)]
          : priority === "medium"
          ? [new THREE.Color(0x4ecdc4), new THREE.Color(0x44a08d), new THREE.Color(0xf7b731)]
          : [new THREE.Color(0x10b981), new THREE.Color(0x34d399), new THREE.Color(0x60a5fa)];

        for (let j = 0; j < particleCount * 3; j += 3) {
          const angle = (j / particleCount) * Math.PI * 2 + i * 0.5;
          const radius = 0.1;
          positions[j] = Math.cos(angle) * radius;
          positions[j + 1] = Math.sin(angle) * radius;
          positions[j + 2] = (Math.random() - 0.5) * 0.1;

          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          colors[j] = color.r;
          colors[j + 1] = color.g;
          colors[j + 2] = color.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        points.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        scene.add(points);
        particles.push(points);
      }

      particlesRef.current = particles;

      camera.position.z = 5;

      // Animate particles
      const startTime = Date.now();
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        const elapsed = (Date.now() - startTime) / 1000;

        particles.forEach((particle, i) => {
          const positions = (particle.geometry as THREE.BufferGeometry).attributes.position;
          const velocity = 0.5 + i * 0.1;

          for (let j = 0; j < positions.count * 3; j += 3) {
            const angle = (j / positions.count) * Math.PI * 2;
            const radius = 0.1 + elapsed * velocity;
            positions.array[j] = Math.cos(angle) * radius;
            positions.array[j + 1] = Math.sin(angle) * radius + elapsed * 0.5;
            positions.array[j + 2] += (Math.random() - 0.5) * 0.01;
          }

          positions.needsUpdate = true;

          // Fade out
          const material = particle.material as THREE.PointsMaterial;
          material.opacity = Math.max(0, 1 - elapsed * 0.5);
        });

        renderer.render(scene, camera);
      };

      animate();
    }

    // Trigger confetti burst
    burstConfetti();

    // Phase transitions
    setTimeout(() => {
      setShowBull(true);
      setPhase("bull");
    }, 500);

    setTimeout(() => {
      setPhase("fade");
    }, 2500);

    setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current.forEach((particle) => {
        (particle.geometry as THREE.BufferGeometry).dispose();
        (particle.material as THREE.Material).dispose();
      });
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isVisible, priority, onComplete]);

  if (!isVisible) return null;

  const getGradientColors = () => {
    switch (priority) {
      case "high":
        return "from-red-500 via-pink-500 to-purple-600";
      case "medium":
        return "from-cyan-400 via-blue-500 to-indigo-600";
      default:
        return "from-green-400 via-emerald-500 to-teal-600";
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
    >
      {/* Three.js particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Background flash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getGradientColors()} opacity-0 transition-opacity duration-300 ${
          phase === "burst" ? "opacity-30" : "opacity-0"
        }`}
      />

      {/* Celebration content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Score/XP display */}
        <div
          className={`text-center transform transition-all duration-500 ${
            phase === "burst"
              ? "scale-150 opacity-100"
              : phase === "bull"
              ? "scale-100 opacity-80"
              : "scale-50 opacity-0"
          }`}
        >
          <div
            className={`text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getGradientColors()} drop-shadow-2xl mb-4`}
            style={{
              textShadow: "0 0 40px rgba(255, 255, 255, 0.5)",
            }}
          >
            +{priority === "high" ? "50" : priority === "medium" ? "25" : "10"} XP
          </div>
          {taskTitle && (
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {taskTitle}
            </div>
          )}
        </div>

        {/* Running bull animation */}
        {showBull && (
          <div
            className={`absolute bottom-20 transform transition-all duration-700 ${
              phase === "bull"
                ? "translate-x-0 opacity-100 scale-100"
                : "translate-x-full opacity-0 scale-50"
            }`}
            style={{ width: "200px", height: "200px" }}
          >
            <div className="relative w-full h-full">
              {/* Simplified bull SVG for overlay */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))",
                }}
              >
                {/* Bull body */}
                <ellipse
                  cx="50"
                  cy="60"
                  rx="30"
                  ry="20"
                  fill="currentColor"
                  className="text-orange-600"
                />
                {/* Bull head */}
                <ellipse
                  cx="70"
                  cy="50"
                  rx="18"
                  ry="15"
                  fill="currentColor"
                  className="text-orange-700"
                />
                {/* Horns */}
                <path
                  d="M 75 40 L 78 35 L 75 38 Z"
                  fill="currentColor"
                  className="text-gray-800"
                />
                <path
                  d="M 78 40 L 81 35 L 78 38 Z"
                  fill="currentColor"
                  className="text-gray-800"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Celebration message */}
        <div
          className={`absolute top-1/4 text-center transform transition-all duration-500 ${
            phase === "bull"
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-2">
            🎉 AMAZING! 🎉
          </div>
          <div className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
            Keep the momentum going!
          </div>
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

