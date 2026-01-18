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
        // CEREBRAL CORTEX - Four Lobes (positioned far outside the brain)
        { name: 'Frontal Lobe', position: { x: 0, y: 180, z: 280 }, description: 'Planning, decision-making, personality, speech production' },
        { name: 'Parietal Lobe', position: { x: 0, y: 250, z: -100 }, description: 'Sensory integration, spatial awareness, body position' },
        { name: 'Temporal Lobe', position: { x: -300, y: -50, z: 60 }, description: 'Hearing, language comprehension, facial recognition' },
        { name: 'Occipital Lobe', position: { x: 0, y: 100, z: -280 }, description: 'Visual processing, color and motion perception' },
        
        // MOTOR & SENSORY CORTEX
        { name: 'Motor Cortex', position: { x: 220, y: 200, z: 40 }, description: 'Precentral gyrus - voluntary movement control' },
        { name: 'Sensory Cortex', position: { x: 240, y: 180, z: -60 }, description: 'Postcentral gyrus - touch, pain, proprioception' },
        
        // CEREBELLUM
        { name: 'Cerebellum', position: { x: 0, y: -160, z: -250 }, description: 'Coordination, balance, motor learning' },
        
        // BRAINSTEM
        { name: 'Brainstem', position: { x: 180, y: -180, z: -40 }, description: 'Midbrain, pons, medulla - vital autonomic functions' },
        
        // LIMBIC SYSTEM (deep structures)
        { name: 'Thalamus', position: { x: -250, y: 30, z: 40 }, description: 'Sensory relay hub - routes information to cortex' },
        { name: 'Hypothalamus', position: { x: -250, y: -80, z: 100 }, description: 'Homeostasis, hunger, thirst, circadian rhythms' },
        { name: 'Hippocampus', position: { x: -280, y: -60, z: 20 }, description: 'Memory consolidation, spatial navigation' },
        { name: 'Amygdala', position: { x: -280, y: -50, z: 120 }, description: 'Emotional processing, fear response' },
        
        // WHITE MATTER
        { name: 'Corpus Callosum', position: { x: -260, y: 120, z: 0 }, description: 'Connects left and right hemispheres' },
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
      y: 50,
      z: 800,
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
