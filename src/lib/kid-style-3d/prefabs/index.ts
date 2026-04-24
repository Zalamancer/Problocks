/**
 * Prefab dispatcher + registry barrel.
 *
 * Each category lives in its own file (primitives.ts / nature.ts /
 * buildings.ts / character.ts) so no single file approaches the repo's
 * 500-line soft limit. buildPrefab(kind, opts) is the single public
 * entry consumers call to produce a pre-wired Object3D.
 */

import type * as THREE from 'three';
import type { BuildOptions } from './types';
import { primitiveBox, primitiveSphere, primitiveCylinder, primitiveCone } from './primitives';
import { treeOak, treePine, treeRandom, bush, mushroom, rock, flower, cloud } from './nature';
import { house, fence, gatePost, pathStone, dirtPatch, mailbox, bench, balloon } from './buildings';
import { character } from './character';

export * from './registry';
export type { BuildOptions } from './types';

export function buildPrefab(kind: string, opts: BuildOptions = {}): THREE.Object3D {
  switch (kind) {
    // primitives
    case 'rounded-box': return primitiveBox(opts);
    case 'sphere':      return primitiveSphere(opts);
    case 'cylinder':    return primitiveCylinder(opts);
    case 'cone':        return primitiveCone(opts);
    // nature
    case 'tree-oak':    return treeOak(opts);
    case 'tree-pine':   return treePine(opts);
    case 'tree-random': return treeRandom(opts);
    case 'bush':        return bush(opts);
    case 'mushroom':    return mushroom(opts);
    case 'rock':        return rock(opts);
    case 'flower':      return flower(opts);
    case 'cloud':       return cloud(opts);
    // buildings
    case 'house':       return house(opts);
    case 'fence':       return fence(opts);
    case 'gate-post':   return gatePost(opts);
    case 'path-stone':  return pathStone(opts);
    case 'dirt':        return dirtPatch(opts);
    case 'mailbox':     return mailbox(opts);
    case 'bench':       return bench(opts);
    case 'balloon':     return balloon(opts);
    // characters
    case 'character':   return character(opts);
  }
  throw new Error(`Unknown prefab kind: ${kind}`);
}
