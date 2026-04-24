import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: 'K',
  label: 'Kindergarten',
  sourceUrl: 'https://www.khanacademy.org/math/cc-kindergarten-math',
  units: [
    {
      name: 'Counting and place value',
      lessons: [
        {
          name: 'Counting small numbers',
          items: [
            { label: 'Counting with small numbers', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-counting/v/counting-with-small-numbers' },
            { label: 'Count with small numbers', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-counting/e/counting-out-1-20-objects', question: { prompt: 'Count: 1, 2, 3, ..., 8. What number comes next?', answer: '9', explanation: 'After 8 comes 9 when counting up by 1.' } },
            { label: 'Counting in order', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-counting/v/counting-in-order' },
            { label: 'Count in order', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-counting/e/counting-objects', question: { prompt: 'Count: 1, 2, 3, ..., 3. What number comes next?', answer: '4', explanation: 'After 3 comes 4 when counting up by 1.' } },
            { label: 'Find 1 more or 1 less than a number', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-counting/e/one-more--one-less', question: { prompt: 'What is 1 more than 5?', answer: '6', explanation: 'Adding 1 to 5 gives 6.' } },
          ],
        },
        {
          name: 'Numbers 0 to 100',
          items: [
            { label: 'Missing numbers', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/e/count-from-any-number', question: { prompt: 'Fill in the blank: 7, 8, ___, 10.', answer: '9', explanation: 'The numbers go up by 1, so the missing number is 9.' } },
            { label: 'Number grid', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/v/number-grid' },
            { label: 'Missing numbers between 0 and 120', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/v/numbers-to-120' },
            { label: 'Numbers to 100', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/e/count-to-100', question: { prompt: 'Practice: Numbers to 100. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Counting by tens', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/v/counting-by-tens-example-problems' },
            { label: 'Count tens', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-numbers-100/e/counting-tens', question: { prompt: 'Skip-count by 10: 10, 20, 30, ..., what comes after 40?', answer: '50', explanation: 'Each step adds 10, so after 40 comes 50.' } },
          ],
        },
        {
          name: 'Counting objects',
          items: [
            { label: 'Counting in pictures', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/v/counting-in-scenes' },
            { label: 'Count in pictures', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/e/counting-in-scenes', question: { prompt: 'There are 7 apples in a bowl. How many apples?', answer: '7', explanation: 'Counting one by one gives 7 apples.' } },
            { label: 'Counting objects 1', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/v/how-many-objects-1' },
            { label: 'Count objects 1', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/e/how-many-objects-1', question: { prompt: 'There are 7 apples in a bowl. How many apples?', answer: '7', explanation: 'Counting one by one gives 7 apples.' } },
            { label: 'Counting objects 2', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/v/counting-objects-2' },
            { label: 'Count objects 2', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-count-object-topic/e/how-many-objects-2', question: { prompt: 'There are 6 apples in a bowl. How many apples?', answer: '6', explanation: 'Counting one by one gives 6 apples.' } },
          ],
        },
        {
          name: 'Comparing small numbers',
          items: [
            { label: 'Comparing numbers of objects', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/v/comparing-groups-through-10-example' },
            { label: 'Compare numbers of objects 1', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/e/compare-groups-through-10', question: { prompt: 'Compare: 49 __ 8 (use >, <, or =).', answer: '>', explanation: '49 is greater than 8, so 49 > 8.' } },
            { label: 'Comparing numbers on the number line', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/v/comparing-numbers-through-10-example' },
            { label: 'Comparing numbers to 10', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/e/comparing-numbers-through-10', question: { prompt: 'Compare: 45 __ 49 (use >, <, or =).', answer: '<', explanation: '45 is less than 49, so 45 < 49.' } },
            { label: 'Counting by category', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/v/count-by-category' },
            { label: 'Compare numbers of objects 2', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-comparing-numbers/e/sort-groups-by-count', question: { prompt: 'Compare: 36 __ 7 (use >, <, or =).', answer: '>', explanation: '36 is greater than 7, so 36 > 7.' } },
          ],
        },
        {
          name: 'Teens',
          items: [
            { label: 'Teens as sums with 10', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-teens/v/teens-and-ten' },
            { label: 'Teen numbers: monkeys', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-teens/v/monkeys-for-party' },
            { label: 'Teen numbers', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-counting/kindergarten-teens/e/teen-numbers-1', question: { prompt: 'What does 17 equal as 10 + ones?', answer: '10 + 7', explanation: '17 is 1 ten and 7 ones, so 10 + 7 = 17.' } },
          ],
        },
      ],
    },
    {
      name: 'Addition and subtraction',
      lessons: [
        {
          name: 'What is addition? What is subtraction?',
          items: [
            { label: 'Intro to addition', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-intro/v/addition-introduction' },
            { label: 'Add within 5', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-intro/e/addition_1', question: { prompt: 'What is 0 + 0?', answer: '0', explanation: '0 plus 0 equals 0.' } },
            { label: 'Intro to subtraction', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-intro/v/subtraction-introduction' },
            { label: 'Subtract within 5', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-intro/e/subtraction_1', question: { prompt: 'What is 3 - 1?', answer: '2', explanation: '3 minus 1 equals 2.' } },
          ],
        },
        {
          name: 'Making small numbers',
          items: [
            { label: 'Making 5', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-make-10/v/making-5' },
            { label: 'Making small numbers in different ways', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-make-10/e/making-totals-in-different-ways-within-10', question: { prompt: 'Practice: Making small numbers in different ways. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Making 10',
          items: [
            { label: 'Getting to 10 by filling boxes', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-making-5-9/v/getting-to-10-by-filling-boxes' },
            { label: 'Make 10 (grids and number bonds)', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-making-5-9/e/making-ten', question: { prompt: 'What number plus 4 makes 10?', answer: '6', explanation: '10 - 4 = 6, so 4 + 6 = 10.' } },
            { label: 'Adding to 10', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-making-5-9/v/adding-to-10-example' },
            { label: 'Make 10', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-making-5-9/e/making-ten-2', question: { prompt: 'What number plus 9 makes 10?', answer: '1', explanation: '10 - 9 = 1, so 9 + 1 = 10.' } },
          ],
        },
        {
          name: 'Put together, take apart',
          items: [
            { label: 'Add and subtract: pieces of fruit', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-together-apart/v/adding-fruit' },
            { label: 'Addition and subtraction within 10', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-together-apart/v/addition-and-subtraction-within-10' },
            { label: 'Add within 10', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-together-apart/e/put-together', question: { prompt: 'What is 5 + 1?', answer: '6', explanation: '5 plus 1 equals 6.' } },
            { label: 'Subtract within 10', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-together-apart/e/take-apart', question: { prompt: 'What is 9 - 4?', answer: '5', explanation: '9 minus 4 equals 5.' } },
          ],
        },
        {
          name: 'Addition and subtraction word problems',
          items: [
            { label: 'Addition word problems within 10', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-word-problem-within-10/v/addition-word-problems-within-10' },
            { label: 'Subtraction word problems within 10', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-add-subtract/kindergarten-add-sub-word-problem-within-10/v/subtraction-word-problems-within-10' },
          ],
        },
      ],
    },
    {
      name: 'Measurement and geometry',
      lessons: [
        {
          name: 'Comparing size',
          items: [
            { label: 'Compare size', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-compare-size/e/which-has-more-', question: { prompt: 'Practice: Compare size. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Compare length', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-compare-size/e/compare-length', question: { prompt: 'Practice: Compare length. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Basic shapes',
          items: [
            { label: 'Cousin Fal\'s shape collection', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-shapes/v/sides-corners' },
            { label: 'Recognizing shapes', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-shapes/v/recognizing-shapes' },
            { label: 'Name shapes 1', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-shapes/e/naming-shapes', question: { prompt: 'Practice: Name shapes 1. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Name shapes 2', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-shapes/e/naming-shapes-2', question: { prompt: 'Practice: Name shapes 2. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Comparing shapes',
          items: [
            { label: 'Relative position', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-compare-shapes/v/relative-position' },
            { label: 'Compare shapes', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-compare-shapes/e/compare-shapes', question: { prompt: 'Practice: Compare shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Composing shapes',
          items: [
            { label: 'Composing shapes', type: 'video', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-composing-shapes/v/compose-shapes' },
            { label: 'Compose shapes', type: 'exercise', href: '/math/cc-kindergarten-math/cc-kindergarten-geometry/kindergarten-composing-shapes/e/compose-shapes', question: { prompt: 'Practice: Compose shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
      ],
    },
  ],
};
