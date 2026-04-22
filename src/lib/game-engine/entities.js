/**
 * Playdemy Entity System
 * Manages spawning, destroying, and querying game entities.
 * Each entity is a plain object with a `type`, position, and lifecycle hooks.
 */
export function createEntities() {
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
      if (!def) throw new Error(`Unknown entity type: "${type}"`);

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
        try { def.init(entity, entities._game); } catch(e) { console.warn(`[${type}] init error:`, e); }
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
