# Configuration Guide

This project uses a comprehensive configuration system that allows you to control every aspect of the 3D brain visualization through the `app/js/config.js` file.

## Quick Start

Edit `app/js/config.js` to customize your scene. All changes take effect when you reload the page.

## Brain Configuration

The brain visualization is the primary feature. Configure it in the `geometry` section:

```javascript
geometry: {
  type: 'brain',  // Set to 'brain' for brain visualization
  enabled: true,
  
  brain: {
    modelUrl: '/models/brain.glb',  // Path to GLTF model (optional)
    scale: 200,                      // Size of the brain
    showLabels: true,                // Show/hide anatomical labels
    labelStyle: 'floating',          // Label display style
    
    regions: [
      { 
        name: 'Frontal Lobe', 
        position: { x: 0, y: 180, z: 280 }, 
        description: 'Planning, decision-making, personality' 
      },
      // ... more regions
    ],
  },
}
```

### Brain Regions

The default configuration includes 13 anatomically accurate brain regions:

| Region | Function | Position (x, y, z) |
|--------|----------|-------------------|
| Frontal Lobe | Planning, decision-making, speech | (0, 180, 280) |
| Parietal Lobe | Sensory integration, spatial awareness | (0, 250, -100) |
| Temporal Lobe | Hearing, language, memory | (-300, -50, 60) |
| Occipital Lobe | Visual processing | (0, 100, -280) |
| Motor Cortex | Voluntary movement | (220, 200, 40) |
| Sensory Cortex | Touch, pain, proprioception | (240, 180, -60) |
| Cerebellum | Coordination, balance | (0, -160, -250) |
| Brainstem | Vital autonomic functions | (180, -180, -40) |
| Thalamus | Sensory relay hub | (-250, 30, 40) |
| Hypothalamus | Homeostasis, circadian rhythms | (-250, -80, 100) |
| Hippocampus | Memory, spatial navigation | (-280, -60, 20) |
| Amygdala | Emotions, fear response | (-280, -50, 120) |
| Corpus Callosum | Connects hemispheres | (-260, 120, 0) |

### Adding Custom Regions

Add new brain regions by extending the `regions` array:

```javascript
regions: [
  // ... existing regions
  { 
    name: 'Prefrontal Cortex', 
    position: { x: 0, y: 150, z: 320 }, 
    description: 'Executive functions, working memory' 
  },
  { 
    name: 'Wernicke\'s Area', 
    position: { x: -280, y: 20, z: 80 }, 
    description: 'Language comprehension' 
  },
]
```

### Label Positioning Tips

Labels are positioned in 3D space. To adjust:

- **x-axis**: Left (-) / Right (+)
- **y-axis**: Down (-) / Up (+)
- **z-axis**: Back (-) / Front (+)

Move labels further from the brain by increasing absolute values (e.g., x: -300 instead of x: -150).

## Using a GLTF Brain Model

For more realistic visualization, load a 3D brain model:

1. Download a brain model in GLTF/GLB format
2. Place it in the `/models/` directory
3. Update the config:

```javascript
brain: {
  modelUrl: '/models/brain.glb',
  scale: 200,  // Adjust based on model size
}
```

If no model is found, a procedural brain is displayed automatically.

## Camera Configuration

Position the camera to view the brain:

```javascript
camera: {
  type: 'perspective',
  position: { x: 0, y: 50, z: 800 },  // Distance from brain
  rotation: { x: 0, y: 0, z: 0 },
}
```

## Lighting Configuration

The brain uses physical materials that require proper lighting:

```javascript
lighting: {
  enabled: true,
  ambient: { enabled: true, color: 0x404040, intensity: 0.8 },
  directional: { 
    enabled: true, 
    color: 0xffffff, 
    intensity: 1.5,
    position: { x: 100, y: 100, z: 100 },
  },
}
```

## Animation Configuration

Control the brain rotation:

```javascript
animation: {
  enabled: true,
  autoRotate: true,
  rotation: { x: 0.002, y: 0.005, z: 0 },  // Rotation speed per axis
  speed: 1.0,  // Global speed multiplier
}
```

### Stopping Rotation

```javascript
animation: {
  autoRotate: false,  // Disable auto-rotation
}
```

## Other Geometry Types

The project also supports basic geometries (from original codebase):

```javascript
geometry: {
  type: 'sphere',  // Options: 'torusKnot', 'box', 'sphere', 'torus', etc.
}
```

## Runtime Configuration

Update the visualization at runtime:

```javascript
import { ThreeJSScene } from './main.js';

const scene = new ThreeJSScene();

// Switch to brain view
scene.updateConfig({
  geometry: { type: 'brain' },
});

// Change rotation speed
scene.updateConfig({
  animation: { speed: 2.0 },
});
```

## Label Styling

Labels are styled via CSS in `app/css/main.css`:

```css
.brain-label {
  background: rgba(0, 20, 30, 0.75);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 9px;
}

.brain-label-name {
  color: #00dddd;
  font-weight: 600;
  text-transform: uppercase;
}

.brain-label-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 8px;
}
```

## Complete Example

Full brain configuration:

```javascript
export const sceneConfig = {
  geometry: {
    type: 'brain',
    enabled: true,
    brain: {
      modelUrl: '/models/brain.glb',
      scale: 200,
      showLabels: true,
      regions: [
        { name: 'Frontal Lobe', position: { x: 0, y: 180, z: 280 }, description: 'Planning, decision-making' },
        { name: 'Parietal Lobe', position: { x: 0, y: 250, z: -100 }, description: 'Sensory integration' },
        // ... more regions
      ],
    },
  },
  
  camera: {
    type: 'perspective',
    position: { x: 0, y: 50, z: 800 },
  },
  
  lighting: {
    enabled: true,
    ambient: { enabled: true, intensity: 0.8 },
    directional: { enabled: true, intensity: 1.5 },
  },
  
  animation: {
    enabled: true,
    autoRotate: true,
    rotation: { x: 0.002, y: 0.005, z: 0 },
  },
  
  renderer: {
    antialias: true,
    toneMapping: 'aces',
  },
};
```
