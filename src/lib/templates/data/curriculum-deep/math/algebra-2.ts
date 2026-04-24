import type { DeepGrade } from '../types';

export const ALGEBRA_2: DeepGrade = {
  grade: '11',
  label: 'Algebra 2',
  sourceUrl: 'https://www.khanacademy.org/math/algebra2',
  units: [
    {
      name: 'Polynomial arithmetic',
      description: 'Add, subtract, and multiply polynomials of any degree.',
      lessons: [
        {
          name: 'Adding and subtracting polynomials',
          description: 'Combine like terms in polynomials.',
          questions: [
            { prompt: 'Simplify (3x^2 + 2x) + (x^2 - 5x).', answer: '4x^2 - 3x', explanation: 'Combine.' },
            { prompt: 'Simplify (5x - 1) - (2x + 3).', answer: '3x - 4', explanation: 'Distribute minus.' },
          ],
        },
        {
          name: 'Multiplying polynomials',
          description: 'Use distribution to multiply polynomials.',
          questions: [
            { prompt: 'Expand (x+1)(x^2 - x + 1).', answer: 'x^3 + 1', explanation: 'Sum of cubes.' },
            { prompt: 'Expand (2x+3)(x-4).', answer: '2x^2 - 5x - 12', explanation: 'FOIL.' },
          ],
        },
        {
          name: 'Special products',
          description: 'Square of binomial and difference of squares.',
          questions: [
            { prompt: 'Expand (x+5)^2.', answer: 'x^2 + 10x + 25', explanation: 'Square binomial.' },
            { prompt: 'Expand (x-3)(x+3).', answer: 'x^2 - 9', explanation: 'DOS.' },
          ],
        },
        {
          name: 'Binomial theorem',
          description: 'Expand (a+b)^n using Pascal\'s triangle.',
          questions: [
            { prompt: 'Expand (x+1)^3.', answer: 'x^3 + 3x^2 + 3x + 1', explanation: 'Pascal coefficients.' },
            { prompt: 'Third term of (x+1)^4?', answer: '6x^2', explanation: 'Coefficient 6.' },
          ],
        },
      ],
    },
    {
      name: 'Complex numbers',
      description: 'Perform arithmetic with complex numbers and solve equations with complex roots.',
      lessons: [
        {
          name: 'Imaginary unit',
          description: 'Define i = sqrt(-1).',
          questions: [
            { prompt: 'Evaluate i^2.', answer: '-1', explanation: 'Definition.' },
            { prompt: 'Evaluate i^4.', answer: '1', explanation: 'i^2 squared.' },
          ],
        },
        {
          name: 'Add and subtract complex',
          description: 'Combine real and imaginary parts.',
          questions: [
            { prompt: '(3+2i) + (1-5i).', answer: '4 - 3i', explanation: 'Add parts.' },
            { prompt: '(5+i) - (2-3i).', answer: '3 + 4i', explanation: 'Subtract.' },
          ],
        },
        {
          name: 'Multiply complex',
          description: 'Multiply using FOIL.',
          questions: [
            { prompt: '(1+i)(1-i).', answer: '2', explanation: '1 - i^2 = 2.' },
            { prompt: '(2+3i)(1+i).', answer: '-1 + 5i', explanation: 'FOIL: 2+2i+3i+3i^2.' },
          ],
        },
        {
          name: 'Complex conjugates',
          description: 'Find conjugates and use them.',
          questions: [
            { prompt: 'Conjugate of 3 - 4i.', answer: '3 + 4i', explanation: 'Flip i sign.' },
            { prompt: '(2+3i)(2-3i).', answer: '13', explanation: 'Sum of squares.' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial factorization',
      description: 'Factor higher-degree polynomials using grouping, identities, and the rational root theorem.',
      lessons: [
        {
          name: 'Factoring by grouping',
          description: 'Group terms to factor cubics.',
          questions: [
            { prompt: 'Factor x^3 + x^2 + 2x + 2.', answer: '(x+1)(x^2+2)', explanation: 'Group pairs.' },
            { prompt: 'Factor x^3 - 3x^2 + 2x - 6.', answer: '(x-3)(x^2+2)', explanation: 'Group.' },
          ],
        },
        {
          name: 'Sum and difference of cubes',
          description: 'Apply a^3 ± b^3 identities.',
          questions: [
            { prompt: 'Factor x^3 - 27.', answer: '(x-3)(x^2 + 3x + 9)', explanation: 'DoC.' },
            { prompt: 'Factor x^3 + 8.', answer: '(x+2)(x^2 - 2x + 4)', explanation: 'SoC.' },
          ],
        },
        {
          name: 'Rational root theorem',
          description: 'List candidate rational roots.',
          questions: [
            { prompt: 'Possible rational roots of x^3 - 2x + 6=0 (p/q)?', answer: '±1,±2,±3,±6', explanation: 'Factors of 6.' },
            { prompt: 'Leading coeff 2, constant 3. Denoms?', answer: '1, 2', explanation: 'Factors of 2.' },
          ],
        },
        {
          name: 'Higher degree factoring',
          description: 'Factor quartics and higher.',
          questions: [
            { prompt: 'Factor x^4 - 16.', answer: '(x^2-4)(x^2+4) = (x-2)(x+2)(x^2+4)', explanation: 'DOS twice.' },
            { prompt: 'Factor x^4 - 5x^2 + 4.', answer: '(x^2-1)(x^2-4)', explanation: 'Quadratic in x^2.' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial division',
      description: 'Divide polynomials using long division and synthetic division.',
      lessons: [
        {
          name: 'Long division',
          description: 'Divide polynomials with long division.',
          questions: [
            { prompt: 'Divide (x^2 + 3x + 2) by (x+1).', answer: 'x + 2', explanation: 'Clean divide.' },
            { prompt: 'Divide (x^2 - 4) by (x-2).', answer: 'x + 2', explanation: 'DOS.' },
          ],
        },
        {
          name: 'Synthetic division',
          description: 'Divide by (x - c) using synthetic form.',
          questions: [
            { prompt: 'Divide x^2 + 5x + 6 by (x+2).', answer: 'x + 3', explanation: 'Quotient.' },
            { prompt: 'Remainder when x^3 - 1 divided by (x-1).', answer: '0', explanation: '1 is root.' },
          ],
        },
        {
          name: 'Remainder theorem',
          description: 'Use P(c) to find remainder.',
          questions: [
            { prompt: 'P(x) = x^2 + 1. Remainder by (x-2)?', answer: '5', explanation: 'P(2).' },
            { prompt: 'P(x) = x^3 - 8. Remainder by (x-2)?', answer: '0', explanation: 'Zero.' },
          ],
        },
        {
          name: 'Factor theorem',
          description: 'Use P(c) = 0 to find factors.',
          questions: [
            { prompt: 'Is (x-3) a factor of x^3 - 27?', answer: 'Yes', explanation: 'P(3)=0.' },
            { prompt: 'Is (x+1) a factor of x^2 - 1?', answer: 'Yes', explanation: 'P(-1)=0.' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial graphs',
      description: 'Analyze zeros, end behavior, and turning points of polynomial graphs.',
      lessons: [
        {
          name: 'Zeros and multiplicity',
          description: 'Find zeros and multiplicity from factored form.',
          questions: [
            { prompt: 'Zeros of (x-1)^2(x+3).', answer: '1 (mult 2), -3', explanation: 'From factors.' },
            { prompt: 'Multiplicity of 0 in x^3(x-2)?', answer: '3', explanation: 'x^3.' },
          ],
        },
        {
          name: 'End behavior',
          description: 'Identify end behavior from leading term.',
          questions: [
            { prompt: 'End behavior of 2x^3?', answer: 'down-left, up-right', explanation: 'Odd, positive.' },
            { prompt: 'End behavior of -x^4?', answer: 'down on both ends', explanation: 'Even, negative.' },
          ],
        },
        {
          name: 'Turning points',
          description: 'Max turning points of degree n polynomial.',
          questions: [
            { prompt: 'Max turning points of degree 5?', answer: '4', explanation: 'n-1.' },
            { prompt: 'Degree 3 max turnings?', answer: '2', explanation: 'n-1.' },
          ],
        },
        {
          name: 'Sketching polynomials',
          description: 'Sketch using zeros and end behavior.',
          questions: [
            { prompt: 'Y-intercept of P(x)=x^3 - 2x + 1?', answer: '1', explanation: 'P(0).' },
            { prompt: 'Does (x-1)^2 cross or touch x-axis?', answer: 'Touch', explanation: 'Even multiplicity.' },
          ],
        },
      ],
    },
    {
      name: 'Rational exponents and radicals',
      description: 'Rewrite expressions involving rational exponents and radicals.',
      lessons: [
        {
          name: 'Rational exponent form',
          description: 'Convert radical to rational exponent.',
          questions: [
            { prompt: 'Write cube root of x as exponent.', answer: 'x^(1/3)', explanation: 'Standard.' },
            { prompt: 'Evaluate 27^(2/3).', answer: '9', explanation: '(cube root)^2.' },
          ],
        },
        {
          name: 'Operations with radicals',
          description: 'Simplify products and sums.',
          questions: [
            { prompt: 'Simplify √12 · √3.', answer: '6', explanation: '√36.' },
            { prompt: 'Simplify 3√5 + 2√5.', answer: '5√5', explanation: 'Combine.' },
          ],
        },
        {
          name: 'Solving radical equations',
          description: 'Isolate and square.',
          questions: [
            { prompt: 'Solve √x = 4.', answer: 'x = 16', explanation: 'Square both sides.' },
            { prompt: 'Solve √(x+3) = 5.', answer: 'x = 22', explanation: 'Square and subtract.' },
          ],
        },
        {
          name: 'Extraneous solutions',
          description: 'Check for extraneous solutions.',
          questions: [
            { prompt: 'Solve √x = -2.', answer: 'No solution', explanation: 'Radical non-negative.' },
            { prompt: 'Why check extraneous?', answer: 'Squaring can add false roots', explanation: 'Need verify.' },
          ],
        },
      ],
    },
    {
      name: 'Exponential models',
      description: 'Build and interpret exponential functions modeling real-world growth and decay.',
      lessons: [
        {
          name: 'Compound interest',
          description: 'Apply A = P(1+r/n)^(nt).',
          questions: [
            { prompt: '$1000 at 5% compounded yearly, 2 yrs. A?', answer: '$1102.50', explanation: '1000·1.05^2.' },
            { prompt: 'Monthly rate if annual is 12% monthly?', answer: '1%', explanation: '12/12.' },
          ],
        },
        {
          name: 'Continuous growth',
          description: 'Apply A = P·e^(rt).',
          questions: [
            { prompt: 'Formula for continuous growth?', answer: 'Pe^(rt)', explanation: 'Exponential.' },
            { prompt: 'If r=0.1, t=0, A/P?', answer: '1', explanation: 'e^0 = 1.' },
          ],
        },
        {
          name: 'Half-life problems',
          description: 'Use half-life to find remaining amount.',
          questions: [
            { prompt: 'Half-life 5 years. Amount after 10 years from 80?', answer: '20', explanation: 'Two half-lives.' },
            { prompt: 'After 3 half-lives, fraction?', answer: '1/8', explanation: '(1/2)^3.' },
          ],
        },
        {
          name: 'Exponential regression intro',
          description: 'Fit exponential model to data.',
          questions: [
            { prompt: 'Model form y = a·b^x. a is...?', answer: 'initial value', explanation: 'y(0).' },
            { prompt: 'b > 1 means...?', answer: 'growth', explanation: 'Increasing.' },
          ],
        },
      ],
    },
    {
      name: 'Logarithms',
      description: 'Understand logarithms as inverses of exponentials and solve logarithmic equations.',
      lessons: [
        {
          name: 'Log definition',
          description: 'Convert between exponent and log form.',
          questions: [
            { prompt: 'Evaluate log_2(8).', answer: '3', explanation: '2^3=8.' },
            { prompt: 'Rewrite 3^4 = 81 as log.', answer: 'log_3(81)=4', explanation: 'Definition.' },
          ],
        },
        {
          name: 'Log properties',
          description: 'Product, quotient, power rules.',
          questions: [
            { prompt: 'Simplify log(6) + log(2).', answer: 'log(12)', explanation: 'Product rule.' },
            { prompt: 'Simplify log(a^3).', answer: '3 log(a)', explanation: 'Power rule.' },
          ],
        },
        {
          name: 'Change of base',
          description: 'Convert to natural or common logs.',
          questions: [
            { prompt: 'log_2(10) using log base 10?', answer: 'log(10)/log(2)', explanation: 'Change base.' },
            { prompt: 'ln(e^5)?', answer: '5', explanation: 'Inverse.' },
          ],
        },
        {
          name: 'Solving log and exp equations',
          description: 'Use logs to solve exponentials and vice versa.',
          questions: [
            { prompt: 'Solve 2^x = 32.', answer: 'x = 5', explanation: 'Powers of 2.' },
            { prompt: 'Solve log(x) = 2 (base 10).', answer: 'x = 100', explanation: '10^2.' },
          ],
        },
      ],
    },
    {
      name: 'Transformations of functions',
      description: 'Shift, reflect, stretch, and compress parent functions.',
      lessons: [
        {
          name: 'Vertical shifts',
          description: 'y = f(x) + k shifts vertically.',
          questions: [
            { prompt: 'y = x^2 + 3. Shift?', answer: 'Up 3', explanation: '+k up.' },
            { prompt: 'y = |x| - 5. Shift?', answer: 'Down 5', explanation: '-k down.' },
          ],
        },
        {
          name: 'Horizontal shifts',
          description: 'y = f(x - h) shifts horizontally.',
          questions: [
            { prompt: 'y = (x-4)^2. Shift?', answer: 'Right 4', explanation: 'Inside opposite.' },
            { prompt: 'y = (x+2)^2. Shift?', answer: 'Left 2', explanation: 'Inside opposite.' },
          ],
        },
        {
          name: 'Reflections',
          description: 'y = -f(x) and y = f(-x).',
          questions: [
            { prompt: 'y = -x^2 reflects across?', answer: 'x-axis', explanation: 'Negate output.' },
            { prompt: 'y = (-x)^2 is?', answer: 'Same as x^2', explanation: 'Even function.' },
          ],
        },
        {
          name: 'Stretches and compressions',
          description: 'y = a·f(x) scales vertically.',
          questions: [
            { prompt: 'y = 3x^2 is a...?', answer: 'Vertical stretch', explanation: 'a>1.' },
            { prompt: 'y = 0.5·sin(x) is a...?', answer: 'Vertical compression', explanation: '0<a<1.' },
          ],
        },
      ],
    },
    {
      name: 'Equations',
      description: 'Solve rational, radical, exponential, and logarithmic equations.',
      lessons: [
        {
          name: 'Rational equations',
          description: 'Multiply by LCD and solve.',
          questions: [
            { prompt: 'Solve 1/x + 1/2 = 1.', answer: 'x = 2', explanation: '1/x = 1/2.' },
            { prompt: 'Solve 2/(x+1) = 1.', answer: 'x = 1', explanation: 'Cross multiply.' },
          ],
        },
        {
          name: 'Radical equations',
          description: 'Isolate and square.',
          questions: [
            { prompt: 'Solve √(x) + 2 = 5.', answer: 'x = 9', explanation: 'Isolate then square.' },
            { prompt: 'Solve √(2x+1) = 3.', answer: 'x = 4', explanation: '2x+1=9.' },
          ],
        },
        {
          name: 'Exponential equations',
          description: 'Use log to isolate.',
          questions: [
            { prompt: 'Solve 2^x = 16.', answer: 'x = 4', explanation: 'Powers.' },
            { prompt: 'Solve e^x = 1.', answer: 'x = 0', explanation: 'e^0 = 1.' },
          ],
        },
        {
          name: 'Logarithmic equations',
          description: 'Use exponent to isolate.',
          questions: [
            { prompt: 'Solve log_2(x) = 4.', answer: 'x = 16', explanation: '2^4.' },
            { prompt: 'Solve ln(x) = 0.', answer: 'x = 1', explanation: 'ln(1)=0.' },
          ],
        },
      ],
    },
    {
      name: 'Trigonometry',
      description: 'Define trigonometric functions on the unit circle and graph sinusoidal functions.',
      lessons: [
        {
          name: 'Unit circle',
          description: 'Evaluate trig functions at key angles.',
          questions: [
            { prompt: 'sin(π/2).', answer: '1', explanation: 'Top of unit circle.' },
            { prompt: 'cos(π).', answer: '-1', explanation: 'Far left.' },
          ],
        },
        {
          name: 'Radians',
          description: 'Convert between radians and degrees.',
          questions: [
            { prompt: 'Convert 180° to radians.', answer: 'π', explanation: 'Half circle.' },
            { prompt: 'Convert π/3 to degrees.', answer: '60°', explanation: '180/3.' },
          ],
        },
        {
          name: 'Graphing sine and cosine',
          description: 'Identify amplitude and period.',
          questions: [
            { prompt: 'Amplitude of y = 3 sin(x)?', answer: '3', explanation: 'Coefficient.' },
            { prompt: 'Period of y = sin(2x)?', answer: 'π', explanation: '2π/2.' },
          ],
        },
        {
          name: 'Trig identities',
          description: 'Use Pythagorean identity.',
          questions: [
            { prompt: 'Simplify sin^2(x) + cos^2(x).', answer: '1', explanation: 'Pythagorean.' },
            { prompt: 'If sin x = 3/5, cos x?', answer: '4/5 or -4/5', explanation: 'Pythagorean.' },
          ],
        },
      ],
    },
    {
      name: 'Modeling',
      description: 'Use functions to model quantitative relationships and make predictions.',
      lessons: [
        {
          name: 'Linear modeling',
          description: 'Fit and use linear models.',
          questions: [
            { prompt: 'Slope represents...?', answer: 'rate of change', explanation: 'Change per unit.' },
            { prompt: 'Y-intercept represents...?', answer: 'initial value', explanation: 'At x=0.' },
          ],
        },
        {
          name: 'Quadratic modeling',
          description: 'Use quadratics for projectile motion.',
          questions: [
            { prompt: 'Max height occurs at...?', answer: 'vertex', explanation: 'Highest point.' },
            { prompt: 'Height model -16t^2 + v0·t. Units?', answer: 'feet', explanation: 'Standard imperial.' },
          ],
        },
        {
          name: 'Exponential modeling',
          description: 'Model with exponentials.',
          questions: [
            { prompt: 'Growth rate 7% means b = ?', answer: '1.07', explanation: '1 + rate.' },
            { prompt: 'Decay 20% means b = ?', answer: '0.80', explanation: '1 - rate.' },
          ],
        },
        {
          name: 'Choosing a model',
          description: 'Decide between linear, quadratic, exponential.',
          questions: [
            { prompt: 'Constant rate of change → ?', answer: 'Linear', explanation: 'Straight line.' },
            { prompt: 'Constant ratio between consecutive → ?', answer: 'Exponential', explanation: 'Geometric.' },
          ],
        },
      ],
    },
    {
      name: 'Rational functions',
      description: 'Analyze asymptotes, intercepts, and end behavior of rational functions.',
      lessons: [
        {
          name: 'Vertical asymptotes',
          description: 'Find VAs where denominator = 0.',
          questions: [
            { prompt: 'VA of 1/(x-3)?', answer: 'x = 3', explanation: 'Denominator zero.' },
            { prompt: 'VA of x/(x^2 - 4)?', answer: 'x = ±2', explanation: 'Factor denom.' },
          ],
        },
        {
          name: 'Horizontal asymptotes',
          description: 'Use degrees to find HA.',
          questions: [
            { prompt: 'HA of 2x/x?', answer: 'y = 2', explanation: 'Same degree, ratio.' },
            { prompt: 'HA of 1/x?', answer: 'y = 0', explanation: 'Denom higher.' },
          ],
        },
        {
          name: 'Intercepts of rationals',
          description: 'Find x and y intercepts.',
          questions: [
            { prompt: 'Y-int of (x-1)/(x+2)?', answer: '-1/2', explanation: 'x=0.' },
            { prompt: 'X-int of (x-3)/(x+1)?', answer: '3', explanation: 'Numerator zero.' },
          ],
        },
        {
          name: 'Graphing rationals',
          description: 'Sketch graphs with asymptotes.',
          questions: [
            { prompt: 'Does graph of 1/x have y-intercept?', answer: 'No', explanation: 'Undefined at 0.' },
            { prompt: 'Sign of 1/x when x < 0?', answer: 'Negative', explanation: 'Reciprocal.' },
          ],
        },
      ],
    },
  ],
};
