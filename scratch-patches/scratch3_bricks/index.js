// Scratch 3 extension: Bricks
//
// Emits postMessage calls on window.parent with the contract consumed by
// Problocks' /studio/scratch/bricks shell and the lego-game scratchBridge
// IIFE. Shape:
//   { source: 'scratch-blocks', action: '<verb>', ...args }
//
// This file is the canonical source. It is also copied into
// scratch-gui/node_modules/scratch-vm/src/extensions/scratch3_bricks/ and
// registered via a one-line patch to
// scratch-gui/node_modules/scratch-vm/src/extension-support/extension-manager.js.
// See scratch-patches/README.md for re-apply instructions.

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class Scratch3BricksBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'bricks',
            name: 'Bricks',
            blocks: [
                {
                    opcode: 'setTool',
                    blockType: BlockType.COMMAND,
                    text: 'set tool to [TOOL]',
                    arguments: {
                        TOOL: {type: ArgumentType.STRING, menu: 'TOOLS', defaultValue: 'build'}
                    }
                },
                {
                    opcode: 'selectPart',
                    blockType: BlockType.COMMAND,
                    text: 'select part [PART]',
                    arguments: {
                        PART: {type: ArgumentType.STRING, menu: 'PARTS', defaultValue: '3004'}
                    }
                },
                {
                    opcode: 'setColor',
                    blockType: BlockType.COMMAND,
                    text: 'set color to [COLOR]',
                    arguments: {
                        COLOR: {type: ArgumentType.STRING, menu: 'COLORS', defaultValue: 'FF3B30'}
                    }
                },
                {
                    opcode: 'setRotation',
                    blockType: BlockType.COMMAND,
                    text: 'set rotation to [ROT] degrees',
                    arguments: {
                        ROT: {type: ArgumentType.STRING, menu: 'ROTS', defaultValue: '0'}
                    }
                },
                {
                    opcode: 'build',
                    blockType: BlockType.COMMAND,
                    text: 'build at x [GX] z [GZ] layer [LAYER]',
                    arguments: {
                        GX:    {type: ArgumentType.NUMBER, defaultValue: 0},
                        GZ:    {type: ArgumentType.NUMBER, defaultValue: 0},
                        LAYER: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                '---',
                {
                    opcode: 'moveCharacter',
                    blockType: BlockType.COMMAND,
                    text: 'move character [DIR] by [N]',
                    arguments: {
                        DIR: {type: ArgumentType.STRING, menu: 'DIRS', defaultValue: 'forward'},
                        N:   {type: ArgumentType.NUMBER, defaultValue: 5}
                    }
                },
                {
                    opcode: 'turnCharacter',
                    blockType: BlockType.COMMAND,
                    text: 'turn character [DIR] by [DEG] degrees',
                    arguments: {
                        DIR: {type: ArgumentType.STRING, menu: 'TURNS', defaultValue: 'right'},
                        DEG: {type: ArgumentType.NUMBER, defaultValue: 45}
                    }
                },
                {
                    opcode: 'teleportCharacter',
                    blockType: BlockType.COMMAND,
                    text: 'teleport character to x [X] y [Y] z [Z]',
                    arguments: {
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                }
            ],
            menus: {
                TOOLS: {
                    acceptReporters: true,
                    items: [
                        {text: 'build',  value: 'build'},
                        {text: 'delete', value: 'delete'}
                    ]
                },
                PARTS: {
                    acceptReporters: true,
                    items: [
                        {text: 'brick 1x1 (#3005)', value: '3005'},
                        {text: 'brick 1x2 (#3004)', value: '3004'},
                        {text: 'brick 1x3 (#3622)', value: '3622'},
                        {text: 'brick 1x4 (#3010)', value: '3010'},
                        {text: 'brick 1x6 (#3009)', value: '3009'},
                        {text: 'brick 1x8 (#3008)', value: '3008'},
                        {text: 'brick 2x2 (#3003)', value: '3003'},
                        {text: 'brick 2x4 (#3001)', value: '3001'}
                    ]
                },
                COLORS: {
                    acceptReporters: true,
                    items: [
                        {text: 'red',    value: 'FF3B30'},
                        {text: 'orange', value: 'FF9500'},
                        {text: 'yellow', value: 'FFCC00'},
                        {text: 'green',  value: '34C759'},
                        {text: 'blue',   value: '007AFF'},
                        {text: 'purple', value: 'AF52DE'},
                        {text: 'pink',   value: 'FF2D55'},
                        {text: 'white',  value: 'FFFFFF'},
                        {text: 'gray',   value: '8E8E93'},
                        {text: 'black',  value: '000000'}
                    ]
                },
                ROTS: {
                    acceptReporters: true,
                    items: [
                        {text: '0',   value: '0'},
                        {text: '90',  value: '90'},
                        {text: '180', value: '180'},
                        {text: '270', value: '270'}
                    ]
                },
                DIRS: {
                    acceptReporters: true,
                    items: [
                        {text: 'forward', value: 'forward'},
                        {text: 'back',    value: 'back'},
                        {text: 'left',    value: 'left'},
                        {text: 'right',   value: 'right'}
                    ]
                },
                TURNS: {
                    acceptReporters: true,
                    items: [
                        {text: 'left',  value: 'left'},
                        {text: 'right', value: 'right'}
                    ]
                }
            }
        };
    }

    _post (action, args) {
        try {
            if (typeof window !== 'undefined' && window.parent) {
                window.parent.postMessage(
                    Object.assign({source: 'scratch-blocks', action: action}, args || {}),
                    '*'
                );
            }
        } catch (e) { /* standalone — no parent */ }
    }

    setTool (args) {
        this._post('setTool', {tool: String(args.TOOL)});
    }
    selectPart (args) {
        const p = parseInt(args.PART, 10);
        if (p) this._post('selectPart', {partNum: p});
    }
    setColor (args) {
        this._post('setColor', {hex: String(args.COLOR).replace(/^#/, '')});
    }
    setRotation (args) {
        this._post('setRotation', {rot: parseInt(args.ROT, 10) || 0});
    }
    build (args) {
        this._post('build', {
            gx:    Number(args.GX) || 0,
            gz:    Number(args.GZ) || 0,
            layer: Number(args.LAYER) || 0
        });
    }
    moveCharacter (args) {
        const n = Number(args.N) || 0;
        const dir = String(args.DIR);
        const v = ({
            forward: {dz:  n},
            back:    {dz: -n},
            left:    {dx: -n},
            right:   {dx:  n}
        })[dir] || {dz: n};
        this._post('moveCharacter', v);
    }
    turnCharacter (args) {
        const deg = (Number(args.DEG) || 0) * (String(args.DIR) === 'left' ? -1 : 1);
        this._post('turnCharacter', {deg: deg});
    }
    teleportCharacter (args) {
        this._post('teleportCharacter', {
            x: Number(args.X) || 0,
            y: Number(args.Y) || 0,
            z: Number(args.Z) || 0
        });
    }
}

module.exports = Scratch3BricksBlocks;
