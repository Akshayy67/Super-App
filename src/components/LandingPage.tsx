import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import * as THREE from "three";
import "./LandingPage.css";

interface Section {
  id: string;
  title: string;
  subtitle?: string;
}

const sections: Section[] = [
  { 
    id: "welcome", 
    title: "WELCOME TO THE WORLD'S FIRST AI-POWERED ACADEMIC ECOSYSTEM",
    subtitle: "Where 15 fragmented apps become ONE. Where your dreams transform into action plans. Where every meeting becomes searchable knowledge. Where interviews improve through AI-driven analysis. This isn't just an app—it's the future of learning, unified."
  },
  { 
    id: "dream-to-plan", 
    title: "DREAM TO PLAN: FROM THOUGHTS TO ACTION",
    subtitle: "Write in your journal: 'Build an e-commerce website by December. Complete OS assignment by November 3rd.' Our AI INSTANTLY detects your intent, extracts dates, creates todos, suggests teams, schedules meetings. Your journal becomes your action plan. No one else does this. Only we do."
  },
  { 
    id: "ai-interview", 
    title: "INTERVIEW ANALYTICS: COMPARE, SIMULATE, IMPROVE",
    subtitle: "Every interview simulated and analyzed on 5 factors: confidence, clarity, professionalism, engagement, adaptability. Face detection tracks real-time progress. Compare current performance to previous sessions. Watch improvement graphs over time. Identify weak areas instantly. ₹41,000+ value. FREE."
  },
  { 
    id: "unified-ecosystem", 
    title: "FRAGMENTED TO ONE: EVERYTHING CONNECTED",
    subtitle: "15 apps. 15 logins. 2.5 hours wasted daily. NO MORE. Your meeting notes sync with your study notes. Your journal connects to your todos. Your interview prep links to your analytics. Your flashcards remember your learning patterns. ONE platform. ZERO context switching. 500% productivity increase."
  },
  { 
    id: "ai-scribe", 
    title: "AI SCRIBE: MEETINGS NEVER DISAPPEAR",
    subtitle: "Every meeting auto-transcribed in real-time, AI-summarized, action items extracted, saved forever, searchable in seconds. Zoom saves nothing. We save EVERYTHING. 120 hours per year saved. Never lose information again."
  },
  { 
    id: "video-collab", 
    title: "HD VIDEO COLLABORATION: ENTERPRISE-GRADE, FREE",
    subtitle: "Crystal-clear WebRTC technology. Screen sharing. Real-time collaboration. Everything you need for study groups, project meetings, pair programming—completely free. No subscriptions. No limits."
  },
  { 
    id: "pair-programming", 
    title: "PAIR PROGRAMMING & DRAWING: CREATE TOGETHER",
    subtitle: "Real-time collaborative coding with 13+ languages. Real-time collaborative drawing with 12 professional tools. Code together. Draw together. Build together. All in one place. Seamlessly integrated."
  },
  { 
    id: "smart-learning", 
    title: "SMART LEARNING: REMEMBER FOR LIFE",
    subtitle: "AI-powered spaced repetition flashcards based on Ebbinghaus's Forgetting Curve. Our AI predicts when you'll forget and reminds you at the optimal time. Science-backed memory optimization. Remember what matters most—for life."
  },
  { 
    id: "begin", 
    title: "THE FUTURE OF LEARNING BEGINS NOW",
    subtitle: "Stop drowning in 15 apps. Start soaring with one. Join thousands of students saving 49 days per year. Transform chaos into clarity. Begin your journey—completely free."
  },
];

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const morphFunctionRef = useRef<((sectionIndex: number) => void) | null>(null);

  // Initialize Three.js WebGL background with section-specific scenes
  useEffect(() => {
    if (!canvasRef.current) return;

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
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

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
          const particleCount = 3000;
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

        case "energy-particles":
          // Magnetic particle system
          const energyParticleCount = 2000;
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

    // Define scene types for each section
    const sceneTypes = [
      "energy-particles",       // WELCOME TO THE WORLD'S FIRST...
      "interactive-grid",       // DREAM TO PLAN: FROM THOUGHTS TO ACTION
      "neural-network",         // INTERVIEW ANALYTICS: COMPARE, SIMULATE, IMPROVE
      "particle-trail",         // FRAGMENTED TO ONE: EVERYTHING CONNECTED
      "particles-cloud",        // AI SCRIBE: MEETINGS NEVER DISAPPEAR
      "geometric-morph",        // HD VIDEO COLLABORATION: ENTERPRISE-GRADE, FREE
      "connecting-dots",        // PAIR PROGRAMMING & DRAWING: CREATE TOGETHER
      "solar-system",           // SMART LEARNING: REMEMBER FOR LIFE
      "interactive-grid",       // THE FUTURE OF LEARNING BEGINS NOW
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
      currentSceneConfig = createSceneType(sceneType);

      // Animate scene in
      currentSceneConfig.objects.forEach((obj, i) => {
        obj.scale.setScalar(0);
        gsap.to(obj.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: "elastic.out(1, 0.6)",
        });
      });

      if (currentSceneConfig.particles) {
        currentSceneConfig.particles.scale.setScalar(0);
        gsap.to(currentSceneConfig.particles.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "power2.out",
        });
      }
    };

    // Initialize first scene
    loadScene(currentSection);

    camera.position.set(0, 0, 800);

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

      // Camera movement based on mouse
      camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 100 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

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
        const prevSubtitle = prevElement.querySelector("p");
        
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
      const subtitle = targetElement.querySelector("p");
      
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
          
          const letters = text.split("");
          letters.forEach((letter, i) => {
            const span = document.createElement("span");
            span.textContent = letter === " " ? "\u00A0" : letter;
            span.style.display = "inline-block";
            span.style.opacity = "0";
            span.style.transform = "translateY(50px) rotateX(90deg)";
            title.appendChild(span);

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

  // Handle mouse wheel
  useEffect(() => {
    let isScrolling = false;

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

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection]);

  // Initial load animation
  useEffect(() => {
    if (isLoaded && containerRef.current && currentSection === 0) {
      const firstSection = containerRef.current.children[0] as HTMLElement;
      if (firstSection) {
        const title = firstSection.querySelector(".section-title");
        const subtitle = firstSection.querySelector("p");
        
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
        className="fixed inset-0 w-full h-full pointer-events-none opacity-30"
        style={{ zIndex: 0 }}
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
                // Last section - navigate to dashboard
                // Mark landing page as skipped
                localStorage.setItem("landingPageSkipped", "true");
                navigate("/dashboard");
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
            <div className="section-content text-center px-4 relative z-20">
              <h1
                className="section-title font-bold leading-tight"
                style={{
                  fontSize: index === 0 
                    ? "clamp(1.5rem, 5vw, 3rem)" 
                    : "clamp(2rem, 7vw, 5rem)",
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  letterSpacing: index === 0 ? "0.01em" : "-0.01em",
                  textTransform: "uppercase",
                  opacity: 0,
                  maxWidth: index === 0 ? "90%" : "95%",
                  margin: "0 auto",
                  lineHeight: index === 0 ? "1.3" : "1.2",
                  fontWeight: 700,
                  color: "#b0b0b0",
                }}
              >
                {section.title}
              </h1>
              {section.subtitle && (
                <p
                  className="mt-8 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    opacity: 0.9,
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    color: "#b0b0b0",
                  }}
                >
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Navigation Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
              <div className="flex gap-2">
                {sections.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentSection
                        ? "w-8"
                        : "opacity-30"
                    }`}
                    style={{
                      backgroundColor: i === currentSection ? "#b0b0b0" : "#b0b0b0",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="fixed top-8 right-8 z-40 flex gap-4">
        <button
          onClick={() => {
            // Mark landing page as skipped
            localStorage.setItem("landingPageSkipped", "true");
            navigate("/dashboard");
          }}
          className="text-xs font-medium hover:opacity-70 transition-opacity px-4 py-2 border rounded uppercase tracking-wider"
          style={{ 
            fontFamily: '"Inter", sans-serif',
            color: "#b0b0b0",
            borderColor: "rgba(176, 176, 176, 0.3)",
          }}
        >
          SKIP
        </button>
      </div>

      {/* Help Text */}
      <div className="fixed bottom-8 right-8 z-40 text-xs opacity-50 uppercase tracking-wider">
        <div style={{ 
          fontFamily: '"Inter", sans-serif',
          color: "#b0b0b0",
        }}>
          Scroll or use ↑ ↓ keys
        </div>
      </div>
    </div>
  );
};

