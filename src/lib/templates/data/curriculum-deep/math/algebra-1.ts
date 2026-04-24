import type { DeepGrade } from '../types';

export const ALGEBRA_1: DeepGrade = {
  grade: '9',
  label: 'Algebra 1',
  sourceUrl: 'https://www.khanacademy.org/math/algebra',
  units: [
    {
      name: 'Algebra foundations',
      description: 'Review the building blocks of algebra, including variables, expressions, and number properties.',
      lessons: [
        {
          name: 'Variables and expressions',
          description: 'Evaluate and simplify algebraic expressions.',
          questions: [
            { prompt: 'Evaluate 3x + 2 when x = 5.', answer: '17', explanation: '15 + 2.' },
            { prompt: 'Simplify 2a + 3a - a.', answer: '4a', explanation: 'Combine like terms.' },
          ],
        },
        {
          name: 'Order of operations',
          description: 'Apply PEMDAS to simplify.',
          questions: [
            { prompt: 'Evaluate 4 + 2·3^2.', answer: '22', explanation: '4 + 18.' },
            { prompt: 'Evaluate (5-2)^2 · 2.', answer: '18', explanation: '9·2.' },
          ],
        },
        {
          name: 'Number properties',
          description: 'Use commutative, associative, and distributive properties.',
          questions: [
            { prompt: 'Expand 5(x + 3).', answer: '5x + 15', explanation: 'Distribute.' },
            { prompt: 'Write 3(a+b+c).', answer: '3a+3b+3c', explanation: 'Distribute 3.' },
          ],
        },
        {
          name: 'Interpreting expressions',
          description: 'Read and interpret parts of expressions.',
          questions: [
            { prompt: 'In 3x + 5, identify the constant.', answer: '5', explanation: 'Term without variable.' },
            { prompt: 'What is the coefficient in -7y?', answer: '-7', explanation: 'Multiplies y.' },
          ],
        },
      ],
    },
    {
      name: 'Solving equations & inequalities',
      description: 'Solve linear equations and inequalities in one variable.',
      lessons: [
        {
          name: 'One-step and two-step equations',
          description: 'Solve using inverse operations.',
          questions: [
            { prompt: 'Solve 3x - 4 = 11.', answer: 'x = 5', explanation: 'Add 4 divide 3.' },
            { prompt: 'Solve x/4 + 2 = 5.', answer: 'x = 12', explanation: 'Subtract 2, multiply 4.' },
          ],
        },
        {
          name: 'Multi-step equations',
          description: 'Combine distribution and combining like terms.',
          questions: [
            { prompt: 'Solve 2(x+3) - x = 11.', answer: 'x = 5', explanation: 'x + 6 = 11.' },
            { prompt: 'Solve 3x + 2 = 5x - 8.', answer: 'x = 5', explanation: 'Isolate x.' },
          ],
        },
        {
          name: 'Linear inequalities',
          description: 'Solve and graph one-variable inequalities.',
          questions: [
            { prompt: 'Solve -2x > 8.', answer: 'x < -4', explanation: 'Flip sign when dividing by negative.' },
            { prompt: 'Solve 3x + 1 ≤ 10.', answer: 'x ≤ 3', explanation: 'Subtract 1 then divide.' },
          ],
        },
        {
          name: 'Compound inequalities',
          description: 'Solve AND/OR inequalities.',
          questions: [
            { prompt: 'Solve -2 < x + 1 < 4.', answer: '-3 < x < 3', explanation: 'Subtract 1 throughout.' },
            { prompt: 'Solve x<-1 or x>3. Graph?', answer: 'Two rays', explanation: 'Disjoint.' },
          ],
        },
      ],
    },
    {
      name: 'Working with units',
      description: 'Use units to guide solutions to multi-step problems and choose appropriate levels of accuracy.',
      lessons: [
        {
          name: 'Rate conversions',
          description: 'Convert between units using rates.',
          questions: [
            { prompt: 'Convert 60 mph to feet per second.', answer: '88 ft/s', explanation: '60·5280/3600.' },
            { prompt: 'Convert 2 hours to seconds.', answer: '7200', explanation: '2·3600.' },
          ],
        },
        {
          name: 'Dimensional analysis',
          description: 'Track units through calculations.',
          questions: [
            { prompt: 'Distance if rate=30 mph, time=2 h.', answer: '60 mi', explanation: 'd=rt.' },
            { prompt: 'If 1 kg ≈ 2.2 lb, convert 10 kg.', answer: '22 lb', explanation: '10·2.2.' },
          ],
        },
        {
          name: 'Accuracy and precision',
          description: 'Identify appropriate accuracy for measurements.',
          questions: [
            { prompt: 'Round 3.456 to one decimal.', answer: '3.5', explanation: 'Rounding rule.' },
            { prompt: 'Best unit to measure a table length?', answer: 'centimeters', explanation: 'Reasonable.' },
          ],
        },
        {
          name: 'Units in formulas',
          description: 'Use units as a check on formulas.',
          questions: [
            { prompt: 'Area units if side is meters?', answer: 'm^2', explanation: 'Square meters.' },
            { prompt: 'Volume of a cube with side m?', answer: 'm^3', explanation: 'Cubic meters.' },
          ],
        },
      ],
    },
    {
      name: 'Linear equations & graphs',
      description: 'Graph linear equations in two variables and interpret slope and intercepts.',
      lessons: [
        {
          name: 'Plotting and reading graphs',
          description: 'Plot ordered pairs and read graphs.',
          questions: [
            { prompt: 'Point (3,-2) is in which quadrant?', answer: 'IV', explanation: '+x, -y.' },
            { prompt: 'Y-intercept of graph where line crosses?', answer: 'y-axis', explanation: 'x=0.' },
          ],
        },
        {
          name: 'Slope from two points',
          description: 'Compute slope as rise over run.',
          questions: [
            { prompt: 'Slope of (2,3) and (6,11).', answer: '2', explanation: '8/4.' },
            { prompt: 'Slope of (0,4) and (4,0).', answer: '-1', explanation: '-4/4.' },
          ],
        },
        {
          name: 'Graphing linear equations',
          description: 'Graph using slope and intercept.',
          questions: [
            { prompt: 'Y-intercept of y = 2x + 5.', answer: '5', explanation: 'b in y=mx+b.' },
            { prompt: 'Slope of y = -3x + 1.', answer: '-3', explanation: 'Coefficient.' },
          ],
        },
        {
          name: 'Horizontal and vertical lines',
          description: 'Graph x = a and y = b lines.',
          questions: [
            { prompt: 'Slope of y = 4?', answer: '0', explanation: 'Horizontal.' },
            { prompt: 'Slope of x = -2?', answer: 'Undefined', explanation: 'Vertical.' },
          ],
        },
      ],
    },
    {
      name: 'Forms of linear equations',
      description: 'Write linear equations in slope-intercept, point-slope, and standard forms.',
      lessons: [
        {
          name: 'Slope-intercept form',
          description: 'Write and use y = mx + b.',
          questions: [
            { prompt: 'Line slope 3, y-int -2?', answer: 'y = 3x - 2', explanation: 'Plug in.' },
            { prompt: 'y = -x + 4. Slope?', answer: '-1', explanation: 'Read off.' },
          ],
        },
        {
          name: 'Point-slope form',
          description: 'Write y - y1 = m(x - x1).',
          questions: [
            { prompt: 'Line slope 2 through (1,3).', answer: 'y - 3 = 2(x - 1)', explanation: 'Plug in point.' },
            { prompt: 'Slope -1 through (0,5).', answer: 'y - 5 = -(x - 0)', explanation: 'Point slope.' },
          ],
        },
        {
          name: 'Standard form',
          description: 'Write Ax + By = C.',
          questions: [
            { prompt: 'Convert y = 2x + 3 to standard.', answer: '2x - y = -3', explanation: 'Rearrange.' },
            { prompt: 'Convert y = -x + 1 to standard.', answer: 'x + y = 1', explanation: 'Add x.' },
          ],
        },
        {
          name: 'Parallel and perpendicular',
          description: 'Identify parallel and perpendicular line slopes.',
          questions: [
            { prompt: 'Parallel to y=2x+1 has slope?', answer: '2', explanation: 'Same slope.' },
            { prompt: 'Perpendicular to y=3x has slope?', answer: '-1/3', explanation: 'Negative reciprocal.' },
          ],
        },
      ],
    },
    {
      name: 'Systems of equations',
      description: 'Solve systems of linear equations by graphing, substitution, and elimination.',
      lessons: [
        {
          name: 'Substitution',
          description: 'Solve systems by substitution.',
          questions: [
            { prompt: 'y = x, x + y = 6. Solve.', answer: '(3,3)', explanation: '2x = 6.' },
            { prompt: 'y = 2x+1, y = x+4. Solve.', answer: '(3,7)', explanation: 'x=3.' },
          ],
        },
        {
          name: 'Elimination',
          description: 'Solve systems by elimination.',
          questions: [
            { prompt: 'x+y=7, x-y=1. Solve.', answer: '(4,3)', explanation: 'Add: 2x=8.' },
            { prompt: '2x+y=8, x-y=1. Solve.', answer: '(3,2)', explanation: 'Add to get 3x=9.' },
          ],
        },
        {
          name: 'Number of solutions',
          description: 'Identify consistent, inconsistent, or dependent systems.',
          questions: [
            { prompt: 'Parallel lines give how many solutions?', answer: '0', explanation: 'No intersection.' },
            { prompt: 'Same line gives how many?', answer: 'Infinite', explanation: 'Dependent.' },
          ],
        },
        {
          name: 'Systems word problems',
          description: 'Model and solve word problems with systems.',
          questions: [
            { prompt: 'Two numbers sum to 20, differ by 4. Numbers?', answer: '12 and 8', explanation: 'Solve system.' },
            { prompt: 'Apples $2, oranges $1. 10 fruit, $16 total. Apples?', answer: '6', explanation: 'Solve 2a+o=16, a+o=10.' },
          ],
        },
      ],
    },
    {
      name: 'Inequalities (systems & graphs)',
      description: 'Graph two-variable inequalities and solve systems of inequalities.',
      lessons: [
        {
          name: 'Graphing linear inequalities',
          description: 'Shade regions for y > mx+b and y < mx+b.',
          questions: [
            { prompt: 'Shade y > x + 1. Include line?', answer: 'No', explanation: 'Strict inequality.' },
            { prompt: 'Is (0,0) in y < x + 1?', answer: 'Yes', explanation: '0 < 1.' },
          ],
        },
        {
          name: 'Systems of inequalities',
          description: 'Graph and identify solution regions.',
          questions: [
            { prompt: 'Is (1,1) in y<2x and y>0?', answer: 'Yes', explanation: '1<2 and 1>0.' },
            { prompt: 'Solution region is where shadings...?', answer: 'overlap', explanation: 'Intersection.' },
          ],
        },
        {
          name: 'Modeling with inequalities',
          description: 'Set up inequalities for constraints.',
          questions: [
            { prompt: 'Budget at most $20 for x at $4 each: ?', answer: '4x ≤ 20', explanation: 'Budget constraint.' },
            { prompt: 'Must have at least 5 items: ?', answer: 'n ≥ 5', explanation: 'At least.' },
          ],
        },
        {
          name: 'Feasible region',
          description: 'Identify corners of feasible regions.',
          questions: [
            { prompt: 'Feasible region is typically a...?', answer: 'polygon', explanation: 'Bounded by lines.' },
            { prompt: 'Optimum of linear objective lies at...?', answer: 'a vertex', explanation: 'Linear programming.' },
          ],
        },
      ],
    },
    {
      name: 'Functions',
      description: 'Understand function notation, domain and range, and interpret function behavior.',
      lessons: [
        {
          name: 'Function definition',
          description: 'Determine whether a relation is a function.',
          questions: [
            { prompt: 'Is {(1,2),(1,3),(2,4)} a function?', answer: 'No', explanation: '1 maps to two outputs.' },
            { prompt: 'Does y=x^2 pass vertical line test?', answer: 'Yes', explanation: 'Function.' },
          ],
        },
        {
          name: 'Function notation',
          description: 'Evaluate f(x).',
          questions: [
            { prompt: 'f(x) = 3x-1. Find f(4).', answer: '11', explanation: '12-1.' },
            { prompt: 'g(x) = x^2+2. Find g(-3).', answer: '11', explanation: '9+2.' },
          ],
        },
        {
          name: 'Domain and range',
          description: 'Identify domain and range from graphs and equations.',
          questions: [
            { prompt: 'Domain of y = sqrt(x).', answer: 'x ≥ 0', explanation: 'Nonnegative inputs.' },
            { prompt: 'Range of y = x^2.', answer: 'y ≥ 0', explanation: 'Squared values.' },
          ],
        },
        {
          name: 'Average rate of change',
          description: 'Compute average rate of change over an interval.',
          questions: [
            { prompt: 'f(x)=x^2. ARC from x=1 to x=3.', answer: '4', explanation: '(9-1)/2.' },
            { prompt: 'f(x)=2x+3. ARC from 0 to 5.', answer: '2', explanation: 'Slope.' },
          ],
        },
      ],
    },
    {
      name: 'Sequences',
      description: 'Analyze arithmetic and geometric sequences using recursive and explicit formulas.',
      lessons: [
        {
          name: 'Arithmetic sequences',
          description: 'Use an = a1 + (n-1)d.',
          questions: [
            { prompt: 'Sequence 3, 7, 11, ... find a10.', answer: '39', explanation: '3+9·4.' },
            { prompt: 'Common diff of 5,8,11,...?', answer: '3', explanation: 'Each step.' },
          ],
        },
        {
          name: 'Geometric sequences',
          description: 'Use an = a1 · r^(n-1).',
          questions: [
            { prompt: 'Sequence 2,6,18,... find a5.', answer: '162', explanation: '2·3^4.' },
            { prompt: 'Common ratio 4,8,16,...?', answer: '2', explanation: 'Each step.' },
          ],
        },
        {
          name: 'Recursive formulas',
          description: 'Write and use recursive definitions.',
          questions: [
            { prompt: 'a1=5, an=an-1+3. a3?', answer: '11', explanation: '5,8,11.' },
            { prompt: 'a1=2, an=2·an-1. a4?', answer: '16', explanation: '2,4,8,16.' },
          ],
        },
        {
          name: 'Modeling with sequences',
          description: 'Apply sequences to real-world contexts.',
          questions: [
            { prompt: 'Saving $20/week starting $50. After week 3?', answer: '$110', explanation: '50+60.' },
            { prompt: 'Doubling bacteria starting 10 after 4 hrs?', answer: '160', explanation: '10·2^4.' },
          ],
        },
      ],
    },
    {
      name: 'Absolute value & piecewise functions',
      description: 'Graph and evaluate absolute-value and piecewise-defined functions.',
      lessons: [
        {
          name: 'Absolute value equations',
          description: 'Solve |x| = a equations.',
          questions: [
            { prompt: 'Solve |x-3| = 5.', answer: 'x = 8 or -2', explanation: 'Two cases.' },
            { prompt: 'Solve |2x| = 10.', answer: 'x = 5 or -5', explanation: '2x = ±10.' },
          ],
        },
        {
          name: 'Absolute value graphs',
          description: 'Graph y = |x - h| + k.',
          questions: [
            { prompt: 'Vertex of y = |x-2|+3.', answer: '(2,3)', explanation: 'Inside opposite.' },
            { prompt: 'Shape of y = |x|.', answer: 'V-shape', explanation: 'Reflected at 0.' },
          ],
        },
        {
          name: 'Piecewise functions',
          description: 'Evaluate piecewise functions.',
          questions: [
            { prompt: 'f(x)=x if x<0; 2x if x≥0. f(-3)?', answer: '-3', explanation: 'First piece.' },
            { prompt: 'f(-2) if f(x)=x^2 for x<0?', answer: '4', explanation: '(-2)^2.' },
          ],
        },
        {
          name: 'Step functions',
          description: 'Evaluate greatest integer function.',
          questions: [
            { prompt: 'floor(3.7).', answer: '3', explanation: 'Round down.' },
            { prompt: 'floor(-1.2).', answer: '-2', explanation: 'Round down.' },
          ],
        },
      ],
    },
    {
      name: 'Exponents & radicals',
      description: 'Apply properties of exponents and simplify radical expressions.',
      lessons: [
        {
          name: 'Properties of exponents',
          description: 'Multiply, divide, and power exponential expressions.',
          questions: [
            { prompt: 'Simplify x^3 · x^4.', answer: 'x^7', explanation: 'Add exponents.' },
            { prompt: 'Simplify (x^2)^3.', answer: 'x^6', explanation: 'Multiply exponents.' },
          ],
        },
        {
          name: 'Negative and zero exponents',
          description: 'Interpret zero and negative exponents.',
          questions: [
            { prompt: 'Evaluate 5^0.', answer: '1', explanation: 'Any nonzero to 0.' },
            { prompt: 'Evaluate 2^-3.', answer: '1/8', explanation: 'Reciprocal.' },
          ],
        },
        {
          name: 'Simplifying radicals',
          description: 'Simplify square roots.',
          questions: [
            { prompt: 'Simplify sqrt(50).', answer: '5√2', explanation: '25·2.' },
            { prompt: 'Simplify sqrt(72).', answer: '6√2', explanation: '36·2.' },
          ],
        },
        {
          name: 'Rational exponents',
          description: 'Convert between radical and rational exponent form.',
          questions: [
            { prompt: 'Write sqrt(x) as power.', answer: 'x^(1/2)', explanation: 'Half power.' },
            { prompt: 'Evaluate 8^(1/3).', answer: '2', explanation: 'Cube root.' },
          ],
        },
      ],
    },
    {
      name: 'Exponential growth & decay',
      description: 'Model real-world situations with exponential functions.',
      lessons: [
        {
          name: 'Exponential functions',
          description: 'Evaluate y = a·b^x.',
          questions: [
            { prompt: 'y = 2·3^x. Find y when x=2.', answer: '18', explanation: '2·9.' },
            { prompt: 'y = 4·(1/2)^x. y at x=3?', answer: '0.5', explanation: '4·1/8.' },
          ],
        },
        {
          name: 'Growth vs decay',
          description: 'Identify exponential growth and decay.',
          questions: [
            { prompt: 'y = 5·1.2^x. Growth or decay?', answer: 'Growth', explanation: 'Base > 1.' },
            { prompt: 'y = 8·0.9^x. Growth or decay?', answer: 'Decay', explanation: 'Base < 1.' },
          ],
        },
        {
          name: 'Percent change modeling',
          description: 'Model growth and decay with percents.',
          questions: [
            { prompt: '$1000 grows 5% yearly. Function?', answer: '1000·1.05^t', explanation: 'Growth factor.' },
            { prompt: 'Car loses 10% yearly from $20k. Fn?', answer: '20000·0.9^t', explanation: 'Decay factor.' },
          ],
        },
        {
          name: 'Interpreting exponential graphs',
          description: 'Read initial value and growth rate from graphs.',
          questions: [
            { prompt: 'y-intercept of y=3·2^x.', answer: '3', explanation: 'At x=0.' },
            { prompt: 'Horizontal asymptote of y = 2^x.', answer: 'y = 0', explanation: 'Approaches 0.' },
          ],
        },
      ],
    },
    {
      name: 'Quadratics: Multiplying & factoring',
      description: 'Multiply polynomials and factor quadratic expressions.',
      lessons: [
        {
          name: 'Multiplying polynomials',
          description: 'Use FOIL and distribution.',
          questions: [
            { prompt: 'Expand (x+3)(x+4).', answer: 'x^2 + 7x + 12', explanation: 'FOIL.' },
            { prompt: 'Expand (x-2)(x+5).', answer: 'x^2 + 3x - 10', explanation: 'FOIL.' },
          ],
        },
        {
          name: 'Factoring with GCF',
          description: 'Factor out the greatest common factor.',
          questions: [
            { prompt: 'Factor 6x^2 + 9x.', answer: '3x(2x + 3)', explanation: 'GCF 3x.' },
            { prompt: 'Factor 4x^3 - 8x.', answer: '4x(x^2 - 2)', explanation: 'GCF 4x.' },
          ],
        },
        {
          name: 'Factoring trinomials',
          description: 'Factor x^2 + bx + c.',
          questions: [
            { prompt: 'Factor x^2 + 5x + 6.', answer: '(x+2)(x+3)', explanation: '2·3=6, 2+3=5.' },
            { prompt: 'Factor x^2 - 3x - 10.', answer: '(x-5)(x+2)', explanation: '-5·2=-10.' },
          ],
        },
        {
          name: 'Difference of squares',
          description: 'Factor a^2 - b^2.',
          questions: [
            { prompt: 'Factor x^2 - 25.', answer: '(x-5)(x+5)', explanation: 'DOS.' },
            { prompt: 'Factor 4x^2 - 9.', answer: '(2x-3)(2x+3)', explanation: 'DOS.' },
          ],
        },
      ],
    },
    {
      name: 'Quadratic functions & equations',
      description: 'Solve quadratic equations and analyze graphs of quadratic functions.',
      lessons: [
        {
          name: 'Solving by factoring',
          description: 'Use zero product property.',
          questions: [
            { prompt: 'Solve x^2 - 5x + 6 = 0.', answer: 'x = 2 or 3', explanation: 'Factor.' },
            { prompt: 'Solve x^2 - 9 = 0.', answer: 'x = ±3', explanation: 'DOS.' },
          ],
        },
        {
          name: 'Quadratic formula',
          description: 'Apply the quadratic formula.',
          questions: [
            { prompt: 'Solve x^2 + 2x - 3 = 0.', answer: 'x = 1 or -3', explanation: 'Factor or QF.' },
            { prompt: 'Discriminant of x^2 + x + 1?', answer: '-3', explanation: '1 - 4.' },
          ],
        },
        {
          name: 'Vertex form and graphs',
          description: 'Identify vertex of y = a(x-h)^2 + k.',
          questions: [
            { prompt: 'Vertex of y=(x-2)^2+3.', answer: '(2,3)', explanation: 'Inside opposite.' },
            { prompt: 'Axis of symmetry of y=x^2-4x.', answer: 'x = 2', explanation: '-b/2a.' },
          ],
        },
        {
          name: 'Completing the square',
          description: 'Rewrite quadratics in vertex form.',
          questions: [
            { prompt: 'Complete: x^2 + 6x.', answer: '(x+3)^2 - 9', explanation: 'Add/subtract 9.' },
            { prompt: 'Complete: x^2 - 4x + 1.', answer: '(x-2)^2 - 3', explanation: 'Add/subtract 4.' },
          ],
        },
      ],
    },
    {
      name: 'Irrational numbers',
      description: 'Recognize irrational numbers and operate with rational and irrational numbers.',
      lessons: [
        {
          name: 'Classifying numbers',
          description: 'Identify rational vs irrational numbers.',
          questions: [
            { prompt: 'Is sqrt(16) rational?', answer: 'Yes', explanation: 'Equals 4.' },
            { prompt: 'Is π rational?', answer: 'No', explanation: 'Non-repeating.' },
          ],
        },
        {
          name: 'Operations with radicals',
          description: 'Add, subtract, multiply, divide radicals.',
          questions: [
            { prompt: 'Simplify 2√3 + 5√3.', answer: '7√3', explanation: 'Combine like terms.' },
            { prompt: 'Simplify √2 · √8.', answer: '4', explanation: '√16.' },
          ],
        },
        {
          name: 'Rationalizing denominators',
          description: 'Rationalize √-denominator fractions.',
          questions: [
            { prompt: 'Rationalize 1/√2.', answer: '√2/2', explanation: 'Multiply by √2/√2.' },
            { prompt: 'Rationalize 3/√5.', answer: '3√5/5', explanation: 'Multiply by √5/√5.' },
          ],
        },
        {
          name: 'Sum/product of rationals and irrationals',
          description: 'Understand closure properties.',
          questions: [
            { prompt: 'Is rational + irrational rational?', answer: 'No', explanation: 'Always irrational.' },
            { prompt: 'Is rational·irrational irrational (non-zero)?', answer: 'Yes', explanation: 'Product irrational.' },
          ],
        },
      ],
    },
  ],
};
