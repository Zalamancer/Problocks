/** Pre-built framework source — auto-generated, do not edit by hand. */
/** To regenerate: concatenate all engine modules, strip imports/exports */
export const FRAMEWORK_SOURCE = `
/**
 * Problocks UDim2 — responsive positioning primitives (Roblox-style).
 * scale * parent + offset. Exposed as globals for game scripts.
 */
function UDim(scale, offset) {
  return { _udim: true, scale: scale || 0, offset: offset || 0 };
}
function UDim2(xScale, xOffset, yScale, yOffset) {
  return {
    _udim2: true,
    x: UDim(xScale, xOffset),
    y: UDim(yScale, yOffset),
  };
}
function resolveUDim(v, parent) {
  if (typeof v === 'number') return v;
  if (v && v._udim) return v.scale * parent + v.offset;
  return 0;
}
const ANCHOR = {
  TopLeft: [0, 0], Top: [0.5, 0], TopRight: [1, 0],
  Left: [0, 0.5], Center: [0.5, 0.5], Right: [1, 0.5],
  BottomLeft: [0, 1], Bottom: [0.5, 1], BottomRight: [1, 1],
};

/**
 * Problocks Input System
 * Tracks keyboard, mouse, and touch state with frame-accurate "just pressed" detection.
 */
function createInput(canvas) {
  const keys = {};
  const prevKeys = {};
  const mouse = { x: 0, y: 0, dx: 0, dy: 0, buttons: 0, locked: false };
  let prevMouseButtons = 0;
  let _pointerLockRequested = false;

  function onKeyDown(e) { keys[e.code] = true; e.preventDefault(); }
  function onKeyUp(e) { keys[e.code] = false; }

  function onMouseMove(e) {
    if (document.pointerLockElement) {
      mouse.dx += e.movementX;
      mouse.dy += e.movementY;
      mouse.locked = true;
    } else {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.locked = false;
    }
  }

  function onMouseDown(e) {
    mouse.buttons |= (1 << e.button);
    if (_pointerLockRequested && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
    }
  }

  function onMouseUp(e) { mouse.buttons &= ~(1 << e.button); }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);

  return {
    mouse,

    /** True while key is held */
    isDown(code) { return !!keys[code]; },

    /** True only on the frame the key was first pressed */
    justPressed(code) { return !!keys[code] && !prevKeys[code]; },

    /** True only on the frame the key was released */
    justReleased(code) { return !keys[code] && !!prevKeys[code]; },

    /** True while mouse button is held (0=left, 1=middle, 2=right) */
    mouseDown(button = 0) { return !!(mouse.buttons & (1 << button)); },

    /** True only on the frame the mouse button was first pressed */
    mouseJustPressed(button = 0) {
      const mask = 1 << button;
      return !!(mouse.buttons & mask) && !(prevMouseButtons & mask);
    },

    /** True only on the frame the mouse button was released */
    mouseJustReleased(button = 0) {
      const mask = 1 << button;
      return !(mouse.buttons & mask) && !!(prevMouseButtons & mask);
    },

    /** Request pointer lock on next click (for FPS/3D games) */
    requestPointerLock() { _pointerLockRequested = true; },

    /** Called by engine at end of each frame */
    _endFrame() {
      Object.assign(prevKeys, keys);
      prevMouseButtons = mouse.buttons;
      mouse.dx = 0;
      mouse.dy = 0;
    },

    /** Cleanup */
    _destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
    },
  };
}
/**
 * Problocks Entity System
 * Manages spawning, destroying, and querying game entities.
 * Each entity is a plain object with a \`type\`, position, and lifecycle hooks.
 */
function createEntities() {
  let nextId = 1;
  const entities = [];
  const typeRegistry = {}; // type name → definition

  return {
    /** Register an entity type definition (from game scripts) */
    register(def) {
      if (!def.type) throw new Error('Entity definition must have a "type" field');
      typeRegistry[def.type] = def;
    },

    /** Spawn a new entity of a registered type */
    spawn(type, overrides = {}) {
      const def = typeRegistry[type];
      if (!def) throw new Error(\`Unknown entity type: "\${type}"\`);

      const entity = {
        _id: nextId++,
        _def: def,
        _alive: true,
        type,
        tags: [...(def.tags || [])],
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        width: def.width || 32,
        height: def.height || 32,
        depth: def.depth || 32,
        rotation: 0,
        visible: true,
        // Copy all definition properties (except lifecycle hooks and metadata)
        ...Object.fromEntries(
          Object.entries(def).filter(([k]) =>
            !['type', 'tags', 'init', 'update', 'onCollide', 'onDestroy', 'draw', 'setup3d'].includes(k)
          )
        ),
        // Apply spawn-time overrides
        ...overrides,

        /** Mark for removal at end of frame */
        destroy() { this._alive = false; },

        /** Check if entity has a tag */
        hasTag(tag) { return this.tags.includes(tag); },
      };

      entities.push(entity);

      // Call init lifecycle hook
      if (def.init) {
        try { def.init(entity, entities._game); } catch(e) { console.warn(\`[\${type}] init error:\`, e); }
      }

      return entity;
    },

    /** Get all living entities */
    all() { return entities.filter(e => e._alive); },

    /** Get all living entities of a specific type */
    query(type) { return entities.filter(e => e._alive && e.type === type); },

    /** Get all living entities with a specific tag */
    queryTag(tag) { return entities.filter(e => e._alive && e.tags.includes(tag)); },

    /** Get first entity of type (e.g., the player) */
    first(type) { return entities.find(e => e._alive && e.type === type) || null; },

    /** Get entity definition */
    getDef(type) { return typeRegistry[type] || null; },

    /** Get all registered type names */
    types() { return Object.keys(typeRegistry); },

    /** Remove dead entities — called by engine at end of frame */
    _sweep() {
      for (let i = entities.length - 1; i >= 0; i--) {
        if (!entities[i]._alive) {
          const e = entities[i];
          if (e._def.onDestroy) e._def.onDestroy(e);
          entities.splice(i, 1);
        }
      }
    },

    /** Clear all entities */
    _clear() {
      entities.length = 0;
      nextId = 1;
    },
  };
}
/**
 * Problocks Physics System
 * Simple AABB collision detection and basic movement helpers.
 */
function createPhysics() {
  let gravity = 0;
  const collisionPairs = []; // [{typeA, typeB}] — which types to check

  return {
    /** Set gravity (pixels/sec^2, applied to vy) */
    setGravity(g) { gravity = g; },

    /** Register a collision pair to check each frame */
    addCollisionPair(typeA, typeB) {
      collisionPairs.push({ typeA, typeB });
    },

    /** Distance between two entities (2D or 3D) */
    distance(a, b) {
      const dx = a.x - b.x, dy = a.y - b.y, dz = (a.z || 0) - (b.z || 0);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    /** AABB overlap check (2D) */
    overlap(a, b) {
      return (
        a.x - a.width / 2 < b.x + b.width / 2 &&
        a.x + a.width / 2 > b.x - b.width / 2 &&
        a.y - a.height / 2 < b.y + b.height / 2 &&
        a.y + a.height / 2 > b.y - b.height / 2
      );
    },

    /** Sphere overlap check (3D) */
    overlapSphere(a, b, radiusA, radiusB) {
      return this.distance(a, b) < radiusA + radiusB;
    },

    /** Move entities by velocity * dt, apply gravity — called by engine */
    _update(entities, dt) {
      for (const e of entities) {
        if (gravity) e.vy += gravity * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.z += (e.vz || 0) * dt;
      }
    },

    /** Check registered collision pairs — called by engine */
    _checkCollisions(entitySystem, game) {
      for (const { typeA, typeB } of collisionPairs) {
        const listA = entitySystem.query(typeA);
        const listB = typeA === typeB ? listA : entitySystem.query(typeB);

        for (const a of listA) {
          for (const b of listB) {
            if (a === b || !a._alive || !b._alive) continue;
            if (this.overlap(a, b)) {
              if (a._def.onCollide) a._def.onCollide(a, b, game);
              if (b._def.onCollide) b._def.onCollide(b, a, game);
            }
          }
        }
      }
    },
  };
}
/**
 * Problocks Audio System
 * Web Audio API synth sounds + audio file playback.
 */
function createAudio() {
  let ctx = null;
  const sounds = {}; // name → { _kind: 'synth' | 'multi' | 'file', ... }

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  return {
    /**
     * Register a synth sound
     * @param {string} name
     * @param {object} opts - { freq, type, duration, vol }
     */
    registerSynth(name, opts) {
      sounds[name] = { _kind: 'synth', ...opts };
    },

    /**
     * Register a sound with multiple synth notes (for complex effects)
     * @param {string} name
     * @param {Array} notes - [{ freq, type, duration, vol, delay }]
     */
    registerMultiSynth(name, notes) {
      sounds[name] = { _kind: 'multi', notes };
    },

    /** Register an audio file URL */
    registerFile(name, url) {
      sounds[name] = { _kind: 'file', url };
    },

    /** Play a registered sound */
    play(name, volumeScale = 1) {
      const s = sounds[name];
      if (!s) return;
      const c = getCtx();

      if (s._kind === 'synth') {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = s.type || 'sine';
        o.frequency.setValueAtTime(s.freq || 440, c.currentTime);
        g.gain.setValueAtTime((s.vol || 0.15) * volumeScale, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (s.duration || 0.2));
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + (s.duration || 0.2));
      }
      else if (s._kind === 'multi') {
        for (const n of s.notes) {
          setTimeout(() => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = n.type || 'sine';
            o.frequency.setValueAtTime(n.freq || 440, c.currentTime);
            g.gain.setValueAtTime((n.vol || 0.1) * volumeScale, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (n.duration || 0.15));
            o.connect(g); g.connect(c.destination);
            o.start(); o.stop(c.currentTime + (n.duration || 0.15));
          }, (n.delay || 0) * 1000);
        }
      }
      else if (s._kind === 'file') {
        const a = new Audio(s.url);
        a.volume = Math.min(1, 0.5 * volumeScale);
        a.play().catch(() => {});
      }
    },

    /** Stop all audio */
    stopAll() {
      if (ctx) { ctx.close(); ctx = null; }
    },
  };
}
/**
 * Problocks Particle System
 * Lightweight particle emitter for visual effects.
 */
function createParticles() {
  const particles = [];

  return {
    /**
     * Emit particles at a position
     * @param {number} x
     * @param {number} y
     * @param {object} config - { count, color, speed, life, size, gravity }
     */
    emit(x, y, config = {}) {
      const {
        count = 8,
        color = '#fff',
        speed = 100,
        life = 0.6,
        size = 3,
        gravity = 200,
        spread = Math.PI * 2,
        angle = -Math.PI / 2,
      } = config;

      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const s = speed * (0.5 + Math.random() * 0.5);
        particles.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life, maxLife: life,
          size,
          color,
          gravity,
        });
      }
    },

    /** Update and draw particles — called by engine */
    _update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    },

    /** Draw particles to a 2D canvas context */
    _draw2d(ctx) {
      for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        const s = p.size * alpha;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    },

    /** Get raw particles for 3D rendering */
    _getAll() { return particles; },

    /** Clear all particles */
    _clear() { particles.length = 0; },
  };
}
/**
 * Problocks Scene Manager
 * Manages scene transitions (title → gameplay → gameover).
 * Each scene has optional enter/exit/update hooks provided by game scripts.
 */
function createSceneManager() {
  const scenes = {};
  let current = null;
  let pending = null;

  return {
    /** Current scene name */
    get current() { return current; },

    /**
     * Register a scene
     * @param {string} name
     * @param {object} hooks - { enter(game), exit(game), update(game, dt), draw(game, ctx) }
     */
    register(name, hooks = {}) {
      scenes[name] = hooks;
    },

    /** Switch to a different scene (happens at end of frame) */
    switch(name) {
      if (!scenes[name]) console.warn(\`Scene "\${name}" not registered\`);
      pending = name;
    },

    /** Called by engine at start of frame */
    _processPending(game) {
      if (pending === null) return;
      if (current && scenes[current]?.exit) scenes[current].exit(game);
      current = pending;
      pending = null;
      if (scenes[current]?.enter) scenes[current].enter(game);
    },

    /** Called by engine each frame */
    _update(game, dt) {
      if (current && scenes[current]?.update) scenes[current].update(game, dt);
    },

    /** Called by engine for 2D scene drawing (overlays, menus) */
    _draw(game, ctx) {
      if (current && scenes[current]?.draw) scenes[current].draw(game, ctx);
    },
  };
}
/**
 * Problocks 3D Renderer
 * Sets up Three.js scene, camera, lights, and provides helpers.
 * Uses Three.js r128 loaded via CDN (available as global \`THREE\`).
 */
function setup3dRenderer(game) {
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
/**
 * Problocks Asset Loader
 * Loads glTF models with caching. Requires THREE.GLTFLoader from CDN.
 */
function createLoader() {
  let gltfLoader = null;
  const cache = {}; // url → Promise<THREE.Group>

  function getLoader() {
    if (!gltfLoader) {
      gltfLoader = new THREE.GLTFLoader();
    }
    return gltfLoader;
  }

  return {
    /**
     * Load a glTF model. Returns a promise that resolves to a cloned THREE.Group.
     * Results are cached — subsequent loads of the same URL return clones.
     * @param {string} url — e.g. '/assets/medieval/Wall_Plaster_Straight.gltf'
     */
    loadModel(url) {
      if (!cache[url]) {
        cache[url] = new Promise((resolve, reject) => {
          getLoader().load(
            url,
            (gltf) => {
              // Enable shadows on all meshes
              gltf.scene.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              resolve(gltf.scene);
            },
            undefined,
            reject,
          );
        });
      }
      // Always return a clone so each instance is independent
      return cache[url].then((original) => original.clone());
    },

    /**
     * Preload multiple models in parallel
     * @param {string[]} urls
     */
    preload(urls) {
      return Promise.all(urls.map(url => this.loadModel(url)));
    },

    /**
     * Convenience: load a medieval village model by name
     * @param {string} name — e.g. 'Wall_Plaster_Straight' (without path/extension)
     */
    medieval(name) {
      return this.loadModel('/assets/medieval/' + name + '.gltf');
    },
  };
}
/**
 * Problocks Game Engine
 * Main entry point — creates the game loop and wires all systems together.
 *
 * Usage (generated by bundler, not written by hand):
 *   const game = createEngine(canvas, config);
 *   game.entities.register(playerDef);
 *   game.scenes.register('gameplay', { enter, update });
 *   game.start('title');
 */

function createEngine(canvas, config = {}) {
  const ctx2d = config.renderer !== '3d' ? canvas.getContext('2d') : null;

  // Core systems
  const input = createInput(canvas);
  const entities = createEntities();
  const physics = createPhysics();
  const audio = createAudio();
  const particles = createParticles();
  const scenes = createSceneManager();

  // Time tracking
  const time = { dt: 0, elapsed: 0, fps: 60, _last: 0 };

  // Camera (2D)
  const camera = {
    x: 0, y: 0, zoom: 1,
    _followTarget: null,
    follow(entity) { this._followTarget = entity; },
    _update() {
      if (this._followTarget && this._followTarget._alive) {
        this.x = this._followTarget.x;
        this.y = this._followTarget.y;
      }
    },
  };

  // Three.js references (populated by game's setup3d if renderer is '3d')
  const three = { scene: null, camera: null, renderer: null };

  // World bounds
  const world = {
    width: config.world?.width || 800,
    height: config.world?.height || 600,
  };

  // UI system (2D overlay).
  // Positions and sizes accept raw px numbers (legacy) or UDim objects for
  // responsive layouts. opts.anchor = [ax, ay] in 0..1 anchors by the
  // element's own bounds — e.g. anchor [1,0] pins its top-right at (x,y).
  const ui = {
    _queue: [],
    text(text, x, y, opts = {}) {
      this._queue.push({ type: 'text', text, x, y, opts });
    },
    bar(x, y, w, h, value, max, color = '#e74c3c', bgColor = '#333', opts = {}) {
      this._queue.push({ type: 'bar', x, y, w, h, value, max, color, bgColor, opts });
    },
    _draw(ctx) {
      const cw = ctx.canvas.width;
      const ch = ctx.canvas.height;
      for (const item of this._queue) {
        const opts = item.opts || {};
        if (item.type === 'text') {
          ctx.fillStyle = opts.color || '#fff';
          ctx.font = opts.font || '16px sans-serif';
          const px = resolveUDim(item.x, cw);
          const py = resolveUDim(item.y, ch);
          const a = opts.anchor;
          if (a) {
            ctx.textAlign = a[0] === 1 ? 'right' : a[0] === 0.5 ? 'center' : 'left';
            ctx.textBaseline = a[1] === 1 ? 'bottom' : a[1] === 0.5 ? 'middle' : 'top';
          } else {
            ctx.textAlign = opts.align || 'left';
          }
          ctx.fillText(item.text, px, py);
        } else if (item.type === 'bar') {
          let px = resolveUDim(item.x, cw);
          let py = resolveUDim(item.y, ch);
          const pw = resolveUDim(item.w, cw);
          const ph = resolveUDim(item.h, ch);
          const a = opts.anchor;
          if (a) { px -= (a[0] || 0) * pw; py -= (a[1] || 0) * ph; }
          ctx.fillStyle = item.bgColor;
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = item.color;
          ctx.fillRect(px, py, pw * Math.max(0, item.value / item.max), ph);
        }
      }
      this._queue.length = 0;
    },
  };

  // Asset loader
  const loader = createLoader();

  // Custom game state — scripts can store anything here
  const state = {};

  // The game object passed to all lifecycle hooks
  const game = {
    canvas, config, input, entities, physics, audio,
    particles, scenes, time, camera, three, world, ui, state, loader,
  };

  // Give entity system access to game for init() calls
  entities._game = game;

  // Gravity from config
  if (config.gravity != null) physics.setGravity(config.gravity);

  // Request pointer lock if 3D
  if (config.renderer === '3d') input.requestPointerLock();

  // Setup 3D if configured
  if (config.renderer === '3d') {
    setup3dRenderer(game);
  }

  let running = false;
  let animFrameId = null;

  function tick(timestamp) {
    if (!running) return;
    try {
    animFrameId = requestAnimationFrame(tick);

    // Delta time (capped at 50ms to avoid spiral of death)
    const dt = Math.min((timestamp - time._last) / 1000, 0.05);
    time._last = timestamp;
    time.dt = dt;
    time.elapsed += dt;
    time.fps = dt > 0 ? Math.round(1 / dt) : 60;

    // Scene transitions
    scenes._processPending(game);

    // Entity updates
    const allEntities = entities.all();
    for (const e of allEntities) {
      if (e._def.update) e._def.update(e, game, dt);
    }

    // Scene update (for scene-level logic like spawners, UI)
    scenes._update(game, dt);

    // Physics
    physics._update(allEntities, dt);
    physics._checkCollisions(entities, game);

    // Camera
    camera._update();

    // 3D camera update
    if (game.three._update) game.three._update(dt);

    // Particles
    particles._update(dt);

    // Rendering
    if (ctx2d) {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;

      ctx2d.save();
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.fillStyle = config.bgColor || '#111';
      ctx2d.fillRect(0, 0, w, h);

      // Camera transform
      ctx2d.save();
      ctx2d.translate(w / 2, h / 2);
      ctx2d.scale(camera.zoom, camera.zoom);
      ctx2d.translate(-camera.x, -camera.y);

      // Draw entities
      for (const e of allEntities) {
        if (!e.visible) continue;
        if (e._def.draw) {
          e._def.draw(e, game, ctx2d);
        } else {
          // Default: colored rectangle
          ctx2d.fillStyle = e.color || '#888';
          ctx2d.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
        }
      }

      // Particles
      particles._draw2d(ctx2d);
      ctx2d.restore();

      // Scene overlay (menus, etc)
      scenes._draw(game, ctx2d);

      // UI overlay (always in screen space)
      ui._draw(ctx2d);
      ctx2d.restore();
    }

    if (three.renderer && three.scene && three.camera) {
      three.renderer.render(three.scene, three.camera);
    }

    // Cleanup
    entities._sweep();
    input._endFrame();
    } catch(err) {
      running = false;
      console.error('[Problocks tick error]', err);
      // Show error on canvas
      if (ctx2d) {
        canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
        ctx2d.fillStyle = '#111'; ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        ctx2d.fillStyle = '#e74c3c'; ctx2d.font = '16px monospace';
        ctx2d.fillText('Runtime Error: ' + err.message, 20, 40);
        ctx2d.fillStyle = '#888'; ctx2d.font = '12px monospace';
        ctx2d.fillText('Check console for details', 20, 65);
      }
    }
  }

  game.start = function (sceneName) {
    running = true;
    time._last = performance.now();
    scenes.switch(sceneName || 'title');
    animFrameId = requestAnimationFrame(tick);
  };

  game.stop = function () {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    input._destroy();
    audio.stopAll();
  };

  // Resize handler
  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (game.three._resize) {
      game.three._resize();
    }
  }
  window.addEventListener('resize', onResize);
  onResize();

  return game;
}
`;
