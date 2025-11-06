/**
 * About Us Page Component
 * Three.js morphing experience integrated into React app
 */

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { useTheme } from '../utils/themeManager';
import '../../about-us/styles.css';

// Scene Manager
class SceneManager {
  constructor(container: HTMLDivElement) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setClearColor(0x000000, 0); // Clear with transparent black
    
    // Ensure canvas is visible
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0x0ea5e9, 0.2);
    rimLight.position.set(-5, -5, -5);
    this.scene.add(rimLight);

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.scene?.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }

  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }
}

// Morph Controller
class MorphController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private mesh: THREE.Mesh | null = null;
  private morphProgress = 0;
  private currentState = 'idle';

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.createFallbackMorph();
  }

  createFallbackMorph() {
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uColor: { value: new THREE.Color(0x0ea5e9) },
        uIntensity: { value: 0.6 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorphProgress;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vec3 pos = position;
          float idleMorph = sin(uTime * 0.5) * 0.1;
          float scrollMorph = uMorphProgress;
          float morphAmount = idleMorph + scrollMorph * 0.5;
          vec3 noiseCoord = pos * 2.0 + uTime * 0.1;
          float noise = snoise(noiseCoord) * morphAmount;
          pos += normal * noise * 0.3;
          float scale = 1.0 + scrollMorph * 0.2;
          pos *= scale;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vec3 viewDirection = normalize(-vPosition);
          float rim = 1.0 - max(dot(viewDirection, normalize(vNormal)), 0.0);
          rim = pow(rim, 3.0);
          vec3 finalColor = uColor + rim * 0.5;
          gl_FragColor = vec4(finalColor * uIntensity, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);
  }

  setProgress(progress: number) {
    this.morphProgress = Math.max(0, Math.min(1, progress));
    if (this.mesh && (this.mesh.material as THREE.ShaderMaterial).uniforms) {
      (this.mesh.material as THREE.ShaderMaterial).uniforms.uMorphProgress.value = this.morphProgress;
    }
  }

  update(deltaTime: number) {
    if (this.mesh && (this.mesh.material as THREE.ShaderMaterial).uniforms) {
      (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value += deltaTime;
      if (this.currentState === 'idle') {
        this.mesh.rotation.y += deltaTime * 0.3;
        this.mesh.rotation.x += deltaTime * 0.1;
      }
    }
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(mat => mat.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
  }
}

// Camera Controller
class CameraController {
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isPresentationMode = false;
  private mouse = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 };
  private currentRotation = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.init();
  }

  init() {
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (this.isPresentationMode) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.targetRotation.x = this.mouse.y * 0.1;
        this.targetRotation.y = this.mouse.x * 0.1;
      }
    });
    this.renderer.domElement.addEventListener('mouseleave', () => {
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    });
  }

  update(deltaTime: number) {
    const lerpFactor = 0.05;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;
    if (this.isPresentationMode) {
      this.camera.rotation.x = this.currentRotation.x;
      this.camera.rotation.y = this.currentRotation.y;
    } else {
      this.camera.rotation.x = 0;
      this.camera.rotation.y = 0;
    }
  }

  setPresentationMode(enabled: boolean) {
    this.isPresentationMode = enabled;
    this.camera.position.z = enabled ? 4 : 5;
    if (!enabled) {
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    }
  }
}

// Check WebGL support
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

export const AboutUsPage: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const morphControllerRef = useRef<MorphController | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Update colors when theme changes
  useEffect(() => {
    // Force re-render when theme changes
  }, [resolvedTheme]);

  useEffect(() => {
    // Force enable scrolling on the page - run first
    const timer = setTimeout(() => {
      const aboutPage = document.querySelector('.about-us-page') as HTMLElement;
      const mainContentArea = document.querySelector('.flex-1.overflow-auto') as HTMLElement;
      const parentContainer = document.querySelector('.flex-1.flex.flex-col.min-h-0.relative.overflow-hidden') as HTMLElement;
      
      if (aboutPage) {
        aboutPage.style.position = 'relative';
        aboutPage.style.width = '100%';
        aboutPage.style.zIndex = '1';
      }
      
      if (mainContentArea) {
        mainContentArea.style.overflowY = 'auto';
        mainContentArea.style.height = 'auto';
      }
      
      if (parentContainer) {
        parentContainer.style.overflowY = 'auto';
        parentContainer.style.height = 'auto';
      }
      
      // Force all sections to be visible
      const sections = document.querySelectorAll('.content-section');
      sections.forEach((section) => {
        (section as HTMLElement).style.opacity = '1';
        (section as HTMLElement).style.visibility = 'visible';
        (section as HTMLElement).style.display = 'flex';
      });
      
      const titles = document.querySelectorAll('.section-title');
      titles.forEach((title) => {
        (title as HTMLElement).style.opacity = '1';
        (title as HTMLElement).style.visibility = 'visible';
      });
      
      const texts = document.querySelectorAll('.section-text');
      texts.forEach((text) => {
        (text as HTMLElement).style.opacity = '1';
        (text as HTMLElement).style.visibility = 'visible';
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Check WebGL support
    if (!checkWebGLSupport()) {
      console.warn('WebGL not supported. Falling back to CSS animations.');
      return;
    }

    // Initialize Three.js
    gsap.registerPlugin(ScrollTrigger);

    const sceneManager = new SceneManager(canvasRef.current);
    const morphController = new MorphController(
      sceneManager.getScene()!,
      sceneManager.getCamera()!
    );
    const cameraController = new CameraController(
      sceneManager.getCamera()!,
      sceneManager.getRenderer()!
    );

    sceneManagerRef.current = sceneManager;
    morphControllerRef.current = morphController;
    cameraControllerRef.current = cameraController;

    // Setup animations
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const scrollHint = document.querySelector('.scroll-hint');

    if (!prefersReducedMotion) {
      if (heroTitle) {
        const lines = heroTitle.querySelectorAll('.line');
        gsap.fromTo(lines, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3 });
      }
      if (heroSubtitle) {
        gsap.fromTo(heroSubtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1 });
      }
      if (scrollHint) {
        gsap.fromTo(scrollHint, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.5 });
      }
    } else {
      heroTitle?.querySelectorAll('.line').forEach(line => line.classList.add('visible'));
      heroSubtitle?.classList.add('visible');
      scrollHint?.classList.add('visible');
    }

    // Scroll animations - but ensure content is visible first
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title) => {
      // Set initial visible state
      (title as HTMLElement).style.opacity = '1';
      (title as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(title, { opacity: 1, y: 0 }, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: title, start: 'top 80%', end: 'top 50%', toggleActions: 'play none none reverse' }
        });
      }
    });

    const sectionTexts = document.querySelectorAll('.section-text');
    sectionTexts.forEach((text) => {
      // Set initial visible state
      (text as HTMLElement).style.opacity = '1';
      (text as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(text, { opacity: 1, y: 0 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    });

    // Animate team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
      (member as HTMLElement).style.opacity = '1';
      (member as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(member, { opacity: 1, y: 0, scale: 1 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out', delay: index * 0.1,
          scrollTrigger: { trigger: member, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    });

    // Animate value items
    const valueItems = document.querySelectorAll('.value-item');
    valueItems.forEach((item, index) => {
      (item as HTMLElement).style.opacity = '1';
      (item as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(item, { opacity: 1, x: 0 }, {
          opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: index * 0.1,
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    });

    // Animate contact elements
    const contactLink = document.querySelector('.contact-link');
    const socialLinks = document.querySelectorAll('.social-link');
    
    if (contactLink) {
      (contactLink as HTMLElement).style.opacity = '1';
      (contactLink as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(contactLink, { opacity: 1, y: 0 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: contactLink, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    }

    socialLinks.forEach((link, index) => {
      (link as HTMLElement).style.opacity = '1';
      (link as HTMLElement).style.visibility = 'visible';
      
      if (!prefersReducedMotion) {
        gsap.fromTo(link, { opacity: 1, scale: 1 }, {
          opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: index * 0.1,
          scrollTrigger: { trigger: link, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    });

    // Morph scroll
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: () => `+=${contactSection.offsetTop}`,
        scrub: 1,
        onUpdate: (self) => {
          if (morphControllerRef.current) {
            morphControllerRef.current.setProgress(self.progress);
          }
        }
      });
    }

    // Render loop
    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      const deltaTime = prefersReducedMotion ? 0 : (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (deltaTime > 0) {
        morphControllerRef.current?.update(deltaTime);
        cameraControllerRef.current?.update(deltaTime);
      }
      sceneManagerRef.current?.render();
    };
    animate(performance.now());

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsPresentationMode(prev => {
          const newValue = !prev;
          document.body.classList.toggle('presentation-mode', newValue);
          cameraControllerRef.current?.setPresentationMode(newValue);
          return newValue;
        });
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      morphControllerRef.current?.dispose();
      sceneManagerRef.current?.dispose();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const backgroundColor = isDarkMode ? '#000000' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const mutedTextColor = isDarkMode ? '#888888' : '#666666';

  return (
    <div className="about-us-page" style={{ 
      position: 'relative' as const, 
      width: '100%', 
      minHeight: '100vh',
      background: backgroundColor, 
      backgroundColor: backgroundColor,
      color: textColor,
      zIndex: 1
    }}>
      <div ref={canvasRef} id="canvas-container" className="canvas-container" aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, pointerEvents: 'none', background: 'transparent', backgroundColor: 'transparent' }} />
      
      <main id="main-content" style={{ position: 'relative', zIndex: 2, width: '100%', background: 'transparent', backgroundColor: 'transparent' }}>
        <section id="hero" className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div className="hero-content" style={{ maxWidth: '1400px', width: '100%', textAlign: 'left' }}>
            <h1 className="hero-title" data-split-text style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(3rem, 12vw, 12rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '2rem', color: textColor, opacity: 1 }}>
              <span className="line" style={{ display: 'block', opacity: 1, color: textColor }}>THE WORLD'S</span>
              <span className="line" style={{ display: 'block', opacity: 1, color: textColor }}>FIRST</span>
              <span className="line accent" style={{ display: 'block', opacity: 1, color: textColor }}>AI-POWERED</span>
              <span className="line accent" style={{ display: 'block', opacity: 1, color: '#0ea5e9' }}>ACADEMIC</span>
              <span className="line" style={{ display: 'block', opacity: 1, color: '#0ea5e9' }}>ECOSYSTEM</span>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4rem', opacity: 1, color: textColor, fontWeight: 700 }}>WHERE 15 APPS BECOME ONE</p>
            <div className="scroll-hint" aria-label="Scroll to continue" style={{ position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', color: mutedTextColor, opacity: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </section>

        <section id="mission" className="content-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div className="section-content" style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title" data-split-text style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '2rem', color: textColor, opacity: 1, visibility: 'visible' }}>OUR MISSION</h2>
            <p className="section-text" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', lineHeight: 1.8, color: textColor, maxWidth: '800px', opacity: 1, visibility: 'visible', fontWeight: 500 }}>
              We're <span style={{ color: '#0ea5e9' }}>revolutionizing student productivity</span> by unifying <span style={{ color: '#0ea5e9' }}>15 fragmented apps</span> into <span style={{ color: '#0ea5e9' }}>ONE powerful platform</span>. 
              We're not just building software—we're <span style={{ color: '#0ea5e9' }}>eliminating the 2.5 hours</span> students waste daily switching between tools. 
              We're <span style={{ color: '#0ea5e9' }}>transforming chaos into clarity</span>. We're giving students back <span style={{ color: '#0ea5e9' }}>49 days per year</span>. 
              We're building the <span style={{ color: '#0ea5e9' }}>future of learning</span>—where <span style={{ color: '#0ea5e9' }}>dreams become action plans</span>, <span style={{ color: '#0ea5e9' }}>meetings become searchable knowledge</span>, 
              and <span style={{ color: '#0ea5e9' }}>AI empowers every student</span> to achieve more.
            </p>
          </div>
        </section>

        <section id="team" className="content-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div className="section-content" style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title" data-split-text style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '2rem', color: textColor, opacity: 1, visibility: 'visible' }}>WHAT WE BUILT</h2>
            <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '4rem' }}>
              <div className="team-member" style={{ color: textColor }}>
                <h3 className="member-name" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: textColor }}>15 APPS → 1</h3>
                <p className="member-role" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}><span style={{ color: '#0ea5e9' }}>Zoom, VS Code, Notion, Figma, Anki, ChatGPT</span>—all unified. <span style={{ color: '#0ea5e9' }}>Zero context switching.</span> <span style={{ color: '#0ea5e9' }}>500% productivity boost.</span></p>
              </div>
              <div className="team-member" style={{ color: textColor }}>
                <h3 className="member-name" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: textColor }}>49 DAYS SAVED</h3>
                <p className="member-role" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}>Per student, per year. That's <span style={{ color: '#0ea5e9' }}>2.5 hours daily</span> <span style={{ color: '#0ea5e9' }}>returned to learning</span>. <span style={{ color: '#0ea5e9' }}>Real impact. Real results.</span></p>
              </div>
              <div className="team-member" style={{ color: textColor }}>
                <h3 className="member-name" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: textColor }}>AI-POWERED</h3>
                <p className="member-role" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}><span style={{ color: '#0ea5e9' }}>Dream-to-Plan AI</span>. <span style={{ color: '#0ea5e9' }}>Interview Analytics</span>. <span style={{ color: '#0ea5e9' }}>AI Scribe</span>. <span style={{ color: '#0ea5e9' }}>Spaced Repetition</span>. <span style={{ color: '#0ea5e9' }}>Everything intelligent, everything free.</span></p>
              </div>
              <div className="team-member" style={{ color: textColor }}>
                <h3 className="member-name" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: textColor }}>REAL-TIME</h3>
                <p className="member-role" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}><span style={{ color: '#0ea5e9' }}>Video calls</span>. <span style={{ color: '#0ea5e9' }}>Pair programming</span>. <span style={{ color: '#0ea5e9' }}>Collaborative drawing</span>. <span style={{ color: '#0ea5e9' }}>Everything synchronized</span>. <span style={{ color: '#0ea5e9' }}>Everything instant</span>.</p>
              </div>
              <div className="team-member" style={{ color: textColor }}>
                <h3 className="member-name" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: textColor }}>95+ SCORE</h3>
                <p className="member-role" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}><span style={{ color: '#0ea5e9' }}>Lighthouse performance</span>. <span style={{ color: '#0ea5e9' }}>Blazing fast</span>. <span style={{ color: '#0ea5e9' }}>Optimized</span>. <span style={{ color: '#0ea5e9' }}>Built for scale</span>. Built for <span style={{ color: '#0ea5e9' }}>students who demand excellence</span>.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="values" className="content-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div className="section-content" style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title" data-split-text style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '2rem', color: textColor, opacity: 1, visibility: 'visible' }}>THE REVOLUTION</h2>
            <div className="values-list" style={{ marginTop: '4rem' }}>
              <div className="value-item" style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', color: textColor }}>
                <span className="value-number" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, color: textColor, minWidth: '80px' }}>01</span>
                <div className="value-content">
                  <h3 className="value-title" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>DREAM TO PLAN AI</h3>
                  <p className="value-description" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}>Write in your journal: <span style={{ color: '#0ea5e9' }}>"Build an e-commerce site by December."</span> Our AI <span style={{ color: '#0ea5e9' }}>INSTANTLY detects intent</span>, <span style={{ color: '#0ea5e9' }}>extracts dates</span>, <span style={{ color: '#0ea5e9' }}>creates todos</span>, <span style={{ color: '#0ea5e9' }}>suggests teams</span>, <span style={{ color: '#0ea5e9' }}>schedules meetings</span>. Your <span style={{ color: '#0ea5e9' }}>journal becomes your action plan</span>. <span style={{ color: '#0ea5e9', fontWeight: 700 }}>No one else does this. Only we do.</span></p>
                </div>
              </div>
              <div className="value-item" style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', color: textColor }}>
                <span className="value-number" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, color: textColor, minWidth: '80px' }}>02</span>
                <div className="value-content">
                  <h3 className="value-title" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>INTERVIEW ANALYTICS</h3>
                  <p className="value-description" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}>Every interview analyzed on <span style={{ color: '#0ea5e9' }}>5 factors</span>: <span style={{ color: '#0ea5e9' }}>confidence, clarity, professionalism, engagement, adaptability</span>. <span style={{ color: '#0ea5e9' }}>Face detection tracks progress</span>. <span style={{ color: '#0ea5e9' }}>Compare sessions</span>. <span style={{ color: '#0ea5e9' }}>Watch improvement graphs</span>. <span style={{ color: '#0ea5e9', fontWeight: 700 }}>₹41,000+ value. FREE.</span></p>
                </div>
              </div>
              <div className="value-item" style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', color: textColor }}>
                <span className="value-number" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, color: textColor, minWidth: '80px' }}>03</span>
                <div className="value-content">
                  <h3 className="value-title" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>AI SCRIBE</h3>
                  <p className="value-description" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}>Every meeting <span style={{ color: '#0ea5e9' }}>auto-transcribed in real-time</span>, <span style={{ color: '#0ea5e9' }}>AI-summarized</span>, <span style={{ color: '#0ea5e9' }}>action items extracted</span>, <span style={{ color: '#0ea5e9' }}>saved forever</span>, <span style={{ color: '#0ea5e9' }}>searchable in seconds</span>. Zoom saves nothing. <span style={{ color: '#0ea5e9', fontWeight: 700 }}>We save EVERYTHING. 120 hours per year saved.</span></p>
                </div>
              </div>
              <div className="value-item" style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', color: textColor }}>
                <span className="value-number" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, color: textColor, minWidth: '80px' }}>04</span>
                <div className="value-content">
                  <h3 className="value-title" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>SMART LEARNING</h3>
                  <p className="value-description" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, lineHeight: 1.6, fontWeight: 500 }}><span style={{ color: '#0ea5e9' }}>AI-powered spaced repetition flashcards</span> based on <span style={{ color: '#0ea5e9' }}>Ebbinghaus's Forgetting Curve</span>. Our AI <span style={{ color: '#0ea5e9' }}>predicts when you'll forget</span> and <span style={{ color: '#0ea5e9' }}>reminds you at the optimal time</span>. <span style={{ color: '#0ea5e9', fontWeight: 700 }}>Science-backed memory optimization. Remember for life.</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="content-section contact-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div className="section-content" style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title" data-split-text style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '2rem', color: textColor, opacity: 1, visibility: 'visible' }}>THE FUTURE BEGINS NOW</h2>
            <p className="section-text" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', lineHeight: 1.8, color: textColor, maxWidth: '800px', marginBottom: '3rem', opacity: 1, visibility: 'visible', fontWeight: 500 }}>
              Stop <span style={{ color: '#0ea5e9' }}>drowning in 15 apps</span>. Start <span style={{ color: '#0ea5e9' }}>soaring with one</span>. Join <span style={{ color: '#0ea5e9' }}>thousands of students</span> saving <span style={{ color: '#0ea5e9' }}>49 days per year</span>. 
              <span style={{ color: '#0ea5e9' }}>Transform chaos into clarity</span>. <span style={{ color: '#0ea5e9', fontWeight: 700 }}>Begin your journey—completely free.</span>
            </p>
            <div className="contact-info" style={{ marginTop: '4rem' }}>
              <p style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', color: textColor, marginBottom: '2rem', fontWeight: 800 }}>
                Ready to revolutionize your productivity?
              </p>
              <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, marginBottom: '1rem', fontWeight: 600 }}>
                  Contact us:
                </p>
                <a href="mailto:support@super-app.tech" style={{ display: 'block', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, textDecoration: 'none', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <span style={{ color: '#0ea5e9' }}>support@super-app.tech</span>
                </a>
                <a href="tel:+917382005522" style={{ display: 'block', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: textColor, textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
                  <span style={{ color: '#0ea5e9' }}>+91 7382005522</span>
                </a>
              </div>
              <div className="social-links" role="navigation" aria-label="Social media links" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer" style={{ padding: '4rem 2rem', textAlign: 'center', color: mutedTextColor, fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', position: 'relative', zIndex: 2, background: 'transparent', backgroundColor: 'transparent' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Policy Links */}
            <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
              <a 
                href="/policies/privacy-policy.html" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: textColor, textDecoration: 'none', borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`, paddingBottom: '0.25rem', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'; e.currentTarget.style.color = textColor; }}
              >
                Privacy Policy
              </a>
              <a 
                href="/policies/terms-and-conditions.html" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: textColor, textDecoration: 'none', borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`, paddingBottom: '0.25rem', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'; e.currentTarget.style.color = textColor; }}
              >
                Terms and Conditions
              </a>
              <a 
                href="/policies/cancellation-refund.html" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: textColor, textDecoration: 'none', borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`, paddingBottom: '0.25rem', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'; e.currentTarget.style.color = textColor; }}
              >
                Refund & Cancellation Policy
              </a>
              <a 
                href="/policies/contact-us.html" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: textColor, textDecoration: 'none', borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`, paddingBottom: '0.25rem', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'; e.currentTarget.style.color = textColor; }}
              >
                Contact Us
              </a>
            </div>

            {/* Contact Information */}
            <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
              <div>
                <span style={{ color: mutedTextColor, marginRight: '0.5rem' }}>Email:</span>
                <a 
                  href="mailto:support@super-app.tech" 
                  style={{ color: '#0ea5e9', textDecoration: 'none', transition: 'opacity 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  support@super-app.tech
                </a>
              </div>
              <div>
                <span style={{ color: mutedTextColor, marginRight: '0.5rem' }}>Phone:</span>
                <a 
                  href="tel:+917382005522" 
                  style={{ color: '#0ea5e9', textDecoration: 'none', transition: 'opacity 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  +91 7382005522
                </a>
              </div>
            </div>

            {/* Copyright */}
            <p style={{ marginBottom: '1rem' }}>&copy; 2025 Super Study App. All rights reserved.</p>
            
            {/* Keyboard Hint */}
            <p className="footer-hint" style={{ marginTop: '1rem', fontSize: '0.875em', opacity: 0.7 }}>Press <kbd style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', padding: '0.25em 0.5em', borderRadius: '4px', fontFamily: 'monospace' }}>↑</kbd>/<kbd style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', padding: '0.25em 0.5em', borderRadius: '4px', fontFamily: 'monospace' }}>↓</kbd> or <kbd style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', padding: '0.25em 0.5em', borderRadius: '4px', fontFamily: 'monospace' }}>Space</kbd> to toggle presentation mode</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

