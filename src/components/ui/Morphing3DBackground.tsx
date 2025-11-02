import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";

interface Morphing3DBackgroundProps {
  className?: string;
}

export const Morphing3DBackground: React.FC<Morphing3DBackgroundProps> = ({
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

    // Create geometric shapes
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

    const objects: THREE.Mesh[] = [];
    const objectScales: number[] = [];

    // Create 8 objects
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
      objectScales.push(scale);

      scene.add(mesh);
      objects.push(mesh);
    }

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

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Morphing effect - randomly morph objects
    let morphTimer = 0;
    const morphInterval = 3000; // Morph every 3 seconds

    const morphObjects = () => {
      objects.forEach((obj, i) => {
        const newGeometryIndex = Math.floor(Math.random() * geometries.length);
        const newGeometry = geometries[newGeometryIndex]();
        const originalScale = objectScales[i];

        // Animate scale down
        gsap.to(obj.scale, {
          x: 0.01,
          y: 0.01,
          z: 0.01,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            // Change geometry
            obj.geometry.dispose();
            obj.geometry = newGeometry;

            // Animate scale up
            gsap.to(obj.scale, {
              x: originalScale,
              y: originalScale,
              z: originalScale,
              duration: 0.6,
              ease: "elastic.out(1, 0.6)",
            });

            // Rotate to new position
            gsap.to(obj.rotation, {
              x: Math.random() * Math.PI * 2,
              y: Math.random() * Math.PI * 2,
              z: Math.random() * Math.PI * 2,
              duration: 0.8,
              ease: "power2.out",
            });
          },
        });
      });
    };

    // Animation loop
    let animationId: number;
    let lastMorphTime = Date.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Check if it's time to morph
      if (Date.now() - lastMorphTime > morphInterval) {
        lastMorphTime = Date.now();
        morphObjects();
      }

      // Animate objects
      objects.forEach((obj, i) => {
        obj.rotation.x += 0.01 + Math.sin(time + i) * 0.002;
        obj.rotation.y += 0.015 + Math.cos(time + i) * 0.002;
        obj.rotation.z += 0.008;

        const scaleVariation = Math.sin(time * 2 + i) * 0.15 + 1;
        const baseScale = objectScales[i];
        const currentScale = obj.scale.x;
        obj.scale.setScalar(currentScale * scaleVariation);

        // Floating motion
        obj.position.y += Math.sin(time + i) * 0.5;
        obj.position.x += Math.cos(time * 0.7 + i) * 0.3;

        // Mouse interaction
        obj.position.x += (mouseX * 5 - obj.position.x * 0.01) * 0.1;
        obj.position.y += (mouseY * 5 - obj.position.y * 0.01) * 0.1;

        // Opacity pulsing
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          obj.material.opacity = 0.4 + Math.sin(time * 2 + i) * 0.2;
        }
      });

      // Camera movement based on mouse
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
      objects.forEach((obj) => {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0, opacity: 0.4 }}
    />
  );
};

