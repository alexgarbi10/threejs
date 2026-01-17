# Configuration Guide

This project uses a comprehensive configuration system that allows you to control every aspect of the Three.js scene through the `app/js/config.js` file.

## Quick Start

Edit `app/js/config.js` to customize your scene. All changes take effect when you reload the page.

## Configuration Options

### Geometry

Change the 3D shape being displayed:

```javascript
geometry: {
  type: 'torusKnot', // Options: 'torusKnot', 'box', 'sphere', 'torus', 'octahedron', 'tetrahedron', 'icosahedron'
  enabled: true,
  
  torusKnot: {
    radius: 200,
    tube: 60,
    tubularSegments: 100,
    radialSegments: 16,
    p: 2,
    q: 3,
  },
}
```

### Material

Control the appearance and material type:

```javascript
material: {
  type: 'basic', // Options: 'basic', 'standard', 'phong', 'lambert', 'toon', 'physical'
  enabled: true,
  color: 0xffffff,
  wireframe: false,
  transparent: false,
  opacity: 1.0,
  
  texture: {
    enabled: true,
    url: 'https://images.pexels.com/photos/235994/pexels-photo-235994.jpeg...',
    // Or use local textures:
    // url: '/textures/abstract.jpg',
    // url: '/textures/floor.jpeg',
    // url: '/textures/wood.jpeg',
  },
}
```

### Camera

Switch between perspective and orthographic cameras:

```javascript
camera: {
  type: 'perspective', // 'perspective' or 'orthographic'
  position: { x: 0, y: 0, z: 1000 },
  rotation: { x: 0, y: 0, z: 0 },
}
```

### Lighting

Enable/disable and configure multiple light types:

```javascript
lighting: {
  ambient: { enabled: false, color: 0x404040, intensity: 0.5 },
  directional: { enabled: false, ... },
  hemisphere: { enabled: false, ... },
  point: { enabled: false, ... },
  spot: { enabled: true, ... }, // Currently active
}
```

### Animation

Control rotation speed and direction:

```javascript
animation: {
  enabled: true,
  autoRotate: true,
  rotation: { x: 0.01, y: 0.01, z: 0 },
  speed: 1.0, // Multiplier for rotation speed
}
```

### Renderer

Configure rendering quality and effects:

```javascript
renderer: {
  antialias: true,
  shadowMap: { enabled: true, type: 'pcf' },
  toneMapping: 'aces',
  toneMappingExposure: 1.0,
}
```

## Examples

### Example 1: Switch to a Box with Standard Material

```javascript
geometry: {
  type: 'box',
  box: { width: 200, height: 200, depth: 200 },
}

material: {
  type: 'standard',
  metalness: 0.8,
  roughness: 0.2,
}
```

### Example 2: Use Local Texture

```javascript
material: {
  texture: {
    enabled: true,
    url: '/textures/wood.jpeg',
  },
}
```

### Example 3: Disable Animation

```javascript
animation: {
  enabled: false,
}
```

### Example 4: Change to Orthographic Camera

```javascript
camera: {
  type: 'orthographic',
  position: { x: 0, y: 0, z: 1000 },
}
```

### Example 5: Multiple Lights

```javascript
lighting: {
  ambient: { enabled: true, intensity: 0.3 },
  directional: { enabled: true, position: { x: 5, y: 5, z: 5 } },
  spot: { enabled: true },
}
```

## Runtime Configuration

You can also update the configuration at runtime:

```javascript
import { ThreeJSScene } from './main.js';

const scene = new ThreeJSScene();

// Update configuration
scene.updateConfig({
  geometry: { type: 'sphere' },
  animation: { speed: 2.0 },
});
```

## Available Geometry Types

- `torusKnot` - Complex twisted torus shape
- `box` - Simple cube
- `sphere` - Perfect sphere
- `torus` - Donut shape
- `octahedron` - 8-sided polyhedron
- `tetrahedron` - 4-sided pyramid
- `icosahedron` - 20-sided polyhedron

## Available Material Types

- `basic` - Simple, unlit material
- `standard` - Physically-based rendering (PBR)
- `phong` - Phong shading model
- `lambert` - Lambertian shading
- `toon` - Toon/cel shading
- `physical` - Advanced PBR material

## Available Shadow Map Types

- `basic` - Basic shadow map
- `pcf` - Percentage Closer Filtering
- `pcfSoft` - Soft shadows with PCF
- `vsm` - Variance Shadow Maps

## Available Tone Mapping

- `linear` - Linear tone mapping
- `reinhard` - Reinhard tone mapping
- `cineon` - Cineon filmic curve
- `aces` - ACES Filmic (recommended)
- `neutral` - Neutral tone mapping
