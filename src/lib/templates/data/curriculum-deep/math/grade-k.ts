import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: 'K',
  label: 'Kindergarten',
  sourceUrl: 'https://www.khanacademy.org/math/cc-kindergarten-math',
  units: [
    {
      name: 'Counting and place value',
      description: 'Count, read, and write numbers up to 20 and recognize teen numbers as ten-and-some-ones.',
      lessons: [
        {
          name: 'Counting to 10',
          description: 'Count objects one by one up to ten.',
          questions: [
            { prompt: 'Count the apples: 🍎🍎🍎🍎🍎. How many?', answer: '5', explanation: 'Counting each apple gives 1, 2, 3, 4, 5.' },
            { prompt: 'What number comes after 7?', answer: '8', explanation: 'When counting up, 8 comes right after 7.' },
          ],
        },
        {
          name: 'Counting to 20',
          description: 'Extend counting from ten up to twenty.',
          questions: [
            { prompt: 'What number comes after 15?', answer: '16', explanation: '16 comes right after 15 when counting.' },
            { prompt: 'Count: 11, 12, 13, ___. What is next?', answer: '14', explanation: '14 follows 13 in the counting sequence.' },
          ],
        },
        {
          name: 'Teen numbers as ten and ones',
          description: 'Break teen numbers into a ten plus extra ones.',
          questions: [
            { prompt: '13 is 10 and how many ones?', answer: '3', explanation: '13 is made of 1 ten and 3 ones.' },
            { prompt: '10 + 7 = ?', answer: '17', explanation: '10 ones plus 7 more ones makes 17.' },
          ],
        },
        {
          name: 'Writing numbers 0-20',
          description: 'Write numerals that match counted quantities.',
          questions: [
            { prompt: 'Write the numeral for twelve.', answer: '12', explanation: 'Twelve is written as the digits 1 and 2.' },
            { prompt: 'Write the numeral for zero.', answer: '0', explanation: 'Zero is the symbol 0, meaning none.' },
          ],
        },
        {
          name: 'Comparing numbers',
          description: 'Decide which group has more, less, or equal amounts.',
          questions: [
            { prompt: 'Which is greater: 6 or 9?', answer: '9', explanation: '9 comes after 6 so it is larger.' },
            { prompt: 'Which is less: 4 or 2?', answer: '2', explanation: '2 is smaller than 4.' },
          ],
        },
      ],
    },
    {
      name: 'Addition and subtraction',
      description: 'Understand addition as putting together and subtraction as taking apart within 10.',
      lessons: [
        {
          name: 'Adding within 5',
          description: 'Combine two small groups to find the total.',
          questions: [
            { prompt: '2 + 3 = ?', answer: '5', explanation: '2 and 3 together make 5.' },
            { prompt: '1 + 4 = ?', answer: '5', explanation: 'Counting on from 1 by 4 reaches 5.' },
          ],
        },
        {
          name: 'Adding within 10',
          description: 'Add two groups whose total is ten or less.',
          questions: [
            { prompt: '4 + 5 = ?', answer: '9', explanation: 'Four and five together make nine.' },
            { prompt: '6 + 3 = ?', answer: '9', explanation: 'Counting on from 6 by 3 gives 9.' },
          ],
        },
        {
          name: 'Subtracting within 5',
          description: 'Take a small amount away from a small amount.',
          questions: [
            { prompt: '5 - 2 = ?', answer: '3', explanation: 'Starting at 5 and removing 2 leaves 3.' },
            { prompt: '4 - 1 = ?', answer: '3', explanation: 'Four minus one is three.' },
          ],
        },
        {
          name: 'Subtracting within 10',
          description: 'Take away from groups of up to ten.',
          questions: [
            { prompt: '9 - 4 = ?', answer: '5', explanation: 'From 9 remove 4 to get 5.' },
            { prompt: '8 - 3 = ?', answer: '5', explanation: 'From 8 take away 3 to reach 5.' },
          ],
        },
        {
          name: 'Making 10',
          description: 'Find the partner that completes a ten.',
          questions: [
            { prompt: '7 + ? = 10', answer: '3', explanation: '7 needs 3 more to reach 10.' },
            { prompt: '4 + ? = 10', answer: '6', explanation: '4 plus 6 equals 10.' },
          ],
        },
      ],
    },
    {
      name: 'Measurement and geometry',
      description: 'Identify flat and solid shapes and compare objects by length, weight, and capacity.',
      lessons: [
        {
          name: 'Flat (2D) shapes',
          description: 'Name circles, squares, triangles, and rectangles.',
          questions: [
            { prompt: 'How many sides does a triangle have?', answer: '3', explanation: 'A triangle always has three sides.' },
            { prompt: 'A shape with 4 equal sides is a ___.', answer: 'square', explanation: 'A square has 4 equal sides and 4 corners.' },
          ],
        },
        {
          name: 'Solid (3D) shapes',
          description: 'Recognize cubes, spheres, cones, and cylinders.',
          questions: [
            { prompt: 'A ball is shaped like a ___.', answer: 'sphere', explanation: 'A sphere is perfectly round like a ball.' },
            { prompt: 'An ice cream cone is shaped like a ___.', answer: 'cone', explanation: 'A cone has a circle base and a point on top.' },
          ],
        },
        {
          name: 'Comparing length',
          description: 'Decide which object is longer or shorter.',
          questions: [
            { prompt: 'Which is longer: a pencil or a crayon?', answer: 'pencil', explanation: 'Pencils are usually longer than crayons.' },
            { prompt: 'Which is shorter: an ant or a dog?', answer: 'ant', explanation: 'An ant is much smaller than a dog.' },
          ],
        },
        {
          name: 'Comparing weight',
          description: 'Decide which object is heavier or lighter.',
          questions: [
            { prompt: 'Which is heavier: a feather or a rock?', answer: 'rock', explanation: 'Rocks are denser and heavier than feathers.' },
            { prompt: 'Which is lighter: a balloon or a book?', answer: 'balloon', explanation: 'Balloons are filled with air and weigh very little.' },
          ],
        },
        {
          name: 'Comparing capacity',
          description: 'Decide which container holds more or less.',
          questions: [
            { prompt: 'Which holds more water: a bucket or a cup?', answer: 'bucket', explanation: 'A bucket is bigger and holds more.' },
            { prompt: 'Which holds less: a bathtub or a bowl?', answer: 'bowl', explanation: 'A bowl is smaller than a bathtub.' },
          ],
        },
      ],
    },
  ],
};
