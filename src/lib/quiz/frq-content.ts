// AP Physics 1 FRQ content — original text modeled on the AP style.
// Experiment: cart released from rest on an incline of adjustable angle.
// Students measure the time t for the cart to travel a fixed distance L = 1.50 m.

export interface MicroChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface MicroChoice {
  id: string;
  prompt: string;
  kind: 'choice';
  options: MicroChoiceOption[];
  explain: string;
}

export interface MicroNumber {
  id: string;
  prompt: string;
  kind: 'number';
  answer: number;
  tol: number;
  unit: string;
  explain: string;
}

// Whiteboard: student draws / writes a freehand answer on a canvas.
// We can't auto-grade pixels yet, so the server marks any submission
// `correct: true` (participation credit). When AI vision grading lands
// it'll re-grade the stored PNG without changing this type.
export interface MicroWhiteboard {
  id: string;
  prompt: string;
  kind: 'whiteboard';
  // Optional hint shown above the canvas (e.g. "Draw a free-body diagram").
  hint?: string;
  explain: string;
}

export type Micro = MicroChoice | MicroNumber | MicroWhiteboard;

export interface FrqPart {
  id: string;
  label: string;
  points: number;
  apText: string;
  highlight: number[];
  micros: Micro[];
}

export interface FrqTableColumn {
  key: string;
  label: string;
  unit: string;
}

export interface FrqTableRow {
  trial: number;
  theta: number;
  t: number;
  t2: number;
  sin: number;
  [k: string]: number;
}

export interface Frq {
  source: { exam: string; year: number; frq: string; title: string; points: number };
  experiment: string;
  table: { columns: FrqTableColumn[]; rows: FrqTableRow[] };
  parts: FrqPart[];
}

export const FRQ: Frq = {
  source: {
    exam: 'AP Physics 1',
    year: 2022,
    frq: 'FRQ #2',
    title: 'Cart on an Incline',
    points: 10,
  },
  experiment:
    'A cart is released from rest and slides distance L = 1.50 m down a ramp inclined at angle θ. Students record the time t for each trial.',
  table: {
    columns: [
      { key: 'trial', label: 'Trial', unit: '' },
      { key: 'theta', label: 'θ', unit: '°' },
      { key: 't',     label: 't', unit: 's' },
      { key: 't2',    label: 't²', unit: 's²' },
      { key: 'sin',   label: 'sin θ', unit: '' },
    ],
    rows: [
      { trial: 1, theta: 10, t: 1.32, t2: 1.74, sin: 0.174 },
      { trial: 2, theta: 15, t: 1.08, t2: 1.17, sin: 0.259 },
      { trial: 3, theta: 20, t: 0.94, t2: 0.88, sin: 0.342 },
      { trial: 4, theta: 25, t: 0.84, t2: 0.71, sin: 0.423 },
      { trial: 5, theta: 30, t: 0.77, t2: 0.59, sin: 0.500 },
    ],
  },
  parts: [
    {
      id: 'a',
      label: 'Part (a)',
      points: 2,
      apText:
        'Starting from rest and ignoring friction, derive an expression for the time t it takes the cart to travel distance L down the ramp as a function of the incline angle θ, the distance L, and physical constants.',
      highlight: [],
      micros: [
        {
          id: 'a1',
          prompt: 'Along the ramp, the net force on the cart has magnitude…',
          kind: 'choice',
          options: [
            { id: 'A', text: 'mg',        correct: false },
            { id: 'B', text: 'mg sin θ',  correct: true  },
            { id: 'C', text: 'mg cos θ',  correct: false },
            { id: 'D', text: 'mg tan θ',  correct: false },
          ],
          explain: 'Only the component of gravity along the ramp accelerates the cart: F∥ = mg sin θ.',
        },
        {
          id: 'a2',
          prompt: 'So the acceleration down the ramp is a =',
          kind: 'choice',
          options: [
            { id: 'A', text: 'g',        correct: false },
            { id: 'B', text: 'g cos θ',  correct: false },
            { id: 'C', text: 'g sin θ',  correct: true  },
            { id: 'D', text: 'g tan θ',  correct: false },
          ],
          explain: 'Divide F∥ by m: a = g sin θ. No friction, so nothing subtracts from it.',
        },
        {
          id: 'a3',
          prompt: 'Using L = ½at² starting from rest, solve for t.',
          kind: 'choice',
          options: [
            { id: 'A', text: 't = √(2L / g sin θ)', correct: true  },
            { id: 'B', text: 't = √(L / g sin θ)',  correct: false },
            { id: 'C', text: 't = 2L / g sin θ',    correct: false },
            { id: 'D', text: 't = √(2L · g sin θ)', correct: false },
          ],
          explain: 'Rearrange L = ½ g sin θ · t² → t = √(2L / g sin θ).',
        },
      ],
    },
    {
      id: 'b',
      label: 'Part (b)',
      points: 2,
      apText:
        'The students plan to plot a straight line to determine g experimentally. Identify two quantities that, when plotted against each other using the data, should yield a straight line passing through the origin.',
      highlight: [],
      micros: [
        {
          id: 'b1',
          prompt: 'From t = √(2L / g sin θ), square both sides to get…',
          kind: 'choice',
          options: [
            { id: 'A', text: 't² = (2L / g) · sin θ',      correct: false },
            { id: 'B', text: 't² = (2L / g) · (1 / sin θ)', correct: true  },
            { id: 'C', text: 't² = 2Lg · sin θ',            correct: false },
            { id: 'D', text: 't² = 2L / (g · cos θ)',       correct: false },
          ],
          explain: 'Squaring gives t² = 2L / (g sin θ), i.e. t² is proportional to 1/sin θ.',
        },
        {
          id: 'b2',
          prompt: 'So to get a straight line through the origin, plot…',
          kind: 'choice',
          options: [
            { id: 'A', text: 't vs. θ',        correct: false },
            { id: 'B', text: 't² vs. sin θ',   correct: false },
            { id: 'C', text: 't² vs. 1/sin θ', correct: true  },
            { id: 'D', text: 't vs. 1/sin θ',  correct: false },
          ],
          explain: 't² = (2L/g)(1/sin θ). Plotting t² against 1/sin θ gives slope 2L/g, intercept 0.',
        },
      ],
    },
    {
      id: 'c',
      label: 'Part (c)',
      points: 3,
      apText:
        'Using the data provided, determine an experimental value for the acceleration due to gravity, g. Clearly show your work.',
      highlight: [1, 2, 3, 4, 5],
      micros: [
        {
          id: 'c1',
          prompt: 'For Trial 5 (θ = 30°), what is 1/sin θ?',
          kind: 'number',
          answer: 2.00,
          tol: 0.05,
          unit: '',
          explain: '1 / sin 30° = 1 / 0.500 = 2.00.',
        },
        {
          id: 'c2',
          prompt: 'For Trial 1 (θ = 10°), what is 1/sin θ? (round to 2 dp)',
          kind: 'number',
          answer: 5.76,
          tol: 0.1,
          unit: '',
          explain: '1 / sin 10° = 1 / 0.174 ≈ 5.76.',
        },
        {
          id: 'c3',
          prompt:
            'The slope of t² vs. 1/sin θ from the data is about 0.30 s². Using slope = 2L/g with L = 1.50 m, solve for g.',
          kind: 'choice',
          options: [
            { id: 'A', text: '≈ 5.0 m/s²', correct: false },
            { id: 'B', text: '≈ 10 m/s²', correct: true  },
            { id: 'C', text: '≈ 15 m/s²', correct: false },
            { id: 'D', text: '≈ 20 m/s²', correct: false },
          ],
          explain: 'g = 2L / slope = 2(1.50) / 0.30 = 10 m/s². Within ~2% of accepted 9.8.',
        },
      ],
    },
    {
      id: 'd',
      label: 'Part (d)',
      points: 2,
      apText:
        'A student proposes that if the same experiment were repeated with a cart of twice the mass, the measured times t would be larger. Is the student correct? Justify your answer.',
      highlight: [],
      micros: [
        {
          id: 'd1',
          prompt: 'Does mass m appear in a = g sin θ?',
          kind: 'choice',
          options: [
            { id: 'A', text: 'Yes, a ∝ 1/m',    correct: false },
            { id: 'B', text: 'Yes, a ∝ m',      correct: false },
            { id: 'C', text: 'No, m cancels',   correct: true  },
            { id: 'D', text: 'Only if θ > 45°', correct: false },
          ],
          explain: 'F = ma and F = mg sin θ, so m cancels: a = g sin θ, independent of mass.',
        },
        {
          id: 'd2',
          prompt: 'The student\'s claim is…',
          kind: 'choice',
          options: [
            { id: 'A', text: 'Correct — heavier carts fall slower',   correct: false },
            { id: 'B', text: 'Correct — heavier carts fall faster',   correct: false },
            { id: 'C', text: 'Incorrect — t is independent of mass',  correct: true  },
            { id: 'D', text: 'Can\'t tell without friction data',     correct: false },
          ],
          explain: 'Since a doesn\'t depend on m, the times t for a given θ are also independent of mass.',
        },
      ],
    },
    {
      id: 'e',
      label: 'Part (e)',
      points: 1,
      apText:
        'In the actual experiment, friction between the cart and the ramp is small but not zero. How would this affect the experimental value of g calculated in part (c)? Justify your answer.',
      highlight: [],
      micros: [
        {
          id: 'e1',
          prompt: 'Friction opposes motion, so the measured acceleration is…',
          kind: 'choice',
          options: [
            { id: 'A', text: 'Larger than g sin θ',  correct: false },
            { id: 'B', text: 'Smaller than g sin θ', correct: true  },
            { id: 'C', text: 'Exactly g sin θ',      correct: false },
            { id: 'D', text: 'Zero',                 correct: false },
          ],
          explain: 'Friction points up the ramp, reducing net force → a_measured < g sin θ.',
        },
        {
          id: 'e2',
          prompt:
            'Smaller a means larger t², which means the slope 2L/g is larger, so the experimental g is…',
          kind: 'choice',
          options: [
            { id: 'A', text: 'Too large',    correct: false },
            { id: 'B', text: 'Too small',    correct: true  },
            { id: 'C', text: 'Unchanged',    correct: false },
            { id: 'D', text: 'Exactly zero', correct: false },
          ],
          explain: 'Slope = 2L/g. Larger slope ⇒ smaller g. The experiment underestimates g.',
        },
      ],
    },
    {
      id: 'f',
      label: 'Part (f)',
      points: 1,
      apText:
        'On the diagram below, draw and label the forces acting on the cart while it slides down the ramp (assume the ramp is frictionless).',
      highlight: [],
      micros: [
        {
          id: 'f1',
          kind: 'whiteboard',
          prompt: 'Draw a free-body diagram for the cart on the ramp.',
          hint: 'Two forces: gravity (mg, straight down) and the normal force (perpendicular to the ramp). Label each arrow.',
          explain:
            'Frictionless ramp ⇒ only mg (down) and N (perpendicular to the ramp surface) act on the cart. The net force points along the ramp with magnitude mg sin θ.',
        },
      ],
    },
  ],
};
