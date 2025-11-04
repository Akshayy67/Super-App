import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Mail, Shield } from 'lucide-react';

export const BlockedUsersPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const mouseDownRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, targetRotationX: 0, targetRotationY: 0, rotationX: 0, rotationY: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Premium scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    // Render to half width for left side only
    const canvasWidth = window.innerWidth / 2;
    const canvasHeight = window.innerHeight;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Update camera aspect ratio for left half
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    // Removed particles/flakes as requested

    // Premium WebGL Globe - realistic sphere with elevation data
    const globeRadius = 9;
    const globeSegments = 128; // High resolution for realism
    const globeGeometry = new THREE.SphereGeometry(globeRadius, globeSegments, globeSegments);
    
    // Create realistic globe material with elevation-style coloring
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: `
        precision highp float;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normal);
          vUv = uv;
          
          // Subtle morphing effect - elevation-like displacement
          vec3 pos = position;
          float wave = sin(time * 0.3 + length(position) * 0.5) * 0.15;
          pos += normalize(position) * wave;
          
          // Additional subtle noise for realism
          float noise = sin(pos.x * 2.0 + time * 0.5) * sin(pos.y * 2.0 + time * 0.5) * sin(pos.z * 2.0 + time * 0.5) * 0.05;
          pos += normalize(position) * noise;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision highp float;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform float time;
        uniform vec2 mouse;
        
        void main() {
          // Calculate elevation-like effect based on position and UV coordinates
          float elevation = (vNormal.y + 1.0) * 0.5;
          
          // White globe coloring
          vec3 darkWhite = vec3(0.3, 0.3, 0.3);
          vec3 mediumWhite = vec3(0.6, 0.6, 0.6);
          vec3 brightWhite = vec3(0.9, 0.9, 0.9);
          
          // Mix colors based on elevation
          vec3 baseColor = mix(darkWhite, mediumWhite, elevation);
          baseColor = mix(baseColor, brightWhite, elevation * elevation);
          
          // Add subtle UV-based pattern for realism
          float pattern = sin(vUv.x * 20.0) * sin(vUv.y * 20.0) * 0.02;
          baseColor += vec3(pattern);
          
          // Calculate lighting based on normal
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float light = max(dot(vNormal, lightDir), 0.3);
          baseColor *= light;
          
          // Add subtle glow on edges
          float edgeGlow = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          baseColor += vec3(edgeGlow * 0.1);
          
          // Wireframe effect - subtle lines
          vec3 fdx = dFdx(vPosition);
          vec3 fdy = dFdy(vPosition);
          vec3 normal = normalize(cross(fdx, fdy));
          float wireframe = abs(dot(vNormal, normal));
          wireframe = smoothstep(0.98, 1.0, wireframe);
          
          vec3 finalColor = mix(baseColor * 1.3, baseColor, wireframe);
          
          gl_FragColor = vec4(finalColor, 0.25);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    // Add wireframe overlay for premium WebGL Globe look - white
    const wireframeGeometry = new THREE.SphereGeometry(globeRadius + 0.02, 64, 64);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeMesh);

    // Add inner glow sphere - white
    const innerGlowGeometry = new THREE.SphereGeometry(globeRadius - 0.5, 32, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    scene.add(innerGlowMesh);

    // Ambient lighting for globe
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(15, 15, 15);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight2.position.set(-15, -15, -15);
    scene.add(pointLight2);

    camera.position.z = 25;

    // Mouse interaction for globe rotation - only on canvas area
    const handleMouseDown = (event: MouseEvent) => {
      // Only handle if clicking on the left side (globe area)
      if (event.clientX <= window.innerWidth / 2 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right) {
          mouseDownRef.current = true;
          mouseRef.current.x = event.clientX;
          mouseRef.current.y = event.clientY;
          event.preventDefault();
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseRef.current && mouseDownRef.current) {
        const deltaX = event.clientX - mouseRef.current.x;
        const deltaY = event.clientY - mouseRef.current.y;
        
        mouseRef.current.targetRotationY += deltaX * 0.01;
        mouseRef.current.targetRotationX += deltaY * 0.01;
        
        mouseRef.current.x = event.clientX;
        mouseRef.current.y = event.clientY;
        event.preventDefault();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (mouseDownRef.current) {
        mouseDownRef.current = false;
        event.preventDefault();
      }
    };

    const handleMouseWheel = (event: WheelEvent) => {
      // Only handle wheel if on left side (globe area)
      if (event.clientX <= window.innerWidth / 2 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right) {
          event.preventDefault();
          camera.position.z += event.deltaY * 0.05;
          camera.position.z = Math.max(15, Math.min(40, camera.position.z));
        }
      }
    };

    // Add event listeners directly to canvas
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth animation loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = Date.now() * 0.001;

      // Update globe material time
      globeMaterial.uniforms.time.value = currentTime;

      // Particles removed

      // Smooth interpolation for globe rotation (like WebGL Globe)
      mouseRef.current.rotationY += (mouseRef.current.targetRotationY - mouseRef.current.rotationY) * 0.1;
      mouseRef.current.rotationX += (mouseRef.current.targetRotationX - mouseRef.current.rotationX) * 0.1;
      
      // Apply rotations to globe
      globeMesh.rotation.y = mouseRef.current.rotationY;
      globeMesh.rotation.x = mouseRef.current.rotationX;
      wireframeMesh.rotation.y = mouseRef.current.rotationY;
      wireframeMesh.rotation.x = mouseRef.current.rotationX;
      innerGlowMesh.rotation.y = mouseRef.current.rotationY;
      innerGlowMesh.rotation.x = mouseRef.current.rotationX;

      // Auto-rotate if not interacting
      if (!mouseDownRef.current) {
        mouseRef.current.targetRotationY += 0.003;
      }

      // Subtle camera movement
      camera.position.x = Math.sin(currentTime * 0.1) * 1;
      camera.position.y = Math.cos(currentTime * 0.08) * 1;
      camera.lookAt(0, 0, 0);

      // Animate lights
      pointLight.position.x = Math.sin(currentTime * 0.3) * 15;
      pointLight.position.y = Math.cos(currentTime * 0.3) * 15;
      pointLight2.position.x = Math.cos(currentTime * 0.25) * -15;
      pointLight2.position.y = Math.sin(currentTime * 0.25) * -15;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Handle resize
    const handleResize = () => {
      const canvasWidth = window.innerWidth / 2;
      const canvasHeight = window.innerHeight;
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
    };

    window.addEventListener('resize', handleResize);

    // Smooth GSAP animations - ensure elements stay visible
    gsap.set('.blocked-text', { opacity: 1, visibility: 'visible' });
    gsap.set('.contact-message', { opacity: 1, visibility: 'visible' });
    gsap.set('.contact-button', { opacity: 1, visibility: 'visible' });

    gsap.fromTo('.blocked-text', 
      { opacity: 0, y: 30, visibility: 'hidden' },
      { 
        opacity: 1, 
        y: 0, 
        visibility: 'visible',
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.3,
      }
    );

    gsap.fromTo('.contact-message',
      { opacity: 0, y: 20, visibility: 'hidden' },
      {
        opacity: 1,
        y: 0,
        visibility: 'visible',
        duration: 1,
        ease: 'power2.out',
        delay: 0.8,
      }
    );

    gsap.fromTo('.contact-button',
      { opacity: 0, scale: 0.9, visibility: 'hidden' },
      {
        opacity: 1,
        scale: 1,
        visibility: 'visible',
        duration: 0.8,
        ease: 'back.out(1.2)',
        delay: 1.2,
      }
    );

    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('wheel', handleMouseWheel);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      globeMaterial.dispose();
      globeGeometry.dispose();
      wireframeMaterial.dispose();
      wireframeGeometry.dispose();
      innerGlowMaterial.dispose();
      innerGlowGeometry.dispose();
    };
  }, []); // Remove mouseDown dependency to prevent re-initialization

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-black flex flex-row"
    >
      {/* Three.js Canvas - Interactive Globe on left side */}
      <div 
        className="relative w-1/2 h-full overflow-hidden" 
        style={{ zIndex: 1, position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ 
            opacity: isLoaded ? 1 : 0, 
            transition: 'opacity 1s ease-in',
            width: '100%',
            height: '100%',
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'auto',
            touchAction: 'none'
          }}
        />
        {/* Hint text for globe */}
        <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 text-sm font-light pointer-events-none" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)', zIndex: 10 }}>
          Drag to rotate • Scroll to zoom
        </p>
      </div>

      {/* Right Side - Blocked Message */}
      <div 
        className="relative w-1/2 h-full flex flex-col items-center justify-center px-8 md:px-16" 
        style={{ 
          pointerEvents: 'auto',
          zIndex: 100,
          backgroundColor: '#000000',
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BLOCKED Text - Big Red and Visible */}
        <h1 
          className="blocked-text text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter leading-none mb-8 text-center"
          style={{ 
            color: '#dc2626',
            textShadow: '0 0 30px rgba(255, 0, 0, 0.5), 0 0 60px rgba(255, 0, 0, 0.3)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            position: 'relative',
            zIndex: 100,
            display: 'block',
            opacity: 1,
            visibility: 'visible',
            willChange: 'auto'
          }}
        >
          BLOCKED
        </h1>

        {/* Contact Message - Visible and clear */}
        <div 
          className="contact-message text-center max-w-xl w-full" 
          style={{ 
            position: 'relative', 
            zIndex: 100, 
            opacity: 1,
            visibility: 'visible',
            willChange: 'auto'
          }}
        >
          <p 
            className="text-lg md:text-xl lg:text-2xl mb-8 font-medium" 
            style={{ 
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              display: 'block',
              opacity: 1,
              visibility: 'visible'
            }}
          >
            Contact support if you believe this was done by mistake
          </p>

          <a
            href="mailto:akshayjuluri6704@gmail.com?subject=Account Blocked - Appeal Request&body=Hello, I believe my account has been blocked by mistake. Please review my account status. Thank you."
            className="contact-button inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 border-2 backdrop-blur-md"
            style={{ 
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              display: 'inline-flex',
              opacity: 1,
              visibility: 'visible'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

