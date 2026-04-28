/**
 * PixelLab MCP tool catalog.
 *
 * Source of truth: https://api.pixellab.ai/mcp/docs (fetched 2026-04-27).
 * Only tools the MCP actually exposes are listed — the dashboard's
 * Create-image-S-XL / Image-to-pixel-art / Edit-image / Animate-with-text /
 * Unzoom / Remove-background / Pixel-art-correction etc. are NOT in the MCP
 * and are intentionally absent here. Add them when the MCP exposes them or
 * when we proxy PixelLab's REST API directly.
 */

export type Category = 'create' | 'transform' | 'animate' | 'utility';
export type Badge = 'NEW' | 'PRO' | 'EXPERIMENTAL';

export type FieldKind =
  | 'textarea'
  | 'text'
  | 'select'
  | 'slider'
  | 'boolean'
  | 'image'
  | 'images';

interface BaseField {
  key: string;
  label: string;
  help?: string;
  required?: boolean;
  /** Show this field only when another field equals one of these values. */
  showWhen?: { key: string; equals: string | number | boolean | (string | number | boolean)[] };
  /** Group key — fields with the same group key sit in the same PanelSection. */
  group?: string;
}

export interface TextField    extends BaseField { kind: 'text';     placeholder?: string; default?: string }
export interface TextareaField extends BaseField { kind: 'textarea'; placeholder?: string; default?: string; rows?: number }
export interface SelectField  extends BaseField { kind: 'select';   options: { value: string; label: string }[]; default?: string }
export interface SliderField  extends BaseField {
  kind: 'slider';
  min: number; max: number; step: number; precision?: number;
  default: number; suffix?: string;
}
export interface BooleanField extends BaseField { kind: 'boolean'; default?: boolean }
export interface ImageField   extends BaseField { kind: 'image';   maxBytes?: number; note?: string }
export interface ImagesField  extends BaseField { kind: 'images';  max: number; maxBytes?: number; note?: string }

export type Field =
  | TextField
  | TextareaField
  | SelectField
  | SliderField
  | BooleanField
  | ImageField
  | ImagesField;

export interface ToolSchema {
  id: string;
  /** MCP tool name — what the server expects in its `tools/call` request. */
  mcpName: string;
  category: Category;
  title: string;
  desc: string;
  badge?: Badge;
  costInfo?: string;
  /** Sections render in this order; each is a collapsible PanelSection. */
  sections: { id: string; title: string; defaultOpen?: boolean }[];
  fields: Field[];
}

const STYLE_SECTION = { id: 'style', title: 'Style', defaultOpen: false };
const ADVANCED_SECTION = { id: 'advanced', title: 'Advanced', defaultOpen: false };

export const TOOLS: ToolSchema[] = [
  // ── Create ─────────────────────────────────────────────────────────────
  {
    id: 'create-character',
    mcpName: 'create_character',
    category: 'create',
    title: 'Create 8-directional sprite',
    desc: 'Generate 4 or 8 directional views of a character',
    badge: 'PRO',
    sections: [
      { id: 'main', title: 'Character', defaultOpen: true },
      STYLE_SECTION,
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. bearded farmer in green vest and overalls' },
      { kind: 'text', key: 'name', label: 'Name', group: 'main', placeholder: 'Optional name' },
      { kind: 'select', key: 'body_type', label: 'Body type', default: 'humanoid', group: 'main',
        options: [
          { value: 'humanoid',  label: 'Humanoid' },
          { value: 'quadruped', label: 'Quadruped' },
        ] },
      { kind: 'select', key: 'template', label: 'Template', required: true, group: 'main',
        showWhen: { key: 'body_type', equals: 'quadruped' },
        options: [
          { value: 'bear',  label: 'Bear' },
          { value: 'cat',   label: 'Cat' },
          { value: 'dog',   label: 'Dog' },
          { value: 'horse', label: 'Horse' },
          { value: 'lion',  label: 'Lion' },
        ] },
      { kind: 'select', key: 'n_directions', label: 'Directions', default: '8', group: 'main',
        options: [{ value: '4', label: '4' }, { value: '8', label: '8' }] },
      { kind: 'select', key: 'proportions', label: 'Proportions', default: 'default', group: 'main',
        options: [
          { value: 'default',          label: 'Default' },
          { value: 'chibi',            label: 'Chibi' },
          { value: 'cartoon',          label: 'Cartoon' },
          { value: 'stylized',         label: 'Stylized' },
          { value: 'realistic_male',   label: 'Realistic male' },
          { value: 'realistic_female', label: 'Realistic female' },
          { value: 'heroic',           label: 'Heroic' },
        ] },
      { kind: 'slider', key: 'size', label: 'Canvas size', min: 16, max: 128, step: 8, default: 48, suffix: 'px', group: 'main',
        help: 'Character occupies ~60% of canvas height.' },
      { kind: 'text', key: 'outline', label: 'Outline', default: 'single color black outline', group: 'style' },
      { kind: 'text', key: 'shading', label: 'Shading', default: 'basic shading', group: 'style' },
      { kind: 'text', key: 'detail',  label: 'Detail',  default: 'medium detail',  group: 'style' },
      { kind: 'slider', key: 'ai_freedom', label: 'AI freedom', min: 0, max: 1000, step: 50, default: 750, group: 'advanced',
        help: 'Higher = more interpretive, lower = more literal.' },
    ],
  },
  {
    id: 'create-topdown-tileset',
    mcpName: 'create_topdown_tileset',
    category: 'create',
    title: 'Create top-down tileset',
    desc: 'Wang tileset (16 tiles) for top-down maps with autotiling',
    sections: [
      { id: 'main', title: 'Terrain', defaultOpen: true },
      { id: 'tile', title: 'Tile size', defaultOpen: true },
      STYLE_SECTION,
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'lower_description', label: 'Lower terrain', required: true, group: 'main',
        placeholder: 'e.g. dirt path' },
      { kind: 'textarea', key: 'upper_description', label: 'Upper terrain', required: true, group: 'main',
        placeholder: 'e.g. green grass' },
      { kind: 'text', key: 'transition_description', label: 'Transition', group: 'main',
        placeholder: 'Optional — e.g. mossy edge' },
      { kind: 'slider', key: 'transition_size', label: 'Transition width', min: 0, max: 0.5, step: 0.05, precision: 2, default: 0, group: 'main',
        help: '0 = sharp, 0.25 = medium, 0.5 = wide blend.' },
      { kind: 'select', key: 'view', label: 'View', default: 'high top-down', group: 'main',
        options: [
          { value: 'high top-down', label: 'High top-down (RTS)' },
          { value: 'low top-down',  label: 'Low top-down (RPG)' },
        ] },
      { kind: 'slider', key: 'tile_width',  label: 'Tile width',  min: 8, max: 64, step: 8, default: 16, suffix: 'px', group: 'tile' },
      { kind: 'slider', key: 'tile_height', label: 'Tile height', min: 8, max: 64, step: 8, default: 16, suffix: 'px', group: 'tile' },
      { kind: 'text', key: 'outline', label: 'Outline', group: 'style' },
      { kind: 'text', key: 'shading', label: 'Shading', group: 'style' },
      { kind: 'text', key: 'detail',  label: 'Detail',  group: 'style' },
      { kind: 'slider', key: 'tile_strength',       label: 'Tile strength',       min: 0, max: 2,  step: 0.1, precision: 1, default: 1, group: 'advanced' },
      { kind: 'slider', key: 'text_guidance_scale', label: 'Text guidance scale', min: 1, max: 20, step: 0.5, precision: 1, default: 8, group: 'advanced' },
    ],
  },
  {
    id: 'create-sidescroller-tileset',
    mcpName: 'create_sidescroller_tileset',
    category: 'create',
    title: 'Create sidescroller tileset',
    desc: 'Tileset for 2D platformers (side view)',
    sections: [
      { id: 'main', title: 'Material', defaultOpen: true },
      { id: 'tile', title: 'Tile size', defaultOpen: true },
      STYLE_SECTION,
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'lower_description', label: 'Platform material', required: true, group: 'main',
        placeholder: 'e.g. stone, wood, metal, ice' },
      { kind: 'textarea', key: 'transition_description', label: 'Top decoration', required: true, group: 'main',
        placeholder: 'e.g. grass, snow, moss, rust' },
      { kind: 'slider', key: 'transition_size', label: 'Decoration coverage', min: 0, max: 0.5, step: 0.05, precision: 2, default: 0, group: 'main',
        help: '0 = no layer, 0.25 = light, 0.5 = heavy.' },
      { kind: 'slider', key: 'tile_width',  label: 'Tile width',  min: 8, max: 64, step: 8, default: 16, suffix: 'px', group: 'tile' },
      { kind: 'slider', key: 'tile_height', label: 'Tile height', min: 8, max: 64, step: 8, default: 16, suffix: 'px', group: 'tile' },
      { kind: 'text', key: 'outline', label: 'Outline', group: 'style' },
      { kind: 'text', key: 'shading', label: 'Shading', group: 'style' },
      { kind: 'text', key: 'detail',  label: 'Detail',  group: 'style' },
      { kind: 'slider', key: 'tile_strength',       label: 'Tile strength',       min: 0, max: 2,  step: 0.1, precision: 1, default: 1, group: 'advanced' },
      { kind: 'slider', key: 'text_guidance_scale', label: 'Text guidance scale', min: 1, max: 20, step: 0.5, precision: 1, default: 8, group: 'advanced' },
      { kind: 'text', key: 'seed', label: 'Seed', group: 'advanced', placeholder: 'Optional — for reproducible output' },
    ],
  },
  {
    id: 'create-isometric-tile',
    mcpName: 'create_isometric_tile',
    category: 'create',
    title: 'Create isometric tile',
    desc: 'Single isometric pixel-art tile',
    sections: [
      { id: 'main', title: 'Tile', defaultOpen: true },
      STYLE_SECTION,
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. cobblestone block with moss' },
      { kind: 'slider', key: 'size', label: 'Size', min: 16, max: 64, step: 8, default: 32, suffix: 'px', group: 'main',
        help: 'Sizes >24px produce better quality.' },
      { kind: 'select', key: 'tile_shape', label: 'Shape', default: 'block', group: 'main',
        options: [
          { value: 'thin',  label: 'Thin (~10%)' },
          { value: 'thick', label: 'Thick (~25%)' },
          { value: 'block', label: 'Block (~50%)' },
        ] },
      { kind: 'select', key: 'outline', label: 'Outline', default: 'lineless', group: 'style',
        options: [
          { value: 'lineless',     label: 'Lineless (modern)' },
          { value: 'single color', label: 'Single color (retro)' },
        ] },
      { kind: 'text', key: 'shading', label: 'Shading', default: 'basic shading', group: 'style' },
      { kind: 'select', key: 'detail', label: 'Detail', default: 'medium detail', group: 'style',
        options: [
          { value: 'low detail',     label: 'Low detail' },
          { value: 'medium detail',  label: 'Medium detail' },
          { value: 'highly detailed',label: 'Highly detailed' },
        ] },
      { kind: 'slider', key: 'text_guidance_scale', label: 'Text guidance scale', min: 1, max: 20, step: 0.5, precision: 1, default: 8, group: 'advanced' },
      { kind: 'text', key: 'seed', label: 'Seed', group: 'advanced', placeholder: 'Optional — for consistent style across tiles' },
    ],
  },
  {
    id: 'create-map-object',
    mcpName: 'create_map_object',
    category: 'create',
    title: 'Create map object',
    desc: 'Pixel-art object with transparent background for game maps',
    sections: [
      { id: 'main', title: 'Object', defaultOpen: true },
      { id: 'image', title: 'Reference image', defaultOpen: false },
      STYLE_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. wooden barrel with iron bands' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 16, max: 512, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 16, max: 512, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'select', key: 'view', label: 'View', default: 'high top-down', group: 'main',
        options: [{ value: 'high top-down', label: 'High top-down' }] },
      { kind: 'image', key: 'background_image', label: 'Background image', group: 'image',
        note: 'PNG/JPG. PixelLab MCP does not document a size cap for this field.' },
      { kind: 'text', key: 'inpainting', label: 'Inpainting mask', group: 'image',
        placeholder: 'Optional inpainting hint' },
      { kind: 'text', key: 'outline', label: 'Outline', default: 'single color outline', group: 'style' },
      { kind: 'text', key: 'shading', label: 'Shading', default: 'medium shading', group: 'style' },
      { kind: 'text', key: 'detail',  label: 'Detail',  default: 'medium detail',  group: 'style' },
    ],
  },
  {
    id: 'create-tiles-pro',
    mcpName: 'create_tiles_pro',
    category: 'create',
    title: 'Create tiles',
    desc: 'Generate tile variations for games (advanced)',
    badge: 'PRO',
    costInfo: '20 generations',
    sections: [
      { id: 'main',  title: 'Tile',          defaultOpen: true },
      { id: 'image', title: 'Style images',  defaultOpen: false },
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'Describe each tile or give a general description for all' },
      { kind: 'select', key: 'tile_type', label: 'Tile type', default: 'isometric', group: 'main',
        options: [{ value: 'isometric', label: 'Isometric' }] },
      { kind: 'slider', key: 'tile_size',   label: 'Tile size',   min: 16, max: 128, step: 8, default: 32, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'tile_height', label: 'Tile height', min: 16, max: 128, step: 8, default: 32, suffix: 'px', group: 'main' },
      { kind: 'select', key: 'tile_view', label: 'Tile view', default: 'low top-down', group: 'main',
        options: [{ value: 'low top-down', label: 'Low top-down' }] },
      { kind: 'select', key: 'outline_mode', label: 'Outline mode', default: 'outline', group: 'main',
        options: [{ value: 'outline', label: 'Outline (default)' }] },
      { kind: 'images', key: 'style_images', label: 'Style tiles', max: 16, group: 'image',
        note: 'Up to 16 reference tiles. PixelLab MCP does not document a per-image size cap.' },
      { kind: 'slider', key: 'tile_view_angle',  label: 'View angle',  min: 0, max: 90, step: 1,    default: 90, suffix: '°', group: 'advanced' },
      { kind: 'slider', key: 'tile_depth_ratio', label: 'Depth ratio', min: 0, max: 1,  step: 0.05, precision: 2, default: 0, group: 'advanced' },
      { kind: 'text',   key: 'seed', label: 'Seed', group: 'advanced', placeholder: 'Optional — for reproducible output' },
    ],
  },

  // ── Animate ────────────────────────────────────────────────────────────
  {
    id: 'animate-character',
    mcpName: 'animate_character',
    category: 'animate',
    title: 'Animate character',
    desc: 'Queue an animation for an existing character',
    sections: [
      { id: 'main', title: 'Animation', defaultOpen: true },
    ],
    fields: [
      { kind: 'text', key: 'character_id', label: 'Character ID', required: true, group: 'main',
        placeholder: 'UUID returned by Create 8-directional sprite' },
      { kind: 'text', key: 'template_animation_id', label: 'Template', group: 'main',
        placeholder: 'e.g. walking, running, idle' },
      { kind: 'textarea', key: 'action_description', label: 'Action description', group: 'main',
        placeholder: 'Optional customization' },
      { kind: 'text', key: 'animation_name', label: 'Animation name', group: 'main',
        placeholder: 'Optional label' },
      { kind: 'boolean', key: 'confirm_cost', label: 'Confirm cost', default: false, group: 'main',
        help: 'Must be enabled before queueing.' },
    ],
  },
];

export const TOOLS_BY_CATEGORY: Record<Category, ToolSchema[]> = {
  create:    TOOLS.filter((t) => t.category === 'create'),
  transform: TOOLS.filter((t) => t.category === 'transform'),
  animate:   TOOLS.filter((t) => t.category === 'animate'),
  utility:   TOOLS.filter((t) => t.category === 'utility'),
};

export function findTool(id: string): ToolSchema | undefined {
  return TOOLS.find((t) => t.id === id);
}

/** Initial form state with each field's documented default. */
export function defaultsFor(tool: ToolSchema): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of tool.fields) {
    switch (f.kind) {
      case 'text':
      case 'textarea':
        out[f.key] = f.default ?? '';
        break;
      case 'select':
        out[f.key] = f.default ?? f.options[0]?.value ?? '';
        break;
      case 'slider':
        out[f.key] = f.default;
        break;
      case 'boolean':
        out[f.key] = f.default ?? false;
        break;
      case 'image':
        out[f.key] = null;
        break;
      case 'images':
        out[f.key] = [];
        break;
    }
  }
  return out;
}
