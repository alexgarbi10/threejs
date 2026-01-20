import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import sceneConfig from './config.js';

class ThreeJSScene {
  constructor(config = sceneConfig) {
    this.config = config;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.lights = [];
    this.mesh = null;
    this.brainGroup = null;
    this.labels = [];
    this.animationId = null;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.loadingVersion = 0;  // Track loading version to invalidate stale callbacks

    this.init();
    if (this.config.animation.enabled) {
      this.animate();
    }
    this.handleResize();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createGeometry();
    this.createLights();
    this.createRenderer();
  }

  createScene() {
    this.scene = new THREE.Scene();

    // Set background
    if (this.config.scene.background) {
      if (typeof this.config.scene.background === 'string') {
        // Load texture if URL provided
        const texture = this.textureLoader.load(this.config.scene.background);
        this.scene.background = texture;
      } else {
        this.scene.background = new THREE.Color(this.config.scene.background);
      }
    }

    // Add fog if enabled
    if (this.config.scene.fog.enabled) {
      if (this.config.scene.fog.type === 'linear') {
        this.scene.fog = new THREE.Fog(
          this.config.scene.fog.color,
          this.config.scene.fog.near,
          this.config.scene.fog.far
        );
      } else {
        this.scene.fog = new THREE.FogExp2(
          this.config.scene.fog.color,
          this.config.scene.fog.density
        );
      }
    }
  }

  createCamera() {
    if (!this.config.camera.enabled) return;

    if (this.config.camera.type === 'perspective') {
      const { fov, near, far } = this.config.camera.perspective;
      this.camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        near,
        far
      );
    } else {
      const { left, right, top, bottom, near, far } =
        this.config.camera.orthographic;
      // Calculate orthographic bounds based on window size
      const aspect = window.innerWidth / window.innerHeight;
      const width = Math.abs(right - left) || window.innerWidth / 2;
      const height = Math.abs(top - bottom) || window.innerHeight / 2;
      
      this.camera = new THREE.OrthographicCamera(
        -width * aspect,
        width * aspect,
        height,
        -height,
        near,
        far
      );
    }

    // Set camera position
    const { x, y, z } = this.config.camera.position;
    this.camera.position.set(x, y, z);

    // Set camera rotation
    const { x: rx, y: ry, z: rz } = this.config.camera.rotation;
    this.camera.rotation.set(rx, ry, rz);
  }

  createGeometry() {
    if (!this.config.geometry.enabled) return;

    let geometry;

    switch (this.config.geometry.type) {
      case 'torusKnot': {
        const { radius, tube, tubularSegments, radialSegments, p, q } =
          this.config.geometry.torusKnot;
        geometry = new THREE.TorusKnotGeometry(
          radius,
          tube,
          tubularSegments,
          radialSegments,
          p,
          q
        );
        break;
      }
      case 'box': {
        const { width, height, depth, widthSegments, heightSegments, depthSegments } =
          this.config.geometry.box;
        geometry = new THREE.BoxGeometry(
          width,
          height,
          depth,
          widthSegments,
          heightSegments,
          depthSegments
        );
        break;
      }
      case 'sphere': {
        const { radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength } =
          this.config.geometry.sphere;
        geometry = new THREE.SphereGeometry(
          radius,
          widthSegments,
          heightSegments,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );
        break;
      }
      case 'torus': {
        const { radius, tube, radialSegments, tubularSegments, arc } =
          this.config.geometry.torus;
        geometry = new THREE.TorusGeometry(
          radius,
          tube,
          radialSegments,
          tubularSegments,
          arc
        );
        break;
      }
      case 'octahedron': {
        const { radius, detail } = this.config.geometry.octahedron;
        geometry = new THREE.OctahedronGeometry(radius, detail);
        break;
      }
      case 'tetrahedron': {
        const { radius, detail } = this.config.geometry.tetrahedron;
        geometry = new THREE.TetrahedronGeometry(radius, detail);
        break;
      }
      case 'icosahedron': {
        const { radius, detail } = this.config.geometry.icosahedron;
        geometry = new THREE.IcosahedronGeometry(radius, detail);
        break;
      }
      case 'brain': {
        // Brain uses GLTF loader, handle separately
        this.createBrainGeometry();
        return;
      }
      default:
        console.warn(`Unknown geometry type: ${this.config.geometry.type}`);
        return;
    }

    // Create material
    const material = this.createMaterial();

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  createMaterial() {
    if (!this.config.material.enabled) {
      return new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    const materialConfig = this.config.material;
    let material;

    // Load texture if enabled
    let texture = null;
    if (materialConfig.texture.enabled && materialConfig.texture.url) {
      texture = this.textureLoader.load(materialConfig.texture.url);
      
      // Configure texture wrapping
      const wrapS = this.getTextureWrap(materialConfig.texture.wrapS);
      const wrapT = this.getTextureWrap(materialConfig.texture.wrapT);
      texture.wrapS = wrapS;
      texture.wrapT = wrapT;
      
      // Set repeat and offset
      texture.repeat.set(
        materialConfig.texture.repeat.x,
        materialConfig.texture.repeat.y
      );
      texture.offset.set(
        materialConfig.texture.offset.x,
        materialConfig.texture.offset.y
      );
    }

    // Create material based on type
    const materialParams = {
      color: materialConfig.color,
      wireframe: materialConfig.wireframe,
      transparent: materialConfig.transparent,
      opacity: materialConfig.opacity,
      side: this.getMaterialSide(materialConfig.side),
    };

    if (texture) {
      materialParams.map = texture;
    }

    switch (materialConfig.type) {
      case 'basic':
        material = new THREE.MeshBasicMaterial(materialParams);
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          ...materialParams,
          metalness: materialConfig.metalness,
          roughness: materialConfig.roughness,
          emissive: materialConfig.emissive,
          emissiveIntensity: materialConfig.emissiveIntensity,
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          ...materialParams,
          emissive: materialConfig.emissive,
          emissiveIntensity: materialConfig.emissiveIntensity,
        });
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial({
          ...materialParams,
          emissive: materialConfig.emissive,
          emissiveIntensity: materialConfig.emissiveIntensity,
        });
        break;
      case 'toon':
        material = new THREE.MeshToonMaterial(materialParams);
        break;
      case 'physical':
        material = new THREE.MeshPhysicalMaterial({
          ...materialParams,
          metalness: materialConfig.metalness,
          roughness: materialConfig.roughness,
          emissive: materialConfig.emissive,
          emissiveIntensity: materialConfig.emissiveIntensity,
        });
        break;
      default:
        material = new THREE.MeshBasicMaterial(materialParams);
    }

    return material;
  }

  getMaterialSide(side) {
    switch (side) {
      case 'back':
        return THREE.BackSide;
      case 'double':
        return THREE.DoubleSide;
      case 'front':
      default:
        return THREE.FrontSide;
    }
  }

  getTextureWrap(wrap) {
    switch (wrap) {
      case 'clampToEdge':
        return THREE.ClampToEdgeWrapping;
      case 'mirroredRepeat':
        return THREE.MirroredRepeatWrapping;
      case 'repeat':
      default:
        return THREE.RepeatWrapping;
    }
  }

  createBrainGeometry() {
    const brainConfig = this.config.geometry.brain;
    
    // Increment loading version to invalidate any pending callbacks
    this.loadingVersion++;
    const currentVersion = this.loadingVersion;
    
    // Create a group to hold the brain model and labels
    this.brainGroup = new THREE.Group();
    this.scene.add(this.brainGroup);
    
    // Load the GLTF brain model
    this.gltfLoader.load(
      brainConfig.modelUrl,
      (gltf) => {
        // Check if this callback is stale (updateConfig was called during loading)
        if (currentVersion !== this.loadingVersion) {
          console.log('Ignoring stale GLTF load callback');
          return;
        }
        
        const model = gltf.scene;
        
        // Calculate bounding box to center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        model.position.sub(center);
        
        // Scale the model based on config
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = (brainConfig.scale * 2) / maxDim;
        model.scale.setScalar(scale);
        
        // Apply anatomically accurate materials (based on Rita Carter's illustrations)
        model.traverse((child) => {
          if (child.isMesh) {
            // Realistic gray matter color (grayish-pink cerebral cortex)
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xd4a59a,  // Anatomical cortex color
              metalness: 0.0,
              roughness: 0.85,
              transparent: false,
              side: THREE.DoubleSide,
              clearcoat: 0.1,
              clearcoatRoughness: 0.8,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        this.brainGroup.add(model);
        this.mesh = this.brainGroup;
        
        // Create labels for brain regions
        if (brainConfig.showLabels) {
          this.createBrainLabels(brainConfig.regions);
        }
      },
      (progress) => {
        // Loading progress (handle case where total is 0 or undefined)
        if (progress.total && progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading brain model: ${percent.toFixed(1)}%`);
        }
      },
      (error) => {
        // Check if this callback is stale
        if (currentVersion !== this.loadingVersion) {
          return;
        }
        console.error('Error loading brain model:', error);
        // Create a fallback brain-like shape if model fails to load
        this.createFallbackBrain();
      }
    );
  }

  createFallbackBrain() {
    // Create an anatomically-shaped brain based on "The Human Brain Book" by Rita Carter
    // Real brain proportions: ~15cm long, ~14cm wide, ~11cm tall
    const brainConfig = this.config.geometry.brain;
    const scale = brainConfig.scale;
    
    // Anatomical color palette
    const cortexColor = 0xd4a59a;      // Grayish-pink cerebral cortex
    const gyrusColor = 0xc99585;       // Slightly darker for gyri depth
    const sulcusColor = 0xa07868;      // Darker for sulci (grooves)
    const whiteMatteColor = 0xf5f0e8;  // White matter
    const cerebellumColor = 0xc9a898;  // Cerebellum
    const brainstemColor = 0xd4b0a0;   // Brainstem
    
    // Main cortex material
    const cortexMaterial = new THREE.MeshPhysicalMaterial({
      color: cortexColor,
      metalness: 0.0,
      roughness: 0.8,
      clearcoat: 0.03,
    });
    
    // === CEREBRAL HEMISPHERES (elongated, not spherical) ===
    // Real brain shape: narrower at front (frontal pole), wider in middle, tapered at back
    
    // Helper function to create hemisphere with proper brain shape
    const createHemisphere = (isLeft) => {
      const side = isLeft ? -1 : 1;
      const hemiGroup = new THREE.Group();
      
      // Main hemisphere body - elongated ellipsoid
      const mainGeom = new THREE.SphereGeometry(scale * 0.42, 48, 48, 0, Math.PI);
      const mainHemi = new THREE.Mesh(mainGeom, cortexMaterial);
      mainHemi.rotation.y = side * Math.PI / 2;
      // Scale: wider (x), shorter height (y), longer front-to-back (z)
      mainHemi.scale.set(0.95, 0.72, 1.25);
      mainHemi.position.x = side * scale * 0.015;
      hemiGroup.add(mainHemi);
      
      // Frontal lobe bulge (tapered, not round)
      const frontalGeom = new THREE.SphereGeometry(scale * 0.22, 32, 32);
      const frontal = new THREE.Mesh(frontalGeom, cortexMaterial);
      frontal.position.set(side * scale * 0.08, scale * 0.02, scale * 0.4);
      frontal.scale.set(0.7, 0.65, 0.9);
      hemiGroup.add(frontal);
      
      // Occipital lobe (back of brain, pointed)
      const occipitalGeom = new THREE.SphereGeometry(scale * 0.18, 32, 32);
      const occipital = new THREE.Mesh(occipitalGeom, cortexMaterial);
      occipital.position.set(side * scale * 0.06, scale * 0.05, -scale * 0.42);
      occipital.scale.set(0.75, 0.7, 0.8);
      hemiGroup.add(occipital);
      
      // Parietal bulge (top-back)
      const parietalGeom = new THREE.SphereGeometry(scale * 0.2, 32, 32);
      const parietal = new THREE.Mesh(parietalGeom, cortexMaterial);
      parietal.position.set(side * scale * 0.1, scale * 0.22, -scale * 0.1);
      parietal.scale.set(0.85, 0.6, 0.9);
      hemiGroup.add(parietal);
      
      return hemiGroup;
    };
    
    this.brainGroup.add(createHemisphere(true));  // Left
    this.brainGroup.add(createHemisphere(false)); // Right
    
    // === GYRI (ridges/bumps on surface) ===
    const gyrusMaterial = new THREE.MeshPhysicalMaterial({
      color: gyrusColor,
      metalness: 0.0,
      roughness: 0.85,
    });
    
    // Add gyri bumps across the surface to simulate folded cortex
    const gyriPositions = [
      // Frontal gyri (both sides)
      { x: -0.18, y: 0.18, z: 0.28, sx: 0.08, sy: 0.04, sz: 0.12 },
      { x: 0.18, y: 0.18, z: 0.28, sx: 0.08, sy: 0.04, sz: 0.12 },
      { x: -0.22, y: 0.12, z: 0.18, sx: 0.06, sy: 0.035, sz: 0.1 },
      { x: 0.22, y: 0.12, z: 0.18, sx: 0.06, sy: 0.035, sz: 0.1 },
      { x: -0.12, y: 0.24, z: 0.15, sx: 0.07, sy: 0.03, sz: 0.11 },
      { x: 0.12, y: 0.24, z: 0.15, sx: 0.07, sy: 0.03, sz: 0.11 },
      // Parietal gyri
      { x: -0.15, y: 0.28, z: -0.05, sx: 0.09, sy: 0.035, sz: 0.1 },
      { x: 0.15, y: 0.28, z: -0.05, sx: 0.09, sy: 0.035, sz: 0.1 },
      { x: -0.2, y: 0.22, z: -0.15, sx: 0.07, sy: 0.03, sz: 0.09 },
      { x: 0.2, y: 0.22, z: -0.15, sx: 0.07, sy: 0.03, sz: 0.09 },
      // Occipital gyri
      { x: -0.1, y: 0.15, z: -0.35, sx: 0.06, sy: 0.03, sz: 0.07 },
      { x: 0.1, y: 0.15, z: -0.35, sx: 0.06, sy: 0.03, sz: 0.07 },
      // Superior frontal gyrus (along top)
      { x: -0.08, y: 0.3, z: 0.1, sx: 0.05, sy: 0.025, sz: 0.18 },
      { x: 0.08, y: 0.3, z: 0.1, sx: 0.05, sy: 0.025, sz: 0.18 },
    ];
    
    gyriPositions.forEach((g) => {
      const gyrus = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.1, 16, 16),
        gyrusMaterial
      );
      gyrus.position.set(g.x * scale, g.y * scale, g.z * scale);
      gyrus.scale.set(g.sx * 10, g.sy * 10, g.sz * 10);
      this.brainGroup.add(gyrus);
    });
    
    // === SULCI (major grooves/fissures) ===
    const sulcusMaterial = new THREE.MeshPhysicalMaterial({
      color: sulcusColor,
      metalness: 0.0,
      roughness: 0.95,
    });
    
    // Longitudinal fissure (between hemispheres)
    const longFissure = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 0.012, scale * 0.35, scale * 0.95),
      sulcusMaterial
    );
    longFissure.position.set(0, scale * 0.1, -scale * 0.05);
    this.brainGroup.add(longFissure);
    
    // Central sulcus (between frontal and parietal lobes) - curved
    [-1, 1].forEach((side) => {
      const centralSulcus = new THREE.Mesh(
        new THREE.BoxGeometry(scale * 0.18, scale * 0.012, scale * 0.02),
        sulcusMaterial
      );
      centralSulcus.position.set(side * scale * 0.12, scale * 0.26, scale * 0.02);
      centralSulcus.rotation.z = side * 0.4;
      centralSulcus.rotation.y = side * 0.2;
      this.brainGroup.add(centralSulcus);
    });
    
    // Lateral (Sylvian) fissure - separates temporal from frontal/parietal
    [-1, 1].forEach((side) => {
      const sylvianFissure = new THREE.Mesh(
        new THREE.BoxGeometry(scale * 0.25, scale * 0.012, scale * 0.02),
        sulcusMaterial
      );
      sylvianFissure.position.set(side * scale * 0.28, scale * 0.0, scale * 0.1);
      sylvianFissure.rotation.z = side * -0.3;
      sylvianFissure.rotation.y = side * 0.25;
      this.brainGroup.add(sylvianFissure);
    });
    
    // Parieto-occipital sulcus
    [-1, 1].forEach((side) => {
      const poSulcus = new THREE.Mesh(
        new THREE.BoxGeometry(scale * 0.12, scale * 0.01, scale * 0.015),
        sulcusMaterial
      );
      poSulcus.position.set(side * scale * 0.08, scale * 0.18, -scale * 0.28);
      poSulcus.rotation.x = -0.5;
      this.brainGroup.add(poSulcus);
    });
    
    // === TEMPORAL LOBES (protruding sides, elongated) ===
    [-1, 1].forEach((side) => {
      const temporal = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.16, 32, 32),
        cortexMaterial
      );
      temporal.position.set(side * scale * 0.36, -scale * 0.1, scale * 0.18);
      temporal.scale.set(0.55, 0.6, 1.1); // Elongated front-to-back
      this.brainGroup.add(temporal);
      
      // Temporal pole (front tip)
      const tempPole = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.08, 24, 24),
        cortexMaterial
      );
      tempPole.position.set(side * scale * 0.32, -scale * 0.12, scale * 0.32);
      tempPole.scale.set(0.6, 0.7, 0.8);
      this.brainGroup.add(tempPole);
    });
    
    // === CEREBELLUM (smaller, at back-bottom, with folia texture) ===
    const cerebellumMaterial = new THREE.MeshPhysicalMaterial({
      color: cerebellumColor,
      metalness: 0.0,
      roughness: 0.85,
    });
    
    // Main cerebellum body
    const cerebellum = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.18, 32, 32),
      cerebellumMaterial
    );
    cerebellum.position.set(0, -scale * 0.22, -scale * 0.38);
    cerebellum.scale.set(1.6, 0.6, 0.85);
    this.brainGroup.add(cerebellum);
    
    // Cerebellar hemispheres (bilateral bulges)
    [-1, 1].forEach((side) => {
      const cerebHemi = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.1, 24, 24),
        cerebellumMaterial
      );
      cerebHemi.position.set(side * scale * 0.14, -scale * 0.2, -scale * 0.35);
      cerebHemi.scale.set(1.0, 0.65, 0.8);
      this.brainGroup.add(cerebHemi);
    });
    
    // Cerebellar folia (horizontal ridges)
    const foliaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xa08070,
      metalness: 0.0,
      roughness: 0.9,
    });
    
    for (let i = 0; i < 5; i++) {
      const folia = new THREE.Mesh(
        new THREE.TorusGeometry(scale * 0.14, scale * 0.005, 6, 20, Math.PI),
        foliaMaterial
      );
      folia.position.set(0, -scale * 0.18 - i * scale * 0.022, -scale * 0.38);
      folia.rotation.x = Math.PI / 2;
      folia.scale.set(1.5, 1, 0.7);
      this.brainGroup.add(folia);
    }
    
    // === BRAINSTEM (midbrain, pons, medulla) ===
    const brainstemMaterial = new THREE.MeshPhysicalMaterial({
      color: brainstemColor,
      metalness: 0.0,
      roughness: 0.8,
    });
    
    // Midbrain
    const midbrain = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.045, scale * 0.05, scale * 0.06, 16),
      brainstemMaterial
    );
    midbrain.position.set(0, -scale * 0.28, -scale * 0.12);
    midbrain.rotation.x = 0.15;
    this.brainGroup.add(midbrain);
    
    // Pons (bulge)
    const pons = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.06, 24, 24),
      brainstemMaterial
    );
    pons.position.set(0, -scale * 0.34, -scale * 0.1);
    pons.scale.set(1.1, 0.6, 1.0);
    this.brainGroup.add(pons);
    
    // Medulla oblongata (tapers down)
    const medulla = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.028, scale * 0.04, scale * 0.14, 16),
      brainstemMaterial
    );
    medulla.position.set(0, -scale * 0.44, -scale * 0.08);
    medulla.rotation.x = 0.12;
    this.brainGroup.add(medulla);
    
    // === CORPUS CALLOSUM (white matter bridge, visible in midline) ===
    const corpusCallosum = new THREE.Mesh(
      new THREE.TorusGeometry(scale * 0.16, scale * 0.025, 12, 24, Math.PI),
      new THREE.MeshPhysicalMaterial({
        color: whiteMatteColor,
        metalness: 0.0,
        roughness: 0.5,
      })
    );
    corpusCallosum.position.set(0, scale * 0.05, -scale * 0.02);
    corpusCallosum.rotation.y = Math.PI / 2;
    corpusCallosum.rotation.x = Math.PI;
    corpusCallosum.scale.set(0.7, 1, 1.2);
    this.brainGroup.add(corpusCallosum);
    
    // === DEEP STRUCTURES (semi-transparent, internal) ===
    const deepMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd49888,
      metalness: 0.0,
      roughness: 0.7,
      transparent: true,
      opacity: 0.4,
    });
    
    // Thalamus (egg-shaped relay station)
    const thalamus = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.06, 20, 20),
      deepMaterial
    );
    thalamus.position.set(0, -scale * 0.06, -scale * 0.02);
    thalamus.scale.set(1.3, 0.85, 1.0);
    this.brainGroup.add(thalamus);
    
    // Hypothalamus (small, below thalamus)
    const hypothalamus = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.025, 16, 16),
      deepMaterial
    );
    hypothalamus.position.set(0, -scale * 0.14, scale * 0.04);
    this.brainGroup.add(hypothalamus);
    
    // Hippocampus (bilateral, seahorse-shaped)
    const hippoMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a090,
      metalness: 0.0,
      roughness: 0.7,
      transparent: true,
      opacity: 0.45,
    });
    
    [-1, 1].forEach((side) => {
      const hippo = new THREE.Mesh(
        new THREE.CapsuleGeometry(scale * 0.018, scale * 0.07, 6, 12),
        hippoMaterial
      );
      hippo.position.set(side * scale * 0.1, -scale * 0.12, scale * 0.02);
      hippo.rotation.z = side * 0.4;
      hippo.rotation.y = side * 0.25;
      this.brainGroup.add(hippo);
    });
    
    // Amygdala (bilateral, almond-shaped)
    [-1, 1].forEach((side) => {
      const amygdala = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.02, 12, 12),
        hippoMaterial
      );
      amygdala.position.set(side * scale * 0.14, -scale * 0.1, scale * 0.1);
      amygdala.scale.set(0.7, 1.0, 0.8);
      this.brainGroup.add(amygdala);
    });
    
    this.mesh = this.brainGroup;
    
    // Create labels
    if (brainConfig.showLabels) {
      this.createBrainLabels(brainConfig.regions);
    }
    
    console.log('Displaying anatomical brain model');
  }

  createBrainLabels(regions) {
    // Initialize CSS2D renderer if not already done
    if (!this.labelRenderer) {
      this.labelRenderer = new CSS2DRenderer();
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
      this.labelRenderer.domElement.style.position = 'absolute';
      this.labelRenderer.domElement.style.top = '0';
      this.labelRenderer.domElement.style.left = '0';
      this.labelRenderer.domElement.style.pointerEvents = 'none';
      
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(this.labelRenderer.domElement);
      } else {
        document.body.appendChild(this.labelRenderer.domElement);
      }
    }
    
    // Create labels for each brain region
    regions.forEach((region) => {
      // Create label element
      const labelDiv = document.createElement('div');
      labelDiv.className = 'brain-label';
      labelDiv.innerHTML = `
        <span class="brain-label-name">${region.name}</span>
        <span class="brain-label-desc">${region.description}</span>
      `;
      
      // Create CSS2D object
      const label = new CSS2DObject(labelDiv);
      label.position.set(
        region.position.x,
        region.position.y,
        region.position.z
      );
      
      this.brainGroup.add(label);
      this.labels.push(label);
      
      // Create a small sphere marker on the brain surface
      const markerGeometry = new THREE.SphereGeometry(5, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00cccc,
        transparent: true,
        opacity: 0.85,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      // Position marker at ~25% toward label (on brain surface)
      const markerPos = {
        x: region.position.x * 0.25,
        y: region.position.y * 0.25,
        z: region.position.z * 0.25
      };
      marker.position.set(markerPos.x, markerPos.y, markerPos.z);
      this.brainGroup.add(marker);
      
      // Create a thin line from marker to label
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(markerPos.x, markerPos.y, markerPos.z),
        new THREE.Vector3(region.position.x, region.position.y, region.position.z)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00aaaa,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      this.brainGroup.add(line);
    });
  }

  createLights() {
    if (!this.config.lighting.enabled) return;

    // Ambient light
    if (this.config.lighting.ambient.enabled) {
      const { color, intensity } = this.config.lighting.ambient;
      const light = new THREE.AmbientLight(color, intensity);
      this.scene.add(light);
      this.lights.push(light);
    }

    // Directional light
    if (this.config.lighting.directional.enabled) {
      const { color, intensity, position, castShadow } =
        this.config.lighting.directional;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(position.x, position.y, position.z);
      light.castShadow = castShadow;
      this.scene.add(light);
      this.lights.push(light);
    }

    // Hemisphere light
    if (this.config.lighting.hemisphere.enabled) {
      const { skyColor, groundColor, intensity, position } =
        this.config.lighting.hemisphere;
      const light = new THREE.HemisphereLight(
        skyColor,
        groundColor,
        intensity
      );
      light.position.set(position.x, position.y, position.z);
      this.scene.add(light);
      this.lights.push(light);
    }

    // Point light
    if (this.config.lighting.point.enabled) {
      const { color, intensity, distance, decay, position, castShadow } =
        this.config.lighting.point;
      const light = new THREE.PointLight(color, intensity, distance, decay);
      light.position.set(position.x, position.y, position.z);
      light.castShadow = castShadow;
      this.scene.add(light);
      this.lights.push(light);
    }

    // Spot light
    if (this.config.lighting.spot.enabled) {
      const { color, intensity, distance, angle, penumbra, decay, position, target, castShadow, shadow } =
        this.config.lighting.spot;
      const light = new THREE.SpotLight(
        color,
        intensity,
        distance,
        angle,
        penumbra,
        decay
      );
      light.position.set(position.x, position.y, position.z);
      light.target.position.set(target.x, target.y, target.z);
      light.castShadow = castShadow;

      if (castShadow) {
        light.shadow.mapSize.width = shadow.mapSize.width;
        light.shadow.mapSize.height = shadow.mapSize.height;
        light.shadow.camera.near = shadow.camera.near;
        light.shadow.camera.far = shadow.camera.far;
        light.shadow.camera.fov = shadow.camera.fov;
      }

      this.scene.add(light);
      this.scene.add(light.target);
      this.lights.push(light);
    }
  }

  createRenderer() {
    if (!this.config.renderer.enabled) return;

    const { antialias, alpha, clearColor, pixelRatio, shadowMap, toneMapping, toneMappingExposure } =
      this.config.renderer;

    this.renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
    });

    this.renderer.setClearColor(clearColor, alpha ? 0 : 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const pixelRatioValue =
      pixelRatio === 'auto' ? window.devicePixelRatio : pixelRatio;
    this.renderer.setPixelRatio(pixelRatioValue);

    // Shadow map
    if (shadowMap.enabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this.getShadowMapType(shadowMap.type);
    }

    // Tone mapping
    this.renderer.toneMapping = this.getToneMapping(toneMapping);
    this.renderer.toneMappingExposure = toneMappingExposure;

    // Append to DOM
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }
  }

  getShadowMapType(type) {
    switch (type) {
      case 'pcf':
        return THREE.PCFShadowMap;
      case 'pcfSoft':
        return THREE.PCFSoftShadowMap;
      case 'vsm':
        return THREE.VSMShadowMap;
      case 'basic':
      default:
        return THREE.BasicShadowMap;
    }
  }

  getToneMapping(type) {
    switch (type) {
      case 'linear':
        return THREE.LinearToneMapping;
      case 'reinhard':
        return THREE.ReinhardToneMapping;
      case 'cineon':
        return THREE.CineonToneMapping;
      case 'aces':
        return THREE.ACESFilmicToneMapping;
      case 'neutral':
        return THREE.NeutralToneMapping;
      default:
        return THREE.ACESFilmicToneMapping;
    }
  }

  animate() {
    if (!this.config.animation.enabled) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.config.animation.autoRotate && this.mesh) {
      const { x, y, z } = this.config.animation.rotation;
      const speed = this.config.animation.speed;
      this.mesh.rotation.x += x * speed;
      this.mesh.rotation.y += y * speed;
      this.mesh.rotation.z += z * speed;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      
      // Render CSS2D labels if present
      if (this.labelRenderer) {
        this.labelRenderer.render(this.scene, this.camera);
      }
    }
  }

  handleResize() {
    this.resizeHandler = () => {
      if (this.camera && this.renderer) {
        // Check if it's a perspective camera (has fov property) or orthographic
        if (this.camera.fov !== undefined) {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
        } else if (this.camera.left !== undefined) {
          const aspect = window.innerWidth / window.innerHeight;
          const { left, right, top, bottom } =
            this.config.camera.orthographic;
          const width = Math.abs(right - left) || window.innerWidth / 2;
          const height = Math.abs(top - bottom) || window.innerHeight / 2;
          this.camera.left = -width * aspect;
          this.camera.right = width * aspect;
          this.camera.top = height;
          this.camera.bottom = -height;
          this.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Resize CSS2D renderer if present
        if (this.labelRenderer) {
          this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }
      }
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    // Dispose lights
    this.lights.forEach((light) => {
      if (light.dispose) {
        light.dispose();
      }
    });

    // Dispose mesh
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach((mat) => mat.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }

    // Dispose brain group and labels
    if (this.brainGroup) {
      this.brainGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Remove CSS2D labels
    this.labels.forEach((label) => {
      if (label.element && label.element.parentNode) {
        label.element.parentNode.removeChild(label.element);
      }
    });
    this.labels = [];

    // Dispose label renderer
    if (this.labelRenderer && this.labelRenderer.domElement.parentNode) {
      this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement);
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // Public method to update configuration at runtime
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.dispose();
    this.init();
    if (this.config.animation.enabled) {
      this.animate();
    }
  }
}

export { ThreeJSScene };

if (typeof window !== 'undefined' && !import.meta.env?.TEST) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ThreeJSScene();
    });
  } else {
    new ThreeJSScene();
  }
}
