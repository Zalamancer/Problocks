import type { DeepGrade } from '../types';

export const PRECALCULUS: DeepGrade = {
  grade: '12',
  label: 'Precalculus',
  sourceUrl: 'https://www.khanacademy.org/math/precalculus',
  units: [
    {
      name: 'Complex numbers',
      description: "Work with complex numbers in rectangular and polar forms including De Moivre's theorem.",
      lessons: [
        {
          name: 'Rectangular form',
          description: 'Add, subtract, multiply, divide in a + bi form.',
          questions: [
            { prompt: '(3+i) · (2-i).', answer: '7 - i', explanation: 'FOIL: 6-3i+2i+1.' },
            { prompt: '(1+i)/(1-i).', answer: 'i', explanation: 'Multiply by conjugate.' },
          ],
        },
        {
          name: 'Modulus and argument',
          description: 'Compute |z| and arg(z).',
          questions: [
            { prompt: '|3 + 4i|.', answer: '5', explanation: 'sqrt(9+16).' },
            { prompt: 'arg(1 + i) in radians.', answer: 'π/4', explanation: '45°.' },
          ],
        },
        {
          name: 'Polar form',
          description: 'Convert to r(cos θ + i sin θ).',
          questions: [
            { prompt: 'Convert 1 + i to polar.', answer: '√2(cos π/4 + i sin π/4)', explanation: 'r=√2.' },
            { prompt: 'Convert 2i to polar.', answer: '2(cos π/2 + i sin π/2)', explanation: 'r=2.' },
          ],
        },
        {
          name: "De Moivre's theorem",
          description: 'Apply (r cis θ)^n.',
          questions: [
            { prompt: '(cos π/4 + i sin π/4)^2.', answer: 'i', explanation: '(cos π/2 + i sin π/2).' },
            { prompt: 'What is De Moivre used for?', answer: 'powers of complex numbers', explanation: 'Raise to n.' },
          ],
        },
      ],
    },
    {
      name: 'Polynomials',
      description: 'Analyze zeros, multiplicity, and graphs of polynomial functions in depth.',
      lessons: [
        {
          name: 'Fundamental theorem of algebra',
          description: 'Degree n polynomial has n complex roots.',
          questions: [
            { prompt: 'Number of roots of x^4 - 1?', answer: '4', explanation: 'Degree 4.' },
            { prompt: 'Quadratic has at most how many roots?', answer: '2', explanation: 'Degree 2.' },
          ],
        },
        {
          name: 'Rational zeros',
          description: 'Use rational root theorem.',
          questions: [
            { prompt: 'Rational roots of x^3 - 6x^2 + 11x - 6 (factors)?', answer: '1, 2, 3', explanation: 'Check factors of 6.' },
            { prompt: 'Possible rational roots of 2x^2 + 3x + 1?', answer: '±1, ±1/2', explanation: 'Factors.' },
          ],
        },
        {
          name: 'End behavior and graphs',
          description: 'Analyze end behavior and turning points.',
          questions: [
            { prompt: 'End behavior of -x^5?', answer: 'up-left, down-right', explanation: 'Odd, negative.' },
            { prompt: 'Max turnings of degree 6?', answer: '5', explanation: 'n-1.' },
          ],
        },
        {
          name: 'Complex conjugate roots',
          description: 'Complex roots come in conjugate pairs.',
          questions: [
            { prompt: 'If 2+i is a root, what else is?', answer: '2 - i', explanation: 'Conjugate.' },
            { prompt: 'Real coefficient polynomial with root i needs root?', answer: '-i', explanation: 'Conjugate.' },
          ],
        },
      ],
    },
    {
      name: 'Composite functions',
      description: 'Compose and decompose functions and find inverses algebraically and graphically.',
      lessons: [
        {
          name: 'Function composition',
          description: 'Compute (f ∘ g)(x).',
          questions: [
            { prompt: 'f(x)=x+1, g(x)=2x. Find f(g(3)).', answer: '7', explanation: 'g(3)=6; f(6)=7.' },
            { prompt: 'f(x)=x^2, g(x)=x-1. Find (f∘g)(3).', answer: '4', explanation: 'g(3)=2; f(2)=4.' },
          ],
        },
        {
          name: 'Decomposing functions',
          description: 'Write h as f(g).',
          questions: [
            { prompt: 'h(x)=(x+1)^2. Decompose.', answer: 'f(u)=u^2, g(x)=x+1', explanation: 'Outer-inner.' },
            { prompt: 'h(x)=√(x-3). Decompose.', answer: 'f(u)=√u, g(x)=x-3', explanation: 'Outer-inner.' },
          ],
        },
        {
          name: 'Inverse functions',
          description: 'Algebraically find f^-1.',
          questions: [
            { prompt: 'Inverse of f(x)=2x+3.', answer: '(x-3)/2', explanation: 'Swap and solve.' },
            { prompt: 'Inverse of f(x)=x^3.', answer: 'cube root of x', explanation: 'Odd function.' },
          ],
        },
        {
          name: 'Verifying inverses',
          description: 'Show (f∘g)(x) = x.',
          questions: [
            { prompt: 'Is g(x)=(x-1)/2 inverse of f(x)=2x+1?', answer: 'Yes', explanation: 'Compose to x.' },
            { prompt: 'Reflect y=f(x) across which line for inverse?', answer: 'y = x', explanation: 'Standard.' },
          ],
        },
      ],
    },
    {
      name: 'Trigonometry',
      description: 'Prove trigonometric identities and solve trigonometric equations over given intervals.',
      lessons: [
        {
          name: 'Trig identities',
          description: 'Use Pythagorean, reciprocal, quotient identities.',
          questions: [
            { prompt: '1 + tan^2(x) = ?', answer: 'sec^2(x)', explanation: 'Pythagorean.' },
            { prompt: '1 + cot^2(x) = ?', answer: 'csc^2(x)', explanation: 'Pythagorean.' },
          ],
        },
        {
          name: 'Sum and difference formulas',
          description: 'Apply sin(a±b) and cos(a±b).',
          questions: [
            { prompt: 'sin(a+b) = ?', answer: 'sin a cos b + cos a sin b', explanation: 'Addition formula.' },
            { prompt: 'cos(a-b) = ?', answer: 'cos a cos b + sin a sin b', explanation: 'Subtraction.' },
          ],
        },
        {
          name: 'Double angle formulas',
          description: 'Use sin 2x and cos 2x identities.',
          questions: [
            { prompt: 'sin 2x = ?', answer: '2 sin x cos x', explanation: 'Double angle.' },
            { prompt: 'cos 2x = ?', answer: 'cos^2(x) - sin^2(x)', explanation: 'One form.' },
          ],
        },
        {
          name: 'Solving trig equations',
          description: 'Solve on [0, 2π).',
          questions: [
            { prompt: 'Solve sin x = 1/2 on [0,2π).', answer: 'π/6, 5π/6', explanation: 'Two solutions.' },
            { prompt: 'Solve cos x = 0 on [0,2π).', answer: 'π/2, 3π/2', explanation: 'Axis points.' },
          ],
        },
      ],
    },
    {
      name: 'Vectors',
      description: 'Represent and operate on vectors in two and three dimensions.',
      lessons: [
        {
          name: 'Vector operations',
          description: 'Add, subtract, and scale vectors.',
          questions: [
            { prompt: '<1,2> + <3,4>.', answer: '<4,6>', explanation: 'Component add.' },
            { prompt: '2 · <3,-1>.', answer: '<6,-2>', explanation: 'Scalar mul.' },
          ],
        },
        {
          name: 'Magnitude and direction',
          description: 'Compute |v| and angle.',
          questions: [
            { prompt: '|<3,4>|.', answer: '5', explanation: 'Pythagorean.' },
            { prompt: 'Direction angle of <1,1> (degrees)?', answer: '45°', explanation: 'tan = 1.' },
          ],
        },
        {
          name: 'Dot product',
          description: 'Compute and interpret v · w.',
          questions: [
            { prompt: '<1,2>·<3,4>.', answer: '11', explanation: '3+8.' },
            { prompt: 'When is dot product zero?', answer: 'Vectors perpendicular', explanation: 'Orthogonal.' },
          ],
        },
        {
          name: '3D vectors',
          description: 'Operate on vectors with three components.',
          questions: [
            { prompt: '<1,0,0> + <0,1,0>.', answer: '<1,1,0>', explanation: 'Component add.' },
            { prompt: '|<1,2,2>|.', answer: '3', explanation: 'sqrt(1+4+4).' },
          ],
        },
      ],
    },
    {
      name: 'Matrices',
      description: 'Add, multiply, and invert matrices and use them to solve systems and transform figures.',
      lessons: [
        {
          name: 'Matrix operations',
          description: 'Add and multiply matrices.',
          questions: [
            { prompt: '[[1,2],[3,4]] + [[5,6],[7,8]].', answer: '[[6,8],[10,12]]', explanation: 'Entrywise.' },
            { prompt: '2 · [[1,2],[3,4]].', answer: '[[2,4],[6,8]]', explanation: 'Scalar.' },
          ],
        },
        {
          name: 'Matrix multiplication',
          description: 'Compute AB using rows and columns.',
          questions: [
            { prompt: '[[1,0],[0,1]] · [[a,b],[c,d]].', answer: '[[a,b],[c,d]]', explanation: 'Identity.' },
            { prompt: 'Dimensions of 2x3 times 3x4?', answer: '2x4', explanation: 'Inner dims cancel.' },
          ],
        },
        {
          name: 'Determinants',
          description: 'Find determinants of 2x2 and 3x3.',
          questions: [
            { prompt: 'det [[1,2],[3,4]].', answer: '-2', explanation: '1·4-2·3.' },
            { prompt: 'det of identity matrix?', answer: '1', explanation: 'Standard.' },
          ],
        },
        {
          name: 'Inverses and systems',
          description: 'Solve Ax = b using A^-1.',
          questions: [
            { prompt: 'Inverse of [[1,0],[0,2]]?', answer: '[[1,0],[0,1/2]]', explanation: 'Diagonal inverse.' },
            { prompt: 'What is singular matrix?', answer: 'det = 0', explanation: 'No inverse.' },
          ],
        },
      ],
    },
    {
      name: 'Series',
      description: 'Evaluate finite and infinite series using summation notation and convergence tests.',
      lessons: [
        {
          name: 'Summation notation',
          description: 'Evaluate sums written in sigma form.',
          questions: [
            { prompt: 'Σ k=1 to 4 of k.', answer: '10', explanation: '1+2+3+4.' },
            { prompt: 'Σ k=1 to 3 of k^2.', answer: '14', explanation: '1+4+9.' },
          ],
        },
        {
          name: 'Arithmetic series',
          description: 'Sum with formula n/2 (a1 + an).',
          questions: [
            { prompt: 'Sum 1 to 100.', answer: '5050', explanation: '100/2·101.' },
            { prompt: 'Sum of first 10 odd numbers (1,3,...)?', answer: '100', explanation: 'n^2.' },
          ],
        },
        {
          name: 'Geometric series',
          description: 'Finite sum a(1-r^n)/(1-r).',
          questions: [
            { prompt: '1 + 2 + 4 + 8 + 16 sum?', answer: '31', explanation: '2^5 - 1.' },
            { prompt: 'Infinite sum 1 + 1/2 + 1/4 + ...?', answer: '2', explanation: 'a/(1-r).' },
          ],
        },
        {
          name: 'Convergence',
          description: 'Determine whether infinite geometric converges.',
          questions: [
            { prompt: 'Converges if |r| < ?', answer: '1', explanation: 'Geometric test.' },
            { prompt: 'Does Σ 2^n converge?', answer: 'No', explanation: 'r = 2 > 1.' },
          ],
        },
      ],
    },
    {
      name: 'Conic sections',
      description: 'Write and graph equations of parabolas, ellipses, and hyperbolas from geometric definitions.',
      lessons: [
        {
          name: 'Parabolas',
          description: 'Focus, directrix, and vertex.',
          questions: [
            { prompt: 'Focus of x^2 = 4y?', answer: '(0,1)', explanation: '4p=4 so p=1.' },
            { prompt: 'Directrix of x^2 = 4y?', answer: 'y = -1', explanation: 'Opposite side.' },
          ],
        },
        {
          name: 'Ellipses',
          description: 'Foci and axes of ellipses.',
          questions: [
            { prompt: 'Foci distance for x^2/25+y^2/9=1?', answer: 'c = 4', explanation: 'c^2 = a^2-b^2.' },
            { prompt: 'Sum of distances to foci = ?', answer: '2a', explanation: 'Definition.' },
          ],
        },
        {
          name: 'Hyperbolas',
          description: 'Foci and asymptotes.',
          questions: [
            { prompt: 'Asymptotes of x^2/9-y^2/16=1?', answer: 'y = ±(4/3)x', explanation: '±b/a.' },
            { prompt: 'Difference of distances to foci = ?', answer: '2a', explanation: 'Definition.' },
          ],
        },
        {
          name: 'Polar conics',
          description: 'Identify conics in polar form.',
          questions: [
            { prompt: 'r = 1/(1 + cos θ) is which conic?', answer: 'Parabola', explanation: 'Eccentricity = 1.' },
            { prompt: 'Eccentricity e<1 means?', answer: 'Ellipse', explanation: 'Definition.' },
          ],
        },
      ],
    },
    {
      name: 'Probability and combinatorics',
      description: 'Count outcomes using permutations and combinations and apply the binomial theorem.',
      lessons: [
        {
          name: 'Permutations',
          description: 'Use nPr = n!/(n-r)!.',
          questions: [
            { prompt: 'P(5,2).', answer: '20', explanation: '5·4.' },
            { prompt: '4! equals?', answer: '24', explanation: '4·3·2·1.' },
          ],
        },
        {
          name: 'Combinations',
          description: 'Use nCr = n!/(r!(n-r)!).',
          questions: [
            { prompt: 'C(5,2).', answer: '10', explanation: '5!/2!3!.' },
            { prompt: 'C(n,0) for any n?', answer: '1', explanation: 'Choose none.' },
          ],
        },
        {
          name: 'Binomial theorem',
          description: 'Expand (a+b)^n.',
          questions: [
            { prompt: 'Coefficient of x^2 in (x+1)^4?', answer: '6', explanation: 'C(4,2).' },
            { prompt: 'Middle term of (x+1)^6?', answer: '20x^3', explanation: 'C(6,3).' },
          ],
        },
        {
          name: 'Conditional probability',
          description: 'Compute P(A|B).',
          questions: [
            { prompt: 'P(A and B)=0.2, P(B)=0.5. P(A|B)?', answer: '0.4', explanation: 'Divide.' },
            { prompt: 'If A and B independent, P(A|B)=?', answer: 'P(A)', explanation: 'Independence.' },
          ],
        },
      ],
    },
  ],
};
