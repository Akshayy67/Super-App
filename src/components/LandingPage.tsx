import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import * as THREE from "three";
import "./LandingPage.css";

interface Section {
  id: string;
  preheading?: string;
  title: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

const sections: Section[] = [
  { 
    id: "hero",
    preheading: "WELCOME TO THE WORLD'S FIRST AI ACADEMIC ECOSYSTEM",
    title: "STUDY SMARTER. ACHIEVE MORE. EVERY SINGLE DAY.",
    subtitle: 
      "You've been learning the hard way. It's time to study smarter — with AI that understands you, plans for you, and pushes you toward your dream job. " +
      "Discover a revolutionary ecosystem built to guide your every step. " +
      "Join 10,000+ students who turned chaos into clarity and unlocked the results they once only imagined.",
    quote: "✨ Start your AI journey today — because your future deserves smarter effort, not harder struggle.",
    author: "AI Academic Ecosystem — Launch Edition",
  },
  { 
    id: "welcome", 
    title: "WE UNDERSTAND YOUR STRUGGLE.",
    subtitle: 
      "Managing studies, deadlines, and motivation isn't easy — and you shouldn't have to do it alone. " +
      "That's why we built a system that feels human. Get a personalized plan that turns chaos into progress. " +
      "Stop guessing what to study and start seeing results that compound every single day."
  },
  { 
    id: "ai-study-roadmaps",
    title: "YOUR AI STUDY COMPANION — PLAN SMART. EXECUTE BETTER. GROW FASTER.",
    subtitle: 
      "Your AI-powered roadmap adapts to your goals, schedule, and skills. Each concept, topic, and deadline is organized, tracked, and intelligently adjusted for maximum learning impact. " +
      "It's not just a plan — it's your personal growth engine, designed to save time, boost consistency, and multiply results."
  },
  { 
    id: "team-collaboration",
    title: "LEARN, BUILD, AND GROW TOGETHER.",
    subtitle: 
      "Success is faster when it's shared. Collaborate seamlessly with teammates through integrated file sharing, live projects, group quizzes, and real-time doubt discussions. " +
      "Experience pair programming that sparks creativity and accelerates understanding. " +
      "This isn't just studying — it's evolving together with a community that supports and inspires growth."
  },
  { 
    id: "job-hunt", 
    title: "TURN YOUR LEARNING INTO A CAREER ADVANTAGE.",
    subtitle: 
      "Stop waiting for opportunities — let AI find them for you. " +
      "Our intelligent job assistant scans top platforms, tailors your resume, and helps you prepare with realistic AI-driven interviews. " +
      "Track every application, sharpen your skills, and get hired faster. " +
      "You've worked hard to learn — now it's time to make it count."
  },
  { 
    id: "smart-learning", 
    title: "REMEMBER WHAT MATTERS. FOR LIFE.",
    subtitle: 
      "Learn deeply, not just quickly. Master concepts at your perfect pace with adaptive AI that reinforces long-term retention. " +
      "Say goodbye to cramming — and turn short-term studying into lifelong understanding."
  },
  { 
    id: "unified-ecosystem", 
    title: "ONE PLATFORM. ZERO STRESS. INFINITE FOCUS.",
    subtitle: 
      "Everything connects — your notes, progress, study plans, and goals. " +
      "Forget juggling multiple apps. Experience calm, control, and clarity as your entire academic journey flows inside one intelligent, unified system."
  },
  { 
    id: "working-professionals", 
    title: "BALANCE WORK AND GROWTH WITHOUT COMPROMISE.",
    subtitle: 
      "You're ambitious — managing work, deadlines, and self-improvement all at once. " +
      "Now, your AI roadmap adapts to your lifestyle. Stay consistent, learn efficiently, and grow steadily — without burnout or sacrifice."
  },
  { 
    id: "ai-interview", 
    title: "CONFIDENCE THAT SPEAKS FOR ITSELF.",
    subtitle: 
      "Each AI interview session helps you refine your communication and problem-solving. " +
      "Get personalized feedback, eliminate weak spots, and track your improvement. " +
      "Walk into every interview prepared, confident, and ready to stand out."
  },
  { 
    id: "begin", 
    title: "YOUR FUTURE DESERVES THIS INVESTMENT.",
    subtitle: 
      "You've been learning the hard way. Now, learn the right way — with AI that learns *you*. " +
      "Join thousands already mastering focus, confidence, and results. " +
      "Don't wait for another year to pass in confusion — start your transformation today and make this the moment everything changes."
  },
];

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const morphFunctionRef = useRef<((sectionIndex: number) => void) | null>(null);

  // Detect mobile device on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Three.js WebGL background with section-specific scenes
  useEffect(() => {
    if (!canvasRef.current) return;

    // Detect mobile device for performance optimization
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: !isMobile, // Disable antialiasing on mobile for performance
      powerPreference: isMobile ? "low-power" : "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    // Lower pixel ratio on mobile for better performance
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    // Disable expensive features on mobile
    if (!isMobile) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isMobile ? 1.2 : 1.5;
    
    console.log("🎨 Three.js renderer initialized", {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: renderer.getPixelRatio()
    });

    // Function to create different scene types
    const createSceneType = (type: string) => {
      const config: {
        objects: THREE.Mesh[];
        particles?: THREE.Points;
        lights: THREE.Light[];
        helpers?: any[];
        update?: () => void;
      } = {
        objects: [],
        lights: [],
      };

      switch (type) {
        case "solar-system":
          // Create tilted group for the solar system
          const systemGroup = new THREE.Group();
          systemGroup.rotation.x = Math.PI / 6; // Tilt 30 degrees around X axis
          systemGroup.rotation.z = Math.PI / 8; // Additional tilt around Z axis
          scene.add(systemGroup);

          // Create multiple central nodes (large white circles)
          const centralNodes = [
            { x: -100, y: -50, size: 60 },
            { x: 200, y: 150, size: 60 },
          ];

          centralNodes.forEach((node, nodeIndex) => {
            // Large central white circle
            const centralGeometry = new THREE.SphereGeometry(node.size, 32, 32);
            const centralMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffffff,
              emissiveIntensity: 0.8,
            });
            const centralNode = new THREE.Mesh(centralGeometry, centralMaterial);
            centralNode.position.set(node.x, node.y, 0);
            systemGroup.add(centralNode);
            config.objects.push(centralNode);

            // Smaller orbiting circles around each central node
            const orbitCount = 3;
            for (let i = 0; i < orbitCount; i++) {
              const orbitRadius = 80 + i * 60;
              const planetSize = 15 + i * 3;
              
              const planetGeometry = new THREE.SphereGeometry(planetSize, 16, 16);
              const planetMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.6,
              });
              const planet = new THREE.Mesh(planetGeometry, planetMaterial);
              
              // Elliptical orbit around the central node
              const initialAngle = (i / orbitCount) * Math.PI * 2;
              planet.position.set(
                node.x + Math.cos(initialAngle) * orbitRadius,
                node.y + Math.sin(initialAngle) * orbitRadius * 0.6, // Elliptical
                Math.sin(initialAngle) * orbitRadius * 0.4 // 3D tilt
              );
              
              systemGroup.add(planet);
              config.objects.push(planet);
              
              // Store orbit info for animation
              (planet as any).orbitCenter = { x: node.x, y: node.y, z: 0 };
              (planet as any).orbitRadius = orbitRadius;
              (planet as any).orbitIndex = i;
              (planet as any).nodeIndex = nodeIndex;
            }
          });

          // Create orbital path lines (elliptical arcs)
          const orbitLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
          });

          centralNodes.forEach((node) => {
            for (let i = 0; i < 3; i++) {
              const orbitRadius = 80 + i * 60;
              const points: THREE.Vector3[] = [];
              
              // Create elliptical orbit path
              for (let j = 0; j < 64; j++) {
                const angle = (j / 64) * Math.PI * 2;
                points.push(
                  new THREE.Vector3(
                    node.x + Math.cos(angle) * orbitRadius,
                    node.y + Math.sin(angle) * orbitRadius * 0.6,
                    Math.sin(angle) * orbitRadius * 0.4
                  )
                );
              }
              
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const orbitLine = new THREE.Line(lineGeometry, orbitLineMaterial);
              systemGroup.add(orbitLine);
              config.helpers = config.helpers || [];
              config.helpers.push(orbitLine);
            }
          });

          // Add small stars/dots scattered
          for (let i = 0; i < 100; i++) {
            const starGeometry = new THREE.BoxGeometry(2, 2, 2);
            const starMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffffff,
              emissiveIntensity: 0.5,
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
              (Math.random() - 0.5) * 1000,
              (Math.random() - 0.5) * 600,
              (Math.random() - 0.5) * 500
            );
            systemGroup.add(star);
            config.objects.push(star);
          }

          config.update = () => {
            const time = Date.now() * 0.001;
            
            // Animate orbiting planets
            config.objects.forEach((obj) => {
              if ((obj as any).orbitCenter) {
                const planet = obj as any;
                const angle = time * 0.3 * (1 / (planet.orbitIndex + 1)) + planet.orbitIndex * 2;
                
                planet.position.x = planet.orbitCenter.x + Math.cos(angle) * planet.orbitRadius;
                planet.position.y = planet.orbitCenter.y + Math.sin(angle) * planet.orbitRadius * 0.6;
                planet.position.z = planet.orbitCenter.z + Math.sin(angle) * planet.orbitRadius * 0.4;
                
                planet.rotation.y += 0.02;
              }
            });
          };
          break;

        case "space-falling":
          // Objects that appear to be falling down
          for (let i = 0; i < 15; i++) {
            const geo = new THREE.BoxGeometry(30, 30, 30);
            const mat = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.8,
              roughness: 0.2,
              transparent: true,
              opacity: 0.7,
            });
            const box = new THREE.Mesh(geo, mat);
            box.position.set(
              (Math.random() - 0.5) * 1000,
              500 - Math.random() * 1000,
              (Math.random() - 0.5) * 500
            );
            box.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );
            scene.add(box);
            config.objects.push(box);
          }

          config.update = () => {
            config.objects.forEach((obj, i) => {
              obj.position.y -= 2 + Math.sin(Date.now() * 0.001 + i) * 0.5;
              if (obj.position.y < -500) {
                obj.position.y = 500;
                obj.position.x = (Math.random() - 0.5) * 1000;
                obj.position.z = (Math.random() - 0.5) * 500;
              }
              obj.rotation.x += 0.01;
              obj.rotation.y += 0.015;
            });
          };
          break;

        case "waves":
          // Create wave-like objects
          const waveCount = 3;
          for (let w = 0; w < waveCount; w++) {
            const waveGeometry = new THREE.PlaneGeometry(800, 800, 50, 50);
            const waveMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              wireframe: true,
              transparent: true,
              opacity: 0.4,
            });
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = -Math.PI / 2;
            wave.position.y = (w - 1) * 100;
            scene.add(wave);
            config.objects.push(wave);
          }

          config.update = () => {
            const time = Date.now() * 0.001;
            config.objects.forEach((wave, i) => {
              const positions = wave.geometry.attributes.position;
              for (let j = 0; j < positions.count; j++) {
                positions.setY(
                  j,
                  Math.sin((time + i * 0.5) * 2 + positions.getX(j) * 0.01) * 30
                );
              }
              positions.needsUpdate = true;
            });
          };
          break;

        case "connecting-dots":
          // Dots that connect with lines
          const dotCount = 50;
          const dots: THREE.Mesh[] = [];
          for (let i = 0; i < dotCount; i++) {
            const dotGeometry = new THREE.SphereGeometry(5, 16, 16);
            const dotMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffffff,
              emissiveIntensity: 0.5,
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.set(
              (Math.random() - 0.5) * 1000,
              (Math.random() - 0.5) * 600,
              (Math.random() - 0.5) * 500
            );
            scene.add(dot);
            config.objects.push(dot);
            dots.push(dot);
          }

          // Create lines connecting nearby dots
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
          });
          const lineGeometry = new THREE.BufferGeometry();
          let linePoints: number[] = [];
          
          const updateLines = () => {
            linePoints = [];
            dots.forEach((dot1, i) => {
              dots.slice(i + 1).forEach((dot2) => {
                const distance = dot1.position.distanceTo(dot2.position);
                if (distance < 200) {
                  linePoints.push(
                    dot1.position.x,
                    dot1.position.y,
                    dot1.position.z,
                    dot2.position.x,
                    dot2.position.y,
                    dot2.position.z
                  );
                }
              });
            });
          };
          
          updateLines();
          lineGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(linePoints, 3)
          );
          const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
          scene.add(lines);
          config.helpers = [lines];

          config.update = () => {
            const time = Date.now() * 0.001;
            dots.forEach((dot, i) => {
              dot.position.x += Math.sin(time + i) * 0.5;
              dot.position.y += Math.cos(time * 0.7 + i) * 0.5;
              dot.position.z += Math.sin(time * 0.5 + i) * 0.3;
            });

            // Update lines
            updateLines();
            lineGeometry.setAttribute(
              "position",
              new THREE.Float32BufferAttribute(linePoints, 3)
            );
            lineGeometry.attributes.position.needsUpdate = true;
          };
          break;

        case "particles-cloud":
          // Cloud of particles
          const particleGeometry = new THREE.BufferGeometry();
          // Reduce particle count on mobile for performance
          const isMobile = window.innerWidth <= 768;
          const particleCount = isMobile ? 1000 : 3000;
          const initialPositions = new Float32Array(particleCount * 3);
          const positions = new Float32Array(particleCount * 3);
          const colors = new Float32Array(particleCount * 3);

          for (let i = 0; i < particleCount * 3; i += 3) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            initialPositions[i] = x;
            initialPositions[i + 1] = y;
            initialPositions[i + 2] = z;
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;

            const color = new THREE.Color();
            color.setHSL(0.6, 0.8, 0.5 + Math.random() * 0.5);
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
          }

          particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

          const particleMaterial = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
          });

          const particles = new THREE.Points(particleGeometry, particleMaterial);
          scene.add(particles);
          config.particles = particles;

          config.update = () => {
            const time = Date.now() * 0.001;
            for (let i = 0; i < particleCount; i++) {
              const i3 = i * 3;
              positions[i3] = initialPositions[i3] + Math.sin(time + i * 0.01) * 50;
              positions[i3 + 1] = initialPositions[i3 + 1] + Math.cos(time * 0.7 + i * 0.01) * 50;
              positions[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.5 + i * 0.01) * 30;
            }
            particleGeometry.attributes.position.needsUpdate = true;
          };
          break;

        case "geometric-shapes":
        default:
          // Default geometric shapes (original)
          const geometries = [
            () => new THREE.SphereGeometry(50, 32, 32),
            () => new THREE.TorusGeometry(40, 15, 16, 100),
            () => new THREE.OctahedronGeometry(60, 0),
            () => new THREE.TetrahedronGeometry(50, 0),
            () => new THREE.IcosahedronGeometry(55, 0),
            () => new THREE.BoxGeometry(80, 80, 80),
          ];

          const materials = [
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.7,
              roughness: 0.3,
              transparent: true,
              opacity: 0.6,
            }),
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.5,
              roughness: 0.5,
              transparent: true,
              opacity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.8,
              roughness: 0.2,
              transparent: true,
              opacity: 0.4,
            }),
          ];

          for (let i = 0; i < 8; i++) {
            const geometry = geometries[i % geometries.length]();
            const material = materials[i % materials.length].clone();
            const mesh = new THREE.Mesh(geometry, material);

            const angle = (i / 8) * Math.PI * 2;
            const radius = 300 + Math.random() * 200;
            mesh.position.set(
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 400,
              (Math.random() - 0.5) * 600
            );

            mesh.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );

            const scale = 0.5 + Math.random() * 0.5;
            mesh.scale.set(scale, scale, scale);
            scene.add(mesh);
            config.objects.push(mesh);
          }

          config.update = () => {
            const time = Date.now() * 0.001;
            config.objects.forEach((obj, i) => {
              obj.rotation.x += 0.01 + Math.sin(time + i) * 0.002;
              obj.rotation.y += 0.015 + Math.cos(time + i) * 0.002;
              obj.rotation.z += 0.008;
              
              const scaleVariation = Math.sin(time * 2 + i) * 0.2 + 1;
              const baseScale = 0.5 + (i % 3) * 0.17;
              obj.scale.setScalar(baseScale * scaleVariation);
              
              if (obj.material instanceof THREE.MeshStandardMaterial) {
                obj.material.opacity = 0.4 + Math.sin(time * 2 + i) * 0.2;
              }
            });
          };
          break;

        case "interactive-grid":
          // Mouse-reactive grid system
          const gridSize = 20;
          const gridSpacing = 60;
          const gridPoints: THREE.Mesh[] = [];
          const gridLines: THREE.Line[] = [];
          
          // Create grid points
          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              const pointGeometry = new THREE.SphereGeometry(3, 8, 8);
              const pointMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.8,
                metalness: 0.9,
                roughness: 0.1,
              });
              const point = new THREE.Mesh(pointGeometry, pointMaterial);
              
              point.position.set(
                (i - gridSize / 2) * gridSpacing,
                (j - gridSize / 2) * gridSpacing,
                0
              );
              
              scene.add(point);
              config.objects.push(point);
              gridPoints.push(point);
              (point as any).basePosition = point.position.clone();
            }
          }
          
          // Create grid lines
          const gridLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
          });
          
          // Horizontal lines
          for (let i = 0; i < gridSize; i++) {
            const points: THREE.Vector3[] = [];
            for (let j = 0; j < gridSize; j++) {
              points.push(new THREE.Vector3(
                (j - gridSize / 2) * gridSpacing,
                (i - gridSize / 2) * gridSpacing,
                0
              ));
            }
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, gridLineMaterial);
            scene.add(line);
            config.helpers?.push(line);
            gridLines.push(line);
          }
          
          // Vertical lines
          for (let i = 0; i < gridSize; i++) {
            const points: THREE.Vector3[] = [];
            for (let j = 0; j < gridSize; j++) {
              points.push(new THREE.Vector3(
                (i - gridSize / 2) * gridSpacing,
                (j - gridSize / 2) * gridSpacing,
                0
              ));
            }
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, gridLineMaterial);
            scene.add(line);
            config.helpers?.push(line);
            gridLines.push(line);
          }
          
          if (!config.helpers) config.helpers = [];
          
          config.update = () => {
            const time = Date.now() * 0.001;
            const mouseWorldX = mouseX * 400;
            const mouseWorldY = mouseY * 300;
            
            gridPoints.forEach((point, i) => {
              const basePos = (point as any).basePosition;
              const dx = mouseWorldX - basePos.x;
              const dy = mouseWorldY - basePos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 200;
              const influence = Math.max(0, 1 - distance / maxDist);
              
              // Z displacement based on mouse proximity
              const zOffset = influence * 80 * Math.sin(time * 2 + i * 0.1);
              
              point.position.x = basePos.x;
              point.position.y = basePos.y;
              point.position.z = basePos.z + zOffset;
              
              // Scale based on distance
              const scale = 1 + influence * 2;
              point.scale.setScalar(scale);
              
              // Glow intensity
              if (point.material instanceof THREE.MeshStandardMaterial) {
                point.material.emissiveIntensity = 0.5 + influence * 0.8;
              }
            });
            
            // Update grid lines
            let lineIndex = 0;
            gridLines.forEach(line => {
              const positions = line.geometry.attributes.position;
              for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const dx = mouseWorldX - x;
                const dy = mouseWorldY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const influence = Math.max(0, 1 - distance / 200);
                positions.setZ(i, influence * 60 * Math.sin(time * 2 + lineIndex * 0.05));
              }
              positions.needsUpdate = true;
              lineIndex++;
            });
          };
          break;

        case "particle-trail":
          // Interactive particle trail that follows mouse
          const trailParticleCount = 150;
          const trailParticles: THREE.Mesh[] = [];
          
          for (let i = 0; i < trailParticleCount; i++) {
            const trailGeometry = new THREE.SphereGeometry(4, 8, 8);
            const trailMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffffff,
              emissiveIntensity: 0.9,
              metalness: 0.8,
              roughness: 0.2,
              transparent: true,
              opacity: 0.8,
            });
            const particle = new THREE.Mesh(trailGeometry, trailMaterial);
            
            particle.position.set(
              (Math.random() - 0.5) * 1000,
              (Math.random() - 0.5) * 800,
              (Math.random() - 0.5) * 500
            );
            
            scene.add(particle);
            config.objects.push(particle);
            trailParticles.push(particle);
            (particle as any).targetPos = particle.position.clone();
            (particle as any).prevPos = particle.position.clone();
            (particle as any).trailIndex = i;
          }
          
          config.update = () => {
            const time = Date.now() * 0.001;
            const mouseWorldX = mouseX * 400;
            const mouseWorldY = mouseY * 300;
            
            trailParticles.forEach((particle, i) => {
              const targetIndex = (i + 1) % trailParticleCount;
              const targetParticle = trailParticles[targetIndex];
              
              // Follow the previous particle in chain (chain reaction)
              if (i === 0) {
                // First particle follows mouse
                (particle as any).targetPos.set(mouseWorldX, mouseWorldY, 0);
              } else {
                (particle as any).targetPos.copy(targetParticle.position);
              }
              
              // Smooth movement towards target
              const currentPos = particle.position;
              const targetPos = (particle as any).targetPos;
              currentPos.x += (targetPos.x - currentPos.x) * 0.15;
              currentPos.y += (targetPos.y - currentPos.y) * 0.15;
              currentPos.z += (targetPos.z - currentPos.z) * 0.15 + Math.sin(time * 2 + i * 0.1) * 5;
              
              // Pulsing scale
              const scale = 0.6 + Math.sin(time * 3 + i * 0.2) * 0.4;
              particle.scale.setScalar(scale);
              
              // Rotate
              particle.rotation.x += 0.02;
              particle.rotation.y += 0.03;
              
              // Glow effect
              if (particle.material instanceof THREE.MeshStandardMaterial) {
                const intensity = 0.6 + Math.sin(time * 4 + i * 0.3) * 0.4;
                particle.material.emissiveIntensity = intensity;
                particle.material.opacity = 0.6 + Math.sin(time * 2 + i) * 0.3;
              }
            });
          };
          break;

        case "geometric-morph":
          // Dynamic geometric structures that morph and react to mouse
          const morphShapes: THREE.Mesh[] = [];
          const shapeTypes = [
            () => new THREE.OctahedronGeometry(50, 0),
            () => new THREE.IcosahedronGeometry(50, 0),
            () => new THREE.TetrahedronGeometry(50, 0),
            () => new THREE.DodecahedronGeometry(50, 0),
          ];
          
          for (let i = 0; i < 12; i++) {
            const geometry = shapeTypes[i % shapeTypes.length]();
            const material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.9,
              roughness: 0.1,
              transparent: true,
              opacity: 0.7,
              emissive: 0xffffff,
              emissiveIntensity: 0.3,
            });
            const shape = new THREE.Mesh(geometry, material);
            
            const angle = (i / 12) * Math.PI * 2;
            const radius = 250;
            shape.position.set(
              Math.cos(angle) * radius,
              Math.sin(angle * 1.5) * radius * 0.7,
              Math.sin(angle) * radius * 0.5
            );
            
            scene.add(shape);
            config.objects.push(shape);
            morphShapes.push(shape);
            (shape as any).basePosition = shape.position.clone();
            (shape as any).baseRotation = { x: Math.random(), y: Math.random(), z: Math.random() };
          }
          
          config.update = () => {
            const time = Date.now() * 0.001;
            const mouseWorldX = mouseX * 350;
            const mouseWorldY = mouseY * 250;
            
            morphShapes.forEach((shape, i) => {
              const basePos = (shape as any).basePosition;
              const dx = mouseWorldX - basePos.x;
              const dy = mouseWorldY - basePos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 300;
              const influence = Math.max(0, 1 - distance / maxDist);
              
              // Position morphing
              shape.position.x = basePos.x + Math.sin(time + i * 0.5) * 30 * (1 - influence);
              shape.position.y = basePos.y + Math.cos(time * 1.3 + i) * 25 * (1 - influence);
              shape.position.z = basePos.z + Math.sin(time * 0.7) * 20 + influence * 100;
              
              // Rotation
              shape.rotation.x += 0.01 + influence * 0.02;
              shape.rotation.y += 0.015 + influence * 0.025;
              shape.rotation.z += 0.008;
              
              // Scale morphing
              const scale = 0.8 + Math.sin(time * 2 + i) * 0.3 + influence * 0.5;
              shape.scale.setScalar(scale);
              
              // Material morphing
              if (shape.material instanceof THREE.MeshStandardMaterial) {
                shape.material.emissiveIntensity = 0.3 + Math.sin(time * 3 + i) * 0.3 + influence * 0.4;
                shape.material.opacity = 0.6 + Math.sin(time * 2 + i) * 0.2 + influence * 0.2;
              }
            });
          };
          break;

        case "expanding-universe": {
          // Advanced expanding universe effect with space-time warping
          // Create expanding grid that warps like space-time
          const isMobile = window.innerWidth <= 768;
          const gridSegments = isMobile ? 25 : 50; // Reduce grid complexity on mobile
          const gridGeometry = new THREE.PlaneGeometry(4000, 4000, gridSegments, gridSegments);
          const gridPositions = gridGeometry.attributes.position;
          
          // Store initial positions for warping
          const initialGridPositions = new Float32Array(gridPositions.count * 3);
          for (let i = 0; i < gridPositions.count; i++) {
            initialGridPositions[i * 3] = gridPositions.getX(i);
            initialGridPositions[i * 3 + 1] = gridPositions.getY(i);
            initialGridPositions[i * 3 + 2] = gridPositions.getZ(i);
          }
          
          // Create shader material for expanding grid with warping
          const gridMaterial = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0 },
              expansionRate: { value: 0.5 },
            },
            vertexShader: `
              uniform float time;
              uniform float expansionRate;
              varying vec3 vPosition;
              varying vec2 vUv;
              
              void main() {
                vUv = uv;
                vPosition = position;
                
                // Create expanding warp effect - space expands outward from center
                vec3 pos = position;
                float dist = length(pos.xy);
                float expansion = 1.0 + dist * expansionRate * 0.001 * (1.0 + sin(time * 0.3) * 0.3);
                
                // Add wave distortion for space-time warping
                float wave = sin(dist * 0.01 - time * 2.0) * 20.0;
                pos.z += wave * (1.0 - dist / 2000.0);
                
                // Radial expansion
                pos.xy *= expansion;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vPosition;
              varying vec2 vUv;
              
              void main() {
                // Create grid pattern
                vec2 grid = abs(fract(vUv * 50.0 - 0.5));
                float gridLine = min(grid.x, grid.y);
                gridLine = smoothstep(0.0, 0.1, gridLine);
                
                // Distance-based fade
                float dist = length(vPosition.xy);
                float fade = 1.0 - smoothstep(0.0, 2000.0, dist);
                
                // Cosmic colors
                vec3 color = mix(
                  vec3(0.2, 0.4, 1.0), // Deep blue
                  vec3(0.8, 0.5, 1.0), // Purple
                  dist / 2000.0
                );
                
                gl_FragColor = vec4(color * gridLine * fade, gridLine * fade * 0.6);
              }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false,
          });
          
          const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
          gridMesh.rotation.x = -Math.PI / 2;
          scene.add(gridMesh);
          config.objects.push(gridMesh);
          
          // Create expanding particle field with morphing
          const expandingParticleCount = isMobile ? 1000 : 3000; // Reduce particles on mobile
          const expandingParticleGeometry = new THREE.BufferGeometry();
          const particlePositions = new Float32Array(expandingParticleCount * 3);
          const particleColors = new Float32Array(expandingParticleCount * 3);
          const particleSizes = new Float32Array(expandingParticleCount);
          const particleVelocities = new Float32Array(expandingParticleCount * 3);
          const particleInitialPositions = new Float32Array(expandingParticleCount * 3);
          const particleTypes = new Float32Array(expandingParticleCount); // For morphing behavior
          
          for (let i = 0; i < expandingParticleCount; i++) {
            const i3 = i * 3;
            
            // Start from center with slight random offset
            const radius = Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            particleInitialPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            particleInitialPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particleInitialPositions[i3 + 2] = radius * Math.cos(phi);
            
            particlePositions[i3] = particleInitialPositions[i3];
            particlePositions[i3 + 1] = particleInitialPositions[i3 + 1];
            particlePositions[i3 + 2] = particleInitialPositions[i3 + 2];
            
            // Expansion velocity (Hubble-like expansion)
            const speed = 0.2 + Math.random() * 0.5;
            const direction = new THREE.Vector3(
              particleInitialPositions[i3],
              particleInitialPositions[i3 + 1],
              particleInitialPositions[i3 + 2]
            ).normalize();
            
            particleVelocities[i3] = direction.x * speed;
            particleVelocities[i3 + 1] = direction.y * speed;
            particleVelocities[i3 + 2] = direction.z * speed;
            
            // Cosmic colors based on distance
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
              particleColors[i3] = 0.3; // Deep space blue
              particleColors[i3 + 1] = 0.5;
              particleColors[i3 + 2] = 1.0;
            } else if (colorChoice < 0.6) {
              particleColors[i3] = 0.6; // Purple
              particleColors[i3 + 1] = 0.3;
              particleColors[i3 + 2] = 1.0;
            } else if (colorChoice < 0.85) {
              particleColors[i3] = 0.9; // Light blue
              particleColors[i3 + 1] = 0.9;
              particleColors[i3 + 2] = 1.0;
            } else {
              particleColors[i3] = 1.0; // White stars
              particleColors[i3 + 1] = 1.0;
              particleColors[i3 + 2] = 1.0;
            }
            
            particleSizes[i] = 2 + Math.random() * 5;
            particleTypes[i] = Math.random(); // Random type for morphing
          }
          
          expandingParticleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
          expandingParticleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
          expandingParticleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
          expandingParticleGeometry.setAttribute('type', new THREE.BufferAttribute(particleTypes, 1));
          
          const expandingParticleMaterial = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0 },
              expansionTime: { value: 0 },
            },
            vertexShader: `
              attribute float size;
              attribute float type;
              varying vec3 vColor;
              varying float vType;
              uniform float time;
              uniform float expansionTime;
              
              void main() {
                vColor = color;
                vType = type;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Morphing size based on type and expansion
                float morphSize = size;
                if (vType < 0.3) {
                  // Pulsing stars
                  morphSize *= 1.0 + sin(time * 3.0 + position.x * 0.01) * 0.5;
                } else if (vType < 0.6) {
                  // Expanding galaxies
                  morphSize *= 1.0 + expansionTime * 0.1;
                } else {
                  // Twinkling particles
                  morphSize *= 1.0 + sin(time * 5.0 + position.y * 0.01) * 0.3;
                }
                
                gl_PointSize = morphSize * (300.0 / -mvPosition.z) * (1.0 + sin(time * 2.0) * 0.1);
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
            fragmentShader: `
              varying vec3 vColor;
              varying float vType;
              
              void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                
                // Different shapes based on type - no glow, just solid circles
                float alpha;
                if (vType < 0.3) {
                  // Star shape - sharp edge
                  alpha = 1.0 - smoothstep(0.0, 0.1, distanceToCenter);
                } else if (vType < 0.6) {
                  // Galaxy shape - sharp edge
                  alpha = 1.0 - smoothstep(0.0, 0.1, distanceToCenter);
                } else {
                  // Circular particle - sharp edge, no glow
                  alpha = 1.0 - smoothstep(0.0, 0.1, distanceToCenter);
                }
                
                gl_FragColor = vec4(vColor, alpha * 0.3);
              }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
          });
          
          const particleSystem = new THREE.Points(expandingParticleGeometry, expandingParticleMaterial);
          scene.add(particleSystem);
          config.particles = particleSystem;
          
          // Store for animation
          (particleSystem as any).velocities = particleVelocities;
          (particleSystem as any).initialPositions = particleInitialPositions;
          
          // Create morphing 3D shapes that expand outward
          const morphingShapes: THREE.Mesh[] = [];
          const shapeCount = 20;
          const geometryTypes = [
            () => new THREE.IcosahedronGeometry(1, 0),
            () => new THREE.OctahedronGeometry(1, 0),
            () => new THREE.TetrahedronGeometry(1, 0),
            () => new THREE.DodecahedronGeometry(1, 0),
            () => new THREE.BoxGeometry(1, 1, 1),
            () => new THREE.SphereGeometry(1, 16, 16),
            () => new THREE.TorusGeometry(1, 0.3, 8, 16),
            () => new THREE.ConeGeometry(1, 2, 8),
          ];

          for (let i = 0; i < shapeCount; i++) {
            const baseGeometry = geometryTypes[i % geometryTypes.length]();
            const geometry = baseGeometry.clone();
            geometry.scale(40, 40, 40);
            
            // Create morph targets
            const morphTargets: THREE.BufferAttribute[] = [];
            for (let j = 0; j < 3; j++) {
              const targetGeometry = geometryTypes[(i + j + 1) % geometryTypes.length]();
              const targetPositions = targetGeometry.attributes.position.clone();
              for (let k = 0; k < targetPositions.count; k++) {
                targetPositions.setX(k, targetPositions.getX(k) * 40);
                targetPositions.setY(k, targetPositions.getY(k) * 40);
                targetPositions.setZ(k, targetPositions.getZ(k) * 40);
              }
              morphTargets.push(targetPositions);
            }
            geometry.morphAttributes.position = morphTargets;
            
            // Cosmic material
            const hue = (i / shapeCount) * 0.5 + 0.5;
            const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
            const material = new THREE.MeshStandardMaterial({
              color: color,
              emissive: color,
              emissiveIntensity: 0.3,
              metalness: 0.95,
              roughness: 0.05,
              transparent: true,
              opacity: 0.4,
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            // Expanding spiral pattern
            const angle = (i / shapeCount) * Math.PI * 2;
            const radius = 200 + i * 50;
            const height = (i - shapeCount / 2) * 60;
            
            mesh.position.set(
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            );
            
            (mesh as any).initialPosition = mesh.position.clone();
            (mesh as any).baseRadius = radius;
            (mesh as any).angle = angle;
            (mesh as any).morphSpeed = 0.2 + Math.random() * 0.3;
            (mesh as any).rotationSpeed = 0.01 + Math.random() * 0.02;
            (mesh as any).expansionSpeed = 0.2 + Math.random() * 0.3;
            
            scene.add(mesh);
            morphingShapes.push(mesh);
            config.objects.push(mesh);
          }
          

          // Advanced dynamic lighting system
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
          scene.add(ambientLight);
          config.lights.push(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight.position.set(200, 200, 100);
          scene.add(directionalLight);
          config.lights.push(directionalLight);

          // Expanding point lights that follow expansion
          const pointLights: THREE.PointLight[] = [];
          for (let i = 0; i < 6; i++) {
            const hue = (i / 6) * 0.3 + 0.5;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            const pointLight = new THREE.PointLight(color, 0.4, 1000);
            const angle = (i / 6) * Math.PI * 2;
            pointLight.position.set(
              Math.cos(angle) * 300,
              Math.sin(angle) * 300,
              Math.sin(i) * 200
            );
            scene.add(pointLight);
            pointLights.push(pointLight);
            config.lights.push(pointLight);
            (pointLight as any).baseRadius = 300;
            (pointLight as any).angle = angle;
          }

          config.update = () => {
            const time = Date.now() * 0.001;
            const expansionTime = time * 0.5; // Slower expansion for dramatic effect
            
            // Update grid shader uniforms
            if (gridMaterial.uniforms) {
              gridMaterial.uniforms.time.value = time;
              gridMaterial.uniforms.expansionRate.value = 0.3 + Math.sin(time * 0.2) * 0.2;
            }
            
            // Update particle system shader
            if (expandingParticleMaterial.uniforms) {
              expandingParticleMaterial.uniforms.time.value = time;
              expandingParticleMaterial.uniforms.expansionTime.value = expansionTime;
            }
            
            // Update expanding particle system
            const positions = expandingParticleGeometry.attributes.position.array as Float32Array;
            const velocities = (particleSystem as any).velocities;
            
            for (let i = 0; i < expandingParticleCount; i++) {
              const i3 = i * 3;
              
              // Hubble-like expansion with acceleration
              const distance = Math.sqrt(
                positions[i3] ** 2 + 
                positions[i3 + 1] ** 2 + 
                positions[i3 + 2] ** 2
              );
              
              // Expansion rate increases with distance (like universe expansion)
              const expansionFactor = 1.0 + expansionTime * (1.0 + distance * 0.0001);
              
              // Update positions with expansion
              positions[i3] += velocities[i3] * expansionFactor;
              positions[i3 + 1] += velocities[i3 + 1] * expansionFactor;
              positions[i3 + 2] += velocities[i3 + 2] * expansionFactor;
              
              // Reset if too far (wrap around for continuous effect)
              if (distance > 3000) {
                const initialPositions = (particleSystem as any).initialPositions;
                positions[i3] = initialPositions[i3];
                positions[i3 + 1] = initialPositions[i3 + 1];
                positions[i3 + 2] = initialPositions[i3 + 2];
              }
            }
            
            expandingParticleGeometry.attributes.position.needsUpdate = true;
            
            // Update morphing shapes
            morphingShapes.forEach((mesh, i) => {
              const morphTime = time * (mesh as any).morphSpeed;
              
              // Morph between shapes
              if (mesh.geometry.morphAttributes.position) {
                const morphTargetInfluences = mesh.morphTargetInfluences || [];
                const cycle = (Math.sin(morphTime) + 1) * 0.5;
                
                if (morphTargetInfluences.length >= 2) {
                  morphTargetInfluences[0] = 1 - cycle;
                  morphTargetInfluences[1] = cycle;
                  if (morphTargetInfluences.length >= 3) {
                    morphTargetInfluences[2] = Math.sin(morphTime * 0.7) * 0.4;
                  }
                }
              }
              
              // Continuous rotation
              mesh.rotation.x += (mesh as any).rotationSpeed;
              mesh.rotation.y += (mesh as any).rotationSpeed * 0.8;
              mesh.rotation.z += (mesh as any).rotationSpeed * 0.6;
              
              // Expand outward with universe expansion
              const expansion = 1 + expansionTime * 0.1 * (mesh as any).expansionSpeed;
              const currentRadius = (mesh as any).baseRadius * expansion;
              const orbitAngle = (mesh as any).angle + time * 0.2;
              
              mesh.position.x = Math.cos(orbitAngle) * currentRadius;
              mesh.position.z = Math.sin(orbitAngle) * currentRadius;
              mesh.position.y = (mesh as any).initialPosition.y * (1 + Math.sin(time * 0.4 + i) * 0.3);
              
              // Pulsing scale
              const scale = 1 + Math.sin(time * 1.5 + i) * 0.3;
              mesh.scale.setScalar(scale);
              
              // Pulsing emissive
              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                const pulse = 0.3 + Math.sin(time * 2.0 + i) * 0.15;
                mesh.material.emissiveIntensity = pulse;
                mesh.material.opacity = 0.4 + Math.sin(time * 1.2 + i) * 0.1;
              }
            });
            
            // Animate expanding point lights
            pointLights.forEach((light, i) => {
              const baseRadius = (light as any).baseRadius;
              const angle = time * 0.4 + (light as any).angle;
              const expansion = 1 + expansionTime * 0.05;
              
              light.position.x = Math.cos(angle) * baseRadius * expansion;
              light.position.y = Math.sin(angle) * baseRadius * expansion;
              light.position.z = Math.sin(time * 0.6 + i) * 150;
              light.intensity = 0.4 + Math.sin(time * 2.0 + i) * 0.2;
              
              // Update light color based on expansion
              const hue = (i / pointLights.length) * 0.3 + 0.5 + expansionTime * 0.01;
              const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
              light.color = color;
            });
          };
          break;
        }

        case "energy-particles":
          // Magnetic particle system
          const isMobileEnergy = window.innerWidth <= 768;
          const energyParticleCount = isMobileEnergy ? 800 : 2000; // Reduce on mobile
          const energyParticleGeometry = new THREE.BufferGeometry();
          const energyPositions = new Float32Array(energyParticleCount * 3);
          const energyVelocities = new Float32Array(energyParticleCount * 3);
          const energyColors = new Float32Array(energyParticleCount * 3);
          
          // Attractors (mouse magnetic points)
          const attractors = [
            { x: 0, y: 0, z: 0, power: 0.8 },
          ];
          
          for (let i = 0; i < energyParticleCount; i++) {
            const i3 = i * 3;
            
            // Random initial position
            energyPositions[i3] = (Math.random() - 0.5) * 2000;
            energyPositions[i3 + 1] = (Math.random() - 0.5) * 1500;
            energyPositions[i3 + 2] = (Math.random() - 0.5) * 1000;
            
            // Random velocity
            energyVelocities[i3] = (Math.random() - 0.5) * 0.5;
            energyVelocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
            energyVelocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            // Gradient colors
            const hue = (i / energyParticleCount) * 0.3 + 0.5;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            energyColors[i3] = color.r;
            energyColors[i3 + 1] = color.g;
            energyColors[i3 + 2] = color.b;
          }
          
          energyParticleGeometry.setAttribute('position', new THREE.BufferAttribute(energyPositions, 3));
          energyParticleGeometry.setAttribute('color', new THREE.BufferAttribute(energyColors, 3));
          
          const energyParticleMaterial = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
          });
          
          const particleSystem = new THREE.Points(energyParticleGeometry, energyParticleMaterial);
          scene.add(particleSystem);
          config.particles = particleSystem;
          
          config.update = () => {
            const time = Date.now() * 0.001;
            
            // Update attractors based on time
            attractors[0].x = Math.sin(time) * 300;
            attractors[0].y = Math.cos(time * 1.3) * 200;
            attractors[0].z = Math.sin(time * 0.7) * 200;
            
            for (let i = 0; i < energyParticleCount; i++) {
              const i3 = i * 3;
              let fx = 0, fy = 0, fz = 0;
              
              // Magnetic attraction to attractors
              attractors.forEach(attractor => {
                const dx = attractor.x - energyPositions[i3];
                const dy = attractor.y - energyPositions[i3 + 1];
                const dz = attractor.z - energyPositions[i3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
                const force = attractor.power / (dist * dist) * 0.1;
                fx += dx / dist * force;
                fy += dy / dist * force;
                fz += dz / dist * force;
              });
              
              // Apply forces
              energyVelocities[i3] += fx;
              energyVelocities[i3 + 1] += fy;
              energyVelocities[i3 + 2] += fz;
              
              // Damping
              energyVelocities[i3] *= 0.95;
              energyVelocities[i3 + 1] *= 0.95;
              energyVelocities[i3 + 2] *= 0.95;
              
              // Update positions
              energyPositions[i3] += energyVelocities[i3];
              energyPositions[i3 + 1] += energyVelocities[i3 + 1];
              energyPositions[i3 + 2] += energyVelocities[i3 + 2];
              
              // Boundary wrapping
              if (Math.abs(energyPositions[i3]) > 1000) energyVelocities[i3] *= -1;
              if (Math.abs(energyPositions[i3 + 1]) > 750) energyVelocities[i3 + 1] *= -1;
              if (Math.abs(energyPositions[i3 + 2]) > 500) energyVelocities[i3 + 2] *= -1;
            }
            
            energyParticleGeometry.attributes.position.needsUpdate = true;
            
            // Rotate the system
            particleSystem.rotation.y += 0.001;
          };
          break;

        case "fluid-morph":
          // Fluid morphing planes
          const morphPlaneCount = 4;
          const morphPlanes: THREE.Mesh[] = [];
          
          for (let i = 0; i < morphPlaneCount; i++) {
            const planeGeometry = new THREE.PlaneGeometry(1200, 800, 80, 80);
            const planeMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              wireframe: true,
              transparent: true,
              opacity: 0.3,
              metalness: 0.7,
              roughness: 0.3,
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = (i - morphPlaneCount / 2) * 150;
            scene.add(plane);
            config.objects.push(plane);
            morphPlanes.push(plane);
          }
          
          config.update = () => {
            const time = Date.now() * 0.001;
            morphPlanes.forEach((plane, i) => {
              const positions = plane.geometry.attributes.position;
              const morphTime = time + i * 0.3;
              
              for (let j = 0; j < positions.count; j++) {
                const x = positions.getX(j);
                const y = positions.getY(j);
                const dist = Math.sqrt(x * x + y * y);
                
                // Create fluid morphing effect
                const wave1 = Math.sin(x * 0.02 + morphTime) * 20;
                const wave2 = Math.cos(y * 0.015 + morphTime * 1.3) * 15;
                const radial = Math.sin(dist * 0.01 + morphTime * 2) * 10;
                
                positions.setZ(j, wave1 + wave2 + radial);
              }
              
              positions.needsUpdate = true;
              
              // Rotate slowly
              plane.rotation.z += 0.0005 * (i % 2 === 0 ? 1 : -1);
              
              // Pulse opacity
              if (plane.material instanceof THREE.MeshStandardMaterial) {
                plane.material.opacity = 0.2 + Math.sin(morphTime) * 0.3;
              }
            });
          };
          break;

        case "neural-network":
          // Neural network with connecting nodes
          const nodeCount = 30;
          const nodes: THREE.Mesh[] = [];
          const nodeConnections: Array<{from: number, to: number}> = [];
          
          // Create nodes
          for (let i = 0; i < nodeCount; i++) {
            const nodeGeometry = new THREE.SphereGeometry(8, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffffff,
              emissiveIntensity: 0.8,
              metalness: 0.9,
              roughness: 0.1,
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            
            node.position.set(
              (Math.random() - 0.5) * 1200,
              (Math.random() - 0.5) * 800,
              (Math.random() - 0.5) * 600
            );
            
            scene.add(node);
            config.objects.push(node);
            nodes.push(node);
            (node as any).initialPos = node.position.clone();
          }
          
          // Create connections (nearby nodes)
          nodes.forEach((node1, i) => {
            nodes.slice(i + 1).forEach((node2, j) => {
              const distance = node1.position.distanceTo(node2.position);
              if (distance < 250 && Math.random() > 0.7) {
                nodeConnections.push({ from: i, to: i + 1 + j });
              }
            });
          });
          
          // Create line geometry for connections
          const connectionGeometry = new THREE.BufferGeometry();
          const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
          });
          
          const updateConnections = () => {
            const points: number[] = [];
            nodeConnections.forEach(conn => {
              const fromNode = nodes[conn.from];
              const toNode = nodes[conn.to];
              points.push(fromNode.position.x, fromNode.position.y, fromNode.position.z);
              points.push(toNode.position.x, toNode.position.y, toNode.position.z);
            });
            connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
          };
          
          updateConnections();
          const connectionLines = new THREE.LineSegments(connectionGeometry, connectionMaterial);
          scene.add(connectionLines);
          config.helpers = [connectionLines];
          
          config.update = () => {
            const time = Date.now() * 0.001;
            nodes.forEach((node, i) => {
              const morphTime = time + i * 0.2;
              
              // Morph position around initial
              node.position.x = (node as any).initialPos.x + Math.sin(morphTime) * 30;
              node.position.y = (node as any).initialPos.y + Math.cos(morphTime * 1.3) * 25;
              node.position.z = (node as any).initialPos.z + Math.sin(morphTime * 0.7) * 20;
              
              // Pulsing scale and glow
              const pulse = Math.sin(morphTime * 2) * 0.3 + 1;
              node.scale.setScalar(pulse);
              
              if (node.material instanceof THREE.MeshStandardMaterial) {
                node.material.emissiveIntensity = 0.5 + Math.sin(morphTime * 3) * 0.5;
              }
            });
            
            updateConnections();
            connectionGeometry.attributes.position.needsUpdate = true;
          };
          break;
      }

      // Add enhanced lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      config.lights.push(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(1, 1, 1);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 1000;
      scene.add(directionalLight);
      config.lights.push(directionalLight);

      // Add point lights for more dynamic lighting
      const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 1000);
      pointLight1.position.set(100, 100, 100);
      scene.add(pointLight1);
      config.lights.push(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 800);
      pointLight2.position.set(-100, -100, 100);
      scene.add(pointLight2);
      config.lights.push(pointLight2);

      return config;
    };

    // Define scene types for each section - each section gets a unique background
    const sceneTypes = [
      "energy-particles",       // 0: HERO - STUDY SMARTER. ACHIEVE MORE. EVERY SINGLE DAY.
      "interactive-grid",       // 1: WELCOME - WE UNDERSTAND YOUR STRUGGLE.
      "expanding-universe",     // 2: AI STUDY ROADMAPS - YOUR AI STUDY COMPANION
      "connecting-dots",        // 3: TEAM COLLABORATION - LEARN, BUILD, AND GROW TOGETHER
      "particle-trail",         // 4: JOB HUNT - TURN YOUR LEARNING INTO A CAREER ADVANTAGE
      "solar-system",          // 5: SMART LEARNING - REMEMBER WHAT MATTERS. FOR LIFE.
      "neural-network",        // 6: UNIFIED ECOSYSTEM - ONE PLATFORM. ZERO STRESS. INFINITE FOCUS.
      "fluid-morph",           // 7: WORKING PROFESSIONALS - BALANCE WORK AND GROWTH WITHOUT COMPROMISE
      "geometric-morph",       // 8: AI INTERVIEW - CONFIDENCE THAT SPEAKS FOR ITSELF
      "waves",                 // 9: BEGIN - YOUR FUTURE DESERVES THIS INVESTMENT
    ];

    // Current active scene config
    let currentSceneConfig: {
      objects: THREE.Mesh[];
      particles?: THREE.Points;
      lights: THREE.Light[];
      helpers?: any[];
      update?: () => void;
    } | null = null;

    // Function to clear current scene
    const clearScene = () => {
      if (currentSceneConfig) {
        currentSceneConfig.objects.forEach((obj) => {
          scene.remove(obj);
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        });
        if (currentSceneConfig.particles) {
          scene.remove(currentSceneConfig.particles);
          currentSceneConfig.particles.geometry.dispose();
          if (currentSceneConfig.particles.material instanceof THREE.Material) {
            currentSceneConfig.particles.material.dispose();
          }
        }
        currentSceneConfig.lights.forEach((light) => {
          scene.remove(light);
        });
        if (currentSceneConfig.helpers) {
          currentSceneConfig.helpers.forEach((helper) => {
            scene.remove(helper);
            if (helper.geometry) helper.geometry.dispose();
            if (helper.material instanceof THREE.Material) helper.material.dispose();
          });
        }
      }
    };

    // Function to load scene for section
    const loadScene = (sectionIndex: number) => {
      clearScene();

      const sceneType = sceneTypes[sectionIndex] || "geometric-shapes";
      console.log(`🎨 Loading scene type: ${sceneType} for section ${sectionIndex}`);
      currentSceneConfig = createSceneType(sceneType);
      console.log(`✅ Scene loaded: ${currentSceneConfig.objects.length} objects, ${currentSceneConfig.particles ? 'with particles' : 'no particles'}, ${currentSceneConfig.lights.length} lights`);

      // Animate scene in - start visible for immediate feedback
      currentSceneConfig.objects.forEach((obj, i) => {
        // Start at full scale for immediate visibility
        obj.scale.setScalar(1);
        // Add subtle entrance animation for first few objects
        if (i < 3) {
          obj.scale.setScalar(0);
          gsap.to(obj.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            delay: i * 0.1,
            ease: "power2.out",
          });
        }
      });

      if (currentSceneConfig.particles) {
        // Start particles visible
        currentSceneConfig.particles.scale.setScalar(1);
        console.log(`✨ Particles initialized and visible`);
      }
    };

    // Initialize first scene
    loadScene(currentSection);

    camera.position.set(0, 0, 800);
    camera.lookAt(0, 0, 0);
    console.log("📹 Camera positioned at:", camera.position);

    // Mouse tracking for interactive effects
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (currentSceneConfig && currentSceneConfig.update) {
        currentSceneConfig.update();
      }

      // Camera movement based on mouse (subtle)
      camera.position.x += (mouseX * 50 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 50 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Store scene loading function
    morphFunctionRef.current = (sectionIndex: number) => {
      loadScene(sectionIndex);
    };

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      clearScene();
      renderer.dispose();
    };
  }, [currentSection]);

  // Smooth scroll to section with enhanced animations
  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;

    const targetIndex = Math.max(0, Math.min(index, sections.length - 1));
    const prevIndex = currentSection;
    const targetElement = containerRef.current.children[targetIndex] as HTMLElement;
    const prevElement = containerRef.current.children[prevIndex] as HTMLElement;

    if (targetElement) {
      // Animate previous section out
      if (prevElement && prevIndex !== targetIndex) {
        const prevTitle = prevElement.querySelector(".section-title");
        const prevSubtitle = prevElement.querySelector(".section-subtitle");
        
        if (prevTitle) {
          gsap.to(prevTitle, {
            opacity: 0,
            y: -50,
            scale: 0.8,
            rotationX: -90,
            duration: 0.6,
            ease: "power2.in",
          });
        }
        
        if (prevSubtitle) {
          gsap.to(prevSubtitle, {
            opacity: 0,
            y: -30,
            duration: 0.4,
            ease: "power2.in",
          });
        }
      }

      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentSection(targetIndex);

      // Enhanced text animation with morphing
      const title = targetElement.querySelector(".section-title");
      const subtitle = targetElement.querySelector(".section-subtitle");
      
      if (title) {
        gsap.fromTo(
          title,
          {
            opacity: 0,
            y: 100,
            scale: 0.5,
            rotationX: 90,
            transformOrigin: "50% 50%",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
              // Continuous subtle animation
              gsap.to(title, {
                y: "+=10",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            },
          }
        );

        // Add letter-by-letter animation effect (only if not already animated)
        if (!title.hasAttribute("data-animated")) {
          const text = title.textContent || "";
          title.textContent = "";
          title.setAttribute("data-animated", "true");
          
          // Split by words, not letters
          const words = text.split(/\s+/).filter(word => word.length > 0);
          words.forEach((word, i) => {
            const span = document.createElement("span");
            span.textContent = word;
            span.style.display = "inline";
            span.style.whiteSpace = "nowrap";
            span.style.wordBreak = "keep-all";
            span.style.opacity = "0";
            span.style.transform = "translateY(50px) rotateX(90deg)";
            title.appendChild(span);
            // Add space after word (except last word)
            if (i < words.length - 1) {
              const space = document.createTextNode(" ");
              title.appendChild(space);
            }

            gsap.to(span, {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.5,
              delay: i * 0.02,
              ease: "power3.out",
            });
          });
        }
      }

      // Animate subtitle
      if (subtitle) {
        gsap.fromTo(
          subtitle,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 0.9,
            y: 0,
            duration: 1,
            delay: 0.6,
            ease: "power2.out",
          }
        );
      }

      // Trigger 3D morph
      if (morphFunctionRef.current && prevIndex !== targetIndex) {
        morphFunctionRef.current(targetIndex);
      }
    }
  };

  // Handle mouse wheel and touch gestures
  useEffect(() => {
    let isScrolling = false;
    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;
      isScrolling = true;

      const delta = e.deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + delta;

      if (nextSection >= 0 && nextSection < sections.length) {
        scrollToSection(nextSection);
      }

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    // Touch handlers for mobile swipe gestures
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartY || !e.changedTouches[0]) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (isScrolling) return;
        isScrolling = true;

        const delta = swipeDistance > 0 ? 1 : -1; // Swipe up = next, swipe down = previous
        const nextSection = currentSection + delta;

        if (nextSection >= 0 && nextSection < sections.length) {
          scrollToSection(nextSection);
        }

        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }

      touchStartY = 0;
      touchEndY = 0;
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();

        if (isScrolling) return;
        isScrolling = true;

        const delta = e.key === "ArrowDown" ? 1 : -1;
        const nextSection = currentSection + delta;

        if (nextSection >= 0 && nextSection < sections.length) {
          scrollToSection(nextSection);
        }

        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection]);

  // Initial load animation
  useEffect(() => {
    if (isLoaded && containerRef.current && currentSection === 0) {
      const firstSection = containerRef.current.children[0] as HTMLElement;
      if (firstSection) {
        const title = firstSection.querySelector(".section-title");
        const subtitle = firstSection.querySelector(".section-subtitle");
        
        if (title) {
          gsap.fromTo(
            title,
            {
              opacity: 0,
              y: 100,
              scale: 0.5,
              rotationX: 90,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 1.2,
              ease: "elastic.out(1, 0.5)",
              onComplete: () => {
                // Continuous subtle animation
                gsap.to(title, {
                  y: "+=10",
                  duration: 2,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut",
                });
              },
            }
          );
        }
        
        // Animate subtitle on initial load
        if (subtitle) {
          gsap.fromTo(
            subtitle,
            {
              opacity: 0,
              y: 50,
            },
            {
              opacity: 0.9,
              y: 0,
              duration: 1,
              delay: 0.8,
              ease: "power2.out",
            }
          );
        }
      }
    }
  }, [isLoaded, currentSection]);

  // Mark as loaded
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className="landing-page-container relative w-full h-screen overflow-hidden bg-black"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
    >
      {/* WebGL Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ 
            zIndex: 0, 
            opacity: isMobile ? 0.2 : 0.3, // Lower opacity on mobile
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            willChange: 'opacity',
          }}
      />

      {/* Sections Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ 
          zIndex: 1,
          background: 'transparent'
        }}
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="section w-full h-screen flex items-center justify-center relative cursor-pointer"
            onClick={() => {
              if (index === sections.length - 1) {
                // Last section - navigate to signup
                navigate("/signup");
              } else {
                scrollToSection(index + 1);
              }
            }}
            style={{
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              background: 'transparent',
            }}
          >
            {/* Bottom half click area for next section */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer z-10"
              style={{ background: 'transparent' }}
              onClick={(e) => {
                e.stopPropagation();
                if (index < sections.length - 1) {
                  scrollToSection(index + 1);
                }
              }}
            />

            {/* Top half click area for previous section */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 cursor-pointer z-10"
              style={{ background: 'transparent' }}
              onClick={(e) => {
                e.stopPropagation();
                if (index > 0) {
                  scrollToSection(index - 1);
                }
              }}
            />

            {/* Section Content */}
            <div className="section-content text-center relative z-20" style={{ 
              width: '100%', 
              maxWidth: '100vw', 
              boxSizing: 'border-box', 
              overflow: 'hidden',
              padding: '0 clamp(0.75rem, 4vw, 2rem)',
              margin: '0 auto'
            }}>
              {section.preheading && (
                <p
                  className="section-preheading mb-4 leading-relaxed"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    fontSize: "clamp(0.625rem, 2vw, 1rem)",
                    opacity: 0.7,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "#b0b0b0",
                    textTransform: "uppercase",
                    maxWidth: "100%",
                    width: "100%",
                    margin: "0 auto 1rem",
                    padding: "0",
                    lineHeight: "1.4",
                  }}
                >
                  {section.preheading}
                </p>
              )}
              <h1
                className="section-title font-bold leading-tight"
                style={{
                  fontSize: index === 0 
                    ? "clamp(1.5rem, 6vw, 3rem)" 
                    : "clamp(1.5rem, 7vw, 4.5rem)",
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  letterSpacing: index === 0 ? "0.01em" : "-0.01em",
                  textTransform: "uppercase",
                  opacity: 0,
                  maxWidth: "100%",
                  width: "100%",
                  margin: "0 auto",
                  padding: "0",
                  lineHeight: index === 0 ? "1.2" : "1.15",
                  fontWeight: 700,
                  color: "#b0b0b0",
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  wordBreak: "keep-all",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  hyphens: "none",
                  boxSizing: "border-box",
                }}
              >
                {section.title
                  .replace(/-/g, '\u2011') // Replace hyphens with non-breaking hyphens
                  .split(/\s+/) // Split by whitespace to get words
                  .filter(word => word.length > 0) // Remove empty strings
                  .map((word, wordIndex, words) => (
                    <React.Fragment key={wordIndex}>
                      <span
                        className="no-break-word"
                        style={{
                          whiteSpace: "nowrap",
                          display: "inline",
                          overflowWrap: "normal",
                          wordBreak: "keep-all",
                          textOverflow: "ellipsis",
                          overflow: "visible",
                          wordWrap: "normal",
                        }}
                      >
                        {word}
                      </span>
                      {wordIndex < words.length - 1 && ' '} {/* Regular space - allows wrapping between words */}
                    </React.Fragment>
                  ))}
              </h1>
              {section.subtitle && (
                <p
                  className="section-subtitle mt-8 leading-relaxed"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    fontSize: "clamp(0.875rem, 3vw, 1.25rem)",
                    opacity: 0.9,
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    color: "#b0b0b0",
                    maxWidth: "100%",
                    width: "100%",
                    margin: "1rem auto 0",
                    padding: "0",
                    wordBreak: "normal",
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    hyphens: "none",
                    whiteSpace: "normal",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    lineHeight: "1.5",
                  }}
                >
                  {section.subtitle}
                </p>
              )}
              {section.quote && (
                <div className="mt-12" style={{ maxWidth: "min(800px, 90vw)", margin: "1.5rem auto 0", padding: "0 clamp(0.75rem, 4vw, 1rem)" }}>
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                      fontSize: "clamp(0.875rem, 3.5vw, 1.25rem)",
                      fontStyle: "italic",
                      opacity: 0.85,
                      fontWeight: 300,
                      letterSpacing: "0.02em",
                      color: "#b0b0b0",
                      lineHeight: "1.5",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    "{section.quote}"
                  </p>
                  {section.author && (
                    <p
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                        fontSize: "clamp(0.625rem, 2vw, 0.875rem)",
                        opacity: 0.6,
                        fontWeight: 400,
                        letterSpacing: "0.05em",
                        color: "#b0b0b0",
                        textTransform: "uppercase",
                        margin: "0",
                      }}
                    >
                      — {section.author}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Previous Button - Positioned at Top */}
            {index > 0 && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 flex justify-center items-center" style={{ top: 'clamp(0.5rem, 2vh, 5rem)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToSection(index - 1);
                  }}
                  className="text-sm font-medium px-4 py-4 border rounded-full transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:opacity-100 hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 flex items-center justify-center touch-manipulation"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    color: "#b0b0b0",
                    borderColor: "rgba(176, 176, 176, 0.3)",
                    transition: "all 0.3s ease-in-out",
                    fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    padding: "clamp(0.75rem, 2.5vw, 1rem) clamp(1rem, 3.5vw, 1.25rem)",
                    minWidth: "48px",
                    minHeight: "48px",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "rgba(176, 176, 176, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.color = "#b0b0b0";
                    }
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onTouchEnd={(e) => {
                    setTimeout(() => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.opacity = "1";
                    }, 150);
                  }}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }}
                  >
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Next Button - Positioned at Bottom */}
            {index < sections.length - 1 ? (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex justify-center items-center" style={{ bottom: 'clamp(4rem, 8vh, 5rem)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToSection(index + 1);
                  }}
                  className="text-sm font-medium px-4 py-4 border rounded-full transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:opacity-100 hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 flex items-center justify-center touch-manipulation"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    color: "#b0b0b0",
                    borderColor: "rgba(176, 176, 176, 0.3)",
                    transition: "all 0.3s ease-in-out",
                    fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    padding: "clamp(0.75rem, 2.5vw, 1rem) clamp(1rem, 3.5vw, 1.25rem)",
                    minWidth: "48px",
                    minHeight: "48px",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "rgba(176, 176, 176, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.color = "#b0b0b0";
                    }
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onTouchEnd={(e) => {
                    setTimeout(() => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.opacity = "1";
                    }, 150);
                  }}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex justify-center items-center" style={{ bottom: 'clamp(4rem, 8vh, 5rem)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/signup");
                  }}
                  className="text-sm font-medium px-6 py-3 border rounded-full uppercase tracking-wider transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:opacity-100 hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 flex items-center gap-2 touch-manipulation"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    color: "#b0b0b0",
                    borderColor: "rgba(176, 176, 176, 0.3)",
                    transition: "all 0.3s ease-in-out",
                    fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                    padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.25rem, 4vw, 1.75rem)",
                    minWidth: "48px",
                    minHeight: "48px",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "rgba(176, 176, 176, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth > 768) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.color = "#b0b0b0";
                    }
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onTouchEnd={(e) => {
                    setTimeout(() => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.opacity = "1";
                    }, 150);
                  }}
                >
                  <span>Get Started</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ width: 'clamp(14px, 4vw, 16px)', height: 'clamp(14px, 4vw, 16px)' }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Navigation Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30" style={{ bottom: 'clamp(1rem, 3vh, 2rem)' }}>
              <div className="flex gap-2" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                {sections.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentSection
                        ? ""
                        : "opacity-30"
                    }`}
                    style={{
                      backgroundColor: "#b0b0b0",
                      width: i === currentSection ? 'clamp(24px, 6vw, 32px)' : 'clamp(6px, 1.5vw, 8px)',
                      height: 'clamp(6px, 1.5vw, 8px)',
                      minWidth: '6px',
                      minHeight: '6px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="fixed top-8 right-8 z-40 flex gap-4" style={{ top: 'clamp(0.75rem, 2vh, 2rem)', right: 'clamp(0.75rem, 2vw, 2rem)', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
        <button
          onClick={() => {
            navigate("/signup");
          }}
          className="text-xs font-medium px-4 py-2 border rounded uppercase tracking-wider transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:opacity-100 hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 touch-manipulation"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            color: "#b0b0b0",
            borderColor: "rgba(176, 176, 176, 0.3)",
            transition: "all 0.3s ease-in-out",
            fontSize: "clamp(0.625rem, 2.5vw, 0.75rem)",
            padding: "clamp(0.625rem, 2.5vw, 0.875rem) clamp(0.875rem, 3.5vw, 1.25rem)",
            minWidth: "48px",
            minHeight: "48px",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "rgba(176, 176, 176, 0.2)",
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.color = "#ffffff";
            }
          }}
          onMouseLeave={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.color = "#b0b0b0";
            }
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
            e.currentTarget.style.opacity = "0.8";
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.opacity = "1";
            }, 150);
          }}
        >
          START MY TRANSFORMATION
        </button>
      </div>

      {/* Help Text */}
      <div className="fixed bottom-8 right-8 z-40 text-xs opacity-50 uppercase tracking-wider" style={{ bottom: 'clamp(1rem, 3vh, 2rem)', right: 'clamp(0.75rem, 2vw, 2rem)' }}>
        <div style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          color: "#b0b0b0",
          fontSize: "clamp(0.625rem, 2vw, 0.75rem)",
        }}>
          Scroll or use ↑ ↓ keys
        </div>
      </div>

      {/* Back to Top Button - Only show on last section */}
      {currentSection === sections.length - 1 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40" style={{ bottom: 'clamp(4rem, 8vh, 5rem)' }}>
          <button
            onClick={() => scrollToSection(0)}
            className="text-xs font-medium px-6 py-3 border rounded-full uppercase tracking-wider transition-all duration-300 ease-in-out hover:opacity-100 active:scale-95 hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 flex items-center gap-2 touch-manipulation"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
              color: "#b0b0b0",
              borderColor: "rgba(176, 176, 176, 0.3)",
              transition: "all 0.3s ease-in-out",
              fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.25rem, 4vw, 1.75rem)",
              minWidth: "48px",
              minHeight: "48px",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "rgba(176, 176, 176, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth > 768) {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (window.innerWidth > 768) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.color = "#b0b0b0";
              }
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
              e.currentTarget.style.opacity = "0.8";
            }}
            onTouchEnd={(e) => {
              setTimeout(() => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }, 150);
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ width: 'clamp(14px, 4vw, 16px)', height: 'clamp(14px, 4vw, 16px)' }}
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
            Back to Top
          </button>
        </div>
      )}
    </div>
  );
};

