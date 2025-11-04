import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface RunningBullProps {
  className?: string;
  isRunning?: boolean;
}

export const RunningBull: React.FC<RunningBullProps> = ({
  className = "",
  isRunning = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bullRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number>();
  const runCycleRef = useRef(0);

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

    // Create bull group
    const bull = new THREE.Group();
    bullRef.current = bull;

    // Bull body (main torso)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown
      roughness: 0.7,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    bull.add(body);

    // Bull head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.35, 0.4);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321, // Darker brown
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.35, 0.35, 0);
    bull.add(head);

    // Horns
    const hornGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d1b0e, // Dark brown/black
      roughness: 0.5,
    });
    
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(0.15, 0.5, 0.12);
    leftHorn.rotation.z = -0.3;
    bull.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.15, 0.5, -0.12);
    rightHorn.rotation.z = 0.3;
    bull.add(rightHorn);

    // Ears
    const earGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.05);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(0.45, 0.4, 0.15);
    leftEar.rotation.z = -0.5;
    bull.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.45, 0.4, -0.15);
    rightEar.rotation.z = 0.5;
    bull.add(rightEar);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.12, 0.4, 0.12);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
    });

    // Front legs
    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(0.2, -0.2, 0.25);
    bull.add(frontLeftLeg);

    const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontRightLeg.position.set(0.2, -0.2, -0.25);
    bull.add(frontRightLeg);

    // Back legs
    const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    backLeftLeg.position.set(-0.2, -0.2, 0.25);
    bull.add(backLeftLeg);

    const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    backRightLeg.position.set(-0.2, -0.2, -0.25);
    bull.add(backRightLeg);

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d1b0e,
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-0.35, 0.3, 0);
    tail.rotation.z = Math.PI / 2;
    bull.add(tail);

    // Store references for animation
    const legs = {
      frontLeft: frontLeftLeg,
      frontRight: frontRightLeg,
      backLeft: backLeftLeg,
      backRight: backRightLeg,
      tail,
      head,
    };

    scene.add(bull);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 100);
    pointLight.position.set(-2, 1, 2);
    scene.add(pointLight);

    // Position camera
    camera.position.set(0, 0.5, 2);
    camera.lookAt(0, 0.2, 0);

    // Mouse interaction
    let targetRotationY = 0;
    let mouseX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX = x;
      targetRotationY = x * 0.3;
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
    }

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Rotate bull to face mouse
      if (bull) {
        bull.rotation.y += (targetRotationY - bull.rotation.y) * 0.1;
      }

      // Running animation
      if (isRunning) {
        runCycleRef.current += 0.2;
        const cycle = runCycleRef.current;

        // Front legs - opposite phase
        legs.frontLeft.rotation.x = Math.sin(cycle) * 0.5;
        legs.frontRight.rotation.x = -Math.sin(cycle) * 0.5;

        // Back legs - opposite phase from front
        legs.backLeft.rotation.x = -Math.sin(cycle) * 0.5;
        legs.backRight.rotation.x = Math.sin(cycle) * 0.5;

        // Body bobbing
        if (body) {
          body.position.y = 0.2 + Math.abs(Math.sin(cycle * 2)) * 0.05;
        }

        // Head bobbing
        legs.head.rotation.x = Math.sin(cycle * 1.5) * 0.1;
        legs.head.position.y = 0.35 + Math.sin(cycle * 1.5) * 0.02;

        // Tail wagging
        legs.tail.rotation.y = Math.sin(cycle * 1.5) * 0.3;
        legs.tail.rotation.z = Math.PI / 2 + Math.sin(cycle * 1.5) * 0.1;

        // Slight forward lean
        if (bull) {
          bull.rotation.x = Math.sin(cycle * 0.5) * 0.05;
        }
      } else {
        // Idle animation - gentle breathing
        if (body) {
          body.position.y = 0.2 + Math.sin(time * 0.5) * 0.01;
        }
        legs.head.rotation.x = Math.sin(time * 0.3) * 0.05;
        legs.tail.rotation.y = Math.sin(time * 0.4) * 0.2;
      }

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
      }
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      headGeometry.dispose();
      headMaterial.dispose();
      hornGeometry.dispose();
      hornMaterial.dispose();
      earGeometry.dispose();
      earMaterial.dispose();
      legGeometry.dispose();
      legMaterial.dispose();
      tailGeometry.dispose();
      tailMaterial.dispose();
    };
  }, [isRunning]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ minWidth: "80px", minHeight: "80px" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

