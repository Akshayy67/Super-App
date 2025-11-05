/**
 * Main Application Entry Point
 * Initializes Three.js scene, GSAP ScrollTrigger, and handles interactions
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneManager } from './three/scene.js';
import { MorphController } from './three/morphController.js';
import { CameraController } from './three/controls.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Check for WebGL support
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class AboutUsApp {
  constructor() {
    this.sceneManager = null;
    this.morphController = null;
    this.cameraController = null;
    this.animationId = null;
    this.lastTime = 0;
    this.isPresentationMode = false;
    
    // Check WebGL support
    if (!checkWebGLSupport()) {
      console.warn('WebGL not supported. Falling back to CSS animations.');
      this.initFallback();
      return;
    }
    
    this.init();
  }

  init() {
    // Initialize Three.js
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
      console.error('Canvas container not found');
      return;
    }

    this.sceneManager = new SceneManager(canvasContainer);
    this.morphController = new MorphController(
      this.sceneManager.getScene(),
      this.sceneManager.getCamera()
    );
    this.cameraController = new CameraController(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer()
    );

    // Initialize animations
    this.initAnimations();
    
    // Initialize interactions
    this.initInteractions();
    
    // Start render loop
    this.animate();
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  initAnimations() {
    // Hero section animations
    this.animateHero();
    
    // Scroll-triggered animations
    this.setupScrollAnimations();
    
    // Morph progress based on scroll
    this.setupMorphScroll();
  }

  animateHero() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const scrollHint = document.querySelector('.scroll-hint');

    if (prefersReducedMotion) {
      // Instant reveal for reduced motion
      heroTitle?.querySelectorAll('.line').forEach(line => line.classList.add('visible'));
      heroSubtitle?.classList.add('visible');
      scrollHint?.classList.add('visible');
      return;
    }

    // Animate hero title lines
    if (heroTitle) {
      const lines = heroTitle.querySelectorAll('.line');
      gsap.fromTo(
        lines,
        {
          opacity: 0,
          y: 50,
          rotationX: -90
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }

    // Animate subtitle
    if (heroSubtitle) {
      gsap.fromTo(
        heroSubtitle,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 1
        }
      );
    }

    // Animate scroll hint
    if (scrollHint) {
      gsap.fromTo(
        scrollHint,
        {
          opacity: 0,
          y: -10
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 1.5
        }
      );
    }
  }

  setupScrollAnimations() {
    // Animate section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title) => {
      gsap.fromTo(
        title,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Animate section text
    const sectionTexts = document.querySelectorAll('.section-text');
    sectionTexts.forEach((text) => {
      gsap.fromTo(
        text,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: text,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Animate team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
      gsap.fromTo(
        member,
        {
          opacity: 0,
          y: 40,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: member,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Animate value items
    const valueItems = document.querySelectorAll('.value-item');
    valueItems.forEach((item, index) => {
      gsap.fromTo(
        item,
        {
          opacity: 0,
          x: -50
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Animate contact elements
    const contactLink = document.querySelector('.contact-link');
    const socialLinks = document.querySelectorAll('.social-link');
    
    if (contactLink) {
      gsap.fromTo(
        contactLink,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contactLink,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    socialLinks.forEach((link, index) => {
      gsap.fromTo(
        link,
        {
          opacity: 0,
          scale: 0.5
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: link,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  setupMorphScroll() {
    // Calculate total scroll height
    const heroSection = document.getElementById('hero');
    const contactSection = document.getElementById('contact');
    
    if (!heroSection || !contactSection) return;

    // Create scroll progress timeline
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: () => `+=${contactSection.offsetTop}`,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        if (this.morphController) {
          this.morphController.setProgress(progress);
        }
      }
    });

    // Section-based morph states
    const sections = ['hero', 'mission', 'team', 'values', 'contact'];
    
    sections.forEach((sectionId, index) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          if (this.morphController) {
            const normalizedProgress = index / (sections.length - 1);
            this.morphController.setProgress(normalizedProgress);
          }
        },
        onEnterBack: () => {
          if (this.morphController) {
            const normalizedProgress = index / (sections.length - 1);
            this.morphController.setProgress(normalizedProgress);
          }
        }
      });
    });
  }

  initInteractions() {
    // Keyboard navigation
    this.setupKeyboardNavigation();
    
    // Smooth scroll snap (optional)
    this.setupScrollSnap();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Toggle presentation mode with Space or Arrow keys
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.togglePresentationMode();
      }
      
      // Section navigation with arrow keys (when not in presentation mode)
      if (!this.isPresentationMode) {
        if (e.key === 'ArrowDown') {
          this.scrollToNextSection();
        } else if (e.key === 'ArrowUp') {
          this.scrollToPreviousSection();
        }
      }
    });
  }

  togglePresentationMode() {
    this.isPresentationMode = !this.isPresentationMode;
    document.body.classList.toggle('presentation-mode', this.isPresentationMode);
    
    if (this.cameraController) {
      this.cameraController.setPresentationMode(this.isPresentationMode);
    }
    
    // Announce to screen readers
    const announcement = document.querySelector('.keyboard-hint');
    if (announcement) {
      announcement.textContent = this.isPresentationMode 
        ? 'Presentation mode enabled' 
        : 'Presentation mode disabled';
    }
  }

  scrollToNextSection() {
    const sections = document.querySelectorAll('section[id]');
    const currentScroll = window.scrollY;
    
    for (const section of sections) {
      if (section.offsetTop > currentScroll + 100) {
        window.scrollTo({
          top: section.offsetTop,
          behavior: 'smooth'
        });
        break;
      }
    }
  }

  scrollToPreviousSection() {
    const sections = Array.from(document.querySelectorAll('section[id]')).reverse();
    const currentScroll = window.scrollY;
    
    for (const section of sections) {
      if (section.offsetTop < currentScroll - 100) {
        window.scrollTo({
          top: section.offsetTop,
          behavior: 'smooth'
        });
        break;
      }
    }
  }

  setupScrollSnap() {
    // Optional: Add scroll snapping for major sections
    if (!prefersReducedMotion) {
      document.documentElement.style.scrollSnapType = 'y proximity';
      document.querySelectorAll('section').forEach(section => {
        section.style.scrollSnapAlign = 'start';
      });
    }
  }

  animate(currentTime = 0) {
    this.animationId = requestAnimationFrame((time) => this.animate(time));
    
    const deltaTime = prefersReducedMotion ? 0 : (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    if (deltaTime > 0) {
      // Update morph controller
      if (this.morphController) {
        this.morphController.update(deltaTime);
      }
      
      // Update camera controller
      if (this.cameraController) {
        this.cameraController.update(deltaTime);
      }
    }
    
    // Render scene
    if (this.sceneManager) {
      this.sceneManager.render();
    }
  }

  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.animationId) {
      this.lastTime = performance.now();
      this.animate();
    }
  }

  initFallback() {
    // Fallback CSS animations if WebGL is not available
    console.log('Using CSS fallback animations');
    document.body.classList.add('fallback-mode');
    
    // Still enable GSAP animations
    this.initAnimations();
  }

  dispose() {
    this.pause();
    
    if (this.morphController) {
      this.morphController.dispose();
    }
    
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }
    
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new AboutUsApp();
  });
} else {
  window.app = new AboutUsApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.dispose();
  }
});




