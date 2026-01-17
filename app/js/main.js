import * as THREE from 'three';
import sceneConfig from './config.js';

class ThreeJSScene {
  constructor(config = sceneConfig) {
    this.config = config;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = [];
    this.mesh = null;
    this.animationId = null;
    this.textureLoader = new THREE.TextureLoader();

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
