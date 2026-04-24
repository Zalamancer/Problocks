import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '3',
  label: '3rd Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-third-grade-math',
  units: [
    {
      name: 'Intro to multiplication',
      description: 'Understand multiplication as equal groups, arrays, and repeated addition.',
      lessons: [
        {
          name: 'Equal groups',
          description: 'Multiply by counting equal groups of objects.',
          questions: [
            { prompt: '4 groups of 3 apples = ?', answer: '12', explanation: '4 x 3 = 12 apples.' },
            { prompt: '5 bags with 2 marbles each. Total?', answer: '10', explanation: '5 x 2 = 10.' },
          ],
        },
        {
          name: 'Arrays',
          description: 'Use rows and columns to show multiplication.',
          questions: [
            { prompt: 'An array with 3 rows of 5. Total?', answer: '15', explanation: '3 x 5 = 15.' },
            { prompt: 'An array with 4 rows of 6. Total?', answer: '24', explanation: '4 x 6 = 24.' },
          ],
        },
        {
          name: 'Repeated addition',
          description: 'Connect multiplication to adding the same number.',
          questions: [
            { prompt: '3 + 3 + 3 + 3 = ? What multiplication?', answer: '12 (4 x 3)', explanation: 'Adding 3 four times equals 4 x 3.' },
            { prompt: '5 + 5 + 5 = ?', answer: '15', explanation: '3 x 5 = 15.' },
          ],
        },
        {
          name: 'Commutative property',
          description: 'Show that order does not change the product.',
          questions: [
            { prompt: 'If 3 x 7 = 21, what is 7 x 3?', answer: '21', explanation: 'Multiplication is commutative.' },
            { prompt: 'If 4 x 8 = 32, what is 8 x 4?', answer: '32', explanation: 'Order of factors does not matter.' },
          ],
        },
      ],
    },
    {
      name: '1-digit multiplication',
      description: 'Multiply one-digit numbers fluently using properties and strategies.',
      lessons: [
        {
          name: 'Multiplying by 2, 5, 10',
          description: 'Build fluency with the easiest times tables.',
          questions: [
            { prompt: '6 x 5 = ?', answer: '30', explanation: 'Skip count by 5 six times.' },
            { prompt: '7 x 10 = ?', answer: '70', explanation: 'Multiplying by 10 adds a zero.' },
          ],
        },
        {
          name: 'Multiplying by 3, 4, 6',
          description: 'Work on middle times-table facts.',
          questions: [
            { prompt: '6 x 4 = ?', answer: '24', explanation: 'Double of 6 x 2 = 12, doubled again is 24.' },
            { prompt: '7 x 3 = ?', answer: '21', explanation: 'Seven groups of 3 equals 21.' },
          ],
        },
        {
          name: 'Multiplying by 7, 8, 9',
          description: 'Tackle the harder times-table facts.',
          questions: [
            { prompt: '8 x 7 = ?', answer: '56', explanation: '8 x 7 = 56.' },
            { prompt: '9 x 6 = ?', answer: '54', explanation: '9 x 6 = 54.' },
          ],
        },
        {
          name: 'Distributive property',
          description: 'Break factors apart to multiply.',
          questions: [
            { prompt: '6 x 7 = (6 x 5) + (6 x ?)', answer: '2', explanation: '6 x 7 = 6 x (5+2) = 30 + 12 = 42.' },
            { prompt: '4 x 8 = (4 x 4) + (4 x ?)', answer: '4', explanation: '4 x 8 = 4 x (4+4) = 16 + 16.' },
          ],
        },
      ],
    },
    {
      name: 'Addition, subtraction, and estimation',
      description: 'Add and subtract within 1,000 and use rounding to estimate answers.',
      lessons: [
        {
          name: 'Adding within 1,000',
          description: 'Add three-digit numbers with regrouping.',
          questions: [
            { prompt: '345 + 278 = ?', answer: '623', explanation: '300+200=500, 40+70=110, 5+8=13.' },
            { prompt: '506 + 194 = ?', answer: '700', explanation: '506 + 194 = 700.' },
          ],
        },
        {
          name: 'Subtracting within 1,000',
          description: 'Subtract three-digit numbers with regrouping.',
          questions: [
            { prompt: '500 - 267 = ?', answer: '233', explanation: '500 - 267 = 233.' },
            { prompt: '842 - 519 = ?', answer: '323', explanation: '842 - 519 = 323.' },
          ],
        },
        {
          name: 'Rounding to 10 and 100',
          description: 'Round whole numbers to estimate.',
          questions: [
            { prompt: 'Round 47 to the nearest 10.', answer: '50', explanation: '47 is closer to 50 than 40.' },
            { prompt: 'Round 382 to the nearest 100.', answer: '400', explanation: '382 is closer to 400 than 300.' },
          ],
        },
        {
          name: 'Estimation',
          description: 'Use rounding to estimate sums and differences.',
          questions: [
            { prompt: 'Estimate 189 + 412 using rounding.', answer: '600', explanation: '200 + 400 = 600.' },
            { prompt: 'Estimate 689 - 312.', answer: '400', explanation: '700 - 300 = 400.' },
          ],
        },
      ],
    },
    {
      name: 'Intro to division',
      description: 'Understand division as sharing or grouping and relate it to multiplication.',
      lessons: [
        {
          name: 'Division as sharing',
          description: 'Split equally into groups.',
          questions: [
            { prompt: '12 cookies shared among 3 kids. Each?', answer: '4', explanation: '12 ÷ 3 = 4.' },
            { prompt: '20 ÷ 4 = ?', answer: '5', explanation: '20 ÷ 4 = 5 each.' },
          ],
        },
        {
          name: 'Division as grouping',
          description: 'Find how many equal groups fit.',
          questions: [
            { prompt: 'How many groups of 5 in 15?', answer: '3', explanation: '15 ÷ 5 = 3.' },
            { prompt: 'How many groups of 6 in 24?', answer: '4', explanation: '24 ÷ 6 = 4.' },
          ],
        },
        {
          name: 'Relating multiplication and division',
          description: 'Use multiplication facts to solve division.',
          questions: [
            { prompt: 'If 6 x 7 = 42, then 42 ÷ 6 = ?', answer: '7', explanation: 'Division undoes multiplication.' },
            { prompt: '36 ÷ 9 = ?', answer: '4', explanation: '9 x 4 = 36.' },
          ],
        },
        {
          name: 'Division facts',
          description: 'Practice basic division facts.',
          questions: [
            { prompt: '28 ÷ 7 = ?', answer: '4', explanation: '7 x 4 = 28.' },
            { prompt: '54 ÷ 6 = ?', answer: '9', explanation: '6 x 9 = 54.' },
          ],
        },
      ],
    },
    {
      name: 'Understand fractions',
      description: 'Represent fractions as equal parts of a whole and plot them on a number line.',
      lessons: [
        {
          name: 'Fractions as equal parts',
          description: 'Identify fractions from shaded shapes.',
          questions: [
            { prompt: 'A pizza cut in 8 equal slices. 3 eaten. Fraction eaten?', answer: '3/8', explanation: '3 out of 8 equal parts.' },
            { prompt: 'What fraction is 1 shaded part out of 4?', answer: '1/4', explanation: '1 of 4 equal parts.' },
          ],
        },
        {
          name: 'Fractions on a number line',
          description: 'Plot fractions between whole numbers.',
          questions: [
            { prompt: 'Halfway between 0 and 1 is ___.', answer: '1/2', explanation: 'Halfway = 1/2.' },
            { prompt: 'What fraction is 3/4 of the way from 0 to 1?', answer: '3/4', explanation: '3/4 means three-fourths along.' },
          ],
        },
        {
          name: 'Unit fractions',
          description: 'Understand fractions with numerator 1.',
          questions: [
            { prompt: 'One part of a shape split into 6 equal parts is ___.', answer: '1/6', explanation: '1 of 6 equal parts is 1/6.' },
            { prompt: 'Which is larger: 1/2 or 1/4?', answer: '1/2', explanation: 'Fewer parts = each larger.' },
          ],
        },
        {
          name: 'Fractions of a set',
          description: 'Find a fraction of a group of objects.',
          questions: [
            { prompt: '1/2 of 8 apples = ?', answer: '4', explanation: '8 ÷ 2 = 4.' },
            { prompt: '1/3 of 9 = ?', answer: '3', explanation: '9 ÷ 3 = 3.' },
          ],
        },
      ],
    },
    {
      name: 'Equivalent fractions and comparing fractions',
      description: 'Recognize equivalent fractions and compare fractions with the same numerator or denominator.',
      lessons: [
        {
          name: 'Equivalent fractions',
          description: 'Find fractions that name the same amount.',
          questions: [
            { prompt: '1/2 = ?/4', answer: '2', explanation: '1/2 = 2/4.' },
            { prompt: '2/3 = ?/6', answer: '4', explanation: '2/3 = 4/6.' },
          ],
        },
        {
          name: 'Comparing same denominator',
          description: 'Compare fractions with the same denominator.',
          questions: [
            { prompt: 'Which is greater: 3/5 or 2/5?', answer: '3/5', explanation: 'More parts of same size is bigger.' },
            { prompt: 'Which is less: 4/7 or 5/7?', answer: '4/7', explanation: 'Fewer parts of same size is smaller.' },
          ],
        },
        {
          name: 'Comparing same numerator',
          description: 'Compare fractions with the same top number.',
          questions: [
            { prompt: 'Which is greater: 2/3 or 2/5?', answer: '2/3', explanation: 'Bigger pieces = bigger fraction.' },
            { prompt: 'Which is less: 3/8 or 3/4?', answer: '3/8', explanation: 'Smaller pieces means less total.' },
          ],
        },
        {
          name: 'Whole numbers as fractions',
          description: 'Represent whole numbers as fractions.',
          questions: [
            { prompt: '2 = ?/1', answer: '2', explanation: '2 = 2/1.' },
            { prompt: '5 = ?/5', answer: '25', explanation: '5 = 25/5.' },
          ],
        },
      ],
    },
    {
      name: 'More with multiplication and division',
      description: 'Apply multiplication and division to solve two-step word problems.',
      lessons: [
        {
          name: 'Two-step problems',
          description: 'Solve problems using two operations.',
          questions: [
            { prompt: '4 kids each buy 3 pencils. They drop 2. How many left?', answer: '10', explanation: '4 x 3 = 12, 12 - 2 = 10.' },
            { prompt: '6 x 5 - 10 = ?', answer: '20', explanation: '30 - 10 = 20.' },
          ],
        },
        {
          name: 'Equations with unknown',
          description: 'Solve for a missing factor.',
          questions: [
            { prompt: '? x 6 = 42', answer: '7', explanation: '7 x 6 = 42.' },
            { prompt: '45 ÷ ? = 5', answer: '9', explanation: '45 ÷ 9 = 5.' },
          ],
        },
        {
          name: 'Order of operations basics',
          description: 'Multiply and divide before adding and subtracting.',
          questions: [
            { prompt: '2 + 3 x 4 = ?', answer: '14', explanation: 'Multiply first: 3x4=12, then 2+12=14.' },
            { prompt: '20 - 10 ÷ 2 = ?', answer: '15', explanation: '10÷2=5, 20-5=15.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Apply multiplication and division to stories.',
          questions: [
            { prompt: '24 students in 4 equal teams. Per team?', answer: '6', explanation: '24 ÷ 4 = 6.' },
            { prompt: '5 bags with 8 marbles each. Total?', answer: '40', explanation: '5 x 8 = 40.' },
          ],
        },
      ],
    },
    {
      name: 'Arithmetic patterns and problem solving',
      description: 'Identify arithmetic patterns and use them to solve multi-step problems.',
      lessons: [
        {
          name: 'Addition and multiplication patterns',
          description: 'Spot patterns in tables and sequences.',
          questions: [
            { prompt: '2, 4, 6, 8, ___?', answer: '10', explanation: 'Add 2 each time.' },
            { prompt: '5, 10, 15, 20, ___?', answer: '25', explanation: 'Add 5 each time.' },
          ],
        },
        {
          name: 'Even and odd',
          description: 'Identify even and odd numbers.',
          questions: [
            { prompt: 'Is 17 even or odd?', answer: 'odd', explanation: '17 does not divide evenly by 2.' },
            { prompt: 'Is 48 even or odd?', answer: 'even', explanation: '48 ends in 8, an even digit.' },
          ],
        },
        {
          name: 'Multiplication table patterns',
          description: 'Notice patterns in the times table.',
          questions: [
            { prompt: 'Products of 5 always end in ___ or ___.', answer: '0 or 5', explanation: 'Multiples of 5 end in 0 or 5.' },
            { prompt: 'Is the product of two odd numbers even or odd?', answer: 'odd', explanation: 'Odd x odd = odd.' },
          ],
        },
        {
          name: 'Problem solving',
          description: 'Solve multistep word problems.',
          questions: [
            { prompt: '3 boxes of 12 donuts, 5 eaten. How many left?', answer: '31', explanation: '3 x 12 = 36, 36 - 5 = 31.' },
            { prompt: '6 bags with 4 apples. Total doubled = ?', answer: '48', explanation: '6 x 4 = 24, x 2 = 48.' },
          ],
        },
      ],
    },
    {
      name: 'Quadrilaterals',
      description: 'Classify quadrilaterals by their sides and angles.',
      lessons: [
        {
          name: 'Types of quadrilaterals',
          description: 'Name squares, rectangles, rhombuses, and trapezoids.',
          questions: [
            { prompt: 'A shape with 4 right angles and equal sides is a ___.', answer: 'square', explanation: 'Square has 4 equal sides and right angles.' },
            { prompt: 'A shape with 4 sides but only 1 pair parallel is a ___.', answer: 'trapezoid', explanation: 'Trapezoid has one parallel pair.' },
          ],
        },
        {
          name: 'Attributes and angles',
          description: 'Identify shapes by sides and angles.',
          questions: [
            { prompt: 'How many sides does any quadrilateral have?', answer: '4', explanation: 'Quad = four.' },
            { prompt: 'A rectangle has how many right angles?', answer: '4', explanation: 'All 4 corners are right angles.' },
          ],
        },
        {
          name: 'Drawing quadrilaterals',
          description: 'Draw shapes meeting given rules.',
          questions: [
            { prompt: 'Name a shape with 4 equal sides but no right angles.', answer: 'rhombus', explanation: 'Rhombus has 4 equal sides, slanted.' },
            { prompt: 'Name a shape with 4 sides, opposite sides equal and parallel.', answer: 'parallelogram', explanation: 'Both pairs parallel.' },
          ],
        },
        {
          name: 'Classifying',
          description: 'Sort shapes by properties.',
          questions: [
            { prompt: 'Is a square a rectangle?', answer: 'Yes', explanation: 'Squares have 4 right angles like rectangles.' },
            { prompt: 'Is a trapezoid a parallelogram?', answer: 'No', explanation: 'Trapezoid has only 1 pair of parallel sides.' },
          ],
        },
      ],
    },
    {
      name: 'Area',
      description: 'Measure area by counting unit squares and using multiplication.',
      lessons: [
        {
          name: 'Counting unit squares',
          description: 'Find area by counting covering squares.',
          questions: [
            { prompt: 'A 3x4 rectangle. How many unit squares inside?', answer: '12', explanation: '3 x 4 = 12.' },
            { prompt: 'A 5x2 rectangle covers how many squares?', answer: '10', explanation: '5 x 2 = 10.' },
          ],
        },
        {
          name: 'Area formula',
          description: 'Use length x width for rectangle area.',
          questions: [
            { prompt: 'Area of a 6 x 4 rectangle?', answer: '24', explanation: '6 x 4 = 24.' },
            { prompt: 'Area of a 7 x 3 rectangle?', answer: '21', explanation: '7 x 3 = 21.' },
          ],
        },
        {
          name: 'Distributive area',
          description: 'Break rectangles into smaller pieces.',
          questions: [
            { prompt: '6 x 7 = (6 x 5) + (6 x 2) = ?', answer: '42', explanation: '30 + 12 = 42.' },
            { prompt: '4 x 8 = (4 x 5) + (4 x 3) = ?', answer: '32', explanation: '20 + 12 = 32.' },
          ],
        },
        {
          name: 'Word problems with area',
          description: 'Apply area to real situations.',
          questions: [
            { prompt: 'A rug is 5 ft by 8 ft. Area?', answer: '40', explanation: '5 x 8 = 40 sq ft.' },
            { prompt: 'A garden is 6 m by 4 m. Area?', answer: '24', explanation: '6 x 4 = 24 sq m.' },
          ],
        },
      ],
    },
    {
      name: 'Perimeter',
      description: 'Find the perimeter of polygons given side lengths or real-world figures.',
      lessons: [
        {
          name: 'Perimeter of polygons',
          description: 'Add all side lengths around a shape.',
          questions: [
            { prompt: 'A square with 5-inch sides. Perimeter?', answer: '20', explanation: '4 x 5 = 20.' },
            { prompt: 'A triangle with sides 3, 4, 5. Perimeter?', answer: '12', explanation: '3 + 4 + 5 = 12.' },
          ],
        },
        {
          name: 'Perimeter of rectangles',
          description: 'Use 2(l + w) for rectangles.',
          questions: [
            { prompt: 'Rectangle 8 x 3. Perimeter?', answer: '22', explanation: '2(8+3) = 22.' },
            { prompt: 'Rectangle 5 x 7. Perimeter?', answer: '24', explanation: '2(5+7) = 24.' },
          ],
        },
        {
          name: 'Missing side lengths',
          description: 'Find a missing side when the perimeter is known.',
          questions: [
            { prompt: 'Rectangle perimeter 20, length 6. Width?', answer: '4', explanation: '20 = 2(6+w), w = 4.' },
            { prompt: 'Triangle perimeter 15, sides 5 and 6. Third side?', answer: '4', explanation: '15 - 5 - 6 = 4.' },
          ],
        },
        {
          name: 'Area vs perimeter',
          description: 'Compare area and perimeter for the same shape.',
          questions: [
            { prompt: 'Rectangle 4 x 5. Perimeter?', answer: '18', explanation: '2(4+5) = 18.' },
            { prompt: 'Same rectangle 4 x 5. Area?', answer: '20', explanation: '4 x 5 = 20.' },
          ],
        },
      ],
    },
    {
      name: 'Time',
      description: 'Tell and write time to the nearest minute and solve elapsed-time problems.',
      lessons: [
        {
          name: 'Time to the minute',
          description: 'Read clocks at any exact minute.',
          questions: [
            { prompt: 'Minute hand on 8, hour hand past 3. Time?', answer: '3:40', explanation: 'Each number is 5 minutes; 8 x 5 = 40.' },
            { prompt: 'What time is 15 minutes after 2:30?', answer: '2:45', explanation: '30 + 15 = 45.' },
          ],
        },
        {
          name: 'Elapsed time',
          description: 'Find how long between two times.',
          questions: [
            { prompt: 'From 3:15 to 4:00, how many minutes?', answer: '45', explanation: '60 - 15 = 45 minutes.' },
            { prompt: 'From 9:30 to 11:00, how long?', answer: '1 hour 30 minutes', explanation: '90 minutes total.' },
          ],
        },
        {
          name: 'Adding and subtracting time',
          description: 'Use a number line or clock to add/subtract minutes.',
          questions: [
            { prompt: '45 min + 30 min = ?', answer: '1 hr 15 min', explanation: '75 min = 1 hr 15 min.' },
            { prompt: 'Subtract 20 min from 1 hr.', answer: '40 min', explanation: '60 - 20 = 40.' },
          ],
        },
        {
          name: 'Time word problems',
          description: 'Solve real-world time stories.',
          questions: [
            { prompt: 'A movie starts 2:10, ends 4:00. Length?', answer: '1 hr 50 min', explanation: '2:10 to 4:00 = 1 hr 50 min.' },
            { prompt: 'Class ends at 12:15, lasts 45 min. Start?', answer: '11:30', explanation: '12:15 - 45 min = 11:30.' },
          ],
        },
      ],
    },
    {
      name: 'Measurement',
      description: 'Measure and estimate liquid volumes and masses in standard units.',
      lessons: [
        {
          name: 'Liquid volume',
          description: 'Measure liquids in liters and milliliters.',
          questions: [
            { prompt: '1 liter = how many milliliters?', answer: '1000', explanation: '1 L = 1000 mL.' },
            { prompt: 'A cup holds about 250 mL. Two cups?', answer: '500 mL', explanation: '250 x 2 = 500.' },
          ],
        },
        {
          name: 'Mass',
          description: 'Measure mass in grams and kilograms.',
          questions: [
            { prompt: '1 kilogram = how many grams?', answer: '1000', explanation: '1 kg = 1000 g.' },
            { prompt: 'Which has more mass: 500 g or 1 kg?', answer: '1 kg', explanation: '1 kg = 1000 g > 500 g.' },
          ],
        },
        {
          name: 'Estimating units',
          description: 'Pick sensible units for common things.',
          questions: [
            { prompt: 'Best unit for a bottle of soda?', answer: 'liters', explanation: 'Soda bottles are measured in liters.' },
            { prompt: 'Best unit for a pencil mass?', answer: 'grams', explanation: 'Pencils are light, grams fit.' },
          ],
        },
        {
          name: 'Measurement word problems',
          description: 'Solve stories involving volume and mass.',
          questions: [
            { prompt: 'A jug has 2 L. Pour out 500 mL. How much left?', answer: '1500 mL', explanation: '2000 - 500 = 1500.' },
            { prompt: 'A bag weighs 3 kg. Add 2 kg. Total?', answer: '5 kg', explanation: '3 + 2 = 5.' },
          ],
        },
      ],
    },
    {
      name: 'Represent and interpret data',
      description: 'Draw and read scaled bar graphs, picture graphs, and line plots.',
      lessons: [
        {
          name: 'Scaled picture graphs',
          description: 'Read picture graphs with a key.',
          questions: [
            { prompt: 'Each apple icon = 4. 3 icons means?', answer: '12', explanation: '3 x 4 = 12.' },
            { prompt: 'If each icon = 5 and there are 6, total?', answer: '30', explanation: '6 x 5 = 30.' },
          ],
        },
        {
          name: 'Scaled bar graphs',
          description: 'Read bar graphs whose scale is not 1.',
          questions: [
            { prompt: 'Bar reaches 15 on a scale of 5. Value?', answer: '15', explanation: 'Scale matches the bar height.' },
            { prompt: 'If scale is 2, and bar height is 8 marks, value?', answer: '16', explanation: '8 x 2 = 16.' },
          ],
        },
        {
          name: 'Line plots with fractions',
          description: 'Make line plots using halves and quarters.',
          questions: [
            { prompt: 'If 2 X marks are above 1/2, how many objects are 1/2 long?', answer: '2', explanation: 'Each X = 1 object.' },
            { prompt: 'Total X marks if there are 3 at 1/4 and 2 at 1/2?', answer: '5', explanation: '3 + 2 = 5.' },
          ],
        },
        {
          name: 'Interpreting data',
          description: 'Answer questions based on graphs.',
          questions: [
            { prompt: 'Class likes: dog 12, cat 8. Difference?', answer: '4', explanation: '12 - 8 = 4.' },
            { prompt: 'Sum of dog + cat = ?', answer: '20', explanation: '12 + 8 = 20.' },
          ],
        },
      ],
    },
  ],
};
