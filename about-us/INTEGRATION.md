# Integration Guide

This guide explains how to integrate the About Us page into your existing React application.

## Option 1: Standalone Page (Recommended)

The About Us page is designed to work standalone. You can:

1. **Deploy separately**: Build and deploy the `about-us` directory as a separate app
2. **Link from main app**: Add a link in your main app that opens the About Us page
3. **Iframe embedding**: Embed as an iframe (not recommended for performance)

## Option 2: React Component Integration

If you want to integrate into your existing React app:

### Step 1: Copy Files

Copy these files to your React app:
- `src/three/` → Your React app's `src/three/` or `src/components/three/`
- `styles.css` → Import in your component or add to global styles

### Step 2: Create React Component

Create `src/components/AboutUsPage.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { SceneManager } from '../three/scene';
import { MorphController } from '../three/morphController';
import { CameraController } from '../three/controls';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/about-us.css'; // Your imported styles

export function AboutUsPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const morphControllerRef = useRef<MorphController | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js
    const sceneManager = new SceneManager(canvasRef.current);
    const morphController = new MorphController(
      sceneManager.getScene(),
      sceneManager.getCamera()
    );
    const cameraController = new CameraController(
      sceneManager.getCamera(),
      sceneManager.getRenderer()
    );

    sceneManagerRef.current = sceneManager;
    morphControllerRef.current = morphController;
    cameraControllerRef.current = cameraController;

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Setup animations (similar to main.js)
    // ... copy animation setup from main.js

    // Render loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      morphController.update(0.016); // ~60fps
      cameraController.update(0.016);
      sceneManager.render();
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      morphController.dispose();
      sceneManager.dispose();
    };
  }, []);

  return (
    <div className="about-us-page">
      <div ref={canvasRef} className="canvas-container" />
      {/* Your HTML content from index.html */}
    </div>
  );
}
```

### Step 3: Add Route

In your React Router setup:

```tsx
import { AboutUsPage } from './components/AboutUsPage';

// In your routes
<Route path="/about" element={<AboutUsPage />} />
```

### Step 4: Install Dependencies

Ensure these are in your `package.json`:
```json
{
  "dependencies": {
    "three": "^0.181.0",
    "gsap": "^3.13.0"
  }
}
```

## Option 3: Hybrid Approach

Keep as standalone but share utilities:

1. Keep `about-us` as separate project
2. Share TypeScript types or utilities if needed
3. Use same build process but deploy separately

## Performance Considerations

### Code Splitting

If integrating into React app, use dynamic imports:

```tsx
const AboutUsPage = lazy(() => import('./components/AboutUsPage'));

// In route
<Suspense fallback={<Loading />}>
  <AboutUsPage />
</Suspense>
```

### Asset Loading

- Keep Three.js and GSAP in separate chunks
- Lazy load GLTF models only when About Us page is visited
- Use React.memo for components that don't need re-renders

### CSS Conflicts

- Namespace your CSS classes (already done with `.about-us-page`)
- Use CSS Modules if needed
- Avoid global styles that might conflict

## Troubleshooting

### Three.js conflicts

If you have multiple Three.js instances:
- Use a single WebGL context if possible
- Dispose of resources properly on unmount
- Check for canvas context limits

### GSAP ScrollTrigger conflicts

If ScrollTrigger conflicts with other animations:
- Use ScrollTrigger.refresh() after route changes
- Kill all ScrollTriggers on component unmount
- Use unique IDs for triggers

### TypeScript errors

If you get TypeScript errors:
- Install `@types/three` if not already installed
- Check that GSAP types are available
- Add type declarations for custom modules

## Best Practices

1. **Lazy Load**: Only load About Us page when needed
2. **Cleanup**: Always dispose Three.js resources on unmount
3. **Error Boundaries**: Wrap component in error boundary
4. **Loading States**: Show loading while Three.js initializes
5. **Fallback**: Provide fallback UI if WebGL fails

## Example Integration

See the main project's routing setup for how to add this as a route in your existing app structure.




