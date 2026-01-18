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
    
    // Create a group to hold the brain model and labels
    this.brainGroup = new THREE.Group();
    this.scene.add(this.brainGroup);
    
    // Load the GLTF brain model
    this.gltfLoader.load(
      brainConfig.modelUrl,
      (gltf) => {
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
        
        // Apply a material to make the brain look realistic
        model.traverse((child) => {
          if (child.isMesh) {
            // Create a semi-transparent brain material
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xffb6c1,  // Light pink brain color
              metalness: 0.0,
              roughness: 0.7,
              transparent: true,
              opacity: 0.9,
              side: THREE.DoubleSide,
              clearcoat: 0.3,
              clearcoatRoughness: 0.4,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        this.brainGroup.add(model);
        this.mesh = this.brainGroup;
        
        // Create labels for brain regions
        if (brainConfig.showLabels) {
          this.createBrainLabels(brainConfig.regions, scale);
        }
      },
      (progress) => {
        // Loading progress
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading brain model: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error('Error loading brain model:', error);
        // Create a fallback brain-like shape if model fails to load
        this.createFallbackBrain();
      }
    );
  }

  createFallbackBrain() {
    // Create a stylized brain using basic geometries as fallback
    const brainConfig = this.config.geometry.brain;
    const scale = brainConfig.scale;
    
    // Main brain shape (two hemispheres)
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffb6c1,
      metalness: 0.0,
      roughness: 0.7,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.3,
    });
    
    // Left hemisphere
    const leftHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.45, 32, 32, 0, Math.PI),
      brainMaterial
    );
    leftHemisphere.position.x = -scale * 0.05;
    leftHemisphere.rotation.y = Math.PI / 2;
    this.brainGroup.add(leftHemisphere);
    
    // Right hemisphere
    const rightHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.45, 32, 32, 0, Math.PI),
      brainMaterial
    );
    rightHemisphere.position.x = scale * 0.05;
    rightHemisphere.rotation.y = -Math.PI / 2;
    this.brainGroup.add(rightHemisphere);
    
    // Cerebellum
    const cerebellum = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.25, 32, 32),
      brainMaterial
    );
    cerebellum.position.set(0, -scale * 0.35, -scale * 0.25);
    cerebellum.scale.set(1.2, 0.8, 1);
    this.brainGroup.add(cerebellum);
    
    // Brainstem
    const brainstem = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.08, scale * 0.1, scale * 0.3, 16),
      brainMaterial
    );
    brainstem.position.set(0, -scale * 0.55, 0);
    this.brainGroup.add(brainstem);
    
    // Add wrinkle texture effect using displacement
    const wrinkleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8a0a8,
      metalness: 0.0,
      roughness: 0.9,
      transparent: true,
      opacity: 0.5,
    });
    
    // Add surface detail with smaller bumps
    for (let i = 0; i < 20; i++) {
      const bump = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 0.08, 8, 8),
        wrinkleMaterial
      );
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2;
      const r = scale * 0.42;
      bump.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      this.brainGroup.add(bump);
    }
    
    this.mesh = this.brainGroup;
    
    // Create labels
    if (brainConfig.showLabels) {
      this.createBrainLabels(brainConfig.regions, 1);
    }
    
    console.log('Using fallback brain geometry (model not found)');
  }

  createBrainLabels(regions, modelScale = 1) {
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
      
      // Create a small sphere marker at each region
      const markerGeometry = new THREE.SphereGeometry(3, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(
        region.position.x,
        region.position.y,
        region.position.z
      );
      this.brainGroup.add(marker);
      
      // Create a line from marker to label
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(region.position.x, region.position.y, region.position.z),
        new THREE.Vector3(
          region.position.x + (region.position.x > 0 ? 20 : -20),
          region.position.y + 15,
          region.position.z
        )
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
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
