import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '5',
  label: '5th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-fifth-grade-math',
  units: [
    {
      name: 'Decimal place value',
      lessons: [
        {
          name: 'Decimal place value intro',
          items: [
            { label: 'Place value with decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimal-place-value-intro/v/place-value-with-decimals' },
            { label: 'Place value names', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimal-place-value-intro/e/identifying-decimal-place-values', question: { prompt: 'Write 662 in expanded form (hundreds + tens + ones).', answer: '600 + 60 + 2', explanation: '662 = 6 hundreds + 6 tens + 2 ones.' } },
            { label: 'Value of a digit', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimal-place-value-intro/e/value-of-a-decimal-digit', question: { prompt: 'Practice: Value of a digit. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Decimal place value review', type: 'article', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimal-place-value-intro/a/decimal-place-value-review' },
          ],
        },
        {
          name: 'Decimals on the number line',
          items: [
            { label: 'Thousandths on the number line', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-on-the-number-line-thousandths/v/thousandths-on-the-number-line' },
            { label: 'Decimals on the number line: thousandths', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-on-the-number-line-thousandths/e/decimals-on-the-number-line--thousandths-', question: { prompt: 'On a number line, which is between 0.3 and 0.5: 0.4 or 0.6?', answer: '0.4', explanation: '0.4 lies between 0.3 and 0.5.' } },
          ],
        },
        {
          name: 'Decimals in expanded form',
          items: [
            { label: 'Write decimals in expanded form', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-expanded-form/v/expanding-out-a-decimal-by-place-value' },
            { label: 'Decimals in expanded form', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-expanded-form/e/writing-and-interpreting-decimals', question: { prompt: 'Write 269 in expanded form (hundreds + tens + ones).', answer: '200 + 60 + 9', explanation: '269 = 2 hundreds + 6 tens + 9 ones.' } },
            { label: 'Decimals in expanded form review', type: 'article', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-expanded-form/a/decimals-in-expanded-form-review' },
          ],
        },
        {
          name: 'Decimals in written form',
          items: [
            { label: 'Decimals in written form (hundredths)', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-written-form/v/decimal-place-value-2' },
            { label: 'Decimals in written form (thousandths)', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-written-form/v/writing-out-a-decimal-in-words' },
            { label: 'Decimals in written form', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-written-form/e/decimals-in-written-form', question: { prompt: 'Practice: Decimals in written form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Decimals in written form review', type: 'article', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-decimals-in-written-form/a/decimals-in-written-form-review' },
          ],
        },
        {
          name: 'Decimals in different forms',
          items: [
            { label: 'Expressing decimals in multiple forms', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-in-different-forms/v/expressing-decimals-in-multiple-forms' },
            { label: 'Visual understanding of regrouping decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-in-different-forms/v/visual-understanding-of-regrouping-decimals' },
            { label: 'Regrouping with decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-in-different-forms/v/regrouping-decimals' },
            { label: 'Regrouping with decimals: 21.3', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-in-different-forms/v/regrouping-with-decimals' },
            { label: 'Regroup decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/decimals-in-different-forms/e/regrouping-decimals', question: { prompt: 'Practice: Regroup decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Comparing decimals',
          items: [
            { label: 'Comparing decimals: 9.97 and 9.798', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/comparing-decimals-2-example' },
            { label: 'Comparing decimals: 156.378 and 156.348', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/comparing-decimals-4' },
            { label: 'Compare decimals through thousandths', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/e/comparing_decimals_2', question: { prompt: 'Compare 0.27 and 0.3 (use > or <).', answer: '0.27 < 0.3', explanation: '0.27 = 0.27 and 0.3 = 0.30, so 0.27 < 0.3.' } },
            { label: 'Ordering decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/ordering-decimals' },
            { label: 'Ordering decimals through thousandths', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/comparing-decimals-example' },
            { label: 'Order decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/e/ordering_decimals', question: { prompt: 'Practice: Order decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Comparing decimals in different representations', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/comparing-decimals-in-different-representations' },
            { label: 'Comparing decimals word problems', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/v/compare-decimals-word-problems' },
            { label: 'Compare decimals word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-comparing-decimals-2/e/compare-decimals-word-problems', question: { prompt: 'Compare 0.27 and 0.3 (use > or <).', answer: '0.27 < 0.3', explanation: '0.27 = 0.27 and 0.3 = 0.30, so 0.27 < 0.3.' } },
          ],
        },
        {
          name: 'Rounding decimals',
          items: [
            { label: 'Rounding decimals on the number line', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/v/rounding-decimals-on-the-number-line' },
            { label: 'Round decimals using a number line', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/e/rounding-decimals-using-a-number-line', question: { prompt: 'On a number line, which is between 0.3 and 0.5: 0.4 or 0.6?', answer: '0.4', explanation: '0.4 lies between 0.3 and 0.5.' } },
            { label: 'Worked example: Rounding decimals to nearest tenth', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/v/rounding-decimals' },
            { label: 'Round decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/e/rounding_numbers', question: { prompt: 'Practice: Round decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Understand decimal rounding', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/e/rounding-decimals', question: { prompt: 'Round 394 to the nearest 10.', answer: '390', explanation: '394 rounds to 390 based on the ones digit.' } },
            { label: 'Rounding decimals word problems', type: 'video', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/v/rounding-to-the-nearest-tenth-and-hundredth' },
            { label: 'Round decimals word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/e/round-decimals-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Decimal place value: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-place-value-and-decimals/imp-rounding-decimals/a/decimal-place-value-faq' },
          ],
        },
      ],
    },
    {
      name: 'Add decimals',
      lessons: [
        {
          name: 'Common fractions and decimals',
          items: [
            { label: 'Common fractions and decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-common-fractions-and-decimals-2/v/common-fractions-and-decimals' },
            { label: 'Write common decimals as fractions', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-common-fractions-and-decimals-2/e/common-fractions-and-decimals', question: { prompt: 'Practice: Write common decimals as fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Write common fractions as decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-common-fractions-and-decimals-2/e/write-common-fractions-as-decimals', question: { prompt: 'Practice: Write common fractions as decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Adding decimals intro',
          items: [
            { label: 'Estimating decimal addition', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals-intro/v/estimating-adding-decimals' },
            { label: 'Estimating with adding decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals-intro/e/estimating-with-adding-decimals', question: { prompt: 'Practice: Estimating with adding decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding decimals', type: 'article', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals-intro/a/adding-decimals-without-the-standard-algorithm' },
            { label: 'Add decimals visually', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals-intro/e/add-decimals-visually', question: { prompt: 'What is 5.2 + 5.9?', answer: '11.1', explanation: 'Line up decimal points: 5.2 + 5.9 = 11.1.' } },
          ],
        },
        {
          name: 'Adding decimals (tenths)',
          items: [
            { label: 'Introduction to adding decimals: tenths', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/introduction-to-adding-decimals-tenths' },
            { label: 'Adding decimals with ones and tenths parts', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/adding-decimals-with-ones-and-tenths-parts' },
            { label: 'Adding decimals < 1 (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-1', question: { prompt: 'Practice: Adding decimals < 1 (tenths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding decimals and whole numbers (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-2', question: { prompt: 'Practice: Adding decimals and whole numbers (tenths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding decimals (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-3', question: { prompt: 'Practice: Adding decimals (tenths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Adding decimals (hundredths)',
          items: [
            { label: 'Adding decimals with ones, tenths and hundredths', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/v/adding-decimals-with-ones-tenths-and-hundredths' },
            { label: 'Adding decimals with hundredths', type: 'video', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/v/andding-decimals-with-hundredths' },
            { label: 'Adding decimals < 1 (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/e/adding-decimals-without-the-standard-algorithm-6', question: { prompt: 'Practice: Adding decimals < 1 (hundredths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding decimals and whole numbers (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/e/adding-decimals-without-the-standard-algorithm-4', question: { prompt: 'Practice: Adding decimals and whole numbers (hundredths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Adding decimals (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/e/adding-decimals-without-the-standard-algorithm-5', question: { prompt: 'Practice: Adding decimals (hundredths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Add decimals: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/xe33ac28b798af866:adding-decimals-hundredths/a/add-decimals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Subtract decimals',
      lessons: [
        {
          name: 'Subtracting decimals intro',
          items: [
            { label: 'Estimating decimal subtraction', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals-intro/v/estimating-subtracting-decimals' },
            { label: 'Estimating with subtracting decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals-intro/e/estimating-with-subtracting-decimals', question: { prompt: 'Practice: Estimating with subtracting decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Subtract decimals visually', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals-intro/e/subtract-decimals-visually', question: { prompt: 'What is 14.6 - 3.8?', answer: '10.8', explanation: 'Line up decimals: 14.6 - 3.8 = 10.8.' } },
            { label: 'Subtracting decimals', type: 'article', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals-intro/a/subtracting-decimals-without-the-standard-algorithm' },
          ],
        },
        {
          name: 'Subtracting decimals (tenths)',
          items: [
            { label: 'Strategies for subtracting basic decimals', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-basic-decimals' },
            { label: 'Strategies for subtracting more complex decimals with tenths', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-more-complex-decimals-with-tenths' },
            { label: 'Subtract decimals < 1 (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-1', question: { prompt: 'What is 12.6 - 3.1?', answer: '9.5', explanation: 'Line up decimals: 12.6 - 3.1 = 9.5.' } },
            { label: 'Subtracting decimals and whole numbers (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-3', question: { prompt: 'Practice: Subtracting decimals and whole numbers (tenths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Subtracting decimals (tenths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-2', question: { prompt: 'Practice: Subtracting decimals (tenths). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Subtracting decimals (hundredths)',
          items: [
            { label: 'Subtracting decimals: 9.57-8.09', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/v/subtracting-decimals-up-to-hundredths' },
            { label: 'Subtracting decimals: 10.1-3.93', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/v/another-example-subtracting-decimals-to-hundredths' },
            { label: 'Subtraction strategies with hundredths', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/v/subtraction-strategies-with-hundredths' },
            { label: 'More advanced subtraction strategies with hundredths', type: 'video', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/v/more-advanced-subtraction-strategies-with-hundredths' },
            { label: 'Subtract decimals < 1 (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/e/subtracting-decimals-without-the-standard-algorithm-5', question: { prompt: 'What is 12.1 - 2.2?', answer: '9.9', explanation: 'Line up decimals: 12.1 - 2.2 = 9.9.' } },
            { label: 'Subtract decimals and whole numbers (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/e/subtracting-decimals-without-the-standard-algorithm-8', question: { prompt: 'What is 11.7 - 2.1?', answer: '9.6', explanation: 'Line up decimals: 11.7 - 2.1 = 9.6.' } },
            { label: 'Subtract decimals (hundredths)', type: 'exercise', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/e/subtracting-decimals-without-the-standard-algorithm-6', question: { prompt: 'What is 14.0 - 2.4?', answer: '11.6', explanation: 'Line up decimals: 14.0 - 2.4 = 11.6.' } },
            { label: 'Subtract decimals: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/subtract-decimals/xe33ac28b798af866:subtracting-decimals-hundredths/a/subtract-decimals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Add and subtract fractions',
      lessons: [
        {
          name: 'Strategies for adding and subtracting fractions with unlike denominators',
          items: [
            { label: 'Visually adding fractions: 5/6+1/4', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-visually-adding-and-subtracting-fractions-with-unlike-denominators/v/visually-adding-fractions-with-unlike-denominators' },
            { label: 'Visually subtracting fractions: 3/4-5/8', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-visually-adding-and-subtracting-fractions-with-unlike-denominators/v/visually-subtracting-fractions-with-unlike-denominators' },
            { label: 'Visually add and subtract fractions', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-visually-adding-and-subtracting-fractions-with-unlike-denominators/e/using-visuals-to-add-and-subtract-fractions-with-unlike-denominators-', question: { prompt: 'What is 8 + 3 - 1?', answer: '10', explanation: 'Compute left to right: 8+3=11, then minus 1 = 10.' } },
            { label: 'Estimating adding fractions with unlike denominators', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-visually-adding-and-subtracting-fractions-with-unlike-denominators/v/estimating-adding-fractions-with-unlike-denominators' },
            { label: 'Estimate to add and subtract fractions with different denominators', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-visually-adding-and-subtracting-fractions-with-unlike-denominators/e/estimate-to-add-and-subtract-fractions-with-different-denominators', question: { prompt: 'What is 6 + 4 - 2?', answer: '8', explanation: 'Compute left to right: 6+4=10, then minus 2 = 8.' } },
          ],
        },
        {
          name: 'Common denominators',
          items: [
            { label: 'Finding common denominators', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/v/finding-common-denominators' },
            { label: 'Common denominators: 1/4 and 5/6', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/v/common-denominators-14-and-56' },
            { label: 'Common denominators: 3/5 and 7/2', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/v/common-denominators-35-and-72' },
            { label: 'Common denominators', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/e/common-denominators', question: { prompt: 'Practice: Common denominators. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Equivalent expressions with common denominators', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/e/equivalent-expressions-with-common-denominators', question: { prompt: 'Practice: Equivalent expressions with common denominators. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Common denominators review', type: 'article', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-common-denominators-2/a/common-denominators-review' },
          ],
        },
        {
          name: 'Adding and subtracting fractions with unlike denominators',
          items: [
            { label: 'Adding fractions with unlike denominators introduction', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/adding-fractions-with-unlike-denominators-introduction' },
            { label: 'Adding fractions with unlike denominators', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/adding-small-fractions-with-unlike-denominators' },
            { label: 'Add fractions with unlike denominators', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/e/adding_fractions', question: { prompt: 'What is 1/5 + 2/5?', answer: '3/5', explanation: 'Add numerators with the same denominator: 1+2=3, so 3/5.' } },
            { label: 'Subtracting fractions with unlike denominators introduction', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/subtracting-fractions-with-unlike-denominators-introduction' },
            { label: 'Subtracting fractions with unlike denominators', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/subtracting-small-fractions-with-unlike-denominators' },
            { label: 'Adding and subtracting 3 fractions', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/adding-and-subtracting-multiple-fractions-with-unlike-denominators' },
            { label: 'Solving for the missing fraction', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/v/solving-for-the-missing-fraction' },
            { label: 'Add and subtract fractions', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators/e/adding-and-subtracting-fractions-with-unlike-denominators', question: { prompt: 'What is 5 + 6 - 3?', answer: '8', explanation: 'Compute left to right: 5+6=11, then minus 3 = 8.' } },
          ],
        },
        {
          name: 'Adding and subtracting mixed numbers with unlike denominators',
          items: [
            { label: 'Adding mixed numbers: 19 3/18 + 18 2/3', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/v/adding-subtracting-mixed-numbers-1-ex-1' },
            { label: 'Subtracting mixed numbers: 7 6/9 - 3 2/5', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/v/adding-subtracting-mixed-numbers-1-ex-2' },
            { label: 'Add and subtract mixed numbers with unlike denominators (no regrouping)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/e/adding_subtracting_mixed_numbers_1', question: { prompt: 'What is 13 + 3 - 1?', answer: '15', explanation: 'Compute left to right: 13+3=16, then minus 1 = 15.' } },
            { label: 'Adding mixed numbers with regrouping', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/v/adding-mixed-numbers-with-regrouping' },
            { label: 'Subtracting mixed numbers with regrouping (unlike denominators)', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/v/subtracting-mixed-numbers-with-regrouping' },
            { label: 'Add and subtract mixed numbers with unlike denominators (regrouping)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-mixed-number-with-unlike-denominators/e/adding-and-subtracting-mixed-numbers-with-unlike-denominators-2', question: { prompt: 'What is 14 + 3 - 1?', answer: '16', explanation: 'Compute left to right: 14+3=17, then minus 1 = 16.' } },
          ],
        },
        {
          name: 'Adding and subtracting fractions with unlike denominators word problems',
          items: [
            { label: 'Adding fractions word problem: paint', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators-word-problems/v/adding-fractions-with-unlike-denominators-word-problem' },
            { label: 'Subtracting fractions word problem: tomatoes', type: 'video', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators-word-problems/v/subtracting-fractions-with-unlike-denominators-word-problem' },
            { label: 'Add and subtract fractions word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators-word-problems/e/adding-and-subtracting-fractions-with-unlike-denominators-word-problems', question: { prompt: 'What is 5 + 2 - 1?', answer: '6', explanation: 'Compute left to right: 5+2=7, then minus 1 = 6.' } },
            { label: 'Add and subtract fractions: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators-word-problems/a/add-and-subtract-fractions-faq-2' },
          ],
        },
      ],
    },
    {
      name: 'Multi-digit multiplication and division',
      lessons: [
        {
          name: 'Multi-digit multiplication estimation',
          items: [
            { label: 'Strategies for multiplying multiples of 10, 100 and 1000', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-multiplication-estimation/v/strategies-for-multiplying-multiples-of-10-100-and-1000' },
            { label: 'Multiply by taking out factors of 10', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-multiplication-estimation/e/multiplying-by-taking-out-factors-of-10', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
            { label: 'Estimating multi-digit multiplication', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-multiplication-estimation/v/estimate-multiplying-multi-digit-numbers' },
            { label: 'Estimate multi-digit multiplication', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-multiplication-estimation/e/estimate-multi-digit-multiplication-problems', question: { prompt: 'What is 22 × 2?', answer: '44', explanation: 'Compute 22 × 2 = 44.' } },
          ],
        },
        {
          name: 'Multi-digit multiplication',
          items: [
            { label: 'Relate multiplication with area models to the standard algorithm', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/v/multiplying-using-area-models-and-the-standard-algorithm' },
            { label: 'Intro to standard way of multiplying multi-digit numbers', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/v/intro-to-standard-way-of-multiplying-multi-digit-numbers' },
            { label: 'Understanding the standard algorithm for multiplication', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/v/understanding-the-standard-algorithm-for-multiplication' },
            { label: 'Multiply by 1-digit numbers with standard algorithm', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/e/multiply-by-1-digit-numbers-with-standard-algorithm', question: { prompt: 'What is 1 × 5?', answer: '5', explanation: '1 times 5 equals 5.' } },
            { label: 'Multiplying multi-digit numbers: 6,742x23', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/v/multiplying-multi-digit-numbers-6742x23' },
            { label: 'Multi-digit multiplication', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-multiplication/e/multiplication_4', question: { prompt: 'What is 12 × 2?', answer: '24', explanation: 'Compute 12 × 2 = 24.' } },
          ],
        },
        {
          name: 'Multi-digit division estimation',
          items: [
            { label: 'Strategies for dividing multiples of 10, 100, and 1000', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-division-estimation/v/strategies-for-dividing-multiples-of-10-100-and-1000' },
            { label: 'Divide by taking out factors of 10', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-division-estimation/e/dividing-by-taking-out-factors-of-10', question: { prompt: 'What is 21 ÷ 7?', answer: '3', explanation: '21 ÷ 7 = 3 because 7 × 3 = 21.' } },
            { label: 'Estimating multi-digit division', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-division-estimation/v/approximating-multi-digit-division' },
            { label: 'Estimate multi-digit division problems', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/multi-digit-division-estimation/e/estimate-multi-digit-division-problems', question: { prompt: 'What is 185 ÷ 5?', answer: '37', explanation: '185 ÷ 5 = 37.' } },
          ],
        },
        {
          name: 'Multi-digit division',
          items: [
            { label: 'Long division with remainders: 2292÷4', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/division-3-more-long-division-and-remainder-examples' },
            { label: 'Long division with remainders: 3771÷8', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/long-division-with-remainder-example' },
            { label: 'Introduction to dividing by 2-digits', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/introduction-to-dividing-by-2-digits' },
            { label: 'Basic multi-digit division', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/e/basic-multi-digit-division', question: { prompt: 'What is 297 ÷ 9?', answer: '33', explanation: '297 ÷ 9 = 33.' } },
            { label: 'Dividing by 2-digits: 9815÷65', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/dividing-2-digits-no-remainder' },
            { label: 'Dividing by 2-digits: 7182÷42', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/dividing-by-a-two-digit-number' },
            { label: 'Dividing by a 2-digits: 4781÷32', type: 'video', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/v/dividing-by-a-2-digit-number-with-a-remainder' },
            { label: 'Division by 2-digits', type: 'exercise', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/e/division_3', question: { prompt: 'Practice: Division by 2-digits. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multi-digit multiplication and division: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/multi-digit-multiplication-and-division/imp-multi-digit-division-2/a/multi-digit-multiplication-and-division-faq' },
          ],
        },
      ],
    },
    {
      name: 'Multiply fractions',
      lessons: [
        {
          name: 'Multiplication as scaling',
          items: [
            { label: 'Multiplication as scaling with fractions', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplication-as-scaling/v/multiplication-as-scaling' },
            { label: 'Fraction multiplication as scaling examples', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplication-as-scaling/v/fraction-multiplication-as-scaling-examples' },
            { label: 'Fraction multiplication as scaling', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplication-as-scaling/e/fraction-multiplication-as-scaling', question: { prompt: 'Practice: Fraction multiplication as scaling. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying fractions and whole numbers',
          items: [
            { label: 'Multiplying fractions by whole numbers on a number line', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/v/multiplying-fractions-by-whole-numbers-on-the-number-line' },
            { label: 'Multiplying unit fractions and whole numbers', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/v/multiplying-fractions-and-whole-numbers' },
            { label: 'Multiplying fractions and whole numbers visually', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/v/concept-whole-fraction-mult' },
            { label: 'Multiply fractions and whole numbers visually', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/e/understanding-multiplying-fractions-and-whole-numbers-2', question: { prompt: 'What is 2/3 × 3/4?', answer: '1/2', explanation: '(2×3)/(3×4) = 6/12 = 1/2.' } },
            { label: 'Multiplying fractions and whole numbers', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/v/concept-fraction-whole-number-product' },
            { label: 'Multiply fractions and whole numbers', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-and-whole-numbers/e/multiplying_fractions_by_integers', question: { prompt: 'What is 2/3 × 3/4?', answer: '1/2', explanation: '(2×3)/(3×4) = 6/12 = 1/2.' } },
          ],
        },
        {
          name: 'Multiplying fractions',
          items: [
            { label: 'Multiplying 2 fractions: fraction model', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/v/visualizing-fraction-products' },
            { label: 'Multiplying 2 fractions: number line', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/v/concept-fraction-mult-number-line' },
            { label: 'Represent fraction multiplication with visuals', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/e/represent-fraction-multiplication-with-visuals', question: { prompt: 'Practice: Represent fraction multiplication with visuals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplying fractions with visuals', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/e/understanding-multiplying-fractions-by-fractions', question: { prompt: 'Practice: Multiplying fractions with visuals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplying 2 fractions: 5/6 x 2/3', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/v/multiplying-fractions' },
            { label: 'Multiplying fractions', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions/e/multiplying_fractions_0.5', question: { prompt: 'Practice: Multiplying fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying mixed numbers',
          items: [
            { label: 'Multiplying mixed numbers', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-mixed-numbers/v/multiplying-mixed-numbers' },
            { label: 'Multiply mixed numbers', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-mixed-numbers/e/multiplying_mixed_numbers_1', question: { prompt: 'Convert 7/3 to a mixed number.', answer: '2 1/3', explanation: '3 goes into 7 two times with 1 left, so 2 and 1/3.' } },
          ],
        },
        {
          name: 'Area of rectangles with fraction side lengths',
          items: [
            { label: 'Finding area with fractional sides 1', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/area-of-rectangles-with-fraction-side-lengths/v/example-finding-area-with-fractional-sides' },
            { label: 'Finding area with fractional sides 2', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/area-of-rectangles-with-fraction-side-lengths/v/intuition-for-area-with-fractional-side-lengths' },
            { label: 'Area of rectangles with fraction side lengths', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/area-of-rectangles-with-fraction-side-lengths/e/area-of-rectangles-with-fractional-side-lengths', question: { prompt: 'What is the area of a rectangle with sides 7 and 4?', answer: '28', explanation: 'Area = l × w = 7 × 4 = 28.' } },
          ],
        },
        {
          name: 'Multiplying fractions word problems',
          items: [
            { label: 'Multiplying fractions word problem: muffins', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-word-problems/v/multiplying-fractions-word-problem' },
            { label: 'Multiplying fractions word problem: laundry', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-word-problems/v/multiplying-fractions-word-problem-4' },
            { label: 'Multiplying fractions word problem: bike', type: 'video', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-word-problems/v/multiplying-fractions-word-problem-5' },
            { label: 'Multiply fractions word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-word-problems/e/multiplying-fractions-by-fractions-word-problems', question: { prompt: 'What is 2/3 × 3/4?', answer: '1/2', explanation: '(2×3)/(3×4) = 6/12 = 1/2.' } },
            { label: 'Multiply fractions: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/5th-multiply-fractions/imp-multiplying-fractions-word-problems/a/multiply-fractions-faq-2' },
          ],
        },
      ],
    },
    {
      name: 'Divide fractions',
      lessons: [
        {
          name: 'Fractions as division',
          items: [
            { label: 'Understanding fractions as division', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-fractions-as-division/v/fractions-as-division' },
            { label: 'Creating a fraction through division', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-fractions-as-division/v/creating-a-fraction-through-division-of-whole-numbers' },
            { label: 'Fractions as division', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-fractions-as-division/e/understanding-fractions-as-division', question: { prompt: 'Practice: Fractions as division. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Creating mixed numbers with fraction division', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-fractions-as-division/v/fractions-division-mixed-numbers' },
            { label: 'Fractions as division word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-fractions-as-division/e/understanding-fractions-as-division--word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Relate fraction division to fraction multiplication',
          items: [
            { label: 'Multiplication and division relationship for fractions', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/relate-fraction-division-to-fraction-multiplication/v/multiplication-and-division-relationship-for-fractions' },
            { label: 'Relate fraction division to fraction multiplication', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/relate-fraction-division-to-fraction-multiplication/e/relate-fraction-division-to-fraction-multiplication', question: { prompt: 'Practice: Relate fraction division to fraction multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dividing unit fractions by whole numbers',
          items: [
            { label: 'Visually dividing unit fraction by a whole number', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-unit-fractions-by-whole-numbers/v/visually-dividing-unit-fraction-by-a-whole-number' },
            { label: 'Dividing unit fractions by whole numbers visually', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-unit-fractions-by-whole-numbers/e/dividing-fractions-by-whole-numbers-introduction', question: { prompt: 'Practice: Dividing unit fractions by whole numbers visually. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing a unit fraction by a whole number', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-unit-fractions-by-whole-numbers/v/example-diving-a-unit-fraction-by-a-whole-number' },
            { label: 'Dividing unit fractions by whole numbers', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-unit-fractions-by-whole-numbers/e/dividing_fractions_0.5', question: { prompt: 'Practice: Dividing unit fractions by whole numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dividing whole numbers by unit fractions',
          items: [
            { label: 'Visually dividing whole numbers by unit fractions', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-whole-numbers-by-unit-fractions/v/visually-dividing-whole-numbers-by-unit-fractions' },
            { label: 'Dividing whole numbers by unit fractions visually', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-whole-numbers-by-unit-fractions/e/dividing-whole-numbers-by-unit-fractions-introduction', question: { prompt: 'Practice: Dividing whole numbers by unit fractions visually. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing a whole number by a unit fraction', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-whole-numbers-by-unit-fractions/v/example-dividing-a-whole-by-a-unit-fraction' },
            { label: 'Dividing whole numbers by unit fractions', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-whole-numbers-by-unit-fractions/e/dividing_fractions', question: { prompt: 'Practice: Dividing whole numbers by unit fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dividing fractions and whole numbers word problems',
          items: [
            { label: 'Fraction division in context', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-fractions-and-whole-numbers-word-problems/v/fraction-division-in-context' },
            { label: 'Fraction and whole number division in contexts', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-fractions-and-whole-numbers-word-problems/e/fraction-and-whole-number-division-in-contexts', question: { prompt: 'Practice: Fraction and whole number division in contexts. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing fractions and whole number word problems', type: 'video', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-fractions-and-whole-numbers-word-problems/v/dividing-fractions-and-whole-number-word-problems' },
            { label: 'Divide fractions and whole numbers word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-fractions-and-whole-numbers-word-problems/e/division-with-fractions-and-whole-numbers', question: { prompt: 'What is 1/2 ÷ 1/4?', answer: '2', explanation: 'Multiply by reciprocal: 1/2 × 4/1 = 2.' } },
            { label: 'Divide fractions: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/divide-fractions/imp-dividing-fractions-and-whole-numbers-word-problems/a/divide-fractions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Multiply decimals',
      lessons: [
        {
          name: 'Multiplying decimals and whole numbers',
          items: [
            { label: 'Estimating with multiplying decimals and whole numbers', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/estimating-with-multiplying-decimals-and-whole-numbers' },
            { label: 'Multiplying decimals and whole numbers with visuals', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/multiplying-decimals-and-whole-numbers-with-visuals' },
            { label: 'Multiply decimals and whole numbers visually', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-decimals-visually', question: { prompt: 'What is 0.4 × 0.5?', answer: '0.20', explanation: 'Multiply digits 4×5=20, then place 2 decimal places: 0.20.' } },
            { label: 'Strategies for multiplying decimals and whole numbers', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-decimals-and-whole-numbers' },
            { label: 'Multiply whole numbers by 0.1 and 0.01', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-by-0-1-and-0-01', question: { prompt: 'Practice: Multiply whole numbers by 0.1 and 0.01. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiply whole numbers and decimals less than 1', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiplying-decimals-without-the-standard-algorithm-2', question: { prompt: 'Practice: Multiply whole numbers and decimals less than 1. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Strategies for multiplying multi-digit decimals by whole numbers', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-multi-digit-decimals-by-whole-numbers' },
            { label: 'Multiply whole numbers and decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-and-decimals', question: { prompt: 'Practice: Multiply whole numbers and decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying decimals strategies',
          items: [
            { label: 'Estimating decimal multiplication', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/v/estimating-decimal-multiplication' },
            { label: 'Estimating with multiplying decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/e/estimating-with-multiplying-decimals', question: { prompt: 'Practice: Estimating with multiplying decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Developing strategies for multiplying decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/v/developing-strategies-for-multiplying-decimals' },
            { label: 'Decimal multiplication with grids', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/v/decimal-multiplication-with-grids' },
            { label: 'Represent decimal multiplication with grids and area models', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/e/multiply-decimals-with-grids-and-area-models', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Understanding decimal multiplication', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/v/understanding-decimal-multiplication' },
            { label: 'Multiplying decimals using estimation', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/v/multiplying-decimals-using-estimation' },
            { label: 'Understand multiplying decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-strategies/e/understand-multiplying-decimals', question: { prompt: 'Practice: Understand multiplying decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying decimals',
          items: [
            { label: 'Developing strategies for multiplying decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/v/developing-strategies-for-multiplying-decimals' },
            { label: 'Multiply decimals tenths', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/e/multiplying-decimals-without-the-standard-algorithm-1', question: { prompt: 'What is 0.4 × 0.5?', answer: '0.20', explanation: 'Multiply digits 4×5=20, then place 2 decimal places: 0.20.' } },
            { label: 'Developing strategies for multiplying 2-digit decimals', type: 'video', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/v/developing-strategies-for-multiplying-two-digit-decimals' },
            { label: 'Multiply decimals (1&2-digit factors)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/e/multiplying-decimals-without-the-standard-algorithm-3', question: { prompt: 'What is 0.4 × 0.5?', answer: '0.20', explanation: 'Multiply digits 4×5=20, then place 2 decimal places: 0.20.' } },
            { label: 'Multiply decimals (up to 4-digit factors)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/e/multiply-decimals--up-to-4-digit-factors-', question: { prompt: 'What is 0.4 × 0.5?', answer: '0.20', explanation: 'Multiply digits 4×5=20, then place 2 decimal places: 0.20.' } },
            { label: 'Multiplying decimals (no standard algorithm)', type: 'article', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/a/multiplying-decimals-without-the-standard-algorithm' },
            { label: 'Multiply decimals: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-multiplication-and-division-3/imp-multiplying-decimals/a/multiply-decimals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Divide decimals',
      lessons: [
        {
          name: 'Estimate to divide decimals',
          items: [
            { label: 'Estimating decimal division', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/estimate-to-divide-decimals/v/approximating-dividing-by-decimals' },
            { label: 'Estimating with dividing decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/estimate-to-divide-decimals/e/estimating-with-dividing-decimals', question: { prompt: 'Practice: Estimating with dividing decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Divide whole numbers to get a decimal quotient',
          items: [
            { label: 'Divide whole numbers with decimal quotients: 5÷2', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients' },
            { label: 'Divide whole numbers to get a decimal (1-digit divisors)', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/e/dividing-decimals-without-the-standard-algorithm-1', question: { prompt: 'Practice: Divide whole numbers to get a decimal (1-digit divisors). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Divide whole numbers with decimal quotients: 78÷12', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients-7812' },
            { label: 'Divide whole numbers to get a decimal (2-digit divisors)', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/e/dividing-decimals-without-the-standard-algorithm-2', question: { prompt: 'Practice: Divide whole numbers to get a decimal (2-digit divisors). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Divide decimals by whole numbers',
          items: [
            { label: 'Dividing a decimal by a whole number with fraction models', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/visually-dividing-decimal-by-whole-number' },
            { label: 'Dividing a decimal by a whole number on the number line', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/dividing-a-decimal-by-a-whole-number-on-the-number-line' },
            { label: 'Divide decimals by whole numbers visually', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/e/divide-decimals-visually', question: { prompt: 'What is 1.6 ÷ 0.4?', answer: '4', explanation: 'Multiply both by 10: 16 ÷ 4 = 4.' } },
            { label: 'Dividing a decimal by a whole number example', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/dividing-a-decimal-by-a-whole-number-example' },
            { label: 'Divide decimals by whole numbers', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/e/dividing-decimals-without-the-standard-algorithm-3', question: { prompt: 'What is 1.6 ÷ 0.4?', answer: '4', explanation: 'Multiply both by 10: 16 ÷ 4 = 4.' } },
          ],
        },
        {
          name: 'Divide whole numbers by decimals',
          items: [
            { label: 'Visually dividing a whole number by a decimal', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/v/visually-dividing-a-whole-number-by-a-decimal' },
            { label: 'Dividing a whole number by a decimal on a number line', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/v/dividing-a-whole-number-by-a-decimal-on-a-number-line' },
            { label: 'Division strategies for decimal quotients', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/v/division-strategies-for-decimal-quotients' },
            { label: 'Divide whole numbers by decimals visually', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/e/divide-whole-numbers-by-decimals-visually', question: { prompt: 'Practice: Divide whole numbers by decimals visually. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Pattern when dividing by tenths and hundredths', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/v/pattern-when-dividing-by-tenths-and-hundredths' },
            { label: 'Divide whole numbers by 0.1 or 0.01', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/e/dividing-decimals-without-the-standard-algorithm-7', question: { prompt: 'Practice: Divide whole numbers by 0.1 or 0.01. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing whole numbers by decimals examples', type: 'video', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/v/dividing-whole-numbers-by-decimals-examples' },
            { label: 'Divide whole numbers by decimals', type: 'exercise', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/e/dividing-decimals-without-the-standard-algorithm-6', question: { prompt: 'Practice: Divide whole numbers by decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Divide decimals: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-by-decimals/a/divide-decimals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Powers of ten',
      lessons: [
        {
          name: 'Multiplying and dividing whole numbers by 10, 100, and 1000',
          items: [
            { label: 'Multiplying and dividing by 10, 100, 1000', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-whole-numbers-by-10-100-and-1000/v/multiplying-and-dividing-by-10-100-1000' },
            { label: 'Multiply and divide whole numbers by 10, 100, and 1000', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-whole-numbers-by-10-100-and-1000/e/mult-div-whole-numbers-by-10-100-1000', question: { prompt: 'Practice: Multiply and divide whole numbers by 10, 100, and 1000. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying and dividing decimals by 10, 100, and 1000',
          items: [
            { label: 'Multiplying and dividing decimals by 10', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/v/multiplying-and-dividing-decimals-by-10' },
            { label: 'Multiply and divide decimals by 10', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/e/multiplying-and-dividing-decimals-by-10', question: { prompt: 'What is 1.6 ÷ 0.4?', answer: '4', explanation: 'Multiply both by 10: 16 ÷ 4 = 4.' } },
            { label: 'Multiplying and dividing decimals by 10, 100, 1000', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/v/multiplying-and-dividing-decimals-by-10-100-1000' },
            { label: 'Multiply and divide decimals by 10, 100, and 1000', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/e/mult-div-decimals-by-10-100-1000', question: { prompt: 'What is 1.6 ÷ 0.4?', answer: '4', explanation: 'Multiply both by 10: 16 ÷ 4 = 4.' } },
            { label: 'Multiplying decimals by 10, 100, and 1000', type: 'article', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/a/multiplying-by-10-100-1000' },
            { label: 'Dividing decimals by 10, 100, and 1000', type: 'article', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-decimals-by-10-100-and-1000/a/multiplying-and-dividing-by-powers-of-10' },
          ],
        },
        {
          name: 'Powers of 10',
          items: [
            { label: 'Introduction to powers of 10', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-powers-of-10/v/introduction-to-powers-of-10' },
            { label: 'Using exponents with powers of 10', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-powers-of-10/v/powers-of-10' },
            { label: 'Powers of ten', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-powers-of-10/e/powers-of-ten', question: { prompt: 'Practice: Powers of ten. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Powers of 10 review', type: 'article', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-powers-of-10/a/powers-of-10-review' },
          ],
        },
        {
          name: 'Multiplying and dividing with powers of 10',
          items: [
            { label: 'Multiplying and dividing by powers of 10', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-with-powers-of-10/v/multiplying-and-dividing-by-powers-of-10' },
            { label: 'Exponents and powers of 10 patterns', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-with-powers-of-10/v/patterns-in-zeros-exercise' },
            { label: 'Multiply and divide by powers of 10', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-with-powers-of-10/e/multiplying-and-dividing-by-powers-of-10', question: { prompt: 'What is 45 ÷ 9?', answer: '5', explanation: '45 ÷ 9 = 5 because 9 × 5 = 45.' } },
            { label: 'Fractions as division by power of 10', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-multiplying-and-dividing-with-powers-of-10/v/fractions-as-division-by-powers-of-10' },
          ],
        },
        {
          name: 'Comparing decimal place values',
          items: [
            { label: 'Comparing decimal place values', type: 'video', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-comparing-decimal-place-values/v/comparing-place-values-in-decimals' },
            { label: 'Compare decimal place value', type: 'exercise', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-comparing-decimal-place-values/e/comparing-decimal-place-value', question: { prompt: 'Write 903 in expanded form (hundreds + tens + ones).', answer: '900 + 0 + 3', explanation: '903 = 9 hundreds + 0 tens + 3 ones.' } },
            { label: 'Powers of ten: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/powers-of-ten/imp-comparing-decimal-place-values/a/powers-of-ten-faq' },
          ],
        },
      ],
    },
    {
      name: 'Volume',
      lessons: [
        {
          name: 'Volume with unit cubes',
          items: [
            { label: 'Volume intro', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/v/how-we-measure-volume' },
            { label: 'Measuring volume with unit cubes', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/v/measuring-volume-with-unit-cubes' },
            { label: 'Volume with unit cubes', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/e/volume-with-unit-cubes', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume of rectangular prisms with unit cubes', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/e/volume_with_unit_cubes', question: { prompt: 'Find the volume of a box with sides 2, 3, and 4.', answer: '24', explanation: 'V = l×w×h = 2×3×4 = 24.' } },
            { label: 'Compare volumes with unit cubes', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/e/volumes-with-unit-cubes', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume formula intuition', type: 'article', href: '/math/cc-fifth-grade-math/5th-volume/volume-with-unit-cubes/a/volume-formula-intuition' },
          ],
        },
        {
          name: 'Volume of rectangular prisms',
          items: [
            { label: 'Measuring volume as area times length', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/imp-finding-volume/v/measuring-volume-as-area-times-length' },
            { label: 'Volume as area of base times height', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/imp-finding-volume/e/volume-as-area-of-base-times-height', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume of a rectangular prism', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/imp-finding-volume/v/volume-of-a-rectangular-prism-or-box-examples' },
            { label: 'Volume of rectangular prisms', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/imp-finding-volume/e/volume_1', question: { prompt: 'Find the volume of a box with sides 2, 3, and 4.', answer: '24', explanation: 'V = l×w×h = 2×3×4 = 24.' } },
          ],
        },
        {
          name: 'Decompose figures to find volume',
          items: [
            { label: 'Volume in unit cubes by decomposing shape', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/v/volume-in-unit-cubes-by-decomposing-shape' },
            { label: 'Volume through decomposition', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/v/volume-through-decomposition' },
            { label: 'Decompose figures to find volume practice', type: 'article', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/a/decompose-figures-to-find-volume-practice' },
            { label: 'Decompose figures to find volume (unit cubes)', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/e/decompose-figures-to-find-volume--unit-cubes-', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Understanding decomposing figures to find volume', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/e/understanding-decomposing-figures-to-find-volume', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Decompose figures to find volume', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/decompose-figures-to-find-volume/e/decompose-figures-to-find-volume', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
          ],
        },
        {
          name: 'Volume word problems',
          items: [
            { label: 'Volume word problem: water tank', type: 'video', href: '/math/cc-fifth-grade-math/5th-volume/volume-word-problems/v/volume-word-problem-example' },
            { label: 'Volume word problems', type: 'exercise', href: '/math/cc-fifth-grade-math/5th-volume/volume-word-problems/e/volume_2', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume of rectangular prisms review', type: 'article', href: '/math/cc-fifth-grade-math/5th-volume/volume-word-problems/a/volume-of-rectangular-prisms-review' },
            { label: 'Volume: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/5th-volume/volume-word-problems/a/volume-faq' },
          ],
        },
      ],
    },
    {
      name: 'Coordinate plane',
      lessons: [
        {
          name: 'Intro to the coordinate plane',
          items: [
            { label: 'Introduction to the coordinate plane', type: 'video', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/v/introduction-to-the-coordinate-plane' },
            { label: 'Coordinate plane: graphing points', type: 'video', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/v/graphing-points-exercise' },
            { label: 'Graph points', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/e/graphing_points', question: { prompt: 'Practice: Graph points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Identify coordinates', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/e/identify-coordinates', question: { prompt: 'Practice: Identify coordinates. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Identify points', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/e/identifying-points', question: { prompt: 'Practice: Identify points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graph points review (positive numbers only)', type: 'article', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/a/graph-points-review' },
          ],
        },
        {
          name: 'Coordinate plane word problems',
          items: [
            { label: 'Coordinate plane: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/a/coordinate-plane-faq-2' },
            { label: 'Coordinate plane graphing word problem', type: 'video', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/v/coordinate-plane-word-problem-example' },
            { label: 'Interpreting plotted points', type: 'video', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/v/interpreting-plotted-points' },
            { label: 'Distance between points in first quadrant', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/e/distance-between-points-in-first-quadrant-of-coordinate-plane', question: { prompt: 'Practice: Distance between points in first quadrant. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Coordinate plane word problems (quadrant 1)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/e/coordinate-plane-word-problems--quadrant-1---basic-', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Coordinate plane word problems practice (quadrant 1)', type: 'article', href: '/math/cc-fifth-grade-math/imp-geometry-3/imp-coordinate-plane-word-problems/a/coordinate-plane-word-problems-practice' },
          ],
        },
      ],
    },
    {
      name: 'Algebraic thinking',
      lessons: [
        {
          name: 'Writing expressions',
          items: [
            { label: 'Constructing numerical expressions', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/v/constructing-numerical-expressions-example' },
            { label: 'Evaluating expressions with & without parentheses', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/v/evaluating-an-expression-with-and-without-parentheses' },
            { label: 'Evaluate expressions with parentheses', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/e/expressions-with-parentheses', question: { prompt: 'Practice: Evaluate expressions with parentheses. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Translating expressions with parentheses', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/v/translating-expressions-with-parentheses' },
            { label: 'Translate expressions with parentheses', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/e/translating-expressions-with-parentheses', question: { prompt: 'Practice: Translate expressions with parentheses. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Create expressions with parentheses', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-writing-expressions/e/creating-expressions-with-parenthesis', question: { prompt: 'Practice: Create expressions with parentheses. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Number patterns',
          items: [
            { label: 'Graphing patterns on coordinate plane', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/v/relationships-between-patterns' },
            { label: 'Interpreting patterns on coordinate plane', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/v/interpreting-relationships-between-patterns' },
            { label: 'Interpreting relationships in ordered pairs', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/v/interpreting-and-graphing-relationships-between-patterns' },
            { label: 'Graphing sequence relationships', type: 'video', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/v/sequence-relationship-example' },
            { label: 'Rules that relate 2 variables', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/e/write-a-2-variable-relationship', question: { prompt: 'Practice: Rules that relate 2 variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Tables from rules that relate 2 variables', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/e/create-a-table-or-coordinates-from-a-given-rule', question: { prompt: 'Practice: Tables from rules that relate 2 variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graphs of rules that relate 2 variables', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/e/graph-a-2-variable-relationship', question: { prompt: 'Practice: Graphs of rules that relate 2 variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Extend patterns', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/e/extend-patterns', question: { prompt: 'Practice: Extend patterns. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Relationships between 2 patterns', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/e/visualizing-and-interpreting-relationships-between-patterns', question: { prompt: 'Practice: Relationships between 2 patterns. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Algebraic thinking: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-algebraic-thinking/imp-number-patterns/a/algebraic-thinking-faq' },
          ],
        },
      ],
    },
    {
      name: 'Converting units of measure',
      lessons: [
        {
          name: 'Converting units of time',
          items: [
            { label: 'Converting units: minutes to hours', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-units-of-time/v/minutes-to-hours' },
            { label: 'Convert units of time', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-units-of-time/e/convert-units-of-time', question: { prompt: 'Practice: Convert units of time. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Converting units of time review (seconds, minutes, & hours)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-units-of-time/a/converting-units-of-time-review' },
          ],
        },
        {
          name: 'Converting metric units',
          items: [
            { label: 'Converting units: metric distance', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/v/ordering-metric-distances' },
            { label: 'Converting units: centimeters to meters', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/v/cm-to-meters' },
            { label: 'Convert units (metrics)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/e/converting-units', question: { prompt: 'Practice: Convert units (metrics). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Metric units of mass review (g and kg)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/a/metric-units-of-mass-review' },
            { label: 'Metric units of length review (mm, cm, m, & km)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/a/metric-units-of-length-review' },
            { label: 'Metric units of volume review (L and mL)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/a/metric-units-of-volume-review' },
            { label: 'U.S. customary and metric units', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-conversion/v/u-s-customary-and-metric-units' },
          ],
        },
        {
          name: 'Converting metric units word problems',
          items: [
            { label: 'Measurement word problem: tea party', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-metric-units-word-problems/v/unit-word-problem-example' },
            { label: 'Time word problem: Susan\'s break', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-metric-units-word-problems/v/time-word-problem' },
            { label: 'Convert units word problems (metrics)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-metric-units-word-problems/e/convert-units-word-problems--metrics-', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Convert units multi-step word problems (metric)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-metric-units-word-problems/e/converting-measurements-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Converting US Customary units',
          items: [
            { label: 'Converting units: US volume', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/v/converting-gallons-to-quarts-pints-and-cups' },
            { label: 'Same length in different units', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/v/unit-conversion-with-fractions' },
            { label: 'Convert units (US customary)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/e/converting-units--us-customary-', question: { prompt: 'Practice: Convert units (US customary). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'US Customary units of length review (in, ft, yd, & mi)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/a/us-customary-units-of-length-review' },
            { label: 'US Customary units of weight review (oz & lb)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/a/us-customary-units-of-mass-review' },
            { label: 'US Customary units of volume review (c, pt, qt, & gal)', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/imp-unit-measurement-word-problems/a/us-customary-units-of-volume-review' },
          ],
        },
        {
          name: 'Converting US Customary units word problems',
          items: [
            { label: 'Measurement word problem: running laps', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/v/converting-units-of-length' },
            { label: 'Measurement word problem: elevator', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/v/application-problems-involving-units-of-weight' },
            { label: 'Measurement word problem: blood drive', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/v/solving-application-problems-involving-units-of-volume' },
            { label: 'Measurement word problem: distance home', type: 'video', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/v/unit-conversion-word-problem' },
            { label: 'Convert units word problems (US customary)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/e/convert-units-word-problems--us-customary-', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Convert units multi-step word problems (US customary)', type: 'exercise', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/e/converting-units-word-problems--us-customary-', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Converting units of measurement: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/imp-measurement-and-data-3/converting-us-customary-units-word-problems/a/converting-units-of-measurement-faq' },
          ],
        },
      ],
    },
    {
      name: 'Line plots',
      lessons: [
        {
          name: 'Graph data on line plots',
          items: [
            { label: 'Making line plots with fractional data', type: 'video', href: '/math/cc-fifth-grade-math/line-plots/graph-data-on-line-plots/v/making-line-plots-with-fractional-data' },
            { label: 'Graph data on line plots (through 1/8 of a unit)', type: 'exercise', href: '/math/cc-fifth-grade-math/line-plots/graph-data-on-line-plots/e/graph-data-on-line-plots--through-1-8-of-a-unit-', question: { prompt: 'Practice: Graph data on line plots (through 1/8 of a unit). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Interpret data on line plots',
          items: [
            { label: 'Interpreting line plots with fractions', type: 'video', href: '/math/cc-fifth-grade-math/line-plots/imp-data/v/interpreting-line-plots' },
            { label: 'Reading a line plot with fractions', type: 'video', href: '/math/cc-fifth-grade-math/line-plots/imp-data/v/interpreting-data-in-line-plots' },
            { label: 'Interpret line plots', type: 'exercise', href: '/math/cc-fifth-grade-math/line-plots/imp-data/e/interpret-line-plots', question: { prompt: 'Practice: Interpret line plots. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpret line plots with fraction addition and subtraction', type: 'exercise', href: '/math/cc-fifth-grade-math/line-plots/imp-data/e/interpreting-line-plots-with-fraction-addition-and-subtraction', question: { prompt: 'What is 12 + 8 - 4?', answer: '16', explanation: 'Compute left to right: 12+8=20, then minus 4 = 16.' } },
            { label: 'Line plot distribution: trail mix', type: 'video', href: '/math/cc-fifth-grade-math/line-plots/imp-data/v/redistributing-trail-mix' },
            { label: 'Interpret dot plots with fraction operations', type: 'exercise', href: '/math/cc-fifth-grade-math/line-plots/imp-data/e/interpreting-line-plots-with-fraction-multiplication-and-division', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
      ],
    },
    {
      name: 'Properties of shapes',
      lessons: [
        {
          name: 'Triangles',
          items: [
            { label: 'Classifying triangles', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/5th-triangles/v/scalene-isosceles-equilateral-acute-right-obtuse' },
            { label: 'Classifying triangles by angles', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/5th-triangles/v/scalene-isosceles-equilateral-from-angle' },
            { label: 'Classify triangles by both sides and angles', type: 'exercise', href: '/math/cc-fifth-grade-math/properties-of-shapes/5th-triangles/e/classify-triangles-by-both-sides-and-angles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Quadrilaterals',
          items: [
            { label: 'Intro to quadrilateral', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/v/quadrilateral-overview' },
            { label: 'Quadrilateral properties', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/v/quadrilateral-properties' },
            { label: 'Identify quadrilaterals', type: 'exercise', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/e/identify-quadrilaterals', question: { prompt: 'Practice: Identify quadrilaterals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Kites as a geometric shape', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/v/kites-as-a-mathematical-shape' },
            { label: 'Quadrilateral types', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/v/quadrilateral-types-exercise' },
            { label: 'Classifying quadrilaterals', type: 'video', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/v/classifying-shapes' },
            { label: 'Quadrilaterals review', type: 'article', href: '/math/cc-fifth-grade-math/properties-of-shapes/imp-quadrilaterals-2/a/quadrilaterals-review' },
          ],
        },
        {
          name: 'Properties of shapes',
          items: [
            { label: 'Classifying shapes', type: 'exercise', href: '/math/cc-fifth-grade-math/properties-of-shapes/properties-shapes/e/classifying-shapes', question: { prompt: 'Practice: Classifying shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Properties of shapes', type: 'exercise', href: '/math/cc-fifth-grade-math/properties-of-shapes/properties-shapes/e/properties-of-shapes', question: { prompt: 'Practice: Properties of shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Polygons review', type: 'article', href: '/math/cc-fifth-grade-math/properties-of-shapes/properties-shapes/a/polygons-review' },
            { label: 'Properties of shapes: FAQ', type: 'article', href: '/math/cc-fifth-grade-math/properties-of-shapes/properties-shapes/a/properties-of-shapes-faq' },
          ],
        },
      ],
    },
  ],
};
