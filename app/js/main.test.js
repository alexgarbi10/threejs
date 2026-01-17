import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockScene = {
  add: vi.fn(),
};

const mockCamera = {
  position: { z: 0 },
  aspect: 1,
  updateProjectionMatrix: vi.fn(),
};

const mockRenderer = {
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  render: vi.fn(),
  domElement: document.createElement('canvas'),
  dispose: vi.fn(),
};

const mockTorusMesh = {
  rotation: { x: 0, y: 0 },
};

const mockLight = {
  castShadow: false,
  shadow: {
    mapSize: { width: 0, height: 0 },
    camera: { near: 0, far: 0, fov: 0 },
  },
};

const mockTexture = {};

const mockTextureLoader = {
  load: vi.fn().mockReturnValue(mockTexture),
};

vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    Scene: vi.fn().mockImplementation(() => mockScene),
    PerspectiveCamera: vi.fn().mockImplementation(() => mockCamera),
    WebGLRenderer: vi.fn().mockImplementation(() => mockRenderer),
    TorusKnotGeometry: vi.fn(),
    MeshBasicMaterial: vi.fn(),
    Mesh: vi.fn().mockImplementation(() => mockTorusMesh),
    SpotLight: vi.fn().mockImplementation(() => mockLight),
    TextureLoader: vi.fn().mockImplementation(() => mockTextureLoader),
  };
});

import { ThreeJSScene } from './main.js';
import * as THREE from 'three';

describe('ThreeJSScene', () => {
  let sceneInstance;
  let mockRequestAnimationFrame;
  let mockCancelAnimationFrame;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });


    let frameId = 0;
    mockRequestAnimationFrame = vi.fn((cb) => {
      frameId++;
      return frameId;
    });

    global.requestAnimationFrame = mockRequestAnimationFrame;

    mockCancelAnimationFrame = vi.fn();
    global.cancelAnimationFrame = mockCancelAnimationFrame;


    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    vi.clearAllMocks();
    mockTorusMesh.rotation.x = 0;
    mockTorusMesh.rotation.y = 0;
    mockScene.add.mockClear();
    mockCamera.updateProjectionMatrix.mockClear();
    mockRenderer.setSize.mockClear();
    mockRenderer.setPixelRatio.mockClear();
    mockRenderer.render.mockClear();
    mockTextureLoader.load.mockClear();
  });

  afterEach(() => {
    if (sceneInstance) {
      sceneInstance.dispose();
      sceneInstance = null;
    }
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create a ThreeJSScene instance', () => {
      sceneInstance = new ThreeJSScene();
      expect(sceneInstance).toBeInstanceOf(ThreeJSScene);
    });

    it('should initialize all properties', () => {
      sceneInstance = new ThreeJSScene();
      expect(sceneInstance.scene).toBeDefined();
      expect(sceneInstance.camera).toBeDefined();
      expect(sceneInstance.renderer).toBeDefined();
      expect(sceneInstance.light).toBeDefined();
      expect(sceneInstance.torusMesh).toBeDefined();
    });

    it('should create a Three.js Scene', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.Scene).toHaveBeenCalled();
      expect(sceneInstance.scene).toBe(mockScene);
    });

    it('should create a PerspectiveCamera with correct parameters', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.PerspectiveCamera).toHaveBeenCalledWith(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
    });

    it('should set camera position z to 1000', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockCamera.position.z).toBe(1000);
    });

    it('should create a WebGLRenderer with antialias', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.WebGLRenderer).toHaveBeenCalledWith({ antialias: true });
    });

    it('should set renderer size to window dimensions', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockRenderer.setSize).toHaveBeenCalledWith(
        window.innerWidth,
        window.innerHeight
      );
    });

    it('should set renderer pixel ratio', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockRenderer.setPixelRatio).toHaveBeenCalledWith(
        window.devicePixelRatio
      );
    });

    it('should append renderer canvas to app div', () => {
      sceneInstance = new ThreeJSScene();
      const app = document.getElementById('app');
      expect(app.contains(mockRenderer.domElement)).toBe(true);
    });

    it('should append renderer canvas to body if app div does not exist', () => {
      document.body.innerHTML = '';
      sceneInstance = new ThreeJSScene();
      expect(document.body.contains(mockRenderer.domElement)).toBe(true);
    });
  });

  describe('Mesh Creation', () => {
    it('should create a TorusKnotGeometry with correct parameters', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.TorusKnotGeometry).toHaveBeenCalledWith(200, 60, 100, 16);
    });

    it('should create a MeshBasicMaterial with texture', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.MeshBasicMaterial).toHaveBeenCalledWith({
        map: mockTexture,
      });
    });

    it('should create a Mesh from geometry and material', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.Mesh).toHaveBeenCalled();
    });

    it('should add mesh to the scene', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockScene.add).toHaveBeenCalledWith(mockTorusMesh);
    });
  });

  describe('Texture Loading', () => {
    it('should create a TextureLoader', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.TextureLoader).toHaveBeenCalled();
    });

    it('should load texture from URL', () => {
      const textureURL =
        'https://images.pexels.com/photos/235994/pexels-photo-235994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
      sceneInstance = new ThreeJSScene();
      expect(mockTextureLoader.load).toHaveBeenCalledWith(textureURL);
    });
  });

  describe('Lighting', () => {
    it('should create a SpotLight with white color', () => {
      sceneInstance = new ThreeJSScene();
      expect(THREE.SpotLight).toHaveBeenCalledWith(0xffffff);
    });

    it('should enable shadow casting on light', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockLight.castShadow).toBe(true);
    });

    it('should configure shadow map size', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockLight.shadow.mapSize.width).toBe(1024);
      expect(mockLight.shadow.mapSize.height).toBe(1024);
    });

    it('should configure shadow camera properties', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockLight.shadow.camera.near).toBe(500);
      expect(mockLight.shadow.camera.far).toBe(4000);
      expect(mockLight.shadow.camera.fov).toBe(30);
    });

    it('should add light to the scene', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockScene.add).toHaveBeenCalledWith(mockLight);
    });
  });

  describe('Animation', () => {
    it('should start animation loop on construction', () => {
      sceneInstance = new ThreeJSScene();
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should update mesh rotation in animation loop', () => {
      sceneInstance = new ThreeJSScene();
      const initialX = mockTorusMesh.rotation.x;
      const initialY = mockTorusMesh.rotation.y;

      // Simulate animation frame
      const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      animateCallback();

      expect(mockTorusMesh.rotation.x).toBe(initialX + 0.01);
      expect(mockTorusMesh.rotation.y).toBe(initialY + 0.01);
    });

    it('should call renderer.render in animation loop', () => {
      sceneInstance = new ThreeJSScene();
      const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      animateCallback();

      expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
    });

    it('should continue animation loop recursively', () => {
      sceneInstance = new ThreeJSScene();
      const firstCallback = mockRequestAnimationFrame.mock.calls[0][0];

      // First frame
      firstCallback();
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('should not update rotation if mesh is null', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.torusMesh = null;
      const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

      expect(() => animateCallback()).not.toThrow();
    });

    it('should not render if renderer, scene, or camera is null', () => {
      sceneInstance = new ThreeJSScene();
      const initialRenderCount = mockRenderer.render.mock.calls.length;
      sceneInstance.renderer = null;
      const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

      animateCallback();
      expect(mockRenderer.render).toHaveBeenCalledTimes(initialRenderCount);
    });
  });

  describe('Resize Handling', () => {
    it('should register resize event listener', () => {
      sceneInstance = new ThreeJSScene();
      expect(sceneInstance.resizeHandler).toBeDefined();
      expect(typeof sceneInstance.resizeHandler).toBe('function');
    });

    it('should update camera aspect on resize', () => {
      sceneInstance = new ThreeJSScene();
      window.innerWidth = 1600;
      window.innerHeight = 900;

      sceneInstance.resizeHandler();

      expect(mockCamera.aspect).toBe(1600 / 900);
      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    it('should update renderer size on resize', () => {
      sceneInstance = new ThreeJSScene();
      window.innerWidth = 1600;
      window.innerHeight = 900;

      sceneInstance.resizeHandler();

      expect(mockRenderer.setSize).toHaveBeenCalledWith(1600, 900);
    });

    it('should handle resize when camera is null', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.camera = null;
      window.innerWidth = 1600;
      window.innerHeight = 900;

      expect(() => sceneInstance.resizeHandler()).not.toThrow();
    });

    it('should handle resize when renderer is null', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.renderer = null;
      window.innerWidth = 1600;
      window.innerHeight = 900;

      expect(() => sceneInstance.resizeHandler()).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cancel animation frame on dispose', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.animationId = 123;
      sceneInstance.dispose();

      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    it('should dispose renderer on cleanup', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.dispose();

      expect(mockRenderer.dispose).toHaveBeenCalled();
    });

    it('should handle dispose when animationId is null', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.animationId = null;

      expect(() => sceneInstance.dispose()).not.toThrow();
    });

    it('should handle dispose when renderer is null', () => {
      sceneInstance = new ThreeJSScene();
      sceneInstance.renderer = null;

      expect(() => sceneInstance.dispose()).not.toThrow();
    });

    it('should remove resize event listener on dispose', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      sceneInstance = new ThreeJSScene();
      sceneInstance.dispose();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        sceneInstance.resizeHandler
      );
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should initialize all components in correct order', () => {
      sceneInstance = new ThreeJSScene();

      const sceneCallOrder = THREE.Scene.mock.invocationCallOrder[0];
      const cameraCallOrder = THREE.PerspectiveCamera.mock.invocationCallOrder[0];
      const rendererCallOrder = THREE.WebGLRenderer.mock.invocationCallOrder[0];
      const textureLoaderCallOrder =
        THREE.TextureLoader.mock.invocationCallOrder[0];
      const torusCallOrder = THREE.TorusKnotGeometry.mock.invocationCallOrder[0];

      expect(sceneCallOrder).toBeLessThan(cameraCallOrder);

      expect(cameraCallOrder).toBeLessThan(rendererCallOrder);

      expect(textureLoaderCallOrder).toBeLessThan(torusCallOrder);
    });

    it('should maintain animation state across multiple frames', () => {
      sceneInstance = new ThreeJSScene();
      const initialRotationX = mockTorusMesh.rotation.x;

      let callback = mockRequestAnimationFrame.mock.calls[0][0];
      for (let i = 0; i < 5; i++) {
        callback();
        callback = mockRequestAnimationFrame.mock.calls[i + 1][0];
      }

      expect(mockTorusMesh.rotation.x).toBe(initialRotationX + 0.05);
    });

    it('should handle full lifecycle: init, animate, resize, dispose', () => {
      sceneInstance = new ThreeJSScene();

      expect(sceneInstance.scene).toBeDefined();
      expect(sceneInstance.camera).toBeDefined();
      expect(sceneInstance.renderer).toBeDefined();

      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      expect(sceneInstance.resizeHandler).toBeDefined();

      window.innerWidth = 800;
      window.innerHeight = 600;
      sceneInstance.resizeHandler();
      expect(mockCamera.aspect).toBe(800 / 600);

      sceneInstance.dispose();
      expect(mockRenderer.dispose).toHaveBeenCalled();
    });
  });
});
