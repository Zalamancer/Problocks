import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '4',
  label: '4th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-fourth-grade-math',
  units: [
    {
      name: 'Place value',
      description: 'Read, write, and compare multi-digit whole numbers using place value.',
      lessons: [
        {
          name: 'Place value to millions',
          description: 'Name places from ones to millions.',
          questions: [
            { prompt: 'In 3,456,789, which digit is in the hundred-thousands place?', answer: '4', explanation: '4 is in the hundred-thousands place.' },
            { prompt: 'What does the 5 represent in 152,000?', answer: '50,000', explanation: '5 is in the ten-thousands place.' },
          ],
        },
        {
          name: 'Reading and writing large numbers',
          description: 'Write big numbers in standard and word forms.',
          questions: [
            { prompt: 'Write 204,506 in words.', answer: 'Two hundred four thousand, five hundred six', explanation: 'Read each group of 3 digits.' },
            { prompt: 'Write "sixty thousand, fifty" as a numeral.', answer: '60,050', explanation: '60 thousand + 50.' },
          ],
        },
        {
          name: 'Comparing multi-digit numbers',
          description: 'Compare numbers using place value.',
          questions: [
            { prompt: 'Which is greater: 45,672 or 45,762?', answer: '45,762', explanation: 'Compare hundreds place: 7 > 6.' },
            { prompt: 'Which is less: 123,456 or 123,465?', answer: '123,456', explanation: 'Compare ones: 6 > 5.' },
          ],
        },
        {
          name: 'Rounding whole numbers',
          description: 'Round to nearest ten, hundred, thousand.',
          questions: [
            { prompt: 'Round 4,728 to the nearest hundred.', answer: '4,700', explanation: '28 rounds down.' },
            { prompt: 'Round 15,689 to the nearest thousand.', answer: '16,000', explanation: '689 rounds up.' },
          ],
        },
      ],
    },
    {
      name: 'Addition, subtraction, and estimation',
      description: 'Add and subtract multi-digit numbers fluently and estimate sums and differences.',
      lessons: [
        {
          name: 'Adding multi-digit numbers',
          description: 'Add numbers with four or more digits.',
          questions: [
            { prompt: '4,567 + 3,289 = ?', answer: '7,856', explanation: '4,567 + 3,289 = 7,856.' },
            { prompt: '12,450 + 8,325 = ?', answer: '20,775', explanation: '12,450 + 8,325 = 20,775.' },
          ],
        },
        {
          name: 'Subtracting multi-digit numbers',
          description: 'Subtract numbers with regrouping.',
          questions: [
            { prompt: '8,000 - 2,345 = ?', answer: '5,655', explanation: '8,000 - 2,345 = 5,655.' },
            { prompt: '15,432 - 6,218 = ?', answer: '9,214', explanation: '15,432 - 6,218 = 9,214.' },
          ],
        },
        {
          name: 'Estimating sums and differences',
          description: 'Use rounding to estimate.',
          questions: [
            { prompt: 'Estimate 4,892 + 3,120 by rounding to the thousand.', answer: '8,000', explanation: '5,000 + 3,000 = 8,000.' },
            { prompt: 'Estimate 7,823 - 3,198.', answer: '5,000', explanation: '8,000 - 3,000 = 5,000.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve multi-digit addition and subtraction stories.',
          questions: [
            { prompt: 'A store sold 2,375 items Monday and 3,842 Tuesday. Total?', answer: '6,217', explanation: '2,375 + 3,842 = 6,217.' },
            { prompt: 'A town had 12,500 people; 3,250 moved. How many now?', answer: '9,250', explanation: '12,500 - 3,250 = 9,250.' },
          ],
        },
      ],
    },
    {
      name: 'Multiply by 1-digit numbers',
      description: 'Multiply up to four-digit numbers by one-digit numbers using place value.',
      lessons: [
        {
          name: 'Multiplying by single digits',
          description: 'Multiply multi-digit numbers by one digit.',
          questions: [
            { prompt: '243 x 6 = ?', answer: '1,458', explanation: '243 x 6 = 1,458.' },
            { prompt: '1,256 x 4 = ?', answer: '5,024', explanation: '1,256 x 4 = 5,024.' },
          ],
        },
        {
          name: 'Area model multiplication',
          description: 'Break numbers into parts by place value.',
          questions: [
            { prompt: '34 x 6 using (30 + 4) x 6 = ?', answer: '204', explanation: '180 + 24 = 204.' },
            { prompt: '125 x 3 = (100 + 20 + 5) x 3 = ?', answer: '375', explanation: '300 + 60 + 15 = 375.' },
          ],
        },
        {
          name: 'Multiplying by multiples of 10',
          description: 'Multiply by tens, hundreds, and thousands.',
          questions: [
            { prompt: '6 x 40 = ?', answer: '240', explanation: '6 x 4 = 24, add a zero.' },
            { prompt: '7 x 500 = ?', answer: '3,500', explanation: '7 x 5 = 35, add two zeros.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply 1-digit multiplication to stories.',
          questions: [
            { prompt: '5 boxes with 248 toys each. Total?', answer: '1,240', explanation: '5 x 248 = 1,240.' },
            { prompt: '7 classes with 32 students each. Total?', answer: '224', explanation: '7 x 32 = 224.' },
          ],
        },
      ],
    },
    {
      name: 'Multiply by 2-digit numbers',
      description: 'Multiply two two-digit numbers using area models and the standard algorithm.',
      lessons: [
        {
          name: 'Area model',
          description: 'Break numbers by place value for multiplication.',
          questions: [
            { prompt: '23 x 14 = (20 + 3)(10 + 4) = ?', answer: '322', explanation: '200 + 80 + 30 + 12 = 322.' },
            { prompt: '32 x 15 = ?', answer: '480', explanation: '32 x 15 = 480.' },
          ],
        },
        {
          name: 'Standard algorithm',
          description: 'Use column multiplication.',
          questions: [
            { prompt: '45 x 23 = ?', answer: '1,035', explanation: '45 x 23 = 1,035.' },
            { prompt: '67 x 18 = ?', answer: '1,206', explanation: '67 x 18 = 1,206.' },
          ],
        },
        {
          name: 'Multiplying by tens',
          description: 'Multiply by whole tens, like 20, 30.',
          questions: [
            { prompt: '25 x 40 = ?', answer: '1,000', explanation: '25 x 40 = 1,000.' },
            { prompt: '16 x 30 = ?', answer: '480', explanation: '16 x 30 = 480.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve stories with 2-digit by 2-digit multiplication.',
          questions: [
            { prompt: 'A theater has 24 rows of 18 seats. Total?', answer: '432', explanation: '24 x 18 = 432.' },
            { prompt: '15 teams of 12 players. Total?', answer: '180', explanation: '15 x 12 = 180.' },
          ],
        },
      ],
    },
    {
      name: 'Division',
      description: 'Divide multi-digit numbers by one-digit divisors and interpret remainders.',
      lessons: [
        {
          name: 'Dividing multi-digit numbers',
          description: 'Divide up to four digits by one digit.',
          questions: [
            { prompt: '84 ÷ 4 = ?', answer: '21', explanation: '84 ÷ 4 = 21.' },
            { prompt: '368 ÷ 8 = ?', answer: '46', explanation: '368 ÷ 8 = 46.' },
          ],
        },
        {
          name: 'Division with remainders',
          description: 'Handle leftover amounts when dividing.',
          questions: [
            { prompt: '25 ÷ 4 = ? remainder ?', answer: '6 remainder 1', explanation: '4 x 6 = 24, remainder 1.' },
            { prompt: '37 ÷ 5 = ? remainder ?', answer: '7 remainder 2', explanation: '5 x 7 = 35, remainder 2.' },
          ],
        },
        {
          name: 'Interpreting remainders',
          description: 'Choose what to do with leftovers in word problems.',
          questions: [
            { prompt: '25 cookies, 4 friends share equally. How many each?', answer: '6 (with 1 left over)', explanation: '25 ÷ 4 = 6 R 1.' },
            { prompt: '30 kids, 4 per van. How many vans?', answer: '8', explanation: 'Round up; need 8 vans.' },
          ],
        },
        {
          name: 'Division word problems',
          description: 'Apply division to real situations.',
          questions: [
            { prompt: '128 pencils in 8 boxes equally. Per box?', answer: '16', explanation: '128 ÷ 8 = 16.' },
            { prompt: '200 students into teams of 5. Teams?', answer: '40', explanation: '200 ÷ 5 = 40.' },
          ],
        },
      ],
    },
    {
      name: 'Factors, multiples and patterns',
      description: 'Find factors and multiples and generate and analyze number and shape patterns.',
      lessons: [
        {
          name: 'Factors',
          description: 'Find numbers that divide evenly.',
          questions: [
            { prompt: 'List all factors of 12.', answer: '1, 2, 3, 4, 6, 12', explanation: 'These are all the divisors.' },
            { prompt: 'Is 5 a factor of 20?', answer: 'Yes', explanation: '20 ÷ 5 = 4 exactly.' },
          ],
        },
        {
          name: 'Multiples',
          description: 'Find numbers produced by multiplication.',
          questions: [
            { prompt: 'First 4 multiples of 7: ?', answer: '7, 14, 21, 28', explanation: '7 x 1, 7 x 2, 7 x 3, 7 x 4.' },
            { prompt: 'Is 36 a multiple of 6?', answer: 'Yes', explanation: '6 x 6 = 36.' },
          ],
        },
        {
          name: 'Prime and composite',
          description: 'Identify prime and composite numbers.',
          questions: [
            { prompt: 'Is 7 prime or composite?', answer: 'prime', explanation: 'Only factors are 1 and 7.' },
            { prompt: 'Is 15 prime or composite?', answer: 'composite', explanation: '15 has factors beyond 1 and 15.' },
          ],
        },
        {
          name: 'Number patterns',
          description: 'Extend number patterns.',
          questions: [
            { prompt: '3, 6, 9, 12, ___?', answer: '15', explanation: 'Add 3 each time.' },
            { prompt: '1, 4, 9, 16, ___?', answer: '25', explanation: 'Perfect squares.' },
          ],
        },
      ],
    },
    {
      name: 'Equivalent fractions and comparing fractions',
      description: 'Generate equivalent fractions and compare fractions with unlike denominators.',
      lessons: [
        {
          name: 'Generating equivalent fractions',
          description: 'Multiply or divide numerator and denominator together.',
          questions: [
            { prompt: '3/4 = ?/12', answer: '9', explanation: 'Multiply by 3/3.' },
            { prompt: '6/8 simplified = ?', answer: '3/4', explanation: 'Divide by 2/2.' },
          ],
        },
        {
          name: 'Comparing fractions',
          description: 'Compare using common denominators or benchmarks.',
          questions: [
            { prompt: 'Which is greater: 2/3 or 3/5?', answer: '2/3', explanation: '10/15 > 9/15.' },
            { prompt: 'Which is less: 1/4 or 1/3?', answer: '1/4', explanation: 'Smaller pieces = less.' },
          ],
        },
        {
          name: 'Benchmark fractions',
          description: 'Compare to 0, 1/2, 1.',
          questions: [
            { prompt: 'Is 3/8 more or less than 1/2?', answer: 'less', explanation: '3/8 < 4/8 = 1/2.' },
            { prompt: 'Is 5/6 close to 0, 1/2, or 1?', answer: '1', explanation: '5/6 is close to 6/6 = 1.' },
          ],
        },
        {
          name: 'Ordering fractions',
          description: 'Arrange fractions in order.',
          questions: [
            { prompt: 'Order least to greatest: 1/2, 3/4, 1/4.', answer: '1/4, 1/2, 3/4', explanation: 'Compare as quarters.' },
            { prompt: 'Greatest of 2/3, 5/6, 1/2?', answer: '5/6', explanation: '5/6 > 4/6 > 3/6.' },
          ],
        },
      ],
    },
    {
      name: 'Add and subtract fractions',
      description: 'Add and subtract fractions and mixed numbers with like denominators.',
      lessons: [
        {
          name: 'Adding like denominators',
          description: 'Add fractions with the same denominator.',
          questions: [
            { prompt: '1/5 + 2/5 = ?', answer: '3/5', explanation: 'Add numerators, keep denominator.' },
            { prompt: '3/8 + 4/8 = ?', answer: '7/8', explanation: '3 + 4 = 7 over 8.' },
          ],
        },
        {
          name: 'Subtracting like denominators',
          description: 'Subtract fractions with the same denominator.',
          questions: [
            { prompt: '5/6 - 2/6 = ?', answer: '3/6 (or 1/2)', explanation: '5 - 2 = 3 over 6.' },
            { prompt: '7/10 - 3/10 = ?', answer: '4/10 (or 2/5)', explanation: '7 - 3 = 4.' },
          ],
        },
        {
          name: 'Mixed numbers',
          description: 'Convert between mixed numbers and improper fractions.',
          questions: [
            { prompt: 'Write 7/4 as a mixed number.', answer: '1 3/4', explanation: '7 ÷ 4 = 1 R 3.' },
            { prompt: 'Write 2 1/3 as an improper fraction.', answer: '7/3', explanation: '(2 x 3) + 1 = 7.' },
          ],
        },
        {
          name: 'Word problems with fractions',
          description: 'Solve fraction stories with like denominators.',
          questions: [
            { prompt: 'You ate 2/8 of pizza, friend ate 3/8. Total?', answer: '5/8', explanation: '2/8 + 3/8 = 5/8.' },
            { prompt: 'You had 7/10 L water; drank 2/10 L. Left?', answer: '5/10', explanation: '7 - 2 = 5.' },
          ],
        },
      ],
    },
    {
      name: 'Multiply fractions',
      description: 'Multiply a fraction by a whole number using visual models.',
      lessons: [
        {
          name: 'Fraction x whole number',
          description: 'Multiply unit fractions by whole numbers.',
          questions: [
            { prompt: '3 x 1/4 = ?', answer: '3/4', explanation: '3/4 is 3 groups of 1/4.' },
            { prompt: '5 x 1/6 = ?', answer: '5/6', explanation: '5 groups of 1/6.' },
          ],
        },
        {
          name: 'Non-unit fraction x whole',
          description: 'Multiply any fraction by a whole number.',
          questions: [
            { prompt: '4 x 2/3 = ?', answer: '8/3', explanation: '(4 x 2)/3 = 8/3.' },
            { prompt: '3 x 3/5 = ?', answer: '9/5', explanation: '(3 x 3)/5 = 9/5.' },
          ],
        },
        {
          name: 'Visual models',
          description: 'Use diagrams to multiply fractions.',
          questions: [
            { prompt: 'Model 2 x 1/3: how many thirds total?', answer: '2/3', explanation: 'Two thirds total.' },
            { prompt: 'Model 4 x 1/2: result?', answer: '2', explanation: '4 halves = 2 wholes.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply fraction x whole to stories.',
          questions: [
            { prompt: 'Each bag holds 3/4 lb. 4 bags = ?', answer: '3 lb', explanation: '4 x 3/4 = 12/4 = 3.' },
            { prompt: 'Run 2/5 mile 5 times. Total?', answer: '2 miles', explanation: '5 x 2/5 = 2.' },
          ],
        },
      ],
    },
    {
      name: 'Understand decimals',
      description: 'Write decimal notation for fractions with denominators 10 and 100.',
      lessons: [
        {
          name: 'Tenths and hundredths',
          description: 'Relate decimals to place value.',
          questions: [
            { prompt: '0.7 = ? / 10', answer: '7', explanation: '7 tenths = 0.7.' },
            { prompt: '0.25 = ? / 100', answer: '25', explanation: '25 hundredths = 0.25.' },
          ],
        },
        {
          name: 'Decimals as fractions',
          description: 'Convert decimals to fractions.',
          questions: [
            { prompt: 'Write 0.3 as a fraction.', answer: '3/10', explanation: '3 tenths.' },
            { prompt: 'Write 0.47 as a fraction.', answer: '47/100', explanation: '47 hundredths.' },
          ],
        },
        {
          name: 'Comparing decimals',
          description: 'Compare decimals by place value.',
          questions: [
            { prompt: 'Which is greater: 0.4 or 0.35?', answer: '0.4', explanation: '0.40 > 0.35.' },
            { prompt: 'Which is less: 0.28 or 0.3?', answer: '0.28', explanation: '0.28 < 0.30.' },
          ],
        },
        {
          name: 'Decimals on number lines',
          description: 'Plot decimals between whole numbers.',
          questions: [
            { prompt: 'Point halfway between 0.2 and 0.4 = ?', answer: '0.3', explanation: 'Midpoint is 0.3.' },
            { prompt: 'What decimal is 3/4 of the way from 0 to 1?', answer: '0.75', explanation: '3/4 = 0.75.' },
          ],
        },
      ],
    },
    {
      name: 'Plane figures',
      description: 'Identify points, lines, rays, angles, and classify triangles and quadrilaterals.',
      lessons: [
        {
          name: 'Lines, rays, and angles',
          description: 'Name geometric basics.',
          questions: [
            { prompt: 'A line that never ends in both directions is a ___.', answer: 'line', explanation: 'Lines extend both ways forever.' },
            { prompt: 'Two rays from one point form a ___.', answer: 'angle', explanation: 'Angles are formed by rays at a vertex.' },
          ],
        },
        {
          name: 'Types of angles',
          description: 'Classify acute, right, obtuse, straight.',
          questions: [
            { prompt: 'A 90° angle is called ___.', answer: 'right', explanation: 'Right = 90°.' },
            { prompt: 'An angle less than 90° is ___.', answer: 'acute', explanation: 'Acute < 90°.' },
          ],
        },
        {
          name: 'Classifying triangles',
          description: 'Sort triangles by sides and angles.',
          questions: [
            { prompt: 'A triangle with 3 equal sides is ___.', answer: 'equilateral', explanation: 'All sides equal.' },
            { prompt: 'A triangle with one 90° angle is ___.', answer: 'right', explanation: 'One right angle = right triangle.' },
          ],
        },
        {
          name: 'Lines of symmetry',
          description: 'Find lines that divide a shape into mirror halves.',
          questions: [
            { prompt: 'How many lines of symmetry does a square have?', answer: '4', explanation: '2 diagonals + 2 through midpoints.' },
            { prompt: 'Does a regular pentagon have symmetry?', answer: 'Yes', explanation: 'It has 5 lines of symmetry.' },
          ],
        },
      ],
    },
    {
      name: 'Measuring angles',
      description: 'Measure and draw angles in whole-number degrees using a protractor.',
      lessons: [
        {
          name: 'Understanding degrees',
          description: 'A full circle equals 360 degrees.',
          questions: [
            { prompt: 'A right angle has how many degrees?', answer: '90', explanation: 'Right = 90°.' },
            { prompt: 'A straight line angle has how many degrees?', answer: '180', explanation: 'Straight = 180°.' },
          ],
        },
        {
          name: 'Using a protractor',
          description: 'Measure angles in degrees.',
          questions: [
            { prompt: 'If an angle reads 45° on protractor, type?', answer: 'acute', explanation: '45° < 90°.' },
            { prompt: 'An angle of 120° is ___.', answer: 'obtuse', explanation: 'Between 90° and 180°.' },
          ],
        },
        {
          name: 'Adding angles',
          description: 'Combine adjacent angles.',
          questions: [
            { prompt: '30° + 60° = ?', answer: '90°', explanation: '30 + 60 = 90.' },
            { prompt: '45° + 45° = ?', answer: '90°', explanation: 'Two 45° angles make a right angle.' },
          ],
        },
        {
          name: 'Unknown angles',
          description: 'Solve for missing angle measures.',
          questions: [
            { prompt: 'If two angles total 180° and one is 70°, other?', answer: '110°', explanation: '180 - 70 = 110.' },
            { prompt: 'Two angles add to 90°; one is 35°. Other?', answer: '55°', explanation: '90 - 35 = 55.' },
          ],
        },
      ],
    },
    {
      name: 'Area and perimeter',
      description: 'Apply area and perimeter formulas to solve real-world rectangle problems.',
      lessons: [
        {
          name: 'Area formula',
          description: 'Compute area = length x width.',
          questions: [
            { prompt: 'Area of 12 x 5 rectangle?', answer: '60', explanation: '12 x 5 = 60.' },
            { prompt: 'Area of 8 x 9?', answer: '72', explanation: '8 x 9 = 72.' },
          ],
        },
        {
          name: 'Perimeter formula',
          description: 'Compute perimeter = 2(l + w).',
          questions: [
            { prompt: 'Perimeter of 10 x 4 rectangle?', answer: '28', explanation: '2(10+4) = 28.' },
            { prompt: 'Perimeter of 7 x 3?', answer: '20', explanation: '2(7+3) = 20.' },
          ],
        },
        {
          name: 'Missing dimensions',
          description: 'Find unknown side given area or perimeter.',
          questions: [
            { prompt: 'Rectangle area 48, width 6. Length?', answer: '8', explanation: '48 ÷ 6 = 8.' },
            { prompt: 'Rectangle perimeter 30, length 10. Width?', answer: '5', explanation: '30 = 2(10+5).' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply area and perimeter to real situations.',
          questions: [
            { prompt: 'Garden 15 m by 8 m. Area?', answer: '120', explanation: '15 x 8 = 120 sq m.' },
            { prompt: 'Fence around a 20 x 12 yard. Perimeter?', answer: '64', explanation: '2(20+12) = 64 m.' },
          ],
        },
      ],
    },
    {
      name: 'Units of measurement',
      description: 'Convert measurements within a system from larger to smaller units.',
      lessons: [
        {
          name: 'Customary length',
          description: 'Convert feet, yards, inches, miles.',
          questions: [
            { prompt: '3 feet = ? inches', answer: '36', explanation: '3 x 12 = 36.' },
            { prompt: '2 yards = ? feet', answer: '6', explanation: '1 yard = 3 ft.' },
          ],
        },
        {
          name: 'Metric length',
          description: 'Convert meters, centimeters, kilometers.',
          questions: [
            { prompt: '4 m = ? cm', answer: '400', explanation: '1 m = 100 cm.' },
            { prompt: '3 km = ? m', answer: '3,000', explanation: '1 km = 1,000 m.' },
          ],
        },
        {
          name: 'Weight and mass',
          description: 'Convert pounds/ounces and kilograms/grams.',
          questions: [
            { prompt: '2 lb = ? oz', answer: '32', explanation: '1 lb = 16 oz.' },
            { prompt: '5 kg = ? g', answer: '5,000', explanation: '1 kg = 1,000 g.' },
          ],
        },
        {
          name: 'Time conversions',
          description: 'Convert seconds, minutes, hours.',
          questions: [
            { prompt: '3 hours = ? minutes', answer: '180', explanation: '3 x 60 = 180.' },
            { prompt: '2 minutes = ? seconds', answer: '120', explanation: '2 x 60 = 120.' },
          ],
        },
      ],
    },
  ],
};
