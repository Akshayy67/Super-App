/**
 * GLTF Loader Helper
 * Optional utility for loading GLTF models with morph targets
 * 
 * Usage:
 * import { loadGLTFModel } from './loadGLTF.js';
 * loadGLTFModel('/assets/models/your-model.gltf', (gltf) => {
 *   morphController.loadGLTF(gltf);
 * });
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Load a GLTF model with optional Draco compression support
 * @param {string} url - Path to GLTF/GLB file
 * @param {Function} onLoad - Callback when model loads
 * @param {Function} onProgress - Optional progress callback
 * @param {Function} onError - Optional error callback
 */
export function loadGLTFModel(url, onLoad, onProgress, onError) {
  const loader = new GLTFLoader();
  
  // Optional: Setup Draco loader for compressed models
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);
  
  loader.load(
    url,
    (gltf) => {
      console.log('GLTF loaded:', gltf);
      onLoad(gltf);
    },
    (progress) => {
      if (onProgress) {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading: ${percent.toFixed(0)}%`);
        onProgress(progress);
      }
    },
    (error) => {
      console.error('Error loading GLTF:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Check if a GLTF model has morph targets
 * @param {Object} gltf - Loaded GLTF object
 * @returns {boolean}
 */
export function hasMorphTargets(gltf) {
  let hasMorphs = false;
  
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.morphTargetInfluences) {
      if (child.morphTargetInfluences.length > 0) {
        hasMorphs = true;
      }
    }
  });
  
  return hasMorphs;
}

/**
 * Get morph target names from a GLTF model
 * @param {Object} gltf - Loaded GLTF object
 * @returns {Array<string>} Array of morph target names
 */
export function getMorphTargetNames(gltf) {
  const names = [];
  
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.morphTargetDictionary) {
      Object.keys(child.morphTargetDictionary).forEach(name => {
        if (!names.includes(name)) {
          names.push(name);
        }
      });
    }
  });
  
  return names;
}







