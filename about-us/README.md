# About Us Page - Three.js Morphing Experience

A high-performance, immersive "About Us" single-page experience featuring Three.js WebGL morphing visuals and GSAP ScrollTrigger animations. Inspired by minimal, typographic design with experimental WebGL morphing.

## Features

- **Three.js Morphing Visuals**: Custom shader-based morphing with fallback support
- **GSAP ScrollTrigger**: Smooth scroll-driven animations and transitions
- **Keyboard Navigation**: Toggle presentation mode with ↑/↓ or Space
- **Accessibility**: Full keyboard support, reduced motion preferences, ARIA labels
- **Performance Optimized**: Responsive canvas, lazy loading, performance budgets
- **Progressive Enhancement**: CSS fallback if WebGL is unavailable

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd about-us
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
about-us/
├── index.html              # Main HTML file
├── styles.css              # All styles (responsive, accessible)
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js            # Main application entry point
│   └── three/
│       ├── scene.js       # Three.js scene setup
│       ├── morphController.js  # Morph animation controller
│       └── controls.js    # Camera controls
├── assets/
│   ├── models/            # GLTF/GLB files (optional)
│   ├── images/            # Image assets
│   └── fonts/             # Custom fonts (optional)
└── README.md              # This file
```

## How It Works

### Morphing System

The morphing system supports two modes:

1. **Shader-based Morphing** (default): Uses custom GLSL shaders with noise functions to create organic morphing effects. This works without external model files.

2. **GLTF Morph Targets**: If you provide a GLTF model with morph targets named `start`, `middle`, and `end`, the system will use those instead.

### Scroll-Driven Animations

GSAP ScrollTrigger controls:
- Text reveal animations (split text, fade-in)
- Morph progress correlated to scroll position
- Section-based state changes
- Smooth parallax effects

### Presentation Mode

Press `Space` or `↑`/`↓` to toggle presentation mode:
- Fullscreen immersive canvas
- Content fades to 10% opacity
- Interactive camera follows cursor
- Enhanced morphing visuals

## Customization

### Changing the Morph

The morph controller is in `src/three/morphController.js`. To customize:

1. **Shader-based morphing**: Modify the `vertexShader` in `createFallbackMorph()` to change the morphing behavior.

2. **GLTF morph targets**: 
   - Export a model from Blender with 3 morph targets
   - Name them: `start`, `middle`, `end`
   - Place in `assets/models/`
   - Update `main.js` to load the GLTF:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/assets/models/your-model.glb', (gltf) => {
  this.morphController.loadGLTF(gltf);
});
```

### Tuning Morph Behavior

In `morphController.js`, adjust these parameters:

- `uMorphProgress`: Controls morph intensity (0-1)
- Noise functions: Modify `snoise()` parameters for different morph patterns
- Displacement: Change `0.3` multiplier in vertex shader for more/less deformation
- Speed: Adjust `uTime` multiplier for animation speed

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --color-bg: #000000;
  --color-text: #ffffff;
  --color-accent: #00ff88;
  --color-text-muted: #888888;
}
```

For Three.js colors, modify `uColor` uniform in `morphController.js`.

### Typography

Change fonts in `index.html` and update CSS variables:

```css
:root {
  --font-primary: 'Inter', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;
}
```

### Content

Edit `index.html` to change:
- Hero title and subtitle
- Mission statement
- Team members
- Values
- Contact information

## Using GLTF Models with Morph Targets

### Exporting from Blender

1. Create your base mesh
2. Create 3 shape keys (morph targets):
   - `start`: Initial shape
   - `middle`: Intermediate shape
   - `end`: Final shape
3. Export as GLTF 2.0:
   - File → Export → glTF 2.0
   - Include: Selected Objects, Morphs
   - Format: GLTF Separate (or GLB)
4. Place in `assets/models/`
5. Load in `main.js` (see code example above)

### Morph Target Requirements

- Minimum 3 morph targets recommended
- Targets should be named consistently
- Keep poly count reasonable (< 10k vertices for performance)
- Use Draco compression if files are large

## Performance Optimization

### Current Performance Targets

- **FCP (First Contentful Paint)**: < 1.8s on mid-range mobile
- **Lighthouse Performance**: ≥ 60 (with WebGL caveat)
- **Lighthouse Accessibility**: ≥ 90
- **Frame Rate**: 60fps desktop, 30fps mid-range mobile

### Optimizations Applied

- Pixel ratio capped at 2 (`Math.min(window.devicePixelRatio, 2)`)
- Lazy loading for heavy assets
- Animation paused when tab is hidden
- Reduced motion support
- Efficient shader calculations
- Geometry disposal on cleanup

### Further Optimization Tips

1. **Reduce geometry complexity**: Lower poly count for morph meshes
2. **Use texture compression**: Compress textures if using image-based morphing
3. **Code splitting**: Already implemented with manual chunks
4. **Lazy load sections**: Only load Three.js when entering hero section
5. **Post-processing**: Use sparingly (bloom, vignette) - disabled by default

## Accessibility

### Features Implemented

- ✅ Keyboard navigation (Arrow keys, Space)
- ✅ Focus indicators (visible outlines)
- ✅ ARIA labels on interactive elements
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ Semantic HTML (`<main>`, `<section>`, `<nav>`, `<footer>`)
- ✅ Screen reader announcements
- ✅ WebGL fallback (CSS animations)

### Testing Accessibility

- Use keyboard only (Tab, Arrow keys, Space)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Enable reduced motion in OS settings
- Check Lighthouse accessibility score

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ iOS Safari 14+ (with performance considerations)

WebGL 2.0 is required for full functionality. The page gracefully degrades to CSS animations if WebGL is unavailable.

## Troubleshooting

### WebGL Not Working

1. Check browser WebGL support: Visit `chrome://gpu` (Chrome) or `about:support` (Firefox)
2. Update graphics drivers
3. Check browser console for errors
4. The page will fall back to CSS animations automatically

### Morphing Not Smooth

1. Check frame rate: Open DevTools → Performance
2. Reduce geometry complexity
3. Lower pixel ratio: Already capped at 2
4. Disable other browser extensions

### ScrollTrigger Not Working

1. Ensure GSAP is loaded: Check console for errors
2. Verify ScrollTrigger plugin is registered
3. Check that sections have proper IDs
4. Test with reduced motion disabled

### Build Errors

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Check Node.js version: Requires 18+
3. Verify all dependencies are installed

## Development Tips

### Adding New Sections

1. Add HTML section in `index.html`
2. Add corresponding styles in `styles.css`
3. Add ScrollTrigger animation in `main.js` → `setupScrollAnimations()`
4. Update morph progress mapping in `setupMorphScroll()`

### Debugging

Enable debug mode:

```javascript
// In main.js, add after ScrollTrigger registration
ScrollTrigger.config({ markers: true });
```

This shows scroll trigger start/end points.

### Performance Monitoring

Use Chrome DevTools:
1. Performance tab → Record → Interact with page
2. Check FPS, main thread usage
3. Identify bottlenecks (usually shader calculations or geometry updates)

## Credits & Inspiration

- **Junni**: Minimal, bold typographic design reference
- **Vaalentin (2015)**: Experimental WebGL morphing and keyboard navigation inspiration

## License

MIT License - feel free to use in your projects.

## Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Test in different browsers
4. Verify WebGL support

---

**Built with**: Three.js, GSAP ScrollTrigger, Vite

**Performance**: Optimized for 60fps desktop, 30fps mobile

**Accessibility**: WCAG 2.1 AA compliant






