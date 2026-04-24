import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '9',
  label: 'Algebra 1',
  sourceUrl: 'https://www.khanacademy.org/math/algebra',
  units: [
    {
      name: 'Algebra foundations',
      lessons: [
        {
          name: 'Overview and history of algebra',
          items: [
            { label: 'Origins of algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/origins-of-algebra' },
            { label: 'Abstract-ness', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/abstract-ness' },
            { label: 'The beauty of algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/the-beauty-of-algebra' },
            { label: 'Creativity break: Why is creativity important in algebra?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/creativity-important-in-algebra' },
            { label: 'Intro to the coordinate plane', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/descartes-and-cartesian-coordinates' },
            { label: 'Why all the letters in algebra?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:algebra-overview-history/v/why-all-the-letters-in-algebra' },
          ],
        },
        {
          name: 'Introduction to variables',
          items: [
            { label: 'What is a variable?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/v/what-is-a-variable' },
            { label: 'Why aren\'t we using the multiplication sign?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/v/why-aren-t-we-using-the-multiplication-sign' },
            { label: 'Creativity break: Why is creativity important in STEM jobs?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/v/creativity-stem-jobs' },
            { label: 'Evaluating an expression with one variable', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/v/variables-and-expressions-1' },
            { label: 'Evaluating expressions with one variable', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/a/evaluating-expressions-with-one-variable' },
          ],
        },
        {
          name: 'Substitution and evaluating expressions',
          items: [
            { label: 'Evaluating expressions with two variables', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:substitute-evaluate-expression/v/evaluating-expressions-in-two-variables' },
            { label: 'Evaluating expressions with multiple variables', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:substitute-evaluate-expression/e/evaluating_expressions_2', question: { prompt: 'Practice: Evaluating expressions with multiple variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Evaluating expressions with two variables: fractions & decimals', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:substitute-evaluate-expression/v/evaluating-expressions-in-two-variables-with-decimals-and-fractions' },
            { label: 'Evaluating expressions with multiple variables: fractions & decimals', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:substitute-evaluate-expression/e/evaluating-expressions-in-two-variables-2', question: { prompt: 'Practice: Evaluating expressions with multiple variables: fractions & decimals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Combining like terms',
          items: [
            { label: 'Intro to combining like terms', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:combine-like-terms/v/combining-like-terms' },
            { label: 'Combining like terms with negative coefficients & distribution', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:combine-like-terms/v/combining-like-terms-and-the-distributive-property' },
            { label: 'Combining like terms with negative coefficients', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:combine-like-terms/v/combining-like-terms-3' },
            { label: 'Combining like terms with rational coefficients', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:combine-like-terms/v/simplifying-expressions-involving-rational-numbers' },
          ],
        },
        {
          name: 'Introduction to equivalent expressions',
          items: [
            { label: 'Equivalent expressions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:equivalent-expressions-intro/v/equivalent-algebraic-expressions-exercise' },
          ],
        },
        {
          name: 'Division by zero',
          items: [
            { label: 'Why dividing by zero is undefined', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:division-zero/v/why-dividing-by-zero-is-undefined' },
            { label: 'The problem with dividing zero by zero', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:division-zero/v/why-zero-divided-by-zero-is-undefined-indeterminate' },
            { label: 'Undefined & indeterminate expressions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:division-zero/v/undefined-and-indeterminate' },
            { label: 'Algebra foundations: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:division-zero/a/algebra-foundations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Solving equations & inequalities',
      lessons: [
        {
          name: 'Linear equations with variables on both sides',
          items: [
            { label: 'Why we do the same thing to both sides: Variable on both sides', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/v/why-we-do-the-same-thing-to-both-sides-multi-step-equations' },
            { label: 'Intro to equations with variables on both sides', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/v/equations-3' },
            { label: 'Equations with variables on both sides: 20-7x=6x-6', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/v/solving-equations-2' },
            { label: 'Equations with variables on both sides', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/e/linear_equations_3', question: { prompt: 'Practice: Equations with variables on both sides. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Equation with variables on both sides: fractions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/v/solving-equations-with-the-distributive-property-2' },
            { label: 'Equations with variables on both sides: decimals & fractions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/e/variables-on-both-sides-rational', question: { prompt: 'Practice: Equations with variables on both sides: decimals & fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Equation with the variable in the denominator', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/v/ex-2-multi-step-equation' },
          ],
        },
        {
          name: 'Linear equations with parentheses',
          items: [
            { label: 'Equations with parentheses', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-parentheses/v/solving-equations-with-the-distributive-property' },
            { label: 'Equations with parentheses: decimals & fractions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-parentheses/e/multi-step-equations-rational', question: { prompt: 'Practice: Equations with parentheses: decimals & fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Reasoning with linear equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-parentheses/v/reasoning-with-linear-equations' },
            { label: 'Multi-step equations review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-parentheses/a/multi-step-equations-review' },
          ],
        },
        {
          name: 'Analyzing the number of solutions to linear equations',
          items: [
            { label: 'Number of solutions to equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:num-solutions-linear-equations/v/number-of-solutions-to-linear-equations' },
            { label: 'Worked example: number of solutions to equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:num-solutions-linear-equations/v/equation-special-cases' },
            { label: 'Creating an equation with no solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:num-solutions-linear-equations/v/number-of-solutions-to-linear-equations-ex-2' },
            { label: 'Creating an equation with infinitely many solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:num-solutions-linear-equations/v/number-of-solutions-to-linear-equations-ex-3' },
            { label: 'Number of solutions to equations challenge', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:num-solutions-linear-equations/e/complete-equations-according-to-solutions', question: { prompt: 'Practice: Number of solutions to equations challenge. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Linear equations with unknown coefficients',
          items: [
            { label: 'Linear equations with unknown coefficients', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-eqns-unknown-coefficients/v/linear-equations-with-unknown-coefficients' },
            { label: 'Why is algebra important to learn?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-eqns-unknown-coefficients/v/why-algebra-important' },
          ],
        },
        {
          name: 'Multi-step inequalities',
          items: [
            { label: 'Inequalities with variables on both sides', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:multistep-inequalities/v/multi-step-inequalities-3' },
            { label: 'Inequalities with variables on both sides (with parentheses)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:multistep-inequalities/v/multi-step-inequalities-2' },
            { label: 'Multi-step inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:multistep-inequalities/v/multi-step-inequalities' },
            { label: 'Multi-step linear inequalities', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:multistep-inequalities/e/linear_inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Using inequalities to solve problems', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:multistep-inequalities/v/using-inequalities-to-solve-problems' },
          ],
        },
        {
          name: 'Compound inequalities',
          items: [
            { label: 'Compound inequalities: OR', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/v/compund-inequalities' },
            { label: 'Compound inequalities: AND', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/v/compund-inequalities-2' },
            { label: 'A compound inequality with no solution', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/v/compound-inequalities-4' },
            { label: 'Compound inequalities', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/e/compound_inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Double inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/v/compound-inequalities-3' },
            { label: 'Compound inequalities examples', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/v/compound-inequalities' },
            { label: 'Compound inequalities review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/a/compound-inequalities-review' },
            { label: 'Solving equations & inequalities: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:compound-inequalities/a/solving-equations-inequalities-faq' },
          ],
        },
      ],
    },
    {
      name: 'Working with units',
      lessons: [
        {
          name: 'Rate conversion',
          items: [
            { label: 'Intro to dimensional analysis', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:rate-conversion/v/dimensional-analysis-units-algebraically' },
            { label: 'Rate conversion', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:rate-conversion/e/rate-conversion', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Same rate with different units', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:rate-conversion/v/thinking-about-reasonable-units-to-describe-a-rate' },
            { label: 'Creativity break: When did you first realize that you liked algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:rate-conversion/v/realize-liked-algebra' },
          ],
        },
        {
          name: 'Appropriate units',
          items: [
            { label: 'Defining appropriate quantities for modeling', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:appropriate-units/v/appropriate-units' },
            { label: 'Formulas and units: Volume of a pool', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:appropriate-units/v/interpreting-units-in-formulas' },
            { label: 'Formulas and units: Comparing rates', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:appropriate-units/v/interpreting-units-in-formulas-novel' },
            { label: 'Formulas and units', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:appropriate-units/e/working-with-units', question: { prompt: 'Practice: Formulas and units. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Reporting measurements', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:appropriate-units/v/reporting-measurements' },
          ],
        },
        {
          name: 'Word problems with multiple units',
          items: [
            { label: 'Using units to solve problems: Toy factory', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/v/using-units-to-solve-problems-toy-factory' },
            { label: 'Using units to solve problems: Road trip', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/v/using-units-to-solve-problems-road-trip' },
            { label: 'Using units to solve problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/e/units', question: { prompt: 'Practice: Using units to solve problems. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Using units to solve problems: Drug dosage', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/v/unit-conversion-example-drug-dosage' },
            { label: 'Working with units: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/a/working-with-units-faq' },
            { label: 'Creativity break: How are math and creativity changing the world?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:working-units/x2f8bb11595b61c86:word-problems-multiple-units/v/math-creativity-changing-world' },
          ],
        },
      ],
    },
    {
      name: 'Linear equations & graphs',
      lessons: [
        {
          name: 'Two-variable linear equations intro',
          items: [
            { label: 'Two-variable linear equations intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:two-variable-linear-equations-intro/v/2-variable-linear-equations-graphs' },
            { label: 'Solutions to 2-variable equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:two-variable-linear-equations-intro/v/checking-ordered-pair-solutions-to-equations-1' },
            { label: 'Worked example: solutions to 2-variable equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:two-variable-linear-equations-intro/v/checking-ordered-pair-solutions-to-equations-2' },
            { label: 'Completing solutions to 2-variable equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:two-variable-linear-equations-intro/v/graphing-solutions-to-2-variable-linear-equations-1' },
            { label: 'Complete solutions to 2-variable equations', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:two-variable-linear-equations-intro/e/graphing-solutions-to-two-variable-linear-equations', question: { prompt: 'Practice: Complete solutions to 2-variable equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Slope',
          items: [
            { label: 'Intro to slope', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/introduction-to-slope' },
            { label: 'Positive & negative slope', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/positive-and-negative-slope' },
            { label: 'Worked example: slope from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/slope-of-a-line' },
            { label: 'Slope from graph', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/e/slope-from-a-graph', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Graphing a line given point and slope', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/graph-from-point-slope' },
            { label: 'Graphing from slope', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/e/graphing-slope', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Calculating slope from tables', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/slope-from-table' },
            { label: 'Slope in a table', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/e/slope-table', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Worked example: slope from two points', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/v/slope-of-a-line-2' },
            { label: 'Slope from two points', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/e/slope-from-two-points', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Slope review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:slope/a/slope-review' },
          ],
        },
        {
          name: 'Horizontal & vertical lines',
          items: [
            { label: 'Slope of a horizontal line', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:horizontal-vertical-lines/v/slope-of-a-line-3' },
            { label: 'Horizontal & vertical lines', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:horizontal-vertical-lines/v/examples-of-slopes-and-equations-of-horizontal-and-vertical-lines' },
          ],
        },
        {
          name: 'x-intercepts and y-intercepts',
          items: [
            { label: 'Intro to intercepts', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/v/introduction-to-intercepts' },
            { label: 'x-intercept of a line', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/v/finding-x-intercept-of-a-line' },
            { label: 'Intercepts from a graph', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/e/linear-function-intercepts', question: { prompt: 'Practice: Intercepts from a graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intercepts from an equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/v/x-and-y-intercepts' },
            { label: 'Intercepts from a table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/v/finding-intercepts-for-a-linear-function-from-a-table' },
            { label: 'Intercepts of lines review (x-intercepts and y-intercepts)', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:x-intercepts-and-y-intercepts/a/intercepts-of-lines-review-x-intercepts-and-y-intercepts' },
          ],
        },
        {
          name: 'Applying intercepts and slope',
          items: [
            { label: 'Slope, x-intercept, y-intercept meaning in context', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/v/slope-intercepts-context' },
            { label: 'Slope and intercept meaning in context', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/v/slope-intercept-meaning' },
            { label: 'Relating linear contexts to graph features', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/e/relating-linear-contexts-to-graph-features', question: { prompt: 'Practice: Relating linear contexts to graph features. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Using slope and intercepts in context', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/e/using-slope-intercepts', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Slope and intercept meaning from a table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/v/slope-intercept-meaning-table' },
            { label: 'Finding slope and intercepts from tables', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/v/find-slope-intercepts-table' },
            { label: 'Linear equations word problems: tables', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/e/interpreting-tables', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Linear equations word problems: graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/e/interpreting-linear-graphs', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Linear functions word problem: fuel', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/v/graphing-linear-functions-1' },
            { label: 'Graphing linear relationships word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:applying-intercepts-and-slope/e/graphing-linear-functions-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Modeling with linear equations and inequalities',
          items: [
            { label: 'Comparing linear rates example', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:modeling-with-linear-equations-and-inequalities/v/comparing-linear-rates-example' },
            { label: 'Comparing linear rates word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:modeling-with-linear-equations-and-inequalities/e/comparing-linear-rates-word-problems', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Linear equations & graphs: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:modeling-with-linear-equations-and-inequalities/a/linear-equations-graphs-faq' },
            { label: 'Creativity break: How do you apply creativity in algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:linear-equations-graphs/x2f8bb11595b61c86:modeling-with-linear-equations-and-inequalities/v/apply-creativity-algebra' },
          ],
        },
      ],
    },
    {
      name: 'Forms of linear equations',
      lessons: [
        {
          name: 'Intro to slope-intercept form',
          items: [
            { label: 'Intro to slope-intercept form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/v/slope-intercept-form' },
            { label: 'Slope and y-intercept from equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/v/less-obvious-slope-intercept-form' },
            { label: 'Worked examples: slope-intercept intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/v/slope-intercept-intro-examples' },
            { label: 'Slope-intercept intro', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/e/slope-from-an-equation-in-slope-intercept-form', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Linear equation word problems', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/v/linear-equation-word-problems' },
            { label: 'Linear equations word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:intro-to-slope-intercept-form/e/interpreting-features-of-linear-functions', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
          ],
        },
        {
          name: 'Graphing slope-intercept equations',
          items: [
            { label: 'Graph from slope-intercept equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:graphing-slope-intercept-equations/v/graphing-a-line-in-slope-intercept-form' },
            { label: 'Graphing slope-intercept form', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:graphing-slope-intercept-equations/a/graphing-slope-intercept-form' },
            { label: 'Graph from slope-intercept form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:graphing-slope-intercept-equations/e/graph-from-slope-intercept-equation', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Graphing lines from slope-intercept form review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:graphing-slope-intercept-equations/a/graphing-lines-review' },
          ],
        },
        {
          name: 'Writing slope-intercept equations',
          items: [
            { label: 'Slope-intercept equation from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/v/graphs-using-slope-intercept-form' },
            { label: 'Writing slope-intercept equations', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/a/writing-slope-intercept-equations' },
            { label: 'Slope-intercept equation from slope & point', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/v/equation-of-a-line-1' },
            { label: 'Slope-intercept equation from two points', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/v/equation-of-a-line-3' },
            { label: 'Slope-intercept from two points', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/e/slope-intercept-equation-from-two-points', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Constructing linear equations from context', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/v/construct-linear-equation-context' },
            { label: 'Writing linear equations word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/e/constructing-linear-functions-word-problems', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Slope-intercept form review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:writing-slope-intercept-equations/a/slope-intercept-form-review' },
          ],
        },
        {
          name: 'Point-slope form',
          items: [
            { label: 'Intro to point-slope form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:point-slope-form/v/idea-behind-point-slope-form' },
            { label: 'Point-slope & slope-intercept equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:point-slope-form/v/point-slope-and-slope-intercept-form-from-two-points' },
            { label: 'Point-slope form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:point-slope-form/e/converting_between_point_slope_and_slope_intercept', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
            { label: 'Point-slope form review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:point-slope-form/a/point-slope-form-review' },
          ],
        },
        {
          name: 'Standard form',
          items: [
            { label: 'Intro to linear equation standard form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/v/standard-form-for-linear-equations' },
            { label: 'Graphing a linear equation: 5x+2y=20', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/v/plotting-x-y-relationships' },
            { label: 'Clarifying standard form rules', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/v/standard-form-rules' },
            { label: 'Graph from linear standard form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/e/graph-from-standard-form-equation', question: { prompt: 'Practice: Graph from linear standard form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Converting from slope-intercept to standard form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/v/converting-from-slope-intercept-to-standard-form' },
            { label: 'Convert linear equations to standard form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/e/converting_between_slope_intercept_and_standard_form', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Standard form review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:standard-form/a/standard-form-review' },
          ],
        },
        {
          name: 'Summary: Forms of two-variable linear equations',
          items: [
            { label: 'Slope from equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/v/slope-from-equation' },
            { label: 'Writing linear equations in all forms', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/v/point-slope-and-standard-form' },
            { label: 'Linear equations in any form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/e/writing-the-equation-of-a-line-in-any-form', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Forms of linear equations review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/a/forms-of-linear-equations-review' },
            { label: 'Forms of linear equations: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/a/forms-of-linear-equations-faq' },
            { label: 'Creativity break: What do you do to get into your creative zone?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations/x2f8bb11595b61c86:summary-forms-of-two-variable-linear-equations/v/get-into-creative-zone' },
          ],
        },
      ],
    },
    {
      name: 'Systems of equations',
      lessons: [
        {
          name: 'Introduction to systems of equations',
          items: [
            { label: 'Systems of equations: trolls, tolls (1 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/trolls-tolls-and-systems-of-equations' },
            { label: 'Systems of equations: trolls, tolls (2 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/solving-the-troll-riddle-visually' },
            { label: 'Testing a solution to a system of equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/testing-a-solution-for-a-system-of-equations' },
            { label: 'Solutions of systems of equations', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/e/verifying-solutions-to-systems-of-equations', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Systems of equations with graphing: y=7/5x-5 & y=3/5x-1', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/solving-systems-graphically' },
            { label: 'Systems of equations with graphing: exact & approximate solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/solving-systems-graphically-examples' },
            { label: 'Systems of equations with graphing', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/e/graphing_systems_of_equations', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Setting up a system of equations from context example (pet weights)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/setting-up-system' },
            { label: 'Setting up a system of linear equations example (weight and price)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/setting-up-systems-weight-price' },
            { label: 'Creating systems in context', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/e/create-systems-context', question: { prompt: 'Practice: Creating systems in context. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpreting points in context of graphs of systems', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/v/interpret-points-systems' },
            { label: 'Interpret points relative to a system', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:introduction-to-systems-of-equations/e/interpret-points-system', question: { prompt: 'Practice: Interpret points relative to a system. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Solving systems of equations with substitution',
          items: [
            { label: 'Systems of equations with substitution: potato chips', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-of-equations-with-substitution/v/solving-systems-with-substitution' },
            { label: 'Systems of equations with substitution: -3x-4y=-2 & y=2x-5', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-of-equations-with-substitution/v/practice-using-substitution-for-systems' },
            { label: 'Systems of equations with substitution', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-of-equations-with-substitution/e/systems_of_equations_with_substitution', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Substitution method review (systems of equations)', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-of-equations-with-substitution/a/substitution-method-review-systems-of-equations' },
          ],
        },
        {
          name: 'Solving systems of equations with elimination',
          items: [
            { label: 'Systems of equations with elimination: King\'s cupcakes', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/v/king-s-cupcakes-solving-systems-by-elimination' },
            { label: 'Elimination strategies', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/v/elimination-strategies' },
            { label: 'Combining equations', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/e/combining-equations', question: { prompt: 'Practice: Combining equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Systems of equations with elimination: x-4y=-18 & -x+3y=11', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/v/simple-elimination-practice' },
            { label: 'Systems of equations with elimination', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/e/systems_of_equations_with_elimination_0.5', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Systems of equations with elimination: potato chips', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/v/how-many-bags-of-potato-chips-do-people-eat' },
            { label: 'Systems of equations with elimination (and manipulation)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/v/solving-systems-of-equations-by-multiplication' },
            { label: 'Systems of equations with elimination challenge', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/e/systems_of_equations_with_elimination', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Elimination method review (systems of linear equations)', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-elimination/a/elimination-method-review' },
          ],
        },
        {
          name: 'Equivalent systems of equations',
          items: [
            { label: 'Why can we subtract one equation from the other in a system of equations?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:equivalent-systems-equations/v/why-we-do-the-same-thing-to-both-sides-basic-systems' },
            { label: 'Worked example: equivalent systems of equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:equivalent-systems-equations/v/identifying-equivalent-systems-of-equations' },
            { label: 'Worked example: non-equivalent systems of equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:equivalent-systems-equations/v/identifying-non-equivalent-systems-of-equations' },
            { label: 'Reasoning with systems of equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:equivalent-systems-equations/v/reasoning-system-equations' },
            { label: 'Equivalent systems of equations review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:equivalent-systems-equations/a/equivalent-systems-of-equations-review' },
          ],
        },
        {
          name: 'Number of solutions to systems of equations',
          items: [
            { label: 'Systems of equations number of solutions: fruit prices (1 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/inconsistent-systems-of-equations' },
            { label: 'Systems of equations number of solutions: fruit prices (2 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/infinite-solutions-to-systems' },
            { label: 'Solutions to systems of equations: consistent vs. inconsistent', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/consistent-and-inconsistent-systems' },
            { label: 'Solutions to systems of equations: dependent vs. independent', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/independent-and-dependent-systems' },
            { label: 'Number of solutions to a system of equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/solving-systems-by-graphing-2' },
            { label: 'Number of solutions to a system of equations graphically', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/practice-thinking-about-number-of-solutions-to-systems' },
            { label: 'Number of solutions to a system of equations algebraically', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/examples-algebraically-analyzing-solutions-to-systems' },
            { label: 'How many solutions does a system of linear equations have if there are at least two?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/v/understanding-systems-of-equations-example-2' },
            { label: 'Number of solutions to system of equations review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:number-of-solutions-to-systems-of-equations/a/number-of-solutions-to-system-of-equations-review' },
          ],
        },
        {
          name: 'Systems of equations word problems',
          items: [
            { label: 'Age word problem: Imran', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/ex-2-age-word-problem' },
            { label: 'Age word problem: Ben & William', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/ex-3-age-word-problem' },
            { label: 'Age word problem: Arman & Diya', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/ex-1-age-word-problem' },
            { label: 'Age word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/e/age_word_problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'System of equations word problem: walk & ride', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/system-of-equations-distances-word-problem' },
            { label: 'Systems of equations word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/e/understanding-systems-of-equations-word-problems', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'System of equations word problem: no solution', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/systems-word-problem-with-no-solution' },
            { label: 'System of equations word problem: infinite solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/system-with-not-enough-information' },
            { label: 'Systems of equations word problems (with zero and infinite solutions)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/e/systems-of-equations-word-problems-capstone', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Systems of equations with elimination: TV & DVD', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/solving-systems-by-elimination' },
            { label: 'Systems of equations with elimination: apples and oranges', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/using-a-system-of-equations-to-find-the-price-of-apples-and-oranges' },
            { label: 'Systems of equations with substitution: coins', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/substitution-method-3' },
            { label: 'Systems of equations with elimination: coffee and croissants', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/v/understanding-systems-of-equations-example' },
            { label: 'Systems of equations: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:systems-of-equations-word-problems/a/systems-of-equations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Inequalities (systems & graphs)',
      lessons: [
        {
          name: 'Checking solutions of two-variable inequalities',
          items: [
            { label: 'Testing solutions to inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:checking-solutions-of-two-variable-inequalities/v/graphing-inequalities-1' },
            { label: 'Solutions of inequalities: algebraic', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:checking-solutions-of-two-variable-inequalities/e/checking-solutions-to-two-var-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Solutions of inequalities: graphical', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:checking-solutions-of-two-variable-inequalities/e/graphically-check-solutions-to-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Testing solutions to systems of inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:checking-solutions-of-two-variable-inequalities/v/testing-solutions-for-a-system-of-inequalities' },
            { label: 'Solutions of systems of inequalities', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:checking-solutions-of-two-variable-inequalities/e/checking-solutions-to-systems-of-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
          ],
        },
        {
          name: 'Graphing two-variable inequalities',
          items: [
            { label: 'Intro to graphing two-variable inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/v/graphing-inequalities' },
            { label: 'Graphing two-variable inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/v/graphing-linear-inequalities-in-two-variables-example-2' },
            { label: 'Graphs of inequalities', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/e/graphing_inequalities_2', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Two-variable inequalities from their graphs', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/v/graphing-linear-inequalities-in-two-variables-3' },
            { label: 'Intro to graphing systems of inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/v/graphical-system-of-inequalities' },
            { label: 'Graphing systems of inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/v/graphing-systems-of-inequalities-2' },
            { label: 'Systems of inequalities graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/e/graphing_systems_of_inequalities_2', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Graphing inequalities (x-y plane) review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:graphing-two-variable-inequalities/a/graphing-inequalities-x-y-plane-review' },
          ],
        },
        {
          name: 'Modeling with linear inequalities',
          items: [
            { label: 'Writing two-variable inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/constructing-two-variable-linear-inequality-word-problem' },
            { label: 'Solving two-variable inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/solving-two-variable-linear-inequality-word-problem' },
            { label: 'Interpreting two-variable inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/analyzing-two-variable-linear-inequality' },
            { label: 'Two-variable inequalities word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/e/modeling-constraints', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Modeling with systems of inequalities', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/u06-l3-t1-we3-graphing-systems-of-inequalities' },
            { label: 'Writing systems of inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/creating-system-of-inequalities-word-problem' },
            { label: 'Solving systems of inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/interpreting-system-of-inequalities-in-context' },
            { label: 'Graphs of systems of inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/graph-of-system-of-inequalities-word-problem' },
            { label: 'Systems of inequalities word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/e/modeling-systems-of-linear-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
            { label: 'Graphs of two-variable inequalities word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/interpreting-visual-linear-inequality-word-problem' },
            { label: 'Inequalities (systems & graphs): FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/a/inequalities-systems-graphs-faq' },
            { label: 'Creativity break: What can we do to expand our creative skills?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:inequalities-systems-graphs/x2f8bb11595b61c86:modeling-with-linear-inequalities/v/expand-creative-skills' },
          ],
        },
      ],
    },
    {
      name: 'Functions',
      lessons: [
        {
          name: 'Evaluating functions',
          items: [
            { label: 'What is a function?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/what-is-a-function' },
            { label: 'Worked example: Evaluating functions from equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/understanding-function-notation-example-1' },
            { label: 'Evaluate functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/e/functions_1', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Worked example: Evaluating functions from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/understanding-function-notation-example-2' },
            { label: 'Evaluating discrete functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/evaluate-discrete-function' },
            { label: 'Evaluate functions from their graph', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/e/evaluate-functions-from-their-graph', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Worked example: evaluating expressions with function notation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/evaluating-a-function-expression' },
            { label: 'Evaluate function expressions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/e/functions_2', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
          ],
        },
        {
          name: 'Inputs and outputs of a function',
          items: [
            { label: 'Worked example: matching an input to a function\'s output (equation)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inputs-and-outputs-of-a-function/v/finding-input-given-function-output-formula' },
            { label: 'Function inputs & outputs: equation', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inputs-and-outputs-of-a-function/e/functions_matching_inputs_outputs', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Worked example: matching an input to a function\'s output (graph)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inputs-and-outputs-of-a-function/v/matching-function-input-to-output-with-graph' },
            { label: 'Worked example: two inputs with the same output (graph)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inputs-and-outputs-of-a-function/v/different-inputs-giving-same-value-for-function' },
            { label: 'Function inputs & outputs: graph', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inputs-and-outputs-of-a-function/e/match-inputs-to-outputs-from-a-graph', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
          ],
        },
        {
          name: 'Functions and equations',
          items: [
            { label: 'Equations vs. functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:functions-and-equations/v/difference-between-equations-and-functions' },
            { label: 'Obtaining a function from an equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:functions-and-equations/v/create-function-from-equation' },
            { label: 'Function rules from equations', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:functions-and-equations/e/functions-from-equations', question: { prompt: 'Practice: Function rules from equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Interpreting function notation',
          items: [
            { label: 'Function notation word problem: bank', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-function-notation/v/interpreting-function-notation-example-1' },
            { label: 'Function notation word problem: beach', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-function-notation/v/interpreting-function-notation-example-2' },
            { label: 'Function notation word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-function-notation/e/function-notation-in-context', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Introduction to the domain and range of a function',
          items: [
            { label: 'Intervals and interval notation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/v/introduction-to-interval-notation' },
            { label: 'What is the domain of a function?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/v/domain-of-a-function-intro' },
            { label: 'What is the range of a function?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/v/range-of-a-function' },
            { label: 'Worked example: domain and range from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/v/domain-and-range-from-graphs' },
            { label: 'Domain and range from graph', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/e/domain_and_range_0.5', question: { prompt: 'Find the domain of f(x) = 1/(x-2).', answer: 'All real numbers except x=2', explanation: 'Denominator cannot be zero: x ≠ 2.' } },
          ],
        },
        {
          name: 'Determining the domain of a function',
          items: [
            { label: 'Determining whether values are in domain of function', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/v/determine-values-domain' },
            { label: 'Identifying values in the domain', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/e/values-in-domain', question: { prompt: 'Find the domain of f(x) = 1/(x-2).', answer: 'All real numbers except x=2', explanation: 'Denominator cannot be zero: x ≠ 2.' } },
            { label: 'Examples finding the domain of functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/v/find-domain-function' },
            { label: 'Determine the domain of functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/e/domain-of-algebraic-functions', question: { prompt: 'Find the domain of f(x) = 1/(x-2).', answer: 'All real numbers except x=2', explanation: 'Denominator cannot be zero: x ≠ 2.' } },
            { label: 'Worked example: determining domain word problem (real numbers)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/v/domain-of-a-modeling-function-example-1' },
            { label: 'Worked example: determining domain word problem (positive integers)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/v/domain-of-a-modeling-function-example-2' },
            { label: 'Worked example: determining domain word problem (all integers)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/v/domain-of-a-modeling-function-example-3' },
            { label: 'Function domain word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:determining-the-domain-of-a-function/e/interpreting-domain', question: { prompt: 'Find the domain of f(x) = 1/(x-2).', answer: 'All real numbers except x=2', explanation: 'Denominator cannot be zero: x ≠ 2.' } },
          ],
        },
        {
          name: 'Recognizing functions',
          items: [
            { label: 'Recognizing functions from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/v/graphical-relations-and-functions' },
            { label: 'Does a vertical line represent a function?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/v/recognizing-functions-example-2' },
            { label: 'Recognize functions from graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/e/recog-func-2', question: { prompt: 'Practice: Recognize functions from graphs. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Recognizing functions from table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/v/functional-relationships-1' },
            { label: 'Recognize functions from tables', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/e/recognizing_functions', question: { prompt: 'Practice: Recognize functions from tables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Recognizing functions from verbal description', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/v/recognizing-functions-example-1' },
            { label: 'Recognizing functions from verbal description word problems', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:recognizing-functions/v/recognizing-functions-example-5' },
          ],
        },
        {
          name: 'Maximum and minimum points',
          items: [
            { label: 'Introduction to minimum and maximum points', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:maximum-and-minimum-points/v/relative-minima-maxima' },
            { label: 'Worked example: absolute and relative extrema', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:maximum-and-minimum-points/v/identifying-relative-and-absolute-maxima-and-minima' },
            { label: 'Relative maxima and minima', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:maximum-and-minimum-points/e/recognize-maxima-and-minima', question: { prompt: 'Practice: Relative maxima and minima. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Absolute maxima and minima', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:maximum-and-minimum-points/e/recognize-absolute-maxima-and-minima', question: { prompt: 'Practice: Absolute maxima and minima. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Intervals where a function is positive, negative, increasing, or decreasing',
          items: [
            { label: 'Increasing, decreasing, positive or negative intervals', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:intervals-where-a-function-is-positive-negative-increasing-or-decreasing/v/increasing-decreasing-positive-and-negative-intervals' },
            { label: 'Worked example: positive & negative intervals', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:intervals-where-a-function-is-positive-negative-increasing-or-decreasing/v/when-a-function-is-positive-or-negative' },
            { label: 'Positive and negative intervals', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:intervals-where-a-function-is-positive-negative-increasing-or-decreasing/e/positive_and_negative_parts_of_functions', question: { prompt: 'Practice: Positive and negative intervals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Increasing and decreasing intervals', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:intervals-where-a-function-is-positive-negative-increasing-or-decreasing/e/increasing-decreasing-intervals-of-functions', question: { prompt: 'Practice: Increasing and decreasing intervals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Interpreting features of graphs',
          items: [
            { label: 'Graph interpretation word problem: temperature', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-features-of-graphs/v/interpreting-function-graphs-word-problems' },
            { label: 'Graph interpretation word problem: basketball', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-features-of-graphs/v/interpreting-features-of-functions-2-example-1' },
            { label: 'Graph interpretation word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-features-of-graphs/e/interpret-features-func-2', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Creativity break: How can people get creative in algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:interpreting-features-of-graphs/v/how-creative-in-algebra' },
          ],
        },
        {
          name: 'Average rate of change',
          items: [
            { label: 'Introduction to average rate of change', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change/v/introduction-to-average-rate-of-change' },
            { label: 'Worked example: average rate of change from graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change/v/average-rate-of-change-example-1' },
            { label: 'Worked example: average rate of change from table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change/v/average-rate-of-change-example-3' },
            { label: 'Average rate of change: graphs & tables', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change/e/avg-rate-of-change-graphs-tables', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
          ],
        },
        {
          name: 'Average rate of change word problems',
          items: [
            { label: 'Average rate of change word problem: table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change-word-problems/v/average-rate-of-change-from-table-word-problem' },
            { label: 'Average rate of change word problem: graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change-word-problems/v/average-rate-of-change-from-graph-word-problem' },
            { label: 'Average rate of change word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change-word-problems/e/average-rate-of-change-word-problems', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Average rate of change review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change-word-problems/a/average-rate-of-change-review' },
          ],
        },
        {
          name: 'Intro to inverse functions',
          items: [
            { label: 'Intro to inverse functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/v/introduction-to-function-inverses' },
            { label: 'Inputs & outputs of inverse functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/v/understanding-inverse-functions' },
            { label: 'Graphing the inverse of a linear function', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/v/understanding-function-inverses-example' },
            { label: 'Evaluate inverse functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/e/understanding-inverse-functions', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Finding inverse functions: linear', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/v/function-inverse-example-1' },
            { label: 'Find inverses of linear functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/e/algebraically-finding-inverses', question: { prompt: 'Find y when x=4 in y = 3x - 2.', answer: '10', explanation: 'y = 3(4)-2 = 12-2 = 10.' } },
            { label: 'Functions: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:inverse-functions-intro/a/functions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Sequences',
      lessons: [
        {
          name: 'Introduction to arithmetic sequences',
          items: [
            { label: 'Sequences intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/v/explicit-and-recursive-definitions-of-sequences' },
            { label: 'Intro to arithmetic sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/v/arithmetic-sequences' },
            { label: 'Extending arithmetic sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/v/extending-arithmetic-sequences' },
            { label: 'Extend arithmetic sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/e/arithmetic_sequences_1', question: { prompt: 'Practice: Extend arithmetic sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Using arithmetic sequences formulas', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/v/using-arithmetic-sequences-formulas' },
            { label: 'Intro to arithmetic sequence formulas', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/a/using-formulas-of-arithmetic-sequences' },
            { label: 'Worked example: using recursive formula for arithmetic sequence', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/v/using-recursive-formula-for-arithmetic-sequence' },
            { label: 'Use arithmetic sequence formulas', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-arithmetic-sequences/e/arithmetic_sequences_2', question: { prompt: 'Practice: Use arithmetic sequence formulas. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Constructing arithmetic sequences',
          items: [
            { label: 'Recursive formulas for arithmetic sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/v/recursive-formula-for-arithmetic-sequence' },
            { label: 'Explicit formulas for arithmetic sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/v/explicit-formulas-for-arithmetic-sequences' },
            { label: 'Arithmetic sequence problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/v/finding-the-100th-term-in-a-sequence' },
            { label: 'Converting recursive & explicit forms of arithmetic sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/v/recursive-formulas-for-arithmetic-sequences' },
            { label: 'Convert recursive & explicit forms of arithmetic sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/e/explicit-and-recursive-formulas-of-arithmetic-sequences', question: { prompt: 'Practice: Convert recursive & explicit forms of arithmetic sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Arithmetic sequences review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-arithmetic-sequences/a/arithmetic-sequences-review' },
          ],
        },
        {
          name: 'Introduction to geometric sequences',
          items: [
            { label: 'Intro to geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/v/geometric-sequences-introduction' },
            { label: 'Extending geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/v/extending-geometric-sequences' },
            { label: 'Extend geometric sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/e/geometric_sequences_1', question: { prompt: 'Practice: Extend geometric sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Extend geometric sequences: negatives & fractions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/e/extend-geometric-sequences-negatives-fractions', question: { prompt: 'Practice: Extend geometric sequences: negatives & fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Using explicit formulas of geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/v/using-explicit-formulas-of-geometric-sequences' },
            { label: 'Using recursive formulas of geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/v/using-recursive-formulas-of-geometric-sequences' },
            { label: 'Use geometric sequence formulas', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:introduction-to-geometric-sequences/e/geometric_sequences_2', question: { prompt: 'Practice: Use geometric sequence formulas. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Constructing geometric sequences',
          items: [
            { label: 'Explicit & recursive formulas for geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/v/explicit-and-recursive-formulas-for-geometric-sequences' },
            { label: 'Recursive formulas for geometric sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/e/recursive-formulas-for-geometric-sequences', question: { prompt: 'Practice: Recursive formulas for geometric sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Explicit formulas for geometric sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/e/sequences-as-functions', question: { prompt: 'Practice: Explicit formulas for geometric sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Converting recursive & explicit forms of geometric sequences', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/v/converting-an-explicit-function-to-a-recursive-function' },
            { label: 'Convert recursive & explicit forms of geometric sequences', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/e/explicit-and-recursive-formulas-of-geometric-sequences', question: { prompt: 'Practice: Convert recursive & explicit forms of geometric sequences. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Geometric sequences review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:constructing-geometric-sequences/a/geometric-sequences-review' },
          ],
        },
        {
          name: 'Modeling with sequences',
          items: [
            { label: 'Sequences word problems', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:modeling-with-sequences/v/modeling-situations-with-arithmetic-and-geometric-sequences' },
          ],
        },
        {
          name: 'General sequences',
          items: [
            { label: 'Evaluating sequences in recursive form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:general-sequences/v/recursive-formulas-for-sequences' },
            { label: 'Evaluate sequences in recursive form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:general-sequences/e/evaluating-sequences-in-recursive-form', question: { prompt: 'Practice: Evaluate sequences in recursive form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Sequences and domain', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:general-sequences/v/sequences-and-domain' },
            { label: 'Sequences: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:sequences/x2f8bb11595b61c86:general-sequences/a/sequences-faq' },
          ],
        },
      ],
    },
    {
      name: 'Absolute value & piecewise functions',
      lessons: [
        {
          name: 'Graphs of absolute value functions',
          items: [
            { label: 'Shifting absolute value graphs', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/v/shifting-absolute-value-graphs' },
            { label: 'Shift absolute value graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/e/shift-absolute-value-graphs', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Scaling & reflecting absolute value functions: equation', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/v/reflecting-and-scaling-absolute-value-function' },
            { label: 'Scaling & reflecting absolute value functions: graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/v/scaling-and-reflecting-absolute-value-graphs' },
            { label: 'Scale & reflect absolute value graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/e/stretch-and-shrink-absolute-value-graphs', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Graphing absolute value functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/v/graphing-absolute-value-functions' },
            { label: 'Graph absolute value functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/e/graphs-of-absolute-value-functions', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Absolute value graphs review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:graphs-of-absolute-value-functions/a/absolute-value-equations-and-graphs-review' },
          ],
        },
        {
          name: 'Piecewise functions',
          items: [
            { label: 'Introduction to piecewise functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/v/piecewise-function-example' },
            { label: 'Worked example: evaluating piecewise functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/v/evaluating-piecewise-functions-example' },
            { label: 'Evaluate piecewise functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/e/evaluating-piecewise-functions', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Evaluate step functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/e/evaluate-step-functions-from-their-graph', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Worked example: graphing piecewise functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/v/graphing-piecewise-function' },
            { label: 'Piecewise functions graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/e/piecewise-graphs-linear', question: { prompt: 'Practice: Piecewise functions graphs. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: domain & range of step function', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/v/domain-and-range-for-piecewise-step-function' },
            { label: 'Worked example: domain & range of piecewise linear functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/v/domain-and-range-for-piecewise-linear-function' },
            { label: 'Absolute value & piecewise functions: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions/x2f8bb11595b61c86:piecewise-functions/a/absolute-value-piecewise-functions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Exponents & radicals',
      lessons: [
        {
          name: 'Exponent properties review',
          items: [
            { label: 'Multiplying & dividing powers (integer exponents)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:exponent-properties-review/v/multiplying-and-dividing-powers-with-integer-exponents' },
            { label: 'Multiply & divide powers (integer exponents)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:exponent-properties-review/e/exponent_rules', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Powers of products & quotients (integer exponents)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:exponent-properties-review/v/powers-of-products-and-quotients-integer-exponents' },
            { label: 'Properties of exponents challenge (integer exponents)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:exponent-properties-review/e/properties-of-integer-exponents', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Radicals',
          items: [
            { label: 'Intro to square roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/v/introduction-to-square-roots' },
            { label: 'Understanding square roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/v/understanding-square-roots' },
            { label: 'Square roots', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/e/square_roots', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Square root of decimal', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/v/finding-square-root-of-decimal' },
            { label: 'Roots of decimals & fractions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/e/roots-of-decimals-and-fractions', question: { prompt: 'Practice: Roots of decimals & fractions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intro to cube roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/v/introduction-to-cube-roots' },
            { label: 'Cube roots', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/e/cube_roots', question: { prompt: 'Practice: Cube roots. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: '5th roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/v/5th-roots' },
            { label: 'Higher order roots', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:radicals/a/higher-order-roots' },
          ],
        },
        {
          name: 'Simplifying square roots',
          items: [
            { label: 'Simplifying square roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/v/simplifying-square-roots-1' },
            { label: 'Simplify square roots', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/e/simplifying_radicals', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Simplifying square roots (variables)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/v/simplifying-square-roots-comment-response' },
            { label: 'Simplify square roots (variables)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/e/multiplying_radicals', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Simplifying square-root expressions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/v/simplifying-square-root-expressions' },
            { label: 'Simplify square-root expressions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/e/adding_and_subtracting_radicals', question: { prompt: 'Practice: Simplify square-root expressions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Simplifying square roots review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/a/simplifying-square-roots-review' },
            { label: 'Exponents & radicals: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals/x2f8bb11595b61c86:simplifying-square-roots/a/exponents-radicals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Exponential growth & decay',
      lessons: [
        {
          name: 'Exponential vs. linear growth',
          items: [
            { label: 'Intro to exponential functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/v/exponential-growth-functions' },
            { label: 'Exponential vs. linear growth', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/v/exponential-vs-linear-growth' },
            { label: 'Warmup: exponential vs. linear growth', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/a/warmup-exponential-vs-linear-growth' },
            { label: 'Exponential vs. linear models: verbal', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/v/linear-exponential-models' },
            { label: 'Exponential vs. linear models: table', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/v/exponential-vs-linear-models' },
            { label: 'Exponential vs. linear models', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth/e/understanding-linear-and-exponential-models', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Exponential expressions',
          items: [
            { label: 'Exponential expressions word problems (numerical)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-expressions/v/exponential-expressions-word-problems-numerical' },
            { label: 'Initial value & common ratio of exponential functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-expressions/v/initial-value-and-common-ratio-of-exponential-functions' },
            { label: 'Exponential expressions word problems (algebraic)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-expressions/v/exponential-expressions-word-problems-algebraic' },
            { label: 'Interpreting exponential expression word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-expressions/v/interpreting-exponential-expression-word-problem' },
            { label: 'Interpret exponential expressions word problems', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-expressions/e/interpret-exponential-expressions-word-problems', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Graphs of exponential growth',
          items: [
            { label: 'Exponential function graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:graphs-of-exponential-growth/v/graphing-exponential-functions' },
            { label: 'Graphs of exponential growth', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:graphs-of-exponential-growth/v/graphs-of-exponential-growth' },
          ],
        },
        {
          name: 'Exponential vs. linear growth over time',
          items: [
            { label: 'Exponential vs. linear growth over time', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-growth-over-time/v/exponential-vs-linear-growth-over-time' },
          ],
        },
        {
          name: 'Exponential growth & decay',
          items: [
            { label: 'Exponential decay intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-decay/v/exponential-decay-intro' },
            { label: 'Exponential growth vs. decay', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-decay/e/exponential-growth-vs-decay', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Graphing exponential growth & decay', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-decay/v/graphing-basic-exponential-functions' },
            { label: 'Writing functions with exponential decay', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-decay/v/writing-functions-exponential-decay' },
          ],
        },
        {
          name: 'Exponential functions from tables & graphs',
          items: [
            { label: 'Writing exponential functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/writing-exponential-functions' },
            { label: 'Writing exponential functions from tables', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/constructing-linear-and-exponential-functions-from-data' },
            { label: 'Exponential functions from tables & graphs', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/e/construct-basic-exponential-functions-from-table-or-graph', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Writing exponential functions from graphs', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/constructing-linear-and-exponential-functions-from-graph' },
            { label: 'Analyzing tables of exponential functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/analyzing-tables-of-exponential-functions' },
            { label: 'Analyzing graphs of exponential functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/analyzing-graph-of-exponential-function' },
            { label: 'Analyzing graphs of exponential functions: negative initial value', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/analyzing-exponential-graph-with-negative-initial-value' },
            { label: 'Modeling with basic exponential functions word problem', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/v/modeling-ticket-fines-with-exponential-function' },
            { label: 'Connecting exponential graphs with contexts', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-functions-from-tables-graphs/e/exponential-graph-context', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Exponential vs. linear models',
          items: [
            { label: 'Linear vs. exponential growth: from data', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-models/v/linear-and-exponential-growth-from-data' },
            { label: 'Linear vs. exponential growth: from data (example 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-models/v/exponential-model-from-data' },
            { label: 'Exponential growth & decay: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-models/a/exponential-growth-decay-faq' },
          ],
        },
      ],
    },
    {
      name: 'Quadratics: Multiplying & factoring',
      lessons: [
        {
          name: 'Multiplying monomials by polynomials',
          items: [
            { label: 'Polynomials intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-monomial-polynomial/v/polynomials-intro' },
            { label: 'Multiply monomials by polynomials: Area model', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-monomial-polynomial/v/multiply-monomials-polynomials-area-model' },
            { label: 'Multiply monomials by polynomials (basic): area model', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-monomial-polynomial/e/monomial-polynomial-basic-area-model', question: { prompt: 'Multiply (x+2)(x+3).', answer: 'x² + 5x + 6', explanation: 'FOIL: x²+3x+2x+6 = x²+5x+6.' } },
          ],
        },
        {
          name: 'Multiplying binomials',
          items: [
            { label: 'Multiplying binomials: area model', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/v/area-model-for-multiplying-binomials' },
            { label: 'Multiply binomials: area model', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/e/multiply-binomials-area-model', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Multiplying binomials intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/v/multiplying-simple-binomials' },
            { label: 'Warmup: Multiplying binomials', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/a/warmup-multiplying-binomials' },
            { label: 'Multiply binomials intro', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/e/multiplying_expressions_0.5', question: { prompt: 'Practice: Multiply binomials intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplying binomials', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/v/multiplying-binomials' },
            { label: 'Multiply binomials', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-binomial/e/multiply-binomials-coefficient', question: { prompt: 'Practice: Multiply binomials. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Special products of binomials',
          items: [
            { label: 'Special products of the form (x+a)(x-a)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/v/difference-of-squares-pattern-for-simple-binomials' },
            { label: 'Special products of the form (ax+b)(ax-b)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/v/special-polynomials-products-1' },
            { label: 'Multiply difference of squares', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/e/multiplying_expressions_1', question: { prompt: 'Practice: Multiply difference of squares. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Squaring binomials of the form (x+a)²', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/v/pattern-for-squaring-simple-binomials' },
            { label: 'Squaring binomials of the form (ax+b)²', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/v/square-a-binomial' },
            { label: 'Multiply perfect squares of binomials', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/e/perfect-square-binomial-intro', question: { prompt: 'Practice: Multiply perfect squares of binomials. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Binomial special products review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:special-product-binomials/a/binomial-special-products-review' },
          ],
        },
        {
          name: 'Introduction to factoring',
          items: [
            { label: 'Intro to factors & divisibility', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:intro-factoring/v/factors-and-divisibility-in-algebra' },
            { label: 'Factoring with the distributive property', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:intro-factoring/v/factoring-linear-binomials' },
            { label: 'GCF factoring introduction', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:intro-factoring/e/gcf-factoring-introduction', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
          ],
        },
        {
          name: 'Factoring quadratics intro',
          items: [
            { label: 'Factoring quadratics as (x+a)(x+b)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-simple-quadratic-expression' },
            { label: 'Factoring quadratics: leading coefficient = 1', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/a/factoring-quadratics-leading-coefficient-1' },
            { label: 'Factoring quadratics as (x+a)(x+b) (example 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-polynomials-1' },
            { label: 'More examples of factoring quadratics as (x+a)(x+b)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-quadratic-expressions' },
            { label: 'Factoring quadratics intro', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/e/factoring_polynomials_1', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Factoring quadratics with a common factor', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-quadratics-common-factor' },
            { label: 'Factoring completely with a common factor', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factor-completely-common-factor' },
            { label: 'Factoring simple quadratics review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/a/factoring-simple-quadratics-review' },
          ],
        },
        {
          name: 'Factoring quadratics by grouping',
          items: [
            { label: 'Intro to grouping', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/v/factor-by-grouping-and-factoring-completely' },
            { label: 'Factoring by grouping', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/a/factoring-by-grouping' },
            { label: 'Factoring quadratics by grouping', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/v/factoring-trinomials-by-grouping-4' },
            { label: 'Factoring quadratics: leading coefficient ≠ 1', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/a/factoring-quadratics-leading-coefficient-not-1' },
            { label: 'Factor quadratics by grouping', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/e/factoring_polynomials_by_grouping_1', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Factoring quadratics: common factor + grouping', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/v/factoring-trinomials-by-grouping-5' },
            { label: 'Factoring quadratics: negative common factor + grouping', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/v/factoring-trinomials-by-grouping-6' },
            { label: 'Creativity break: How can we combine ways of thinking in problem solving?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-grouping/v/combine-ways-of-thinking-in-problem-solving' },
          ],
        },
        {
          name: 'Factoring quadratics with difference of squares',
          items: [
            { label: 'Difference of squares intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/v/difference-of-squares-intro' },
            { label: 'Factoring quadratics: Difference of squares', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/a/factoring-quadratics-difference-of-squares' },
            { label: 'Factoring difference of squares: leading coefficient ≠ 1', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/v/factoring-to-produce-difference-of-squares' },
            { label: 'Factoring difference of squares: analyzing factorization', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/v/equivalent-expressions-to-differences-of-squares' },
            { label: 'Factoring difference of squares: shared factors', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/v/finding-a-shared-binomial-factor' },
            { label: 'Difference of squares', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-difference-squares/e/factoring_difference_of_squares_2', question: { prompt: 'Practice: Difference of squares. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Factoring quadratics with perfect squares',
          items: [
            { label: 'Perfect square factorization intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/perfect-square-factorization-intro' },
            { label: 'Factoring quadratics: Perfect squares', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/a/factoring-quadratics-perfect-squares' },
            { label: 'Perfect squares intro', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/e/intro-to-factoring-perfect-squares', question: { prompt: 'Practice: Perfect squares intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Factoring perfect squares', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/factoring-perfect-square-trinomials' },
            { label: 'Identifying perfect square form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/identifying-perfect-square-trinomials' },
            { label: 'Factoring perfect squares: negative common factor', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/u09-l2-t1-we1-factoring-special-products-1' },
            { label: 'Factoring perfect squares: missing values', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/solving-for-constants-in-perfect-square-polynomial' },
            { label: 'Factoring perfect squares: shared factors', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/v/shared-binomial-factor-between-perfect-square-and-difference-of-squares' },
            { label: 'Perfect squares', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-perfect-squares/e/factoring-perfect-squares', question: { prompt: 'Practice: Perfect squares. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Strategy in factoring quadratics',
          items: [
            { label: 'Strategy in factoring quadratics (part 1 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-strategy/v/strategy-in-factoring-quadratics-1' },
            { label: 'Strategy in factoring quadratics (part 2 of 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-strategy/v/strategy-in-factoring-quadratics-2' },
            { label: 'Factoring quadratics in any form', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-strategy/a/factoring-quadratics-in-any-form' },
            { label: 'Quadratics: Multiplying & factoring: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-strategy/a/quadratics-multiplying-factoring-faq' },
          ],
        },
      ],
    },
    {
      name: 'Quadratic functions & equations',
      lessons: [
        {
          name: 'Intro to parabolas',
          items: [
            { label: 'Parabolas intro', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:intro-parabolas/v/parabolas-intro' },
            { label: 'Interpreting a parabola in context', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:intro-parabolas/v/interpret-parabola-context' },
            { label: 'Interpret parabolas in context', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:intro-parabolas/e/interpreting-parabolas', question: { prompt: 'Practice: Interpret parabolas in context. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpret a quadratic graph', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:intro-parabolas/v/interpret-a-quadratic-graph' },
          ],
        },
        {
          name: 'Solving and graphing with factored form',
          items: [
            { label: 'Zero product property', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:factored-form-quadratics/v/zero-product-property' },
            { label: 'Graphing quadratics in factored form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:factored-form-quadratics/v/graphing-quadratics-in-factored-form' },
            { label: 'Graph quadratics in factored form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:factored-form-quadratics/e/graph-quadratic-functions-in-factored-form', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Quadratic word problems (factored form)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:factored-form-quadratics/v/quadratic-word-problems-factored-form' },
          ],
        },
        {
          name: 'Solving by taking the square root',
          items: [
            { label: 'Solving quadratics by taking square roots', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/v/simple-quadratic-equation' },
            { label: 'Quadratics by taking square roots (intro)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/e/solve-quadratics-by-taking-square-roots-intro', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Solving quadratics by taking square roots examples', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/v/solving-quadratics-by-taking-square-roots' },
            { label: 'Quadratics by taking square roots', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/e/solving_quadratics_by_taking_the_square_root', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Quadratics by taking square roots: strategy', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/v/determining-mistakes-in-steps-example' },
            { label: 'Solving quadratics by taking square roots: with steps', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/v/order-of-steps-exercise-example' },
            { label: 'Quadratics by taking square roots: with steps', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/e/quadratics-by-taking-square-roots-with-steps', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
            { label: 'Solving simple quadratics review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:untitled-1082/a/solving-simple-quadratics-review' },
          ],
        },
        {
          name: 'Vertex form',
          items: [
            { label: 'Vertex form introduction', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:vertex-form/v/vertex-form-intro' },
            { label: 'Graphing quadratics: vertex form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:vertex-form/v/graphing-a-parabola-in-vertex-form' },
            { label: 'Graph quadratics in vertex form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:vertex-form/e/graphing_parabolas_1', question: { prompt: 'Practice: Graph quadratics in vertex form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic word problems (vertex form)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:vertex-form/v/quadratic-word-problems-in-vertex-form' },
          ],
        },
        {
          name: 'Solving quadratics by factoring',
          items: [
            { label: 'Solving quadratics by factoring', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/v/example-1-solving-a-quadratic-equation-by-factoring' },
            { label: 'Quadratics by factoring (intro)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/e/solving_quadratics_by_factoring', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Solving quadratics by factoring: leading coefficient ≠ 1', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/v/solving-quadratics-by-dividing-and-factoring' },
            { label: 'Quadratics by factoring', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/e/solving_quadratics_by_factoring_2', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Solving quadratics using structure', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/v/using-structure-to-solve-quadratics' },
            { label: 'Solve equations using structure', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/e/solving-quadratics-by-using-structure', question: { prompt: 'Practice: Solve equations using structure. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic equations word problem: triangle dimensions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/v/example-4-solving-a-quadratic-equation-by-factoring' },
            { label: 'Quadratic equations word problem: box dimensions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/v/example-3-solving-a-quadratic-equation-by-factoring' },
            { label: 'Solving quadratics by factoring review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratics-solve-factoring/a/solving-quadratics-by-factoring-review' },
          ],
        },
        {
          name: 'The quadratic formula',
          items: [
            { label: 'The quadratic formula', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/v/using-the-quadratic-formula' },
            { label: 'Understanding the quadratic formula', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/a/quadratic-formula-explained-article' },
            { label: 'Worked example: quadratic formula (example 2)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/v/quadratic-formula-2' },
            { label: 'Worked example: quadratic formula (negative coefficients)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/v/applying-the-quadratic-formula' },
            { label: 'Quadratic formula', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/e/quadratic_equation', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Using the quadratic formula: number of solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/v/quadratic-formula-3' },
            { label: 'Number of solutions of quadratic equations', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/e/determine-the-number-of-solutions-of-a-quadratic-equation', question: { prompt: 'Practice: Number of solutions of quadratic equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic formula review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/a/quadratic-formula-review' },
            { label: 'Discriminant review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/a/discriminant-review' },
          ],
        },
        {
          name: 'Completing the square intro',
          items: [
            { label: 'Completing the square', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/v/solving-quadratic-equations-by-completing-the-square' },
            { label: 'Worked example: Completing the square (intro)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/v/ex1-completing-the-square' },
            { label: 'Completing the square (intro)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/e/completing_the_square_in_quadratic_expressions', question: { prompt: 'Practice: Completing the square (intro). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: Rewriting expressions by completing the square', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/v/rewriting-quadratics-as-perfect-squares' },
            { label: 'Worked example: Rewriting & solving equations by completing the square', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/v/solving-quadratics-by-completing-the-square' },
            { label: 'Completing the square (intermediate)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square-quadratics/e/completing_the_square_1', question: { prompt: 'Practice: Completing the square (intermediate). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'More on completing the square',
          items: [
            { label: 'Solve by completing the square: Integer solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/v/solve-completing-square-integer-solutions' },
            { label: 'Solve by completing the square: Non-integer solutions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/v/solve-completing-square-non-integer-solutions' },
            { label: 'Solve equations by completing the square', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/e/solve-completing-square', question: { prompt: 'Practice: Solve equations by completing the square. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: completing the square (leading coefficient ≠ 1)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/v/completing-the-square-to-solve-quadratic-equations' },
            { label: 'Completing the square', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/e/completing_the_square_2', question: { prompt: 'Practice: Completing the square. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solving quadratics by completing the square: no solution', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/v/ex2-completing-the-square' },
            { label: 'Proof of the quadratic formula', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/v/proof-of-quadratic-formula' },
            { label: 'Solving quadratics by completing the square', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/a/solving-quadratic-equations-by-completing-the-square' },
            { label: 'Completing the square review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/a/completing-the-square-review' },
            { label: 'Quadratic formula proof review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:more-on-completing-square/a/quadratic-formula-proof-review' },
          ],
        },
        {
          name: 'Strategizing to solve quadratic equations',
          items: [
            { label: 'Strategy in solving quadratic equations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:strategizing-to-solve-quadratics/v/strategy-in-solving-quadratic-equations' },
            { label: 'Strategy in solving quadratics', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:strategizing-to-solve-quadratics/e/strategy-solve-quadratics', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
          ],
        },
        {
          name: 'Quadratic standard form',
          items: [
            { label: 'Finding the vertex of a parabola in standard form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:standard-form-quadratic/v/ex3-completing-the-square' },
            { label: 'Graphing quadratics: standard form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:standard-form-quadratic/v/graphing-a-parabola-using-roots-and-vertex' },
            { label: 'Graph quadratics in standard form', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:standard-form-quadratic/e/graphing_parabolas_0.5', question: { prompt: 'Practice: Graph quadratics in standard form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic word problem: ball', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:standard-form-quadratic/v/application-problem-with-quadratic-formula' },
            { label: 'Quadratic word problems (standard form)', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:standard-form-quadratic/e/key-features-quadratics', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Features & forms of quadratic functions',
          items: [
            { label: 'Forms & features of quadratic functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/rewriting-a-quadratic-function-to-find-roots-and-vertex' },
            { label: 'Worked examples: Forms & features of quadratic functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/strategy-with-forms-of-quadratics' },
            { label: 'Features of quadratic functions: strategy', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/e/identifying-and-using-quadratic-forms', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Vertex & axis of symmetry of a parabola', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/quadratic-functions-2' },
            { label: 'Finding features of quadratic functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/finding-features-of-quadratic-functions' },
            { label: 'Features of quadratic functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/e/rewriting-expressions-to-reveal-information', question: { prompt: 'Practice: Features of quadratic functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graph parabolas in all forms', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/e/graphing_parabolas_2', question: { prompt: 'Practice: Graph parabolas in all forms. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Interpret quadratic models: Factored form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/interpret-quadratic-models-factored-form' },
            { label: 'Interpret quadratic models: Vertex form', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/interpret-quadratic-models' },
            { label: 'Interpret quadratic models', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/e/interpreting-quadratic-models', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Graphing quadratics review', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/a/graphing-quadratics-review' },
            { label: 'Creativity break: How does creativity play a role in your everyday life?', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-forms-features/v/creativity-role-life' },
          ],
        },
        {
          name: 'Comparing quadratic functions',
          items: [
            { label: 'Comparing features of quadratic functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:graphing-and-comparing-quadratics/v/comparing-features-of-quadratic-functions' },
            { label: 'Comparing maximum points of quadratic functions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:graphing-and-comparing-quadratics/v/comparing-features-of-functions-2-example-2' },
            { label: 'Compare quadratic functions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:graphing-and-comparing-quadratics/e/compare-properties-quadratic-functions', question: { prompt: 'Practice: Compare quadratic functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Transforming quadratic functions',
          items: [
            { label: 'Intro to parabola transformations', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/v/shifting-and-scaling-parabolas' },
            { label: 'Shifting parabolas', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/v/example-translating-parabola' },
            { label: 'Shift parabolas', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/e/shift-parabolas', question: { prompt: 'Practice: Shift parabolas. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Scaling & reflecting parabolas', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/v/scaling-and-reflecting-parabolas' },
            { label: 'Scale & reflect parabolas', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/e/stretch-and-shrink-parabolas', question: { prompt: 'Practice: Scale & reflect parabolas. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic functions & equations: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:transform-quadratic-functions/a/quadratic-functions-equations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Irrational numbers',
      lessons: [
        {
          name: 'Irrational numbers',
          items: [
            { label: 'Intro to rational & irrational numbers', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:irrational-numbers-intro/v/introduction-to-rational-and-irrational-numbers' },
            { label: 'Classifying numbers: rational & irrational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:irrational-numbers-intro/v/recognizing-irrational-numbers' },
            { label: 'Classify numbers: rational & irrational', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:irrational-numbers-intro/e/recognizing-rational-and-irrational-numbers', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Sums and products of rational and irrational numbers',
          items: [
            { label: 'Proof: sum & product of two rationals is rational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/sum-and-product-of-rational-numbers' },
            { label: 'Proof: product of rational & irrational is irrational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/proof-that-rational-times-irrational-is-irrational' },
            { label: 'Proof: sum of rational & irrational is irrational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/proof-that-sum-of-rational-and-irrational-is-irrational' },
            { label: 'Sums and products of irrational numbers', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/sums-and-products-of-irrational-numbers' },
            { label: 'Worked example: rational vs. irrational expressions', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/recognizing-rational-and-irrational-expressions-example' },
            { label: 'Worked example: rational vs. irrational expressions (unknowns)', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/v/recognizing-rational-and-irrational-expressions-w-unknowns' },
            { label: 'Rational vs. irrational expressions', type: 'exercise', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:sums-and-products-of-rational-and-irrational-numbers/e/recognizing-rational-and-irrational-expressions', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Proofs concerning irrational numbers',
          items: [
            { label: 'Proof: √2 is irrational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:proofs-concerning-irrational-numbers/v/proof-that-square-root-of-2-is-irrational' },
            { label: 'Proof: square roots of prime numbers are irrational', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:proofs-concerning-irrational-numbers/v/proof-that-square-root-of-prime-number-is-irrational' },
            { label: 'Proof: there\'s an irrational number between any two rational numbers', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:proofs-concerning-irrational-numbers/v/proof-that-there-is-an-irrational-number-between-any-two-rational-numbers' },
            { label: 'Irrational numbers: FAQ', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:irrational-numbers/x2f8bb11595b61c86:proofs-concerning-irrational-numbers/a/irrational-numbers-faq' },
          ],
        },
      ],
    },
    {
      name: 'Creativity in algebra',
      lessons: [
        {
          name: 'Creativity in algebra',
          items: [
            { label: 'Creativity in algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:algebra-creativity/x2f8bb11595b61c86:creativity-in-algebra/v/creativity-in-algebra' },
            { label: 'Creative algebra at work', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:algebra-creativity/x2f8bb11595b61c86:creativity-in-algebra/v/creative-algebra-at-work' },
            { label: 'The future of creativity in algebra', type: 'video', href: '/math/algebra/x2f8bb11595b61c86:algebra-creativity/x2f8bb11595b61c86:creativity-in-algebra/v/the-future-of-creativity-in-algebra' },
          ],
        },
      ],
    },
    {
      name: 'Teacher resources',
      lessons: [
        {
          name: 'Welcome to teacher resources',
          items: [
            { label: 'How to use our math unit guides', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:alg1-ccss-teacher-resources/x2f8bb11595b61c86:alg1-ccss-welcome-to-teacher-resources/a/alg1-ccss-how-to-use-our-math-unit-guides' },
            { label: 'Unit guides and other resources', type: 'article', href: '/math/algebra/x2f8bb11595b61c86:alg1-ccss-teacher-resources/x2f8bb11595b61c86:alg1-ccss-welcome-to-teacher-resources/a/alg1-ccss-unit-guides-and-other-resources' },
          ],
        },
      ],
    },
  ],
};
