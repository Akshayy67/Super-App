import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ConnectingDotsBackgroundProps {
  className?: string;
}

export const ConnectingDotsBackground: React.FC<ConnectingDotsBackgroundProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Dots that connect with lines - matching landing page exactly
    const dotCount = 50;
    const dots: THREE.Mesh[] = [];
    
    for (let i = 0; i < dotCount; i++) {
      const dotGeometry = new THREE.SphereGeometry(5, 16, 16);
      const dotMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.7,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 500
      );
      scene.add(dot);
      dots.push(dot);
    }

    // Create lines connecting nearby dots - exact same as landing page
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
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

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000);
    pointLight.position.set(0, 0, 500);
    scene.add(pointLight);

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
      const time = Date.now() * 0.001;

      // Animate dots - exact same as landing page
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

      // Camera movement based on mouse - exact same as landing page
      camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 100 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Point light animation
      pointLight.position.x = Math.sin(time) * 300;
      pointLight.position.y = Math.cos(time) * 300;
      pointLight.position.z = 500 + Math.sin(time * 0.7) * 200;

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

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      dots.forEach((dot) => {
        dot.geometry.dispose();
        if (dot.material instanceof THREE.Material) {
          dot.material.dispose();
        }
      });
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0, opacity: 0.5 }}
    />
  );
};

