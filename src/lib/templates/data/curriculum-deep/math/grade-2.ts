import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '2',
  label: '2nd Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-2nd-grade-math',
  units: [
    {
      name: 'Add and subtract within 20',
      description: 'Fluently add and subtract within 20 using mental strategies.',
      lessons: [
        {
          name: 'Addition facts within 20',
          description: 'Build fluency with addition up to twenty.',
          questions: [
            { prompt: '9 + 8 = ?', answer: '17', explanation: '9 + 8 = 17 using doubles plus one.' },
            { prompt: '7 + 6 = ?', answer: '13', explanation: '6 + 6 = 12, plus 1 is 13.' },
          ],
        },
        {
          name: 'Subtraction facts within 20',
          description: 'Build fluency with subtraction from twenty.',
          questions: [
            { prompt: '16 - 9 = ?', answer: '7', explanation: '9 + 7 = 16, so 16 - 9 = 7.' },
            { prompt: '13 - 5 = ?', answer: '8', explanation: '13 - 5 = 8 by counting back.' },
          ],
        },
        {
          name: 'Doubles and near doubles',
          description: 'Use doubles facts to solve nearby facts.',
          questions: [
            { prompt: '7 + 7 = ?', answer: '14', explanation: 'Double 7 is 14.' },
            { prompt: '8 + 9 = ? (double 8 plus 1)', answer: '17', explanation: '8 + 8 = 16, plus 1 more is 17.' },
          ],
        },
        {
          name: 'Adding three numbers',
          description: 'Add three addends by finding pairs that make ten.',
          questions: [
            { prompt: '4 + 6 + 7 = ?', answer: '17', explanation: '4 + 6 = 10, plus 7 is 17.' },
            { prompt: '3 + 5 + 7 = ?', answer: '15', explanation: '3 + 7 = 10, plus 5 is 15.' },
          ],
        },
      ],
    },
    {
      name: 'Place value',
      description: 'Understand hundreds, tens, and ones and read and write numbers up to 1,000.',
      lessons: [
        {
          name: 'Hundreds, tens, and ones',
          description: 'Break three-digit numbers into place values.',
          questions: [
            { prompt: '345 is how many hundreds, tens, and ones?', answer: '3 hundreds, 4 tens, 5 ones', explanation: 'Each digit tells its place value.' },
            { prompt: '600 + 20 + 4 = ?', answer: '624', explanation: 'Adding place values gives 624.' },
          ],
        },
        {
          name: 'Reading and writing numbers',
          description: 'Read numerals and write them in expanded form.',
          questions: [
            { prompt: 'Write 507 in expanded form.', answer: '500 + 0 + 7', explanation: '507 has 5 hundreds, 0 tens, 7 ones.' },
            { prompt: 'Write "three hundred twelve" as a numeral.', answer: '312', explanation: '3 hundreds, 1 ten, 2 ones is 312.' },
          ],
        },
        {
          name: 'Comparing 3-digit numbers',
          description: 'Compare numbers up to 1,000 using place value.',
          questions: [
            { prompt: 'Which is greater: 428 or 482?', answer: '482', explanation: 'Same hundreds; 8 tens beats 2 tens.' },
            { prompt: 'Which is less: 615 or 651?', answer: '615', explanation: '615 has fewer tens than 651.' },
          ],
        },
        {
          name: 'Skip counting by 5s, 10s, 100s',
          description: 'Skip count forward using tens and hundreds.',
          questions: [
            { prompt: '100, 200, 300, ___?', answer: '400', explanation: 'Each step adds 100.' },
            { prompt: '45, 50, 55, ___?', answer: '60', explanation: 'Skip by 5s.' },
          ],
        },
      ],
    },
    {
      name: 'Add and subtract within 100',
      description: 'Add and subtract two-digit numbers using place-value strategies.',
      lessons: [
        {
          name: 'Adding two-digit numbers',
          description: 'Add two-digit numbers with and without regrouping.',
          questions: [
            { prompt: '34 + 25 = ?', answer: '59', explanation: '30 + 20 = 50, 4 + 5 = 9, total 59.' },
            { prompt: '47 + 28 = ?', answer: '75', explanation: '40 + 20 = 60, 7 + 8 = 15, total 75.' },
          ],
        },
        {
          name: 'Subtracting two-digit numbers',
          description: 'Subtract using place value and regrouping.',
          questions: [
            { prompt: '62 - 27 = ?', answer: '35', explanation: 'Regroup 62 as 50 + 12; 12 - 7 = 5, 50 - 20 = 30.' },
            { prompt: '85 - 43 = ?', answer: '42', explanation: '80 - 40 = 40, 5 - 3 = 2, total 42.' },
          ],
        },
        {
          name: 'Word problems within 100',
          description: 'Solve real-world problems using addition or subtraction.',
          questions: [
            { prompt: 'Mia had 56 stickers. She gave 19 away. How many now?', answer: '37', explanation: '56 - 19 = 37.' },
            { prompt: 'A store had 42 apples. 25 more arrived. Total?', answer: '67', explanation: '42 + 25 = 67.' },
          ],
        },
        {
          name: 'Mental math strategies',
          description: 'Use mental shortcuts for tens and ones.',
          questions: [
            { prompt: '30 + 40 = ?', answer: '70', explanation: '3 tens + 4 tens = 7 tens.' },
            { prompt: '90 - 50 = ?', answer: '40', explanation: '9 tens - 5 tens = 4 tens.' },
          ],
        },
      ],
    },
    {
      name: 'Add and subtract within 1,000',
      description: 'Extend addition and subtraction strategies to three-digit numbers.',
      lessons: [
        {
          name: 'Adding three-digit numbers',
          description: 'Add numbers up to one thousand using place value.',
          questions: [
            { prompt: '234 + 125 = ?', answer: '359', explanation: '200 + 100 = 300, 30 + 20 = 50, 4 + 5 = 9.' },
            { prompt: '456 + 237 = ?', answer: '693', explanation: '400 + 200 = 600, 50 + 30 = 80, 6 + 7 = 13.' },
          ],
        },
        {
          name: 'Subtracting three-digit numbers',
          description: 'Subtract three-digit numbers with regrouping.',
          questions: [
            { prompt: '500 - 250 = ?', answer: '250', explanation: 'Half of 500 is 250.' },
            { prompt: '725 - 348 = ?', answer: '377', explanation: '725 - 300 = 425; 425 - 48 = 377.' },
          ],
        },
        {
          name: '10 more/less, 100 more/less',
          description: 'Mentally adjust by ten or one hundred.',
          questions: [
            { prompt: '100 more than 425 = ?', answer: '525', explanation: 'Increase hundreds digit by 1.' },
            { prompt: '10 less than 640 = ?', answer: '630', explanation: 'Decrease tens digit by 1.' },
          ],
        },
        {
          name: 'Word problems within 1,000',
          description: 'Solve multistep problems with larger numbers.',
          questions: [
            { prompt: 'A library has 480 books. 135 are checked out. How many left?', answer: '345', explanation: '480 - 135 = 345.' },
            { prompt: 'A farm has 250 chickens and 175 ducks. Total?', answer: '425', explanation: '250 + 175 = 425.' },
          ],
        },
      ],
    },
    {
      name: 'Money and time',
      description: 'Count coins and bills and tell time to the nearest five minutes.',
      lessons: [
        {
          name: 'Counting coins',
          description: 'Add values of pennies, nickels, dimes, and quarters.',
          questions: [
            { prompt: '2 quarters + 1 dime = ?', answer: '60 cents', explanation: '25 + 25 + 10 = 60.' },
            { prompt: '3 dimes + 4 nickels = ?', answer: '50 cents', explanation: '30 + 20 = 50 cents.' },
          ],
        },
        {
          name: 'Counting bills',
          description: 'Add dollar values of mixed bills.',
          questions: [
            { prompt: '2 five-dollar bills + 3 one-dollar bills = ?', answer: '$13', explanation: '$10 + $3 = $13.' },
            { prompt: '1 ten-dollar bill + 2 one-dollar bills = ?', answer: '$12', explanation: '$10 + $2 = $12.' },
          ],
        },
        {
          name: 'Telling time to 5 minutes',
          description: 'Read clocks at five-minute intervals.',
          questions: [
            { prompt: 'Minute hand on 3, hour hand past 2. Time?', answer: '2:15', explanation: 'Each number on the clock is 5 minutes.' },
            { prompt: 'Minute hand on 9, hour hand past 7. Time?', answer: '7:45', explanation: 'Hand at 9 means 45 minutes past.' },
          ],
        },
        {
          name: 'A.M. and P.M.',
          description: 'Distinguish morning times from afternoon and evening.',
          questions: [
            { prompt: 'Is 8:00 breakfast A.M. or P.M.?', answer: 'A.M.', explanation: 'Morning times before noon are A.M.' },
            { prompt: 'Is 9:00 bedtime A.M. or P.M.?', answer: 'P.M.', explanation: 'Evening after noon is P.M.' },
          ],
        },
      ],
    },
    {
      name: 'Measurement',
      description: 'Measure and estimate lengths in standard units and solve length word problems.',
      lessons: [
        {
          name: 'Measuring with inches and feet',
          description: 'Use rulers to measure length in customary units.',
          questions: [
            { prompt: 'How many inches in 1 foot?', answer: '12', explanation: 'One foot equals 12 inches.' },
            { prompt: 'A pencil is 6 inches. Is it longer than 1 foot?', answer: 'No', explanation: '6 inches is half a foot.' },
          ],
        },
        {
          name: 'Measuring with centimeters and meters',
          description: 'Use rulers for metric length.',
          questions: [
            { prompt: 'How many centimeters in 1 meter?', answer: '100', explanation: '1 meter = 100 centimeters.' },
            { prompt: 'A door is about 2 meters tall. How many centimeters?', answer: '200', explanation: '2 meters = 200 cm.' },
          ],
        },
        {
          name: 'Estimating lengths',
          description: 'Choose reasonable length estimates for objects.',
          questions: [
            { prompt: 'Best estimate for a crayon: 4 inches or 4 feet?', answer: '4 inches', explanation: 'Crayons are short, inches fit.' },
            { prompt: 'Best estimate for a car: 4 feet or 4 meters?', answer: '4 meters', explanation: 'Cars are bigger than a few feet.' },
          ],
        },
        {
          name: 'Length word problems',
          description: 'Solve story problems using addition and subtraction of lengths.',
          questions: [
            { prompt: 'A ribbon is 20 cm. Cut 8 cm off. How long now?', answer: '12 cm', explanation: '20 - 8 = 12.' },
            { prompt: 'One pole is 5 feet, another is 7 feet. Total?', answer: '12 feet', explanation: '5 + 7 = 12.' },
          ],
        },
      ],
    },
    {
      name: 'Data',
      description: 'Represent and interpret data using picture graphs, bar graphs, and line plots.',
      lessons: [
        {
          name: 'Reading picture graphs',
          description: 'Count pictures to read a simple graph.',
          questions: [
            { prompt: '3 pictures of apples, each = 2. How many apples?', answer: '6', explanation: '3 x 2 = 6.' },
            { prompt: 'If each star equals 5 and there are 4 stars, total?', answer: '20', explanation: '4 x 5 = 20.' },
          ],
        },
        {
          name: 'Reading bar graphs',
          description: 'Compare heights of bars to compare amounts.',
          questions: [
            { prompt: 'Bar A = 7, Bar B = 4. How many more in A?', answer: '3', explanation: '7 - 4 = 3.' },
            { prompt: 'If dogs = 8 and cats = 5, total pets?', answer: '13', explanation: '8 + 5 = 13.' },
          ],
        },
        {
          name: 'Line plots',
          description: 'Plot measurements on a number line.',
          questions: [
            { prompt: 'Line plot shows 2, 2, 4, 4, 4. How many 4s?', answer: '3', explanation: 'Three X marks above 4.' },
            { prompt: 'If 3 books are 5 inches and 2 are 6 inches, total books?', answer: '5', explanation: '3 + 2 = 5 books.' },
          ],
        },
        {
          name: 'Making data displays',
          description: 'Organize data into picture or bar graphs.',
          questions: [
            { prompt: 'If 4 kids like blue and 2 like red, which bar is taller?', answer: 'blue', explanation: '4 is more than 2.' },
            { prompt: 'Total kids surveyed if 4 + 2 + 3?', answer: '9', explanation: '4 + 2 + 3 = 9 total.' },
          ],
        },
      ],
    },
    {
      name: 'Geometry',
      description: 'Recognize and draw shapes by attributes and partition rectangles into equal shares.',
      lessons: [
        {
          name: 'Attributes of shapes',
          description: 'Identify shapes by sides, corners, and angles.',
          questions: [
            { prompt: 'A pentagon has how many sides?', answer: '5', explanation: 'Penta means five.' },
            { prompt: 'A hexagon has how many corners?', answer: '6', explanation: 'Hexagons have 6 sides and 6 corners.' },
          ],
        },
        {
          name: 'Equal shares',
          description: 'Divide shapes into halves, thirds, and fourths.',
          questions: [
            { prompt: 'A circle cut into 4 equal parts. Each part is a ___.', answer: 'fourth', explanation: 'One of 4 equal parts is a fourth.' },
            { prompt: 'A square cut into 2 equal parts. Each is a ___.', answer: 'half', explanation: 'Two equal parts each make a half.' },
          ],
        },
        {
          name: 'Partitioning rectangles',
          description: 'Split rectangles into rows and columns of same-size squares.',
          questions: [
            { prompt: 'A rectangle split into 2 rows and 3 columns. How many squares?', answer: '6', explanation: '2 x 3 = 6.' },
            { prompt: '3 rows and 4 columns equals how many squares?', answer: '12', explanation: '3 x 4 = 12.' },
          ],
        },
        {
          name: 'Drawing shapes',
          description: 'Draw shapes with given attributes.',
          questions: [
            { prompt: 'Name a shape with 3 sides.', answer: 'triangle', explanation: 'Triangles have exactly 3 sides.' },
            { prompt: 'Name a shape with 4 equal sides.', answer: 'square', explanation: 'A square has 4 equal sides.' },
          ],
        },
      ],
    },
  ],
};
