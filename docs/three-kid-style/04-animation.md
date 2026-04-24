# Character Animation — Squash, Blink, Head-Follow

A static kid-style mesh still looks dead. A few cheap per-frame tweaks turn
it into a character. In rough order of impact:

1. **Idle bob with volume-preserving squash-stretch** — object feels alive
2. **Blinking** — character feels aware
3. **Head-follow cursor / camera / target** — character feels attentive
4. **Secondary motion** — antennas, hair, balloons swing believably
5. **Arms sway / legs march** — full locomotion

All five together are what make a Pokopia / Adopt Me character read as "a
person" instead of "a mesh". All five combined cost < 1ms per frame.

## Squash-stretch idle bob

A sine-wave bob on its own (`y = sin(t)`) feels mechanical. Add volume-
preserving scale compression so the character squashes at the bottom,
stretches at the top, and preserves mass throughout:

```js
function idleBob(character, time, { period = 1.5, amplitude = 0.08 } = {}) {
  const t = (time / period) * Math.PI * 2;
  const bob = Math.sin(t);                 // -1 .. 1

  // Position: bob up and down
  character.position.y = character.userData.baseY + bob * amplitude;

  // Scale: compress vertically at bottom, stretch at top
  // scaleY = 1 + 0.08 * sin(t); preserve volume via scaleX = scaleZ = 1 / sqrt(scaleY)
  const scaleY = 1 + bob * 0.06;
  const scaleXZ = 1 / Math.sqrt(scaleY);   // volume preservation
  character.scale.set(scaleXZ, scaleY, scaleXZ);
}
```

Why the `1 / sqrt(scaleY)`: if scaleY doubles, the other two axes must each
scale by `1/√2` so the product (volume) stays constant. Your eye notices
volume changes way more than position changes — preserving volume is the
difference between "alive" and "pulsating blob".

Tuning:

- **Period 1.2–1.6s** — slower than a heartbeat, faster than breathing
- **Position amplitude 0.06–0.12** — more than 0.15 feels like floating
- **Scale amplitude 0.04–0.08** — more than 0.1 looks rubbery
- Larger characters (bosses) → longer period, smaller relative amplitude
- Small characters (critters) → shorter period, bigger amplitude

## Blinking

Eyes that never blink feel dead. A once-every-4-seconds-ish blink adds
immediate life. The key detail: **the blink duration is short (80–120ms)
and slightly randomised**.

```js
class BlinkController {
  constructor(eyeLeft, eyeRight) {
    this.eyes = [eyeLeft, eyeRight];
    this.baseScale = eyeLeft.scale.y;
    this.nextBlinkAt = Math.random() * 2 + 3;   // 3–5s from start
    this.blinkingUntil = 0;
    this.blinkDuration = 0.1;
  }
  update(time) {
    if (this.blinkingUntil > 0) {
      // Blink in progress
      const t = 1 - (this.blinkingUntil - time) / this.blinkDuration;
      // Blink curve: 0 → 1 → 0 over duration
      const closed = Math.sin(t * Math.PI);
      const scaleY = this.baseScale * (1 - closed * 0.9);
      this.eyes.forEach(e => e.scale.y = scaleY);
      if (time >= this.blinkingUntil) {
        this.blinkingUntil = 0;
        this.eyes.forEach(e => e.scale.y = this.baseScale);
        this.nextBlinkAt = time + 3 + Math.random() * 3;   // 3–6s
      }
    } else if (time >= this.nextBlinkAt) {
      // Start blink
      this.blinkDuration = 0.08 + Math.random() * 0.05;
      this.blinkingUntil = time + this.blinkDuration;
      // Occasional double-blink: 10% chance
      if (Math.random() < 0.1) this.nextBlinkAt = time + this.blinkDuration + 0.15;
    }
  }
}
```

Key tuning points:

- **Scale Y by ~10% of original**, not 0. Closing eyes fully looks like a
  frightened squint; leaving a slit looks like a relaxed blink.
- **Randomise interval** between 3s and 6s. Perfectly periodic blinking
  looks robotic.
- **Occasional double-blink (~10%)** — real people do this; adds charm.
- **Don't animate scaleX** unless the eye shape requires it. Eyes are
  flattened vertically during blink only.

## Head-follow cursor / target

This is the single biggest "dead mesh → alive character" upgrade you can
make in 20 lines of code. Move your mouse around and the character looks
at you; instant attention.

```js
class HeadTracker {
  constructor(head, options = {}) {
    this.head = head;
    this.baseQuat = head.quaternion.clone();
    this.targetQuat = head.quaternion.clone();
    this.damping = options.damping ?? 0.1;   // 0 = none, 1 = instant
    this.maxAngle = options.maxAngle ?? Math.PI / 3;   // 60° cone
  }
  lookAt(worldTarget, time) {
    // Head's world position
    const headWorld = new THREE.Vector3();
    this.head.getWorldPosition(headWorld);

    // Direction in head's parent space
    const toTarget = worldTarget.clone().sub(headWorld);
    this.head.parent.worldToLocal(
      worldTarget.clone().add(this.head.parent.getWorldPosition(new THREE.Vector3()))
    );

    // Build look-at quaternion
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      toTarget.normalize(),
      new THREE.Vector3(0, 1, 0)
    );
    const desired = new THREE.Quaternion().setFromRotationMatrix(m);

    // Clamp to cone around base rotation (don't break neck)
    const delta = this.baseQuat.clone().invert().multiply(desired);
    const angle = 2 * Math.acos(Math.min(1, Math.abs(delta.w)));
    if (angle > this.maxAngle) {
      const t = this.maxAngle / angle;
      delta.slerp(new THREE.Quaternion(), 1 - t);
    }
    this.targetQuat = this.baseQuat.clone().multiply(delta);

    // Damped slerp toward target
    this.head.quaternion.slerp(this.targetQuat, this.damping);
  }
}
```

For a cursor-follow in HTML, convert the cursor NDC to a world-space point
on a plane at the character's head height:

```js
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
window.addEventListener('pointermove', (e) => {
  ndc.x = (e.clientX / innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / innerHeight) * 2 + 1;
});

const headPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -headWorldZ);

// in update loop:
raycaster.setFromCamera(ndc, camera);
const target = new THREE.Vector3();
raycaster.ray.intersectPlane(headPlane, target);
headTracker.lookAt(target, time);
```

Tuning:

- **Damping 0.08–0.12** — the sweet spot: curious but not twitchy
- **Max angle 50–70°** — clamp so the head doesn't spin 180° when the cursor
  moves behind the character
- **Dead zone (< 5°)** — optional, prevents micro-jitter when cursor is
  approximately in front

## Secondary motion (springs)

Antennas, hair, pet tails, balloons tied to characters — anything that
"should" physically trail a bit. Cheap spring:

```js
class Spring {
  constructor(target, options = {}) {
    this.target = target;
    this.rest = target.position.clone();
    this.velocity = new THREE.Vector3();
    this.stiffness = options.stiffness ?? 12;
    this.damping = options.damping ?? 3;
  }
  update(parentPos, dt) {
    // Target position in world space
    const desired = this.rest.clone();   // local offset
    const parentDelta = parentPos.clone().sub(this.lastParent ?? parentPos);
    this.lastParent = parentPos.clone();

    // Drag: inherit some of parent's motion, delayed
    const force = desired.clone().sub(this.target.position).multiplyScalar(this.stiffness);
    force.sub(this.velocity.clone().multiplyScalar(this.damping));
    force.sub(parentDelta.multiplyScalar(10));   // inertia from parent motion

    this.velocity.add(force.multiplyScalar(dt));
    this.target.position.add(this.velocity.clone().multiplyScalar(dt));
  }
}
```

Tuning stiffness × damping determines the feel:

- **High stiffness, high damping** (12/3) — stiff twitch, settles fast
- **Low stiffness, low damping** (4/1) — loose, wobbly, long settling (good
  for big balloon on string)
- **Mid stiffness, low damping** (8/0.5) — bouncy, settles with visible
  oscillation (good for antenna, slime tail)

## Easing curves — the four you actually need

For transitions (entrances, button feedback, item pickups):

```js
const ease = {
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  outBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1/d1)       return n1 * t * t;
    else if (t < 2/d1)  return n1 * (t -= 1.5/d1) * t + 0.75;
    else if (t < 2.5/d1) return n1 * (t -= 2.25/d1) * t + 0.9375;
    else                return n1 * (t -= 2.625/d1) * t + 0.984375;
  },
  inOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};
```

- **outBack** — item pops in (overshoots slightly). Default for "new thing
  appears".
- **outElastic** — big celebratory pop (the bouncy "you got a legendary!"
  animation).
- **outBounce** — item drops and settles (the mailbox flag flipping up).
- **inOutCubic** — smooth camera moves, menu transitions, anything that
  shouldn't draw attention.

Never use `linear` for UI or character animation. Never use `easeIn*` on its
own unless the thing is leaving frame — in-easing alone looks like the
animation "stalls" at the start.

## Full character update loop

Putting it all together:

```js
function animateCharacter(char, time, dt, cursorTarget) {
  // 1. Idle bob
  idleBob(char.body, time);

  // 2. Blink
  char.blink.update(time);

  // 3. Head follow
  char.head.lookAt(cursorTarget, time);

  // 4. Secondary motion on antenna
  char.antennaSpring.update(char.head.getWorldPosition(new THREE.Vector3()), dt);

  // 5. Optional: arm sway
  const swing = Math.sin(time * 3) * 0.1;
  char.leftArm.rotation.z = swing;
  char.rightArm.rotation.z = -swing;
}
```

This single function, called each frame, is the difference between "3D
scene" and "character-driven scene".

## Performance budget

All of the above per character, per frame:

- Idle bob: ~10 float ops
- Blink: 1 branch + a sin
- Head-follow: 1 quaternion slerp (~20 ops) + ray-plane intersect (~10 ops)
- Spring (1 per): ~30 ops
- Arm sway: 2 sin + 2 mutations

Total: easily 100+ characters animated per frame on a Chromebook. The bottleneck
is not animation math; it's draw calls. Batch character outlines where possible.
