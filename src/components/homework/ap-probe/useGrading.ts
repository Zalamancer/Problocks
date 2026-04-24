// Rubric grading logic shared by the desktop and mobile homework views.
// Each part is worth part.points, split equally across its micro-questions.

import type { AnswersByPart, FRQ, Micro } from './types';

export type PartScore = { p: FRQ['parts'][number]; earned: number; possible: number };

export function isCorrect(micro: Micro, answer: NonNullable<AnswersByPart[string][string]>) {
  if (micro.kind === 'number') {
    return 'value' in answer && Math.abs(answer.value - micro.answer) <= micro.tol;
  }
  if (micro.kind === 'whiteboard') {
    // Pixel-grading is a future job for the vision model. Anything
    // submitted with a non-empty drawing counts as participation credit.
    return 'dataUrl' in answer && !!answer.dataUrl;
  }
  return 'correct' in answer && answer.correct;
}

export function gradeFRQ(frq: FRQ, answers: AnswersByPart): {
  partScores: PartScore[];
  totalEarned: number;
  totalPossible: number;
} {
  const partScores: PartScore[] = frq.parts.map((p) => {
    const perMicro = p.points / p.micros.length;
    const earned = p.micros.reduce((acc, m) => {
      const a = answers[p.id]?.[m.id];
      if (!a) return acc;
      return acc + (isCorrect(m, a) ? perMicro : 0);
    }, 0);
    return { p, earned, possible: p.points };
  });
  const totalEarned = partScores.reduce((a, x) => a + x.earned, 0);
  const totalPossible = frq.parts.reduce((a, p) => a + p.points, 0);
  return { partScores, totalEarned, totalPossible };
}
