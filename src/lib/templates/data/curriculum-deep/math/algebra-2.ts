import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '11',
  label: 'Algebra 2',
  sourceUrl: 'https://www.khanacademy.org/math/algebra2',
  units: [
    {
      name: 'Polynomial arithmetic',
      lessons: [
        {
          name: 'Intro to polynomials',
          items: [
            { label: 'Polynomials intro', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-intro/v/polynomials-intro' },
            { label: 'The parts of polynomial expressions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-intro/v/terms-coefficients-and-exponents-in-a-polynomial' },
          ],
        },
        {
          name: 'Average rate of change of polynomials',
          items: [
            { label: 'Finding average rate of change of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-avg-rate/v/avg-rate-of-change-of-polynomials' },
            { label: 'Sign of average rate of change of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-avg-rate/v/sign-of-avg-rate-of-change-polynomial' },
            { label: 'Average rate of change of polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-avg-rate/e/avg-rate-of-change', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
          ],
        },
        {
          name: 'Adding and subtracting polynomials',
          items: [
            { label: 'Adding polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/v/adding-and-subtracting-polynomials-1' },
            { label: 'Add polynomials (intro)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/e/adding_and_subtracting_polynomials', question: { prompt: 'Add (2x + 3) + (x + 5).', answer: '3x + 8', explanation: 'Combine like terms: 2x+x=3x and 3+5=8.' } },
            { label: 'Subtracting polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/v/subtracting-polynomials' },
            { label: 'Subtract polynomials (intro)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/e/subtract-polynomials', question: { prompt: 'Add (2x + 3) + (x + 5).', answer: '3x + 8', explanation: 'Combine like terms: 2x+x=3x and 3+5=8.' } },
            { label: 'Polynomial subtraction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/v/subtracting-polynomials-and-closure' },
            { label: 'Add & subtract polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/e/add---subtract-polynomials-challenge', question: { prompt: 'Add (2x + 3) + (x + 5).', answer: '3x + 8', explanation: 'Combine like terms: 2x+x=3x and 3+5=8.' } },
            { label: 'Adding and subtracting polynomials review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:poly-add-sub/a/adding-and-subtracting-polynomials-review' },
          ],
        },
        {
          name: 'Multiplying monomials by polynomials',
          items: [
            { label: 'Multiplying monomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/v/multiply-monomials-intro' },
            { label: 'Multiply monomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/e/finding-the-product-of-two-monomials', question: { prompt: 'Practice: Multiply monomials. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplying monomials by polynomials: area model', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/v/area-model-of-monomial-polynomial-multiplication' },
            { label: 'Area model for multiplying polynomials with negative terms', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/v/area-model-for-negative-terms' },
            { label: 'Multiply monomials by polynomials: area model', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/e/multiply-monomials-by-polynomials-intuition', question: { prompt: 'Multiply (x+2)(x+3).', answer: 'x² + 5x + 6', explanation: 'FOIL: x²+3x+2x+6 = x²+5x+6.' } },
            { label: 'Multiplying monomials by polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/v/multiplying-monomials-by-polynomials' },
            { label: 'Multiply monomials by polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/e/finding-the-product-of-a-monomial-and-a-polynomial', question: { prompt: 'Multiply (x+2)(x+3).', answer: 'x² + 5x + 6', explanation: 'FOIL: x²+3x+2x+6 = x²+5x+6.' } },
            { label: 'Multiplying monomials by polynomials review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:mono-by-poly/a/multiplying-monomials-by-polynomials-review' },
          ],
        },
        {
          name: 'Multiplying binomials by polynomials',
          items: [
            { label: 'Multiplying binomials by polynomials: area model', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:bi-by-poly/v/multiplying-polynomials-using-area-model' },
            { label: 'Multiply binomials by polynomials: area model', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:bi-by-poly/e/bi-by-poly-area', question: { prompt: 'Multiply (x+2)(x+3).', answer: 'x² + 5x + 6', explanation: 'FOIL: x²+3x+2x+6 = x²+5x+6.' } },
            { label: 'Multiplying binomials by polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:bi-by-poly/v/more-multiplying-polynomials' },
            { label: 'Multiply binomials by polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:bi-by-poly/e/multiplying_polynomials', question: { prompt: 'Multiply (x+2)(x+3).', answer: 'x² + 5x + 6', explanation: 'FOIL: x²+3x+2x+6 = x²+5x+6.' } },
            { label: 'Multiplying binomials by polynomials review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:bi-by-poly/a/multiplying-binomials-by-polynomials-review' },
          ],
        },
        {
          name: 'Special products of polynomials',
          items: [
            { label: 'Polynomial special products: difference of squares', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:special-products/v/poly-diff-of-squares' },
            { label: 'Polynomial special products: perfect square', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:special-products/v/poly-perfect-square' },
            { label: 'Polynomial arithmetic: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic/x2ec2f6f830c9fb89:special-products/a/polynomial-arithmetic-faq' },
          ],
        },
      ],
    },
    {
      name: 'Complex numbers',
      lessons: [
        {
          name: 'The imaginary unit i',
          items: [
            { label: 'Intro to the imaginary numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:imaginary/v/introduction-to-i-and-imaginary-numbers' },
            { label: 'Simplifying roots of negative numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:imaginary/v/imaginary-roots-of-negative-numbers' },
            { label: 'Simplify roots of negative numbers', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:imaginary/e/simplify-square-roots-of-negative-numbers', question: { prompt: 'What is -3 + 5?', answer: '2', explanation: 'Adding 5 to -3 gives 2.' } },
            { label: 'Powers of the imaginary unit', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:imaginary/a/powers-of-the-imaginary-unit' },
            { label: 'i as the principal root of -1', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:imaginary/v/i-as-the-principal-root-of-1-a-little-technical' },
          ],
        },
        {
          name: 'Complex numbers introduction',
          items: [
            { label: 'Intro to complex numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-num/v/complex-number-intro' },
            { label: 'Parts of complex numbers', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-num/e/real-and-imaginary-parts-of-complex-numbers', question: { prompt: 'Practice: Parts of complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Classifying complex numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-num/v/introduction-to-complex-numbers' },
            { label: 'Classify complex numbers', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-num/e/the-imaginary-unit-and-complex-numbers', question: { prompt: 'Practice: Classify complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'The complex plane',
          items: [
            { label: 'Plotting numbers on the complex plane', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-plane/v/plotting-complex-numbers-on-the-complex-plane' },
            { label: 'The complex plane', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-plane/a/the-complex-plane' },
            { label: 'Plot numbers on the complex plane', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-plane/e/the_complex_plane', question: { prompt: 'Practice: Plot numbers on the complex plane. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Adding and subtracting complex numbers',
          items: [
            { label: 'Adding complex numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-add-sub/v/adding-complex-numbers' },
            { label: 'Subtracting complex numbers', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-add-sub/v/subtracting-complex-numbers' },
            { label: 'Add & subtract complex numbers', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-add-sub/e/adding_and_subtracting_complex_numbers', question: { prompt: 'Practice: Add & subtract complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying complex numbers',
          items: [
            { label: 'Multiplying complex numbers', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-mul/a/multiplying-complex-numbers' },
            { label: 'Multiply complex numbers (basic)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-mul/e/multiply-complex-numbers-by-real-or-imaginary-numbers', question: { prompt: 'Practice: Multiply complex numbers (basic). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiply complex numbers', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-mul/e/multiplying_complex_numbers', question: { prompt: 'Practice: Multiply complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Complex number operations review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-mul/a/complex-number-operations-review' },
          ],
        },
        {
          name: 'Quadratic equations with complex solutions',
          items: [
            { label: 'Solving quadratic equations: complex roots', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-eq/v/complex-roots-from-the-quadratic-formula' },
            { label: 'Solve quadratic equations: complex solutions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-eq/e/quadratic-formula-with-complex-solutions', question: { prompt: 'Solve x² - 5x + 6 = 0.', answer: 'x = 2 or x = 3', explanation: 'Factor: (x-2)(x-3)=0, so x=2 or x=3.' } },
            { label: 'Complex numbers: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:complex/x2ec2f6f830c9fb89:complex-eq/a/complex-numbers-faq-a2' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial factorization',
      lessons: [
        {
          name: 'Factoring monomials',
          items: [
            { label: 'Introduction to factoring higher degree polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/v/factor-high-deg-poly-intro' },
            { label: 'Introduction to factoring higher degree monomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/v/factor-high-deg-monomials' },
            { label: 'Which monomial factorization is correct?', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/v/ways-to-factor-a-monomial' },
            { label: 'Worked example: finding the missing monomial factor', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/v/finding-algebraic-factor-of-a-monomial' },
            { label: 'Worked example: finding missing monomial side in area model', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/v/dimensions-of-rectangle-for-algebraically-described-area' },
            { label: 'Factoring monomials', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/a/factoring-monomials' },
            { label: 'Factor monomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:mono-factor/e/factoring-monomials', question: { prompt: 'Factor x² - 9.', answer: '(x-3)(x+3)', explanation: 'Difference of squares: a²-b² = (a-b)(a+b).' } },
          ],
        },
        {
          name: 'Greatest common factor',
          items: [
            { label: 'Greatest common factor of monomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:gcf/v/monomial-greatest-common-factor' },
          ],
        },
        {
          name: 'Taking common factors',
          items: [
            { label: 'Taking common factor from binomial', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:common-factor/v/algebraic-factoring-by-greatest-common-monomial-factor' },
            { label: 'Taking common factor from trinomial', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:common-factor/v/factoring-and-the-distributive-property-3' },
            { label: 'Taking common factor: area model', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:common-factor/v/factoring-polynomial-with-area-model' },
            { label: 'Factoring polynomials by taking a common factor', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:common-factor/a/taking-common-factors' },
            { label: 'Factor polynomials: common factor', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:common-factor/e/factoring-polynomials', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Factoring higher degree polynomials',
          items: [
            { label: 'Factoring higher degree polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-high-deg/v/factor-high-deg-poly' },
            { label: 'Factoring higher-degree polynomials: Common factor', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-high-deg/v/factoring-perfect-square-polynomial' },
            { label: 'Factor higher degree polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-high-deg/e/factor-higher-degree-polynomials', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Factoring using structure',
          items: [
            { label: 'Identifying quadratic patterns', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/v/id-quad-patterns' },
            { label: 'Identify quadratic patterns', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/e/identify-quadratic-patterns', question: { prompt: 'Practice: Identify quadratic patterns. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Factorization with substitution', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/v/factor-w-substitution' },
            { label: 'Factoring using the perfect square pattern', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/v/factoring-special-products-2' },
            { label: 'Factoring using the difference of squares pattern', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/v/factoring-difference-of-squares' },
            { label: 'Factor polynomials using structure', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:factor-w-structure/e/factoring_difference_of_squares_3', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Polynomial identities',
          items: [
            { label: 'Polynomial identities introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:poly-identities/v/polynomial-identities-intro' },
            { label: 'Analyzing polynomial identities', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:poly-identities/v/analyzing-polynomial-manipulations' },
            { label: 'Polynomial identities', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:poly-identities/e/polynomial-identities', question: { prompt: 'Practice: Polynomial identities. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Describing numerical relationships with polynomial identities', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:poly-identities/v/relationships-w-poly-identities' },
          ],
        },
        {
          name: 'Geometric series',
          items: [
            { label: 'Geometric series introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/geo-series-intro' },
            { label: 'Finite geometric series formula', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/deriving-formula-for-sum-of-finite-geometric-series' },
            { label: 'Worked examples: finite geometric series', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/three-examples-of-evaluating-finite-geometric-series' },
            { label: 'Geometric series formula', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/e/geometric-series-formula', question: { prompt: 'Practice: Geometric series formula. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Geometric series word problems: swing', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/geo-series-word-problem-swing' },
            { label: 'Geometric series word problems: hike', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/geo-series-word-problem-hike' },
            { label: 'Finite geometric series word problems', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/e/geometric-series', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Polynomial factorization: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/a/polynomial-factorization-faq' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial division',
      lessons: [
        {
          name: 'Dividing polynomials by x',
          items: [
            { label: 'Polynomial division introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-x/v/polynomial-division-intro' },
            { label: 'Dividing polynomials by x (no remainders)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-x/v/dividing-polynomials-by-x' },
            { label: 'Divide polynomials by x (no remainders)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-x/e/poly-by-x-no-remainders', question: { prompt: 'What is 25 ÷ 3?', answer: '8 remainder 1', explanation: '3 × 8 = 24, with 1 left over.' } },
            { label: 'Divide polynomials by x (with remainders)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-x/v/polynomial-divided-by-monomial' },
          ],
        },
        {
          name: 'Dividing quadratics by linear factors',
          items: [
            { label: 'Intro to long division of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/v/polynomial-division' },
            { label: 'Dividing quadratics by linear expressions (no remainders)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/v/quad-div-by-linear-no-remainder' },
            { label: 'Divide quadratics by linear expressions (no remainders)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/e/quad-by-linear-no-remainders', question: { prompt: 'What is 20 ÷ 3?', answer: '6 remainder 2', explanation: '3 × 6 = 18, with 2 left over.' } },
            { label: 'Dividing quadratics by linear expressions with remainders', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/v/quad-div-by-linear-with-remainder' },
            { label: 'Dividing quadratics by linear expressions with remainders: missing x-term', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/v/quad-div-by-linear-missing-x-term' },
            { label: 'Divide quadratics by linear expressions (with remainders)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:quad-div-by-linear/e/quad-by-linear-remainders', question: { prompt: 'What is 13 ÷ 3?', answer: '4 remainder 1', explanation: '3 × 4 = 12, with 1 left over.' } },
          ],
        },
        {
          name: 'Dividing polynomials by linear factors',
          items: [
            { label: 'Dividing polynomials by linear expressions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/v/poly-div-by-linear' },
            { label: 'Dividing polynomials by linear expressions: missing term', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/v/poly-div-by-linear-missing-term' },
            { label: 'Divide polynomials by linear expressions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/e/divide-polynomials-by-binomials', question: { prompt: 'Practice: Divide polynomials by linear expressions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Factoring using polynomial division', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/v/factor-w-poly-div' },
            { label: 'Factoring using polynomial division: missing term', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/v/factor-w-poly-div-missing-term' },
            { label: 'Factor using polynomial division', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:poly-div-by-linear/e/factor-using-polynomial-division', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Polynomial Remainder Theorem',
          items: [
            { label: 'Intro to the Polynomial Remainder Theorem', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/polynomial-remainder-theorem' },
            { label: 'Remainder theorem: finding remainder from equation', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/polynomial-remainder-theorem-example' },
            { label: 'Remainder theorem examples', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/remainder-theorem-examples' },
            { label: 'Remainder theorem', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/e/remainder-theorem-of-polynomials', question: { prompt: 'What is 30 ÷ 4?', answer: '7 remainder 2', explanation: '4 × 7 = 28, with 2 left over.' } },
            { label: 'Remainder theorem: checking factors', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/polynomial-remainder-theorem-to-test-factor' },
            { label: 'Remainder theorem: finding coefficients', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/constructing-a-polynomial-that-has-a-certain-factor' },
            { label: 'Remainder theorem and factors', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/e/remainder-theorem-and-factors', question: { prompt: 'What is 25 ÷ 4?', answer: '6 remainder 1', explanation: '4 × 6 = 24, with 1 left over.' } },
            { label: 'Proof of the Polynomial Remainder Theorem', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/v/polynomial-remainder-theorem-proof' },
            { label: 'Polynomial division: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-div/x2ec2f6f830c9fb89:remainder-theorem/a/polynomial-division-faq' },
          ],
        },
      ],
    },
    {
      name: 'Polynomial graphs',
      lessons: [
        {
          name: 'Zeros of polynomials',
          items: [
            { label: 'Zeros of polynomials introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/polynomial-zeros-introduction' },
            { label: 'Zeros of polynomials: plotting zeros', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/plot-polynomial-zeros' },
            { label: 'Zeros of polynomials: matching equation to zeros', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/polynomial-equation-from-zeros' },
            { label: 'Zeros of polynomials: matching equation to graph', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/polynomial-equation-from-graph' },
            { label: 'Zeros of polynomials (factored form)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/e/using-zeros-to-graph-polynomials', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
            { label: 'Zeros of polynomials (with factoring): grouping', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/polynomial-zeros-grouping' },
            { label: 'Zeros of polynomials (with factoring): common factor', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/v/polynomial-zeros-common-factor' },
            { label: 'Zeros of polynomials (with factoring)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-zeros/e/find-the-zeros-of-polynomials', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Positive and negative intervals of polynomials',
          items: [
            { label: 'Positive and negative intervals of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-intervals/v/polynomial-intervals' },
            { label: 'Positive & negative intervals of polynomials', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-intervals/e/positive-and-negative-intervals-of-polynomials', question: { prompt: 'Practice: Positive & negative intervals of polynomials. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Multiplicity of zeros of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-intervals/v/polynomial-zero-multiplicity' },
            { label: 'Zeros of polynomials (multiplicity)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-intervals/v/polynomial-multiplicity-examples' },
            { label: 'Zeros of polynomials & their graphs', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-intervals/a/zeros-of-polynomials-and-their-graphs' },
          ],
        },
        {
          name: 'End behavior of polynomials',
          items: [
            { label: 'Intro to end behavior of polynomials', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-end-behavior/v/polynomial-end-behavior' },
            { label: 'End behavior of polynomials', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-end-behavior/a/end-behavior-of-polynomials' },
          ],
        },
        {
          name: 'Putting it all together',
          items: [
            { label: 'Graphs of polynomials', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-graphs-together/a/graphs-of-polynomials' },
            { label: 'Graphs of polynomials: Challenge problems', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-graphs-together/a/graphs-of-polynomials-challenge-problems' },
            { label: 'Polynomial graphs: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:poly-graphs/x2ec2f6f830c9fb89:poly-graphs-together/a/polynomial-graphs-faq' },
          ],
        },
      ],
    },
    {
      name: 'Rational exponents and radicals',
      lessons: [
        {
          name: 'Rational exponents',
          items: [
            { label: 'Intro to rational exponents', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/v/basic-fractional-exponents' },
            { label: 'Unit-fraction exponents', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/e/understanding-fractional-exponents', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Rewriting roots as rational exponents', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/v/rewriting-roots-as-rational-exponents' },
            { label: 'Fractional exponents', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/e/exponents_3', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Rational exponents challenge', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/e/manipulating-fractional-exponents', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Exponential equation with rational answer', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:rational-exp/v/solving-for-a-fractional-exponent' },
          ],
        },
        {
          name: 'Properties of exponents (rational exponents)',
          items: [
            { label: 'Rewriting quotient of powers (rational exponents)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-properties/v/simplifying-exponent-expression-with-division' },
            { label: 'Properties of exponents intro (rational exponents)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-properties/e/exponents_4', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Rewriting mixed radical and exponential expressions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-properties/v/fractional-exponent-expressions-2' },
            { label: 'Properties of exponents (rational exponents)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-properties/e/rational-exp-prop-challenge', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Evaluating exponents & radicals',
          items: [
            { label: 'Evaluating fractional exponents', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/v/fractional-exponents-with-numerators-other-than-1' },
            { label: 'Evaluating fractional exponents: negative unit-fraction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/v/negative-fractional-exponent-examples' },
            { label: 'Evaluating fractional exponents: fractional base', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/v/negative-fractional-exponent-examples-2' },
            { label: 'Evaluating quotient of fractional exponents', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/v/simplifying-numerical-expression-with-rational-exponents' },
            { label: 'Evaluating mixed radicals and exponents', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/v/simplifying-with-exponent-properties' },
            { label: 'Evaluate radical expressions challenge', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:eval-exp-rad/e/simplify-radicals-and-exponentials', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
          ],
        },
        {
          name: 'Equivalent forms of exponential expressions',
          items: [
            { label: 'Rewriting exponential expressions as A⋅Bᵗ', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:equivalent-exp/v/simplifying-an-exponential-expression' },
            { label: 'Rewrite exponential expressions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:equivalent-exp/e/rewrite-exponential-expressions', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Equivalent forms of exponential expressions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:equivalent-exp/v/rewriting-an-exponential-expression-in-a-hairier-way' },
          ],
        },
        {
          name: 'Solving exponential equations using properties of exponents',
          items: [
            { label: 'Solving exponential equations using exponent properties', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-eq-prop/v/solving-exponential-equations-with-exponent-properties' },
            { label: 'Solve exponential equations using exponent properties', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-eq-prop/e/solve-exponential-equations-using-properties-of-exponents--basic-', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Solving exponential equations using exponent properties (advanced)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-eq-prop/v/solving-exponential-equations-with-exponent-properties-advanced' },
            { label: 'Solve exponential equations using exponent properties (advanced)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-eq-prop/e/solve-exponential-equations-using-properties-of-exponents-advanced', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Rational exponents and radicals: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:exp/x2ec2f6f830c9fb89:exp-eq-prop/a/rational-exponents-radicals-faq' },
          ],
        },
      ],
    },
    {
      name: 'Exponential models',
      lessons: [
        {
          name: 'Interpreting the rate of change of exponential models',
          items: [
            { label: 'Interpreting change in exponential models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:exp-change/v/interpreting-change-in-exponential-models' },
            { label: 'Interpret change in exponential models', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:exp-change/e/modeling-with-exponential-functions', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Interpreting time in exponential models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:exp-change/v/interpreting-time-in-exponential-models' },
            { label: 'Interpret time in exponential models', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:exp-change/e/rewriting-and-interpreting-exponential-functions', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Constructing exponential models according to rate of change',
          items: [
            { label: 'Constructing exponential models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:construct-exp/v/constructing-exponential-models' },
            { label: 'Constructing exponential models: half life', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:construct-exp/v/constructing-exponential-models-half-life' },
            { label: 'Constructing exponential models: percent change', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:construct-exp/v/constructing-exponential-models-percent-change' },
            { label: 'Construct exponential models', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:construct-exp/e/construct-exponential-models-according-to-rate-of-change', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Advanced interpretation of exponential models',
          items: [
            { label: 'Interpreting change in exponential models: with manipulation', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:interpret-exp/v/interpreting-change-in-exponential-models-with-manipulation' },
            { label: 'Interpret change in exponential models: with manipulation', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:interpret-exp/e/interpret-rate-of-change-of-exponential-models-with-manipulation', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Interpreting change in exponential models: changing units', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:interpret-exp/v/interpreting-change-in-exponential-models-changing-units' },
            { label: 'Interpret change in exponential models: changing units', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:interpret-exp/e/interpret-rate-of-change-of-exponential-models-for-a-different-unit', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Exponential models: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:exp-model/x2ec2f6f830c9fb89:interpret-exp/a/exponential-models-faq' },
          ],
        },
      ],
    },
    {
      name: 'Logarithms',
      lessons: [
        {
          name: 'Introduction to logarithms',
          items: [
            { label: 'Intro to logarithms', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/v/logarithms' },
            { label: 'Intro to Logarithms', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/a/intro-to-logarithms' },
            { label: 'Evaluate logarithms', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/e/logarithms_1', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Evaluating logarithms (advanced)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/v/fancier-logarithm-expressions' },
            { label: 'Evaluate logarithms (advanced)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/e/logarithms_1.5', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Relationship between exponentials & logarithms', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/v/exponential-to-logarithmic-form' },
            { label: 'Relationship between exponentials & logarithms: graphs', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/v/plotting-exponential-logarithm' },
            { label: 'Relationship between exponentials & logarithms: tables', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-intro/v/logarithm-exponential-deductions' },
          ],
        },
        {
          name: 'The constant e and the natural logarithm',
          items: [
            { label: '𝑒 and compound interest', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:e/v/e-through-compound-interest' },
            { label: '𝑒 as a limit', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:e/v/e-as-limit' },
            { label: 'Evaluating natural logarithm with calculator', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:e/v/natural-logarithm-with-a-calculator' },
          ],
        },
        {
          name: 'Properties of logarithms',
          items: [
            { label: 'Intro to logarithm properties (1 of 2)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/introduction-to-logarithm-properties' },
            { label: 'Intro to logarithm properties (2 of 2)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/introduction-to-logarithm-properties-part-2' },
            { label: 'Intro to logarithm properties', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/a/properties-of-logarithms' },
            { label: 'Using the logarithmic product rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/sum-of-logarithms-with-same-base' },
            { label: 'Using the logarithmic power rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/logarithm-of-a-power' },
            { label: 'Use the properties of logarithms', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/e/logarithms_2', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Using the properties of logarithms: multiple steps', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/using-multiple-logarithm-properties-to-simplify' },
            { label: 'Proof of the logarithm product rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/proof-log-a-log-b-log-ab' },
            { label: 'Proof of the logarithm quotient and power rules', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/v/proof-a-log-b-log-b-a-log-a-log-b-log-a-b' },
            { label: 'Justifying the logarithm properties', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/a/justifying-the-logarithm-properties' },
          ],
        },
        {
          name: 'The change of base formula for logarithms',
          items: [
            { label: 'Evaluating logarithms: change of base rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/v/change-of-base-formula' },
            { label: 'Logarithm change of base rule intro', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/a/logarithm-change-of-base-rule-intro' },
            { label: 'Evaluate logarithms: change of base rule', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/e/evaluate-logarithms-using-the-change-of-base-rule', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Using the logarithm change of base rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/v/rewriting-logarithmic-expressions-change-of-base' },
            { label: 'Use the logarithm change of base rule', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/e/rewrite-logarithmic-expressions-using-the-change-of-base-rule', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Proof of the logarithm change of base rule', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/v/change-of-base-formula-proof' },
            { label: 'Logarithm properties review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:change-of-base/a/logarithm-properties-review' },
          ],
        },
        {
          name: 'Solving exponential equations with logarithms',
          items: [
            { label: 'Solving exponential equations using logarithms: base-10', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-eq-log/v/exponential-equation' },
            { label: 'Solving exponential equations using logarithms', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-eq-log/a/solving-exponential-equations-with-logarithms' },
            { label: 'Solve exponential equations using logarithms: base-10 and base-e', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-eq-log/e/using-logarithms-to-solve-exponential-equations', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Solving exponential equations using logarithms: base-2', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-eq-log/v/solve-exponentials' },
            { label: 'Solve exponential equations using logarithms: base-2 and other bases', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-eq-log/e/solve-exponential-equations-using-logarithms-base-2', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Solving exponential models',
          items: [
            { label: 'Exponential model word problem: medication dissolve', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-models/v/solving-exponential-model-word-problems-1' },
            { label: 'Exponential model word problem: bacteria growth', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-models/v/solving-exponential-model-word-problems-2' },
            { label: 'Exponential model word problems', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-models/e/exponential-models-word-problems', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Logarithms: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:exp-models/a/logarithms-faq' },
          ],
        },
      ],
    },
    {
      name: 'Transformations of functions',
      lessons: [
        {
          name: 'Shifting functions',
          items: [
            { label: 'Shifting functions introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:shift/v/shifting-functions-intro' },
            { label: 'Shifting functions examples', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:shift/v/shifting-functions-examples' },
            { label: 'Graphing shifted functions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:shift/v/graphing-shifted-functions' },
            { label: 'Shift functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:shift/e/shift-functions', question: { prompt: 'Practice: Shift functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Reflecting functions',
          items: [
            { label: 'Reflecting functions introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:reflect/v/reflecting-functions-intro' },
            { label: 'Reflecting functions: examples', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:reflect/v/reflecting-functions-examples' },
            { label: 'Reflect functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:reflect/e/reflect-functions', question: { prompt: 'Practice: Reflect functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Symmetry of functions',
          items: [
            { label: 'Function symmetry introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/v/function-symmetry' },
            { label: 'Even and odd functions: Graphs', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/v/recognizing-features-of-functions-2-example-2' },
            { label: 'Even and odd functions: Tables', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/v/even-and-odd-functions-tables' },
            { label: 'Even and odd functions: Graphs and tables', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/e/even_and_odd_functions', question: { prompt: 'Practice: Even and odd functions: Graphs and tables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Even and odd functions: Equations', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/v/even-and-odd-functions-equations' },
            { label: 'Even and odd functions: Find the mistake', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/v/even-and-odd-functions-find-the-mistake' },
            { label: 'Even & odd functions: Equations', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/e/determine-if-a-polynomial-is-even-or-odd', question: { prompt: 'Practice: Even & odd functions: Equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Symmetry of polynomials', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:symmetry/a/symmetry-of-polynomials' },
          ],
        },
        {
          name: 'Scaling functions',
          items: [
            { label: 'Scaling functions introduction', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/v/scaling-functions-intro' },
            { label: 'Scaling functions vertically: examples', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/v/vert-function-scaling' },
            { label: 'Scale functions vertically', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/e/scale-functions-vertically', question: { prompt: 'Practice: Scale functions vertically. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Scaling functions horizontally: examples', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/v/scaling-functions-horizontally' },
            { label: 'Identifying horizontal squash from graph', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/v/compressing-functions-example' },
            { label: 'Scale functions horizontally', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:scale/e/scale-functions-horizontally', question: { prompt: 'Practice: Scale functions horizontally. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Putting it all together',
          items: [
            { label: 'Identifying function transformations', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:trans-all-together/v/shifting-and-reflecting-functions' },
            { label: 'Identify function transformations', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:trans-all-together/e/shifting_and_reflecting_functions', question: { prompt: 'Reflect (3,4) across the x-axis. New point?', answer: '(3,-4)', explanation: 'Reflection across x-axis negates y.' } },
          ],
        },
        {
          name: 'Graphs of square and cube root functions',
          items: [
            { label: 'Graphing square and cube root functions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:radical-graphs/v/graphing-square-and-cube-root' },
            { label: 'Radical functions & their graphs', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:radical-graphs/a/match-the-formula-of-a-radical-function-to-its-graph' },
            { label: 'Graphs of square and cube root functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:radical-graphs/e/graphs-of-radical-functions', question: { prompt: 'Practice: Graphs of square and cube root functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Graphs of exponential functions',
          items: [
            { label: 'Transforming exponential graphs', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:exp-graphs/v/transforming-exponential-graphs' },
            { label: 'Transforming exponential graphs (example 2)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:exp-graphs/v/transforming-exponential-graphs-2' },
            { label: 'Graphing exponential functions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:exp-graphs/v/graphing-exponential-functions-interactive' },
            { label: 'Graphs of exponential functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:exp-graphs/e/graphs-of-exponential-functions', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
        {
          name: 'Graphs of logarithmic functions',
          items: [
            { label: 'Graphical relationship between 2ˣ and log₂(x)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:log-graphs/v/comparing-exponential-logarithmic-functions' },
            { label: 'Graphing logarithmic functions (example 1)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:log-graphs/v/graphing-logarithmic-functions-1' },
            { label: 'Graphing logarithmic functions (example 2)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:log-graphs/v/graphing-logarithmic-functions-2' },
            { label: 'Graphs of logarithmic functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:log-graphs/e/graphs-of-exponentials-and-logarithms', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Transformations of functions: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:transformations/x2ec2f6f830c9fb89:log-graphs/a/transformations-of-functions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Equations',
      lessons: [
        {
          name: 'Rational equations',
          items: [
            { label: 'Rational equations intro', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/v/rational-equation-intro' },
            { label: 'Equations with rational expressions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/v/equations-with-two-rational-expressions' },
            { label: 'Equations with rational expressions (example 2)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/v/equations-with-two-rational-expressions-2' },
            { label: 'Rational equations', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/e/rational-equations-3', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Finding inverses of rational functions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/v/rational-function-inverse' },
            { label: 'Find inverses of rational functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:rational-eq/e/rational-inverses', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Square-root equations',
          items: [
            { label: 'Intro to square-root equations & extraneous solutions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/v/extraneous-solutions-to-radical-equations' },
            { label: 'Square-root equations intro', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/v/extraneous-solutions-of-radical-equations' },
            { label: 'Intro to solving square-root equations', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/a/solve-square-root-equations-basic-examples' },
            { label: 'Solving square-root equations', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/a/solving-square-root-equations-advanced' },
            { label: 'Solving square-root equations: one solution', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/v/solving-radical-equations' },
            { label: 'Solving square-root equations: two solutions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/v/solving-square-root-equations-w-two-solutions' },
            { label: 'Solving square-root equations: no solution', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/v/solving-square-root-equations-w-no-solution' },
            { label: 'Square-root equations', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sqrt-eq/e/solve-square-root-equations-advanced', question: { prompt: 'Practice: Square-root equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Extraneous solutions',
          items: [
            { label: 'Extraneous solutions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:extraneous-sol/v/extraneous-solutions' },
            { label: 'Equation that has a specific extraneous solution', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:extraneous-sol/v/finding-radical-equation-with-given-extraneous-solution' },
            { label: 'Extraneous solutions of radical equations', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:extraneous-sol/a/analyzing-extraneous-solutions-of-square-root-equations' },
            { label: 'Extraneous solutions of equations', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:extraneous-sol/e/extraneous-solutions-to-radical-equations', question: { prompt: 'Practice: Extraneous solutions of equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Cube-root equations',
          items: [
            { label: 'Solving cube-root equations', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:cbrt-eq/v/solving-radical-equations-2' },
          ],
        },
        {
          name: 'Quadratic systems',
          items: [
            { label: 'Quadratic systems: a line and a parabola', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:quad-sys/v/line-and-parabola-system' },
            { label: 'Quadratic systems: a line and a circle', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:quad-sys/v/systems-of-nonlinear-equations-3' },
            { label: 'Quadratic systems', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:quad-sys/e/quadratic-systems', question: { prompt: 'Practice: Quadratic systems. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Quadratic system with no solutions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:quad-sys/v/non-linear-systems-of-equations-3' },
          ],
        },
        {
          name: 'Solving equations by graphing',
          items: [
            { label: 'Solving equations by graphing', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/v/equations-by-graphing' },
            { label: 'Solving equations by graphing: intro', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/v/graphical-equations-intro' },
            { label: 'Solving equations graphically: intro', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/e/equations-graph-intro', question: { prompt: 'Practice: Solving equations graphically: intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solving equations by graphing: graphing calculator', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/v/graphically-solving-equations-calculator' },
            { label: 'Solving equations graphically: graphing calculator', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/e/equations-graph-calc', question: { prompt: 'Practice: Solving equations graphically: graphing calculator. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solving equations by graphing: word problems', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/v/graphically-solving-equations-word-problems' },
            { label: 'Solving equations graphically: word problems', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/e/equations-graph-wp', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Equations: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:eq/x2ec2f6f830c9fb89:sol-eq-graph/a/equations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Trigonometry',
      lessons: [
        {
          name: 'Unit circle introduction',
          items: [
            { label: 'Unit circle', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:unit-circle/v/unit-circle-definition-of-trig-functions-1' },
            { label: 'The trig functions & right triangle trig ratios', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:unit-circle/v/matching-ratios-trig-functions' },
            { label: 'Trig unit circle review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:unit-circle/a/trig-unit-circle-review' },
          ],
        },
        {
          name: 'Radians',
          items: [
            { label: 'Intro to radians', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/introduction-to-radians' },
            { label: 'Radians & degrees', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/radian-and-degree-conversion-practice' },
            { label: 'Degrees to radians', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/we-converting-degrees-to-radians' },
            { label: 'Radians to degrees', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/we-converting-radians-to-degrees' },
            { label: 'Radian angles & quadrants', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/rotation-by-radians-and-quadrants' },
            { label: 'Unit circle (with radians)', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/e/unit-circle-with-radians', question: { prompt: 'Find cos(0).', answer: '1', explanation: 'On the unit circle, cos(0) = 1.' } },
          ],
        },
        {
          name: 'The Pythagorean identity',
          items: [
            { label: 'Proof of the Pythagorean trig identity', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:pythagorean-id/v/pythagorean-trig-identity-from-unit-circle' },
            { label: 'Using the Pythagorean trig identity', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:pythagorean-id/v/using-the-pythagorean-trig-identity' },
            { label: 'Use the Pythagorean identity', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:pythagorean-id/e/circles-and-pythagorean-identities', question: { prompt: 'Find the hypotenuse if legs are 3 and 4.', answer: '5', explanation: '3²+4² = 25, so hypotenuse = √25 = 5.' } },
            { label: 'Pythagorean identity review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:pythagorean-id/a/pythagorean-identity-review' },
          ],
        },
        {
          name: 'Trigonometric values of special angles',
          items: [
            { label: 'Trig values of π/4', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:special-angles/v/solving-triangle-unit-circle' },
            { label: 'Trig values of special angles', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:special-angles/e/trigonometric-functions-of-special-angles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Graphs of sin(x), cos(x), and tan(x)',
          items: [
            { label: 'Graph of y=sin(x)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:trig-graphs/v/we-graph-domain-and-range-of-sine-function' },
            { label: 'Intersection points of y=sin(x) and y=cos(x)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:trig-graphs/v/we-graphs-of-sine-and-cosine-functions' },
            { label: 'Graph of y=tan(x)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:trig-graphs/v/tangent-graph' },
          ],
        },
        {
          name: 'Amplitude, midline and period',
          items: [
            { label: 'Features of sinusoidal functions', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:amp-mid-period/v/midline-amplitude-period' },
            { label: 'Midline of sinusoidal functions from graph', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:amp-mid-period/e/midline-of-trig-functions', question: { prompt: 'Practice: Midline of sinusoidal functions from graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Amplitude of sinusoidal functions from graph', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:amp-mid-period/e/amplitude-of-trig-functions', question: { prompt: 'Practice: Amplitude of sinusoidal functions from graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Period of sinusoidal functions from graph', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:amp-mid-period/e/period-of-trig-functions', question: { prompt: 'Practice: Period of sinusoidal functions from graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Midline, amplitude, and period review', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:amp-mid-period/a/midline-amplitude-and-period-review' },
          ],
        },
        {
          name: 'Transforming sinusoidal graphs',
          items: [
            { label: 'Amplitude & period of sinusoidal functions from equation', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/v/we-amplitude-and-period' },
            { label: 'Transforming sinusoidal graphs: vertical stretch & horizontal reflection', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/v/example-amplitude-and-period-transformations' },
            { label: 'Transforming sinusoidal graphs: vertical & horizontal stretches', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/v/amplitude-and-period-cosine-transformations' },
            { label: 'Amplitude of sinusoidal functions from equation', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/e/find-amplitude-of-a-sinusoid-from-formula', question: { prompt: 'Practice: Amplitude of sinusoidal functions from equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Midline of sinusoidal functions from equation', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/e/find-midline-of-a-sinusoid-from-formula', question: { prompt: 'Practice: Midline of sinusoidal functions from equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Period of sinusoidal functions from equation', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:period/e/find-period-of-a-sinusoid-from-formula', question: { prompt: 'Practice: Period of sinusoidal functions from equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Graphing sinusoidal functions',
          items: [
            { label: 'Example: Graphing y=3⋅sin(½⋅x)-2', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/v/example-graphing-y-3sin-x-2' },
            { label: 'Example: Graphing y=-cos(π⋅x)+1.5', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/v/example-graphing-y-cos-x-1-5' },
            { label: 'Graph sinusoidal functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/e/graphs_of_sine_and_cosine', question: { prompt: 'Practice: Graph sinusoidal functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Sinusoidal function from graph', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/v/trig-function-equation' },
            { label: 'Construct sinusoidal functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/e/construct-sinusoidal-functions', question: { prompt: 'Practice: Construct sinusoidal functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graph sinusoidal functions: phase shift', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:graphing-sinusoid/e/graphs-of-trigonometric-functions', question: { prompt: 'Practice: Graph sinusoidal functions: phase shift. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Sinusoidal models',
          items: [
            { label: 'Interpreting trigonometric graphs in context', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/v/interpreting-trig-graphs-in-context' },
            { label: 'Interpret trigonometric graphs in context', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/e/interpreting-trigonometric-graphs-in-context', question: { prompt: 'Evaluate sin(30°).', answer: '1/2', explanation: 'sin(30°) = 1/2 (special angle).' } },
            { label: 'Trig word problem: modeling daily temperature', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/v/modeling-with-shifted-trig-functions' },
            { label: 'Trig word problem: modeling annual temperature', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/v/modeling-temperature-fluxtuations' },
            { label: 'Model with sinusoidal functions', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/e/modeling-with-periodic-functions', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Trig word problem: length of day (phase shift)', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/v/modeling-periodic-function-with-shift' },
            { label: 'Modeling with sinusoidal functions: phase shift', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/e/modeling-with-periodic-functions-2', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Trigonometry: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:sinusoidal-models/a/trigonometry-faq-a2' },
          ],
        },
      ],
    },
    {
      name: 'Modeling',
      lessons: [
        {
          name: 'Modeling with function combination',
          items: [
            { label: 'Modeling with function combination', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:model-comb/v/modeling-with-combined-functions' },
            { label: 'Model with function combination', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:model-comb/e/combining-functions-with-arithmetic-operations', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
          ],
        },
        {
          name: 'Interpreting features of functions',
          items: [
            { label: 'Periodicity of algebraic models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:interpreting-features/v/periodicity-of-algebraic-models' },
            { label: 'End behavior of algebraic models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:interpreting-features/v/end-behavior-word-problems' },
            { label: 'Symmetry of algebraic models', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:interpreting-features/v/interpreting-features-of-functions-2-example-2' },
          ],
        },
        {
          name: 'Manipulating formulas',
          items: [
            { label: 'Manipulating formulas: perimeter', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:manipulating-formulas/v/example-of-solving-for-a-variable' },
            { label: 'Manipulating formulas: area', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:manipulating-formulas/v/rearrange-formulas-to-isolate-specific-variables' },
            { label: 'Manipulating formulas: temperature', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:manipulating-formulas/v/solving-for-a-variable-2' },
            { label: 'Manipulate formulas', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:manipulating-formulas/e/manipulating-formulas', question: { prompt: 'Practice: Manipulate formulas. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Modeling with two variables',
          items: [
            { label: 'Graph labels and scales', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:eq-ineq-models/v/graph-labels-and-scales' },
            { label: 'Rational equation word problem', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:eq-ineq-models/v/making-more-pizzas-to-spread-cost-per-pizza' },
            { label: 'Quadratic inequality word problem', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:eq-ineq-models/v/quadratic-inequality-word-problem' },
            { label: 'Exponential equation word problem', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:eq-ineq-models/v/constructing-an-exponential-equation-example' },
            { label: 'Equations & inequalities word problems', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:eq-ineq-models/e/modeling-with-one-variable-equations-and-inequalities', question: { prompt: 'Solve 2x + 1 > 7.', answer: 'x > 3', explanation: 'Subtract 1: 2x>6, divide by 2: x>3.' } },
          ],
        },
        {
          name: 'Modeling with multiple variables',
          items: [
            { label: 'Modeling with multiple variables: Pancakes', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/modeling-with-multiple-variables-pancakes' },
            { label: 'Modeling with multiple variables: Roller coaster', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/modeling-with-multiple-variables-roller-coaster' },
            { label: 'Modeling with multiple variables: Taco stand', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/modeling-with-multiple-variables-taco-stand' },
            { label: 'Modeling with multiple variables: Ice cream', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/modeling-with-multiple-variables-ice-cream' },
            { label: 'Modeling with multiple variables', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/e/multivar-modeling', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Interpreting expressions with multiple variables: Resistors', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/interpreting-expressions-with-multiple-variables-resistors' },
            { label: 'Interpreting expressions with multiple variables: Cylinder', type: 'video', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/v/interpreting-expressions-with-multiple-variables-cylinder' },
            { label: 'Interpreting expressions with multiple variables', type: 'exercise', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/e/interpreting-multivar-expressions', question: { prompt: 'Practice: Interpreting expressions with multiple variables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Modeling: FAQ', type: 'article', href: '/math/algebra2/x2ec2f6f830c9fb89:modeling/x2ec2f6f830c9fb89:modeling-with-multiple-variables/a/modeling-faq' },
          ],
        },
      ],
    },
  ],
};
