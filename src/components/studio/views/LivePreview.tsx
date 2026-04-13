'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Maximize2, Eye } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface LivePreviewProps {
  /** Array of GLB URLs to load into the scene */
  assetUrls?: string[];
  /** Called when the scene is ready */
  onReady?: () => void;
}

export function LivePreview({ assetUrls = [], onReady }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    animId: number;
    loaded: Map<string, THREE.Object3D>;
  } | null>(null);
  const [modelCount, setModelCount] = useState(0);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87c3ed);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.5, 0);
    controls.update();

    // Lighting
    const ambient = new THREE.AmbientLight(0x9aa5b0, 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 10, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    scene.add(sun);

    // Grid helper
    const grid = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    grid.name = '__grid';
    scene.add(grid);

    function animate() {
      const id = requestAnimationFrame(animate);
      sceneRef.current!.animId = id;
      controls.update();
      renderer.render(scene, camera);
    }

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      animId: 0,
      loaded: new Map(),
    };

    animate();
    onReady?.();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onReady]);

  // Load GLB assets
  const loadAssets = useCallback(() => {
    if (!sceneRef.current) return;
    const { scene, loaded } = sceneRef.current;
    const loader = new GLTFLoader();

    // Clear old models
    loaded.forEach((obj) => scene.remove(obj));
    loaded.clear();

    let count = 0;
    assetUrls.forEach((url, i) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          // Space models along x-axis if multiple
          model.position.set(i * 3, 0, 0);
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(model);
          loaded.set(url, model);
          count++;
          setModelCount(count);

          // Hide grid when models loaded
          const grid = scene.getObjectByName('__grid');
          if (grid) grid.visible = false;
        },
        undefined,
        (err) => console.warn(`Failed to load ${url}:`, err)
      );
    });

    if (assetUrls.length === 0) {
      setModelCount(0);
      const grid = scene.getObjectByName('__grid');
      if (grid) grid.visible = true;
    }
  }, [assetUrls]);

  useEffect(() => {
    const cleanup = initScene();
    return () => {
      cleanup?.();
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.renderer.dispose();
        const canvas = sceneRef.current.renderer.domElement;
        canvas.parentNode?.removeChild(canvas);
        sceneRef.current = null;
      }
    };
  }, [initScene]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  function resetCamera() {
    if (!sceneRef.current) return;
    const { camera, controls } = sceneRef.current;
    camera.position.set(5, 6, 8);
    controls.target.set(0, 0.5, 0);
    controls.update();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05] shrink-0">
        <span className="text-[10px] text-zinc-500">
          3D Preview — {modelCount} model{modelCount !== 1 ? 's' : ''} loaded
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={loadAssets}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reload assets"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={resetCamera}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset camera"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
