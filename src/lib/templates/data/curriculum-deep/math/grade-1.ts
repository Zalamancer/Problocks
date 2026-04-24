import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '1',
  label: '1st Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-1st-grade-math',
  units: [
    {
      name: 'Place value',
      description: 'Understand tens and ones and compare two-digit numbers up to 120.',
      lessons: [
        {
          name: 'Counting to 120',
          description: 'Extend counting by ones up to one hundred twenty.',
          questions: [
            { prompt: 'What number comes after 99?', answer: '100', explanation: 'After 99 comes 100, one hundred.' },
            { prompt: 'Count: 118, 119, ___. What is next?', answer: '120', explanation: '120 follows 119 in the sequence.' },
          ],
        },
        {
          name: 'Tens and ones',
          description: 'Break two-digit numbers into tens plus ones.',
          questions: [
            { prompt: '47 is how many tens and ones?', answer: '4 tens and 7 ones', explanation: '47 has 4 groups of ten and 7 leftover ones.' },
            { prompt: '30 + 5 = ?', answer: '35', explanation: '3 tens and 5 ones together make 35.' },
          ],
        },
        {
          name: 'Comparing two-digit numbers',
          description: 'Use tens and ones to compare numbers.',
          questions: [
            { prompt: 'Which is greater: 53 or 35?', answer: '53', explanation: '53 has 5 tens but 35 only has 3 tens.' },
            { prompt: 'Which is less: 42 or 48?', answer: '42', explanation: 'Both have 4 tens but 42 has fewer ones.' },
          ],
        },
        {
          name: '10 more and 10 less',
          description: 'Mentally add or subtract ten from any two-digit number.',
          questions: [
            { prompt: 'What is 10 more than 34?', answer: '44', explanation: 'Adding one ten increases the tens digit by 1.' },
            { prompt: 'What is 10 less than 67?', answer: '57', explanation: 'Take one ten away to get 57.' },
          ],
        },
        {
          name: 'Skip counting by 10s',
          description: 'Count forward by ten starting at any ten.',
          questions: [
            { prompt: '20, 30, 40, ___. What is next?', answer: '50', explanation: 'Adding 10 each time gives 50.' },
            { prompt: '60, 70, 80, ___?', answer: '90', explanation: '80 + 10 = 90.' },
          ],
        },
      ],
    },
    {
      name: 'Addition and subtraction',
      description: 'Add and subtract within 20 using strategies and solve word problems.',
      lessons: [
        {
          name: 'Adding within 20',
          description: 'Add two numbers whose total is twenty or less.',
          questions: [
            { prompt: '8 + 7 = ?', answer: '15', explanation: '8 plus 7 is 15 using make-a-ten strategy.' },
            { prompt: '9 + 6 = ?', answer: '15', explanation: '9 + 1 is 10, plus 5 more is 15.' },
          ],
        },
        {
          name: 'Subtracting within 20',
          description: 'Take away from numbers up to twenty.',
          questions: [
            { prompt: '14 - 6 = ?', answer: '8', explanation: 'Counting down from 14 by 6 lands on 8.' },
            { prompt: '17 - 9 = ?', answer: '8', explanation: '17 - 9 = 8 using the counting-up strategy.' },
          ],
        },
        {
          name: 'Word problems',
          description: 'Solve story problems using addition or subtraction.',
          questions: [
            { prompt: 'Sam has 5 toys. He gets 3 more. How many total?', answer: '8', explanation: '5 + 3 = 8 toys.' },
            { prompt: 'There are 12 birds. 4 fly away. How many left?', answer: '8', explanation: '12 - 4 = 8 birds remain.' },
          ],
        },
        {
          name: 'Making ten to add',
          description: 'Break one addend to make a ten first.',
          questions: [
            { prompt: '8 + 5 using make-a-ten: 8 + 2 + ___ = ?', answer: '13', explanation: '8 + 2 = 10, plus 3 more is 13.' },
            { prompt: '7 + 6 = ?', answer: '13', explanation: '7 + 3 = 10, plus 3 more = 13.' },
          ],
        },
        {
          name: 'Fact families',
          description: 'Relate addition and subtraction with the same three numbers.',
          questions: [
            { prompt: 'If 6 + 4 = 10, what is 10 - 4?', answer: '6', explanation: 'Subtraction undoes addition in fact families.' },
            { prompt: 'If 9 + 2 = 11, then 11 - 9 = ?', answer: '2', explanation: '11 - 9 = 2 because 9 + 2 = 11.' },
          ],
        },
      ],
    },
    {
      name: 'Measurement, data, and geometry',
      description: 'Measure lengths, tell time to the hour, and compose and decompose 2D and 3D shapes.',
      lessons: [
        {
          name: 'Measuring length with units',
          description: 'Use same-size objects to measure length.',
          questions: [
            { prompt: 'A pencil is 6 paper clips long. What is its length?', answer: '6 paper clips', explanation: 'Length equals the number of units used.' },
            { prompt: 'If a book is 10 cubes long and a ruler is 12 cubes, which is longer?', answer: 'ruler', explanation: '12 is more than 10.' },
          ],
        },
        {
          name: 'Telling time to the hour',
          description: 'Read analog and digital clocks at the hour.',
          questions: [
            { prompt: 'The hour hand points to 3 and the minute to 12. What time?', answer: '3:00', explanation: 'Minute hand on 12 means o\'clock.' },
            { prompt: 'What comes after 5:00?', answer: '6:00', explanation: 'One hour after 5:00 is 6:00.' },
          ],
        },
        {
          name: 'Telling time to the half hour',
          description: 'Read clocks showing thirty minutes past.',
          questions: [
            { prompt: 'Minute hand on 6, hour hand between 4 and 5. What time?', answer: '4:30', explanation: 'Minute hand on 6 means 30 minutes past 4.' },
            { prompt: 'What is half an hour after 2:00?', answer: '2:30', explanation: 'Half an hour is 30 minutes.' },
          ],
        },
        {
          name: 'Composing 2D shapes',
          description: 'Build new shapes using smaller shapes.',
          questions: [
            { prompt: 'Two triangles put together can make a ___.', answer: 'square', explanation: 'Two right triangles form a square.' },
            { prompt: 'How many triangles make a hexagon (using equal triangles)?', answer: '6', explanation: 'Six equal triangles fit into a regular hexagon.' },
          ],
        },
        {
          name: '3D shapes',
          description: 'Identify cubes, cones, cylinders, and spheres.',
          questions: [
            { prompt: 'A soda can is shaped like a ___.', answer: 'cylinder', explanation: 'A cylinder has two circle ends and a curved side.' },
            { prompt: 'How many faces does a cube have?', answer: '6', explanation: 'A cube has 6 equal square faces.' },
          ],
        },
      ],
    },
  ],
};
