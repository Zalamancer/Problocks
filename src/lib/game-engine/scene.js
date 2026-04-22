/**
 * Playdemy Scene Manager
 * Manages scene transitions (title → gameplay → gameover).
 * Each scene has optional enter/exit/update hooks provided by game scripts.
 */
export function createSceneManager() {
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
      if (!scenes[name]) console.warn(`Scene "${name}" not registered`);
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
