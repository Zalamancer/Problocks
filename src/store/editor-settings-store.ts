import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Editor/Studio preferences — mirrors the subset of Roblox Studio Settings
 * we're surfacing so far. Field names follow our own casing but trace 1:1
 * back to docs/roblox-studio-settings.md.
 *
 * See `docs/roblox-studio-settings.md` for the full reference we pull from.
 */

// --- Studio (general) ----------------------------------------------------

export type CameraSpeedAdjustBinding = 'shift' | 'ctrl' | 'off';

export interface StudioGeneralSettings {
  /** Roblox: "Always Save Script Changes" */
  alwaysSaveScriptChanges: boolean;
  /** Roblox: "Auto-Recovery Enabled" */
  autoRecoveryEnabled: boolean;
  /** Roblox: "Auto-Recovery Interval (Minutes)" */
  autoRecoveryIntervalMinutes: number;
  /** Roblox: "Show Diagnostics Bar" — bottom-of-viewport perf HUD */
  showDiagnosticsBar: boolean;
  /** Roblox: "Camera Speed" */
  cameraSpeed: number;
  /** Roblox: "Camera Shift Speed" */
  cameraShiftSpeed: number;
  /** Roblox: "Camera Zoom to Mouse Position" */
  cameraZoomToMousePosition: boolean;
  /** Roblox: "Camera Speed Adjust Binding" */
  cameraSpeedAdjustBinding: CameraSpeedAdjustBinding;
}

// --- Script Editor --------------------------------------------------------

export type AutoIndentRule = 'none' | 'absolute' | 'relative';

export interface ScriptEditorSettings {
  /** Roblox: "Font" size — typeface is platform-default for now */
  fontSize: number;
  /** Roblox: "Tab Width" */
  tabWidth: number;
  /** Roblox: "Indent Using Spaces" */
  indentUsingSpaces: boolean;
  /** Roblox: "Text Wrapping" */
  textWrapping: boolean;
  /** Roblox: "Show Whitespace" */
  showWhitespace: boolean;
  /** Roblox: "Highlight Current Line" */
  highlightCurrentLine: boolean;
  /** Roblox: "Scroll Past Last Line" */
  scrollPastLastLine: boolean;
  /** Roblox: "EnableIndentationRulers" */
  enableIndentationRulers: boolean;
  /** Roblox: "Enable Autocomplete" */
  enableAutocomplete: boolean;
  /** Roblox: "Auto Closing Brackets" */
  autoClosingBrackets: boolean;
  /** Roblox: "Auto Closing Quotes" */
  autoClosingQuotes: boolean;
  /** Roblox: "Format On Paste" */
  formatOnPaste: boolean;
  /** Roblox: "Auto Indent Rule" */
  autoIndentRule: AutoIndentRule;
}

// --- Editor theme ---------------------------------------------------------
//
// Matches Roblox's `StudioScriptEditorColorPresets` enum plus the short-list
// of individually tunable `Color3` tokens we surface in the UI. The full
// ~40-token palette lives in docs/roblox-studio-settings.md and can be added
// here later without breaking persisted state.

export type EditorThemePreset =
  | 'default'
  | 'default-dark'
  | 'extra-dark'
  | 'earth-tones'
  | 'high-contrast'
  | 'resynth'
  | 'sublime';

export interface EditorThemeColors {
  background: string;
  textColor: string;
  keywordColor: string;
  stringColor: string;
  numberColor: string;
  commentColor: string;
  operatorColor: string;
  functionNameColor: string;
  currentLineHighlightColor: string;
  selectionBackgroundColor: string;
  errorColor: string;
  warningColor: string;
}

export const EDITOR_THEME_PRESETS: Record<EditorThemePreset, { label: string; colors: EditorThemeColors }> = {
  'default': {
    label: 'Default (Light)',
    colors: {
      background: '#ffffff',
      textColor: '#1f1f1f',
      keywordColor: '#0000ff',
      stringColor: '#a31515',
      numberColor: '#098658',
      commentColor: '#008000',
      operatorColor: '#1f1f1f',
      functionNameColor: '#795e26',
      currentLineHighlightColor: '#f4f4f4',
      selectionBackgroundColor: '#add6ff',
      errorColor: '#e51400',
      warningColor: '#b89500',
    },
  },
  'default-dark': {
    label: 'Default Dark',
    colors: {
      background: '#1e1e1e',
      textColor: '#d4d4d4',
      keywordColor: '#569cd6',
      stringColor: '#ce9178',
      numberColor: '#b5cea8',
      commentColor: '#6a9955',
      operatorColor: '#d4d4d4',
      functionNameColor: '#dcdcaa',
      currentLineHighlightColor: '#2a2a2a',
      selectionBackgroundColor: '#264f78',
      errorColor: '#f48771',
      warningColor: '#cca700',
    },
  },
  'extra-dark': {
    label: 'Extra Dark',
    colors: {
      background: '#000000',
      textColor: '#cccccc',
      keywordColor: '#4ea0ff',
      stringColor: '#ffa07a',
      numberColor: '#90ee90',
      commentColor: '#6a9955',
      operatorColor: '#cccccc',
      functionNameColor: '#f0e68c',
      currentLineHighlightColor: '#141414',
      selectionBackgroundColor: '#1d4a78',
      errorColor: '#ff6b6b',
      warningColor: '#ffcc00',
    },
  },
  'earth-tones': {
    label: 'Earth Tones',
    colors: {
      background: '#2b2a28',
      textColor: '#d8c9a6',
      keywordColor: '#c68256',
      stringColor: '#9ba657',
      numberColor: '#d9a45c',
      commentColor: '#7a6e53',
      operatorColor: '#d8c9a6',
      functionNameColor: '#e8b266',
      currentLineHighlightColor: '#35332f',
      selectionBackgroundColor: '#50483a',
      errorColor: '#c45a4a',
      warningColor: '#d9a45c',
    },
  },
  'high-contrast': {
    label: 'High Contrast',
    colors: {
      background: '#000000',
      textColor: '#ffffff',
      keywordColor: '#00ffff',
      stringColor: '#ff69b4',
      numberColor: '#00ff00',
      commentColor: '#7cfc00',
      operatorColor: '#ffffff',
      functionNameColor: '#ffff00',
      currentLineHighlightColor: '#1a1a1a',
      selectionBackgroundColor: '#0050a0',
      errorColor: '#ff0000',
      warningColor: '#ffaa00',
    },
  },
  'resynth': {
    label: 'Resynth',
    colors: {
      background: '#1b1d23',
      textColor: '#c5cdd9',
      keywordColor: '#b48ead',
      stringColor: '#a3be8c',
      numberColor: '#d08770',
      commentColor: '#545862',
      operatorColor: '#88c0d0',
      functionNameColor: '#81a1c1',
      currentLineHighlightColor: '#24272e',
      selectionBackgroundColor: '#3b4252',
      errorColor: '#bf616a',
      warningColor: '#ebcb8b',
    },
  },
  'sublime': {
    label: 'Sublime',
    colors: {
      background: '#272822',
      textColor: '#f8f8f2',
      keywordColor: '#f92672',
      stringColor: '#e6db74',
      numberColor: '#ae81ff',
      commentColor: '#75715e',
      operatorColor: '#f8f8f2',
      functionNameColor: '#a6e22e',
      currentLineHighlightColor: '#3e3d32',
      selectionBackgroundColor: '#49483e',
      errorColor: '#f92672',
      warningColor: '#fd971f',
    },
  },
};

export interface EditorThemeState {
  preset: EditorThemePreset;
  /** Hand-tuned overrides — only populated when user edits a swatch */
  overrides: Partial<EditorThemeColors>;
}

// --- Store ----------------------------------------------------------------

interface EditorSettingsState {
  studio: StudioGeneralSettings;
  scriptEditor: ScriptEditorSettings;
  theme: EditorThemeState;
  setStudio: <K extends keyof StudioGeneralSettings>(key: K, value: StudioGeneralSettings[K]) => void;
  setScriptEditor: <K extends keyof ScriptEditorSettings>(key: K, value: ScriptEditorSettings[K]) => void;
  setThemePreset: (preset: EditorThemePreset) => void;
  setThemeColor: <K extends keyof EditorThemeColors>(key: K, value: EditorThemeColors[K]) => void;
  resetThemeOverrides: () => void;
}

const DEFAULT_STUDIO: StudioGeneralSettings = {
  alwaysSaveScriptChanges: true,
  autoRecoveryEnabled: true,
  autoRecoveryIntervalMinutes: 5,
  showDiagnosticsBar: false,
  cameraSpeed: 1,
  cameraShiftSpeed: 2,
  cameraZoomToMousePosition: true,
  cameraSpeedAdjustBinding: 'shift',
};

const DEFAULT_SCRIPT_EDITOR: ScriptEditorSettings = {
  fontSize: 14,
  tabWidth: 4,
  indentUsingSpaces: true,
  textWrapping: false,
  showWhitespace: false,
  highlightCurrentLine: true,
  scrollPastLastLine: true,
  enableIndentationRulers: true,
  enableAutocomplete: true,
  autoClosingBrackets: true,
  autoClosingQuotes: true,
  formatOnPaste: false,
  autoIndentRule: 'relative',
};

const DEFAULT_THEME: EditorThemeState = {
  preset: 'default-dark',
  overrides: {},
};

export const useEditorSettings = create<EditorSettingsState>()(
  persist(
    (set) => ({
      studio: DEFAULT_STUDIO,
      scriptEditor: DEFAULT_SCRIPT_EDITOR,
      theme: DEFAULT_THEME,
      setStudio: (key, value) =>
        set((s) => ({ studio: { ...s.studio, [key]: value } })),
      setScriptEditor: (key, value) =>
        set((s) => ({ scriptEditor: { ...s.scriptEditor, [key]: value } })),
      setThemePreset: (preset) =>
        set({ theme: { preset, overrides: {} } }),
      setThemeColor: (key, value) =>
        set((s) => ({
          theme: { ...s.theme, overrides: { ...s.theme.overrides, [key]: value } },
        })),
      resetThemeOverrides: () =>
        set((s) => ({ theme: { ...s.theme, overrides: {} } })),
    }),
    { name: 'problocks-editor-settings' },
  ),
);

/** Merge preset colors with user overrides into the final effective palette. */
export function resolveThemeColors(state: EditorThemeState): EditorThemeColors {
  const base = EDITOR_THEME_PRESETS[state.preset].colors;
  return { ...base, ...state.overrides };
}
