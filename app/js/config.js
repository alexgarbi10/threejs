/**
 * Configuration for Three.js Scene
 * This file allows you to configure all aspects of the 3D scene
 */

export const sceneConfig = {
  // Geometry Configuration
  geometry: {
    // Available geometry types: 'torusKnot', 'box', 'sphere', 'torus', 'octahedron', 'tetrahedron', 'icosahedron'
    type: 'torusKnot',
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
      y: 0,
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
      enabled: false,
      color: 0x404040,
      intensity: 0.5,
    },
    
    // Directional light
    directional: {
      enabled: false,
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 1, y: 1, z: 1 },
      castShadow: false,
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
      x: 0.01,
      y: 0.01,
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
