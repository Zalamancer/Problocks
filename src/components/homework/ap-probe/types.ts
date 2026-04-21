// Shared types for the AP Probe homework.

export type ChoiceOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type ChoiceMicro = {
  id: string;
  kind: 'choice';
  prompt: string;
  options: ChoiceOption[];
  explain: string;
};

export type NumberMicro = {
  id: string;
  kind: 'number';
  prompt: string;
  answer: number;
  tol: number;
  unit: string;
  explain: string;
};

export type Micro = ChoiceMicro | NumberMicro;

export type Part = {
  id: string;
  label: string;
  points: number;
  apText: string;
  highlight: number[];
  micros: Micro[];
};

export type DataColumn = { key: string; label: string; unit: string };
export type DataRow = {
  trial: number;
  theta: number;
  t: number;
  t2: number;
  sin: number;
};

export type FRQ = {
  source: {
    exam: string;
    year: number;
    frq: string;
    title: string;
    points: number;
  };
  experiment: string;
  table: { columns: DataColumn[]; rows: DataRow[] };
  parts: Part[];
};

// What we store per answered micro-question.
// For a multiple-choice answer: the picked ChoiceOption.
// For a numeric answer: { id, value, correct }.
export type Answer =
  | ChoiceOption
  | { id: 'num'; value: number; correct: boolean };

export type AnswersByPart = Record<string, Record<string, Answer>>;
