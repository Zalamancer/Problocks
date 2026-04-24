import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '5',
  label: '5th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-fifth-grade-math',
  units: [
    {
      name: 'Decimal place value',
      description: 'Read, write, and compare decimals to thousandths using place value.',
      lessons: [
        {
          name: 'Place value to thousandths',
          description: 'Name decimal places: tenths, hundredths, thousandths.',
          questions: [
            { prompt: 'In 0.572, what place is the 7 in?', answer: 'hundredths', explanation: 'Second place after decimal.' },
            { prompt: 'What does the 3 represent in 0.003?', answer: 'thousandths', explanation: 'Third place after decimal.' },
          ],
        },
        {
          name: 'Reading and writing decimals',
          description: 'Convert between standard and word forms.',
          questions: [
            { prompt: 'Write 0.045 in words.', answer: 'Forty-five thousandths', explanation: '45/1000 = forty-five thousandths.' },
            { prompt: 'Write "three and two tenths" as a decimal.', answer: '3.2', explanation: '3.2 = 3 + 2/10.' },
          ],
        },
        {
          name: 'Comparing decimals',
          description: 'Compare by place value.',
          questions: [
            { prompt: 'Which is greater: 0.45 or 0.405?', answer: '0.45', explanation: '0.450 > 0.405.' },
            { prompt: 'Which is less: 2.36 or 2.306?', answer: '2.306', explanation: '0.306 < 0.360.' },
          ],
        },
        {
          name: 'Rounding decimals',
          description: 'Round to nearest tenth or hundredth.',
          questions: [
            { prompt: 'Round 3.456 to the nearest tenth.', answer: '3.5', explanation: '5 rounds up.' },
            { prompt: 'Round 0.628 to the nearest hundredth.', answer: '0.63', explanation: '8 rounds up.' },
          ],
        },
      ],
    },
    {
      name: 'Add decimals',
      description: 'Add decimals to hundredths using place-value strategies and the standard algorithm.',
      lessons: [
        {
          name: 'Adding tenths',
          description: 'Add decimals to the tenths place.',
          questions: [
            { prompt: '0.7 + 0.5 = ?', answer: '1.2', explanation: '7+5=12, so 1.2.' },
            { prompt: '2.4 + 3.6 = ?', answer: '6.0', explanation: '2.4 + 3.6 = 6.0.' },
          ],
        },
        {
          name: 'Adding hundredths',
          description: 'Add decimals to the hundredths place.',
          questions: [
            { prompt: '0.45 + 0.38 = ?', answer: '0.83', explanation: '45 + 38 = 83.' },
            { prompt: '1.25 + 2.57 = ?', answer: '3.82', explanation: '1.25 + 2.57 = 3.82.' },
          ],
        },
        {
          name: 'Adding mixed decimals',
          description: 'Line up decimal points when adding.',
          questions: [
            { prompt: '4.5 + 2.35 = ?', answer: '6.85', explanation: 'Align decimals: 4.50 + 2.35.' },
            { prompt: '3.2 + 0.78 = ?', answer: '3.98', explanation: '3.20 + 0.78 = 3.98.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Add decimals in real-world contexts.',
          questions: [
            { prompt: 'Ran 2.3 km and 1.85 km. Total?', answer: '4.15 km', explanation: '2.30 + 1.85 = 4.15.' },
            { prompt: 'Milk $3.45 + bread $2.25. Total?', answer: '$5.70', explanation: '3.45 + 2.25 = 5.70.' },
          ],
        },
      ],
    },
    {
      name: 'Subtract decimals',
      description: 'Subtract decimals to hundredths fluently.',
      lessons: [
        {
          name: 'Subtracting tenths',
          description: 'Subtract decimals to the tenths place.',
          questions: [
            { prompt: '4.7 - 2.3 = ?', answer: '2.4', explanation: '4.7 - 2.3 = 2.4.' },
            { prompt: '8.0 - 3.5 = ?', answer: '4.5', explanation: '8.0 - 3.5 = 4.5.' },
          ],
        },
        {
          name: 'Subtracting hundredths',
          description: 'Subtract decimals to the hundredths place.',
          questions: [
            { prompt: '5.25 - 1.75 = ?', answer: '3.50', explanation: '5.25 - 1.75 = 3.50.' },
            { prompt: '9.80 - 4.65 = ?', answer: '5.15', explanation: '9.80 - 4.65 = 5.15.' },
          ],
        },
        {
          name: 'Subtracting mixed decimals',
          description: 'Subtract decimals with different place values.',
          questions: [
            { prompt: '7.4 - 2.75 = ?', answer: '4.65', explanation: '7.40 - 2.75 = 4.65.' },
            { prompt: '10.5 - 3.85 = ?', answer: '6.65', explanation: '10.50 - 3.85 = 6.65.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Subtract decimals in real-world contexts.',
          questions: [
            { prompt: 'Had $15.50, spent $9.25. Left?', answer: '$6.25', explanation: '15.50 - 9.25 = 6.25.' },
            { prompt: 'Track record 12.4 s, new 11.85 s. Difference?', answer: '0.55 s', explanation: '12.40 - 11.85 = 0.55.' },
          ],
        },
      ],
    },
    {
      name: 'Add and subtract fractions',
      description: 'Add and subtract fractions with unlike denominators, including mixed numbers.',
      lessons: [
        {
          name: 'Common denominators',
          description: 'Find common denominators before adding.',
          questions: [
            { prompt: '1/2 + 1/3 = ?', answer: '5/6', explanation: '3/6 + 2/6 = 5/6.' },
            { prompt: '2/5 + 1/2 = ?', answer: '9/10', explanation: '4/10 + 5/10 = 9/10.' },
          ],
        },
        {
          name: 'Subtracting unlike denominators',
          description: 'Subtract fractions with different denominators.',
          questions: [
            { prompt: '3/4 - 1/2 = ?', answer: '1/4', explanation: '3/4 - 2/4 = 1/4.' },
            { prompt: '5/6 - 1/3 = ?', answer: '1/2', explanation: '5/6 - 2/6 = 3/6 = 1/2.' },
          ],
        },
        {
          name: 'Adding mixed numbers',
          description: 'Add mixed numbers with unlike denominators.',
          questions: [
            { prompt: '1 1/2 + 2 1/4 = ?', answer: '3 3/4', explanation: 'Whole: 3; fraction: 2/4 + 1/4 = 3/4.' },
            { prompt: '2 1/3 + 1 1/6 = ?', answer: '3 1/2', explanation: '2/6 + 1/6 = 3/6 = 1/2.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply fraction operations to stories.',
          questions: [
            { prompt: 'Drank 1/3 L, then 1/4 L. Total?', answer: '7/12 L', explanation: '4/12 + 3/12 = 7/12.' },
            { prompt: 'Had 3/4 cup flour; used 1/2. Left?', answer: '1/4 cup', explanation: '3/4 - 2/4 = 1/4.' },
          ],
        },
      ],
    },
    {
      name: 'Multi-digit multiplication and division',
      description: 'Multiply multi-digit whole numbers and divide with up to four-digit dividends.',
      lessons: [
        {
          name: 'Multi-digit multiplication',
          description: 'Use the standard algorithm for large products.',
          questions: [
            { prompt: '234 x 45 = ?', answer: '10,530', explanation: '234 x 45 = 10,530.' },
            { prompt: '125 x 36 = ?', answer: '4,500', explanation: '125 x 36 = 4,500.' },
          ],
        },
        {
          name: 'Long division',
          description: 'Divide with two-digit divisors.',
          questions: [
            { prompt: '432 ÷ 12 = ?', answer: '36', explanation: '12 x 36 = 432.' },
            { prompt: '875 ÷ 25 = ?', answer: '35', explanation: '25 x 35 = 875.' },
          ],
        },
        {
          name: 'Division with remainders',
          description: 'Handle remainders in multi-digit division.',
          questions: [
            { prompt: '153 ÷ 12 = ? remainder ?', answer: '12 remainder 9', explanation: '12 x 12 = 144, 153-144=9.' },
            { prompt: '203 ÷ 15 = ? remainder ?', answer: '13 remainder 8', explanation: '15 x 13 = 195, 203-195=8.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve real-world multiplication and division stories.',
          questions: [
            { prompt: '24 buses, 45 students each. Total?', answer: '1,080', explanation: '24 x 45 = 1,080.' },
            { prompt: '960 candies divided into bags of 15. Bags?', answer: '64', explanation: '960 ÷ 15 = 64.' },
          ],
        },
      ],
    },
    {
      name: 'Multiply fractions',
      description: 'Multiply fractions and mixed numbers and interpret results as scaling.',
      lessons: [
        {
          name: 'Fraction x fraction',
          description: 'Multiply numerators and denominators.',
          questions: [
            { prompt: '1/2 x 1/3 = ?', answer: '1/6', explanation: '1x1 over 2x3.' },
            { prompt: '2/3 x 3/4 = ?', answer: '6/12 (or 1/2)', explanation: '6/12 simplifies to 1/2.' },
          ],
        },
        {
          name: 'Whole x fraction',
          description: 'Multiply whole numbers by fractions.',
          questions: [
            { prompt: '4 x 2/5 = ?', answer: '8/5', explanation: '(4 x 2)/5 = 8/5.' },
            { prompt: '6 x 1/3 = ?', answer: '2', explanation: '6/3 = 2.' },
          ],
        },
        {
          name: 'Mixed number multiplication',
          description: 'Multiply mixed numbers by converting to improper fractions.',
          questions: [
            { prompt: '1 1/2 x 2 = ?', answer: '3', explanation: '3/2 x 2 = 3.' },
            { prompt: '2 1/3 x 3 = ?', answer: '7', explanation: '7/3 x 3 = 7.' },
          ],
        },
        {
          name: 'Scaling and word problems',
          description: 'Recognize multiplication by fractions as scaling.',
          questions: [
            { prompt: '3/4 of 20 = ?', answer: '15', explanation: '20 x 3/4 = 60/4 = 15.' },
            { prompt: 'Is 4 x 1/2 more or less than 4?', answer: 'less', explanation: 'Multiplying by <1 makes smaller.' },
          ],
        },
      ],
    },
    {
      name: 'Divide fractions',
      description: 'Divide whole numbers by unit fractions and unit fractions by whole numbers.',
      lessons: [
        {
          name: 'Whole ÷ unit fraction',
          description: 'Divide whole numbers by 1/n.',
          questions: [
            { prompt: '4 ÷ 1/2 = ?', answer: '8', explanation: 'Number of halves in 4.' },
            { prompt: '3 ÷ 1/4 = ?', answer: '12', explanation: '3 has 12 quarters.' },
          ],
        },
        {
          name: 'Unit fraction ÷ whole',
          description: 'Divide 1/n by whole numbers.',
          questions: [
            { prompt: '1/3 ÷ 2 = ?', answer: '1/6', explanation: 'Half of 1/3 is 1/6.' },
            { prompt: '1/4 ÷ 2 = ?', answer: '1/8', explanation: 'Half of 1/4 is 1/8.' },
          ],
        },
        {
          name: 'Visual models',
          description: 'Use diagrams to show fraction division.',
          questions: [
            { prompt: 'How many 1/3 parts in 2?', answer: '6', explanation: '2 ÷ 1/3 = 6.' },
            { prompt: '1/2 split into 3 = ?', answer: '1/6', explanation: 'Each part is 1/6.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply fraction division to real situations.',
          questions: [
            { prompt: '5 cups split into 1/4 cup servings. How many servings?', answer: '20', explanation: '5 ÷ 1/4 = 20.' },
            { prompt: '1/2 pizza shared by 3 kids. Each gets?', answer: '1/6', explanation: '1/2 ÷ 3 = 1/6.' },
          ],
        },
      ],
    },
    {
      name: 'Multiply decimals',
      description: 'Multiply decimals to hundredths using place-value reasoning.',
      lessons: [
        {
          name: 'Decimal x whole number',
          description: 'Multiply decimals by whole numbers.',
          questions: [
            { prompt: '0.5 x 4 = ?', answer: '2.0', explanation: '0.5 x 4 = 2.' },
            { prompt: '0.25 x 6 = ?', answer: '1.5', explanation: '6/4 = 1.5.' },
          ],
        },
        {
          name: 'Decimal x decimal',
          description: 'Multiply two decimals using place value.',
          questions: [
            { prompt: '0.3 x 0.4 = ?', answer: '0.12', explanation: '3 x 4 = 12, shift 2 places.' },
            { prompt: '0.5 x 0.8 = ?', answer: '0.40', explanation: '5 x 8 = 40, shift 2.' },
          ],
        },
        {
          name: 'Multiplying by 10, 100, 1000',
          description: 'Shift the decimal point.',
          questions: [
            { prompt: '0.34 x 100 = ?', answer: '34', explanation: 'Shift decimal 2 right.' },
            { prompt: '2.5 x 10 = ?', answer: '25', explanation: 'Shift decimal 1 right.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve decimal multiplication stories.',
          questions: [
            { prompt: 'Gas $3.20/gallon, buy 4 gallons. Cost?', answer: '$12.80', explanation: '3.20 x 4 = 12.80.' },
            { prompt: '6.5 x 2.5 = ?', answer: '16.25', explanation: '6.5 x 2.5 = 16.25.' },
          ],
        },
      ],
    },
    {
      name: 'Divide decimals',
      description: 'Divide decimals to hundredths using concrete models and place value.',
      lessons: [
        {
          name: 'Decimal ÷ whole number',
          description: 'Divide a decimal by a whole number.',
          questions: [
            { prompt: '1.5 ÷ 3 = ?', answer: '0.5', explanation: '1.5 ÷ 3 = 0.5.' },
            { prompt: '2.4 ÷ 4 = ?', answer: '0.6', explanation: '2.4 ÷ 4 = 0.6.' },
          ],
        },
        {
          name: 'Whole ÷ decimal',
          description: 'Divide a whole number by a decimal.',
          questions: [
            { prompt: '6 ÷ 0.5 = ?', answer: '12', explanation: '6 / 0.5 = 12.' },
            { prompt: '10 ÷ 0.25 = ?', answer: '40', explanation: '10 / 0.25 = 40.' },
          ],
        },
        {
          name: 'Decimal ÷ decimal',
          description: 'Divide using shifted decimal points.',
          questions: [
            { prompt: '0.6 ÷ 0.2 = ?', answer: '3', explanation: 'Shift both: 6 ÷ 2 = 3.' },
            { prompt: '1.2 ÷ 0.4 = ?', answer: '3', explanation: '12 ÷ 4 = 3.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve decimal division stories.',
          questions: [
            { prompt: '$12.50 split among 5 friends equally. Each?', answer: '$2.50', explanation: '12.50 ÷ 5 = 2.50.' },
            { prompt: 'Ribbon 3.6 m cut into 0.4 m pieces. How many pieces?', answer: '9', explanation: '3.6 ÷ 0.4 = 9.' },
          ],
        },
      ],
    },
    {
      name: 'Powers of ten',
      description: 'Explain patterns when multiplying or dividing by powers of 10 and use exponents.',
      lessons: [
        {
          name: 'Exponent basics',
          description: 'Write powers of ten in exponent form.',
          questions: [
            { prompt: '10^3 = ?', answer: '1,000', explanation: '10 x 10 x 10 = 1,000.' },
            { prompt: '10^4 = ?', answer: '10,000', explanation: 'Four 10s multiplied.' },
          ],
        },
        {
          name: 'Multiplying by powers of 10',
          description: 'Shift decimal point right.',
          questions: [
            { prompt: '3.5 x 100 = ?', answer: '350', explanation: 'Shift decimal 2 places right.' },
            { prompt: '0.42 x 1000 = ?', answer: '420', explanation: 'Shift 3 places right.' },
          ],
        },
        {
          name: 'Dividing by powers of 10',
          description: 'Shift decimal point left.',
          questions: [
            { prompt: '250 ÷ 100 = ?', answer: '2.5', explanation: 'Shift 2 left.' },
            { prompt: '7,500 ÷ 1000 = ?', answer: '7.5', explanation: 'Shift 3 left.' },
          ],
        },
        {
          name: 'Patterns',
          description: 'Recognize zero patterns in powers of 10.',
          questions: [
            { prompt: '10^2 x 10^3 = ?', answer: '100,000', explanation: '10^(2+3) = 10^5.' },
            { prompt: 'What power of 10 equals 1,000,000?', answer: '10^6', explanation: 'Six zeros = 10^6.' },
          ],
        },
      ],
    },
    {
      name: 'Volume',
      description: 'Measure volume of right rectangular prisms using unit cubes and formulas.',
      lessons: [
        {
          name: 'Counting unit cubes',
          description: 'Find volume by counting cubes.',
          questions: [
            { prompt: 'A 2x3x4 box holds how many unit cubes?', answer: '24', explanation: '2 x 3 x 4 = 24.' },
            { prompt: 'A 3x3x3 cube holds?', answer: '27', explanation: '3 x 3 x 3 = 27.' },
          ],
        },
        {
          name: 'Volume formula',
          description: 'Use V = length x width x height.',
          questions: [
            { prompt: 'Volume of 5 x 4 x 3 prism?', answer: '60', explanation: '5 x 4 x 3 = 60.' },
            { prompt: 'Volume of 10 x 2 x 5?', answer: '100', explanation: '10 x 2 x 5 = 100.' },
          ],
        },
        {
          name: 'Volume with base area',
          description: 'Use V = base area x height.',
          questions: [
            { prompt: 'Base area 12, height 5. Volume?', answer: '60', explanation: '12 x 5 = 60.' },
            { prompt: 'Base area 20, height 8. Volume?', answer: '160', explanation: '20 x 8 = 160.' },
          ],
        },
        {
          name: 'Composite volumes',
          description: 'Add volumes of two boxes together.',
          questions: [
            { prompt: 'Two boxes: 2x3x4 and 1x2x5. Total volume?', answer: '34', explanation: '24 + 10 = 34.' },
            { prompt: 'Boxes 3x3x3 and 2x2x2. Total?', answer: '35', explanation: '27 + 8 = 35.' },
          ],
        },
      ],
    },
    {
      name: 'Coordinate plane',
      description: 'Graph points in the first quadrant to represent real-world situations.',
      lessons: [
        {
          name: 'Reading coordinates',
          description: 'Name points using ordered pairs (x, y).',
          questions: [
            { prompt: 'What is the origin?', answer: '(0, 0)', explanation: 'The origin is where axes meet.' },
            { prompt: 'Point (3, 4): 3 is which direction?', answer: 'right (x)', explanation: 'x comes first, goes right.' },
          ],
        },
        {
          name: 'Plotting points',
          description: 'Draw points at given coordinates.',
          questions: [
            { prompt: 'Where is (5, 0)?', answer: 'on the x-axis, 5 right', explanation: 'y=0 means on x-axis.' },
            { prompt: 'Where is (0, 3)?', answer: 'on the y-axis, 3 up', explanation: 'x=0 means on y-axis.' },
          ],
        },
        {
          name: 'Real-world coordinates',
          description: 'Plot real situations on a grid.',
          questions: [
            { prompt: 'Time (x) = 2, distance (y) = 10. Point?', answer: '(2, 10)', explanation: 'Time comes first.' },
            { prompt: 'If at hour 3 you are at mile 15, point?', answer: '(3, 15)', explanation: 'x=3, y=15.' },
          ],
        },
        {
          name: 'Patterns and ordered pairs',
          description: 'Create pairs of numbers from two patterns.',
          questions: [
            { prompt: 'Rule: y = 2x. If x=3, y=?', answer: '6', explanation: '2 x 3 = 6.' },
            { prompt: 'y = x + 5. If x=4, y=?', answer: '9', explanation: '4 + 5 = 9.' },
          ],
        },
      ],
    },
    {
      name: 'Algebraic thinking',
      description: 'Write and interpret simple numerical expressions with parentheses and brackets.',
      lessons: [
        {
          name: 'Order of operations',
          description: 'Use PEMDAS rules.',
          questions: [
            { prompt: '2 + 3 x 4 = ?', answer: '14', explanation: 'Multiply first: 12; then 2+12=14.' },
            { prompt: '(2 + 3) x 4 = ?', answer: '20', explanation: 'Parentheses first: 5 x 4 = 20.' },
          ],
        },
        {
          name: 'Writing expressions',
          description: 'Translate words to expressions.',
          questions: [
            { prompt: 'Five more than three times 4.', answer: '3 x 4 + 5', explanation: 'Multiply then add.' },
            { prompt: 'Half of (10 + 2).', answer: '(10 + 2) / 2', explanation: 'Parentheses around sum.' },
          ],
        },
        {
          name: 'Evaluating expressions',
          description: 'Compute with parentheses and brackets.',
          questions: [
            { prompt: '[(3 + 2) x 4] - 5 = ?', answer: '15', explanation: '5 x 4 = 20, 20 - 5 = 15.' },
            { prompt: '6 x (2 + 3) = ?', answer: '30', explanation: '6 x 5 = 30.' },
          ],
        },
        {
          name: 'Comparing expressions',
          description: 'Decide which expression is greater without computing.',
          questions: [
            { prompt: 'Which is greater: 3 x (4 + 2) or 3 x 4 + 2?', answer: '3 x (4 + 2)', explanation: '18 > 14.' },
            { prompt: 'Is 2 x (5 - 3) the same as 2 x 5 - 3?', answer: 'No', explanation: '4 vs 7.' },
          ],
        },
      ],
    },
    {
      name: 'Converting units of measure',
      description: 'Convert among different-sized standard measurement units within a system.',
      lessons: [
        {
          name: 'Customary conversions',
          description: 'Convert customary length, weight, and volume.',
          questions: [
            { prompt: '3 gallons = ? quarts', answer: '12', explanation: '1 gal = 4 qt.' },
            { prompt: '5 lb = ? oz', answer: '80', explanation: '5 x 16 = 80.' },
          ],
        },
        {
          name: 'Metric conversions',
          description: 'Convert metric units using powers of ten.',
          questions: [
            { prompt: '2.5 km = ? m', answer: '2,500', explanation: '2.5 x 1,000.' },
            { prompt: '750 mL = ? L', answer: '0.75', explanation: '750 ÷ 1,000.' },
          ],
        },
        {
          name: 'Time conversions',
          description: 'Convert seconds, minutes, hours, days.',
          questions: [
            { prompt: '120 minutes = ? hours', answer: '2', explanation: '120 ÷ 60.' },
            { prompt: '3 days = ? hours', answer: '72', explanation: '3 x 24 = 72.' },
          ],
        },
        {
          name: 'Multistep conversions',
          description: 'Convert and compute with units.',
          questions: [
            { prompt: '2 hr 30 min in minutes?', answer: '150', explanation: '120 + 30 = 150.' },
            { prompt: '1.5 kg = ? g', answer: '1,500', explanation: '1.5 x 1,000.' },
          ],
        },
      ],
    },
    {
      name: 'Line plots',
      description: 'Make and interpret line plots with fractional measurement data.',
      lessons: [
        {
          name: 'Making line plots',
          description: 'Plot measurement data with fractions.',
          questions: [
            { prompt: '5 pencils at 1/2 in, 3 at 3/4 in. Total pencils?', answer: '8', explanation: '5 + 3 = 8.' },
            { prompt: 'Most common length if 6 at 1/4, 2 at 1/2?', answer: '1/4', explanation: 'More Xs at 1/4.' },
          ],
        },
        {
          name: 'Reading line plots',
          description: 'Extract values from plots.',
          questions: [
            { prompt: 'Line plot: 3 Xs at 2, 4 Xs at 3. Total data?', answer: '7', explanation: '3 + 4 = 7.' },
            { prompt: 'Highest value shown if Xs at 1, 2, 3?', answer: '3', explanation: 'Read rightmost value.' },
          ],
        },
        {
          name: 'Computing with line plots',
          description: 'Add or average data from line plots.',
          questions: [
            { prompt: 'If 4 pencils are 1/2 in, total length?', answer: '2 in', explanation: '4 x 1/2 = 2.' },
            { prompt: 'Total length: 2 at 1/4 in + 4 at 1/2 in?', answer: '2.5 in', explanation: '1/2 + 2 = 2.5 in.' },
          ],
        },
        {
          name: 'Distributing equally',
          description: 'Redistribute total across plot points.',
          questions: [
            { prompt: 'Total 6 liters across 3 jars evenly. Each?', answer: '2', explanation: '6 ÷ 3 = 2.' },
            { prompt: 'Distribute 10 across 5 containers. Each?', answer: '2', explanation: '10 ÷ 5 = 2.' },
          ],
        },
      ],
    },
    {
      name: 'Properties of shapes',
      description: 'Classify two-dimensional figures into categories based on their properties.',
      lessons: [
        {
          name: 'Hierarchy of quadrilaterals',
          description: 'Understand overlapping shape categories.',
          questions: [
            { prompt: 'Is every square a rectangle?', answer: 'Yes', explanation: 'All squares fit rectangle rules.' },
            { prompt: 'Is every rhombus a parallelogram?', answer: 'Yes', explanation: 'Rhombuses have parallel opposite sides.' },
          ],
        },
        {
          name: 'Classifying triangles',
          description: 'Sort triangles by sides and angles.',
          questions: [
            { prompt: 'Triangle with 90° and two equal sides?', answer: 'right isosceles', explanation: 'Has a right angle and 2 equal sides.' },
            { prompt: 'Triangle with 3 different-length sides is ___.', answer: 'scalene', explanation: 'Scalene = no equal sides.' },
          ],
        },
        {
          name: 'Properties of parallelograms',
          description: 'Identify attributes shared by parallelograms.',
          questions: [
            { prompt: 'Opposite sides of a parallelogram are ___.', answer: 'parallel', explanation: 'By definition.' },
            { prompt: 'Opposite angles in a parallelogram are ___.', answer: 'equal', explanation: 'Opposite angles are congruent.' },
          ],
        },
        {
          name: 'Venn diagram of shapes',
          description: 'Show which shapes belong to multiple categories.',
          questions: [
            { prompt: 'Is a square both a rhombus and a rectangle?', answer: 'Yes', explanation: 'All sides equal AND 4 right angles.' },
            { prompt: 'Is a trapezoid a parallelogram?', answer: 'No', explanation: 'Trapezoid has only 1 pair parallel.' },
          ],
        },
      ],
    },
  ],
};
