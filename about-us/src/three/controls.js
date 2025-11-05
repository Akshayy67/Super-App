/**
 * Camera Controls
 * Handles camera movement and interaction
 */

export class CameraController {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.isPresentationMode = false;
    
    // Mouse/touch interaction
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    // Mouse move for subtle camera tilt
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (this.isPresentationMode) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        this.targetRotation.x = this.mouse.y * 0.1;
        this.targetRotation.y = this.mouse.x * 0.1;
      }
    });

    // Reset on mouse leave
    this.renderer.domElement.addEventListener('mouseleave', () => {
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    });
  }

  update(deltaTime) {
    // Smooth camera rotation based on cursor
    const lerpFactor = 0.05;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;
    
    if (this.isPresentationMode) {
      this.camera.rotation.x = this.currentRotation.x;
      this.camera.rotation.y = this.currentRotation.y;
    } else {
      // Reset to default position
      this.camera.rotation.x = 0;
      this.camera.rotation.y = 0;
    }
  }

  setPresentationMode(enabled) {
    this.isPresentationMode = enabled;
    
    if (enabled) {
      // Zoom in slightly for presentation mode
      this.camera.position.z = 4;
    } else {
      // Reset to default
      this.camera.position.z = 5;
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    }
  }
}





