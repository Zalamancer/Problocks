/**
 * Playdemy Audio System
 * Web Audio API synth sounds + audio file playback.
 */
export function createAudio() {
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
