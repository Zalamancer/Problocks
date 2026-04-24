import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '1',
  label: '1st Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-1st-grade-math',
  units: [
    {
      name: 'Place value',
      lessons: [
        {
          name: 'Numbers 0 to 120',
          items: [
            { label: 'Number grid', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-numbers-120/v/number-grid' },
            { label: 'Missing numbers between 0 and 120', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-numbers-120/v/numbers-to-120' },
            { label: 'Numbers to 120', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-numbers-120/e/numbers-to-120', question: { prompt: 'Practice: Numbers to 120. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Ones and tens',
          items: [
            { label: 'Intro to place value', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/v/place-value-introduction' },
            { label: 'Place value example: 25', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/v/place-value-example' },
            { label: 'Place value example: 42', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/v/rep-quantity-with-digits' },
            { label: 'Groups of ten objects', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/e/groups-of-tens', question: { prompt: 'Practice: Groups of ten objects. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Tens and ones', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/e/tens-and-ones', question: { prompt: 'Practice: Tens and ones. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: '2-digit place value challenge', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-ones-tens/e/understanding-2-digit-numbers', question: { prompt: 'Write 833 in expanded form (hundreds + tens + ones).', answer: '800 + 30 + 3', explanation: '833 = 8 hundreds + 3 tens + 3 ones.' } },
          ],
        },
        {
          name: 'Comparing 2-digit numbers',
          items: [
            { label: 'Greater than and less than symbols', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-two-digit-compare/v/greater-than-and-less-than-symbols' },
            { label: 'Compare 2-digit numbers', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-two-digit-compare/e/comparing_whole_numbers', question: { prompt: 'Practice: Compare 2-digit numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Compare 2-digit numbers 2', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-place-value/cc-1st-two-digit-compare/e/comparing-two-digit-numbers-1', question: { prompt: 'Practice: Compare 2-digit numbers 2. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
      ],
    },
    {
      name: 'Addition and subtraction',
      lessons: [
        {
          name: 'Relate addition and subtraction',
          items: [
            { label: 'Relating addition and subtraction', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-subtract-10/v/relating-addition-and-subtraction' },
            { label: 'Relate addition and subtraction', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-subtract-10/e/relate-addition-and-subtraction', question: { prompt: 'What is 15 + 7 - 3?', answer: '19', explanation: 'Compute left to right: 15+7=22, then minus 3 = 19.' } },
          ],
        },
        {
          name: 'Addition within 20',
          items: [
            { label: 'Adding 7 + 6', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-20/v/adding-within-20' },
            { label: 'Adding 8 + 7', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-20/v/adding-within-20-example' },
            { label: 'Add within 20', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-20/e/addition_2', question: { prompt: 'What is 11 + 4?', answer: '15', explanation: '11 plus 4 equals 15.' } },
            { label: 'Adding 5 + 3 + 6', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-20/v/adding-3-numbers' },
            { label: 'Add 3 numbers', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-20/e/adding-three-numbers', question: { prompt: 'Practice: Add 3 numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Subtraction within 20',
          items: [
            { label: 'Subtracting 14 - 6', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-sub-20/v/subtracting-within-20' },
            { label: 'Subtract within 20', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-sub-20/e/subtraction_2', question: { prompt: 'What is 17 - 6?', answer: '11', explanation: '17 minus 6 equals 11.' } },
          ],
        },
        {
          name: 'Equal sign',
          items: [
            { label: 'Equal sign', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-equal-sign/v/equal-sign' },
          ],
        },
        {
          name: 'Missing number within 20',
          items: [
            { label: 'Find missing number (add and subtract within 20)', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-missing-number-within-20/e/missing-number-within-20--add-and-subtract-', question: { prompt: 'Fill in the blank: 8, 9, ___, 11.', answer: '10', explanation: 'The numbers go up by 1, so the missing number is 10.' } },
          ],
        },
        {
          name: 'Word problems within 20',
          items: [
            { label: 'Addition and subtraction word problems: superheroes', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-within-20/v/sea-monsters-and-superheroes' },
            { label: 'Addition and subtraction word problems 1', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-within-20/e/addition-and-subtraction-word-problems-within-20--level-1', question: { prompt: 'What is 5 + 8 - 4?', answer: '9', explanation: 'Compute left to right: 5+8=13, then minus 4 = 9.' } },
            { label: 'Addition and subtraction word problems: gorillas', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-within-20/v/exercising-gorillas' },
            { label: 'Addition and subtraction word problems 2', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-within-20/e/addition-and-subtraction-word-problems-within-20--level-2', question: { prompt: 'What is 7 + 7 - 3?', answer: '11', explanation: 'Compute left to right: 7+7=14, then minus 3 = 11.' } },
          ],
        },
        {
          name: 'Word problems with "more" and "fewer"',
          items: [
            { label: 'Comparison word problems: marbles', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-more-fewer-20/v/comparison-word-problems' },
            { label: 'Add and subtract within 20 word problems', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-more-fewer-20/e/addition-and-subtraction-word-problems-within-20--level-3', question: { prompt: 'What is 16 - 7?', answer: '9', explanation: '16 minus 7 equals 9.' } },
            { label: 'Comparison word problems: roly-polies', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-more-fewer-20/v/more-comparison-word-problems' },
            { label: 'Word problems with "more" and "fewer" 2', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-word-problems-more-fewer-20/e/addition-and-subtraction-word-problems-within-20--level-4', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Adding 1s and 10s',
          items: [
            { label: 'Adding 1 vs. adding 10', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/v/comparing-adding-1-and-10' },
            { label: 'Add 1 or 10', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/e/add-within-100--level-1', question: { prompt: 'Practice: Add 1 or 10. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Understanding place value when adding tens', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/v/understanding-place-value-while-adding-tens' },
            { label: 'Understanding place value when adding ones', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/v/understanding-place-value-when-adding-ones' },
            { label: 'Adding 1s and 10s guided practice', type: 'article', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/a/adding-1s-and-10s-practice' },
            { label: 'Add 1s or 10s (no regrouping)', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-ones-tens/e/adding-1s-or-10s-to-two-digit-numbers', question: { prompt: 'Practice: Add 1s or 10s (no regrouping). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Intro to addition with 2-digit numbers',
          items: [
            { label: 'Adding 2-digit numbers without regrouping 1', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/v/adding-two-digit-numbers-no-regrouping' },
            { label: 'Adding 2-digit numbers without regrouping', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/v/adding-two-digit-numbers-without-regrouping' },
            { label: 'Adding up to four 2-digit numbers', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/e/add-within-100--level-2', question: { prompt: 'Practice: Adding up to four 2-digit numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Breaking apart 2-digit addition problems', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/v/breaking-apart-two-digit-addition-problems' },
            { label: 'Break apart 2-digit addition problems', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/e/breaking-apart-two-digit-addition-problems', question: { prompt: 'Practice: Break apart 2-digit addition problems. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Regrouping to add 1-digit number', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/v/regrouping-when-adding-two-digit-and-one-digit-number' },
            { label: 'Adding by making a group of 10', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/v/adding-by-getting-to-group-of-10-first' },
            { label: 'Regroup when adding 1-digit numbers', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-add-subtract/cc-1st-add-two-dig-intro/e/regroup-two-digit-plus-one-digit', question: { prompt: 'Practice: Regroup when adding 1-digit numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
      ],
    },
    {
      name: 'Measurement, data, and geometry',
      lessons: [
        {
          name: 'Length and size',
          items: [
            { label: 'Ordering by length', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/copy-of-cc-early-math-length-intro/v/order-by-length' },
            { label: 'Order by length', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/copy-of-cc-early-math-length-intro/e/order-by-length', question: { prompt: 'Practice: Order by length. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Indirect measurement', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/copy-of-cc-early-math-length-intro/e/indirect-measurement', question: { prompt: 'How many inches in 2 feet?', answer: '24', explanation: '1 foot = 12 inches, so 2 × 12 = 24.' } },
            { label: 'Measuring length: golden statue', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/copy-of-cc-early-math-length-intro/v/basic-measurement' },
            { label: 'Measure lengths 1', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/copy-of-cc-early-math-length-intro/e/measuring-lengths-1', question: { prompt: 'Practice: Measure lengths 1. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Bar graphs',
          items: [
            { label: 'Reading bar graphs: dog bones', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-bar-graphs/v/reading-bar-graph-examples' },
            { label: 'Solve problems with bar graphs 1', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-bar-graphs/e/solving-problems-with-bar-graphs-1', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
          ],
        },
        {
          name: 'Time',
          items: [
            { label: 'Telling time (labeled clock)', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-time/v/telling-time-exercise-example-1' },
            { label: 'Tell time to hour or half hour', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-time/e/tell-time-to-hour-or-half-hour', question: { prompt: 'If it is 3:00 now, what time is it 2 hours later?', answer: '5:00', explanation: 'Add 2 hours: 3+2=5.' } },
          ],
        },
        {
          name: 'Shapes',
          items: [
            { label: 'Cousin Fal\'s shape collection', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-shapes/v/sides-corners' },
            { label: 'Recognizing shapes', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-shapes/v/recognizing-shapes' },
            { label: 'Name shapes 3', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-shapes/e/attributes-of-shapes', question: { prompt: 'Practice: Name shapes 3. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Fractions of shapes',
          items: [
            { label: 'Halves and fourths', type: 'video', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-fractions-of-shapes/v/halves-and-fourths' },
            { label: 'Halves', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-fractions-of-shapes/e/halves-and-fourths', question: { prompt: 'Practice: Halves. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Fourths', type: 'exercise', href: '/math/cc-1st-grade-math/cc-1st-measurement-geometry/cc-1st-fractions-of-shapes/e/fourths', question: { prompt: 'Practice: Fourths. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
      ],
    },
  ],
};
