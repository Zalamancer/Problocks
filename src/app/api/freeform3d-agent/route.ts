/**
 * Freeform 3D agent — drives the kid-style Three.js scene (prefabs),
 * NOT an iframe game. Takes the user message + current freeform3d scene
 * snapshot + active prefab style, and streams back structured mutation
 * actions the client applies through `useFreeform3D`.
 *
 * Why a dedicated route (vs reusing /api/studio-agent):
 * the legacy studio-agent targets scene-store (free parts) and
 * building-store (grid tiles) — a completely different vocabulary. The
 * freeform3d world speaks in prefab kinds (house, tree-oak, character)
 * with per-instance color/props. Forking is cheaper than parameterizing
 * every line of the legacy prompt.
 *
 * Output contract from Claude CLI is line-delimited:
 *   ACTION: {"type":"addPrefab", "kind":"house", "position":[0,0,-5]}
 *   ACTION: {"type":"updatePrefab", "id":"o_abc", "color":"#ff0000"}
 *   Any non-ACTION line is treated as narration.
 *
 * Over SSE we emit:
 *   { status: "..." }           — step markers
 *   { action: {...} }           — one applied action
 *   { text: "..." }             — narration chunks
 *   [DONE]                      — stream end
 */
import { spawn } from 'child_process';
import { homedir } from 'os';
import {
  getPrefabsForStyle,
  PREFAB_STYLES,
  type PrefabStyleId,
  type PrefabDef,
} from '@/lib/kid-style-3d/prefabs';

// --- Scene snapshot (matches what ChatPanel ships for freeform3d) ---

interface Freeform3DSnapshot {
  /** Currently-active kit — the agent is only allowed to use prefab
      kinds registered under this style. */
  activeStyle: PrefabStyleId;
  /** Existing objects so the agent can reference them for updates/removes. */
  objects: Array<{
    id: string;
    kind: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color?: string;
    props?: Record<string, unknown>;
    /** Slice 4 — already-attached click/tick behaviors so the agent
        sees its prior tycoon wiring and can edit (clearBehaviors then
        re-attach) instead of duplicating. */
    behaviors?: Array<{
      on: 'click' | 'tick';
      action: Record<string, unknown>;
      interval?: number;
    }>;
  }>;
  /** Slice 4 — declared variables / upgrades / HUD so far. Keeps the
      agent idempotent across messages: re-asking for "a tycoon" with
      coins+podium already declared shouldn't double them up. */
  gameLogic?: {
    variables: Record<string, {
      name: string;
      initial: number;
      serverside: boolean;
      label?: string;
    }>;
    upgrades: Record<string, {
      id: string;
      label: string;
      cost: number;
      effect: Record<string, unknown>;
    }>;
    hud: Array<{ id: string; type: string; anchor: string; bind?: string; title?: string }>;
  };
}

function cliEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HOME: process.env.HOME || homedir(),
    PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    USER: process.env.USER || '',
    SHELL: process.env.SHELL || '/bin/zsh',
    TERM: 'xterm-256color',
  };
}

function streamClaude(
  prompt: string,
  onText: (text: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let sent = false;
    const child = spawn(
      'claude',
      ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions'],
      { env: cliEnv() },
    );

    child.stdout.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        try {
          const p = JSON.parse(line);
          if (p.type === 'system' || p.type === 'rate_limit_event') continue;
          if (p.type === 'assistant' && p.message?.content) {
            for (const b of p.message.content) {
              if (b.type === 'text' && b.text) {
                onText(b.text);
                sent = true;
              }
            }
          }
          if (p.type === 'result' && p.result && !sent) {
            onText(p.result);
          }
        } catch {
          /* skip */
        }
      }
    });

    child.on('close', () => resolve());
    child.on('error', reject);
  });
}

// --- Prompt composition ------------------------------------------------

function catalog(prefabs: PrefabDef[]): string {
  const byCategory = new Map<string, PrefabDef[]>();
  for (const p of prefabs) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const order = ['primitives', 'nature', 'buildings', 'characters'] as const;
  return order
    .filter((cat) => byCategory.has(cat))
    .map((cat) => {
      const items = byCategory.get(cat)!;
      const lines = items.map((p) => {
        const propHint =
          p.props && p.props.length
            ? ` (props: ${p.props.map((pr) => pr.key).join(', ')})`
            : '';
        return `    - ${p.kind}  — ${p.label}, default color ${p.defaultColor}${propHint}`;
      });
      return `  ${cat}:\n${lines.join('\n')}`;
    })
    .join('\n');
}

function styleDescription(style: PrefabStyleId): string {
  const entry = PREFAB_STYLES.find((s) => s.id === style);
  return entry ? `${entry.label} — ${entry.desc}` : style;
}

const FREEFORM3D_PROMPT = (
  userMsg: string,
  scene: Freeform3DSnapshot,
  conversation: { role: string; content: string }[],
  prefabs: PrefabDef[],
) => {
  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const objectsDump = scene.objects.length
    ? scene.objects
        .map((o) => {
          const beh = (o.behaviors && o.behaviors.length)
            ? ` behaviors=[${o.behaviors.map((b) => `${b.on}:${(b.action as { do?: string }).do ?? '?'}`).join(',')}]`
            : '';
          return `  id=${o.id} kind=${o.kind} pos=(${o.position.join(',')}) color=${o.color ?? '-'}${beh}`;
        })
        .join('\n')
    : '  (scene is empty)';

  // Slice 4 — surface declared game logic so the agent doesn't re-define
  // existing variables / upgrades / HUD when extending a tycoon.
  const gl = scene.gameLogic ?? { variables: {}, upgrades: {}, hud: [] };
  const varList = Object.values(gl.variables);
  const upList = Object.values(gl.upgrades);
  const gameLogicDump = (
    `Variables: ${
      varList.length
        ? varList.map((v) => `${v.name}=${v.initial}${v.serverside ? '[server]' : ''}`).join(', ')
        : '(none)'
    }\n` +
    `Upgrades:  ${
      upList.length
        ? upList.map((u) => `${u.id}($${u.cost})`).join(', ')
        : '(none)'
    }\n` +
    `HUD:       ${
      gl.hud.length ? gl.hud.map((h) => `${h.type}@${h.anchor}`).join(', ') : '(none)'
    }`
  );

  return `You are the Playdemy 3D Freeform agent. You build kid-style Three.js
scenes by emitting ACTION lines that add/edit/remove prefabs. You do NOT
write HTML, you do NOT run code — your output mutates the live scene.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current user message: "${userMsg}"

## Current scene (active style: ${styleDescription(scene.activeStyle)})

Objects:
${objectsDump}

Game logic:
${gameLogicDump}

## Available prefab kinds — USE EXACTLY THESE strings for "kind"

${catalog(prefabs)}

## Output format

Every mutation is ONE LINE starting with "ACTION: " followed by a single JSON
object. Narration text can appear between ACTION lines; keep it short.

### Add a prefab

  {"type":"addPrefab","kind":"house","position":[0,0,-5]}
  {"type":"addPrefab","id":"shop1_tile","kind":"rounded-box","position":[-9,0,-11],"scale":[2.0,0.04,1.33],"color":"#e63946"}
  {"type":"addPrefab","kind":"tree-oak","position":[7,0,3],"rotation":[0,1.2,0],"scale":[1,1,1],"color":"#58c04d"}
  {"type":"addPrefab","kind":"house","position":[0,0,-5],"props":{"roofColor":"#e63946","doorColor":"#3a1e12"}}

    — kind MUST be one of the ids in the catalog above. Do NOT invent ids.
    — position/rotation/scale are [x,y,z] arrays. y=0 is the ground plane.
    — rotation is radians (Euler XYZ). Omit to keep defaults.
    — scale defaults to [1,1,1]. Typical range 0.5 – 3.
    — color is a CSS hex string; most prefabs tint their "primary" surface.
    — props lets you override per-prefab colors/lengths; only send props
      documented in the catalog above (e.g. house: roofColor, doorColor,
      trimColor, foundationColor; fence: length).
    — "id" is OPTIONAL. When you set one, the client uses it as the
      object's permanent id, so you can reference it from addBehavior
      later in the SAME response. Ids must match ^[a-zA-Z0-9_-]{1,40}$
      and be unique. If you omit id, the client auto-mints (behaviors
      in the same response can't reach it — only later messages can).

## Color palette — REQUIRED for anything that reads as a "game"

Kid-mode / Roblox / Pokopia worlds look cartoony and VIVID. Muted /
desaturated / pastel hex values read as blueprint mockups, not
games. When you need a color for any prefab or prop, pick from or
scale from THIS palette. Avoid anything less saturated than these:

  Nature / ground
    grass_green   #58c04d    (ground plane / grass plots)
    leaf_green    #4ea83c    (tree leaves / bushes)
    dirt_brown    #a0643c    (paths / dirt patches)
    wood_brown    #8b5c3b    (trunks, fence posts, upgrade posts)
    stone_gray    #b8b8b8    (path stones / rocks)
    cream_warm    #ffe4bf    (foundations / warm neutrals)

  Vivid accents (shops, pets, signs, toys)
    vivid_red     #e63946
    vivid_orange  #ff8c1a
    vivid_yellow  #ffd60a
    vivid_green   #38d86a
    vivid_blue    #3a9cf0
    vivid_purple  #a349e6
    vivid_pink    #ff3d9a
    vivid_cyan    #2ad4d0

  Pet body shades (pick one per pet)
    puppy_pink    #ff5c9e
    kitty_orange  #ff8e2b
    bunny_white   #fff8e7
    dragon_purple #b14aed
    baby_blue     #5bb6ff
    lime_green    #8de63c
    sunny_yellow  #ffd84d

  Neutrals
    white_pure    #ffffff
    black_ink     #111111

DO NOT use washed-out pastels (e.g. #8fcc8f, #c4b4a0, #f4a261,
#ffefd5, #9d7ae8, #7ab0d8, #d4a86a, #c44536). Those read grey next
to the vivid palette. If a scene has been authored with pastel hex
values, CLEAR and rebuild with the vivid palette instead.

### Update an existing prefab

  {"type":"updatePrefab","id":"o_abc12345","color":"#ff0000"}
  {"type":"updatePrefab","id":"o_abc12345","position":[4,0,2],"rotation":[0,1.57,0]}

    — id MUST come from the scene dump above. Do NOT invent ids.
    — omit fields you don't want to change.

### Remove

  {"type":"removePrefab","id":"o_abc12345"}
  {"type":"clearScene"}
    — clearScene removes EVERY object. Use sparingly (e.g. "start over").

## Tycoon scripting — make the world a real game

When the user asks for a tycoon (or any game with money / shops /
upgrades / inventory), do not just place cubes. Wire behaviors,
declare variables, define an upgrade catalog, and add the HUD.
The runtime applies these live: clicking a shop deducts coins on
the server, ticking pets earn over time, upgrades multiply rates.

### 1. Declare game variables

  {"type":"defineVariable","name":"coins","initial":50,"serverside":true,"label":"Coins"}

    — name MUST be a short ascii id; the HUD's "bind" points at it.
    — serverside:true means money is server-authoritative (the buy /
      tick API enforces it). Use serverside:true for coins / gems /
      anything spendable. serverside:false is for cosmetic local
      counters.
    — initial is the starting value. 50 coins is the standard tycoon
      seed: enough for the first one or two shops.

### 2. Attach behaviors to prefabs

  {"type":"addBehavior","prefabId":"o_shop1","on":"click","action":{
    "do":"buy",
    "cost":50,
    "addToInventory":"pet_red",
    "label":"Red Pet"}}

  {"type":"addBehavior","prefabId":"o_pet1","on":"tick","action":{
    "do":"earn","amount":2,"requires":"pet_red"},"interval":1}

  {"type":"addBehavior","prefabId":"o_upBtn","on":"click","action":{
    "do":"buyUpgrade","upgradeId":"speed_2x"}}

  {"type":"addBehavior","prefabId":"o_podium","on":"click","action":{
    "do":"grant","to":"coins","amount":10,"oncePerSession":true}}

    — prefabId MUST come from the scene dump above. Behaviors only
      fire on existing prefabs; never invent ids.
    — Click behaviors fire on a play-mode click. Tick behaviors fire
      every "interval" seconds (default 1). Tick "earn" only credits
      when the player owns "requires" (the inventory id).
    — One behavior per prefab is the common case. Multiple are
      allowed — e.g. a podium that both grants on click AND earns
      on tick — but keep it simple unless the user asked for it.
    — clearBehaviors wipes everything from one prefab; use it before
      re-attaching when the agent wants to change a shop's price.

### 3. Define purchasable upgrades

  {"type":"defineUpgrade","id":"speed_2x","label":"Sprint Boots",
    "cost":200,"effect":{"kind":"multiply","target":"playerSpeed","factor":2}}

  {"type":"defineUpgrade","id":"earn_2x","label":"Golden Ticket",
    "cost":500,"effect":{"kind":"multiply","target":"earnRate","factor":2}}

    — id MUST be a short ascii string; behaviors reference it via
      buyUpgrade.upgradeId.
    — effect.kind = "multiply" with target ∈ {earnRate, playerSpeed,
      jumpHeight} and a factor. Factor is the multiplier applied
      ONCE on purchase (so 2x stacks if bought twice — but the buy
      API treats upgrade ids as a set, so the same id can't stack;
      the agent should declare "earn_3x" / "earn_5x" tiers if it
      wants escalation).
    — Or effect.kind = "unlock" with a flag string for future-gated
      content. Today the runtime exposes the flag; behaviors that
      consume it land in slice 6+.

### 4. Add HUD elements

  {"type":"addHUD","id":"h_coin","hudType":"coinCounter",
    "bind":"coins","anchor":"top-right"}
  {"type":"addHUD","id":"h_inv","hudType":"inventory","anchor":"top-left","title":"Pets"}
  {"type":"addHUD","id":"h_up","hudType":"upgradePanel","anchor":"bottom-right","title":"Upgrades"}

    — id MUST be unique per HUD element; re-emitting the same id
      replaces the prior element (idempotent).
    — hudType is one of: coinCounter, inventory, upgradePanel.
    — anchor pins the element to a corner. Avoid two elements at
      the same anchor unless they read well stacked.
    — bind is the variable name the counter reads — usually "coins".
    — Always declare a coinCounter when the world has serverside
      coins; otherwise the player can't see their balance.

### 5. Removals (rare; keep the agent idempotent before reaching for these)

  {"type":"removeVariable","name":"coins"}
  {"type":"removeUpgrade","id":"speed_2x"}
  {"type":"removeHUD","id":"h_coin"}
  {"type":"clearBehaviors","prefabId":"o_shop1"}

## Arcade primitives — kickBall / roll / claimIf

For games like "kick a ball" / "throw as far as possible" / "unbox a
mystery pet" / "claim a trophy at 100m", use these three extra
behavior action types. They are client-only (no server round-trip
for kickBall) or reuse buy/earn (for roll + claimIf).

### kickBall — click pad, ball arcs forward, distance tracked

  {"type":"addBehavior","prefabId":"kick_pad","on":"click","action":{
    "do":"kickBall","baseSpeed":8,"duration":1.4,"trackVar":"bestKick",
    "ballColor":"#ffffff"}}

    — A white sphere tweens from the clicked pad along world +X
      for "duration" seconds with a parabolic arc. Total distance =
      baseSpeed × duration × kickRangeMultiplier.
    — Owned upgrades with effect {kind:'multiply', target:'kickRange'}
      scale the distance. Stack by buying multiple upgrade tiers.
    — trackVar (default 'bestKick') is a CLIENT-ONLY variable that
      gets max'd with the landing distance. Declare it as
      serverside:false so the HUD reads it from local state.
    — baseSpeed 6–15 is the honest feel-good range. duration 1.0–1.8.
      Do not use speeds > 30 — the ball flies off-screen and reads
      as bugged.

### roll — weighted random unboxing

  {"type":"addBehavior","prefabId":"mystery_crate","on":"click","action":{
    "do":"roll","cost":100,
    "drops":[
      {"inventory":"pet_puppy", "weight":3,"label":"Puppy"},
      {"inventory":"pet_kitty", "weight":2,"label":"Kitty"},
      {"inventory":"pet_dragon","weight":1,"label":"Dragon"}
    ]}}

    — Deducts cost, rolls one drop from the weighted list, adds its
      inventory id to the player's row. Toast says "You got: <label>".
    — Weights are relative. [{weight:3}, {weight:1}] = 75%/25%.
    — Keep the pool to 3–6 drops. The dragon/legendary drop should
      be a small weight (1) so rarity feels earned.

### claimIf — conditional trophy

  {"type":"addBehavior","prefabId":"trophy_bronze","on":"click","action":{
    "do":"claimIf","ifVar":"bestKick","gte":50,"reward":100,
    "trophyId":"trophy_bronze","label":"Bronze"}}

    — Client gate: fires ONLY when localVars[ifVar] >= gte AND the
      player doesn't already own trophyId. Otherwise a toast tells
      them the threshold.
    — On claim: grants "reward" coins + adds trophyId to inventory
      (via a cost-0 buy + an earn call). One trophy per click; once
      claimed, the button stays inert.
    — Pick thresholds that feel achievable: bronze at 50m, silver
      at 150m, gold at 500m. Rewards scale with the grind.

### Tycoon wiring example — PASTE INLINE WITH THE CUBE PLACEMENTS

The addPrefab lines for shop tiles and pet bodies set explicit ids
(shop1_tile, pet1_body, …). After the cube placements, emit these
in the SAME response (never in a follow-up):

  // money
  {"type":"defineVariable","name":"coins","initial":50,"serverside":true,"label":"Coins"}
  {"type":"addHUD","id":"h_coin","hudType":"coinCounter","bind":"coins","anchor":"top-right"}
  {"type":"addHUD","id":"h_inv","hudType":"inventory","anchor":"top-left","title":"Pets"}
  {"type":"addHUD","id":"h_up","hudType":"upgradePanel","anchor":"bottom-right","title":"Upgrades"}

  // shops — click→buy on the shop N tile cube (id=shopN_tile)
  {"type":"addBehavior","prefabId":"shop1_tile","on":"click",
    "action":{"do":"buy","cost":50,"addToInventory":"pet_puppy","label":"Puppy"}}
  {"type":"addBehavior","prefabId":"shop2_tile","on":"click",
    "action":{"do":"buy","cost":200,"addToInventory":"pet_kitty","label":"Kitty"}}

  // pets — tick→earn on the pet N body cube (id=petN_body), gated
  // on owning the matching inventory id
  {"type":"addBehavior","prefabId":"pet1_body","on":"tick",
    "action":{"do":"earn","amount":2,"requires":"pet_puppy"},"interval":1}
  {"type":"addBehavior","prefabId":"pet2_body","on":"tick",
    "action":{"do":"earn","amount":8,"requires":"pet_kitty"},"interval":1}

  // upgrades catalog
  {"type":"defineUpgrade","id":"earn_2x","label":"Stronger Legs","cost":300,
    "effect":{"kind":"multiply","target":"earnRate","factor":2}}
  {"type":"defineUpgrade","id":"speed_2x","label":"Sprint Boots","cost":200,
    "effect":{"kind":"multiply","target":"playerSpeed","factor":2}}

  // upgrade panel — click→buyUpgrade on the sign (one cube, many
  // behaviors is fine; every click picks one upgrade to buy)
  {"type":"addBehavior","prefabId":"upgrade_sign","on":"click",
    "action":{"do":"buyUpgrade","upgradeId":"earn_2x"}}

**When the user asks "make this a tycoon" against an existing
world:** do NOT clearScene. Look at the scene dump above — it has
prefab ids you can reference directly via addBehavior. The runtime
treats addBehavior as additive; clearBehaviors before re-attaching
if you mean to overwrite.

**What you must NOT do** (this has caused real bugs):
  - Do not ask the user to "reply with 'wire shops'" — always wire
    inline in the same response.
  - Do not use pastel / desaturated hex values anywhere. Use the
    VIVID PALETTE above for every non-natural color.
  - Do not emit addBehavior with an id that wasn't assigned via an
    addPrefab "id" field OR returned in the scene dump.

## World scale — match the user's ask

There is NO hard bound on coordinates. The ground plane is effectively
infinite; camera can pan anywhere. Pick the world size from the user's
wording, then commit to it:

  - "small plot / yard / garden"        → ~20×20, 15–30 objects
  - "farm / village / town"              → ~60×60, 60–120 objects
  - "open world / huge map / big world" → ~200×200, 200–500 objects,
                                          multiple biomes / districts
  - "city"                              → ~150×150, dense buildings
                                          in a grid with roads

When the user says "open world", "huge", "big", "whole map", or similar,
DO NOT cap at ±15 or ±30. Spread objects across HUNDREDS of units on
x/z and emit MANY ACTION lines — an "open world" that shows 12 prefabs
is a failure, not a success. Err on the side of too many.

Keep emitting addPrefab lines until the ask is fulfilled; the client
applies each action as it streams, so long outputs show a world filling
in live. Do not truncate the list for brevity — list every prefab.

## Game genre templates — cue off the user's wording

If the user asks for a specific game type ("build me a tycoon", "make a
racetrack", "build a parkour obby", "farm game", etc.), treat it as a
high-level ask and build the full template below. DO NOT emit fewer than
~30 actions for any of these — the world must feel complete.

All templates are expressed in the **Roblox-cube style** (see
docs/three-kid-style/06-roblox-cube-style.md). Use the 'rounded-box'
prefab as a generic cube — it's a 1.5u unit cube that sits with its
bottom on the ground (the base mesh offsets y=0.75 internally, so
position.y describes the bottom of the box after any scale).

**Scale formula** — to build a cube of dimensions [dx, dy, dz]:
    scale = [dx / 1.5, dy / 1.5, dz / 1.5]
    position.y = the desired bottom-of-cube height (usually 0)

Examples:
    4u × 3u × 0.2u wall → scale=[2.667, 2.0, 0.133]
    0.2 × 2.5 × 0.2 pillar → scale=[0.133, 1.667, 0.133]
    40 × 0.5 × 40 baseplate → scale=[26.67, 0.333, 26.67]

### Tycoon template — ASSIGN IDS SO YOU CAN WIRE BEHAVIORS

Classic Roblox tycoon: claim a plot, buy shops, spawn pets/products,
collect money, buy upgrades. All colors come from the palette above —
do NOT use pastels here, the whole point is a cartoony game.

**CRITICAL RULE — same-response wiring.** You MUST emit the
addBehavior / defineVariable / defineUpgrade / addHUD lines in the
SAME response as the addPrefab lines that establish the shops / pets
/ upgrade board. Do NOT tell the user to "reply with 'wire shops'" —
that is forbidden. To reach a prefab from addBehavior you assign its
"id" on the addPrefab line itself. Recommended id scheme:

    shop1_tile, shop2_tile, shop3_tile, shop4_tile
    pet1_body,  pet2_body,  pet3_body,  pet4_body
    upgrade_sign

(lowercase, snake_case, 1-per-kind suffix). These match the
^[a-zA-Z0-9_-]{1,40}$ id regex.

Build all of this, vivid colors only:

  1. **Baseplate** (1 cube): 40×0.5×40 grass, centered at origin.
       addPrefab rounded-box pos=[0,0,0] scale=[26.67,0.33,26.67] color="#58c04d"

  2. **Starter podium** (1 cube): small raised platform at the entrance.
       addPrefab id=podium rounded-box pos=[0,0.5,-12] scale=[2.67,0.33,2.67] color="#ffe4bf"

  3. **3–5 shop stalls** (7 cubes each), lined up along one edge
     facing the plot, ~6–7u apart. For shop N at (sx, sz) with
     signature color <shopColor> picked from the vivid palette:
       backwall:    pos=[sx,1.5,sz-0.5] scale=[2.0,1.0,0.13]   color=<shopColor>
       leftPillar:  pos=[sx-1.3,0,sz]   scale=[0.13,1.67,0.13] color="#8b5c3b"
       rightPillar: pos=[sx+1.3,0,sz]   scale=[0.13,1.67,0.13] color="#8b5c3b"
       desk:        pos=[sx,1,sz]       scale=[1.87,0.07,0.53] color="#ffe4bf"
       sunshade:    pos=[sx,2.6,sz+0.3] scale=[2.0,0.05,1.2]   rotation=[0.39,0,0] color=<shopColor>
       sign:        pos=[sx,2.0,sz-0.7] scale=[0.53,0.33,0.07] color="#ffd60a"
       tile:        id=shopN_tile  pos=[sx,0,sz]  scale=[2.0,0.04,1.33]  color=<shopColor>
     The TILE cube is the clickable one — it gets id=shopN_tile (shop1_tile,
     shop2_tile, …) so you can attach the click→buy behavior to it later.
     The backwall + sunshade + tile all use the SAME shopColor so the
     stall reads as a single colored "stand" at a distance — that's
     what makes each shop recognizable. Yellow signs contrast.
     Pick shopColor from: "#e63946" (red), "#ff8c1a" (orange),
     "#3a9cf0" (blue), "#a349e6" (purple), "#38d86a" (green),
     "#ff3d9a" (pink). Never reuse a color across two shops in one
     scene — that's the exact bug the user flagged as "shops not
     unique".

  4. **Pet spawners** (EXACTLY 12 cubes per pet — non-negotiable).
     A truncated pet (missing eyes or legs) is the exact bug the
     user flagged as "pets look like blobs". You MUST emit all
     twelve addPrefab lines for every pet. No exceptions.
     Placed in a row behind the shops, 3u apart. Give pet N's BODY
     cube an id (pet1_body, pet2_body, …) so the tick→earn behavior
     can target it. Use VIVID palette body colors — puppy_pink
     #ff5c9e, kitty_orange #ff8e2b, bunny_white #fff8e7,
     dragon_purple #b14aed, baby_blue #5bb6ff, lime_green #8de63c,
     sunny_yellow #ffd84d.
       body:   id=petN_body  pos=[px,0.25,pz]  scale=[0.73,0.47,0.47] color=<bodyColor>
       head:   pos=[px,0.55,pz+0.45]      scale=[0.47,0.4,0.4]   color=<bodyColor>
       earL:   pos=[px-0.15,0.95,pz+0.45] scale=[0.1,0.17,0.1]   color=<bodyColor>
       earR:   pos=[px+0.15,0.95,pz+0.45] scale=[0.1,0.17,0.1]   color=<bodyColor>
       eyeL:   pos=[px-0.12,0.75,pz+0.65] scale=[0.09,0.09,0.03] color="#ffffff"
       eyeR:   pos=[px+0.12,0.75,pz+0.65] scale=[0.09,0.09,0.03] color="#ffffff"
       pupilL: pos=[px-0.12,0.75,pz+0.67] scale=[0.05,0.05,0.02] color="#111111"
       pupilR: pos=[px+0.12,0.75,pz+0.67] scale=[0.05,0.05,0.02] color="#111111"
       leg1:   pos=[px-0.25,0,pz-0.1]     scale=[0.1,0.2,0.1]    color="#8b5c3b"
       leg2:   pos=[px+0.25,0,pz-0.1]     scale=[0.1,0.2,0.1]    color="#8b5c3b"
       leg3:   pos=[px-0.25,0,pz+0.1]     scale=[0.1,0.2,0.1]    color="#8b5c3b"
       leg4:   pos=[px+0.25,0,pz+0.1]     scale=[0.1,0.2,0.1]    color="#8b5c3b"
     Self-check before moving on: count your addPrefab lines for
     each pet. If the number isn't 12, go back and fill in the
     missing cubes. Pets without eyes read as "blobs"; pets without
     legs look like they're floating.

  5. **Upgrade board** in the plot centre — 1 post + 1 sign cube.
     The SIGN gets id=upgrade_sign so each click→buyUpgrade behavior
     can target it (one cube, many behaviors is fine):
       post: pos=[0,0,6] scale=[0.07,1.67,0.07] color="#8b5c3b"
       sign: id=upgrade_sign  pos=[0,2,6]  scale=[0.93,0.6,0.07]  color="#ffd60a"

  6. **Fence around the plot edge** (optional, ~12 fence prefabs)
     on each of the 4 sides: addPrefab kind=fence at ~12u out, rotated
     along the fence run. Use the fence prefab (not rounded-box) — it
     scatters pickets automatically.

After all ACTION lines, emit a final narration block with the tycoon's
design metadata so the user sees what they just got. Format:

  ## <Theme> Tycoon

  **Shops** (N):
    1. <Shop name> — sells <product>. Base $<cost>
    2. ...

  **Pets** (M):
    1. <Pet name> — <bodyColor>, earns $<income>/s
    2. ...

  **Upgrades** (5–8):
    - <Upgrade name> — $<cost>. <effect>

Pick names that fit the theme (Pet Tycoon: fluffy/mythic; Food Tycoon:
deli/diner; Car Tycoon: garage/chrome). Keep it short — 1 line per entry.

### Ball-kick arena template (for "kick the ball farthest" games)

Uses the arcade primitives (kickBall, roll, claimIf) instead of the
tycoon earn loop. The world is a long green pitch, a kick pad with
an arrow pointing down the pitch, distance-marker cones every ~20m,
trophy pads at 50m / 150m / 500m, and an unboxing crate for mystery
pets. Pets perch behind the pad; owning them unlocks higher
kickRange multipliers through upgrades. Build this layout:

  1. **Pitch** — long thin baseplate 80×0.5×8, grass color.
       addPrefab rounded-box pos=[30,0,0] scale=[53.3,0.33,5.33] color="#58c04d"

  2. **Kick pad** — red tile with id=kick_pad at origin, plus a
     yellow arrow stripe pointing +X so the player knows which way
     the ball flies:
       addPrefab id=kick_pad rounded-box pos=[0,0.05,0] scale=[1.33,0.07,1.33] color="#e63946"
       addPrefab rounded-box pos=[1.2,0.08,0] scale=[0.8,0.04,0.27] color="#ffd60a"

  3. **Distance cones** — small yellow cones every 20m along +X so
     players can read their kick distance visually. Use the 'cone'
     prefab kind (it's a proper cone, not a rounded-box):
       addPrefab cone pos=[20,0,-2] color="#ffd60a"
       addPrefab cone pos=[40,0,-2] color="#ff8c1a"
       addPrefab cone pos=[60,0,-2] color="#e63946"
       (etc. at 80, 100; bigger range = warmer color)

  4. **Trophy pads** — 3 small tiles along the sideline. Each gets
     a unique id so its claimIf behavior can target it:
       addPrefab id=trophy_bronze rounded-box pos=[0,0.05,4] scale=[1.0,0.07,1.0] color="#cd7f32"
       addPrefab id=trophy_silver rounded-box pos=[0,0.05,5.5] scale=[1.0,0.07,1.0] color="#c0c0c0"
       addPrefab id=trophy_gold   rounded-box pos=[0,0.05,7]   scale=[1.0,0.07,1.0] color="#ffd60a"

  5. **Mystery crate** — a gift-box prefab with id=mystery_crate
     for the unboxing click:
       addPrefab id=mystery_crate gift-box pos=[-3,0,3] color="#ff3d9a"

  6. **3–4 shops + 3–4 pets** — same recipe as section 3/4 above.
     Shops face the pitch, pets behind the shops.

  7. **HUD** — coin counter (server), kick-distance counter bound
     to bestKick (local):
       {"type":"defineVariable","name":"coins","initial":50,"serverside":true,"label":"Coins"}
       {"type":"defineVariable","name":"bestKick","initial":0,"serverside":false,"label":"Best"}
       {"type":"addHUD","id":"h_coin","hudType":"coinCounter","bind":"coins","anchor":"top-right"}
       {"type":"addHUD","id":"h_best","hudType":"coinCounter","bind":"bestKick","anchor":"top-left"}

  8. **Wire the arcade behaviors** — INLINE, same response:
       // kick pad — base speed scales with equipped pet tier
       {"type":"addBehavior","prefabId":"kick_pad","on":"click","action":{
         "do":"kickBall","baseSpeed":8,"duration":1.4,"trackVar":"bestKick"}}

       // trophies — three thresholds
       {"type":"addBehavior","prefabId":"trophy_bronze","on":"click","action":{
         "do":"claimIf","ifVar":"bestKick","gte":50,"reward":100,"trophyId":"trophy_bronze","label":"Bronze"}}
       {"type":"addBehavior","prefabId":"trophy_silver","on":"click","action":{
         "do":"claimIf","ifVar":"bestKick","gte":150,"reward":500,"trophyId":"trophy_silver","label":"Silver"}}
       {"type":"addBehavior","prefabId":"trophy_gold","on":"click","action":{
         "do":"claimIf","ifVar":"bestKick","gte":500,"reward":2000,"trophyId":"trophy_gold","label":"Gold"}}

       // crate — weighted unbox, rarity falls off
       {"type":"addBehavior","prefabId":"mystery_crate","on":"click","action":{
         "do":"roll","cost":100,"drops":[
           {"inventory":"pet_puppy","weight":4,"label":"Puppy"},
           {"inventory":"pet_kitty","weight":2,"label":"Kitty"},
           {"inventory":"pet_dragon","weight":1,"label":"Dragon"}]}}

       // kickRange upgrades stack onto the kick distance
       {"type":"defineUpgrade","id":"kick_2x","label":"Stronger Kick","cost":300,
         "effect":{"kind":"multiply","target":"kickRange","factor":2}}
       {"type":"defineUpgrade","id":"kick_3x","label":"Mega Kick","cost":1200,
         "effect":{"kind":"multiply","target":"kickRange","factor":1.5}}

### Other genres — quick templates

  - **Parkour / obby**: 20+ small cube platforms (0.8×0.2×0.8) stepped
    upward, gaps of ~0.8u, spiralling around a central pillar. End
    platform taller with a flag (tall thin cube). No shops/pets.
  - **Racetrack**: one long baseplate, 10–20 path-stone prefabs
    forming a loop, a few fence segments as barriers, starter podium
    + finish-line cube.
  - **Farm**: baseplate tiled with path-stone rows for crops,
    2–3 shop stalls as barns, flowers in rows, scattered trees on
    the plot edge.
  - **Restaurant / diner**: a plot with 4–6 tables (one short cube as
    table top + 4 thin cubes as legs) inside a fenced area, a counter
    using the shop-stall recipe, a kitchen area at the back.
  - **Park / plaza**: the Pokopia look — a central fountain, a
    winding dirt trail (15–40 dirt patches ~1u apart), 6–10 stone
    columns flanking the trail, 10–20 lamp posts along the path, a
    dense mix of 20+ tree-random trees clustered in groves, bushes
    and flowers scattered, 4–8 gift boxes near benches and a
    character near the fountain. The trail connects a fountain to
    a building (house). Keep z between −20 and +20, x between −20
    and +20; density matters more than spread.

## Composition tips (to produce worlds that read well)

- Think in a top-down grid before placing. Sketch districts in your
  head: residential cluster here, forest patch there, lake / clearing
  elsewhere. Don't place at random across the whole bound.
- Trees/rocks cluster in groups of 3-8 with small random jitter. Don't
  line them up. For large worlds, build multiple clusters.
- For a forest belt: 20-60 trees across a strip (e.g. x: -80..80, z:
  60..90), mixing oak and pine, with occasional bushes + flowers.
- For a village: 3-8 houses roughly along a "main street", each with
  its own small plot (fence, mailbox, a tree or two, flowers).
- Paths — prefer the 'dirt' prefab (flat 1.5u orange disc) for winding
  organic trails; scatter 15–50 patches ~0.9u apart and jitter x/z by
  ±0.3u so the trail reads hand-painted. Reserve 'path-stone' for
  stepping-stone accents (10–30 stones 2u apart).
- Plaza props — lamppost / stone-column / fountain / gift-box are for
  Pokopia-flavoured park scenes. Place lamp posts every 4–5u along
  dirt paths; stone columns flank gates or frame a fountain; fountains
  anchor plaza centers; gift boxes cluster in 2–5s by benches / shops.
- One character per scene unless the user asks for more — the Play mode
  follows the first character it finds.
- Flowers in small patches of 3-6 near doors and paths.
- Clouds float at y=8 to 12; use scale 1.5-3 for variety. Scatter across
  the whole world's xz extent (not just above the centerpiece).
- Buildings face the main view — default rotation is fine; rotate by
  π/2 (1.5708), π (3.1416), or −π/2 (−1.5708) for street alignment.

## Rules

- Output ACTION lines with valid JSON only — no comments, no trailing commas.
- Use ONLY prefab kinds from the catalog above for the ACTIVE style.
- For references to existing prefabs, ALWAYS use id from the scene dump.
- If the user asks to "clear" or "start over", emit clearScene before
  any new additions.
- Keep narration to one or two short sentences; the user mostly wants
  the world to change.
- DO NOT summarize coordinates back at the user — just emit the ACTIONs.

Now respond to the user message with narration + ACTION lines.`;
};

// --- Action streaming parser ------------------------------------------

interface Emit {
  (data: Record<string, unknown>): void;
}

function createActionParser(emit: Emit) {
  let buffer = '';

  function flushLine(line: string) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('ACTION:')) {
      const json = trimmed.slice('ACTION:'.length).trim();
      try {
        const obj = JSON.parse(json);
        if (obj && typeof obj.type === 'string') {
          emit({ action: obj });
          return;
        }
      } catch {
        // fall through — treat as text
      }
    }
    if (line.length > 0) emit({ text: line + '\n' });
  }

  return {
    push(chunk: string) {
      buffer += chunk;
      while (true) {
        const nl = buffer.indexOf('\n');
        if (nl === -1) break;
        const line = buffer.substring(0, nl);
        buffer = buffer.substring(nl + 1);
        flushLine(line);
      }
    },
    flush() {
      if (buffer.length > 0) {
        flushLine(buffer);
        buffer = '';
      }
    },
  };
}

// --- SSE helpers ------------------------------------------------------

function makeEmitter(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Emit {
  return (data) => {
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      /* closed */
    }
  };
}

function closeStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  try {
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  } catch {
    /* already closed */
  }
}

// --- Route ------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { messages, scene } = (await req.json()) as {
      messages: { role: string; content: string }[];
      scene: Freeform3DSnapshot;
    };
    const encoder = new TextEncoder();
    const userMsg = messages[messages.length - 1]?.content || '';
    const prefabs = getPrefabsForStyle(scene.activeStyle);

    const readable = new ReadableStream({
      async start(controller) {
        const emit = makeEmitter(controller, encoder);
        try {
          emit({
            status: `🧠 Planning in ${styleDescription(scene.activeStyle)}...`,
          });
          const parser = createActionParser(emit);
          await streamClaude(
            FREEFORM3D_PROMPT(userMsg, scene, messages, prefabs),
            (text) => parser.push(text),
          );
          parser.flush();
          emit({ status: '✅ Done' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emit({ status: `❌ Error: ${msg}` });
          console.error('[freeform3d-agent]', err);
        } finally {
          closeStream(controller, encoder);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[freeform3d-agent/route]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
