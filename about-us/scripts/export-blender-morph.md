# Blender Export Script for Morph Targets

This guide explains how to export a GLTF model with morph targets from Blender.

## Quick Export Steps

1. **Create Your Mesh**
   - Add → Mesh → (choose your shape)
   - Recommended: Start with a simple shape (Sphere, Torus, etc.)

2. **Add Shape Keys (Morph Targets)**
   ```
   - Select your mesh
   - Properties Panel → Mesh Data → Shape Keys
   - Click "+" to add "Basis" (this is the base shape)
   - Click "+" again → Name it "start"
   - Edit the mesh in Edit Mode to create your start shape
   - Click "+" → Name it "middle"
   - Edit mesh for middle shape
   - Click "+" → Name it "end"
   - Edit mesh for end shape
   ```

3. **Export Settings**
   ```
   File → Export → glTF 2.0 (.gltf/.glb)
   
   Settings:
   ✓ Include: Selected Objects
   ✓ Include: Custom Properties
   ✓ Transform: +Y Up
   ✓ Geometry:
     ✓ Apply Modifiers
     ✓ UVs
     ✓ Normals
     ✓ Tangents
     ✓ Vertex Colors (if used)
   ✓ Shape Keys: ✓ (IMPORTANT!)
   ```

4. **Save**
   - Choose location: `assets/models/your-model.gltf`
   - Click "Export glTF 2.0"

## Python Script for Blender (Optional)

If you want to automate this, create a script in Blender:

```python
import bpy
import os

# Set export path
export_path = "C:/path/to/about-us/assets/models/morph-model.gltf"

# Export settings
bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLTF_SEPARATE',
    export_selected=True,
    export_apply=True,
    export_morph=True,  # This exports shape keys
    export_yup=True
)

print(f"Exported to {export_path}")
```

## Troubleshooting

### Shape Keys Not Exporting

- Make sure "Shape Keys" checkbox is enabled in export settings
- Verify shape keys are visible in Properties Panel
- Check that mesh has shape keys applied (not just modifiers)

### Model Too Large

- Reduce vertex count (Decimate modifier)
- Use Draco compression (enable in export)
- Optimize textures

### Model Not Loading

- Check browser console for errors
- Verify file path is correct
- Ensure GLTFLoader is imported correctly
- Check that model is in `assets/models/` directory

## Tips

- **Start Simple**: Use basic shapes first, then add complexity
- **Test Early**: Load model in code before adding details
- **Performance**: Keep under 10k vertices for smooth 60fps
- **Naming**: Consistent morph target names help with debugging



