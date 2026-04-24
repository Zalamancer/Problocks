import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '3',
  label: '3rd Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-third-grade-math',
  units: [
    {
      name: 'Intro to multiplication',
      lessons: [
        {
          name: 'Multiplication as equal groups',
          items: [
            { label: 'Equal groups', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-multiplication-intro/v/skip-counting-equal-groups' },
            { label: 'Introduction to multiplication', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-multiplication-intro/v/introduction-to-multiplication' },
            { label: 'Understand equal groups as multiplication', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-multiplication-intro/e/understand-equal-groups-as-multiplication', question: { prompt: 'Practice: Understand equal groups as multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplication as repeated addition', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-multiplication-intro/v/multiplication-as-repeated-addition' },
            { label: 'Relate repeated addition to multiplication', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-multiplication-intro/e/relate-repeated-addition-to-multiplication', question: { prompt: 'Practice: Relate repeated addition to multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplication on the number line',
          items: [
            { label: 'Multiplication on the number line', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-on-thnumber-line/v/multiplication-on-the-number-line' },
            { label: 'Represent multiplication on the number line', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-on-thnumber-line/e/number_line', question: { prompt: 'Practice: Represent multiplication on the number line. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplication as groups of objects',
          items: [
            { label: 'Multiplication as equal groups', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/multiply-with-groups-of-objects/v/multiplication-intro' },
            { label: 'Understand multiplication using groups of objects', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiply-with-groups-of-objects/e/meaning-of-multiplication', question: { prompt: 'Practice: Understand multiplication using groups of objects. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiply using groups of objects', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiply-with-groups-of-objects/e/multiply-using-groups-of-objects', question: { prompt: 'Practice: Multiply using groups of objects. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'More ways to multiply', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/multiply-with-groups-of-objects/v/more-on-the-concept-of-multiplication' },
          ],
        },
        {
          name: 'Multiplication with arrays',
          items: [
            { label: 'Multiplication with arrays', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-with-arrays/v/multiplication-as-groups-of-objects' },
            { label: 'Understand multiplication with arrays', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-with-arrays/e/understand-multiplication-with-arrays', question: { prompt: 'Practice: Understand multiplication with arrays. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiply with arrays', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-with-arrays/e/multiplying-with-arrays', question: { prompt: 'Practice: Multiply with arrays. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplication in contexts',
          items: [
            { label: 'Multiplication in real world contexts', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-in-contexts/v/when-to-use-multiplication' },
            { label: 'Multiplication in contexts', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/multiplication-in-contexts/e/multiplication-in-contexts', question: { prompt: 'Practice: Multiplication in contexts. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Commutative property of multiplication',
          items: [
            { label: 'Commutative property of multiplication', type: 'video', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-properties-of-multiplication/v/order-when-multiplying-commutative-property-of-multiplication' },
            { label: 'Represent the commutative property of multiplication', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-properties-of-multiplication/e/represent-the-commutative-property-of-multiplication', question: { prompt: 'Practice: Represent the commutative property of multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Understand the commutative property of multiplication', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-properties-of-multiplication/e/understand-the-commutative-property-of-multiplication', question: { prompt: 'Practice: Understand the commutative property of multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intro to multiplication: FAQ', type: 'article', href: '/math/cc-third-grade-math/intro-to-multiplication/imp-properties-of-multiplication/a/intro-to-multiplication-faq' },
          ],
        },
      ],
    },
    {
      name: '1-digit multiplication',
      lessons: [
        {
          name: 'Multiply by 0 or 1',
          items: [
            { label: 'Multiply by 0 or 1', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/imp-multiplication-facts/e/multiplying-by-0-or-1', question: { prompt: 'What is 0 × 6?', answer: '0', explanation: '0 times 6 equals 0.' } },
          ],
        },
        {
          name: 'Multiply by 2 or 4',
          items: [
            { label: 'Multiply by 2', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-2-or-4/e/multiplying-by-2', question: { prompt: 'What is 2 × 3?', answer: '6', explanation: '2 times 3 equals 6.' } },
            { label: 'Multiply by 4', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-2-or-4/e/multiplying-by-4', question: { prompt: 'What is 4 × 5?', answer: '20', explanation: '4 times 5 equals 20.' } },
            { label: 'Multiply by 2 and 4', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-2-or-4/e/multiply-by-2-and-4', question: { prompt: 'What is 2 × 3?', answer: '6', explanation: '2 times 3 equals 6.' } },
          ],
        },
        {
          name: 'Multiply by 5 or 10',
          items: [
            { label: 'Multiply by 5', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-5-or-10/e/multiplying-by-5', question: { prompt: 'What is 5 × 8?', answer: '40', explanation: '5 times 8 equals 40.' } },
            { label: 'Multiply by 10', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-5-or-10/e/multiply-by-10', question: { prompt: 'What is 10 × 6?', answer: '60', explanation: '10 times 6 equals 60.' } },
            { label: 'Multiply by 5 and 10', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-5-or-10/e/multiply-by-5-and-10', question: { prompt: 'What is 5 × 9?', answer: '45', explanation: '5 times 9 equals 45.' } },
          ],
        },
        {
          name: 'Multiply by 3 or 6',
          items: [
            { label: 'Multiply by 3', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-3-or-6/e/multiplying-by-3', question: { prompt: 'What is 3 × 7?', answer: '21', explanation: '3 times 7 equals 21.' } },
            { label: 'Multiply by 6', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-3-or-6/e/multiplying-by-6', question: { prompt: 'What is 6 × 4?', answer: '24', explanation: '6 times 4 equals 24.' } },
            { label: 'Multiply by 3 and 6', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-3-or-6/e/multiply-by-3-and-6', question: { prompt: 'What is 3 × 7?', answer: '21', explanation: '3 times 7 equals 21.' } },
          ],
        },
        {
          name: 'Distributive property',
          items: [
            { label: 'Distributive property when multiplying', type: 'video', href: '/math/cc-third-grade-math/3rd-basic-multiplication/distributive-property/v/using-the-distributive-property-when-multiplying' },
            { label: 'Properties and patterns for multiplication', type: 'video', href: '/math/cc-third-grade-math/3rd-basic-multiplication/distributive-property/v/properties-and-patterns-for-multiplication' },
            { label: 'Visualize distributive property', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/distributive-property/e/visualize-distributive-property', question: { prompt: 'Practice: Visualize distributive property. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Distributive property', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/distributive-property/e/distributive-property-of-multiplication-', question: { prompt: 'Practice: Distributive property. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiply by 7, 8, or 9',
          items: [
            { label: 'Multiply by 7', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-7-8-or-9/e/multiplying-by-7', question: { prompt: 'What is 7 × 7?', answer: '49', explanation: '7 times 7 equals 49.' } },
            { label: 'Multiply by 8', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-7-8-or-9/e/multiplying-by-8', question: { prompt: 'What is 8 × 5?', answer: '40', explanation: '8 times 5 equals 40.' } },
            { label: 'Multiply by 9', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/multiply-by-7-8-or-9/e/multiplying-by-9', question: { prompt: 'What is 9 × 6?', answer: '54', explanation: '9 times 6 equals 54.' } },
          ],
        },
        {
          name: '1-digit multiplication',
          items: [
            { label: 'Basic multiplication', type: 'exercise', href: '/math/cc-third-grade-math/3rd-basic-multiplication/basic-multiplication/e/multiplication_0.5', question: { prompt: 'What is 3 × 4?', answer: '12', explanation: '3 × 4 = 12.' } },
            { label: '1-digit multiplication: FAQ', type: 'article', href: '/math/cc-third-grade-math/3rd-basic-multiplication/basic-multiplication/a/1-digit-multiplication-faq' },
          ],
        },
      ],
    },
    {
      name: 'Addition, subtraction, and estimation',
      lessons: [
        {
          name: 'Rounding to nearest 10 or 100',
          items: [
            { label: 'Rounding to the nearest 10 on the number line', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/v/rounding-to-the-nearest-10-number-line' },
            { label: 'Rounding to the nearest 100 on the number line', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/v/rounding-to-the-nearest-100-number-line' },
            { label: 'Round to nearest 10 or 100 on the number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/e/rounding-to-the-nearest-10-or-100-on-the-number-line', question: { prompt: 'Round 669 to the nearest 10.', answer: '670', explanation: '669 rounds to 670 based on the ones digit.' } },
            { label: 'Rounding to nearest 10 and 100', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/v/examples-rounding-to-the-nearest-10-and-100' },
            { label: 'Round to nearest 10 or 100', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/e/rounding-to-the-nearest-ten-or-hundred', question: { prompt: 'Round 869 to the nearest 10.', answer: '870', explanation: '869 rounds to 870 based on the ones digit.' } },
            { label: 'Round to nearest 10 or 100 challenge', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-rounding/e/rounding-challenge', question: { prompt: 'Round 373 to the nearest 10.', answer: '370', explanation: '373 rounds to 370 based on the ones digit.' } },
          ],
        },
        {
          name: 'Estimate to add multi-digit numbers',
          items: [
            { label: 'Estimating when adding multi-digit numbers', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/estimate-to-add-multi-digit-numbers/v/estimating-adding-large-numbers-by-rounding' },
            { label: 'Estimate to add multi-digit whole numbers', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/estimate-to-add-multi-digit-numbers/e/estimate-to-add-multi-digit-whole-numbers-', question: { prompt: 'Practice: Estimate to add multi-digit whole numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Strategies for adding two and three-digit numbers',
          items: [
            { label: 'Breaking apart 3-digit addition problems', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/v/breaking-apart-three-digit-addition-problems' },
            { label: 'Break apart 3-digit addition problems', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/e/break-apart-three-dig-add', question: { prompt: 'What is 183 + 336?', answer: '519', explanation: 'Add column by column: 183 + 336 = 519.' } },
            { label: 'Addition using groups of 10 and 100', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/v/addition-using-groups-of-10-and-100' },
            { label: 'Add using groups of 10 and 100', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/e/making-100-and-1000', question: { prompt: 'Practice: Add using groups of 10 and 100. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding and subtracting on number line', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/v/exercise-for-numberline-addition-and-subtraction' },
            { label: 'Add on a number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/e/adding-and-subtracting-within-1000-using-a-number-line', question: { prompt: 'Practice: Add on a number line. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Select strategies for adding within 1000', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-strategies-for-adding-two-and-three-digit-numbers/e/select-strategies-for-adding-within-1000', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
          ],
        },
        {
          name: 'Adding with regrouping within 1000',
          items: [
            { label: 'Using place value to add 3-digit numbers: part 1', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-adding-with-regrouping-within-1000/v/carrying-when-adding-three-digit-numbers' },
            { label: 'Using place value to add 3-digit numbers: part 2', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-adding-with-regrouping-within-1000/v/why-carrying-works' },
            { label: 'Adding 3-digit numbers', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-adding-with-regrouping-within-1000/v/example-adding-with-carrying' },
            { label: 'Add within 1000', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-adding-with-regrouping-within-1000/e/addition_4', question: { prompt: 'What is 4 + 3?', answer: '7', explanation: '4 plus 3 equals 7.' } },
          ],
        },
        {
          name: 'Estimate to subtract multi-digit numbers',
          items: [
            { label: 'Estimating when subtracting large numbers', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/estimate-to-subtract-multi-digit-numbers/v/estimating-when-subtracting-large-numbers' },
            { label: 'Estimate to subtract multi-digit whole numbers', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/estimate-to-subtract-multi-digit-numbers/e/estimate-to-subtract-multi-digit-whole-numbers', question: { prompt: 'Practice: Estimate to subtract multi-digit whole numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Strategies for subtracting two and three-digit numbers',
          items: [
            { label: 'Subtraction by breaking apart', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/v/subtraction-by-breaking-apart' },
            { label: 'Break apart 3-digit subtraction problems', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/e/break-apart-3-digit-subtraction-problems', question: { prompt: 'What is 873 - 263?', answer: '610', explanation: '873 - 263 = 610 (column subtraction).' } },
            { label: 'Adding and subtracting on number line', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/v/exercise-for-numberline-addition-and-subtraction' },
            { label: 'Subtract on a number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/e/subtract-on-a-number-line', question: { prompt: 'Practice: Subtract on a number line. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Methods for subtracting 3-digit numbers', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/v/methods-for-subtracting-3-digit-numbers' },
            { label: 'Select strategies for subtracting within 1000', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/strategies-for-subtracting-two-and-three-digit-numbers/e/select-strategies-for-subtracting-within-1000', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
          ],
        },
        {
          name: 'Subtracting with regrouping within 1000',
          items: [
            { label: 'Worked example: Subtracting 3-digit numbers (regrouping)', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-subtracting-with-regrouping-within-1000/v/basic-regrouping-or-borrowing-when-subtracting-three-digit-numbers' },
            { label: 'Subtracting 3-digit numbers (regrouping)', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-subtracting-with-regrouping-within-1000/v/regrouping-when-subtracting-three-digit-numbers' },
            { label: 'Worked example: Subtracting 3-digit numbers (regrouping twice)', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-subtracting-with-regrouping-within-1000/v/regrouping-twice-when-subtracting-three-digit-numbers' },
            { label: 'Worked example: Subtracting 3-digit numbers (regrouping from 0)', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-subtracting-with-regrouping-within-1000/v/regrouping-from-0-when-subtracting-three-digit-numbers' },
            { label: 'Subtract within 1000', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-subtracting-with-regrouping-within-1000/e/subtraction_4', question: { prompt: 'What is 10 - 9?', answer: '1', explanation: '10 minus 9 equals 1.' } },
          ],
        },
        {
          name: 'Addition and subtraction missing value problems',
          items: [
            { label: 'Missing number for 3-digit addition within 1000', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-addition-and-subtraction-missing-value-problems/v/missing-number-for-addition-and-subtraction-within-1000' },
            { label: 'Missing number for 3-digit subtraction within 1000', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-addition-and-subtraction-missing-value-problems/v/missing-numbers-in-three-digit-subtraction' },
            { label: 'Find the missing number (add and subtract within 1000)', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/imp-addition-and-subtraction-missing-value-problems/e/find-the-missing-number--addition-and-subtraction-within-1000-', question: { prompt: 'Fill in the blank: 3, 4, ___, 6.', answer: '5', explanation: 'The numbers go up by 1, so the missing number is 5.' } },
          ],
        },
        {
          name: 'Addition and subtraction word problems',
          items: [
            { label: 'Three digit addition word problems', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/addition-and-subtraction-word-problems/v/three-digit-addition-word-problems' },
            { label: 'Three digit subtraction word problems', type: 'video', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/addition-and-subtraction-word-problems/v/three-digit-subtraction-word-problems' },
            { label: 'Add and subtract within 1000 word problems', type: 'exercise', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/addition-and-subtraction-word-problems/e/add-and-subtract-within-1000-word-problems', question: { prompt: 'What is 10 - 6?', answer: '4', explanation: '10 minus 6 equals 4.' } },
            { label: 'Addition, subtraction, and estimation: FAQ', type: 'article', href: '/math/cc-third-grade-math/imp-addition-and-subtraction/addition-and-subtraction-word-problems/a/addition-subtraction-and-estimation-faq' },
          ],
        },
      ],
    },
    {
      name: 'Intro to division',
      lessons: [
        {
          name: 'Division intro',
          items: [
            { label: 'Division as equal groups', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/imp-division-intro/v/division-as-equal-groupings' },
            { label: 'Division with groups of objects', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-division-intro/e/meaning-of-division', question: { prompt: 'Practice: Division with groups of objects. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Visualizing division with arrays', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/imp-division-intro/v/visualizing-division-with-arrays' },
            { label: 'Division with arrays', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-division-intro/e/division-with-arrays', question: { prompt: 'Practice: Division with arrays. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Divide with visuals', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-division-intro/e/dividing-with-visuals', question: { prompt: 'Practice: Divide with visuals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Division in contexts',
          items: [
            { label: 'Division in context', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/division-in-contexts/v/division-in-context-examples' },
            { label: 'Division in contexts', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/division-in-contexts/e/division-in-contexts', question: { prompt: 'Practice: Division in contexts. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Relating multiplication and division',
          items: [
            { label: 'Relating division to multiplication', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/v/examples-relating-multiplication-to-division' },
            { label: 'Relate division to multiplication', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/e/relate-division-to-multiplication', question: { prompt: 'Practice: Relate division to multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Relate multiplication and division equations', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/e/find-missing-value-in-related-multiplication-and-division-equations', question: { prompt: 'Practice: Relate multiplication and division equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Fact families', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/e/fact-families', question: { prompt: 'Practice: Fact families. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplication word problem: parking lot', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/v/how-many-cars-can-fit-in-the-parking-lot' },
            { label: 'Division word problem: school building', type: 'video', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/v/average-height-of-a-building-s-floor' },
            { label: 'Relate division to multiplication word problems', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-relating-multiplication-and-division/e/relate-division-to-multiplication-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Divide by 1, 2, or 4',
          items: [
            { label: 'Divide by 1', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-1-2-or-4/e/dividing-by-1', question: { prompt: 'What is 10 ÷ 2?', answer: '5', explanation: '10 ÷ 2 = 5 because 2 × 5 = 10.' } },
            { label: 'Divide by 2', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-1-2-or-4/e/dividing-by-2', question: { prompt: 'What is 14 ÷ 2?', answer: '7', explanation: '14 ÷ 2 = 7 because 2 × 7 = 14.' } },
            { label: 'Divide by 4', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-1-2-or-4/e/dividing-by-4', question: { prompt: 'What is 48 ÷ 8?', answer: '6', explanation: '48 ÷ 8 = 6 because 8 × 6 = 48.' } },
          ],
        },
        {
          name: 'Divide by 5 or 10',
          items: [
            { label: 'Divide by 5', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-5-or-10/e/dividing-by-5', question: { prompt: 'What is 15 ÷ 3?', answer: '5', explanation: '15 ÷ 3 = 5 because 3 × 5 = 15.' } },
            { label: 'Divide by 10', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-5-or-10/e/dividing-by-10', question: { prompt: 'What is 35 ÷ 7?', answer: '5', explanation: '35 ÷ 7 = 5 because 7 × 5 = 35.' } },
          ],
        },
        {
          name: 'Divide by 3 or 6',
          items: [
            { label: 'Divide by 3', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-3-or-6/e/dividing-by-3', question: { prompt: 'What is 72 ÷ 9?', answer: '8', explanation: '72 ÷ 9 = 8 because 9 × 8 = 72.' } },
            { label: 'Divide by 6', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-3-or-6/e/dividing-by-6', question: { prompt: 'What is 36 ÷ 9?', answer: '4', explanation: '36 ÷ 9 = 4 because 9 × 4 = 36.' } },
          ],
        },
        {
          name: 'Divide by 7, 8, or 9',
          items: [
            { label: 'Divide by 7', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-7-8-or-9/e/dividing-by-7', question: { prompt: 'What is 24 ÷ 6?', answer: '4', explanation: '24 ÷ 6 = 4 because 6 × 4 = 24.' } },
            { label: 'Divide by 8', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-7-8-or-9/e/dividing-by-8', question: { prompt: 'What is 30 ÷ 5?', answer: '6', explanation: '30 ÷ 5 = 6 because 5 × 6 = 30.' } },
            { label: 'Divide by 9', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/divide-by-7-8-or-9/e/dividing-by-9', question: { prompt: 'What is 64 ÷ 8?', answer: '8', explanation: '64 ÷ 8 = 8 because 8 × 8 = 64.' } },
          ],
        },
        {
          name: '1-digit division',
          items: [
            { label: 'Basic division', type: 'exercise', href: '/math/cc-third-grade-math/intro-to-division/imp-division-facts/e/division_0.5', question: { prompt: 'What is 35 ÷ 7?', answer: '5', explanation: '35 ÷ 7 = 5 because 7 × 5 = 35.' } },
            { label: 'Intro to division: FAQ', type: 'article', href: '/math/cc-third-grade-math/intro-to-division/imp-division-facts/a/intro-to-division-faq' },
          ],
        },
      ],
    },
    {
      name: 'Understand fractions',
      lessons: [
        {
          name: 'Fractions intro',
          items: [
            { label: 'Intro to fractions', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-intro/v/fraction-basics' },
            { label: 'Cutting shapes into equal parts', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-intro/v/cutting-shapes-into-equal-parts' },
            { label: 'Cut shapes into equal parts', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-intro/e/that-s-not-fair-', question: { prompt: 'Practice: Cut shapes into equal parts. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Identifying unit fractions word problem', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-intro/v/identifying-unit-fractions-word-problem-math-3rd-grade-khan-academy' },
            { label: 'Identify unit fractions', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-intro/e/cutting-shapes-into-equal-parts', question: { prompt: 'Practice: Identify unit fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Fractions in contexts',
          items: [
            { label: 'Fractions in contexts', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/fractions-in-contexts/v/fractions-in-context' },
          ],
        },
        {
          name: 'What fractions mean',
          items: [
            { label: 'Identifying numerators and denominators', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-what-fractions-mean/v/numerator-and-denominator-of-a-fraction' },
            { label: 'Recognizing fractions', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-what-fractions-mean/v/more-than-one-equal-section' },
            { label: 'Recognize fractions', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-what-fractions-mean/e/recognizing_fractions_0.5', question: { prompt: 'Practice: Recognize fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Recognizing fractions greater than 1', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-what-fractions-mean/v/recognizing-fractions-greater-than-1-math-3rd-grade-khan-academy' },
            { label: 'Recognize fractions greater than 1', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-what-fractions-mean/e/fractions-greater-than-one', question: { prompt: 'Practice: Recognize fractions greater than 1. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Fractions on the number line',
          items: [
            { label: 'Relating number lines to fraction bars', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/relating-number-lines-to-fraction-bars' },
            { label: 'Relate number lines to fraction bars', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/e/relate-number-lines-to-fraction-bars', question: { prompt: 'On a number line from 0 to 1, where is 3/4?', answer: '3/4 of the way from 0 to 1', explanation: 'Divide the line into 4 equal parts; 3/4 is at the third mark.' } },
            { label: 'Fractions on a number line', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/fractions-on-a-number-line' },
            { label: 'Fractions on number line widget', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/fractions-on-number-line-widget' },
            { label: 'Unit fractions on the number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/e/fractions_on_the_number_line_2', question: { prompt: 'On a number line from 0 to 1, where is 3/4?', answer: '3/4 of the way from 0 to 1', explanation: 'Divide the line into 4 equal parts; 3/4 is at the third mark.' } },
            { label: 'Fractions on the number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/e/fractions_on_the_number_line_1', question: { prompt: 'On a number line from 0 to 1, where is 3/4?', answer: '3/4 of the way from 0 to 1', explanation: 'Divide the line into 4 equal parts; 3/4 is at the third mark.' } },
            { label: 'Finding 1 on the number line', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/finding-1-on-the-number-line' },
            { label: 'Find 1 on the number line', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/e/finding-1-on-the-number-line', question: { prompt: 'Practice: Find 1 on the number line. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Fractions greater than 1 on the number line', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/fractions-greater-than-1-on-the-number-line' },
          ],
        },
        {
          name: 'Fractions and whole numbers',
          items: [
            { label: 'Representing 1 as a fraction', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/v/different-ways-to-represent-1-as-a-fraction' },
            { label: 'Relating fractions to 1', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/v/relating-fractions-to-1' },
            { label: 'Relate fractions to 1', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/e/relate-fractions-to-1', question: { prompt: 'Practice: Relate fractions to 1. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Whole numbers as fractions', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/v/whole-numbers-as-fractions' },
            { label: 'Writing whole numbers as fractions', type: 'video', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/v/writing-whole-numbers-as-fractions' },
            { label: 'Write whole numbers as fractions', type: 'exercise', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/e/writing-fractions-as-whole-numbers', question: { prompt: 'Practice: Write whole numbers as fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Understand fractions: FAQ', type: 'article', href: '/math/cc-third-grade-math/imp-fractions/imp-fractions-and-whole-numbers/a/understand-fractions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Equivalent fractions and comparing fractions',
      lessons: [
        {
          name: 'Comparing fractions',
          items: [
            { label: 'Comparing fractions with > and < symbols', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/v/comparing-fractions-with-greater-than-and-less-than-symbols' },
            { label: 'Comparing fractions visually', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/v/comparing-fractions-visually-and-on-number-line' },
            { label: 'Compare fractions with fraction models', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/e/comparing-fractions-with-the-same-numerator-or-denominator', question: { prompt: 'Which is greater: 3/4 or 1/2?', answer: '3/4', explanation: '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.' } },
            { label: 'Compare fractions on the number line', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/e/compare-fractions-on-the-number-line', question: { prompt: 'Which is greater: 3/4 or 1/2?', answer: '3/4', explanation: '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.' } },
            { label: 'Comparing fractions with the same denominator', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/v/comparing-fractions-with-the-same-denominator-math-3rd-grade-khan-academy' },
            { label: 'Compare fractions with the same denominator', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/e/comparing_fractions_with_the_same_denominator', question: { prompt: 'Which is greater: 3/4 or 1/2?', answer: '3/4', explanation: '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.' } },
            { label: 'Comparing unit fractions', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/v/comparing-unit-fractions' },
            { label: 'Comparing fractions with the same numerator', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/v/comparing-fractions-with-same-numerator-math-3rd-grade-khan-academy' },
            { label: 'Compare fractions with the same numerator', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/e/comparing_fractions_with_the_same_numerator', question: { prompt: 'Which is greater: 3/4 or 1/2?', answer: '3/4', explanation: '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.' } },
            { label: 'Compare fractions with the same numerator or denominator', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions/e/comparing_fractions_1', question: { prompt: 'Which is greater: 3/4 or 1/2?', answer: '3/4', explanation: '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.' } },
          ],
        },
        {
          name: 'Comparing fractions of different wholes',
          items: [
            { label: 'Comparing fractions of different wholes 1', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions-of-different-wholes/v/comparing-fractions-of-different-wholes' },
            { label: 'Comparing fractions of different wholes', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions-of-different-wholes/v/comparing-fractions-different-wholes' },
            { label: 'Fractions of different wholes', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-comparing-fractions-of-different-wholes/e/naming-the-whole', question: { prompt: 'Practice: Fractions of different wholes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Equivalent fractions',
          items: [
            { label: 'Equivalent fractions with visuals', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/v/equivalent-fractions-with-visuals' },
            { label: 'Equivalent fraction models', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/v/equivalent-fraction-models' },
            { label: 'Equivalent fraction visually', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/v/equivalent-fractions-visually-and-on-number-line' },
            { label: 'Creating equivalent fractions', type: 'video', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/v/generating-equivalent-fractions' },
            { label: 'Equivalent fractions on the number line', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/e/equivalent-fraction-models', question: { prompt: 'Which is equivalent to 1/2: 2/4, 3/5, or 4/9?', answer: '2/4', explanation: '1/2 = 2/4 because both numerator and denominator are multiplied by 2.' } },
            { label: 'Equivalent fractions', type: 'exercise', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/e/equivalent-fraction', question: { prompt: 'Which is equivalent to 1/2: 2/4, 3/5, or 4/9?', answer: '2/4', explanation: '1/2 = 2/4 because both numerator and denominator are multiplied by 2.' } },
            { label: 'Equivalent fractions and comparing fractions: FAQ', type: 'article', href: '/math/cc-third-grade-math/equivalent-fractions-and-comparing-fractions/imp-equivalent-fractions/a/equivalent-fractions-and-comparing-fractions-faq' },
          ],
        },
      ],
    },
    {
      name: 'More with multiplication and division',
      lessons: [
        {
          name: 'Letters and symbols in multiplication and division equations',
          items: [
            { label: 'Unknowns with multiplication and division', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-more-with-1-digit-multiplication-and-division/v/unknowns-with-multiplication-and-division' },
            { label: 'Find missing factors (1-digit multiplication)', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-more-with-1-digit-multiplication-and-division/e/finding-missing-factors--1-digit-multiplication-', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
            { label: 'Find missing divisors and dividends (1-digit division)', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-more-with-1-digit-multiplication-and-division/e/division_1', question: { prompt: 'Practice: Find missing divisors and dividends (1-digit division). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplication and division word problems',
          items: [
            { label: 'Multiplication word problem: soda party', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/multiplication-and-division-word-problems/v/liters-of-soda-for-the-party' },
            { label: 'Division word problem: blueberries', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/multiplication-and-division-word-problems/v/blueberries-for-friends' },
            { label: 'Multiplication and division word problems (within 100)', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/multiplication-and-division-word-problems/e/multiplication-and-division-word-problems--within-100-', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Associative property of multiplication',
          items: [
            { label: 'Associative property of multiplication', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/associative-property-of-multiplication/v/associate-property-of-multiplication' },
            { label: 'Properties of multiplication', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/associative-property-of-multiplication/v/order-doesn-t-matter-when-purely-multiplying' },
            { label: 'Understand associative property of multiplication', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/associative-property-of-multiplication/e/understand-associative-property-of-multiplication', question: { prompt: 'Practice: Understand associative property of multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Using associative property to simplify multiplication', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/associative-property-of-multiplication/v/using-associate-property-to-simplify-multiplication' },
            { label: 'Use associative property to multiply 2-digit numbers by 1-digit', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/associative-property-of-multiplication/e/use-associative-property-to-multiply-2-digit-numbers-by-1-digit', question: { prompt: 'What is 13 × 9?', answer: '117', explanation: 'Compute 13 × 9 = 117.' } },
          ],
        },
        {
          name: 'Multiplying by tens',
          items: [
            { label: 'Multiplying by multiples of 10', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-multiplying-by-tens/v/multiplying-by-multiples-of-10' },
            { label: 'Multiply by tens', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-multiplying-by-tens/e/multiplication_1', question: { prompt: 'Practice: Multiply by tens. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplying by tens word problem', type: 'video', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-multiplying-by-tens/v/multiplying-by-tens-word-problem-math-3rd-grade-khan-academy' },
            { label: 'Multiply by tens word problems', type: 'exercise', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-multiplying-by-tens/e/multiply-by-tens-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'More with multiplication and division: FAQ', type: 'article', href: '/math/cc-third-grade-math/imp-multiplication-and-division/imp-multiplying-by-tens/a/more-with-multiplication-and-division-faq' },
          ],
        },
      ],
    },
    {
      name: 'Arithmetic patterns and problem solving',
      lessons: [
        {
          name: '2-step expressions',
          items: [
            { label: 'Order of operations (2-step expressions)', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/2-step-expressions/v/what-order-to-do-operations-in' },
            { label: 'Solve 2-step expressions', type: 'exercise', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/2-step-expressions/e/order-of-operations-3rd', question: { prompt: 'Practice: Solve 2-step expressions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Estimation word problems',
          items: [
            { label: '2-step estimation word problems', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/estimation-word-problems/v/2-step-estimation-word-problems' },
          ],
        },
        {
          name: 'One and two-step word problems',
          items: [
            { label: 'Setting up 2-step word problems', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/v/setting-up-2-step-expressions' },
            { label: 'Represent 2-step word problems with equations', type: 'exercise', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/e/represent-2-step-word-problems-using-equations', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: '2-step word problem: truffles', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/v/how-many-truffle-eating-guests-attended-a-party' },
            { label: '2-step word problem: running', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/v/running-distance-in-a-week' },
            { label: '2-step word problem: theater', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/v/total-seats-in-a-theater' },
            { label: '2-step word problems', type: 'exercise', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-one-and-two-step-word-problems/e/two-step-word-problems-with-addition--subtraction--multiplication--and-division', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Patterns in arithmetic',
          items: [
            { label: 'Finding patterns in numbers', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/practice-finding-patterns-in-numbers' },
            { label: 'Recognizing number patterns', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/recognizing-number-pattern-examples' },
            { label: 'Math patterns', type: 'exercise', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/e/patterns', question: { prompt: 'Practice: Math patterns. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intro to even and odd numbers', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/introduction-to-even-and-odd' },
            { label: 'Patterns with multiplying even and odd numbers', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/examples-thinking-about-multiplying-even-and-odd-numbers' },
            { label: 'Patterns with even and odd', type: 'exercise', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/e/patterns-with-even-and-odd', question: { prompt: 'Practice: Patterns with even and odd. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Patterns in hundreds chart', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/patterns-in-hundreds-chart' },
            { label: 'Patterns in multiplication tables', type: 'video', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/v/patterns-in-multiplication-tables-practice' },
            { label: 'Arithmetic patterns and problem solving: FAQ', type: 'article', href: '/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving/imp-patterns-in-arithmetic/a/patterns-in-arithmetic-faq' },
          ],
        },
      ],
    },
    {
      name: 'Quadrilaterals',
      lessons: [
        {
          name: 'Quadrilaterals',
          items: [
            { label: 'Intro to quadrilaterals', type: 'video', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/v/introduction-to-types-of-quadrilaterals' },
            { label: 'Identifying quadrilaterals', type: 'article', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/a/identify-quadrilaterals' },
            { label: 'Right angles in shapes (informal definition)', type: 'article', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/a/right-angles-in-shapes' },
            { label: 'Identify quadrilaterals', type: 'exercise', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/e/identify-quadrilaterals', question: { prompt: 'Practice: Identify quadrilaterals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Analyze quadrilaterals', type: 'exercise', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/e/categorize-quadrilaterals', question: { prompt: 'Practice: Analyze quadrilaterals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Classify quadrilaterals', type: 'exercise', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/e/categorize-quads', question: { prompt: 'Practice: Classify quadrilaterals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadrilaterals: FAQ', type: 'article', href: '/math/cc-third-grade-math/quadrilaterals-3rd/imp-quadrilaterals/a/quadrilaterals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Area',
      lessons: [
        {
          name: 'Area introduction',
          items: [
            { label: 'Understand area', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-area-introduction/e/understand-area', question: { prompt: 'Practice: Understand area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Count unit squares to find area',
          items: [
            { label: 'Intro to area and unit squares', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/v/introduction-to-area-and-unit-squares' },
            { label: 'Measuring rectangles with different unit squares', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/v/measuring-the-same-rectangle-with-different-unit-squares' },
            { label: 'Find area by counting unit squares', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/e/area_1', question: { prompt: 'Practice: Find area by counting unit squares. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Compare area with unit squares', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/e/understanding-area', question: { prompt: 'Practice: Compare area with unit squares. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Creating rectangles with a given area 1', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/v/creating-rectangles-with-a-given-area-1-math-3rd-grade-khan-academy' },
            { label: 'Creating rectangles with a given area 2', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/v/creating-rectangles-with-a-given-area-2-math-3rd-grade-khan-academy' },
            { label: 'Create rectangles with a given area', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-count-unit-squares-to-find-area/e/find-area-of-rectangles-by-counting-unit-squares', question: { prompt: 'What is the area of a rectangle with sides 3 and 9?', answer: '27', explanation: 'Area = l × w = 3 × 9 = 27.' } },
          ],
        },
        {
          name: 'Area formula intuition',
          items: [
            { label: 'Counting unit squares to find area formula', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-area-formula-intuition/v/rectangle-area-as-product-of-dimensions-same-as-counting-unit-squares' },
            { label: 'Transitioning from unit squares to area formula', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-area-formula-intuition/v/transitioning-from-counting-to-multiplying-to-find-area-3rd-grade-khan-academy' },
            { label: 'Area with partial grids', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-area-formula-intuition/v/area-with-partial-grids' },
            { label: 'Area of rectangles with partial arrays', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-area-formula-intuition/e/area-of-rectangles-with-partial-arrays', question: { prompt: 'What is the area of a rectangle with sides 3 and 9?', answer: '27', explanation: 'Area = l × w = 3 × 9 = 27.' } },
            { label: 'Transition from unit squares to area formula', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-area-formula-intuition/e/finding-area-by-multiplying', question: { prompt: 'Practice: Transition from unit squares to area formula. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiply to find area',
          items: [
            { label: 'Counting unit squares to find area formula', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/v/rectangle-area-as-product-of-dimensions-same-as-counting-unit-squares' },
            { label: 'Area of rectangles', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/e/area-of-squares-and-rectangles', question: { prompt: 'What is the area of a rectangle with sides 3 and 4?', answer: '12', explanation: 'Area = l × w = 3 × 4 = 12.' } },
            { label: 'Finding missing side when given area', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/v/finding-missing-side-when-given-area-math-3rd-grade-khan-academy' },
            { label: 'Find a missing side length when given area', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/e/find-a-missing-side-length-when-given-area-of-a-rectangle', question: { prompt: 'Practice: Find a missing side length when given area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Comparing areas of plots of land', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/v/comparing-areas-of-plots-of-land' },
            { label: 'Compare areas by multiplying', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/e/comparing-areas-by-multiplying', question: { prompt: 'Practice: Compare areas by multiplying. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Area of rectangles review', type: 'article', href: '/math/cc-third-grade-math/imp-geometry/imp-multiply-to-find-area/a/area-rectangles-review' },
          ],
        },
        {
          name: 'Area and the distributive property',
          items: [
            { label: 'Area and the distributive property', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-area-and-the-distributive-property/v/area-of-rectangles-and-the-distributive-property' },
            { label: 'Represent area with the distributive property', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-area-and-the-distributive-property/e/area-and-the-distributive-property', question: { prompt: 'Practice: Represent area with the distributive property. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solve area with the distributive property', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-area-and-the-distributive-property/e/solve-area-with-the-distributive-property', question: { prompt: 'Practice: Solve area with the distributive property. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Decompose figures to find area',
          items: [
            { label: 'Decomposing shapes to find area: grids', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/v/decomposing-shapes-to-find-area-grids-math-3rd-grade-khan-academy' },
            { label: 'Understand decomposing figures to find area', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/e/decompose-figures-to-find-area-1', question: { prompt: 'Practice: Understand decomposing figures to find area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Decomposing shapes to find area: add', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/v/decomposing-shapes-to-find-area-add-math-3rd-grade-khan-academy' },
            { label: 'Decomposing shapes to find area: subtract', type: 'video', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/v/decomposing-shapes-to-find-area-subtract-math-3rd-grade-khan-academy' },
            { label: 'Decompose figures to find area', type: 'exercise', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/e/decompose-shapes-to-find-area', question: { prompt: 'Practice: Decompose figures to find area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Area: FAQ', type: 'article', href: '/math/cc-third-grade-math/imp-geometry/imp-decompose-figures-to-find-area/a/area-faq' },
          ],
        },
      ],
    },
    {
      name: 'Perimeter',
      lessons: [
        {
          name: 'Perimeter',
          items: [
            { label: 'Perimeter: introduction', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/v/introduction-to-perimeter' },
            { label: 'Perimeter of a shape', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/v/perimeter-of-a-shape' },
            { label: 'Find perimeter by counting unit squares', type: 'article', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/a/find-perimeter-by-counting-unit-squares' },
            { label: 'Find perimeter by counting units', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/e/perimeter_1', question: { prompt: 'What is the perimeter of a rectangle with sides 8 and 4?', answer: '24', explanation: 'Perimeter = 2(l+w) = 2(8+4) = 24.' } },
            { label: 'Find perimeter when given side lengths', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/e/perimeter-2', question: { prompt: 'What is the perimeter of a rectangle with sides 9 and 8?', answer: '34', explanation: 'Perimeter = 2(l+w) = 2(9+8) = 34.' } },
            { label: 'Perimeter review', type: 'article', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter/a/perimeter-review' },
          ],
        },
        {
          name: 'Perimeter of polygons with missing side lengths',
          items: [
            { label: 'Finding perimeter when a side length is missing', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/perimeter-of-polygons-with-missing-side-lengths/v/finding-perimeter-when-a-side-length-is-missing-math-3rd-grade-khan-academy' },
            { label: 'Find perimeter when a side length is missing', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/perimeter-of-polygons-with-missing-side-lengths/e/find-perimeter-when-a-side-length-is-missing', question: { prompt: 'What is the perimeter of a rectangle with sides 6 and 7?', answer: '26', explanation: 'Perimeter = 2(l+w) = 2(6+7) = 26.' } },
            { label: 'Finding missing side length when given perimeter', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/perimeter-of-polygons-with-missing-side-lengths/v/finding-missing-a-side-length-when-given-perimeter-math-3rd-grade-khan-academy' },
            { label: 'Find a missing side length when given perimeter', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/perimeter-of-polygons-with-missing-side-lengths/e/find-a-missing-side-length-when-given-perimeter', question: { prompt: 'What is the perimeter of a rectangle with sides 3 and 6?', answer: '18', explanation: 'Perimeter = 2(l+w) = 2(3+6) = 18.' } },
          ],
        },
        {
          name: 'Perimeter word problems',
          items: [
            { label: 'Perimeter word problem: tables', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter-word-problems/v/perimeter-word-problem-tables-math-3rd-grade-khan-academy' },
            { label: 'Perimeter word problem: skating rink', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter-word-problems/v/perimeter-word-problem-skating-rink-math-3rd-grade-khan-academy' },
            { label: 'Perimeter word problems', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-perimeter-word-problems/e/perimeter-word-problems', question: { prompt: 'What is the perimeter of a rectangle with sides 6 and 7?', answer: '26', explanation: 'Perimeter = 2(l+w) = 2(6+7) = 26.' } },
          ],
        },
        {
          name: 'Comparing area and perimeter',
          items: [
            { label: 'Area and perimeter situations', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-comparing-area-and-perimeter/e/area-and-perimeter-scenarios', question: { prompt: 'What is the perimeter of a rectangle with sides 6 and 7?', answer: '26', explanation: 'Perimeter = 2(l+w) = 2(6+7) = 26.' } },
            { label: 'Comparing areas and perimeters of rectangles', type: 'video', href: '/math/cc-third-grade-math/3rd-perimeter/imp-comparing-area-and-perimeter/v/comparing-area-and-perimeter' },
            { label: 'Compare area and perimeter', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-comparing-area-and-perimeter/e/comparing-area-and-perimeter', question: { prompt: 'What is the perimeter of a rectangle with sides 5 and 7?', answer: '24', explanation: 'Perimeter = 2(l+w) = 2(5+7) = 24.' } },
            { label: 'Area and perimeter word problems', type: 'exercise', href: '/math/cc-third-grade-math/3rd-perimeter/imp-comparing-area-and-perimeter/e/area-perimeter-word-problems', question: { prompt: 'What is the perimeter of a rectangle with sides 9 and 3?', answer: '24', explanation: 'Perimeter = 2(l+w) = 2(9+3) = 24.' } },
            { label: 'Perimeter: FAQ', type: 'article', href: '/math/cc-third-grade-math/3rd-perimeter/imp-comparing-area-and-perimeter/a/perimeter-faq' },
          ],
        },
      ],
    },
    {
      name: 'Time',
      lessons: [
        {
          name: 'Time on number line',
          items: [
            { label: 'Telling time with number line', type: 'video', href: '/math/cc-third-grade-math/time/tell-time-on-number-line/v/telling-time-problems-with-number-line' },
            { label: 'Tell time on the number line', type: 'exercise', href: '/math/cc-third-grade-math/time/tell-time-on-number-line/e/telling-time-on-the-number-line', question: { prompt: 'Practice: Tell time on the number line. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Time word problems with number line', type: 'exercise', href: '/math/cc-third-grade-math/time/tell-time-on-number-line/e/telling-time-word-problems-with-the-number-line', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Telling time',
          items: [
            { label: 'Telling time to the nearest minute (labeled clock)', type: 'video', href: '/math/cc-third-grade-math/time/imp-time/v/telling-time-to-the-nearest-minute-labeled-clock-math-3rd-grade-khan-academy' },
            { label: 'Telling time to the nearest minute (unlabeled clock)', type: 'video', href: '/math/cc-third-grade-math/time/imp-time/v/telling-time-to-the-nearest-minute-unlabeled-clock-math-3rd-grade-khan-academy' },
            { label: 'Tell time to the nearest minute', type: 'exercise', href: '/math/cc-third-grade-math/time/imp-time/e/telling-time-to-the-nearest-minute', question: { prompt: 'Practice: Tell time to the nearest minute. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Telling time review', type: 'article', href: '/math/cc-third-grade-math/time/imp-time/a/telling-time-review' },
          ],
        },
        {
          name: 'Elapsed time',
          items: [
            { label: 'Time differences example', type: 'video', href: '/math/cc-third-grade-math/time/elapsed-time/v/times-differences-math-3rd-grade-khan-academy' },
            { label: 'Time differences (within 60 minutes)', type: 'exercise', href: '/math/cc-third-grade-math/time/elapsed-time/e/time-differences', question: { prompt: 'Practice: Time differences (within 60 minutes). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Time word problem: travel time', type: 'video', href: '/math/cc-third-grade-math/time/elapsed-time/v/time-to-leave-for-home' },
            { label: 'Time word problem: puzzle', type: 'video', href: '/math/cc-third-grade-math/time/elapsed-time/v/time-differences-word-problem-math-3rd-grade-khan-academy' },
            { label: 'Telling time word problems (within the hour)', type: 'exercise', href: '/math/cc-third-grade-math/time/elapsed-time/e/telling-time-word-problems', question: { prompt: 'If it is 3:00 now, what time is it 2 hours later?', answer: '5:00', explanation: 'Add 2 hours: 3+2=5.' } },
            { label: 'Time FAQ', type: 'article', href: '/math/cc-third-grade-math/time/elapsed-time/a/time-faq' },
          ],
        },
      ],
    },
    {
      name: 'Measurement',
      lessons: [
        {
          name: 'Mass',
          items: [
            { label: 'Understanding mass (grams and kilograms)', type: 'video', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-mass/v/intuition-for-grams' },
            { label: 'Estimate mass (grams and kilograms)', type: 'exercise', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-mass/e/estimating-mass', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Word problems with mass', type: 'video', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-mass/v/mass-problems' },
          ],
        },
        {
          name: 'Volume',
          items: [
            { label: 'Understanding volume (liters)', type: 'video', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-volume/v/liter-intuition' },
            { label: 'Estimate volume (milliliters and liters)', type: 'exercise', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-volume/e/estimating-volume', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Word problems with volume', type: 'video', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-volume/v/arithmetic-word-problems-with-volume' },
            { label: 'Measurement: FAQ', type: 'article', href: '/math/cc-third-grade-math/imp-measurement-and-data/imp-volume/a/measurement-faq' },
          ],
        },
      ],
    },
    {
      name: 'Represent and interpret data',
      lessons: [
        {
          name: 'Picture graphs',
          items: [
            { label: 'Creating picture and bar graphs', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/v/creating-picture-and-bar-graphs-2-exercise-examples' },
            { label: 'Creating picture graphs', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/a/create-pic-graphs' },
            { label: 'Create picture graphs (picture more than 1)', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/e/creating-picture-and-bar-graphs-2', question: { prompt: 'Practice: Create picture graphs (picture more than 1). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solving problems with picture graphs', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/v/solving-problems-with-pictographs-2' },
            { label: 'Reading picture graphs', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/a/read-pic-graphs' },
            { label: 'Read picture graphs', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/e/solving-problems-with-picture-graphs-2', question: { prompt: 'Practice: Read picture graphs. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpreting picture graphs: paint', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/v/interpreting-picture-graphs-paint-math-3rd-grade-khan-academy' },
            { label: 'Interpreting picture graphs: notebook', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/v/interpreting-picture-graphs-notebook-math-3rd-grade-khan-academy' },
            { label: 'Reading picture graphs: multi-step', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/a/read-pic-graphs-2' },
            { label: 'Read picture graphs (multi-step problems)', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-picture-graphs/e/reading_pictographs_2', question: { prompt: 'Practice: Read picture graphs (multi-step problems). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Bar graphs',
          items: [
            { label: 'Creating picture and bar graphs', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/v/creating-picture-and-bar-graphs-2-exercise-examples' },
            { label: 'Creating bar graphs', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/a/create-bar-graphs' },
            { label: 'Create bar graphs', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/e/creating_bar_charts_1', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
            { label: 'Reading bar graphs: movies', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/v/more-solving-problems-with-bar-graphs' },
            { label: 'Reading bar graphs', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/a/read-bar-graphs' },
            { label: 'Read bar graphs', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/e/solving-problems-with-bar-graphs-3', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
            { label: 'Interpreting bar graphs: colors', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/v/interpreting-bar-graphs-colors-math-3rd-grade-khan-academy' },
            { label: 'Reading bar graphs: multi-step', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/a/read-bar-graphs-2' },
            { label: 'Read bar graphs (2-step problems)', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-bar-graphs/e/reading_bar_charts_2', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
          ],
        },
        {
          name: 'Line plots with fractions',
          items: [
            { label: 'Measuring lengths to nearest 1/4 unit', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/v/measuring-lengths-to-nearest-1-4-unit' },
            { label: 'Measure lengths to nearest 1/4 unit', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/e/measure-lengths-to-nearest-1-4-unit', question: { prompt: 'Practice: Measure lengths to nearest 1/4 unit. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graphing data on line plots', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/v/marking-data-on-line-plots' },
            { label: 'Graph data on line plots', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/e/creating-line-plots-2', question: { prompt: 'Practice: Graph data on line plots. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpreting line plots with fractions', type: 'video', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/v/interpreting-line-plots-with-fractions' },
            { label: 'Read line plots (data with fractions)', type: 'exercise', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/e/read-line-plots', question: { prompt: 'Practice: Read line plots (data with fractions). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Line plots review', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/a/line-plots-review' },
            { label: 'Represent and interpret data: FAQ', type: 'article', href: '/math/cc-third-grade-math/represent-and-interpret-data/imp-line-plots/a/represent-and-interpret-data-faq' },
          ],
        },
      ],
    },
  ],
};
