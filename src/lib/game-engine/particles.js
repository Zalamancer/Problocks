/**
 * Problocks Particle System
 * Lightweight particle emitter for visual effects.
 */
export function createParticles() {
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
