# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5174` in your browser.

## 3. Key Features to Test

### Keyboard Controls
- **Space** or **↑/↓**: Toggle presentation mode
- **Arrow Down**: Navigate to next section
- **Arrow Up**: Navigate to previous section

### Scroll Interactions
- Scroll down to see morphing object change
- Text animations trigger as you scroll
- Sections fade in smoothly

### Presentation Mode
- Press Space to enter fullscreen canvas mode
- Move mouse to see camera follow cursor
- Press Space again to exit

## 4. Customize Content

Edit `index.html` to change:
- Hero title (lines 24-28)
- Mission statement (line 35)
- Team members (lines 42-56)
- Values (lines 64-85)
- Contact info (line 93)

## 5. Customize Styling

Edit `styles.css`:
- Colors: CSS variables at top (lines 5-9)
- Typography: Font variables (lines 10-11)
- Spacing: Spacing variables (lines 13-17)

## 6. Add Your Own GLTF Model

1. Export from Blender with morph targets (see `scripts/export-blender-morph.md`)
2. Place in `assets/models/`
3. Uncomment and modify in `src/main.js`:

```javascript
import { loadGLTFModel } from './three/loadGLTF.js';

// In init() method, after morphController creation:
loadGLTFModel('/assets/models/your-model.gltf', (gltf) => {
  this.morphController.loadGLTF(gltf);
});
```

## 7. Build for Production

```bash
npm run build
```

Output in `dist/` directory.

## Troubleshooting

**WebGL not working?**
- Check browser console for errors
- Page will fall back to CSS animations automatically

**Morphing too fast/slow?**
- Edit `morphController.js` → adjust `uTime` multiplier in vertex shader

**Animations not smooth?**
- Check browser DevTools Performance tab
- Reduce geometry complexity if using GLTF

**Can't see the 3D object?**
- Check browser console for errors
- Verify Three.js is loading correctly
- Try refreshing the page

## Next Steps

- Read full `README.md` for detailed documentation
- Check `scripts/export-blender-morph.md` for Blender export guide
- Customize colors, fonts, and content to match your brand

Enjoy building! 🚀

