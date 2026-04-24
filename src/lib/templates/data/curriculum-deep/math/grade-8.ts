import type { DeepGrade } from '../types';

export const GRADE_8: DeepGrade = {
  grade: '8',
  label: '8th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-eighth-grade-math',
  units: [
    {
      name: 'Numbers and operations',
      description: 'Work with rational and irrational numbers and integer exponents.',
      lessons: [
        {
          name: 'Rational vs irrational',
          description: 'Classify numbers as rational or irrational.',
          questions: [
            { prompt: 'Is sqrt(2) rational?', answer: 'No', explanation: 'Non-repeating decimal.' },
            { prompt: 'Is 0.3333... rational?', answer: 'Yes', explanation: 'Equals 1/3.' },
          ],
        },
        {
          name: 'Integer exponents',
          description: 'Apply laws of exponents with integer powers.',
          questions: [
            { prompt: 'Simplify 3^2 · 3^3.', answer: '3^5 = 243', explanation: 'Add exponents.' },
            { prompt: 'Simplify 2^-3.', answer: '1/8', explanation: 'Reciprocal of 2^3.' },
          ],
        },
        {
          name: 'Scientific notation',
          description: 'Write and operate on numbers in scientific notation.',
          questions: [
            { prompt: 'Write 45,000 in scientific notation.', answer: '4.5 × 10^4', explanation: 'Move decimal 4 left.' },
            { prompt: 'Compute (2×10^3)(3×10^4).', answer: '6 × 10^7', explanation: 'Multiply and add exponents.' },
          ],
        },
        {
          name: 'Square and cube roots',
          description: 'Evaluate square and cube roots of perfect powers.',
          questions: [
            { prompt: 'Evaluate sqrt(81).', answer: '9', explanation: '9^2 = 81.' },
            { prompt: 'Evaluate cube root of 27.', answer: '3', explanation: '3^3 = 27.' },
          ],
        },
      ],
    },
    {
      name: 'Solving equations with one unknown',
      description: 'Solve linear equations in one variable including those with variables on both sides.',
      lessons: [
        {
          name: 'Variables on both sides',
          description: 'Solve equations like ax + b = cx + d.',
          questions: [
            { prompt: 'Solve 5x - 3 = 2x + 12.', answer: 'x = 5', explanation: 'Subtract 2x, add 3, divide 3.' },
            { prompt: 'Solve 4x + 1 = 2x + 11.', answer: 'x = 5', explanation: '2x = 10.' },
          ],
        },
        {
          name: 'Equations with parentheses',
          description: 'Use the distributive property to solve equations.',
          questions: [
            { prompt: 'Solve 2(x+3) = 16.', answer: 'x = 5', explanation: 'Distribute and subtract.' },
            { prompt: 'Solve 3(x-1) = 2x+5.', answer: 'x = 8', explanation: '3x-3 = 2x+5.' },
          ],
        },
        {
          name: 'Number of solutions',
          description: 'Determine whether equations have one, no, or infinite solutions.',
          questions: [
            { prompt: '2x + 4 = 2x + 4. Solutions?', answer: 'Infinite', explanation: 'Identical.' },
            { prompt: '3x + 1 = 3x + 5. Solutions?', answer: 'None', explanation: 'Contradiction.' },
          ],
        },
        {
          name: 'Equations with fractions',
          description: 'Clear fractions and solve linear equations.',
          questions: [
            { prompt: 'Solve x/2 + 3 = 7.', answer: 'x = 8', explanation: 'Subtract 3 then multiply 2.' },
            { prompt: 'Solve (2x+1)/3 = 5.', answer: 'x = 7', explanation: '2x+1 = 15.' },
          ],
        },
      ],
    },
    {
      name: 'Linear equations and functions',
      description: 'Graph linear equations, interpret slope, and evaluate functions.',
      lessons: [
        {
          name: 'Slope',
          description: 'Compute slope between two points.',
          questions: [
            { prompt: 'Slope through (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1).' },
            { prompt: 'Slope through (0,4) and (2,0).', answer: '-2', explanation: '(0-4)/(2-0).' },
          ],
        },
        {
          name: 'Slope-intercept form',
          description: 'Write equations as y = mx + b.',
          questions: [
            { prompt: 'Line with slope 3, y-intercept 2?', answer: 'y = 3x + 2', explanation: 'Plug in m and b.' },
            { prompt: 'y = -x + 5. Slope and intercept?', answer: 'slope -1, int 5', explanation: 'Read coefficients.' },
          ],
        },
        {
          name: 'Function notation',
          description: 'Evaluate functions using f(x) notation.',
          questions: [
            { prompt: 'If f(x)=2x+3, find f(4).', answer: '11', explanation: '2·4+3.' },
            { prompt: 'If g(x)=x^2-1, find g(3).', answer: '8', explanation: '9 - 1.' },
          ],
        },
        {
          name: 'Linear vs nonlinear',
          description: 'Distinguish linear functions from nonlinear ones.',
          questions: [
            { prompt: 'Is y = 3x^2 linear?', answer: 'No', explanation: 'x is squared.' },
            { prompt: 'Is y = 4x + 1 linear?', answer: 'Yes', explanation: 'First-degree.' },
          ],
        },
      ],
    },
    {
      name: 'Systems of equations',
      description: 'Analyze and solve pairs of simultaneous linear equations algebraically and graphically.',
      lessons: [
        {
          name: 'Graphing systems',
          description: 'Solve systems by finding intersection of graphs.',
          questions: [
            { prompt: 'Solve y=x, y=2. Intersection?', answer: '(2,2)', explanation: 'x=2.' },
            { prompt: 'Solve y=x+1, y=3.', answer: '(2,3)', explanation: 'x=2.' },
          ],
        },
        {
          name: 'Substitution',
          description: 'Solve systems by substitution.',
          questions: [
            { prompt: 'Solve y=2x, x+y=9.', answer: '(3,6)', explanation: 'x+2x=9.' },
            { prompt: 'Solve y=x+1, 2x+y=7.', answer: '(2,3)', explanation: '3x+1=7.' },
          ],
        },
        {
          name: 'Elimination',
          description: 'Solve systems by elimination.',
          questions: [
            { prompt: 'Solve x+y=10, x-y=4.', answer: '(7,3)', explanation: 'Add: 2x=14.' },
            { prompt: 'Solve 2x+y=7, x-y=2.', answer: '(3,1)', explanation: 'Add: 3x=9.' },
          ],
        },
        {
          name: 'No and infinite solutions',
          description: 'Identify systems with no solutions or infinite solutions.',
          questions: [
            { prompt: 'y=2x+1, y=2x+4. Solutions?', answer: 'None', explanation: 'Parallel.' },
            { prompt: 'y=x+2, 2y=2x+4. Solutions?', answer: 'Infinite', explanation: 'Same line.' },
          ],
        },
      ],
    },
    {
      name: 'Geometry',
      description: 'Apply the Pythagorean theorem and find volumes of cones, cylinders, and spheres.',
      lessons: [
        {
          name: 'Pythagorean theorem',
          description: 'Use a^2 + b^2 = c^2 to find missing sides.',
          questions: [
            { prompt: 'Legs 3 and 4. Hypotenuse?', answer: '5', explanation: '9+16=25.' },
            { prompt: 'Legs 5 and 12. Hypotenuse?', answer: '13', explanation: '25+144=169.' },
          ],
        },
        {
          name: 'Distance between points',
          description: 'Apply the distance formula in the coordinate plane.',
          questions: [
            { prompt: 'Distance from (0,0) to (3,4).', answer: '5', explanation: 'Pyth theorem.' },
            { prompt: 'Distance from (1,2) to (4,6).', answer: '5', explanation: '3,4,5 triple.' },
          ],
        },
        {
          name: 'Volume of cylinders',
          description: 'Apply V = πr^2 h.',
          questions: [
            { prompt: 'Cylinder r=3, h=10 (π=3.14).', answer: '282.6', explanation: '3.14·9·10.' },
            { prompt: 'Cylinder r=2, h=5 (π=3.14).', answer: '62.8', explanation: '3.14·4·5.' },
          ],
        },
        {
          name: 'Volume of cones and spheres',
          description: 'Apply V = 1/3 π r^2 h and V = 4/3 π r^3.',
          questions: [
            { prompt: 'Cone r=3, h=6 (π=3.14).', answer: '56.52', explanation: '1/3·π·9·6.' },
            { prompt: 'Sphere r=3 (π=3.14).', answer: '113.04', explanation: '4/3·π·27.' },
          ],
        },
      ],
    },
    {
      name: 'Geometric transformations',
      description: 'Understand congruence and similarity through rotations, reflections, translations, and dilations.',
      lessons: [
        {
          name: 'Translations',
          description: 'Translate figures using vectors.',
          questions: [
            { prompt: 'Translate (2,3) by (5,-1).', answer: '(7,2)', explanation: 'Add components.' },
            { prompt: 'Translate (-1,4) by (3,2).', answer: '(2,6)', explanation: 'Add components.' },
          ],
        },
        {
          name: 'Reflections',
          description: 'Reflect figures across the axes.',
          questions: [
            { prompt: 'Reflect (3,5) across x-axis.', answer: '(3,-5)', explanation: 'Negate y.' },
            { prompt: 'Reflect (-2,4) across y-axis.', answer: '(2,4)', explanation: 'Negate x.' },
          ],
        },
        {
          name: 'Rotations',
          description: 'Rotate figures about the origin by 90°, 180°, 270°.',
          questions: [
            { prompt: 'Rotate (2,3) 180° about origin.', answer: '(-2,-3)', explanation: 'Negate both.' },
            { prompt: 'Rotate (1,0) 90° CCW.', answer: '(0,1)', explanation: '(x,y)→(-y,x).' },
          ],
        },
        {
          name: 'Dilations and similarity',
          description: 'Scale figures using a center and scale factor.',
          questions: [
            { prompt: 'Dilate (2,4) by factor 3 from origin.', answer: '(6,12)', explanation: 'Multiply by 3.' },
            { prompt: 'Scale factor from (1,2) to (3,6)?', answer: '3', explanation: 'Coordinates tripled.' },
          ],
        },
      ],
    },
    {
      name: 'Data and modeling',
      description: 'Investigate bivariate data patterns and interpret scatter plots and two-way tables.',
      lessons: [
        {
          name: 'Scatter plots',
          description: 'Interpret association in scatter plots.',
          questions: [
            { prompt: 'As x increases, y decreases. Association?', answer: 'Negative', explanation: 'Inverse trend.' },
            { prompt: 'Random cloud of points. Association?', answer: 'None', explanation: 'No pattern.' },
          ],
        },
        {
          name: 'Line of best fit',
          description: 'Estimate and use a line of best fit.',
          questions: [
            { prompt: 'Line y=2x+1. Predict y when x=5.', answer: '11', explanation: '2·5+1.' },
            { prompt: 'Slope of best-fit line describes...?', answer: 'rate of change', explanation: 'Change per unit x.' },
          ],
        },
        {
          name: 'Two-way tables',
          description: 'Read joint and marginal frequencies.',
          questions: [
            { prompt: 'Total row 20, column 15, overlap 10. Joint freq?', answer: '10', explanation: 'Cell value.' },
            { prompt: 'Relative frequency of 5 out of 25?', answer: '0.20', explanation: '5/25.' },
          ],
        },
        {
          name: 'Bivariate categorical data',
          description: 'Analyze patterns of association between categorical variables.',
          questions: [
            { prompt: 'Row percent = row entry divided by...?', answer: 'row total', explanation: 'Conditional on row.' },
            { prompt: 'Strongest association: 10% vs 90% or 45% vs 55%?', answer: '10% vs 90%', explanation: 'Bigger gap.' },
          ],
        },
      ],
    },
  ],
};
