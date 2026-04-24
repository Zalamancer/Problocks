import type { DeepGrade } from '../types';

export const GRADE_7: DeepGrade = {
  grade: '7',
  label: '7th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-seventh-grade-math',
  units: [
    {
      name: 'Negative numbers: addition and subtraction',
      description: 'Add and subtract rational numbers using properties of operations.',
      lessons: [
        {
          name: 'Adding integers',
          description: 'Add positive and negative integers using the number line.',
          questions: [
            { prompt: 'Compute -3 + 8.', answer: '5', explanation: 'Distance from -3 to 5 is +8.' },
            { prompt: 'Compute -6 + (-4).', answer: '-10', explanation: 'Same sign adds magnitudes.' },
          ],
        },
        {
          name: 'Subtracting integers',
          description: 'Subtract integers by adding the opposite.',
          questions: [
            { prompt: 'Compute 5 - 9.', answer: '-4', explanation: 'Add -9.' },
            { prompt: 'Compute -2 - (-7).', answer: '5', explanation: 'Add 7 to -2.' },
          ],
        },
        {
          name: 'Adding and subtracting rationals',
          description: 'Add and subtract fractions and decimals with signs.',
          questions: [
            { prompt: 'Compute -1/2 + 3/4.', answer: '1/4', explanation: 'Common denominator 4.' },
            { prompt: 'Compute 2.5 - 4.8.', answer: '-2.3', explanation: 'Negative difference.' },
          ],
        },
        {
          name: 'Absolute value expressions',
          description: 'Evaluate expressions involving absolute value.',
          questions: [
            { prompt: 'Compute |-4| + |3|.', answer: '7', explanation: '4 + 3.' },
            { prompt: 'Compute |5 - 9|.', answer: '4', explanation: '|-4| = 4.' },
          ],
        },
      ],
    },
    {
      name: 'Negative numbers: multiplication and division',
      description: 'Multiply and divide rational numbers and apply properties to signed numbers.',
      lessons: [
        {
          name: 'Multiplying signed numbers',
          description: 'Apply sign rules when multiplying integers and rationals.',
          questions: [
            { prompt: 'Compute -7 · 4.', answer: '-28', explanation: 'Opposite signs give negative.' },
            { prompt: 'Compute -3 · -5.', answer: '15', explanation: 'Same signs give positive.' },
          ],
        },
        {
          name: 'Dividing signed numbers',
          description: 'Apply sign rules when dividing rationals.',
          questions: [
            { prompt: 'Compute -36 / 6.', answer: '-6', explanation: 'Opposite signs negative.' },
            { prompt: 'Compute -45 / -9.', answer: '5', explanation: 'Same signs positive.' },
          ],
        },
        {
          name: 'Order of operations with rationals',
          description: 'Use PEMDAS to simplify expressions with signed numbers.',
          questions: [
            { prompt: 'Compute 3 + (-2)·4.', answer: '-5', explanation: '3 + (-8).' },
            { prompt: 'Compute (-6)/2 + 5.', answer: '2', explanation: '-3 + 5.' },
          ],
        },
        {
          name: 'Converting fractions to decimals',
          description: 'Convert rational numbers to terminating or repeating decimals.',
          questions: [
            { prompt: 'Write 3/8 as a decimal.', answer: '0.375', explanation: 'Divide 3 by 8.' },
            { prompt: 'Write 1/3 as a decimal.', answer: '0.333...', explanation: 'Repeating.' },
          ],
        },
      ],
    },
    {
      name: 'Fractions, decimals, & percentages',
      description: 'Convert between fractions, decimals, and percents and solve percent problems.',
      lessons: [
        {
          name: 'Percent of a number',
          description: 'Find the percent of a quantity using proportions or decimals.',
          questions: [
            { prompt: 'What is 30% of 200?', answer: '60', explanation: '0.3 · 200.' },
            { prompt: 'What is 12% of 50?', answer: '6', explanation: '0.12 · 50.' },
          ],
        },
        {
          name: 'Percent increase and decrease',
          description: 'Compute and interpret percent change.',
          questions: [
            { prompt: '$80 increased by 25%. New price?', answer: '$100', explanation: '80 + 20.' },
            { prompt: '$50 decreased by 10%.', answer: '$45', explanation: '50 - 5.' },
          ],
        },
        {
          name: 'Simple interest',
          description: 'Use I = Prt to compute simple interest.',
          questions: [
            { prompt: '$500 at 4% for 2 years. Interest?', answer: '$40', explanation: '500·0.04·2.' },
            { prompt: '$1000 at 5% for 3 years.', answer: '$150', explanation: '1000·0.05·3.' },
          ],
        },
        {
          name: 'Markup, discount, tax',
          description: 'Solve problems involving markup, discount, and sales tax.',
          questions: [
            { prompt: 'Shirt $20 with 15% markup. Final price?', answer: '$23', explanation: '20 + 3.' },
            { prompt: '$60 with 8% sales tax.', answer: '$64.80', explanation: '60 + 4.80.' },
          ],
        },
      ],
    },
    {
      name: 'Rates & proportional relationships',
      description: 'Recognize and represent proportional relationships between quantities.',
      lessons: [
        {
          name: 'Unit rates with fractions',
          description: 'Compute unit rates including ratios of fractions.',
          questions: [
            { prompt: '3/4 cup flour for 1/2 loaf. Cups per loaf?', answer: '3/2', explanation: 'Divide 3/4 by 1/2.' },
            { prompt: '20 miles in 1/2 hour. Speed?', answer: '40 mph', explanation: '20 ÷ 0.5.' },
          ],
        },
        {
          name: 'Constant of proportionality',
          description: 'Identify k in y = kx.',
          questions: [
            { prompt: 'y = 5x. Find k.', answer: '5', explanation: 'Coefficient of x.' },
            { prompt: 'If y = 12 when x = 3, find k.', answer: '4', explanation: '12/3.' },
          ],
        },
        {
          name: 'Graphs of proportional relationships',
          description: 'Recognize proportional graphs as lines through the origin.',
          questions: [
            { prompt: 'Does y = 2x + 1 pass through origin?', answer: 'No', explanation: 'Y-intercept is 1.' },
            { prompt: 'Slope of proportional line y = 7x?', answer: '7', explanation: 'k is slope.' },
          ],
        },
        {
          name: 'Proportional equations from tables',
          description: 'Write y = kx from a table of values.',
          questions: [
            { prompt: 'Table: (1,3), (2,6), (3,9). Equation?', answer: 'y = 3x', explanation: 'k = 3.' },
            { prompt: 'Table: (2,10),(4,20). Equation?', answer: 'y = 5x', explanation: '10/2 = 5.' },
          ],
        },
      ],
    },
    {
      name: 'Expressions, equations, & inequalities',
      description: 'Use properties to rewrite expressions and solve multi-step equations and inequalities.',
      lessons: [
        {
          name: 'Distributing and combining',
          description: 'Apply distributive property and combine like terms.',
          questions: [
            { prompt: 'Simplify 3(x+4) + 2x.', answer: '5x + 12', explanation: '3x+12+2x.' },
            { prompt: 'Simplify 2(3a - 1) + 4.', answer: '6a + 2', explanation: '6a - 2 + 4.' },
          ],
        },
        {
          name: 'Two-step equations',
          description: 'Solve ax + b = c.',
          questions: [
            { prompt: 'Solve 2x + 5 = 13.', answer: 'x = 4', explanation: 'Subtract 5, divide 2.' },
            { prompt: 'Solve 3x - 7 = 8.', answer: 'x = 5', explanation: 'Add 7, divide 3.' },
          ],
        },
        {
          name: 'Multi-step equations',
          description: 'Solve equations that require distribution and combining.',
          questions: [
            { prompt: 'Solve 2(x+3) = 14.', answer: 'x = 4', explanation: 'Distribute then subtract.' },
            { prompt: 'Solve 3(x-1) + 2 = 11.', answer: 'x = 4', explanation: '3x - 1 = 11.' },
          ],
        },
        {
          name: 'Two-step inequalities',
          description: 'Solve and graph inequalities of form ax + b < c.',
          questions: [
            { prompt: 'Solve 2x + 1 > 9.', answer: 'x > 4', explanation: 'Subtract 1, divide 2.' },
            { prompt: 'Solve 3x - 5 ≤ 7.', answer: 'x ≤ 4', explanation: 'Add 5, divide 3.' },
          ],
        },
      ],
    },
    {
      name: 'Geometry',
      description: 'Work with scale drawings, angle relationships, area, and volume of solids.',
      lessons: [
        {
          name: 'Scale drawings',
          description: 'Use scale factors to compute actual dimensions.',
          questions: [
            { prompt: 'Scale 1:100. Drawing 5cm, actual?', answer: '500 cm', explanation: 'Multiply by 100.' },
            { prompt: 'Scale 1 in : 2 ft. Drawing 3 in, actual?', answer: '6 ft', explanation: '3·2.' },
          ],
        },
        {
          name: 'Angle relationships',
          description: 'Use facts about supplementary, complementary, vertical, and adjacent angles.',
          questions: [
            { prompt: 'Complement of 35°?', answer: '55°', explanation: '90 - 35.' },
            { prompt: 'Supplement of 110°?', answer: '70°', explanation: '180 - 110.' },
          ],
        },
        {
          name: 'Circumference and area of circles',
          description: 'Apply C = 2πr and A = πr^2.',
          questions: [
            { prompt: 'Circumference with r = 7 (use π≈22/7).', answer: '44', explanation: '2·22/7·7.' },
            { prompt: 'Area with r = 5 (use π≈3.14).', answer: '78.5', explanation: 'π · 25.' },
          ],
        },
        {
          name: 'Volume and surface area of prisms',
          description: 'Find volume and surface area of prisms and cylinders.',
          questions: [
            { prompt: 'Prism V with base area 12 and height 5.', answer: '60', explanation: 'V = B·h.' },
            { prompt: 'Cylinder V with r=3, h=10 (π=3.14).', answer: '282.6', explanation: 'π·9·10.' },
          ],
        },
      ],
    },
    {
      name: 'Statistics and probability',
      description: 'Use random sampling to draw inferences and compute probabilities of simple and compound events.',
      lessons: [
        {
          name: 'Random sampling',
          description: 'Distinguish random from biased samples.',
          questions: [
            { prompt: 'Is surveying only your friends random?', answer: 'No', explanation: 'Biased sample.' },
            { prompt: 'A survey picks names from a hat. Random?', answer: 'Yes', explanation: 'Each person equally likely.' },
          ],
        },
        {
          name: 'Comparing populations',
          description: 'Compare two data sets using means and MAD.',
          questions: [
            { prompt: 'Which has greater spread: MAD=2 or MAD=5?', answer: 'MAD=5', explanation: 'Larger MAD = more spread.' },
            { prompt: 'If means differ by 3 and MAD=1, meaningful?', answer: 'Yes', explanation: 'Mean gap exceeds MAD.' },
          ],
        },
        {
          name: 'Simple probability',
          description: 'Compute probability of single events.',
          questions: [
            { prompt: 'P(rolling a 4 on fair die)?', answer: '1/6', explanation: 'One outcome of six.' },
            { prompt: 'P(heads) for a fair coin?', answer: '1/2', explanation: 'Two equally likely outcomes.' },
          ],
        },
        {
          name: 'Compound probability',
          description: 'Compute probabilities of compound events using multiplication.',
          questions: [
            { prompt: 'P(two heads in a row)?', answer: '1/4', explanation: '1/2 · 1/2.' },
            { prompt: 'P(rolling two 6s)?', answer: '1/36', explanation: '1/6 · 1/6.' },
          ],
        },
      ],
    },
  ],
};
