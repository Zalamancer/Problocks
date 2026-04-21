// Shared types for the homework tutor chatbot.
//
// CharacterRig describes a 2D humanoid built from layered PNGs (body, arms,
// legs, head, hair, eyes, brows, etc.) with a dedicated mouth slot that is
// swapped on the fly during speech via a viseme map.

// Standard 8-viseme set (Preston-Blair-ish). Keep the list short so the
// asset pipeline stays manageable — one PNG per key.
export type VisemeKey =
  | 'rest' // mouth closed / neutral
  | 'mbp'  // /m/, /b/, /p/ — lips pressed
  | 'ai'   // /a/, /i/ — wide open
  | 'e'    // /e/ — half-open wide
  | 'o'    // /o/ — round
  | 'u'    // /u/, /w/ — pursed
  | 'fv'   // /f/, /v/ — teeth on lower lip
  | 'l';   // /l/, /th/ — tongue up

// A body-layer PNG in the rig. `z` controls draw order (low → high),
// coordinates/sizes are in the rig's local 0–100 viewport so placement
// is resolution-independent.
export type RigLayer = {
  id: string;
  src: string;       // PNG url (absolute or /public-relative)
  x?: number;        // left %  (0–100), default 0
  y?: number;        // top  %  (0–100), default 0
  w?: number;        // width  %, default 100
  h?: number;        // height %, default 100
  z: number;         // stacking order
  flipX?: boolean;   // mirror horizontally
};

export type CharacterRig = {
  // Body / accessory layers rendered in z-order under and around the mouth.
  layers: RigLayer[];
  // Viseme → PNG map. A missing key falls back to 'rest'.
  visemes: Partial<Record<VisemeKey, string>>;
  // Mouth placement in the rig's 0–100 viewport.
  mouth: { x: number; y: number; w: number; h: number; z: number };
  // Optional aspect — defaults to 3:4 (portrait). Affects the container
  // height relative to its width.
  aspect?: number;
};

export type TutorMessage = {
  id: string;
  role: 'tutor' | 'student';
  text: string;
  ts: number;
};
