import * as THREE from 'three';

class ThreeJSScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.light = null;
    this.torusMesh = null;
    this.animationId = null;
    
    this.init();
    this.animate();
    this.handleResize();
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 1000;

    const textureURL = 'https://images.pexels.com/photos/235994/pexels-photo-235994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureURL);

    const torusGeometry = new THREE.TorusKnotGeometry(200, 60, 100, 16);
    const torusMaterial = new THREE.MeshBasicMaterial({ map: texture });
    this.torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    this.scene.add(this.torusMesh);

    this.light = new THREE.SpotLight(0xffffff);
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 30;
    this.scene.add(this.light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.torusMesh) {
      this.torusMesh.rotation.x += 0.01;
      this.torusMesh.rotation.y += 0.01;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  handleResize() {
    this.resizeHandler = () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
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
    
    if (this.renderer) {
      this.renderer.dispose();
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
