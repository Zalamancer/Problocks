import type { DeepGrade } from '../types';

export const GRADE_6: DeepGrade = {
  grade: '6',
  label: '6th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-sixth-grade-math',
  units: [
    {
      name: 'Ratios, rates, & percentages',
      description: 'Understand ratio concepts and use rate and percent reasoning to solve problems.',
      lessons: [
        {
          name: 'Intro to ratios',
          description: 'Represent the relationship between two quantities using ratio language.',
          questions: [
            { prompt: 'Write the ratio of 4 cats to 6 dogs in simplest form.', answer: '2:3', explanation: 'Divide both parts by 2.' },
            { prompt: 'A recipe uses 3 cups flour to 2 cups sugar. What is the ratio?', answer: '3:2', explanation: 'Already in simplest form.' },
          ],
        },
        {
          name: 'Equivalent ratios',
          description: 'Generate ratios equivalent to a given ratio using multiplication.',
          questions: [
            { prompt: 'Find an equivalent ratio to 2:5 with first term 10.', answer: '10:25', explanation: 'Multiply both terms by 5.' },
            { prompt: 'Is 4:6 equivalent to 6:9?', answer: 'Yes', explanation: 'Both simplify to 2:3.' },
          ],
        },
        {
          name: 'Unit rates',
          description: 'Compute unit rates associated with ratios of fractions or whole numbers.',
          questions: [
            { prompt: 'If 6 apples cost $3, what is the unit rate per apple?', answer: '$0.50', explanation: '3 divided by 6 equals 0.50.' },
            { prompt: 'A car travels 120 miles in 3 hours. Find the rate in mph.', answer: '40 mph', explanation: '120 divided by 3.' },
          ],
        },
        {
          name: 'Percents from fractions',
          description: 'Convert between fractions, decimals, and percents.',
          questions: [
            { prompt: 'What is 3/4 as a percent?', answer: '75%', explanation: '3 divided by 4 equals 0.75.' },
            { prompt: 'Convert 0.2 to a percent.', answer: '20%', explanation: 'Multiply by 100.' },
          ],
        },
        {
          name: 'Percent problems',
          description: 'Find a percent of a number and solve percent word problems.',
          questions: [
            { prompt: 'What is 25% of 80?', answer: '20', explanation: '0.25 times 80.' },
            { prompt: '15 is what percent of 60?', answer: '25%', explanation: '15 divided by 60 is 0.25.' },
          ],
        },
      ],
    },
    {
      name: 'Arithmetic operations',
      description: 'Compute fluently with multi-digit numbers and perform operations on decimals.',
      lessons: [
        {
          name: 'Multi-digit multiplication',
          description: 'Multiply multi-digit whole numbers using the standard algorithm.',
          questions: [
            { prompt: 'Compute 124 times 16.', answer: '1984', explanation: 'Standard algorithm yields 1984.' },
            { prompt: 'Compute 308 times 25.', answer: '7700', explanation: '308 times 25 equals 7700.' },
          ],
        },
        {
          name: 'Multi-digit division',
          description: 'Divide multi-digit whole numbers using the standard algorithm.',
          questions: [
            { prompt: 'Compute 864 divided by 12.', answer: '72', explanation: '12 times 72 equals 864.' },
            { prompt: 'Compute 1,050 divided by 25.', answer: '42', explanation: '25 times 42 equals 1050.' },
          ],
        },
        {
          name: 'Adding decimals',
          description: 'Add decimals by lining up place value.',
          questions: [
            { prompt: 'Add 3.45 + 2.7.', answer: '6.15', explanation: 'Line up decimals and add.' },
            { prompt: 'Add 0.89 + 1.06.', answer: '1.95', explanation: 'Sum by place value.' },
          ],
        },
        {
          name: 'Multiplying and dividing decimals',
          description: 'Multiply and divide decimals to hundredths using place value.',
          questions: [
            { prompt: 'Compute 0.5 times 0.4.', answer: '0.2', explanation: 'Multiply 5 and 4, place 2 decimals.' },
            { prompt: 'Compute 7.2 divided by 0.8.', answer: '9', explanation: '72 divided by 8 equals 9.' },
          ],
        },
      ],
    },
    {
      name: 'Negative numbers',
      description: 'Extend the number system to negative numbers and place them on a number line.',
      lessons: [
        {
          name: 'Negative numbers on the number line',
          description: 'Locate positive and negative numbers on a number line.',
          questions: [
            { prompt: 'Which is greater, -3 or -5?', answer: '-3', explanation: '-3 is to the right of -5.' },
            { prompt: 'What is the opposite of -7?', answer: '7', explanation: 'Opposites have same magnitude and different sign.' },
          ],
        },
        {
          name: 'Absolute value',
          description: 'Interpret absolute value as distance from zero.',
          questions: [
            { prompt: 'What is |-8|?', answer: '8', explanation: 'Distance from 0 is 8.' },
            { prompt: 'What is |5| + |-3|?', answer: '8', explanation: '5 + 3 equals 8.' },
          ],
        },
        {
          name: 'Comparing rational numbers',
          description: 'Compare and order positive and negative rational numbers.',
          questions: [
            { prompt: 'Which is greater, -2.5 or -2.3?', answer: '-2.3', explanation: '-2.3 is closer to zero.' },
            { prompt: 'Order -1, 0, -2, 1 from least to greatest.', answer: '-2, -1, 0, 1', explanation: 'Ascending order.' },
          ],
        },
        {
          name: 'Coordinate plane',
          description: 'Plot points in all four quadrants of the coordinate plane.',
          questions: [
            { prompt: 'In which quadrant is (-3, 4)?', answer: 'Quadrant II', explanation: 'Negative x, positive y.' },
            { prompt: 'Reflect (2, -5) across the x-axis.', answer: '(2, 5)', explanation: 'Negate the y-coordinate.' },
          ],
        },
      ],
    },
    {
      name: 'Properties of numbers',
      description: 'Find common factors and multiples and apply the distributive property.',
      lessons: [
        {
          name: 'Greatest common factor',
          description: 'Find the GCF of two whole numbers up to 100.',
          questions: [
            { prompt: 'Find GCF(24, 36).', answer: '12', explanation: 'Largest factor of both is 12.' },
            { prompt: 'Find GCF(15, 25).', answer: '5', explanation: 'Only common factor besides 1.' },
          ],
        },
        {
          name: 'Least common multiple',
          description: 'Find the LCM of two whole numbers less than or equal to 12.',
          questions: [
            { prompt: 'Find LCM(4, 6).', answer: '12', explanation: 'Smallest shared multiple.' },
            { prompt: 'Find LCM(5, 8).', answer: '40', explanation: '5 times 8 equals 40; no smaller multiple.' },
          ],
        },
        {
          name: 'Distributive property',
          description: 'Use the distributive property to rewrite numeric expressions.',
          questions: [
            { prompt: 'Write 4(7 + 3) using the distributive property.', answer: '4·7 + 4·3', explanation: 'Distribute 4.' },
            { prompt: 'Factor: 6 + 9 using GCF.', answer: '3(2+3)', explanation: 'GCF of 6 and 9 is 3.' },
          ],
        },
        {
          name: 'Prime factorization',
          description: 'Express a composite number as a product of primes.',
          questions: [
            { prompt: 'Find the prime factorization of 36.', answer: '2^2 · 3^2', explanation: '36 = 4 times 9.' },
            { prompt: 'Find the prime factorization of 45.', answer: '3^2 · 5', explanation: '45 = 9 times 5.' },
          ],
        },
      ],
    },
    {
      name: 'Variables & expressions',
      description: 'Write, read, and evaluate algebraic expressions using variables and exponents.',
      lessons: [
        {
          name: 'Evaluating expressions',
          description: 'Substitute values for variables and evaluate expressions.',
          questions: [
            { prompt: 'Evaluate 3x + 5 when x = 4.', answer: '17', explanation: '3·4 + 5 = 17.' },
            { prompt: 'Evaluate 2y^2 when y = 3.', answer: '18', explanation: '2·9 = 18.' },
          ],
        },
        {
          name: 'Writing expressions',
          description: 'Translate verbal phrases to algebraic expressions.',
          questions: [
            { prompt: 'Translate: 5 more than a number n.', answer: 'n + 5', explanation: 'Add 5 to n.' },
            { prompt: 'Translate: product of 7 and x.', answer: '7x', explanation: 'Multiplication.' },
          ],
        },
        {
          name: 'Combining like terms',
          description: 'Simplify expressions by combining like terms.',
          questions: [
            { prompt: 'Simplify 3x + 5x.', answer: '8x', explanation: 'Add coefficients.' },
            { prompt: 'Simplify 4a + 2b + a.', answer: '5a + 2b', explanation: 'Combine a terms.' },
          ],
        },
        {
          name: 'Exponents',
          description: 'Use whole-number exponents to represent repeated multiplication.',
          questions: [
            { prompt: 'Evaluate 2^5.', answer: '32', explanation: '2·2·2·2·2.' },
            { prompt: 'Evaluate 10^3.', answer: '1000', explanation: 'Three zeros.' },
          ],
        },
      ],
    },
    {
      name: 'Equations & inequalities introduction',
      description: 'Solve one-variable equations and inequalities representing real-world problems.',
      lessons: [
        {
          name: 'One-step equations',
          description: 'Solve equations of the form x + a = b or ax = b.',
          questions: [
            { prompt: 'Solve x + 7 = 15.', answer: 'x = 8', explanation: 'Subtract 7.' },
            { prompt: 'Solve 4x = 28.', answer: 'x = 7', explanation: 'Divide by 4.' },
          ],
        },
        {
          name: 'Writing equations',
          description: 'Write equations to represent real-world situations.',
          questions: [
            { prompt: 'Sam has x books; 3 more gives 12. Write the equation.', answer: 'x + 3 = 12', explanation: 'Add 3.' },
            { prompt: 'A pencil costs p. 5 pencils cost 10. Equation?', answer: '5p = 10', explanation: 'Total is 5p.' },
          ],
        },
        {
          name: 'One-step inequalities',
          description: 'Solve and graph one-step inequalities.',
          questions: [
            { prompt: 'Solve x + 4 > 9.', answer: 'x > 5', explanation: 'Subtract 4 from both sides.' },
            { prompt: 'Solve 3x < 12.', answer: 'x < 4', explanation: 'Divide by 3.' },
          ],
        },
        {
          name: 'Dependent and independent variables',
          description: 'Identify relationships between two variables.',
          questions: [
            { prompt: 'In y = 2x, which is dependent?', answer: 'y', explanation: 'y depends on x.' },
            { prompt: 'Given distance = rate · time, which is independent?', answer: 'time', explanation: 'Time is chosen; distance depends on it.' },
          ],
        },
      ],
    },
    {
      name: 'Geometry',
      description: 'Find area, surface area, and volume using nets and formulas.',
      lessons: [
        {
          name: 'Area of triangles',
          description: 'Use the formula A = 1/2 b h to find triangle areas.',
          questions: [
            { prompt: 'Find the area of a triangle with b=8, h=5.', answer: '20', explanation: '1/2 · 8 · 5 = 20.' },
            { prompt: 'Triangle with base 10 and height 6.', answer: '30', explanation: '1/2 · 10 · 6 = 30.' },
          ],
        },
        {
          name: 'Area of quadrilaterals',
          description: 'Find areas of parallelograms, trapezoids, and composite figures.',
          questions: [
            { prompt: 'Parallelogram base 7 height 4. Area?', answer: '28', explanation: 'Area = b · h.' },
            { prompt: 'Trapezoid bases 4 and 6, height 5.', answer: '25', explanation: '1/2 · (4+6) · 5.' },
          ],
        },
        {
          name: 'Surface area with nets',
          description: 'Use nets to find the surface area of 3D figures.',
          questions: [
            { prompt: 'Cube with side 4. Surface area?', answer: '96', explanation: '6·16 = 96.' },
            { prompt: 'Rectangular prism 3x4x5. Surface area?', answer: '94', explanation: '2(12+15+20)=94.' },
          ],
        },
        {
          name: 'Volume of prisms',
          description: 'Find volumes of rectangular prisms with fractional edges.',
          questions: [
            { prompt: 'Prism 3 x 4 x 5 volume.', answer: '60', explanation: 'Multiply dimensions.' },
            { prompt: 'Prism 2 x 2.5 x 6 volume.', answer: '30', explanation: '2·2.5·6 = 30.' },
          ],
        },
      ],
    },
    {
      name: 'Data and statistics',
      description: 'Summarize and describe distributions using measures of center and variability.',
      lessons: [
        {
          name: 'Mean',
          description: 'Find the mean (average) of a data set.',
          questions: [
            { prompt: 'Mean of 4, 6, 8, 10.', answer: '7', explanation: 'Sum 28, divide by 4.' },
            { prompt: 'Mean of 3, 5, 7.', answer: '5', explanation: 'Sum 15 divided by 3.' },
          ],
        },
        {
          name: 'Median and mode',
          description: 'Identify the median and mode of a data set.',
          questions: [
            { prompt: 'Median of 1, 3, 5, 7, 9.', answer: '5', explanation: 'Middle value.' },
            { prompt: 'Mode of 2, 3, 3, 5, 7.', answer: '3', explanation: 'Most frequent.' },
          ],
        },
        {
          name: 'Range and IQR',
          description: 'Compute range and interquartile range.',
          questions: [
            { prompt: 'Range of 4, 9, 12, 20.', answer: '16', explanation: '20 - 4.' },
            { prompt: 'IQR of {2,4,6,8,10}.', answer: '4', explanation: 'Q3=8, Q1=4.' },
          ],
        },
        {
          name: 'Box plots and histograms',
          description: 'Interpret distributions using box plots and histograms.',
          questions: [
            { prompt: 'A box plot has Q1=10, Q3=18. IQR?', answer: '8', explanation: 'Q3 - Q1.' },
            { prompt: 'Histogram shows data peak at bin 20-30. That represents...?', answer: 'the mode class', explanation: 'Most frequent interval.' },
          ],
        },
      ],
    },
  ],
};
