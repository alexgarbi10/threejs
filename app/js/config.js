/**
 * Configuration for Three.js Scene
 * This file allows you to configure all aspects of the 3D scene
 */

export const sceneConfig = {
  // Geometry Configuration
  geometry: {
    // Available geometry types: 'torusKnot', 'box', 'sphere', 'torus', 'octahedron', 'tetrahedron', 'icosahedron', 'brain'
    type: 'brain',
    enabled: true,
    
    // Torus Knot specific parameters
    torusKnot: {
      radius: 200,
      tube: 60,
      tubularSegments: 100,
      radialSegments: 16,
      p: 2,
      q: 3,
    },
    
    // Box specific parameters
    box: {
      width: 200,
      height: 200,
      depth: 200,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    },
    
    // Sphere specific parameters
    sphere: {
      radius: 100,
      widthSegments: 32,
      heightSegments: 16,
      phiStart: 0,
      phiLength: Math.PI * 2,
      thetaStart: 0,
      thetaLength: Math.PI,
    },
    
    // Torus specific parameters
    torus: {
      radius: 100,
      tube: 40,
      radialSegments: 16,
      tubularSegments: 100,
      arc: Math.PI * 2,
    },
    
    // Octahedron specific parameters
    octahedron: {
      radius: 100,
      detail: 0,
    },
    
    // Tetrahedron specific parameters
    tetrahedron: {
      radius: 100,
      detail: 0,
    },
    
    // Icosahedron specific parameters
    icosahedron: {
      radius: 100,
      detail: 0,
    },
    
    // Brain specific parameters (based on "The Human Brain Book" by Rita Carter)
    brain: {
      modelUrl: '/models/brain.glb',  // Path to GLTF model
      scale: 200,  // Scale factor for the model
      regions: [
        // CEREBRAL CORTEX - Four Lobes (color-coded, far from brain)
        { name: 'Frontal Lobe', position: { x: 0, y: 280, z: 420 }, description: 'Blue - Executive functions, planning, personality, decision-making' },
        { name: 'Parietal Lobe', position: { x: 0, y: 380, z: -120 }, description: 'Yellow - Sensory integration, spatial awareness, attention' },
        { name: 'Temporal Lobe', position: { x: -450, y: -60, z: 100 }, description: 'Green - Hearing, language comprehension, memory, facial recognition' },
        { name: 'Occipital Lobe', position: { x: 0, y: 160, z: -420 }, description: 'Red - Visual processing, color perception, motion detection' },
        
        // MOTOR & SENSORY STRIPS
        { name: 'Motor Cortex', position: { x: 350, y: 320, z: 80 }, description: 'Orange - Precentral gyrus, voluntary movement control' },
        { name: 'Sensory Cortex', position: { x: 380, y: 280, z: -80 }, description: 'Bright Yellow - Postcentral gyrus, touch, temperature, pain' },
        
        // CEREBELLUM & BRAINSTEM
        { name: 'Cerebellum', position: { x: 0, y: -240, z: -380 }, description: 'Purple - Coordination, balance, motor learning, timing' },
        { name: 'Brainstem', position: { x: 280, y: -320, z: -60 }, description: 'Teal - Midbrain, pons, medulla; breathing, heart rate, sleep' },
        
        // LIMBIC SYSTEM (deep structures)
        { name: 'Thalamus', position: { x: -380, y: 60, z: 60 }, description: 'Salmon - Sensory relay station, consciousness, alertness' },
        { name: 'Hypothalamus', position: { x: -380, y: -100, z: 140 }, description: 'Salmon - Hormones, hunger, thirst, body temperature, circadian rhythms' },
        { name: 'Hippocampus', position: { x: -420, y: -80, z: 30 }, description: 'Pink - Memory formation, spatial navigation, learning' },
        { name: 'Amygdala', position: { x: -420, y: -60, z: 180 }, description: 'Dark Pink - Emotions, fear response, emotional memories' },
        
        // WHITE MATTER & BASAL GANGLIA
        { name: 'Corpus Callosum', position: { x: -400, y: 180, z: 0 }, description: 'White - 200M+ nerve fibers connecting hemispheres' },
        { name: 'Basal Ganglia', position: { x: 380, y: 40, z: 80 }, description: 'Gold - Movement initiation, habit formation, reward' },
      ],
      showLabels: true,
      labelStyle: 'floating',  // 'floating' or 'pointer'
    },
  },

  // Material Configuration
  material: {
    // Available material types: 'basic', 'standard', 'phong', 'lambert', 'toon', 'physical'
    type: 'basic',
    enabled: true,
    
    // Common material properties
    color: 0xffffff,
    wireframe: false,
    transparent: false,
    opacity: 1.0,
    side: 'front', // 'front', 'back', 'double'
    
    // Standard/Phong/Lambert specific
    metalness: 0.5,
    roughness: 0.5,
    emissive: 0x000000,
    emissiveIntensity: 1.0,
    
    // Texture configuration
    texture: {
      enabled: true,
      url: 'https://images.pexels.com/photos/235994/pexels-photo-235994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      // Alternative local textures (uncomment to use)
      // url: '/textures/abstract.jpg',
      // url: '/textures/floor.jpeg',
      // url: '/textures/wood.jpeg',
      repeat: { x: 1, y: 1 },
      offset: { x: 0, y: 0 },
      wrapS: 'repeat', // 'repeat', 'clampToEdge', 'mirroredRepeat'
      wrapT: 'repeat',
    },
  },

  // Camera Configuration
  camera: {
    enabled: true,
    type: 'perspective', // 'perspective' or 'orthographic'
    
    // Perspective camera
    perspective: {
      fov: 75,
      near: 1,
      far: 10000,
    },
    
    // Orthographic camera (will be calculated dynamically)
    orthographic: {
      left: -1000,
      right: 1000,
      top: 1000,
      bottom: -1000,
      near: 1,
      far: 10000,
    },
    
    // Camera position
    position: {
      x: 0,
      y: 80,
      z: 1000,
    },
    
    // Camera rotation (in radians)
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },

  // Lighting Configuration
  lighting: {
    enabled: true,
    
    // Ambient light
    ambient: {
      enabled: true,
      color: 0x404040,
      intensity: 0.8,
    },
    
    // Directional light
    directional: {
      enabled: true,
      color: 0xffffff,
      intensity: 1.5,
      position: { x: 100, y: 100, z: 100 },
      castShadow: true,
    },
    
    // Hemisphere light
    hemisphere: {
      enabled: false,
      skyColor: 0xffffbb,
      groundColor: 0x080820,
      intensity: 1.0,
      position: { x: 0, y: 1, z: 0 },
    },
    
    // Point light
    point: {
      enabled: false,
      color: 0xffffff,
      intensity: 1.0,
      distance: 0,
      decay: 1,
      position: { x: 0, y: 0, z: 0 },
      castShadow: false,
    },
    
    // Spot light
    spot: {
      enabled: true,
      color: 0xffffff,
      intensity: 1.0,
      distance: 0,
      angle: Math.PI / 3,
      penumbra: 0,
      decay: 1,
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      castShadow: true,
      shadow: {
        mapSize: { width: 1024, height: 1024 },
        camera: {
          near: 500,
          far: 4000,
          fov: 30,
        },
      },
    },
  },

  // Renderer Configuration
  renderer: {
    enabled: true,
    antialias: true,
    alpha: false,
    clearColor: 0x000000,
    pixelRatio: 'auto', // 'auto' or number
    shadowMap: {
      enabled: true,
      type: 'pcf', // 'basic', 'pcf', 'pcfSoft', 'vsm'
    },
    toneMapping: 'aces', // 'linear', 'reinhard', 'cineon', 'aces', 'neutral'
    toneMappingExposure: 1.0,
  },

  // Animation Configuration
  animation: {
    enabled: true,
    autoRotate: true,
    rotation: {
      x: 0.002,
      y: 0.005,
      z: 0,
    },
    speed: 1.0, // Multiplier for rotation speed
  },

  // Scene Configuration
  scene: {
    background: null, // null, color (0x000000), or texture URL
    fog: {
      enabled: false,
      type: 'linear', // 'linear' or 'exponential'
      color: 0x000000,
      near: 1,
      far: 1000,
      density: 0.00025,
    },
  },
};

// Export default config
export default sceneConfig;
