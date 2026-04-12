// Tool definitions for Anthropic API tool_use
export const GAME_TOOLS = [
  {
    name: 'generate_sprite',
    description:
      'Generate a game sprite image. Returns a data URL (SVG) that can be used as an Image source in Canvas or as an <img> src. Call this for each visual element the game needs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Identifier for this sprite (e.g., "player", "enemy", "coin")',
        },
        description: {
          type: 'string',
          description: 'Visual description of what the sprite should look like',
        },
        width: { type: 'number', description: 'Width in pixels (16-128)' },
        height: { type: 'number', description: 'Height in pixels (16-128)' },
        colors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Primary colors as hex values (e.g., ["#4a90d9", "#2a5080"])',
        },
      },
      required: ['name', 'description', 'width', 'height'],
    },
  },
  {
    name: 'generate_sound',
    description:
      'Generate parameters for a game sound effect using Web Audio API. Returns oscillator settings and a code hint that can be used to implement the sound in the game.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Identifier for this sound (e.g., "jump", "shoot", "explosion")',
        },
        description: {
          type: 'string',
          description: 'What the sound should sound like',
        },
        duration: {
          type: 'number',
          description: 'Duration in seconds (0.05-3.0). Defaults to 0.3',
        },
      },
      required: ['name', 'description'],
    },
  },
];

// Execute a tool by name
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  switch (name) {
    case 'generate_sprite':
      return generateSprite(input as unknown as SpriteInput);
    case 'generate_sound':
      return generateSound(input as unknown as SoundInput);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Format status messages for each tool
export function getToolStatusMessage(
  toolName: string,
  input: Record<string, unknown>,
): string {
  switch (toolName) {
    case 'generate_sprite':
      return `🎨 Generating sprite: ${input.name || 'asset'}...`;
    case 'generate_sound':
      return `🔊 Creating sound: ${input.name || 'effect'}...`;
    default:
      return `🔧 Running ${toolName}...`;
  }
}

// --- Types ---

interface SpriteInput {
  name: string;
  description: string;
  width: number;
  height: number;
  colors?: string[];
}

interface SoundInput {
  name: string;
  description: string;
  duration?: number;
}

// --- Sprite generation (SVG-based, swap for PixelLab later) ---

function generateSprite(input: SpriteInput) {
  const { width, height } = input;
  const colors = input.colors || getAutoColors(input.description);
  const svg = buildSvg(input.description, width, height, colors);
  const url = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return { url, width, height, name: input.name };
}

function getAutoColors(desc: string): string[] {
  const d = desc.toLowerCase();
  if (d.match(/fire|lava|flame|red/)) return ['#ff4500', '#ff8c00', '#ffd700'];
  if (d.match(/ice|frost|snow|frozen/)) return ['#87ceeb', '#4fc3f7', '#ffffff'];
  if (d.match(/poison|toxic|slime|green/)) return ['#32cd32', '#228b22', '#90ee90'];
  if (d.match(/gold|coin|treasure|yellow/)) return ['#ffd700', '#daa520', '#fff8dc'];
  if (d.match(/heart|health|love|red|pink/)) return ['#ff1744', '#d50000', '#ff8a80'];
  if (d.match(/dark|shadow|void|black/)) return ['#555555', '#333333', '#888888'];
  if (d.match(/water|ocean|sea|blue/)) return ['#1e90ff', '#0066cc', '#87ceeb'];
  if (d.match(/purple|magic|wizard|mystic/)) return ['#9b59b6', '#6c3483', '#d2b4de'];
  if (d.match(/orange/)) return ['#ff8c00', '#e67e22', '#ffd699'];
  if (d.match(/white|light|holy|bright/)) return ['#e0e0e0', '#bdbdbd', '#ffffff'];
  return ['#4a90d9', '#2a5080', '#a8d8ea'];
}

function buildSvg(
  description: string,
  w: number,
  h: number,
  colors: string[],
): string {
  const [c1, c2, c3] = [
    colors[0] || '#4a90d9',
    colors[1] || '#2a5080',
    colors[2] || '#ffffff',
  ];
  const d = description.toLowerCase();

  if (d.match(/ship|rocket|plane|jet|fighter|spacecraft|arrow/)) {
    return svgWrap(
      w,
      h,
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient></defs>
      <polygon points="${w / 2},${h * 0.05} ${w * 0.85},${h * 0.85} ${w / 2},${h * 0.7} ${w * 0.15},${h * 0.85}" fill="url(#g)" stroke="${c2}" stroke-width="1"/>
      <polygon points="${w / 2},${h * 0.7} ${w * 0.7},${h} ${w * 0.3},${h}" fill="${c2}" opacity="0.7"/>
      <circle cx="${w / 2}" cy="${h * 0.35}" r="${w * 0.08}" fill="${c3}" opacity="0.9"/>`,
    );
  }

  if (d.match(/enemy|alien|monster|ghost|creature|bug|spider|bat/)) {
    const ey = h * 0.35;
    const er = w * 0.08;
    return svgWrap(
      w,
      h,
      `<defs><radialGradient id="g"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <ellipse cx="${w / 2}" cy="${h * 0.45}" rx="${w * 0.42}" ry="${h * 0.42}" fill="url(#g)" stroke="${c2}" stroke-width="1"/>
      <circle cx="${w * 0.35}" cy="${ey}" r="${er}" fill="${c3}"/>
      <circle cx="${w * 0.65}" cy="${ey}" r="${er}" fill="${c3}"/>
      <circle cx="${w * 0.37}" cy="${ey}" r="${er * 0.5}" fill="#111"/>
      <circle cx="${w * 0.67}" cy="${ey}" r="${er * 0.5}" fill="#111"/>
      <path d="M${w * 0.3} ${h * 0.58} Q${w / 2} ${h * 0.7} ${w * 0.7} ${h * 0.58}" fill="none" stroke="#111" stroke-width="1.5" stroke-linecap="round"/>`,
    );
  }

  if (d.match(/star|gem|crystal|diamond|jewel/)) {
    const cx = w / 2,
      cy = h / 2;
    const r = Math.min(w, h) * 0.45;
    const ir = r * 0.4;
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const ao = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const ai = ao + Math.PI / 5;
      pts.push(
        `${cx + r * Math.cos(ao)},${cy + r * Math.sin(ao)}`,
        `${cx + ir * Math.cos(ai)},${cy + ir * Math.sin(ai)}`,
      );
    }
    return svgWrap(
      w,
      h,
      `<polygon points="${pts.join(' ')}" fill="${c1}" stroke="${c2}" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="${c3}" opacity="0.6"/>`,
    );
  }

  if (d.match(/coin|token|ring|orb|ball|sphere|circle/)) {
    return svgWrap(
      w,
      h,
      `<defs><radialGradient id="g" cx="0.35" cy="0.35">
        <stop offset="0" stop-color="${c3}" stop-opacity="0.4"/><stop offset="1" stop-color="${c1}"/>
      </radialGradient></defs>
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.42}" fill="url(#g)" stroke="${c2}" stroke-width="1.5"/>`,
    );
  }

  if (d.match(/heart|health|life|hp/)) {
    const s = Math.min(w, h);
    return svgWrap(
      w,
      h,
      `<path d="M${s / 2} ${s * 0.85} C${s * 0.1} ${s * 0.55} ${0} ${s * 0.2} ${s * 0.25} ${s * 0.15} C${s * 0.4} ${s * 0.1} ${s / 2} ${s * 0.25} ${s / 2} ${s * 0.3} C${s / 2} ${s * 0.25} ${s * 0.6} ${s * 0.1} ${s * 0.75} ${s * 0.15} C${s} ${s * 0.2} ${s * 0.9} ${s * 0.55} ${s / 2} ${s * 0.85} Z" fill="${c1}" stroke="${c2}" stroke-width="1"/>
      <ellipse cx="${s * 0.33}" cy="${s * 0.3}" rx="${s * 0.08}" ry="${s * 0.06}" fill="${c3}" opacity="0.4" transform="rotate(-30 ${s * 0.33} ${s * 0.3})"/>`,
    );
  }

  if (d.match(/platform|block|wall|ground|floor|brick|tile/)) {
    return svgWrap(
      w,
      h,
      `<rect width="${w}" height="${h}" fill="${c1}" rx="2"/>
      <rect x="1" y="1" width="${w - 2}" height="${h * 0.3}" fill="${c3}" opacity="0.15" rx="1"/>
      <line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="${c2}" stroke-width="0.5" opacity="0.3"/>`,
    );
  }

  if (d.match(/bullet|projectile|laser|beam|shot|missile/)) {
    return svgWrap(
      w,
      h,
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c3}"/><stop offset="1" stop-color="${c1}"/>
      </linearGradient></defs>
      <ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.3}" ry="${h * 0.45}" fill="url(#g)"/>
      <ellipse cx="${w / 2}" cy="${h * 0.3}" rx="${w * 0.15}" ry="${h * 0.15}" fill="${c3}" opacity="0.8"/>`,
    );
  }

  if (d.match(/player|character|person|hero|warrior|knight/)) {
    return svgWrap(
      w,
      h,
      `<circle cx="${w / 2}" cy="${h * 0.2}" r="${w * 0.18}" fill="${c1}" stroke="${c2}" stroke-width="1"/>
      <circle cx="${w * 0.42}" cy="${h * 0.17}" r="${w * 0.04}" fill="${c3}"/>
      <circle cx="${w * 0.58}" cy="${h * 0.17}" r="${w * 0.04}" fill="${c3}"/>
      <rect x="${w * 0.3}" y="${h * 0.35}" width="${w * 0.4}" height="${h * 0.35}" rx="3" fill="${c1}" stroke="${c2}" stroke-width="1"/>
      <rect x="${w * 0.2}" y="${h * 0.72}" width="${w * 0.2}" height="${h * 0.25}" rx="2" fill="${c2}"/>
      <rect x="${w * 0.6}" y="${h * 0.72}" width="${w * 0.2}" height="${h * 0.25}" rx="2" fill="${c2}"/>`,
    );
  }

  if (d.match(/cat|dog|animal|pet|fox|bunny|rabbit/)) {
    return svgWrap(
      w,
      h,
      `<defs><radialGradient id="g"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <polygon points="${w * 0.25},${h * 0.25} ${w * 0.15},${h * 0.02} ${w * 0.38},${h * 0.15}" fill="${c1}" stroke="${c2}" stroke-width="0.5"/>
      <polygon points="${w * 0.75},${h * 0.25} ${w * 0.85},${h * 0.02} ${w * 0.62},${h * 0.15}" fill="${c1}" stroke="${c2}" stroke-width="0.5"/>
      <ellipse cx="${w / 2}" cy="${h * 0.35}" rx="${w * 0.35}" ry="${h * 0.25}" fill="url(#g)" stroke="${c2}" stroke-width="1"/>
      <circle cx="${w * 0.38}" cy="${h * 0.3}" r="${w * 0.05}" fill="${c3}"/>
      <circle cx="${w * 0.62}" cy="${h * 0.3}" r="${w * 0.05}" fill="${c3}"/>
      <circle cx="${w * 0.39}" cy="${h * 0.31}" r="${w * 0.025}" fill="#111"/>
      <circle cx="${w * 0.61}" cy="${h * 0.31}" r="${w * 0.025}" fill="#111"/>
      <ellipse cx="${w / 2}" cy="${h * 0.4}" rx="${w * 0.04}" ry="${w * 0.03}" fill="#ffa0a0"/>
      <ellipse cx="${w / 2}" cy="${h * 0.7}" rx="${w * 0.25}" ry="${h * 0.25}" fill="${c1}" stroke="${c2}" stroke-width="1"/>`,
    );
  }

  if (d.match(/explosion|burst|blast|boom|particle|spark/)) {
    const cx = w / 2,
      cy = h / 2;
    const r = Math.min(w, h) * 0.4;
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.5;
      pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
    }
    return svgWrap(
      w,
      h,
      `<polygon points="${pts.join(' ')}" fill="${c1}" stroke="${c2}" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.25}" fill="${c3}" opacity="0.7"/>`,
    );
  }

  // Default — rounded rectangle with gradient
  return svgWrap(
    w,
    h,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" rx="${Math.min(w, h) * 0.15}" fill="url(#g)" stroke="${c2}" stroke-width="1"/>
    <rect x="${w * 0.15}" y="${h * 0.15}" width="${w * 0.3}" height="${h * 0.3}" rx="2" fill="${c3}" opacity="0.2"/>`,
  );
}

function svgWrap(w: number, h: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
}

// --- Sound generation (Web Audio params, swap for ElevenLabs/Suno later) ---

function generateSound(input: SoundInput) {
  const dur = input.duration || 0.3;
  const d = input.description.toLowerCase();

  if (d.match(/jump|hop|bounce|spring/))
    return sound(input.name, 'sine', 200, 600, Math.min(dur, 0.15), 0.3, 'exponential');
  if (d.match(/shoot|fire|laser|pew|zap/))
    return sound(input.name, 'square', 800, 200, Math.min(dur, 0.1), 0.2, 'linear');
  if (d.match(/explo|boom|crash|destroy|detonate/))
    return sound(input.name, 'sawtooth', 150, 20, Math.max(dur, 0.4), 0.4, 'exponential');
  if (d.match(/coin|collect|pickup|gem|star|point/))
    return sound(input.name, 'sine', 500, 1000, 0.1, 0.2, 'linear');
  if (d.match(/hit|hurt|damage|ouch|pain/))
    return sound(input.name, 'sawtooth', 400, 100, 0.2, 0.3, 'linear');
  if (d.match(/powerup|power|boost|upgrade|shield/))
    return sound(input.name, 'sine', 300, 900, 0.4, 0.25, 'linear');
  if (d.match(/click|button|menu|select|ui|tap/))
    return sound(input.name, 'sine', 600, 800, 0.05, 0.15, 'linear');
  if (d.match(/death|die|game.?over|lose|fail/))
    return sound(input.name, 'sine', 500, 100, 0.8, 0.3, 'exponential');
  if (d.match(/win|victory|success|complete|level/))
    return sound(input.name, 'sine', 400, 800, 0.5, 0.25, 'linear');
  if (d.match(/whoosh|swipe|swing|slash/))
    return sound(input.name, 'sawtooth', 300, 600, 0.15, 0.15, 'exponential');

  return sound(input.name, 'sine', 440, 440, dur, 0.25, 'linear');
}

function sound(
  name: string,
  type: string,
  freqStart: number,
  freqEnd: number,
  duration: number,
  volume: number,
  curve: string,
) {
  return {
    name,
    params: { type, freqStart, freqEnd, duration, volume, curve },
    code_hint: `// ${type} wave ${freqStart}→${freqEnd}Hz, ${duration}s, ${curve} ramp, vol ${volume}`,
  };
}
