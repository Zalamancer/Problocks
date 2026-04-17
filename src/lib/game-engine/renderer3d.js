/**
 * Problocks 3D Renderer
 * Sets up Three.js scene, camera, lights, and provides helpers.
 * Uses Three.js r128 loaded via CDN (available as global `THREE`).
 */
export function setup3dRenderer(game) {
  const { canvas, config } = game;

  // Quality tier passed in via config (injected by host). Missing fields fall
  // back to the original "high" defaults so existing games keep their look.
  const q = config.quality || {};
  const wantShadows = q.shadows !== false;
  const shadowType = q.shadowType === 'basic' ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
  const shadowMapSize = q.shadowMapSize ?? 2048;

  // Create Three.js renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias !== false });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.maxPixelRatio ?? 2));
  renderer.shadowMap.enabled = wantShadows;
  renderer.shadowMap.type = shadowType;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.skyColor || '#87ceeb');
  scene.fog = new THREE.FogExp2(config.fogColor || config.skyColor || '#87ceeb', config.fogDensity || 0.015);

  // Camera
  const camera = new THREE.PerspectiveCamera(65, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
  camera.position.set(0, 8, 12);

  // Lights
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3a5a3a, 0.6);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0x404060, 0.3);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffeedd, 1.0);
  sun.position.set(30, 50, 20);
  sun.castShadow = wantShadows;
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  scene.add(sun);

  // Ground plane
  if (config.ground !== false) {
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: config.groundColor || 0x4a7a4a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = wantShadows;
    scene.add(ground);
  }

  // Store on game.three
  game.three.scene = scene;
  game.three.camera = camera;
  game.three.renderer = renderer;
  game.three.sun = sun;

  // Camera control state
  game.three.camYaw = 0;
  game.three.camPitch = -0.3;
  game.three.camDistance = config.camDistance || 10;
  game.three.camHeight = config.camHeight || 5;
  game.three.camTarget = new THREE.Vector3(0, 0, 0);

  // Helper: follow an entity with third-person camera
  game.three.followEntity = function(entity) {
    game.three._followTarget = entity;
  };

  // Helper: create a mesh group and add to scene
  game.three.addToScene = function(object) {
    scene.add(object);
    return object;
  };

  // Helper: remove from scene
  game.three.removeFromScene = function(object) {
    scene.remove(object);
  };

  // Called by engine each frame
  game.three._update = function(dt) {
    // Mouse look (when pointer locked)
    if (game.input.mouse.locked) {
      game.three.camYaw += game.input.mouse.dx * 0.003;
      game.three.camPitch = Math.max(-0.8, Math.min(0.4, game.three.camPitch + game.input.mouse.dy * 0.003));
    }

    // Follow target
    const target = game.three._followTarget;
    if (target && target._alive) {
      game.three.camTarget.set(target.x, target.y || 0, target.z || 0);
    }

    // Position camera
    const t = game.three.camTarget;
    const dist = game.three.camDistance;
    const height = game.three.camHeight;
    camera.position.set(
      t.x - Math.sin(game.three.camYaw) * dist,
      t.y + height - game.three.camPitch * 3,
      t.z - Math.cos(game.three.camYaw) * dist,
    );
    camera.lookAt(t.x, t.y + 1.5, t.z);

    // Move sun with camera
    sun.position.set(t.x + 30, 50, t.z + 20);
    sun.target.position.copy(t);
    sun.target.updateMatrixWorld();
  };

  // Resize handler
  game.three._resize = function() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
}
