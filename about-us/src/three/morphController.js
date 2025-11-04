/**
 * Morph Controller
 * Handles morphing animations for 3D objects
 * Supports both GLTF morph targets and custom shader-based morphing
 */

import * as THREE from 'three';

export class MorphController {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.mesh = null;
    this.morphTargets = [];
    this.currentState = 'idle';
    this.morphProgress = 0;
    this.isAnimating = false;
    
    // Create fallback geometry if no GLTF is loaded
    this.createFallbackMorph();
  }

  /**
   * Create a fallback morphing object using custom geometry
   * This works without GLTF files and uses shader-based morphing
   */
  createFallbackMorph() {
    // Create a torus knot that will morph
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    
    // Custom shader material for morphing
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uColor: { value: new THREE.Color(0x00ff88) },
        uIntensity: { value: 1.0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorphProgress;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Noise function for organic morphing
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0);
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          
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
          
          // Base position
          vec3 pos = position;
          
          // Idle animation (gentle morphing)
          float idleMorph = sin(uTime * 0.5) * 0.1;
          
          // Scroll-driven morph
          float scrollMorph = uMorphProgress;
          
          // Combine morphing effects
          float morphAmount = idleMorph + scrollMorph * 0.5;
          
          // Apply noise-based displacement
          vec3 noiseCoord = pos * 2.0 + uTime * 0.1;
          float noise = snoise(noiseCoord) * morphAmount;
          
          // Displacement along normal
          pos += normal * noise * 0.3;
          
          // Additional scaling based on morph progress
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
          // Rim lighting effect
          vec3 viewDirection = normalize(-vPosition);
          float rim = 1.0 - max(dot(viewDirection, normalize(vNormal)), 0.0);
          rim = pow(rim, 3.0);
          
          // Combine base color with rim light
          vec3 finalColor = uColor + rim * 0.5;
          
          gl_FragColor = vec4(finalColor * uIntensity, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);
  }

  /**
   * Load GLTF model with morph targets
   * @param {Object} gltf - Loaded GLTF object
   */
  loadGLTF(gltf) {
    // Remove fallback mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }

    // Find mesh with morph targets
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences) {
        this.mesh = child;
        this.morphTargets = child.morphTargetInfluences;
        
        // Set up material
        if (this.mesh.material) {
          this.mesh.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2
          });
        }
        
        this.scene.add(this.mesh);
        return;
      }
    });
  }

  /**
   * Set morph progress (0 to 1)
   * @param {number} progress - Progress value between 0 and 1
   */
  setProgress(progress) {
    this.morphProgress = Math.max(0, Math.min(1, progress));
    
    if (this.mesh) {
      // Update shader uniform if using custom shader
      if (this.mesh.material.uniforms) {
        this.mesh.material.uniforms.uMorphProgress.value = this.morphProgress;
      }
      
      // Update morph target influences if using GLTF
      if (this.mesh.morphTargetInfluences && this.mesh.morphTargetInfluences.length >= 3) {
        // Three morph targets: start, middle, end
        if (this.morphProgress < 0.5) {
          // Interpolate between start and middle
          const t = this.morphProgress * 2;
          this.mesh.morphTargetInfluences[0] = 1 - t;
          this.mesh.morphTargetInfluences[1] = t;
          this.mesh.morphTargetInfluences[2] = 0;
        } else {
          // Interpolate between middle and end
          const t = (this.morphProgress - 0.5) * 2;
          this.mesh.morphTargetInfluences[0] = 0;
          this.mesh.morphTargetInfluences[1] = 1 - t;
          this.mesh.morphTargetInfluences[2] = t;
        }
      }
    }
  }

  /**
   * Set morph state
   * @param {string} state - 'idle', 'intro', or 'about'
   */
  setState(state) {
    this.currentState = state;
    
    // State-based morphing can be extended here
    switch (state) {
      case 'idle':
        // Gentle idle animation
        break;
      case 'intro':
        this.setProgress(0);
        break;
      case 'about':
        this.setProgress(0.6);
        break;
    }
  }

  /**
   * Update animation (call in render loop)
   * @param {number} deltaTime - Time delta
   */
  update(deltaTime) {
    if (this.mesh && this.mesh.material && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.uTime.value += deltaTime;
      
      // Idle rotation
      if (this.currentState === 'idle') {
        this.mesh.rotation.y += deltaTime * 0.3;
        this.mesh.rotation.x += deltaTime * 0.1;
      }
    }
  }

  /**
   * Dispose of resources
   */
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

