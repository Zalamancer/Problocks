// 2D humanoid character renderer for the tutor chatbot.
//
// Layers + mouth are positioned in a 0–100 local viewport so the character
// scales cleanly regardless of container size. When `rig` is omitted we
// render the inline-SVG PlaceholderBody so the UI is usable before PNG
// assets land; when `rig` is provided every layer renders as a PNG and the
// mouth swaps per `viseme`.

'use client';

import { PlaceholderBody, PlaceholderMouth, PLACEHOLDER_MOUTH_BOX } from './PlaceholderRig';
import type { CharacterRig, VisemeKey } from './tutor-types';

type TutorAvatarProps = {
  rig?: CharacterRig;
  viseme: VisemeKey;
  // Optional idle bob animation — a subtle translateY cycle while the
  // tutor is "alive". Disable when you want the character perfectly still.
  idle?: boolean;
  // Optional speaking flag — a tiny head scale pulse while the tutor talks.
  speaking?: boolean;
};

export function TutorAvatar({ rig, viseme, idle = true, speaking = false }: TutorAvatarProps) {
  const aspect = rig?.aspect ?? 3 / 4;
  // Container maintains aspect ratio via padding-bottom trick so the
  // percentage-based rig coordinates resolve predictably.
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${(1 / aspect) * 100}%`,
        animation: idle ? 'tutor-idle-bob 3.2s ease-in-out infinite' : undefined,
        filter: speaking ? 'drop-shadow(0 0 14px rgba(255,216,77,0.45))' : undefined,
        transition: 'filter 0.2s',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        {rig ? <RigBody rig={rig} /> : <PlaceholderBody />}
        <MouthSlot rig={rig} viseme={viseme} speaking={speaking} />
      </div>
      <style>{`
        @keyframes tutor-idle-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

function RigBody({ rig }: { rig: CharacterRig }) {
  const sorted = [...rig.layers].sort((a, b) => a.z - b.z);
  return (
    <>
      {sorted.map((l) => (
        <img
          key={l.id}
          src={l.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: `${l.x ?? 0}%`,
            top: `${l.y ?? 0}%`,
            width: `${l.w ?? 100}%`,
            height: `${l.h ?? 100}%`,
            transform: l.flipX ? 'scaleX(-1)' : undefined,
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

function MouthSlot({
  rig,
  viseme,
  speaking,
}: {
  rig?: CharacterRig;
  viseme: VisemeKey;
  speaking: boolean;
}) {
  const box = rig?.mouth ?? PLACEHOLDER_MOUTH_BOX;
  const src = rig?.visemes[viseme] ?? rig?.visemes.rest;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.w}%`,
        height: `${box.h}%`,
        zIndex: box.z,
        transform: speaking ? 'scale(1.04)' : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 60ms',
        pointerEvents: 'none',
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', imageRendering: 'pixelated', userSelect: 'none' }}
        />
      ) : (
        <PlaceholderMouth viseme={viseme} />
      )}
    </div>
  );
}
