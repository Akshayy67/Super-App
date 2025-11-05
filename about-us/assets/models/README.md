# GLTF Models Directory

Place your GLTF/GLB models with morph targets here.

## Example Model Structure

If you're creating a model with morph targets:

1. **Base Shape**: Your starting geometry
2. **Morph Targets**: 
   - `start` (or `morphTarget_0`)
   - `middle` (or `morphTarget_1`)
   - `end` (or `morphTarget_2`)

## Exporting from Blender

### Step-by-Step

1. Create your base mesh
2. Add Shape Keys:
   - Select mesh → Mesh → Shape Keys → Add Shape Key
   - Name first key "Basis" (default)
   - Add "start" shape key, edit mesh
   - Add "middle" shape key, edit mesh
   - Add "end" shape key, edit mesh
3. Export:
   - File → Export → glTF 2.0
   - Settings:
     * Format: GLTF Separate (.gltf + .bin + textures)
     * Include: Selected Objects, Custom Properties, Apply Modifiers
     * Transform: +Y Up
     * Geometry: Apply Modifiers, UVs, Normals, Tangents
     * **Shape Keys must be enabled**

## Loading in Code

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/assets/models/your-model.gltf', (gltf) => {
  morphController.loadGLTF(gltf);
});
```

## Performance Tips

- Keep vertex count < 10,000 for smooth performance
- Use Draco compression for large files
- Optimize textures (1024x1024 or smaller)
- Test on target devices

## Example Model Sources

- Create your own in Blender
- Use free models from Sketchfab (check license)
- Generate procedural shapes with code





