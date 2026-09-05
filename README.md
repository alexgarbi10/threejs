# 3D Brain Anatomy Visualization

Interactive WebGL brain model with labeled regions, built with [Three.js](https://threejs.org/) and Vite.

Inspired by Rita Carter's *The Human Brain Book*. Labels stay camera-facing via CSS2D; rotation is automatic. Drop in a GLTF model or use the procedural fallback.

## Stack

Three.js · GLTFLoader · CSS2DRenderer · Vite · Vitest

## Features

- Cerebral hemispheres, lobes, cerebellum, brainstem, and deep structures
- 13 labeled regions with short descriptions
- Optional `models/brain.glb` (procedural brain if the file is missing)
- Auto-rotation and responsive canvas

## Brain regions

**Cortex:** frontal, parietal, temporal, occipital lobes  
**Motor / sensory:** motor cortex, sensory cortex  
**Subcortical:** cerebellum, brainstem, thalamus, hypothalamus, hippocampus, amygdala, corpus callosum

## Run locally

Node.js 18+ and pnpm 10+ required.

```bash
pnpm install
pnpm dev         # http://localhost:9000
pnpm test        # Vitest
pnpm build
```

## Custom model

1. Place a CC-licensed GLTF/GLB at `models/brain.glb` ([Sketchfab](https://sketchfab.com/search?q=brain+anatomy&type=models)).
2. Restart the dev server. Labels come from `app/js/config.js`.

Label axes: `x` left/right, `y` up/down, `z` front/back.

```javascript
animation: {
  enabled: true,
  autoRotate: true,
  rotation: { x: 0.002, y: 0.005, z: 0 },
  speed: 1.0,
}
```

More options: [CONFIG.md](CONFIG.md).

## Layout

```
app/js/main.js      ThreeJSScene
app/js/config.js    regions and scene settings
app/js/main.test.js unit tests
models/             optional brain.glb
```

## License

MIT. See [LICENSE](LICENSE).
