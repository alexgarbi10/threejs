# 3D Brain Anatomy Visualization

An interactive 3D brain anatomy visualization built with Three.js, featuring labeled anatomical regions inspired by Rita Carter's "The Human Brain Book".

## Features

- **Anatomically Accurate Brain Model** - Cerebral hemispheres, lobes, cerebellum, brainstem, and deep structures
- **13 Labeled Brain Regions** - Interactive labels with descriptions for major brain areas
- **CSS2D Labels** - Clean floating labels that always face the camera
- **GLTF Model Support** - Load custom brain models or use the built-in procedural brain
- **Auto-Rotation** - Smooth rotation for 360-degree viewing
- **Responsive** - Adapts to any screen size

## Brain Regions Included

### Cerebral Cortex (Four Lobes)
- **Frontal Lobe** - Planning, decision-making, personality, speech production
- **Parietal Lobe** - Sensory integration, spatial awareness, body position
- **Temporal Lobe** - Hearing, language comprehension, facial recognition
- **Occipital Lobe** - Visual processing, color and motion perception

### Motor & Sensory Areas
- **Motor Cortex** - Precentral gyrus, voluntary movement control
- **Sensory Cortex** - Postcentral gyrus, touch, pain, proprioception

### Subcortical Structures
- **Cerebellum** - Coordination, balance, motor learning
- **Brainstem** - Midbrain, pons, medulla - vital autonomic functions
- **Thalamus** - Sensory relay hub
- **Hypothalamus** - Homeostasis, hunger, thirst, circadian rhythms
- **Hippocampus** - Memory consolidation, spatial navigation
- **Amygdala** - Emotional processing, fear response
- **Corpus Callosum** - Connects left and right hemispheres

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (runs on http://localhost:9000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Using a Custom Brain Model

For a more detailed brain, you can load a GLTF/GLB model:

1. Download a brain model from:
   - [Sketchfab](https://sketchfab.com/search?q=brain+anatomy&type=models) (filter by CC license)
   - [Poly Pizza](https://poly.pizza) (Google Poly archive)

2. Place the model in the `/models/` directory as `brain.glb`

3. The app will automatically load and display your model with anatomical labels

## Configuration

Edit `app/js/config.js` to customize the visualization:

```javascript
geometry: {
  type: 'brain',
  brain: {
    modelUrl: '/models/brain.glb',
    scale: 200,
    showLabels: true,
    regions: [
      { name: 'Frontal Lobe', position: { x: 0, y: 180, z: 280 }, description: '...' },
      // ... more regions
    ],
  },
}
```

### Adjusting Label Positions

Labels are positioned in 3D space around the brain. Adjust the `position` values in the `regions` array to move labels:

- `x` - Left/Right (negative = left, positive = right)
- `y` - Up/Down (negative = down, positive = up)
- `z` - Front/Back (negative = back, positive = front)

### Animation Settings

```javascript
animation: {
  enabled: true,
  autoRotate: true,
  rotation: { x: 0.002, y: 0.005, z: 0 },
  speed: 1.0,
}
```

## Project Structure

```
brain-3d-visualization/
├── app/
│   ├── css/
│   │   └── main.css          # Styles including brain labels
│   └── js/
│       ├── main.js           # ThreeJSScene class with brain rendering
│       ├── config.js         # Brain regions and scene configuration
│       └── main.test.js      # Unit tests
├── models/                   # Place brain.glb here
├── textures/                 # Texture assets
├── index.html                # HTML entry point
├── CONFIG.md                 # Detailed configuration guide
└── README.md                 # This file
```

## Technologies Used

- **Three.js** - 3D graphics library
- **GLTFLoader** - Load 3D brain models
- **CSS2DRenderer** - HTML labels in 3D space
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework

## References

- Carter, Rita. "The Human Brain Book." DK Publishing.
- Three.js Documentation: https://threejs.org/docs/

## Browser Support

Modern browsers with WebGL support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
