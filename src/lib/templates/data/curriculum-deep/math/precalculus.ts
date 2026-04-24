import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '12',
  label: 'Precalculus',
  sourceUrl: 'https://www.khanacademy.org/math/precalculus',
  units: [
    {
      name: 'Composite and inverse functions',
      lessons: [
        {
          name: 'Composing functions',
          items: [
            { label: 'Intro to composing functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/function-composition' },
            { label: 'Composing functions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/a/finding-and-evaluating-composite-functions' },
            { label: 'Evaluating composite functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/evaluating-composite-functions' },
            { label: 'Evaluate composite functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/e/evaluate-composite-functions-from-formulas', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Evaluating composite functions: using tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/evaluating-composite-functions-using-tables' },
            { label: 'Evaluating composite functions: using graphs', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/evaluating-composite-functions-using-graphs' },
            { label: 'Evaluate composite functions: graphs & tables', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/e/evaluate-composite-functions-from-graphs-and-tables', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Finding composite functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/new-function-from-composition' },
            { label: 'Find composite functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/e/compose-functions', question: { prompt: 'Practice: Find composite functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Evaluating composite functions (advanced)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composing/v/evaluating-composite-functions-example-1' },
          ],
        },
        {
          name: 'Modeling with composite functions',
          items: [
            { label: 'Modeling with composite functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composite-modeling/v/modeling-with-composite-functions-examples' },
            { label: 'Modeling with composite functions: skydiving', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composite-modeling/v/modeling-with-composite-functions' },
            { label: 'Meaningfully composing functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composite-modeling/v/meaningfully-composing-functions' },
            { label: 'Model with composite functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:composite-modeling/e/modeling-with-composite-functions', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
          ],
        },
        {
          name: 'Invertible functions',
          items: [
            { label: 'Determining if a function is invertible', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:invertible/v/determining-if-a-function-is-invertible' },
            { label: 'Intro to invertible functions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:invertible/a/intro-to-invertible-functions' },
            { label: 'Determine if a function is invertible', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:invertible/e/inverse-domain-range', question: { prompt: 'Practice: Determine if a function is invertible. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Restricting domains of functions to make them invertible', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:invertible/v/restricting-trig-function-domain' },
            { label: 'Restrict domains of functions to make them invertible', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:invertible/e/restrict-the-domains-of-functions', question: { prompt: 'Find the domain of f(x) = 1/(x-2).', answer: 'All real numbers except x=2', explanation: 'Denominator cannot be zero: x ≠ 2.' } },
          ],
        },
        {
          name: 'Inverse functions in graphs and tables',
          items: [
            { label: 'Reading inverse values from a graph', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:inverse-functions-in-graphs-and-tables/v/reading-inverse-values-from-a-graph' },
            { label: 'Reading inverse values from a table', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:inverse-functions-in-graphs-and-tables/v/reading-inverse-values-from-a-table' },
            { label: 'Inverse functions: graphs and tables', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:inverse-functions-in-graphs-and-tables/e/inverse-functions-graphs-and-tables', question: { prompt: 'Practice: Inverse functions: graphs and tables. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Verifying inverse functions by composition',
          items: [
            { label: 'Verifying inverse functions from tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/v/verify-inverse-functions-from-tables' },
            { label: 'Using specific values to test for inverses', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/v/using-specific-values-to-test-for-inverses' },
            { label: 'Verifying inverse functions by composition', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/v/verifying-function-inverses-by-composition' },
            { label: 'Verifying inverse functions by composition: not inverse', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/v/composing-non-inverse-functions' },
            { label: 'Verify inverse functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/e/inverses_of_functions', question: { prompt: 'Practice: Verify inverse functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Composite and inverse functions: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:composite/x9e81a4f98389efdf:verifying-inverse/a/composite-inverse-functions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Trigonometry',
      lessons: [
        {
          name: 'Special trigonometric values in the first quadrant',
          items: [
            { label: 'Cosine, sine and tangent of π/6 and π/3', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:special-trigonometric-values-in-the-first-quadrant/v/cosine-sine-and-tangent-of-6-and-3' },
            { label: 'Trig values of π/4', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:special-trigonometric-values-in-the-first-quadrant/v/solving-triangle-unit-circle' },
            { label: 'Trig values of π/6, π/4, and π/3', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:special-trigonometric-values-in-the-first-quadrant/e/trig-values-of-6-4-and-3', question: { prompt: 'Practice: Trig values of π/6, π/4, and π/3. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Trigonometric identities on the unit circle',
          items: [
            { label: 'Sine & cosine identities: symmetry', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/v/trigonometry-unit-circle-symmetry' },
            { label: 'Tangent identities: symmetry', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/v/tan-symmetries-unit-circle' },
            { label: 'Sine & cosine identities: periodicity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/v/trig-angle-rotations' },
            { label: 'Tangent identities: periodicity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/v/tan-periodicity' },
            { label: 'Trig identities from reflections and rotations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/e/trig-identities-from-reflections-and-rotations', question: { prompt: 'Practice: Trig identities from reflections and rotations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Trig values of special angles', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:trig-id/e/trigonometric-functions-of-special-angles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Inverse trigonometric functions',
          items: [
            { label: 'Intro to arcsine', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/inverse-trig-functions-arcsin' },
            { label: 'Intro to arctangent', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/inverse-trig-functions-arctan' },
            { label: 'Intro to arccosine', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/inverse-trig-functions-arccos' },
            { label: 'Evaluate inverse trig functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/e/inverse_trig_functions', question: { prompt: 'If f(x) = 2x + 1, find f(3).', answer: '7', explanation: 'f(3) = 2(3)+1 = 7.' } },
            { label: 'Restricting domains of functions to make them invertible', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/restricting-trig-function-domain' },
            { label: 'Domain & range of inverse tangent function', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/inverse-tan-domain' },
            { label: 'Using inverse trig functions with a calculator', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/v/inverse-tan-scenario' },
            { label: 'Inverse trigonometric functions review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:inverse-trig/a/inverse-trigonometric-functions-review' },
          ],
        },
        {
          name: 'Law of sines',
          items: [
            { label: 'Solving for a side with the law of sines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-sines/v/law-of-sines' },
            { label: 'Solving for an angle with the law of sines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-sines/v/law-of-sines-example' },
            { label: 'Solve triangles using the law of sines', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-sines/e/law_of_sines', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Proof of the law of sines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-sines/v/proof-law-of-sines' },
          ],
        },
        {
          name: 'Law of cosines',
          items: [
            { label: 'Solving for a side with the law of cosines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-cosines/v/law-of-cosines-example' },
            { label: 'Solving for an angle with the law of cosines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-cosines/v/law-of-cosines-missing-angle' },
            { label: 'Solve triangles using the law of cosines', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-cosines/e/law_of_cosines', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Proof of the law of cosines', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:law-of-cosines/v/law-of-cosines' },
          ],
        },
        {
          name: 'Solving general triangles',
          items: [
            { label: 'Trig word problem: stars', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:solving-general-triangles/v/law-of-cosines-word-problem' },
            { label: 'General triangle word problems', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:solving-general-triangles/e/law-of-sines-and-cosines-word-problems', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Laws of sines and cosines review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:solving-general-triangles/a/laws-of-sines-and-cosines-review' },
          ],
        },
        {
          name: 'Sinusoidal equations',
          items: [
            { label: 'Solving sinusoidal equations of the form sin(x)=d', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/v/sine-solutions' },
            { label: 'Cosine equation algebraic solution set', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/v/cosine-equation-algebraic-solution-set' },
            { label: 'Cosine equation solution set in an interval', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/v/cosine-equation-solution-set-in-an-interval' },
            { label: 'Sine equation algebraic solution set', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/v/sine-equation-algebraic-solution-set' },
            { label: 'Solving cos(θ)=1 and cos(θ)=-1', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/v/we-graph-of-cosine-function' },
            { label: 'Solve sinusoidal equations (basic)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/e/solve-basic-sinusoidal-equations', question: { prompt: 'Practice: Solve sinusoidal equations (basic). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Solve sinusoidal equations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-eq/e/solve-advanced-sinusoidal-equations', question: { prompt: 'Practice: Solve sinusoidal equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Sinusoidal models',
          items: [
            { label: 'Interpreting solutions of trigonometric equations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-models/v/interpreting-solutions-of-trigonometric-equations' },
            { label: 'Interpret solutions of trigonometric equations in context', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-models/e/interpret-solutions-of-trigonometric-equations-in-context', question: { prompt: 'Evaluate sin(30°).', answer: '1/2', explanation: 'sin(30°) = 1/2 (special angle).' } },
            { label: 'Trig word problem: solving for temperature', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-models/v/inverse-trig-with-model' },
            { label: 'Sinusoidal models word problems', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-models/e/inverse-trig-word-problems', question: { prompt: 'Find the mode of {2, 3, 3, 4, 5}.', answer: '3', explanation: '3 appears most often.' } },
            { label: 'Trigonometric equations review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:sinus-models/a/trigonometric-equations-review' },
          ],
        },
        {
          name: 'Angle addition identities',
          items: [
            { label: 'Trig angle addition identities', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/trigonometry-identity-review-fun' },
            { label: 'Using the cosine angle addition identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/cosine-addition-identity-example' },
            { label: 'Using the cosine double-angle identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/double-angle-formula-for-cosine-example-c' },
            { label: 'Use the trig angle addition identities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/e/trig_addition_identities', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Proof of the sine angle addition identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/proof-angle-addition-sine' },
            { label: 'Proof of the cosine angle addition identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/proof-angle-addition-cosine' },
            { label: 'Proof of the tangent angle sum and difference identities', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:angle-addition/v/proof-of-the-tangent-angle-sum-and-difference-identities' },
          ],
        },
        {
          name: 'Using trigonometric identities',
          items: [
            { label: 'Finding trig values using angle addition identities', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/v/sine-angle-addition-2' },
            { label: 'Using the tangent angle addition identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/v/using-the-tangent-angle-addition-identity' },
            { label: 'Find trig values using angle addition identities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/e/applying-angle-addition-formulas', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Using trig angle addition identities: finding side lengths', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/v/sin-angle-addition' },
            { label: 'Using trig angle addition identities: manipulating expressions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/v/cosine-angle-addition' },
            { label: 'Using trigonometric identities', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/v/examples-using-pythagorean-identities-to-simplify-trigonometric-expressions' },
            { label: 'Trig identity reference', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/a/trig-identity-reference' },
            { label: 'Trigonometry: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:using-trig-id/a/trig-faq' },
          ],
        },
      ],
    },
    {
      name: 'Complex numbers',
      lessons: [
        {
          name: 'The complex plane',
          items: [
            { label: 'Plotting numbers on the complex plane', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-plane/v/plotting-complex-numbers-on-the-complex-plane' },
            { label: 'The complex plane', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-plane/a/the-complex-plane' },
            { label: 'Plot numbers on the complex plane', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-plane/e/the_complex_plane', question: { prompt: 'Practice: Plot numbers on the complex plane. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Graphically add & subtract complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-plane/e/complex_plane_operations', question: { prompt: 'Practice: Graphically add & subtract complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Distance and midpoint of complex numbers',
          items: [
            { label: 'Distance & midpoint of complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-distance-midpoint/v/complex-plane-distance-midpoint' },
            { label: 'Distance of complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-distance-midpoint/e/distance-and-midpoint-on-the-complex-plane', question: { prompt: 'Practice: Distance of complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Midpoint of complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-distance-midpoint/e/find-the-midpoint-of-two-complex-numbers', question: { prompt: 'Practice: Midpoint of complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Complex conjugates and dividing complex numbers',
          items: [
            { label: 'Intro to complex number conjugates', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-div/v/complex-conjugates' },
            { label: 'Complex number conjugates', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-div/v/complex-conjugates-example' },
            { label: 'Dividing complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-div/v/dividing-complex-numbers' },
            { label: 'Divide complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-div/e/dividing_complex_numbers', question: { prompt: 'Practice: Divide complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dividing complex numbers review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-div/a/dividing-complex-numbers-review' },
          ],
        },
        {
          name: 'Identities with complex numbers',
          items: [
            { label: 'Complex numbers & sum of squares factorization', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-id/v/factoring-sums-of-squares' },
            { label: 'Factoring sum of squares', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-id/v/factoring-sum-of-squares' },
            { label: 'Factoring polynomials using complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-id/v/factoring-polynomials-using-complex-numbers' },
            { label: 'Factor polynomials: complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-id/e/equivalent-forms-of-expressions-with-complex-numbers', question: { prompt: 'Factor x² + 5x + 6.', answer: '(x+2)(x+3)', explanation: 'Find pairs that multiply to 6 and add to 5: 2 and 3.' } },
          ],
        },
        {
          name: 'Modulus (absolute value) and argument (angle) of complex numbers',
          items: [
            { label: 'Absolute value of complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/v/absolute-value-of-a-complex-number' },
            { label: 'Complex numbers with the same modulus (absolute value)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/v/complex-numbers-same-modulus' },
            { label: 'Modulus (absolute value) of complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/e/absolute_value_of_complex_numbers', question: { prompt: 'Evaluate |-7|.', answer: '7', explanation: 'Absolute value is the distance from 0, always non-negative.' } },
            { label: 'Absolute value & angle of complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/v/basic-complex-analysis' },
            { label: 'Angle of complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/e/find-the-angle-of-complex-numbers', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Complex numbers from absolute value & angle', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/e/find-complex-numbers-according-to-absolute-value-and-angle', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Complex number absolute value & angle review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-abs-angle/a/complex-number-absolute-value-and-angle-review' },
          ],
        },
        {
          name: 'Polar form of complex numbers',
          items: [
            { label: 'Polar & rectangular forms of complex numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-polar/v/polar-form-complex-number' },
            { label: 'Converting a complex number from polar to rectangular form', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-polar/v/convert-complex-polar-to-rectangular' },
            { label: 'Complex plane and polar form', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-polar/e/complex-plane-polar-form', question: { prompt: 'Practice: Complex plane and polar form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Complex number forms review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-polar/a/complex-number-forms-review' },
          ],
        },
        {
          name: 'Graphically multiplying complex numbers',
          items: [
            { label: 'Multiplying complex numbers graphically example: -3i', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul/v/multiply-complex-graphically-3i' },
            { label: 'Multiplying complex numbers graphically example: -1-i', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul/v/multiply-complex-graphically-1-i' },
            { label: 'Graphically multiply complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul/e/graphically-multiply-complex-numbers', question: { prompt: 'Practice: Graphically multiply complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Visualizing complex number multiplication', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul/a/visualizing-complex-multiplication' },
          ],
        },
        {
          name: 'Multiplying and dividing complex numbers in polar form',
          items: [
            { label: 'Multiplying complex numbers in polar form', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/v/multiply-complex-numbers-polar' },
            { label: 'Dividing complex numbers in polar form', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/v/divide-complex-polar' },
            { label: 'Multiply & divide complex numbers in polar form', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/e/multiplying_and_dividing_complex_number_polar_forms', question: { prompt: 'Practice: Multiply & divide complex numbers in polar form. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Taking and visualizing powers of a complex number', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/v/visualizing-powers-complex-number' },
            { label: 'Complex number equations: x³=1', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/v/exponential-form-to-find-complex-roots' },
            { label: 'Visualizing complex number powers', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/a/visualizing-complex-powers' },
            { label: 'Powers of complex numbers', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/e/powers_of_complex_numbers_1', question: { prompt: 'Practice: Powers of complex numbers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Complex number polar form review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:complex-mul-div-polar/a/complex-number-polar-form-review' },
          ],
        },
        {
          name: 'The fundamental theorem of algebra',
          items: [
            { label: 'The Fundamental theorem of Algebra', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:fta/v/fundamental-theorem-of-algebra-intro' },
            { label: 'Quadratics & the Fundamental Theorem of Algebra', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:fta/v/fundamental-theorem-algebra-quadratic' },
            { label: 'Number of possible real roots of a polynomial', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:fta/v/possible-real-roots' },
            { label: 'Complex numbers: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:complex/x9e81a4f98389efdf:fta/a/complex-numbers-faqs' },
          ],
        },
      ],
    },
    {
      name: 'Rational functions',
      lessons: [
        {
          name: 'Reducing rational expressions to lowest terms',
          items: [
            { label: 'Intro to rational expressions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:reducing-rational-expressions-to-lowest-terms/a/intro-to-rational-expressions' },
            { label: 'Reducing rational expressions to lowest terms', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:reducing-rational-expressions-to-lowest-terms/v/simplifying-rational-expressions-introduction' },
            { label: 'Reduce rational expressions to lowest terms: Error analysis', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:reducing-rational-expressions-to-lowest-terms/e/simplifying_rational_expressions_1', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Reduce rational expressions to lowest terms', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:reducing-rational-expressions-to-lowest-terms/e/simplifying_rational_expressions_2', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'End behavior of rational functions',
          items: [
            { label: 'End behavior of rational functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:end-behavior-of-rational-functions/v/end-behavior-of-rational-functions' },
          ],
        },
        {
          name: 'Discontinuities of rational functions',
          items: [
            { label: 'Discontinuities of rational functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:discontinuities-of-rational-functions/v/discontinuities-of-rational-functions' },
            { label: 'Rational functions: zeros, asymptotes, and undefined points', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:discontinuities-of-rational-functions/e/points-of-discontinuity-of-rational-functions', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Graphs of rational functions',
          items: [
            { label: 'Graphing rational functions according to asymptotes', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/v/finding-asymptotes-example' },
            { label: 'Graphs of rational functions: y-intercept', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/v/graphs-of-rational-functions-y-intercept' },
            { label: 'Graphs of rational functions: horizontal asymptote', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/v/graphs-of-rational-functions-horizontal-asymptote' },
            { label: 'Graphs of rational functions: vertical asymptotes', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/v/graphs-of-rational-functions-vertical-asymptotes' },
            { label: 'Graphs of rational functions: zeros', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/v/graphs-of-rational-functions-zeros' },
            { label: 'Graphs of rational functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:graphs-of-rational-functions/e/graphs-of-rational-functions', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Modeling with rational functions',
          items: [
            { label: 'Analyzing structure word problem: pet store (1 of 2)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/dogs-cats-and-bears-in-a-pet-store-visual-argument' },
            { label: 'Analyzing structure word problem: pet store (2 of 2)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/dogs-cats-and-bears-in-a-pet-store-analytic-argument' },
            { label: 'Combining mixtures example', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/combining-mixtures-example' },
            { label: 'Rational equations word problem: combined rates', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/applying-rational-equations-1' },
            { label: 'Rational equations word problem: combined rates (example 2)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/applying-rational-equations-2' },
            { label: 'Mixtures and combined rates word problems', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/e/mixtures-and-combined-rates-word-problems', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Rational equations word problem: eliminating solutions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/applying-rational-equations-3' },
            { label: 'Reasoning about unknown variables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/reasoning-through-inequality-expressions' },
            { label: 'Reasoning about unknown variables: divisibility', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/using-expressions-to-understand-relationships' },
            { label: 'Structure in rational expression', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:modeling-with-rational-functions/v/structure-in-rational-expression' },
          ],
        },
        {
          name: 'Multiplying and dividing rational expressions',
          items: [
            { label: 'Multiplying & dividing rational expressions: monomials', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:multiplying-and-dividing-rational-expressions/v/multiplying-and-dividing-rational-expressions-monomial-numerator-denominator' },
            { label: 'Multiplying rational expressions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:multiplying-and-dividing-rational-expressions/v/multiplying-rational-expressions' },
            { label: 'Dividing rational expressions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:multiplying-and-dividing-rational-expressions/v/dividing-rational-expressions' },
            { label: 'Multiply & divide rational expressions: Error analysis', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:multiplying-and-dividing-rational-expressions/e/multiplying_and_dividing_rational_expressions_1', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Multiply & divide rational expressions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:multiplying-and-dividing-rational-expressions/e/multiplying_and_dividing_rational_expressions_2', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Adding and subtracting rational expressions',
          items: [
            { label: 'Intro to adding & subtracting rational expressions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/a/intro-to-adding-subtracting-rational-expressions' },
            { label: 'Adding & subtracting rational expressions: like denominators', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/adding-and-subtracting-rational-expressions-with-like-denominators' },
            { label: 'Intro to adding rational expressions with unlike denominators', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/algebraic-expression-adding-fractions' },
            { label: 'Adding rational expression: unlike denominators', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/adding-rational-expression-w-unlike-denominators' },
            { label: 'Subtracting rational expressions: unlike denominators', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/subtracting-rational-expressions-w-unlike-denominators' },
            { label: 'Add & subtract rational expressions (basic)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/e/adding_and_subtracting_rational_expressions_2', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Adding & subtracting rational expressions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/a/adding-subtracting-rational-expressions-advanced' },
            { label: 'Least common multiple of polynomials', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/least-common-multiples-of-polynomials' },
            { label: 'Subtracting rational expressions: factored denominators', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/subtracting-rational-expressions-w-factored-denominators' },
            { label: 'Subtracting rational expressions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/v/adding-and-subtracting-rational-expressions-3' },
            { label: 'Add & subtract rational expressions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/e/adding_and_subtracting_rational_expressions_5', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Rational functions: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:rational-functions/x9e81a4f98389efdf:adding-and-subtracting-rational-expressions/a/rational-functions-faq' },
          ],
        },
      ],
    },
    {
      name: 'Conic sections',
      lessons: [
        {
          name: 'Introduction to conic sections',
          items: [
            { label: 'Intro to conic sections', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:conics-intro/v/introduction-to-conic-sections' },
          ],
        },
        {
          name: 'Center and radii of an ellipse',
          items: [
            { label: 'Intro to ellipses', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/v/conic-sections-intro-to-ellipses' },
            { label: 'Graph & features of ellipses', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/e/center-and-radii-of-an-ellipse-and-its-graph', question: { prompt: 'Practice: Graph & features of ellipses. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Center & radii of ellipses from equation', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/e/equation_of_an_ellipse', question: { prompt: 'Practice: Center & radii of ellipses from equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Ellipse standard equation from graph', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/v/ellipse-standard-equation-from-graph' },
            { label: 'Ellipse graph from standard equation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/v/ellipse-graph-from-standard-equation' },
            { label: 'Ellipse standard equation & graph', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/e/equation-of-an-ellipse-from-its-graph', question: { prompt: 'Practice: Ellipse standard equation & graph. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Ellipse features review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/a/ellipse-features-review' },
            { label: 'Ellipse equation review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-center-radii/a/ellipse-equation-review' },
          ],
        },
        {
          name: 'Foci of an ellipse',
          items: [
            { label: 'Foci of an ellipse from equation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-foci/v/foci-of-an-ellipse' },
            { label: 'Foci of an ellipse from radii', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-foci/e/find-foci-of-ellipse-from-radii', question: { prompt: 'Practice: Foci of an ellipse from radii. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Equation of an ellipse from features', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-foci/e/equation-of-ellipse-from-foci', question: { prompt: 'Practice: Equation of an ellipse from features. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Ellipse foci review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:ellipse-foci/a/ellipse-foci-review' },
          ],
        },
        {
          name: 'Introduction to hyperbolas',
          items: [
            { label: 'Intro to hyperbolas', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-intro/v/conic-sections-intro-to-hyperbolas' },
            { label: 'Vertices & direction of a hyperbola', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-intro/v/vertices-and-direction-of-a-hyperbola' },
            { label: 'Vertices & direction of a hyperbola (example 2)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-intro/v/vertices-and-direction-of-a-hyperbola-2' },
            { label: 'Graphing hyperbolas (old example)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-intro/v/conic-sections-hyperbolas-2' },
          ],
        },
        {
          name: 'Foci of a hyperbola',
          items: [
            { label: 'Foci of a hyperbola from equation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-foci/v/foci-of-a-hyperbola' },
            { label: 'Equation of a hyperbola from features', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-foci/e/equation_of_a_hyperbola', question: { prompt: 'Practice: Equation of a hyperbola from features. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Proof of the hyperbola foci formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:hyperb-foci/v/proof-hyperbola-foci' },
          ],
        },
        {
          name: 'Hyperbolas not centered at the origin',
          items: [
            { label: 'Equation of a hyperbola not centered at the origin', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:non-origin-hyperb/v/conic-sections-hyperbolas-3' },
            { label: 'Conic sections: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:conics/x9e81a4f98389efdf:non-origin-hyperb/a/conic-sections-faq' },
          ],
        },
      ],
    },
    {
      name: 'Vectors',
      lessons: [
        {
          name: 'Vectors introduction',
          items: [
            { label: 'Intro to vectors and scalars', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vectors-intro/v/introduction-to-vectors-and-scalars' },
            { label: 'Representing quantities with vectors', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vectors-intro/v/representing-quantities-with-vectors' },
            { label: 'Interpreting statements about vectors', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vectors-intro/v/interpreting-statements-about-vectors' },
            { label: 'Vectors intro', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vectors-intro/e/equivalent-vectors', question: { prompt: 'Practice: Vectors intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Vector components',
          items: [
            { label: 'Introduction to vector components', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-components/v/introduction-to-vector-components' },
            { label: 'Finding the components of a vector', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-components/v/example-finding-components-of-a-vector' },
            { label: 'Comparing the components of vectors', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-components/v/example-comparing-x-components-of-vectors' },
            { label: 'Components of vectors from endpoints', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-components/e/components_of_vectors', question: { prompt: 'Practice: Components of vectors from endpoints. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Magnitude of vectors',
          items: [
            { label: 'Vector magnitude from graph', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-mag/v/example-calcuating-magnitude-of-vector-from-graph' },
            { label: 'Vector magnitude from components', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-mag/v/finding-vector-magnitude-from-components' },
            { label: 'Vector magnitude from initial & terminal points', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-mag/v/vector-magnitude-from-initial-and-terminal-points' },
            { label: 'Magnitude of vectors', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-mag/e/magnitude-of-vectors', question: { prompt: 'Practice: Magnitude of vectors. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Scalar multiplication',
          items: [
            { label: 'Scalar multiplication: component form', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:scalar-mul/v/understanding-multiplying-vectors-by-scalars' },
            { label: 'Scalar multiplication: magnitude and direction', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:scalar-mul/v/examples-from-understanding-scalar-multiplication-exercise' },
            { label: 'Scalar multiplication', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:scalar-mul/e/scaling_vectors', question: { prompt: 'Practice: Scalar multiplication. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Vector addition and subtraction',
          items: [
            { label: 'Adding & subtracting vectors', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/adding-and-subtracting-vectors' },
            { label: 'Adding & subtracting vectors end-to-end', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/visually-adding-and-subtracting-vectors' },
            { label: 'Parallelogram rule for vector addition', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/parallelogram-rule-for-vector-addition' },
            { label: 'Add vectors', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/e/adding_vectors', question: { prompt: 'Practice: Add vectors. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Subtracting vectors end-to-end', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/subtracting-vectors-exercise-example' },
            { label: 'Subtracting vectors with parallelogram rule', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/subtracting-vectors-with-parallelogram-rule' },
            { label: 'Subtract vectors', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/e/graphically-adding-and-subtracting-vectors', question: { prompt: 'Practice: Subtract vectors. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Vector addition & magnitude', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vector-add-sub/v/mag-vec-sums' },
          ],
        },
        {
          name: 'Direction of vectors',
          items: [
            { label: 'Direction of vectors from components: 1st & 2nd quadrants', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:magnitude-direction/v/angles-of-vectors-from-components' },
            { label: 'Direction of vectors from components: 3rd & 4th quadrants', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:magnitude-direction/v/more-examples-finding-vector-angles' },
            { label: 'Direction of vectors', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:magnitude-direction/e/direction-angles', question: { prompt: 'Practice: Direction of vectors. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Vector components from magnitude and direction',
          items: [
            { label: 'Vector components from magnitude & direction', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:component-form/v/vector-components-from-magnitude-and-direction' },
            { label: 'Vector components from magnitude & direction: word problem', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:component-form/v/vector-component-in-direction' },
            { label: 'Vector components from magnitude & direction (advanced)', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:component-form/a/vector-component-form-no-direction-angle' },
            { label: 'Converting between vector components and magnitude & direction review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:component-form/a/vector-magnitude-and-direction-review' },
          ],
        },
        {
          name: 'Adding vectors in magnitude and direction form',
          items: [
            { label: 'Adding vectors in magnitude and direction form', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-add-mag-dir/v/adding-vectors-in-magnitude-and-direction-form' },
            { label: 'Add vectors: magnitude & direction', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-add-mag-dir/e/adding-vectors-in-magnitude-and-direction-form-2', question: { prompt: 'Practice: Add vectors: magnitude & direction. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Vectors word problems',
          items: [
            { label: 'Vector word problem: resultant velocity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/v/vector-word-problem-resultant-velocity' },
            { label: 'Vector word problem: hiking', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/v/adding-displacement-vectors' },
            { label: 'Vector word problem: resultant force', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/v/vector-word-problem-resultant-force' },
            { label: 'Vector word problems', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/e/vector-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Vectors: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/a/vectors-faq' },
          ],
        },
      ],
    },
    {
      name: 'Matrices',
      lessons: [
        {
          name: 'Introduction to matrices',
          items: [
            { label: 'Intro to matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:mat-intro/v/introduction-to-the-matrix' },
          ],
        },
        {
          name: 'Using matrices to represent data',
          items: [
            { label: 'Using matrices to represent data: Networks', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:model-situations-with-matrices/v/using-matrices-to-represent-data-networks' },
            { label: 'Using matrices to represent data: Payoffs', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:model-situations-with-matrices/v/using-matrices-to-represent-data-payoffs' },
            { label: 'Use matrices to represent data', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:model-situations-with-matrices/e/use-matrices-to-represent-data', question: { prompt: 'Practice: Use matrices to represent data. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying matrices by scalars',
          items: [
            { label: 'Multiplying matrices by scalars', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-scalars/v/scalar-multiplication' },
            { label: 'Multiply matrices by scalars', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-scalars/e/scalar_matrix_multiplication', question: { prompt: 'Practice: Multiply matrices by scalars. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Adding and subtracting matrices',
          items: [
            { label: 'Adding matrices (with -1 scalar also)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:adding-and-subtracting-matrices/v/matrix-addition-and-subtraction-1' },
            { label: 'Adding & subtracting matrices', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:adding-and-subtracting-matrices/a/adding-and-subtracting-matrices' },
            { label: 'Add & subtract matrices', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:adding-and-subtracting-matrices/e/matrix_addition_and_subtraction', question: { prompt: 'Practice: Add & subtract matrices. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Properties of matrix addition & scalar multiplication',
          items: [
            { label: 'Intro to zero matrices', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-addition-and-scalar-multiplication/a/intro-to-zero-matrices' },
            { label: 'Properties of matrix addition', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-addition-and-scalar-multiplication/a/properties-of-matrix-addition' },
            { label: 'Properties of matrix scalar multiplication', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-addition-and-scalar-multiplication/a/properties-of-matrix-scalar-multiplication' },
          ],
        },
        {
          name: 'Using matrices to manipulate data',
          items: [
            { label: 'Using matrices to manipulate data: Pet store', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-manipulate-data/v/using-matrices-to-manipulate-data-pet-store' },
            { label: 'Using matrices to manipulate data: Game show', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-manipulate-data/v/using-matrices-to-manipulate-data-game-show' },
            { label: 'Use matrices to manipulate data', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-manipulate-data/e/use-matrices-to-manipulate-data', question: { prompt: 'Practice: Use matrices to manipulate data. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Matrices as transformations of the plane',
          items: [
            { label: 'Matrices as transformations of the plane', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/matrices-as-transformations-of-the-plane' },
            { label: 'Working with matrices as transformations of the plane', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/working-with-matrices-as-transformations-of-the-plane' },
            { label: 'Intro to determinant notation and computation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/intro-to-determinants' },
            { label: 'Interpreting determinants in terms of area', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/interpreting-determinants-in-terms-of-area' },
            { label: 'Finding area of figure after transformation using determinant', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/finding-area-of-figure-after-transformation-using-determinant' },
            { label: 'Understand matrices as transformations of the plane', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/e/transformation-matrices-1', question: { prompt: 'Reflect (3,4) across the x-axis. New point?', answer: '(3,-4)', explanation: 'Reflection across x-axis negates y.' } },
            { label: 'Proof: Matrix determinant gives area of image of unit square under mapping', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/v/proof-matrix-determinant-gives-area-of-image-of-unit-square-under-mapping' },
            { label: 'Matrices as transformations', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/a/matrices-as-transformations' },
            { label: 'Matrix from visual representation of transformation', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrices-as-transformations/a/practice-associating-matrices-with-transformations' },
          ],
        },
        {
          name: 'Using matrices to transform the plane',
          items: [
            { label: 'Using matrices to transform the plane: Mapping a vector', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-transform-the-plane/v/using-matrices-to-transform-the-plane-mapping-a-vector' },
            { label: 'Using matrices to transform the plane: Composing matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-transform-the-plane/v/using-matrices-to-transform-the-plane-composing-matrices' },
            { label: 'Use matrices to transform the plane', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:using-matrices-to-transform-the-plane/e/use-matrices-to-transform-the-plane', question: { prompt: 'Practice: Use matrices to transform the plane. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Transforming 3D and 4D vectors with matrices',
          items: [
            { label: 'Using matrices to transform a 4D vector', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:transforming-3d-and-4d-vectors-with-matrices/v/using-matrices-to-transform-a-4d-vector' },
            { label: 'Composing 3x3 matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:transforming-3d-and-4d-vectors-with-matrices/v/composing-3x3-matrices' },
            { label: 'Use matrices to transform 3D and 4D vectors', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:transforming-3d-and-4d-vectors-with-matrices/e/multiplying_a_matrix_by_a_vector', question: { prompt: 'Practice: Use matrices to transform 3D and 4D vectors. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Multiplying matrices by matrices',
          items: [
            { label: 'Intro to matrix multiplication', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/v/matrix-multiplication-intro' },
            { label: 'Multiplying matrices', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/a/multiplying-matrices' },
            { label: 'Multiply matrices', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/e/multiplying_a_matrix_by_a_matrix', question: { prompt: 'Practice: Multiply matrices. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Properties of matrix multiplication',
          items: [
            { label: 'Defined matrix operations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/defined-and-undefined-matrix-operations' },
            { label: 'Matrix multiplication dimensions', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/a/matrix-multiplication-dimensions' },
            { label: 'Intro to identity matrix', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/identity-matrix' },
            { label: 'Intro to identity matrices', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/a/intro-to-identity-matrices' },
            { label: 'Dimensions of identity matrix', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/identity-matrix-dimensions' },
            { label: 'Is matrix multiplication commutative?', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/commutative-property-matrix-multiplication' },
            { label: 'Associative property of matrix multiplication', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/associative-property-matrix-multiplication' },
            { label: 'Zero matrix & matrix multiplication', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/zero-matrix' },
            { label: 'Properties of matrix multiplication', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/a/properties-of-matrix-multiplication' },
            { label: 'Using properties of matrix operations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/matrix-expressions' },
            { label: 'Using identity & zero matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:properties-of-matrix-multiplication/v/identity-zero-matrix-equation' },
          ],
        },
        {
          name: 'Representing systems of equations with matrices',
          items: [
            { label: 'Representing systems of equations with matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:representing-systems-with-matrices/v/representing-systems-of-equations-with-matrices' },
            { label: 'Representing systems of any number of equations with matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:representing-systems-with-matrices/v/representing-systems-of-any-number-of-equations-with-matrices' },
            { label: 'Use matrices to represent systems of equations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:representing-systems-with-matrices/e/writing-systems-of-equations-as-matrix-equations', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
          ],
        },
        {
          name: 'Introduction to matrix inverses',
          items: [
            { label: 'Inverse matrix introduction', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:intro-to-matrix-inverses/v/inverse-matrix-introduction' },
            { label: 'Invertible matrices and determinants', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:intro-to-matrix-inverses/v/invertible-matrices-and-determinants' },
            { label: 'Invertible matrices and transformations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:intro-to-matrix-inverses/v/invertible-matrices-and-transformations' },
            { label: 'Inverse matrices and matrix equations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:intro-to-matrix-inverses/v/inverse-matrices-and-matrix-equations' },
            { label: 'Determine invertible matrices', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:intro-to-matrix-inverses/e/determine-invertibile-2x2-matrices', question: { prompt: 'Practice: Determine invertible matrices. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Finding inverses of 2x2 matrices',
          items: [
            { label: 'Finding inverses of 2x2 matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:practice-finding-inverses-of-2x2-matrices/v/inverse-of-a-2x2-matrix' },
            { label: 'Find the inverse of a 2x2 matrix', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:practice-finding-inverses-of-2x2-matrices/e/matrix_inverse_2x2', question: { prompt: 'Practice: Find the inverse of a 2x2 matrix. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Solving linear systems with matrices',
          items: [
            { label: 'Solving linear systems with matrices', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:solving-equations-with-inverse-matrices/v/solving-matrix-equation' },
            { label: 'Use matrices to solve systems of equations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:solving-equations-with-inverse-matrices/e/use-matrices-to-solve-systems-of-equations', question: { prompt: 'Solve: x + y = 5, x - y = 1.', answer: 'x=3, y=2', explanation: 'Adding: 2x=6, x=3, then y=5-3=2.' } },
            { label: 'Matrices: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:solving-equations-with-inverse-matrices/a/matrices-faq' },
          ],
        },
      ],
    },
    {
      name: 'Probability and combinatorics',
      lessons: [
        {
          name: 'Venn diagrams and the addition rule',
          items: [
            { label: 'Probability with Venn diagrams', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:addition-rule-prob-precalc/v/probability-with-playing-cards-and-venn-diagrams' },
            { label: 'Addition rule for probability', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:addition-rule-prob-precalc/v/addition-rule-for-probability' },
            { label: 'Addition rule for probability (basic)', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:addition-rule-prob-precalc/a/addition-rule-for-probability-basic' },
            { label: 'Two-way tables, Venn diagrams, and probability', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:addition-rule-prob-precalc/e/two-way-tables-venn-diagrams-probability', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
          ],
        },
        {
          name: 'Multiplication rule for probabilities',
          items: [
            { label: 'Compound probability of independent events', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/compound-probability-of-independent-events' },
            { label: 'Independent events example: test taking', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/independent-events-2' },
            { label: 'General multiplication rule example: independent events', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/general-multiplication-example-independent' },
            { label: 'Dependent probability introduction', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/introduction-to-dependent-probability' },
            { label: 'General multiplication rule example: dependent events', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/general-multiplication-rule-example-dependent' },
            { label: 'Probability with general multiplication rule', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/e/probability-general-multiplication', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
            { label: 'Interpreting general multiplication rule', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/v/interpreting-general-multiplication-rule' },
            { label: 'Interpret probabilities of compound events', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:compound-probability-of-ind-events-using-mult-rule/e/interpret-probabilities-compound-events', question: { prompt: 'Practice: Interpret probabilities of compound events. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Permutations',
          items: [
            { label: 'Factorial and counting seat arrangements', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/factorial-and-counting-seat-arrangements' },
            { label: 'Permutation formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/permutation-formula' },
            { label: 'Possible three letter words', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/possible-three-letter-words' },
            { label: 'Zero factorial or 0!', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/zero-factorial-or-0' },
            { label: 'Ways to arrange colors', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/permutations-and-combinations-1' },
            { label: 'Ways to pick officers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/v/permutations-and-combinations-2' },
            { label: 'Permutations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinatorics-precalc/e/permutations_1', question: { prompt: 'Practice: Permutations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Combinations',
          items: [
            { label: 'Intro to combinations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinations/v/introduction-to-combinations' },
            { label: 'Combination formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinations/v/combination-formula' },
            { label: 'Handshaking combinations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinations/v/handshaking-combinations' },
            { label: 'Combination example: 9 card hands', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinations/v/permutations-and-combinations-3' },
            { label: 'Combinations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:combinations/e/combinations_1', question: { prompt: 'Practice: Combinations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Probability using combinatorics',
          items: [
            { label: 'Probability using combinations', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/probability-using-combinations' },
            { label: 'Example: Lottery probability', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/permutations-and-combinations-4' },
            { label: 'Example: Different ways to pick officers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/probability-of-dependent-events' },
            { label: 'Probability with permutations & combinations example: taste testing', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/probability-permutations-combinations-taste-testing' },
            { label: 'Probability with combinations example: choosing groups', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/probability-combinations-choosing-groups' },
            { label: 'Probability with combinations example: choosing cards', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/probability-combinations-example-choosing-cards' },
            { label: 'Probability with permutations and combinations', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/e/probability_with_perm_comb', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
            { label: 'Mega millions jackpot probability', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:prob-combinatorics-precalc/v/mega-millions-jackpot-probability' },
          ],
        },
        {
          name: 'Probability distributions introduction',
          items: [
            { label: 'Constructing a probability distribution for random variable', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:probability-distributions-introduction/v/discrete-probability-distribution' },
            { label: 'Valid discrete probability distribution examples', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:probability-distributions-introduction/v/valid-discrete-probability-distribution-examples' },
            { label: 'Graph probability distributions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:probability-distributions-introduction/e/graph-probability-distributions', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
            { label: 'Probability with discrete random variable example', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:probability-distributions-introduction/v/example-analyzing-discrete-probability-distribution' },
            { label: 'Probability with discrete random variables', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:probability-distributions-introduction/e/probability-discrete-random-variables', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
          ],
        },
        {
          name: 'Theoretical & empirical probability distributions',
          items: [
            { label: 'Theoretical probability distribution example: tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:theoretical-empirical-probability-distributions/v/theoretical-probability-distribution-example-tables' },
            { label: 'Theoretical probability distribution example: multiplication', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:theoretical-empirical-probability-distributions/v/theoretical-probability-distribution-example-multiplication' },
            { label: 'Develop probability distributions: Theoretical probabilities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:theoretical-empirical-probability-distributions/e/probability-distributions-theoretical', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
            { label: 'Probability distributions from empirical data', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:theoretical-empirical-probability-distributions/v/probability-distributions-empirical-data' },
            { label: 'Develop probability distributions: Empirical probabilities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:theoretical-empirical-probability-distributions/e/probability-distributions-empirical', question: { prompt: 'What is the probability of rolling a 4 on a fair die?', answer: '1/6', explanation: 'One favorable outcome out of six equally likely.' } },
          ],
        },
        {
          name: 'Decisions with probability',
          items: [
            { label: 'Using probabilities to make fair decisions example', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:decisions-with-probability/v/probabilities-fair-decisions-example' },
            { label: 'Use probabilities to make fair decisions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:decisions-with-probability/e/use-probabilities-fair-decisions', question: { prompt: 'Practice: Use probabilities to make fair decisions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Expected value',
          items: [
            { label: 'Mean (expected value) of a discrete random variable', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/v/expected-value-of-a-discrete-random-variable' },
            { label: 'Interpreting expected value', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/v/interpreting-expected-value' },
            { label: 'Interpret expected value', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/e/interpret-expected-value', question: { prompt: 'Practice: Interpret expected value. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Expected payoff example: lottery ticket', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/v/expected-payoff-example-lottery' },
            { label: 'Expected payoff example: protection plan', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/v/expected-payoff-example-protection-plan' },
            { label: 'Find expected payoffs', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/e/find-expected-payoffs', question: { prompt: 'Practice: Find expected payoffs. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Probability and combinatorics: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:prob-comb/x9e81a4f98389efdf:expected-value/a/probability-combinatorics-faq' },
          ],
        },
      ],
    },
    {
      name: 'Series',
      lessons: [
        {
          name: 'Geometric series',
          items: [
            { label: 'Geometric series introduction', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/geo-series-intro' },
            { label: 'Geometric series intro', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/series-as-sum-of-sequence' },
            { label: 'Finite geometric series formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/deriving-formula-for-sum-of-finite-geometric-series' },
            { label: 'Worked examples: finite geometric series', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/three-examples-of-evaluating-finite-geometric-series' },
            { label: 'Geometric series formula', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/e/geometric-series-formula', question: { prompt: 'Practice: Geometric series formula. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Geometric series word problems: swing', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/geo-series-word-problem-swing' },
            { label: 'Geometric series word problems: hike', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/v/geo-series-word-problem-hike' },
            { label: 'Finite geometric series word problems', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series/e/geometric-series', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Geometric series (with summation notation)',
          items: [
            { label: 'Summation notation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/v/sigma-notation-sum' },
            { label: 'Summation notation intro', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/e/evaluating-basic-sigma-notation', question: { prompt: 'Practice: Summation notation intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Geometric series with sigma notation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/v/geometric-series-introduction' },
            { label: 'Worked example: finite geometric series (sigma notation)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/v/example-finding-sum-of-finite-geometric-series' },
            { label: 'Finite geometric series', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/e/geometric-series--1', question: { prompt: 'Practice: Finite geometric series. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Finite geometric series word problem: social media', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/v/geometric-series-word-problem' },
            { label: 'Finite geometric series word problem: mortgage', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:geo-series-notation/v/geometric-series-sum-to-figure-out-mortgage-payments' },
          ],
        },
        {
          name: 'The binomial theorem',
          items: [
            { label: 'Intro to the Binomial Theorem', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/binomial-theorem' },
            { label: 'Pascal\'s triangle and binomial expansion', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/pascals-triangle-binomial-theorem' },
            { label: 'Expanding binomials', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/coefficient-in-binomial-expansion' },
            { label: 'Expand binomials', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/e/binomial-theorem', question: { prompt: 'Practice: Expand binomials. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Expanding binomials w/o Pascal\'s triangle', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/binomial-expansion-algorithm' },
            { label: 'Binomial expansion & combinatorics', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/binomial-theorem-and-combinatorics-intuition' },
            { label: 'Pascal\'s triangle & combinatorics', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:binomial/v/binomial-theorem-intuition' },
          ],
        },
        {
          name: 'Arithmetic series',
          items: [
            { label: 'Arithmetic series intro', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/sum-of-arithmetic-sequence-arithmetic-series' },
            { label: 'Arithmetic series formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/formula-for-arithmetic-series' },
            { label: 'Arithmetic series', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/a/evaluating-arithmetic-series-guided-practice' },
            { label: 'Worked example: arithmetic series (sigma notation)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/evaluating-finite-arithmetic-series' },
            { label: 'Worked example: arithmetic series (sum expression)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/evaluating-arithmetic-sum-example' },
            { label: 'Worked example: arithmetic series (recursive formula)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/finding-sum-from-recursive-definition-of-sequence' },
            { label: 'Arithmetic series worksheet', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/a/evaluating-arithmetic-series-worksheet' },
            { label: 'Proof of finite arithmetic series formula', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/v/alternate-proof-to-induction-for-integer-sum' },
            { label: 'Series: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:series/x9e81a4f98389efdf:arith-series/a/series-faq' },
          ],
        },
      ],
    },
    {
      name: 'Limits and continuity',
      lessons: [
        {
          name: 'Defining limits and using limit notation',
          items: [
            { label: 'Limits intro', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-limits-and-using-limit-notation/v/introduction-to-limits-hd' },
          ],
        },
        {
          name: 'Estimating limit values from graphs',
          items: [
            { label: 'Estimating limit values from graphs', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-graphs/v/limits-from-graphs' },
            { label: 'Unbounded limits', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-graphs/v/unbounded-limits' },
            { label: 'One-sided limits from graphs', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-graphs/v/one-sided-limits-from-graphs' },
            { label: 'One-sided limits from graphs: asymptote', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-graphs/v/one-sided-limits-from-graphs-asymptote' },
            { label: 'Connecting limits and graphical behavior', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-graphs/v/connecting-limits-and-graphical-behavior' },
          ],
        },
        {
          name: 'Estimating limit values from tables',
          items: [
            { label: 'Approximating limits using tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-tables/v/approximating-limit-from-table' },
            { label: 'Estimating limits from tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-tables/v/estimating-limit-from-table' },
            { label: 'Using tables to approximate limit values', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-tables/a/review-approximating-limits-from-tables' },
            { label: 'Creating tables for approximating limits', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-tables/e/creating-tables-to-approximate-limits', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'One-sided limits from tables', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:estimating-limit-values-from-tables/v/one-sided-limits-from-tables' },
          ],
        },
        {
          name: 'Determining limits using algebraic properties of limits: limit properties',
          items: [
            { label: 'Limit properties', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limit-properties' },
            { label: 'Limits of combined functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limits-of-combined-functions' },
            { label: 'Limits of combined functions: piecewise functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limits-of-combined-functions-piecewise' },
            { label: 'Limits of combined functions: sums and differences', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/e/limits-of-combined-functions-sums', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits of combined functions: products and quotients', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/e/limits-of-combined-functions-graphs', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Theorem for limits of composite functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limits-of-composite-functions' },
            { label: 'Theorem for limits of composite functions: when conditions aren\'t met', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/theorem-for-limits-of-composite-functions-when-conditions-aren-t-met' },
            { label: 'Limits of composite functions: internal limit doesn\'t exist', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limits-of-composite-functions-internal-limit-doesn-t-exist' },
            { label: 'Limits of composite functions: external limit doesn\'t exist', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/v/limits-of-composite-functions-external-limit-doesn-t-exist' },
            { label: 'Limits of composite functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-limit-properties/e/limits-of-composite-functions--graphs', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Determining limits using algebraic properties of limits: direct substitution',
          items: [
            { label: 'Limits by direct substitution', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/v/limit-by-substitution' },
            { label: 'Undefined limits by direct substitution', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/v/undefined-limit-by-substitution' },
            { label: 'Direct substitution with limits that don\'t exist', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/e/identify-undefined-limits-by-direct-substitution', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits of trigonometric functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/v/limits-of-trigonometric-functions' },
            { label: 'Limits of piecewise functions', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/v/limits-of-piecewise-functions' },
            { label: 'Limits of piecewise functions: absolute value', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-properties-of-limits-direct-substitution/v/limit-at-a-point-of-discontinuity' },
          ],
        },
        {
          name: 'Determining limits using algebraic manipulation',
          items: [
            { label: 'Limits by factoring', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/v/limit-example-1' },
            { label: 'Limits by rationalizing', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/v/limits-by-rationalizing' },
            { label: 'Limits using conjugates', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/e/limits_2', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Trig limit using Pythagorean identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/v/trig-limit-using-pythagorean-identity' },
            { label: 'Trig limit using double angle identity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/v/trig-limit-using-double-angle-identity' },
            { label: 'Limits using trig identities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-algebraic-manipulation/e/find-limits-using-trig-identities', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Selecting procedures for determining limits',
          items: [
            { label: 'Strategy in finding limits', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:selecting-procedures-for-determining-limits/v/flow-chart-of-limit-strategies' },
            { label: 'Conclusions from direct substitution (finding limits)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:selecting-procedures-for-determining-limits/e/conditions-for-using-direct-substitution', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Next steps after indeterminate form (finding limits)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:selecting-procedures-for-determining-limits/e/selecting-procedures-for-calculating-limits-2', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Determining limits using the squeeze theorem',
          items: [
            { label: 'Squeeze theorem intro', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-the-squeeze-theorem/v/squeeze-sandwich-theorem' },
            { label: 'Squeeze theorem', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-the-squeeze-theorem/e/squeeze-theorem', question: { prompt: 'Practice: Squeeze theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Limit of sin(x)/x as x approaches 0', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-the-squeeze-theorem/v/sinx-over-x-as-x-approaches-0' },
            { label: 'Limit of (1-cos(x))/x as x approaches 0', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:determining-limits-using-the-squeeze-theorem/v/1-cosx-over-x-as-x-approaches-0' },
          ],
        },
        {
          name: 'Exploring types of discontinuities',
          items: [
            { label: 'Types of discontinuities', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:exploring-types-of-discontinuities/v/types-of-discontinuities' },
            { label: 'Classify discontinuities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:exploring-types-of-discontinuities/e/analyzing-discontinuities-graphical', question: { prompt: 'Practice: Classify discontinuities. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Defining continuity at a point',
          items: [
            { label: 'Continuity at a point', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/v/continuity-at-a-point' },
            { label: 'Worked example: Continuity at a point (graphical)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/v/continuity-at-a-point-graphically' },
            { label: 'Continuity at a point (graphical)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/e/analyze-continuity-at-a-point-graphically', question: { prompt: 'Practice: Continuity at a point (graphical). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: point where a function is continuous', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/v/limit-of-piecewise-function-that-is-defined' },
            { label: 'Worked example: point where a function isn\'t continuous', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/v/limit-of-piecewise-function-that-is-undefined' },
            { label: 'Continuity at a point (algebraic)', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:defining-continuity-at-a-point/e/continuity-at-a-point-algebraic', question: { prompt: 'Practice: Continuity at a point (algebraic). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Confirming continuity over an interval',
          items: [
            { label: 'Continuity over an interval', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:confirming-continuity-over-an-interval/v/continuity-over-an-interval' },
            { label: 'Functions continuous on all real numbers', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:confirming-continuity-over-an-interval/v/functions-continuous-on-all-numbers' },
            { label: 'Functions continuous at specific x-values', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:confirming-continuity-over-an-interval/v/functions-continuous-on-specific-numbers' },
            { label: 'Continuity and common functions', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:confirming-continuity-over-an-interval/e/continuous-functions', question: { prompt: 'Practice: Continuity and common functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Removing discontinuities',
          items: [
            { label: 'Removing discontinuities (factoring)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:removing-discontinuities/v/defining-a-function-at-a-point-to-make-it-continuous' },
            { label: 'Removing discontinuities (rationalization)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:removing-discontinuities/v/fancy-algebra-to-find-a-limit-and-make-a-function-continuous' },
            { label: 'Removable discontinuities', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:removing-discontinuities/e/continuity', question: { prompt: 'Practice: Removable discontinuities. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Connecting infinite limits and vertical asymptotes',
          items: [
            { label: 'Introduction to infinite limits', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/v/introduction-to-infinite-limits' },
            { label: 'Infinite limits and asymptotes', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/v/infinite-limits-and-asymptotes' },
            { label: 'Infinite limits: graphical', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/e/unbounded-limits-graphical', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Analyzing unbounded limits: rational function', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/v/unbounded-limits-algebraic-1' },
            { label: 'Analyzing unbounded limits: mixed function', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/v/unbounded-limits-algebraic-2' },
            { label: 'Infinite limits: algebraic', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-infinite-limits-and-vertical-asymptotes/e/limits-at-infinity-where-f-x--is-unbounded', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Connecting limits at infinity and horizontal asymptotes',
          items: [
            { label: 'Introduction to limits at infinity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/introduction-to-limits-at-infinity' },
            { label: 'Functions with same limit at infinity', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/functions-with-same-limit-at-inifinity' },
            { label: 'Limits at infinity: graphical', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/e/limits-at-infinity-graphical', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits at infinity of quotients (Part 1)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/limits-at-positive-and-negative-infinity' },
            { label: 'Limits at infinity of quotients (Part 2)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/more-limits-at-infinity' },
            { label: 'Limits at infinity of quotients', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/e/limits-at-infinity-where-x-is-unbounded', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits at infinity of quotients with square roots (odd power)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/limits-with-two-horizontal-asymptotes' },
            { label: 'Limits at infinity of quotients with square roots (even power)', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/v/limit-at-infinity-of-rational-expression-with-radical-even' },
            { label: 'Limits at infinity of quotients with square roots', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:connecting-limits-at-infinity-and-horizontal-asymptotes/e/limits-at-infinity-of-rational-functions-radicals', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
          ],
        },
        {
          name: 'Working with the intermediate value theorem',
          items: [
            { label: 'Intermediate value theorem', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/v/intermediate-value-theorem' },
            { label: 'Worked example: using the intermediate value theorem', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/v/intermediate-value-theorem-example' },
            { label: 'Using the intermediate value theorem', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/e/intermediate-value-theorem', question: { prompt: 'Practice: Using the intermediate value theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Justification with the intermediate value theorem: table', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/v/justification-with-the-intermediate-value-theorem-table' },
            { label: 'Justification with the intermediate value theorem: equation', type: 'video', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/v/justification-with-the-intermediate-value-theorem-equation' },
            { label: 'Justification with the intermediate value theorem', type: 'exercise', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/e/conditions-for-ivt-and-evt-table', question: { prompt: 'Practice: Justification with the intermediate value theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intermediate value theorem review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/a/intermediate-value-theorem-review' },
            { label: 'Limits and continuity: FAQ', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:limits-and-continuity/x9e81a4f98389efdf:working-with-the-intermediate-value-theorem/a/limits-continuity-faq' },
          ],
        },
      ],
    },
  ],
};
