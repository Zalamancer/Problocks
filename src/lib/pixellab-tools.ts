/**
 * PixelLab tool catalog — covers both transports:
 *   - MCP   : tools at https://api.pixellab.ai/mcp (JSON-RPC tools/call)
 *   - REST  : endpoints at https://api.pixellab.ai/v2/<path>
 * Sources: api.pixellab.ai/mcp/docs and v2/openapi.json (fetched 2026-04-27).
 *
 * Tools intentionally absent: Unzoom, Pixel-art-correction (PixelLab dashboard
 * only — neither MCP nor v2 REST exposes them), Create-animated-character PRO
 * (no clear REST endpoint), and a handful of internal helpers (estimate-skeleton,
 * resize, rotate, animate-with-skeleton with raw keypoints) that don't fit the
 * single-form UX.
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

/** Image input as accepted by PixelLab v2 REST: `{type: "base64", base64: <data url>}`. */
export type RestImage = { type: 'base64'; base64: string };
export type RestImageWithSize = { image: RestImage; width: number; height: number };

/**
 * Per-tool transformer: takes the form's flat args bag (numbers, strings,
 * booleans) plus image fields already converted to `{type: "base64", ...}`,
 * returns the JSON body PixelLab v2 REST actually expects (e.g. wrapping
 * width/height into `image_size: {width, height}`, building reference_images
 * arrays of `{image, width, height}`, etc.).
 */
export type RestTransform = (
  args: Record<string, unknown>,
  images: Record<string, RestImage | RestImage[] | undefined>,
) => Record<string, unknown>;

export interface ToolSchema {
  id: string;
  category: Category;
  title: string;
  desc: string;
  badge?: Badge;
  costInfo?: string;
  /** Sections render in this order; each is a collapsible PanelSection. */
  sections: { id: string; title: string; defaultOpen?: boolean }[];
  fields: Field[];
  /** Which transport to invoke. Default: 'mcp' if mcpName is set, else 'rest'. */
  transport: 'mcp' | 'rest';
  // ── MCP transport ────────────────────────────────────────────────────
  /** MCP tool name — used for `tools/call`. */
  mcpName?: string;
  // ── REST transport ───────────────────────────────────────────────────
  /** REST endpoint relative to /v2 (e.g. "create-image-pixflux"). */
  restEndpoint?: string;
  /** Returns true if the endpoint is asynchronous (responds with `background_job_id`). */
  restAsync?: boolean;
  /** Builds the REST request body from the form's flat state + image objects. */
  restTransform?: RestTransform;
}

const STYLE_SECTION = { id: 'style', title: 'Style', defaultOpen: false };
const ADVANCED_SECTION = { id: 'advanced', title: 'Advanced', defaultOpen: false };

export const TOOLS: ToolSchema[] = [
  // ── Create ─────────────────────────────────────────────────────────────
  {
    id: 'create-character',
    transport: 'mcp',
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
    transport: 'mcp',
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
    transport: 'mcp',
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
    transport: 'mcp',
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
    transport: 'mcp',
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
    transport: 'mcp',
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
    transport: 'mcp',
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

  // ╔════════════════════════════════════════════════════════════════════╗
  // ║ REST tools — POST https://api.pixellab.ai/v2/<endpoint>            ║
  // ║ Source: api.pixellab.ai/v2/openapi.json                            ║
  // ╚════════════════════════════════════════════════════════════════════╝

  // ── Create (REST) ──────────────────────────────────────────────────────
  {
    id: 'create-image-pixflux',
    transport: 'rest',
    restEndpoint: 'create-image-pixflux',
    restAsync: false,
    category: 'create',
    title: 'Create M-XL image',
    desc: 'Pixflux model — best for 64px and larger',
    sections: [
      { id: 'main', title: 'Image', defaultOpen: true },
      { id: 'image', title: 'Reference (optional)', defaultOpen: false },
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. medieval sawmill building' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 32, max: 400, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 32, max: 400, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: false, group: 'main' },
      { kind: 'image', key: 'init_image', label: 'Init image', group: 'image',
        note: 'Optional starting image — PNG/JPG.' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      init_image: img.init_image as RestImage | undefined,
    }),
  },
  {
    id: 'create-image-pixen',
    transport: 'rest',
    restEndpoint: 'create-image-pixen',
    restAsync: false,
    category: 'create',
    title: 'Create image S-XL (new)',
    desc: 'Pixen model — outline + detail controls',
    badge: 'NEW',
    sections: [
      { id: 'main', title: 'Image', defaultOpen: true },
      { id: 'style', title: 'Style', defaultOpen: false },
      { id: 'view', title: 'View', defaultOpen: false },
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. Pine Tree, stage 1, stardew valley' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 32, max: 512, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 32, max: 512, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'Transparent background', default: true, group: 'main' },
      { kind: 'select', key: 'outline', label: 'Outline', default: 'medium', group: 'style',
        options: [
          { value: 'no outline', label: 'No outline' },
          { value: 'thin',       label: 'Thin' },
          { value: 'medium',     label: 'Medium' },
          { value: 'thick',      label: 'Thick' },
        ] },
      { kind: 'select', key: 'detail', label: 'Detail', default: 'high', group: 'style',
        options: [
          { value: 'low',    label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high',   label: 'High' },
        ] },
      { kind: 'select', key: 'view', label: 'View', default: 'high top-down', group: 'view',
        options: [
          { value: 'none',          label: 'None (objects/scenes)' },
          { value: 'low top-down',  label: 'Low top-down' },
          { value: 'high top-down', label: 'High top-down' },
          { value: 'side',          label: 'Side' },
        ] },
      { kind: 'select', key: 'direction', label: 'Direction', default: 'none', group: 'view',
        options: [
          { value: 'none',  label: 'None' },
          { value: 'south', label: 'South' },
          { value: 'north', label: 'North' },
          { value: 'east',  label: 'East' },
          { value: 'west',  label: 'West' },
        ] },
    ],
    restTransform: (a) => stripUndef({
      description: a.description,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      outline: a.outline,
      detail: a.detail,
      view: a.view !== 'none' ? a.view : undefined,
      direction: a.direction !== 'none' ? a.direction : undefined,
    }),
  },
  {
    id: 'create-image-bitforge',
    transport: 'rest',
    restEndpoint: 'create-image-bitforge',
    restAsync: false,
    category: 'create',
    title: 'Create S-M image',
    desc: 'BitForge model — best for 16-64px',
    sections: [
      { id: 'main', title: 'Image', defaultOpen: true },
      { id: 'image', title: 'References (optional)', defaultOpen: false },
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. pink colored grass' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 16, max: 200, step: 8, default: 32, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 16, max: 200, step: 8, default: 32, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: false, group: 'main' },
      { kind: 'image', key: 'style_image', label: 'Style reference', group: 'image' },
      { kind: 'image', key: 'init_image',  label: 'Init image',      group: 'image' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      style_image: img.style_image as RestImage | undefined,
      init_image:  img.init_image  as RestImage | undefined,
    }),
  },
  {
    id: 'image-to-pixelart',
    transport: 'rest',
    restEndpoint: 'image-to-pixelart',
    restAsync: false,
    category: 'create',
    title: 'Image to pixel art',
    desc: 'Convert any image to pixel art',
    sections: [{ id: 'main', title: 'Source & output', defaultOpen: true }],
    fields: [
      { kind: 'image', key: 'image', label: 'Source image', required: true, group: 'main',
        note: 'Up to 1280×1280; larger images are auto-resized.' },
      { kind: 'slider', key: 'src_width',   label: 'Source width',   min: 16, max: 1280, step: 16, default: 512, suffix: 'px', group: 'main',
        help: 'Approximate source dimensions for the converter.' },
      { kind: 'slider', key: 'src_height',  label: 'Source height',  min: 16, max: 1280, step: 16, default: 512, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'out_width',   label: 'Output width',   min: 16, max: 320,  step: 8,  default: 64,  suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'out_height',  label: 'Output height',  min: 16, max: 320,  step: 8,  default: 64,  suffix: 'px', group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      image: img.image as RestImage | undefined,
      image_size:  { width: a.src_width,  height: a.src_height  },
      output_size: { width: a.out_width,  height: a.out_height },
    }),
  },
  {
    id: 'generate-image-v2',
    transport: 'rest',
    restEndpoint: 'generate-image-v2',
    restAsync: true,
    category: 'create',
    title: 'Create image',
    desc: 'High-quality generation (Pro)',
    badge: 'PRO',
    costInfo: '20 generations',
    sections: [
      { id: 'main', title: 'Image', defaultOpen: true },
      { id: 'image', title: 'References & style', defaultOpen: false },
      ADVANCED_SECTION,
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'Be specific about style and details' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 32, max: 1024, step: 32, default: 256, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 32, max: 1024, step: 32, default: 256, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
      { kind: 'images', key: 'reference_images', label: 'Reference images', max: 4, group: 'image',
        note: 'Up to 4. Refer to them in your description as "reference image 1", etc.' },
      { kind: 'image',  key: 'style_image',      label: 'Style image',      group: 'image',
        note: 'Output size is taken from the style image.' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      reference_images: imageArrToWithSize(img.reference_images as RestImage[] | undefined, a.width as number, a.height as number),
      style_image: img.style_image
        ? { image: img.style_image as RestImage, width: a.width, height: a.height }
        : undefined,
    }),
  },
  {
    id: 'generate-with-style-v2',
    transport: 'rest',
    restEndpoint: 'generate-with-style-v2',
    restAsync: true,
    category: 'create',
    title: 'Create from style reference',
    desc: 'Match your art style across new content (Pro)',
    badge: 'PRO',
    costInfo: '20 generations',
    sections: [
      { id: 'image', title: 'Style references', defaultOpen: true },
      { id: 'main',  title: 'Description',      defaultOpen: true },
    ],
    fields: [
      { kind: 'images', key: 'style_images', label: 'Style reference images', required: true, max: 8, group: 'image',
        note: 'Up to 8 images. PNG/JPG, max 512×512 each.' },
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'Describe what to generate in the extracted style' },
      { kind: 'textarea', key: 'style_description', label: 'Style description', group: 'main', rows: 2,
        placeholder: 'Optional — e.g. vibrant colors, cel-shaded, retro' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 16, max: 512, step: 16, default: 256, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 16, max: 512, step: 16, default: 256, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      style_description: a.style_description,
      style_images: imageArrToWithSize(img.style_images as RestImage[] | undefined, 512, 512),
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
    }),
  },
  {
    id: 'generate-ui-v2',
    transport: 'rest',
    restEndpoint: 'generate-ui-v2',
    restAsync: true,
    category: 'create',
    title: 'Create UI elements',
    desc: 'Generate game UI components (Pro)',
    badge: 'PRO',
    costInfo: '20 generations',
    sections: [
      { id: 'main', title: 'UI element', defaultOpen: true },
      { id: 'image', title: 'Concept (optional)', defaultOpen: false },
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main',
        placeholder: 'e.g. main menu, medieval stone button with gold trim' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 32, max: 512, step: 16, default: 128, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 32, max: 512, step: 16, default: 128, suffix: 'px', group: 'main' },
      { kind: 'text', key: 'color_palette', label: 'Color palette', group: 'main',
        placeholder: 'e.g. brown and gold, blue and silver' },
      { kind: 'image', key: 'concept_image', label: 'Concept sketch', group: 'image' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      image_size: { width: a.width, height: a.height },
      color_palette: a.color_palette,
      concept_image: img.concept_image as RestImage | undefined,
    }),
  },

  // ── Transform (REST) ──────────────────────────────────────────────────
  {
    id: 'edit-image',
    transport: 'rest',
    restEndpoint: 'edit-image',
    restAsync: true,
    category: 'transform',
    title: 'Edit image',
    desc: 'Edit parts of an existing image',
    sections: [
      { id: 'main', title: 'Edit', defaultOpen: true },
      { id: 'size', title: 'Sizes',  defaultOpen: true },
    ],
    fields: [
      { kind: 'image', key: 'reference_image', label: 'Source image', required: true, group: 'main' },
      { kind: 'textarea', key: 'description', label: 'Edit instructions', required: true, group: 'main',
        placeholder: 'e.g. change the hat to red' },
      { kind: 'slider', key: 'src_width',  label: 'Source width',  min: 16, max: 400, step: 8, default: 64, suffix: 'px', group: 'size' },
      { kind: 'slider', key: 'src_height', label: 'Source height', min: 16, max: 400, step: 8, default: 64, suffix: 'px', group: 'size' },
      { kind: 'slider', key: 'tgt_width',  label: 'Target width',  min: 16, max: 400, step: 8, default: 64, suffix: 'px', group: 'size' },
      { kind: 'slider', key: 'tgt_height', label: 'Target height', min: 16, max: 400, step: 8, default: 64, suffix: 'px', group: 'size' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      reference_image: img.reference_image as RestImage | undefined,
      reference_image_size: { width: a.src_width, height: a.src_height },
      target_size: { width: a.tgt_width, height: a.tgt_height },
    }),
  },
  {
    id: 'edit-images-v2',
    transport: 'rest',
    restEndpoint: 'edit-images-v2',
    restAsync: true,
    category: 'transform',
    title: 'Edit image (advanced)',
    desc: 'Advanced AI image editing — text or reference (Pro)',
    badge: 'PRO',
    sections: [
      { id: 'main', title: 'Edit', defaultOpen: true },
      { id: 'image', title: 'Reference (for reference-mode)', defaultOpen: false },
    ],
    fields: [
      { kind: 'select', key: 'method', label: 'Method', default: 'edit_with_text', group: 'main',
        options: [
          { value: 'edit_with_text',      label: 'Edit with text' },
          { value: 'edit_with_reference', label: 'Edit with reference' },
        ] },
      { kind: 'images', key: 'edit_images', label: 'Images to edit', required: true, max: 8, group: 'main' },
      { kind: 'textarea', key: 'description', label: 'Description', group: 'main',
        showWhen: { key: 'method', equals: 'edit_with_text' } },
      { kind: 'slider', key: 'width',  label: 'Output width',  min: 32, max: 512, step: 16, default: 128, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Output height', min: 32, max: 512, step: 16, default: 128, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: false, group: 'main' },
      { kind: 'image', key: 'reference_image', label: 'Reference image', group: 'image',
        showWhen: { key: 'method', equals: 'edit_with_reference' } },
    ],
    restTransform: (a, img) => stripUndef({
      method: a.method,
      description: a.description,
      edit_images: imageArrToWithSize(img.edit_images as RestImage[] | undefined, a.width as number, a.height as number),
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      reference_image: img.reference_image
        ? { image: img.reference_image as RestImage, width: a.width, height: a.height }
        : undefined,
    }),
  },
  {
    id: 'inpaint-v3',
    transport: 'rest',
    restEndpoint: 'inpaint-v3',
    restAsync: true,
    category: 'transform',
    title: 'Inpaint',
    desc: 'Fill masked region with described content (Pro)',
    badge: 'PRO',
    sections: [
      { id: 'main',  title: 'Edit', defaultOpen: true },
      { id: 'image', title: 'Images', defaultOpen: true },
    ],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Description', required: true, group: 'main' },
      { kind: 'boolean',  key: 'no_background', label: 'No background', default: false, group: 'main' },
      { kind: 'image', key: 'inpainting_image', label: 'Source image', required: true, group: 'image' },
      { kind: 'image', key: 'mask_image',       label: 'Mask (white = inpaint)', required: true, group: 'image' },
      { kind: 'image', key: 'context_image',    label: 'Context image', group: 'image' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      no_background: a.no_background,
      inpainting_image: img.inpainting_image as RestImage | undefined,
      mask_image:       img.mask_image       as RestImage | undefined,
      context_image:    img.context_image    as RestImage | undefined,
    }),
  },

  // ── Animate (REST) ────────────────────────────────────────────────────
  {
    id: 'generate-8-rotations-v3',
    transport: 'rest',
    restEndpoint: 'generate-8-rotations-v3',
    restAsync: true,
    category: 'animate',
    title: 'Generate 8 rotations',
    desc: 'Create 8 directional views from a reference frame',
    badge: 'NEW',
    sections: [{ id: 'main', title: 'Reference', defaultOpen: true }],
    fields: [
      { kind: 'image', key: 'first_frame', label: 'First frame', required: true, group: 'main' },
    ],
    restTransform: (_a, img) => stripUndef({
      first_frame: img.first_frame as RestImage | undefined,
    }),
  },
  {
    id: 'animate-with-text-v3',
    transport: 'rest',
    restEndpoint: 'animate-with-text-v3',
    restAsync: true,
    category: 'animate',
    title: 'Animate with text',
    desc: 'Generate animation from text + first frame',
    badge: 'NEW',
    sections: [{ id: 'main', title: 'Animation', defaultOpen: true }],
    fields: [
      { kind: 'image', key: 'first_frame', label: 'First frame', required: true, group: 'main' },
      { kind: 'text',  key: 'action',      label: 'Action', required: true, group: 'main',
        placeholder: 'e.g. running, jumping, waving' },
      { kind: 'slider', key: 'frame_count', label: 'Frame count', min: 4, max: 16, step: 1, default: 8, group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      first_frame: img.first_frame as RestImage | undefined,
      action: a.action,
      frame_count: a.frame_count,
    }),
  },
  {
    id: 'animate-with-text-v2',
    transport: 'rest',
    restEndpoint: 'animate-with-text-v2',
    restAsync: true,
    category: 'animate',
    title: 'Animate with text (Pro)',
    desc: 'Add animation to existing image — view/direction control',
    badge: 'PRO',
    sections: [
      { id: 'main', title: 'Animation', defaultOpen: true },
      { id: 'view', title: 'View',      defaultOpen: false },
    ],
    fields: [
      { kind: 'image', key: 'reference_image', label: 'Reference image', required: true, group: 'main' },
      { kind: 'text',  key: 'action',          label: 'Action', required: true, group: 'main' },
      { kind: 'slider', key: 'src_width',  label: 'Reference width',  min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'src_height', label: 'Reference height', min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'width',      label: 'Output width',     min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height',     label: 'Output height',    min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
      { kind: 'select', key: 'view', label: 'View', default: 'none', group: 'view',
        options: [
          { value: 'none',          label: 'None' },
          { value: 'low top-down',  label: 'Low top-down' },
          { value: 'high top-down', label: 'High top-down' },
          { value: 'side',          label: 'Side' },
        ] },
      { kind: 'select', key: 'direction', label: 'Direction', default: 'none', group: 'view',
        options: [
          { value: 'none',       label: 'None' },
          { value: 'south',      label: 'South' },
          { value: 'north',      label: 'North' },
          { value: 'east',       label: 'East' },
          { value: 'west',       label: 'West' },
          { value: 'south-east', label: 'South-east' },
          { value: 'south-west', label: 'South-west' },
          { value: 'north-east', label: 'North-east' },
          { value: 'north-west', label: 'North-west' },
        ] },
    ],
    restTransform: (a, img) => stripUndef({
      reference_image: img.reference_image as RestImage | undefined,
      reference_image_size: { width: a.src_width, height: a.src_height },
      action: a.action,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
      view: a.view !== 'none' ? a.view : undefined,
      direction: a.direction !== 'none' ? a.direction : undefined,
    }),
  },
  {
    id: 'interpolation-v2',
    transport: 'rest',
    restEndpoint: 'interpolation-v2',
    restAsync: true,
    category: 'animate',
    title: 'Interpolate',
    desc: 'Animate between two frames',
    badge: 'NEW',
    sections: [{ id: 'main', title: 'Interpolation', defaultOpen: true }],
    fields: [
      { kind: 'image', key: 'start_image', label: 'Start frame', required: true, group: 'main' },
      { kind: 'image', key: 'end_image',   label: 'End frame',   required: true, group: 'main' },
      { kind: 'text',  key: 'action',      label: 'Action',      required: true, group: 'main',
        placeholder: 'e.g. morphing, walking, transforming' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 16, max: 128, step: 8, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 16, max: 128, step: 8, default: 64, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      start_image: img.start_image as RestImage | undefined,
      end_image:   img.end_image   as RestImage | undefined,
      action: a.action,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
    }),
  },
  {
    id: 'transfer-outfit-v2',
    transport: 'rest',
    restEndpoint: 'transfer-outfit-v2',
    restAsync: true,
    category: 'animate',
    title: 'Transfer outfit to animation',
    desc: 'Apply outfit from a reference to animation frames (Pro)',
    badge: 'PRO',
    sections: [{ id: 'main', title: 'Outfit transfer', defaultOpen: true }],
    fields: [
      { kind: 'image',  key: 'reference_image', label: 'Outfit reference', required: true, group: 'main' },
      { kind: 'images', key: 'frames',          label: 'Animation frames', required: true, max: 16, group: 'main' },
      { kind: 'slider', key: 'width',  label: 'Output width',  min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Output height', min: 32, max: 256, step: 16, default: 64, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      reference_image: img.reference_image as RestImage | undefined,
      frames: img.frames as RestImage[] | undefined,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
    }),
  },
  {
    id: 'edit-animation-v2',
    transport: 'rest',
    restEndpoint: 'edit-animation-v2',
    restAsync: true,
    category: 'animate',
    title: 'Edit animation',
    desc: 'Modify frames of an existing animation (Pro)',
    badge: 'PRO',
    sections: [{ id: 'main', title: 'Edit', defaultOpen: true }],
    fields: [
      { kind: 'textarea', key: 'description', label: 'Edit instructions', required: true, group: 'main' },
      { kind: 'images',   key: 'frames',      label: 'Animation frames', required: true, max: 16, group: 'main',
        note: '2–16 frames.' },
      { kind: 'slider', key: 'width',  label: 'Output width',  min: 16, max: 256, step: 8, default: 64, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Output height', min: 16, max: 256, step: 8, default: 64, suffix: 'px', group: 'main' },
      { kind: 'boolean', key: 'no_background', label: 'No background', default: true, group: 'main' },
    ],
    restTransform: (a, img) => stripUndef({
      description: a.description,
      frames: img.frames as RestImage[] | undefined,
      image_size: { width: a.width, height: a.height },
      no_background: a.no_background,
    }),
  },

  // ── Utility (REST) ────────────────────────────────────────────────────
  {
    id: 'remove-background',
    transport: 'rest',
    restEndpoint: 'remove-background',
    restAsync: false,
    category: 'utility',
    title: 'Remove background',
    desc: 'Strip the background from a pixel-art image',
    badge: 'NEW',
    sections: [{ id: 'main', title: 'Image', defaultOpen: true }],
    fields: [
      { kind: 'image', key: 'image', label: 'Source image', required: true, group: 'main' },
      { kind: 'slider', key: 'width',  label: 'Width',  min: 16, max: 400, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'slider', key: 'height', label: 'Height', min: 16, max: 400, step: 8, default: 128, suffix: 'px', group: 'main' },
      { kind: 'select', key: 'background_removal_task', label: 'Task', default: 'remove_simple_background', group: 'main',
        options: [
          { value: 'remove_simple_background',  label: 'Simple background' },
          { value: 'remove_complex_background', label: 'Complex background' },
        ] },
      { kind: 'text', key: 'text_hint', label: 'Foreground hint', group: 'main',
        placeholder: 'Optional — e.g. wizard, treasure chest' },
    ],
    restTransform: (a, img) => stripUndef({
      image: img.image as RestImage | undefined,
      image_size: { width: a.width, height: a.height },
      background_removal_task: a.background_removal_task,
      text_hint: a.text_hint,
    }),
  },
];

// ── REST transformer helpers ─────────────────────────────────────────────

function stripUndef<T extends Record<string, unknown>>(o: T): T {
  for (const k of Object.keys(o)) {
    const v = (o as Record<string, unknown>)[k];
    if (v === undefined || v === null || v === '' ||
        (Array.isArray(v) && v.length === 0)) {
      delete (o as Record<string, unknown>)[k];
    }
  }
  return o;
}

function imageArrToWithSize(
  arr: RestImage[] | undefined,
  width: number,
  height: number,
): RestImageWithSize[] | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr.map((image) => ({ image, width, height }));
}

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
