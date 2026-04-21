// Hook that drives viseme cycling while the tutor is "speaking".
//
// Given a speech duration (ms), this will cycle the viseme key every
// ~90ms (roughly 11 fps, which reads as natural lipsync at a glance),
// biasing the sequence to match the rough phoneme distribution of the
// target text so the mouth feels a bit less random than a shuffle.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VisemeKey } from './tutor-types';

const VOWEL_HEAVY: VisemeKey[] = ['ai', 'e', 'o', 'u', 'ai', 'e', 'o'];
const CONSONANT: VisemeKey[] = ['mbp', 'fv', 'l', 'mbp'];

// Pick a viseme roughly matching a character of input text.
function visemeForChar(c: string): VisemeKey | null {
  const k = c.toLowerCase();
  if ('aäáà'.includes(k) || 'iíîï'.includes(k)) return 'ai';
  if ('eéè'.includes(k)) return 'e';
  if ('oóôö'.includes(k)) return 'o';
  if ('uúü'.includes(k) || k === 'w') return 'u';
  if (k === 'm' || k === 'b' || k === 'p') return 'mbp';
  if (k === 'f' || k === 'v') return 'fv';
  if (k === 'l' || k === 't' || k === 'd' || k === 'n') return 'l';
  return null;
}

type SpeakOpts = {
  // Total speech duration in ms. Defaults to ~45ms/char.
  durationMs?: number;
  // Frame time in ms between viseme swaps. Lower = chattier mouth.
  frameMs?: number;
  // Called once speech finishes naturally (not when cancelled).
  onDone?: () => void;
};

export function useTutorSpeech() {
  const [viseme, setViseme] = useState<VisemeKey>('rest');
  const [speaking, setSpeaking] = useState(false);
  // Text already "spoken" so far. The caller drives a progressive reveal
  // of the tutor's message by reading this instead of the final string.
  const [revealedText, setRevealedText] = useState('');
  const timerRef = useRef<number | null>(null);
  const idxRef = useRef(0);
  const seqRef = useRef<VisemeKey[]>([]);
  const textRef = useRef('');
  const charsPerFrameRef = useRef(1);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSpeaking(false);
    setViseme('rest');
  }, []);

  const speak = useCallback(
    (text: string, opts: SpeakOpts = {}) => {
      stop();
      const frameMs = opts.frameMs ?? 90;
      const durationMs = opts.durationMs ?? Math.max(400, text.length * 45);

      // Build a sequence by sampling characters at the frame rate.
      const frames = Math.max(4, Math.round(durationMs / frameMs));
      const step = Math.max(1, Math.floor(text.length / frames));
      const seq: VisemeKey[] = [];
      for (let i = 0; i < frames; i++) {
        const c = text[i * step] || '';
        const v =
          visemeForChar(c) ??
          (i % 3 === 0 ? CONSONANT[i % CONSONANT.length] : VOWEL_HEAVY[i % VOWEL_HEAVY.length]);
        seq.push(v);
      }
      seqRef.current = seq;
      idxRef.current = 0;
      textRef.current = text;
      // How many characters of the source text to reveal per frame so the
      // reveal finishes in sync with the last viseme.
      charsPerFrameRef.current = Math.max(1, text.length / frames);
      setRevealedText('');
      setSpeaking(true);

      timerRef.current = window.setInterval(() => {
        const i = idxRef.current;
        if (i >= seqRef.current.length) {
          setRevealedText(textRef.current);
          stop();
          opts.onDone?.();
          return;
        }
        setViseme(seqRef.current[i]);
        // Reveal the matching slice of the source text. We use Math.ceil
        // so short bursts still advance by at least one character per frame.
        const chars = Math.min(
          textRef.current.length,
          Math.ceil((i + 1) * charsPerFrameRef.current),
        );
        setRevealedText(textRef.current.slice(0, chars));
        idxRef.current = i + 1;
      }, frameMs);
    },
    [stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { viseme, speaking, revealedText, speak, stop };
}
