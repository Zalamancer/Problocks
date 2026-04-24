import type { DeepGrade } from '../types';

export const AP_CALCULUS_AB: DeepGrade = {
  grade: '12+',
  label: 'AP Calculus AB',
  sourceUrl: 'https://www.khanacademy.org/math/ap-calculus-ab',
  units: [
    {
      name: 'Limits and continuity',
      description: 'Evaluate limits analytically and graphically and determine where functions are continuous.',
      lessons: [
        {
          name: 'Limits from graphs',
          description: 'Read limits from graphs.',
          questions: [
            { prompt: 'If graph approaches 3 as x→2, limit?', answer: '3', explanation: 'Approach value.' },
            { prompt: 'If left limit = right limit, two-sided limit?', answer: 'Equal to that value', explanation: 'Must match.' },
          ],
        },
        {
          name: 'Evaluating limits',
          description: 'Plug in, factor, conjugate.',
          questions: [
            { prompt: 'lim x→2 of x^2.', answer: '4', explanation: 'Direct substitution.' },
            { prompt: 'lim x→0 of (sin x)/x.', answer: '1', explanation: 'Standard limit.' },
          ],
        },
        {
          name: 'One-sided limits',
          description: 'Analyze limits from left and right.',
          questions: [
            { prompt: 'lim x→0+ of 1/x.', answer: '+∞', explanation: 'Positive side.' },
            { prompt: 'lim x→0- of 1/x.', answer: '-∞', explanation: 'Negative side.' },
          ],
        },
        {
          name: 'Continuity',
          description: 'Identify types of discontinuities.',
          questions: [
            { prompt: 'Removable discontinuity has...?', answer: 'a hole', explanation: 'Can be fixed.' },
            { prompt: 'Continuous at x=a means?', answer: 'lim = f(a)', explanation: 'Three conditions.' },
          ],
        },
      ],
    },
    {
      name: 'Differentiation: definition and basic derivative rules',
      description: 'Define the derivative and apply power, product, quotient, and sum rules.',
      lessons: [
        {
          name: 'Definition of derivative',
          description: 'Use the limit definition.',
          questions: [
            { prompt: "f(x)=x^2. f'(3) using definition?", answer: '6', explanation: 'lim h→0 (f(3+h)-f(3))/h.' },
            { prompt: "Derivative of constant f(x)=5?", answer: '0', explanation: 'No change.' },
          ],
        },
        {
          name: 'Power rule',
          description: "Derivative of x^n is n·x^(n-1).",
          questions: [
            { prompt: 'd/dx of x^5.', answer: '5x^4', explanation: 'Power rule.' },
            { prompt: 'd/dx of x^(1/2).', answer: '(1/2)x^(-1/2)', explanation: 'Power rule.' },
          ],
        },
        {
          name: 'Product and quotient rule',
          description: 'Use (uv)\' and (u/v)\'.',
          questions: [
            { prompt: "d/dx of x·sin x.", answer: 'sin x + x cos x', explanation: 'Product rule.' },
            { prompt: "d/dx of x/ (x+1).", answer: '1/(x+1)^2', explanation: 'Quotient rule.' },
          ],
        },
        {
          name: 'Basic trig/exp/log derivatives',
          description: 'Memorize standard derivatives.',
          questions: [
            { prompt: 'd/dx of sin x.', answer: 'cos x', explanation: 'Standard.' },
            { prompt: 'd/dx of e^x.', answer: 'e^x', explanation: 'Self-derivative.' },
          ],
        },
      ],
    },
    {
      name: 'Differentiation: composite, implicit, and inverse functions',
      description: 'Apply the chain rule and differentiate implicit and inverse functions.',
      lessons: [
        {
          name: 'Chain rule',
          description: "d/dx f(g(x)) = f'(g)·g'.",
          questions: [
            { prompt: 'd/dx of (x^2+1)^3.', answer: '6x(x^2+1)^2', explanation: 'Chain.' },
            { prompt: 'd/dx of sin(2x).', answer: '2cos(2x)', explanation: 'Chain.' },
          ],
        },
        {
          name: 'Implicit differentiation',
          description: 'Differentiate y terms using dy/dx.',
          questions: [
            { prompt: 'x^2 + y^2 = 25. dy/dx?', answer: '-x/y', explanation: 'Solve for dy/dx.' },
            { prompt: 'y^2 = x. dy/dx?', answer: '1/(2y)', explanation: 'Implicit.' },
          ],
        },
        {
          name: 'Derivative of inverse',
          description: "(f^-1)'(y) = 1/f'(x).",
          questions: [
            { prompt: 'If f(2)=5 and f\'(2)=3, (f^-1)\'(5)?', answer: '1/3', explanation: 'Reciprocal.' },
            { prompt: "d/dx of ln x.", answer: '1/x', explanation: 'Inverse of e^x.' },
          ],
        },
        {
          name: 'Higher derivatives',
          description: 'Compute f\'\' and f\'\'\'.',
          questions: [
            { prompt: "f(x)=x^3. f''(x)?", answer: '6x', explanation: 'Twice differentiated.' },
            { prompt: "d^2/dx^2 of sin x.", answer: '-sin x', explanation: 'Second derivative.' },
          ],
        },
      ],
    },
    {
      name: 'Contextual applications of differentiation',
      description: 'Use derivatives to analyze motion, related rates, and linear approximations.',
      lessons: [
        {
          name: 'Rectilinear motion',
          description: 'Position, velocity, acceleration.',
          questions: [
            { prompt: 's(t) = t^2. velocity v(2)?', answer: '4', explanation: 's\' = 2t.' },
            { prompt: 'v\'(t) = ?', answer: 'acceleration', explanation: 'Definition.' },
          ],
        },
        {
          name: 'Related rates',
          description: 'Differentiate equations with respect to time.',
          questions: [
            { prompt: 'A=πr^2. If dr/dt=1, dA/dt when r=3?', answer: '6π', explanation: '2πr dr/dt.' },
            { prompt: 'V=s^3. If ds/dt=2, dV/dt at s=1?', answer: '6', explanation: '3s^2 ds/dt.' },
          ],
        },
        {
          name: 'Linear approximation',
          description: 'Use tangent line to approximate.',
          questions: [
            { prompt: 'L(x) near x=a uses what?', answer: "f(a) + f'(a)(x-a)", explanation: 'Tangent line.' },
            { prompt: 'Approx √4.1 using f(x)=√x at 4.', answer: '2.025', explanation: '2 + 0.1/4.' },
          ],
        },
        {
          name: "L'Hôpital's rule",
          description: 'Resolve 0/0 or ∞/∞ forms.',
          questions: [
            { prompt: 'lim x→0 of (sin x)/x using LH?', answer: '1', explanation: 'cos x / 1 at 0.' },
            { prompt: 'lim x→∞ of x/e^x?', answer: '0', explanation: 'LH: 1/e^x.' },
          ],
        },
      ],
    },
    {
      name: 'Applying derivatives to analyze functions',
      description: 'Use first and second derivatives to find extrema, concavity, and inflection points.',
      lessons: [
        {
          name: 'Critical points and extrema',
          description: "Solve f'(x)=0 for candidate extrema.",
          questions: [
            { prompt: 'f(x)=x^2-4x. Critical point?', answer: 'x = 2', explanation: "f'=0." },
            { prompt: 'f(x)=x^3. Critical point?', answer: 'x = 0', explanation: "f'=0; inflection." },
          ],
        },
        {
          name: 'First derivative test',
          description: 'Classify extrema by sign change.',
          questions: [
            { prompt: "If f' changes + to -, x is?", answer: 'local max', explanation: 'First derivative test.' },
            { prompt: "If f' changes - to +, x is?", answer: 'local min', explanation: 'First derivative test.' },
          ],
        },
        {
          name: 'Concavity and inflection',
          description: "Use f'' to identify concavity.",
          questions: [
            { prompt: "If f'' > 0, graph is?", answer: 'concave up', explanation: 'Curving upward.' },
            { prompt: "Inflection point where f'' changes?", answer: 'sign', explanation: 'Concavity shift.' },
          ],
        },
        {
          name: 'Optimization',
          description: 'Find max/min in context.',
          questions: [
            { prompt: 'Max area rectangle with perimeter 20?', answer: '25 (5×5 square)', explanation: 'Square optimum.' },
            { prompt: 'Optimization uses which derivative?', answer: 'first derivative', explanation: 'Find critical points.' },
          ],
        },
      ],
    },
    {
      name: 'Integration and accumulation of change',
      description: 'Evaluate definite and indefinite integrals using the fundamental theorem of calculus.',
      lessons: [
        {
          name: 'Antiderivatives',
          description: 'Reverse power rule.',
          questions: [
            { prompt: '∫ x^2 dx.', answer: 'x^3/3 + C', explanation: 'Reverse power.' },
            { prompt: '∫ 1 dx.', answer: 'x + C', explanation: 'Constant.' },
          ],
        },
        {
          name: 'Definite integrals',
          description: 'Use FTC part 1.',
          questions: [
            { prompt: '∫_0^2 x dx.', answer: '2', explanation: 'x^2/2 eval.' },
            { prompt: '∫_0^1 x^2 dx.', answer: '1/3', explanation: 'x^3/3 eval.' },
          ],
        },
        {
          name: 'Fundamental theorem',
          description: "d/dx ∫_a^x f(t) dt = f(x).",
          questions: [
            { prompt: 'd/dx ∫_0^x sin t dt.', answer: 'sin x', explanation: 'FTC part 2.' },
            { prompt: '∫_a^b f\'(x) dx = ?', answer: 'f(b) - f(a)', explanation: 'FTC part 1.' },
          ],
        },
        {
          name: 'U-substitution',
          description: 'Change variables for integration.',
          questions: [
            { prompt: '∫ 2x(x^2+1)^3 dx using u=x^2+1.', answer: '(x^2+1)^4/4 + C', explanation: 'U-sub.' },
            { prompt: '∫ cos(2x) dx.', answer: '(1/2)sin(2x) + C', explanation: 'U = 2x.' },
          ],
        },
      ],
    },
    {
      name: 'Differential equations',
      description: 'Solve separable differential equations and interpret slope fields.',
      lessons: [
        {
          name: 'Slope fields',
          description: 'Interpret slope fields.',
          questions: [
            { prompt: "dy/dx = x. Slope at (1,0)?", answer: '1', explanation: 'Plug in.' },
            { prompt: 'Slope at origin for dy/dx = y?', answer: '0', explanation: 'y=0.' },
          ],
        },
        {
          name: 'Separable equations',
          description: 'Separate variables and integrate.',
          questions: [
            { prompt: 'Solve dy/dx = y.', answer: 'y = Ce^x', explanation: 'Exponential solution.' },
            { prompt: 'Solve dy/dx = x.', answer: 'y = x^2/2 + C', explanation: 'Integrate.' },
          ],
        },
        {
          name: 'Initial value problems',
          description: 'Use initial condition to find C.',
          questions: [
            { prompt: 'dy/dx=2, y(0)=3. y(x)?', answer: 'y = 2x + 3', explanation: 'IVP.' },
            { prompt: 'dy/dx=y, y(0)=5. y(x)?', answer: 'y = 5e^x', explanation: 'Initial.' },
          ],
        },
        {
          name: 'Exponential growth and decay',
          description: 'Model dy/dx = ky.',
          questions: [
            { prompt: 'dy/dt = ky general solution?', answer: 'y = y0·e^(kt)', explanation: 'Growth/decay.' },
            { prompt: 'If y0=100 and k=0.05, y at t=10?', answer: '100·e^0.5 ≈ 164.87', explanation: 'Exponential.' },
          ],
        },
      ],
    },
    {
      name: 'Applications of integration',
      description: 'Use integrals to compute areas, volumes, and average values.',
      lessons: [
        {
          name: 'Area between curves',
          description: 'Integrate top minus bottom.',
          questions: [
            { prompt: 'Area between y=x^2 and y=x on [0,1].', answer: '1/6', explanation: '∫(x - x^2) dx.' },
            { prompt: 'Area under y=x on [0,2].', answer: '2', explanation: 'Triangle.' },
          ],
        },
        {
          name: 'Volumes by disks',
          description: 'V = π ∫ [f(x)]^2 dx.',
          questions: [
            { prompt: 'Volume of y=x rotated around x-axis on [0,1].', answer: 'π/3', explanation: 'π∫x^2.' },
            { prompt: 'Disk method uses which axis?', answer: 'axis of rotation', explanation: 'Rotate about.' },
          ],
        },
        {
          name: 'Volumes by shells',
          description: 'V = 2π ∫ x·f(x) dx.',
          questions: [
            { prompt: 'Shell method formula?', answer: '2π∫ radius · height dx', explanation: 'Shells.' },
            { prompt: 'Volume of y=x^2 around y-axis on [0,1]?', answer: 'π/2', explanation: 'Shells integral.' },
          ],
        },
        {
          name: 'Average value',
          description: 'Avg = 1/(b-a) ∫_a^b f(x) dx.',
          questions: [
            { prompt: 'Avg of f(x)=x on [0,2].', answer: '1', explanation: '(1/2)·2.' },
            { prompt: 'Avg of f(x)=x^2 on [0,3]?', answer: '3', explanation: '(1/3)·9.' },
          ],
        },
      ],
    },
  ],
};
