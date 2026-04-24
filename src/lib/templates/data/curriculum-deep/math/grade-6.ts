import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '6',
  label: '6th Grade',
  sourceUrl: 'https://www.khanacademy.org/math/cc-sixth-grade-math',
  units: [
    {
      name: 'Ratios',
      lessons: [
        {
          name: 'Intro to ratios',
          items: [
            { label: 'Intro to ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/intro-to-ratios/v/ratios-intro' },
            { label: 'Basic ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/intro-to-ratios/v/ratio-example-problems' },
            { label: 'Part:whole ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/intro-to-ratios/v/ratios-as-fractions' },
            { label: 'Ratio review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/intro-to-ratios/a/intro-to-ratios' },
          ],
        },
        {
          name: 'Visualize equivalent ratios',
          items: [
            { label: 'Ratios with tape diagrams', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/v/ratios-with-tape-diagrams' },
            { label: 'Ratios with tape diagrams (part:whole)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/v/ratios-with-tape-diagrams-partwhole' },
            { label: 'Equivalent ratio word problems', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/v/ratio-word-problem-examples' },
            { label: 'Simplify a ratio from a tape diagram', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/v/simplify-a-ratio-from-a-tape-diagram' },
            { label: 'Equivalent ratios with equal groups', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/e/equivalent-ratio-word-problems--basic-', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Ratios and double number lines', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/v/ratios-and-double-number-lines' },
            { label: 'Create double number lines', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/e/create-double-number-lines', question: { prompt: 'Practice: Create double number lines. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Ratios with double number lines', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/e/ratios-with-double-number-lines', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Relate double number lines and ratio tables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/visualize-ratios/e/relate-double-numbers-lines-and-ratio-tables', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Equivalent ratios',
          items: [
            { label: 'Ratio tables', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/a/ratio-tables' },
            { label: 'Solving ratio problems with tables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/v/solving-ratio-problems-with-tables-exercise' },
            { label: 'Equivalent ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/v/equivalent-ratios' },
            { label: 'Equivalent ratios: recipe', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/v/ratios-for-recipes' },
            { label: 'Equivalent ratio word problems', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/ratio_word_problems', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Understanding equivalent ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/v/understanding-equivalent-ratios' },
            { label: 'Equivalent ratios in the real world', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/equivalent-ratios-in-the-real-world', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Interpreting unequal ratios', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/v/interpreting-unequal-ratios' },
            { label: 'Understand equivalent ratios in the real world', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/understand-equivalent-ratios', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Ratio application',
          items: [
            { label: 'Ratios on coordinate plane', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratios-on-coordinate-plane' },
            { label: 'Ratios and measurement', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratios-and-measurement' },
            { label: 'Ratios and units of measurement', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/e/ratios-and-units-of-measurement', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Part to whole ratio word problem using tables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratio-word-problem-exercise-example-1' },
            { label: 'Part-part-whole ratios', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/e/part-part-whole-ratios', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Ratios FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/a/ratios-faq' },
          ],
        },
      ],
    },
    {
      name: 'Arithmetic with rational numbers',
      lessons: [
        {
          name: 'Adding decimals',
          items: [
            { label: 'Adding decimals: 9.087+15.31', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-decimals/v/adding-decimals-example-1' },
            { label: 'Adding decimals: 0.822+5.65', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-decimals/v/adding-decimals-example-2' },
            { label: 'Adding three decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-decimals/v/adding-decimals' },
            { label: 'Adding decimals: thousandths', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-decimals/e/adding_decimals_2', question: { prompt: 'Practice: Adding decimals: thousandths. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Subtracting decimals',
          items: [
            { label: 'Subtracting decimals: 9.005 - 3.6', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-sub-decimals/v/subtracting-decimals' },
            { label: 'Subtracting decimals: 39.1 - 0.794', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-sub-decimals/v/subtracting-decimals-up-to-thousandths-place' },
            { label: 'Subtracting decimals: thousandths', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-sub-decimals/e/subtracting_decimals_2', question: { prompt: 'Practice: Subtracting decimals: thousandths. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Adding and subtracting decimals word problems',
          items: [
            { label: 'Adding decimals word problem', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-sub-decimals-word-problems/v/adding-decimals-word-problem' },
            { label: 'Adding & subtracting decimals word problem', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-sub-decimals-word-problems/v/subtracting-decimals-word-problem' },
            { label: 'Adding & subtracting decimals word problems', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-add-sub-decimals-word-problems/e/adding_and_subtracting_decimals_word_problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Dividing fractions and whole numbers',
          items: [
            { label: 'Dividing a fraction by a whole number', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/v/visually-dividing-a-fraction-by-a-whole-number' },
            { label: 'Divide fractions by whole numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/e/divide-fractions-by-whole-numbers', question: { prompt: 'What is 1/2 ÷ 1/4?', answer: '2', explanation: 'Multiply by reciprocal: 1/2 × 4/1 = 2.' } },
            { label: 'Meaning of the reciprocal', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/v/meaning-of-the-reciprocal' },
            { label: 'Dividing a whole number by a fraction', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/v/whole-number-divided-by-a-fraction-example' },
            { label: 'Dividing a whole number by a fraction with reciprocal', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/v/dividing-a-whole-number-by-a-fraction-with-reciprocal' },
            { label: 'Divide whole numbers by fractions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/x0267d782:dividing-fractions-and-whole-numbers/e/divide-whole-numbers-by-fractions', question: { prompt: 'Practice: Divide whole numbers by fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dividing fractions by fractions',
          items: [
            { label: 'Understanding division of fractions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/conceptual-understanding-of-dividing-fractions-by-fractions' },
            { label: 'Dividing fractions: 2/5 ÷ 7/3', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/another-dividing-fractions-example' },
            { label: 'Dividing fractions: 3/5 ÷ 1/2', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/dividing-fractions-example' },
            { label: 'Dividing fractions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/e/dividing_fractions_1.5', question: { prompt: 'Practice: Dividing fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing mixed numbers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/dividing-mixed-numbers-example' },
            { label: 'Divide mixed numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/e/divide-mixed-numbers', question: { prompt: 'Convert 7/3 to a mixed number.', answer: '2 1/3', explanation: '3 goes into 7 two times with 1 left, so 2 and 1/3.' } },
            { label: 'Writing fraction division story problems', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/writing-fraction-division-story-problems' },
            { label: 'Interpret fraction division', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/e/interpret-fraction-division', question: { prompt: 'Practice: Interpret fraction division. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing whole numbers & fractions: t-shirts', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/dividing-fractions-word-problem' },
            { label: 'Area with fraction division example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/v/area-with-fraction-division-example' },
            { label: 'Dividing fractions word problems', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/e/dividing-fractions-by-fractions-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Dividing fractions review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-fractions/a/dividing-fractions-review' },
          ],
        },
        {
          name: 'Multiplying decimals',
          items: [
            { label: 'Intro to multiplying decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-multiplying-decimals/v/intro-to-multiplying-decimals' },
            { label: 'Decimal multiplication place value', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-multiplying-decimals/v/decimal-multiplication-place-value' },
            { label: 'Multiplying challenging decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-multiplying-decimals/v/more-involved-multiplying-decimals-example' },
            { label: 'Multiplying decimals like 0.847x3.54 (standard algorithm)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-multiplying-decimals/e/multiplying_decimals', question: { prompt: 'Practice: Multiplying decimals like 0.847x3.54 (standard algorithm). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dividing whole numbers',
          items: [
            { label: 'Dividing by 2-digits: 9815÷65', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-div-whole-numbers/v/dividing-2-digits-no-remainder' },
            { label: 'Dividing by 2-digits: 7182÷42', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-div-whole-numbers/v/dividing-by-a-two-digit-number' },
            { label: 'Division by 2-digits', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-div-whole-numbers/e/division_3', question: { prompt: 'Practice: Division by 2-digits. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multi-digit division', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-div-whole-numbers/e/division_4', question: { prompt: 'What is 256 ÷ 8?', answer: '32', explanation: '256 ÷ 8 = 32.' } },
          ],
        },
        {
          name: 'Dividing decimals',
          items: [
            { label: 'Dividing whole numbers to get a decimal', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-completely-to-get-decimal-answer' },
            { label: 'Divide whole numbers to get a decimal', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/e/dividing_decimals_0.5', question: { prompt: 'Practice: Divide whole numbers to get a decimal. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing a decimal by a whole number', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-a-decimal-by-a-whole-number' },
            { label: 'Dividing a whole number by a decimal', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-a-whole-number-by-a-decimal' },
            { label: 'Dividing decimals with hundredths', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-decimals-with-hundredths' },
            { label: 'Dividing decimals completely', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-decimals-completely' },
            { label: 'Long division with decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/long-division-with-decimals' },
            { label: 'Dividing decimals: hundredths', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/e/dividing_decimals_3', question: { prompt: 'Practice: Dividing decimals: hundredths. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing by a multi-digit decimal', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/v/dividing-decimals' },
            { label: 'Dividing decimals: thousandths', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/e/dividing_decimals', question: { prompt: 'Practice: Dividing decimals: thousandths. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Arithmetic with rational numbers FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-dividing-decimals/a/arithmetic-with-rational-numbers-faq' },
          ],
        },
      ],
    },
    {
      name: 'Rates and percentages',
      lessons: [
        {
          name: 'Intro to rates',
          items: [
            { label: 'Intro to rates', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/v/introduction-to-rates' },
            { label: 'Solving unit rate problem', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/v/finding-unit-rates' },
            { label: 'Solving unit price problem', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/v/finding-unit-prices' },
            { label: 'Unit rates', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/e/unit-rates', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Rate problems', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/v/rate-problems' },
            { label: 'Comparing rates example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/v/practice-computing-and-comparing-rates' },
            { label: 'Comparing rates', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/e/comparing-rates', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Rate review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-rates/a/rate-review' },
          ],
        },
        {
          name: 'Intro to percents',
          items: [
            { label: 'The meaning of percent', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percentages/v/describing-the-meaning-of-percent' },
            { label: 'Meaning of 109%', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percentages/v/describing-the-meaning-of-percent-2' },
            { label: 'Intro to percents', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percentages/e/intro-to-percents', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
            { label: 'Percents from fraction models', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percentages/v/percent-from-fraction-models' },
          ],
        },
        {
          name: 'Visualize percents',
          items: [
            { label: 'Finding percentages with a double number line', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:visualize-percents/v/finding-percentages-with-a-double-number-line' },
            { label: 'Finding the whole with a tape diagram', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:visualize-percents/v/finding-the-whole-with-a-tape-diagram' },
            { label: 'Find percents visually', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:visualize-percents/e/find-percents-visually', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
          ],
        },
        {
          name: 'Equivalent representations of percent problems',
          items: [
            { label: 'Fraction, decimal, and percent from visual model', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/v/fraction-decimal-and-percent-from-visual-model' },
            { label: 'Converting percents to decimals & fractions example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/v/representing-a-number-as-a-decimal-percent-and-fraction' },
            { label: 'Percent of a whole number', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/v/taking-a-percentage-example' },
            { label: 'Ways to rewrite a percentage', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/v/ways-to-rewrite-a-percentage' },
            { label: 'Converting between percents, fractions, & decimals', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/a/converting-between-percents-fractions-decimals' },
            { label: 'Equivalent representations of percent problems', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/e/equivalent-representations-of-percent-problems', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
            { label: 'Finding common percentages', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/v/common-percentages' },
            { label: 'Benchmark percents', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/e/benchmark-percents', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
            { label: 'Converting percents and fractions review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/a/converting-percents-and-fractions-review' },
            { label: 'Converting decimals and percents review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/x0267d782:equivalent-representations-of-percent-problems/a/rewriting-decimals-and-percents-review' },
          ],
        },
        {
          name: 'Percent problems',
          items: [
            { label: 'Finding a percent', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percent-problems/v/finding-percentages-example' },
            { label: 'Finding percents', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percent-problems/e/finding_percents', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
          ],
        },
        {
          name: 'Percent word problems',
          items: [
            { label: 'Percent word problem: recycling cans', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percent-word-problems/v/percent-word-problems' },
            { label: 'Percent word problems', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percent-word-problems/e/percentage_word_problems_1', question: { prompt: 'What is 25% of 80?', answer: '20', explanation: '25% = 1/4 and 80 ÷ 4 = 20.' } },
            { label: 'Rates and percentages FAQ', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-rates-and-percentages/cc-6th-percent-word-problems/a/rates-and-percentages-faq' },
          ],
        },
      ],
    },
    {
      name: 'Exponents and order of operations',
      lessons: [
        {
          name: 'Meaning of exponents',
          items: [
            { label: 'Intro to exponents', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-exponents/v/introduction-to-exponents' },
            { label: 'Squaring numbers', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-exponents/a/squaring-numbers' },
            { label: 'Meaning of exponents', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-exponents/e/positive_and_zero_exponents', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Exponents review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-exponents/a/exponents-review' },
          ],
        },
        {
          name: 'Powers of whole numbers',
          items: [
            { label: 'The zeroth power', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:powers-of-whole-numbers/v/the-zeroth-power' },
            { label: 'Powers of whole numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:powers-of-whole-numbers/e/exponents', question: { prompt: 'Practice: Powers of whole numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Powers of fractions and decimals',
          items: [
            { label: 'Exponents of decimals', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:powers-of-fractions-and-decimals/v/exponents-of-decimals' },
            { label: 'Powers of fractions', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:powers-of-fractions-and-decimals/v/powers-of-fractions' },
            { label: 'Powers of fractions & decimals', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:powers-of-fractions-and-decimals/e/powers-of-fractions', question: { prompt: 'Practice: Powers of fractions & decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Order of operations introduction',
          items: [
            { label: 'Order of operations introduction', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/order-operations-intro' },
            { label: 'Worked example: Order of operations (PEMDAS)', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/more-complicated-order-of-operations-example' },
            { label: 'Order of operations (no exponents)', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/e/order-of-operations--no-exponents-', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'More on order of operations',
          items: [
            { label: 'Order of operations examples: exponents', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/v/order-of-operations-with-exponents-examples' },
            { label: 'Comparing exponent expressions', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/v/comparing-exponent-expressions' },
            { label: 'Order of operations', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/e/order_of_operations_2', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Order of operations example: fractions and exponents', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/v/order-operations-example-fractions-exponents' },
            { label: 'Order of operations with fractions and exponents', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/e/evaluating-numerical-expressions-with-exponents', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Order of operations review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/order-of-operations-review' },
            { label: 'Exponents and order of operations FAQ', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/exponents-and-order-of-operations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Negative numbers',
      lessons: [
        {
          name: 'Intro to negative numbers',
          items: [
            { label: 'Introduction to negative numbers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-num-intro/v/introduction-to-negative-numbers' },
            { label: 'Intro to negative numbers', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-num-intro/a/intro-to-negative-numbers' },
            { label: 'Negative numbers on the number line', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-num-intro/e/number_line_2', question: { prompt: 'What is -3 + 5?', answer: '2', explanation: 'Adding 5 to -3 gives 2.' } },
            { label: 'Interpreting negative numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-num-intro/e/negative_number_word_problems', question: { prompt: 'What is -3 + 5?', answer: '2', explanation: 'Adding 5 to -3 gives 2.' } },
          ],
        },
        {
          name: 'Negative symbol as opposite',
          items: [
            { label: 'Negative symbol as opposite', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/negative-symbol-as-opposite/v/negative-symbol-as-opposite' },
            { label: 'Number opposites', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/negative-symbol-as-opposite/v/opposite-of-a-number' },
            { label: 'Number opposites review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/negative-symbol-as-opposite/a/number-opposites-review' },
          ],
        },
        {
          name: 'Rational numbers on the number line',
          items: [
            { label: 'Negative decimals on the number line', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-dec-frac-number-line/v/positive-and-negative-decimals-on-a-number-line' },
            { label: 'Decimals & fractions on the number line', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-dec-frac-number-line/v/points-on-a-number-line' },
            { label: 'Negative fractions on the number line', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-dec-frac-number-line/e/fractions_on_the_number_line_3', question: { prompt: 'On a number line from 0 to 1, where is 3/4?', answer: '3/4 of the way from 0 to 1', explanation: 'Divide the line into 4 equal parts; 3/4 is at the third mark.' } },
          ],
        },
        {
          name: 'Comparing negative numbers',
          items: [
            { label: 'Compare rational numbers using a number line', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-comparing-negative-numbers/v/compare-rational-numbers-using-a-number-line' },
            { label: 'Compare rational numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-comparing-negative-numbers/e/ordering-rational-numbers', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Numerical inequality word problems', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-comparing-negative-numbers/v/writing-numerical-inequalities-exercise' },
            { label: 'Writing numerical inequalities', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-comparing-negative-numbers/e/writing-numerical-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
          ],
        },
        {
          name: 'Ordering rational numbers',
          items: [
            { label: 'Ordering negative numbers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:ordering-rational-numbers/v/ordering-negative-numbers' },
            { label: 'Ordering small negative numbers', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:ordering-rational-numbers/e/ordering-small-negative-numbers', question: { prompt: 'What is -3 + 5?', answer: '2', explanation: 'Adding 5 to -3 gives 2.' } },
            { label: 'Ordering rational numbers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:ordering-rational-numbers/v/ordering-rational-numbers' },
          ],
        },
        {
          name: 'Intro to absolute value',
          items: [
            { label: 'Absolute value examples', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-absolute-value/v/absolute-value-of-integers' },
            { label: 'Intro to absolute value', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-absolute-value/a/intro-to-absolute-value' },
            { label: 'Meaning of absolute value', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-absolute-value/v/meaning-of-absolute-value' },
            { label: 'Finding absolute values', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-absolute-value/e/absolute_value', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Absolute value review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-absolute-value/a/absolute-value-review' },
          ],
        },
        {
          name: 'Comparing absolute values',
          items: [
            { label: 'Comparing absolute values on the number line', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/v/comparing-absolute-values-on-number-line' },
            { label: 'Compare and order absolute values', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/e/comparing_absolute_values', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Placing absolute values on the number line', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/v/sorting-absolute-values-on-number-line' },
            { label: 'Comparing absolute values', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/v/comparing-absolute-values' },
            { label: 'Testing solutions to absolute value inequalities', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/v/values-to-make-absolute-value-inequality-true' },
            { label: 'Comparing absolute values challenge', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/e/comparing-absolute-values-2', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Interpreting absolute value', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/v/interpreting-absolute-value' },
            { label: 'Negative numbers FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-negative-number-topic/x0267d782:cc-6th-comparing-absolute-values/a/negative-numbers-faq' },
          ],
        },
      ],
    },
    {
      name: 'Variables & expressions',
      lessons: [
        {
          name: 'Properties of numbers',
          items: [
            { label: 'Properties of addition', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/properties-of-numbers/a/properties-of-addition' },
            { label: 'Properties of multiplication', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/properties-of-numbers/a/properties-of-multiplication' },
          ],
        },
        {
          name: 'Whole numbers & integers',
          items: [
            { label: 'Whole numbers & integers', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/whole-numbers-integers/a/whole-numbers-integers' },
          ],
        },
        {
          name: 'Parts of algebraic expressions',
          items: [
            { label: 'What is a variable?', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-evaluating-expressions/v/what-is-a-variable' },
            { label: 'Terms, factors, & coefficients', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-evaluating-expressions/v/expression-terms-factors-and-coefficients' },
            { label: 'Why aren\'t we using the multiplication sign?', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-evaluating-expressions/v/why-aren-t-we-using-the-multiplication-sign' },
            { label: 'Parts of algebraic expressions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-evaluating-expressions/e/identifying-parts-of-expressions', question: { prompt: 'Practice: Parts of algebraic expressions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Terms, factors, and coefficients review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-evaluating-expressions/a/terms-factors-and-coefficients-review' },
          ],
        },
        {
          name: 'Substitution & evaluating expressions',
          items: [
            { label: 'Evaluating an expression with one variable', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-substitution/v/variables-and-expressions-1' },
            { label: 'Evaluating expressions with one variable', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-substitution/e/evaluating_expressions_1', question: { prompt: 'Practice: Evaluating expressions with one variable. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Evaluating exponent expressions with variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-substitution/v/evaluating-exponent-expressions-with-variables' },
            { label: 'Evaluating expressions like 5x² & ⅓(6)ˣ', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-substitution/v/evaluating-expressions-5x2' },
            { label: 'Variable expressions with exponents', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-substitution/e/exponents-in-expressions', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Evaluating expressions with multiple variables',
          items: [
            { label: 'Evaluating expressions with two variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/x0267d782:expressions-with-multiple-variables/v/evaluating-expressions-in-two-variables' },
            { label: 'Evaluating expressions with multiple variables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/x0267d782:expressions-with-multiple-variables/e/evaluating_expressions_2', question: { prompt: 'Practice: Evaluating expressions with multiple variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Evaluating expressions with two variables: fractions & decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/x0267d782:expressions-with-multiple-variables/v/evaluating-expressions-in-two-variables-with-decimals-and-fractions' },
            { label: 'Evaluating expressions with multiple variables: fractions & decimals', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/x0267d782:expressions-with-multiple-variables/e/evaluating-expressions-in-two-variables-2', question: { prompt: 'Practice: Evaluating expressions with multiple variables: fractions & decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Expression value intuition',
          items: [
            { label: 'Expression value intuition', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/expression-value-intuition/v/expression-value-change-examples' },
          ],
        },
        {
          name: 'Evaluating expressions word problems',
          items: [
            { label: 'Evaluating expressions with variables: temperature', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-7th-evaluating-expressions-word-problems/v/evaluate-a-formula-using-substitution' },
            { label: 'Evaluating expressions with variables word problems', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-7th-evaluating-expressions-word-problems/a/evaluating-expressions-with-variables-in-word-problems' },
            { label: 'Evaluating expressions with variables: cubes', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-7th-evaluating-expressions-word-problems/v/evaluating-expressions-3-exercise' },
            { label: 'Evaluating expressions with variables: exponents', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-7th-evaluating-expressions-word-problems/v/evaluating-exponential-expressions' },
          ],
        },
        {
          name: 'Writing algebraic expressions introduction',
          items: [
            { label: 'Writing basic expressions with variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-writing-expressions/v/writing-expressions-with-variables-examples' },
            { label: 'Writing algebraic subtraction expressions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-writing-expressions/v/algebraic-subtraction-expressions' },
            { label: 'Writing expressions with variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-writing-expressions/v/writing-expressions-1' },
            { label: 'Writing expressions with parentheses', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-writing-expressions/v/writing-expressions-parentheses' },
            { label: 'Writing expressions with variables & parentheses', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-writing-expressions/v/writing-expressions-2' },
          ],
        },
        {
          name: 'Writing basic algebraic expressions word problems',
          items: [
            { label: 'Writing basic expressions word problems', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/v/writing-basic-expressions-from-word-problems-examples' },
          ],
        },
        {
          name: 'Least common multiple',
          items: [
            { label: 'Least common multiple', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-lcm/v/least-common-multiple-exercise' },
            { label: 'Least common multiple: repeating factors', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-lcm/v/least-common-multiple-exercise-2' },
            { label: 'Least common multiple of three numbers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-lcm/v/least-common-multiple-lcm' },
            { label: 'Least common multiple review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-lcm/a/least-common-multiple-review' },
          ],
        },
        {
          name: 'Greatest common factor',
          items: [
            { label: 'Greatest common factor examples', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/v/greatest-common-divisor-factor-exercise' },
            { label: 'Greatest common factor explained', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/v/greatest-common-divisor' },
            { label: 'Greatest common factor', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/e/greatest_common_divisor', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
            { label: 'Factor with the distributive property', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/v/distributive-property-exercise-2' },
            { label: 'Factor with the distributive property (no variables)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/e/distributive_property', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
            { label: 'Greatest common factor review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-gcf/a/greatest-common-factor-review' },
          ],
        },
        {
          name: 'Distributive property with variables',
          items: [
            { label: 'Distributive property over addition', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-distributive-property/v/the-distributive-property' },
            { label: 'Distributive property over subtraction', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-distributive-property/v/the-distributive-property-2' },
            { label: 'Distributive property with variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-distributive-property/v/distributive-property-with-variables-exercise' },
            { label: 'Create equivalent expressions by factoring', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-distributive-property/e/create-equivalent-expressions-by-factoring', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
            { label: 'Factor with distributive property (variables)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-distributive-property/e/factor-with-distributive-property--variables-', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
          ],
        },
        {
          name: 'Combining like terms',
          items: [
            { label: 'Intro to combining like terms', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-combining-like-terms/v/combining-like-terms' },
            { label: 'Combining like terms', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-combining-like-terms/v/combining-like-terms-1' },
            { label: 'Combining like terms example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-combining-like-terms/v/combining-like-terms-2' },
          ],
        },
        {
          name: 'Equivalent expressions',
          items: [
            { label: 'Equivalent expressions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-equivalent-expressions/v/equivalent-algebraic-expressions-exercise' },
            { label: 'Variables and expressions FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-equivalent-expressions/a/variables-and-expressions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Equations & inequalities',
      lessons: [
        {
          name: 'Algebraic equations basics',
          items: [
            { label: 'Variables, expressions, & equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-intro-equations/v/variables-expressions-and-equations' },
            { label: 'Testing solutions to equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-intro-equations/v/testing-solutions-to-equation' },
            { label: 'Intro to equations', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-intro-equations/a/introduction-to-equations' },
          ],
        },
        {
          name: 'One-step equations intuition',
          items: [
            { label: 'Same thing to both sides of equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/v/why-we-do-the-same-thing-to-both-sides-simple-equations' },
            { label: 'Representing a relationship with an equation', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/v/representing-a-relationship-with-a-simple-equation' },
            { label: 'Dividing both sides of an equation', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/v/intuition-why-we-divide-both-sides' },
            { label: 'One-step equations intuition', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/v/one-step-equation-intuition' },
            { label: 'Identify equations from visual models (tape diagrams)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/e/identify-and-solve-equations-from-visual-models', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Identify equations from visual models (hanger diagrams)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/e/identify-equations-from-visual-models', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Solve equations from visual models', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-solving-equations/e/visualize-equations', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
          ],
        },
        {
          name: 'One-step addition & subtraction equations',
          items: [
            { label: 'One-step addition & subtraction equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/adding-and-subtracting-the-same-thing-from-both-sides' },
            { label: 'One-step addition equation', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/solving-one-step-equations' },
            { label: 'One-step addition & subtraction equations: fractions & decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/examples-of-one-step-equations-with-fractions-and-decimals' },
          ],
        },
        {
          name: 'One-step multiplication and division equations',
          items: [
            { label: 'One-step division equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-mult-div-equations/v/simple-equations' },
            { label: 'One-step multiplication equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-mult-div-equations/v/solving-one-step-equations-2' },
            { label: 'One-step multiplication & division equations', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-mult-div-equations/a/solving-one-step-multiplication-and-division-equations' },
            { label: 'One-step multiplication & division equations: fractions & decimals', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-mult-div-equations/v/one-step-multiplication-and-division-equations-with-fractions' },
            { label: 'One-step multiplication equations: fractional coefficients', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-mult-div-equations/v/one-step-multiplication-fractional-coefficients' },
          ],
        },
        {
          name: 'Finding mistakes in one-step equations',
          items: [
            { label: 'Finding mistakes in one-step equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/pre-algebra-one-step-equation-mistakes/v/finding-mistakes-in-one-step-equations' },
            { label: 'Find the mistake in one-step equations', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/pre-algebra-one-step-equation-mistakes/e/find-the-mistake-in-solving-one-step-equations', question: { prompt: 'Solve x + 7 = 12 for x.', answer: '5', explanation: 'Subtract 7: x = 5.' } },
          ],
        },
        {
          name: 'One-step equation word problems',
          items: [
            { label: 'Modeling with one-step equations', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-super-yoga/v/constructing-basic-equations-examples' },
            { label: 'Translate one-step equations and solve', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-super-yoga/e/translate-one-step-equations-and-solve--basic-', question: { prompt: 'Solve 2x + 3 = 11 for x.', answer: '4', explanation: 'Subtract 3: 2x=8, then divide by 2: x=4.' } },
            { label: 'Model with one-step equations', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-super-yoga/e/equations-in-one-variable-1', question: { prompt: 'Solve x + 7 = 12 for x.', answer: '5', explanation: 'Subtract 7: x = 5.' } },
            { label: 'Model with one-step equations and solve', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-super-yoga/e/model-with-one-step-equations-and-solve', question: { prompt: 'Solve 2x + 3 = 11 for x.', answer: '4', explanation: 'Subtract 3: 2x=8, then divide by 2: x=4.' } },
          ],
        },
        {
          name: 'Intro to inequalities with variables',
          items: [
            { label: 'Testing solutions to inequalities', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/v/testing-solutions-to-inequalities' },
            { label: 'Testing solutions to inequalities (basic)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/e/testing-solutions-to-inequalities--basic-', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Plotting inequalities', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/v/plotting-inequalities-on-a-number-line' },
            { label: 'Plotting an inequality example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/v/inequalities-on-a-number-line' },
            { label: 'Graphing basic inequalities', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/e/graphs-of-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Inequality from graph', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/e/inequality-from-graph', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Inequalities word problems', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/v/real-world-situations-with-inequalities' },
            { label: 'Graphing inequalities review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-inequalities/a/graphing-inequalities-review' },
          ],
        },
        {
          name: 'Dependent and independent variables',
          items: [
            { label: 'Dependent & independent variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/v/dependent-independent-variables' },
            { label: 'Independent versus dependent variables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/e/dependent-and-independent-variables', question: { prompt: 'Practice: Independent versus dependent variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dependent & independent variables: graphing', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/v/dependent-and-independent-variables-exercise-example-2' },
            { label: 'Tables from equations with 2 variables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/e/complete-a-table-from-a-two-variable-equation', question: { prompt: 'Practice: Tables from equations with 2 variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Match equations to coordinates on a graph', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/e/match-equations-to-coordinates-on-a-line', question: { prompt: 'Practice: Match equations to coordinates on a graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dependent and independent variables review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-dependent-independent/a/dependent-and-independent-variables-review' },
          ],
        },
        {
          name: 'Analyzing relationships between variables',
          items: [
            { label: 'Writing equations for relationships between quantities', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/x0267d782:cc-6th-analyzing-relationships/v/equations-relationships-quantities' },
            { label: 'Relationships between quantities in equations', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/x0267d782:cc-6th-analyzing-relationships/e/create-two-variable-equations-from-real-world-contexts', question: { prompt: 'Practice: Relationships between quantities in equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Analyzing relationships between variables', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/x0267d782:cc-6th-analyzing-relationships/v/analyzing-relationships-between-variables' },
            { label: 'Analyze relationships between variables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/x0267d782:cc-6th-analyzing-relationships/e/analyze-relationships-between-variables', question: { prompt: 'Practice: Analyze relationships between variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Equations and inequalities FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/x0267d782:cc-6th-analyzing-relationships/a/equations-and-inequalities-faq' },
          ],
        },
      ],
    },
    {
      name: 'Plane figures',
      lessons: [
        {
          name: 'Areas of parallelograms',
          items: [
            { label: 'Area of a parallelogram', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-parallelogram-area/v/intuition-for-area-of-a-parallelogram' },
            { label: 'Area of parallelograms', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-parallelogram-area/a/area-of-parallelogram' },
            { label: 'Finding height of a parallelogram', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-parallelogram-area/v/finding-height-of-a-parallelogram' },
            { label: 'Find missing length when given area of a parallelogram', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-parallelogram-area/e/find-missing-side-when-given-area-of-a-parallelogram', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
          ],
        },
        {
          name: 'Areas of triangles',
          items: [
            { label: 'Area of a triangle', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/v/intuition-for-area-of-a-triangle' },
            { label: 'Finding area of triangles', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/v/example-finding-area-of-triangle' },
            { label: 'Area of triangles', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/a/area-of-triangle' },
            { label: 'Find base and height on a triangle', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/e/find-base-and-height-on-a-triangle', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Area of right triangles', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/e/area-of-right-triangles', question: { prompt: 'Find the area of a triangle with base 6 and height 4.', answer: '12', explanation: 'Area = (1/2)bh = (1/2)(6)(4) = 12.' } },
            { label: 'Triangle missing side example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/v/triangle-missing-side-example' },
            { label: 'Find missing length when given area of a triangle', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area-triangle/e/find-length-when-given-area-of-a-triangle', question: { prompt: 'Find the area of a triangle with base 6 and height 4.', answer: '12', explanation: 'Area = (1/2)bh = (1/2)(6)(4) = 12.' } },
          ],
        },
        {
          name: 'Area of composite figures',
          items: [
            { label: 'Finding area by rearranging parts', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area/v/area-comparisons' },
            { label: 'Area of composite shapes', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area/v/area-breaking-up-shape' },
            { label: 'Area of quadrilateral with 2 parallel sides', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area/v/area-of-quadrilateral-with-2-parallel-sides' },
            { label: 'Decompose area with triangles', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area/e/decompose-area-with-triangles', question: { prompt: 'Find the area of a triangle with base 6 and height 4.', answer: '12', explanation: 'Area = (1/2)bh = (1/2)(6)(4) = 12.' } },
            { label: 'Plane figures FAQ', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:cc-6th-plane-figures/cc-6th-area/a/plane-figures-faq' },
          ],
        },
      ],
    },
    {
      name: 'Coordinate plane',
      lessons: [
        {
          name: 'Four quadrants',
          items: [
            { label: 'Points on the coordinate plane examples', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/the-coordinate-plane' },
            { label: 'Plotting a point (ordered pair)', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/plot-ordered-pairs' },
            { label: 'Finding the point not graphed', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/points-on-the-coordinate-plane' },
            { label: 'Points on the coordinate plane', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/a/points-on-the-coordinate-plane' },
            { label: 'Quadrants of the coordinate plane', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/quadrants-of-coordinate-plane' },
            { label: 'Points and quadrants example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/graphing-points-and-naming-quadrants-exercise' },
            { label: 'Quadrants on the coordinate plane', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/e/graphing_points_2', question: { prompt: 'Practice: Quadrants on the coordinate plane. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Coordinate plane parts review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/a/coordinate-plane-parts-review' },
            { label: 'Graphing coordinates review', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/a/graphing-coordinates-review' },
          ],
        },
        {
          name: 'Distance on the coordinate plane',
          items: [
            { label: 'Coordinate plane word problem examples', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/x0267d782:cc-6th-distance/v/coordinate-plane-word-problems-exercise' },
            { label: 'Distance between points: vertical or horizontal', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/x0267d782:cc-6th-distance/e/relative-position-on-the-coordinate-plane', question: { prompt: 'Practice: Distance between points: vertical or horizontal. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Coordinate plane problems in all four quadrants', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/x0267d782:cc-6th-distance/e/coordinate-plane-word-problems', question: { prompt: 'Practice: Coordinate plane problems in all four quadrants. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Polygons on the coordinate plane',
          items: [
            { label: 'Drawing a quadrilateral on the coordinate plane example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/constructing-polygon-on-coordinate-plane-example' },
            { label: 'Drawing polygons with coordinates', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/e/drawing-polygons', question: { prompt: 'Practice: Drawing polygons with coordinates. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Area of a parallelogram on the coordinate plane', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/area-of-parallelogram-on-coordinate-plane' },
            { label: 'Area and perimeter on the coordinate plane', type: 'exercise', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/e/area-and-perimeter-on-the-coordinate-plane', question: { prompt: 'What is the perimeter of a rectangle with sides 3 and 3?', answer: '12', explanation: 'Perimeter = 2(l+w) = 2(3+3) = 12.' } },
            { label: 'Coordinates of a missing vertex', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/finding-coordinates-of-missing-vertex-example' },
            { label: 'Example of shapes on a coordinate plane', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/example-of-shapes-on-a-coordinate-plane' },
            { label: 'Dimensions of a rectangle from coordinates', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/dimensions-of-rectangle-from-coordinates-example' },
            { label: 'Coordinates of rectangle example', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/coordinates-of-rectangle-example' },
            { label: 'Quadrilateral problems on the coordinate plane', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/a/rectangles-on-the-coordinate-plane-examples' },
            { label: 'Parallelogram on the coordinate plane', type: 'video', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/v/analyzing-polygon-on-the-coordinate-plane' },
            { label: 'Coordinate plane FAQ', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-quadrilaterals-on-plane/a/coordinate-plane-faq' },
          ],
        },
      ],
    },
    {
      name: '3D figures',
      lessons: [
        {
          name: 'Geometric solids (3D shapes)',
          items: [
            { label: 'Counting faces and edges of 3D shapes', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/geometric-solids/v/counting-faces-and-edges-of-3d-shapes' },
            { label: 'Identify parts of 3D shapes', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/geometric-solids/e/identify-parts-of-3d-shapes', question: { prompt: 'Practice: Identify parts of 3D shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Recognizing common 3D shapes', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/geometric-solids/v/recognizing-common-3d-shapes' },
            { label: 'Identify geometric solids (3D shapes)', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/geometric-solids/e/identify-geometric-solids--3d-figures-', question: { prompt: 'Practice: Identify geometric solids (3D shapes). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Volume with mini cubes',
          items: [
            { label: 'Volume with cubes of fractional side lengths', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-volume-with-mini-cubes/a/volume-with-cubes-of-fractional-side-lengths' },
            { label: 'Volume with fractional cubes', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-volume-with-mini-cubes/v/volume-of-a-rectangular-prism-with-fractional-cubes' },
          ],
        },
        {
          name: 'Volume with fractions',
          items: [
            { label: 'Volume of a rectangular prism: fractional dimensions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/v/volume-of-a-rectangular-prism-with-fractional-dimensions' },
            { label: 'Volume by multiplying area of base times height', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/e/find-volume-by-multiplying-area-of-base-times-height', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume with fractions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/e/volume_with_fractions', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'How volume changes from changing dimensions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/v/how-volume-changes-from-changing-dimensions' },
            { label: 'Volume of a rectangular prism: word problem', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/v/marbles-in-tank-volume' },
            { label: 'Volume word problems: fractions & decimals', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-volume-with-fractions/e/volume-word-problems-with-fractions', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
          ],
        },
        {
          name: 'Nets of 3D figures',
          items: [
            { label: 'Intro to nets of polyhedra', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/v/nets-of-polyhedra' },
            { label: 'Nets of polyhedra', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/e/nets-of-3d-figures', question: { prompt: 'Practice: Nets of polyhedra. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Surface area using a net: triangular prism', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/v/finding-surface-area-using-net' },
            { label: 'Surface area using a net: rectangular prism', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/v/surface-area-from-net' },
            { label: 'Surface area of a box (cuboid)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/v/surface-area-of-a-box' },
            { label: 'Surface area of a box using nets', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/v/surface-area-of-a-box-using-nets' },
            { label: 'Surface area using nets', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/x0267d782:cc-6th-nets-of-3d-figures/e/surface-area', question: { prompt: 'Practice: Surface area using nets. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Surface area',
          items: [
            { label: 'Expressions to find surface area', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/e/find-surface-area-by-adding-areas-of-faces', question: { prompt: 'Practice: Expressions to find surface area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Surface area', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/e/surface-areas', question: { prompt: 'Practice: Surface area. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Surface area versus volume', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/a/surface-area-versus-volume' },
            { label: 'Surface area word problem example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/v/surface-area-word-problem-example' },
            { label: 'Surface area word problems', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/e/surface-area-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Surface area review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/a/surface-area-review' },
            { label: '3D figures FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-geometry-topic/cc-6th-surface-area/a/3d-figures-faq' },
          ],
        },
      ],
    },
    {
      name: 'Data and statistics',
      lessons: [
        {
          name: 'Statistical questions',
          items: [
            { label: 'Statistical questions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-statistical-questions/v/understanding-statistical-questions' },
          ],
        },
        {
          name: 'Dot plots & frequency tables',
          items: [
            { label: 'Representing data', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/v/ways-to-represent-data' },
            { label: 'Frequency tables & dot plots', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/v/frequency-tables-and-dot-plots' },
            { label: 'Creating frequency tables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/e/creating-frequency-tables', question: { prompt: 'Practice: Creating frequency tables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Creating dot plots', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/e/creating-dot-plots', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
            { label: 'Reading dot plots & frequency tables', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/e/analyzing-with-dot-plots', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
            { label: 'Estimate center using dot plots', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/dot-plot/e/estimate-center-using-dot-plots', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
          ],
        },
        {
          name: 'Histograms',
          items: [
            { label: 'Creating a histogram', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/histograms/v/histograms-intro' },
            { label: 'Interpreting a histogram', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/histograms/v/interpreting-histograms' },
            { label: 'Create histograms', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/histograms/e/creating-histograms', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
            { label: 'Read histograms', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/histograms/e/reading-histograms', question: { prompt: 'A bar graph shows 3 cats and 5 dogs. How many more dogs than cats?', answer: '2', explanation: '5 - 3 = 2.' } },
          ],
        },
        {
          name: 'Mean and median',
          items: [
            { label: 'Statistics intro: Mean, median, & mode', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/v/statistics-intro-mean-median-and-mode' },
            { label: 'Mean, median, & mode example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/v/mean-median-and-mode' },
            { label: 'Calculating the mean', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/a/calculating-the-mean' },
            { label: 'Calculating the median', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/e/calculating-the-median', question: { prompt: 'Find the median of {1, 3, 5, 7, 9}.', answer: '5', explanation: 'Middle value of sorted list is 5.' } },
            { label: 'Calculating the mean: data displays', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/e/calculating-the-mean-from-various-data-displays', question: { prompt: 'Find the mean of {3, 5, 7}.', answer: '5', explanation: '(3+5+7)/3 = 15/3 = 5.' } },
            { label: 'Calculating the median: data displays', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/mean-and-median/e/calculating-the-median-from-data-displays', question: { prompt: 'Find the median of {1, 3, 5, 7, 9}.', answer: '5', explanation: 'Middle value of sorted list is 5.' } },
          ],
        },
        {
          name: 'Mean and median challenge problems',
          items: [
            { label: 'Missing value given the mean', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-mean-median-challenge/v/using-mean-to-find-missing-value' },
            { label: 'Mean as the balancing point', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-mean-median-challenge/a/mean-as-the-balancing-point' },
            { label: 'Impact on median & mean: removing an outlier', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-mean-median-challenge/v/impact-on-median-and-mean-when-removing-lowest-value-example' },
            { label: 'Impact on median & mean: increasing an outlier', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-mean-median-challenge/v/impact-on-median-and-mean-when-increasing-highest-value' },
            { label: 'Effects of shifting, adding, & removing a data point', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-mean-median-challenge/e/effects-of-shifting-adding-removing-data-point', question: { prompt: 'Practice: Effects of shifting, adding, & removing a data point. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Interquartile range (IQR)',
          items: [
            { label: 'Median & range puzzlers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th/v/median-and-range-puzzle' },
            { label: 'Interquartile range (IQR)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th/v/calculating-interquartile-range-iqr' },
            { label: 'Interquartile range review', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th/a/interquartile-range-review' },
          ],
        },
        {
          name: 'Box plots',
          items: [
            { label: 'Reading box plots', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/v/reading-box-and-whisker-plots' },
            { label: 'Constructing a box plot', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/v/constructing-a-box-and-whisker-plot' },
            { label: 'Worked example: Creating a box plot (odd number of data points)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/v/box-and-whisker-plot-exercise-example' },
            { label: 'Worked example: Creating a box plot (even number of data points)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/v/another-example-constructing-box-plot' },
            { label: 'Creating box plots', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/e/box-plots', question: { prompt: 'Practice: Creating box plots. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpreting box plots', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/v/interpreting-box-plots' },
            { label: 'Interpreting quartiles', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6th-box-whisker-plots/e/interpreting-quartiles-on-box-plots', question: { prompt: 'Practice: Interpreting quartiles. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Mean absolute deviation (MAD)',
          items: [
            { label: 'Mean absolute deviation (MAD)', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-mad/v/mean-absolute-deviation' },
            { label: 'Mean absolute deviation example', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-mad/v/mean-absolute-deviation-example' },
          ],
        },
        {
          name: 'Comparing data displays',
          items: [
            { label: 'Comparing dot plots, histograms, and box plots', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-7th-compare-data-displays/v/comparing-dot-plots-histograms-and-box-plots' },
            { label: 'Comparing data displays', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-7th-compare-data-displays/e/comparing-data-displays', question: { prompt: 'Practice: Comparing data displays. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Shape of data distributions',
          items: [
            { label: 'Shapes of distributions', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-shape-of-data/v/shapes-of-distributions' },
            { label: 'Shape of distributions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-shape-of-data/e/shape-of-distributions', question: { prompt: 'Practice: Shape of distributions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Clusters, gaps, peaks & outliers', type: 'video', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-shape-of-data/v/examples-analyzing-clusters-gaps-peaks-and-outliers-for-distributions' },
            { label: 'Clusters, gaps, & peaks in data distributions', type: 'exercise', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-shape-of-data/e/clusters--gaps--peaks--and-outliers', question: { prompt: 'Practice: Clusters, gaps, & peaks in data distributions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Data and statistics FAQ', type: 'article', href: '/math/cc-sixth-grade-math/cc-6th-data-statistics/cc-6-shape-of-data/a/data-and-statistics-faq' },
          ],
        },
      ],
    },
    {
      name: 'Khan for families',
      lessons: [
        {
          name: 'Introduction to Khan for families',
          items: [
            { label: 'Introduction to this unit', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:introduction-to-khan-for-families/a/introduction-to-this-unit' },
            { label: 'How Khan Academy supports learners', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:introduction-to-khan-for-families/a/how-khan-academy-supports-learners' },
            { label: '6th grade math course content', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:introduction-to-khan-for-families/a/6th-grade-math-course-content' },
          ],
        },
        {
          name: 'Ratios',
          items: [
            { label: 'All about Ratios', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:ratios/a/all-about-ratios' },
          ],
        },
        {
          name: 'Fractions',
          items: [
            { label: 'All about fractions', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:fractions/a/all-about-fractions' },
          ],
        },
        {
          name: 'Negative numbers',
          items: [
            { label: 'All about negative numbers', type: 'article', href: '/math/cc-sixth-grade-math/x0267d782:khan-for-families/x0267d782:negative-numbers/a/all-about-negative-numbers' },
          ],
        },
      ],
    },
  ],
};
