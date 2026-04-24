import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '12+',
  label: 'AP Calculus AB',
  sourceUrl: 'https://www.khanacademy.org/math/ap-calculus-ab',
  units: [
    {
      name: 'Limits and continuity',
      lessons: [
        {
          name: 'About the course',
          items: [
            { label: 'Khan Academy in the classroom', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ap-ab-about/v/khan-academy-in-the-classroom-bill-scott' },
            { label: 'Sal interviews the AP Calculus Lead at College Board', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ap-ab-about/v/sal-interviews-the-ap-calculus-lead-at-college-board' },
            { label: 'What to know before taking calculus', type: 'article', href: '/math/ap-calculus-ab/ab-limits-new/ap-ab-about/a/ap-calc-prerequisites' },
          ],
        },
        {
          name: 'Defining limits and using limit notation',
          items: [
            { label: 'Limits intro', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-2/v/introduction-to-limits-hd' },
          ],
        },
        {
          name: 'Estimating limit values from graphs',
          items: [
            { label: 'Estimating limit values from graphs', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-3/v/limits-from-graphs' },
            { label: 'Unbounded limits', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-3/v/unbounded-limits' },
            { label: 'One-sided limits from graphs', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-3/v/one-sided-limits-from-graphs' },
            { label: 'One-sided limits from graphs: asymptote', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-3/v/one-sided-limits-from-graphs-asymptote' },
            { label: 'Connecting limits and graphical behavior', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-3/v/connecting-limits-and-graphical-behavior' },
          ],
        },
        {
          name: 'Estimating limit values from tables',
          items: [
            { label: 'Approximating limits using tables', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-4/v/approximating-limit-from-table' },
            { label: 'Estimating limits from tables', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-4/v/estimating-limit-from-table' },
            { label: 'Using tables to approximate limit values', type: 'article', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-4/a/review-approximating-limits-from-tables' },
            { label: 'Creating tables for approximating limits', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-4/e/creating-tables-to-approximate-limits', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'One-sided limits from tables', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-4/v/one-sided-limits-from-tables' },
          ],
        },
        {
          name: 'Determining limits using algebraic properties of limits: limit properties',
          items: [
            { label: 'Limit properties', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limit-properties' },
            { label: 'Limits of combined functions', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limits-of-combined-functions' },
            { label: 'Limits of combined functions: piecewise functions', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limits-of-combined-functions-piecewise' },
            { label: 'Limits of combined functions: sums and differences', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/e/limits-of-combined-functions-sums', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits of combined functions: products and quotients', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/e/limits-of-combined-functions-graphs', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Theorem for limits of composite functions', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limits-of-composite-functions' },
            { label: 'Theorem for limits of composite functions: when conditions aren\'t met', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/theorem-for-limits-of-composite-functions-when-conditions-aren-t-met' },
            { label: 'Limits of composite functions: internal limit doesn\'t exist', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limits-of-composite-functions-internal-limit-doesn-t-exist' },
            { label: 'Limits of composite functions: external limit doesn\'t exist', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/v/limits-of-composite-functions-external-limit-doesn-t-exist' },
            { label: 'Limits of composite functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5a/e/limits-of-composite-functions--graphs', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Determining limits using algebraic properties of limits: direct substitution',
          items: [
            { label: 'Limits by direct substitution', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/v/limit-by-substitution' },
            { label: 'Undefined limits by direct substitution', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/v/undefined-limit-by-substitution' },
            { label: 'Direct substitution with limits that don\'t exist', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/e/identify-undefined-limits-by-direct-substitution', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits of trigonometric functions', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/v/limits-of-trigonometric-functions' },
            { label: 'Limits of piecewise functions', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/v/limits-of-piecewise-functions' },
            { label: 'Limits of piecewise functions: absolute value', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-5b/v/limit-at-a-point-of-discontinuity' },
          ],
        },
        {
          name: 'Determining limits using algebraic manipulation',
          items: [
            { label: 'Limits by factoring', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/v/limit-example-1' },
            { label: 'Limits by rationalizing', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/v/limits-by-rationalizing' },
            { label: 'Limits using conjugates', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/e/limits_2', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Trig limit using Pythagorean identity', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/v/trig-limit-using-pythagorean-identity' },
            { label: 'Trig limit using double angle identity', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/v/trig-limit-using-double-angle-identity' },
            { label: 'Limits using trig identities', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-6/e/find-limits-using-trig-identities', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Selecting procedures for determining limits',
          items: [
            { label: 'Strategy in finding limits', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-7/v/flow-chart-of-limit-strategies' },
            { label: 'Conclusions from direct substitution (finding limits)', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-7/e/conditions-for-using-direct-substitution', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Next steps after indeterminate form (finding limits)', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-7/e/selecting-procedures-for-calculating-limits-2', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Determining limits using the squeeze theorem',
          items: [
            { label: 'Squeeze theorem intro', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-8/v/squeeze-sandwich-theorem' },
            { label: 'Squeeze theorem', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-8/e/squeeze-theorem', question: { prompt: 'Practice: Squeeze theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Limit of sin(x)/x as x approaches 0', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-8/v/sinx-over-x-as-x-approaches-0' },
            { label: 'Limit of (1-cos(x))/x as x approaches 0', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-8/v/1-cosx-over-x-as-x-approaches-0' },
          ],
        },
        {
          name: 'Exploring types of discontinuities',
          items: [
            { label: 'Types of discontinuities', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-10/v/types-of-discontinuities' },
            { label: 'Classify discontinuities', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-10/e/analyzing-discontinuities-graphical', question: { prompt: 'Practice: Classify discontinuities. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Defining continuity at a point',
          items: [
            { label: 'Continuity at a point', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/v/continuity-at-a-point' },
            { label: 'Worked example: Continuity at a point (graphical)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/v/continuity-at-a-point-graphically' },
            { label: 'Continuity at a point (graphical)', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/e/analyze-continuity-at-a-point-graphically', question: { prompt: 'Practice: Continuity at a point (graphical). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: point where a function is continuous', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/v/limit-of-piecewise-function-that-is-defined' },
            { label: 'Worked example: point where a function isn\'t continuous', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/v/limit-of-piecewise-function-that-is-undefined' },
            { label: 'Continuity at a point (algebraic)', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-11/e/continuity-at-a-point-algebraic', question: { prompt: 'Practice: Continuity at a point (algebraic). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Confirming continuity over an interval',
          items: [
            { label: 'Continuity over an interval', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-12/v/continuity-over-an-interval' },
            { label: 'Functions continuous on all real numbers', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-12/v/functions-continuous-on-all-numbers' },
            { label: 'Functions continuous at specific x-values', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-12/v/functions-continuous-on-specific-numbers' },
            { label: 'Continuity and common functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-12/e/continuous-functions', question: { prompt: 'Practice: Continuity and common functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Removing discontinuities',
          items: [
            { label: 'Removing discontinuities (factoring)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-13/v/defining-a-function-at-a-point-to-make-it-continuous' },
            { label: 'Removing discontinuities (rationalization)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-13/v/fancy-algebra-to-find-a-limit-and-make-a-function-continuous' },
            { label: 'Removable discontinuities', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-13/e/continuity', question: { prompt: 'Practice: Removable discontinuities. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Connecting infinite limits and vertical asymptotes',
          items: [
            { label: 'Introduction to infinite limits', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/v/introduction-to-infinite-limits' },
            { label: 'Infinite limits and asymptotes', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/v/infinite-limits-and-asymptotes' },
            { label: 'Infinite limits: graphical', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/e/unbounded-limits-graphical', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Analyzing unbounded limits: rational function', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/v/unbounded-limits-algebraic-1' },
            { label: 'Analyzing unbounded limits: mixed function', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/v/unbounded-limits-algebraic-2' },
            { label: 'Infinite limits: algebraic', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-14/e/limits-at-infinity-where-f-x--is-unbounded', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
          ],
        },
        {
          name: 'Connecting limits at infinity and horizontal asymptotes',
          items: [
            { label: 'Introduction to limits at infinity', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/introduction-to-limits-at-infinity' },
            { label: 'Functions with same limit at infinity', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/functions-with-same-limit-at-inifinity' },
            { label: 'Limits at infinity: graphical', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/e/limits-at-infinity-graphical', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits at infinity of quotients (Part 1)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/limits-at-positive-and-negative-infinity' },
            { label: 'Limits at infinity of quotients (Part 2)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/more-limits-at-infinity' },
            { label: 'Limits at infinity of quotients', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/e/limits-at-infinity-where-x-is-unbounded', question: { prompt: 'Find lim_{x→3} (x+2).', answer: '5', explanation: 'Direct substitution: 3+2=5.' } },
            { label: 'Limits at infinity of quotients with square roots (odd power)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/limits-with-two-horizontal-asymptotes' },
            { label: 'Limits at infinity of quotients with square roots (even power)', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/v/limit-at-infinity-of-rational-expression-with-radical-even' },
            { label: 'Limits at infinity of quotients with square roots', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-15/e/limits-at-infinity-of-rational-functions-radicals', question: { prompt: 'Simplify √72.', answer: '6√2', explanation: '72 = 36×2, so √72 = 6√2.' } },
          ],
        },
        {
          name: 'Working with the intermediate value theorem',
          items: [
            { label: 'Intermediate value theorem', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/v/intermediate-value-theorem' },
            { label: 'Worked example: using the intermediate value theorem', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/v/intermediate-value-theorem-example' },
            { label: 'Using the intermediate value theorem', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/e/intermediate-value-theorem', question: { prompt: 'Practice: Using the intermediate value theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Justification with the intermediate value theorem: table', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/v/justification-with-the-intermediate-value-theorem-table' },
            { label: 'Justification with the intermediate value theorem: equation', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/v/justification-with-the-intermediate-value-theorem-equation' },
            { label: 'Justification with the intermediate value theorem', type: 'exercise', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/e/conditions-for-ivt-and-evt-table', question: { prompt: 'Practice: Justification with the intermediate value theorem. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intermediate value theorem review', type: 'article', href: '/math/ap-calculus-ab/ab-limits-new/ab-1-16/a/intermediate-value-theorem-review' },
          ],
        },
        {
          name: 'Optional videos',
          items: [
            { label: 'Formal definition of limits Part 1: intuition review', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-limits-optional/v/limit-intuition-review' },
            { label: 'Formal definition of limits Part 2: building the idea', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-limits-optional/v/building-the-idea-of-epsilon-delta-definition' },
            { label: 'Formal definition of limits Part 3: the definition', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-limits-optional/v/epsilon-delta-definition-of-limits' },
            { label: 'Formal definition of limits Part 4: using the definition', type: 'video', href: '/math/ap-calculus-ab/ab-limits-new/ab-limits-optional/v/proving-a-limit-using-epsilon-delta-definition' },
          ],
        },
      ],
    },
    {
      name: 'Differentiation: definition and basic derivative rules',
      lessons: [
        {
          name: 'Defining average and instantaneous rates of change at a point',
          items: [
            { label: 'Newton, Leibniz, and Usain Bolt', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/newton-leibniz-and-usain-bolt' },
            { label: 'Derivative as a concept', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/derivative-as-a-concept' },
            { label: 'Secant lines & average rate of change', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/secant-lines-and-average-rate-of-change' },
            { label: 'Derivative notation review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/a/derivative-notation-review' },
            { label: 'Derivative as slope of curve', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/derivative-as-slope-of-curve' },
            { label: 'The derivative & tangent line equations', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/derivative-as-slope-of-tangent-line' },
          ],
        },
        {
          name: 'Defining the derivative of a function and using derivative notation',
          items: [
            { label: 'Formal definition of the derivative as a limit', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/calculus-derivatives-1-new-hd-version' },
            { label: 'Formal and alternate form of the derivative', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/alternate-form-of-the-derivative' },
            { label: 'Worked example: Derivative as a limit', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/formal-and-alternate-form-of-the-derivative-for-ln-x' },
            { label: 'Worked example: Derivative from limit expression', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/formal-and-alternate-form-of-the-derivative-example-1' },
            { label: 'Derivative as a limit', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/e/the-formal-and-alternate-form-of-the-derivative', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'The derivative of x² at x=3 using the formal definition', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/calculus-derivatives-2-new-hd-version' },
            { label: 'The derivative of x² at any point using the formal definition', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/v/calculus-derivatives-2-5-new-hd-version' },
            { label: 'Finding tangent line equations using the formal definition of a limit', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-2/a/finding-tangent-line-equations' },
          ],
        },
        {
          name: 'Estimating derivatives of a function at a point',
          items: [
            { label: 'Estimating derivatives', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-3/v/estimating-derivative-at-a-point' },
            { label: 'Estimate derivatives', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-3/e/estimate-derivatives-from-tables', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
          ],
        },
        {
          name: 'Connecting differentiability and continuity: determining when derivatives do and do not exist',
          items: [
            { label: 'Differentiability and continuity', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/v/differentiability' },
            { label: 'Differentiability at a point: graphical', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/v/differentiability-at-a-point-graphical' },
            { label: 'Differentiability at a point: algebraic (function is differentiable)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/v/differentiability-at-a-point-algebraic-is-differentiable' },
            { label: 'Differentiability at a point: algebraic (function isn\'t differentiable)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/v/differentiability-at-a-point-algebraic-not-differentiable' },
            { label: 'Differentiability at a point: algebraic', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/e/differentiability-at-a-point-algebraic', question: { prompt: 'Practice: Differentiability at a point: algebraic. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Proof: Differentiability implies continuity', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-4/a/proof-differentiability-implies-continuity' },
          ],
        },
        {
          name: 'Applying the power rule',
          items: [
            { label: 'Power rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-5/v/power-rule' },
            { label: 'Power rule (positive integer powers)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-5/e/power-rule-intro', question: { prompt: 'Practice: Power rule (positive integer powers). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Power rule (negative & fractional powers)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-5/e/differentiate-negative-powers', question: { prompt: 'Practice: Power rule (negative & fractional powers). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Power rule (with rewriting the expression)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-5/v/power-rule-with-rewriting' },
            { label: 'Justifying the power rule', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-5/a/justifying-the-power-rule' },
          ],
        },
        {
          name: 'Derivative rules: constant, sum, difference, and constant multiple: introduction',
          items: [
            { label: 'Basic derivative rules', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6a/v/derivative-properties-and-polynomial-derivatives' },
            { label: 'Basic derivative rules: find the error', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6a/v/differentiating-linear-functions' },
            { label: 'Basic derivative rules: table', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6a/v/derivative-properties-example' },
            { label: 'Justifying the basic derivative rules', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6a/a/justifying-the-basic-derivative-rules' },
          ],
        },
        {
          name: 'Derivative rules: constant, sum, difference, and constant multiple: connecting with the power rule',
          items: [
            { label: 'Differentiating polynomials', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6b/v/differentiating-polynomials-example' },
            { label: 'Differentiate polynomials', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6b/e/power-rule-basic', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Differentiating integer powers (mixed positive and negative)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6b/v/negative-powers-differentiation' },
            { label: 'Differentiate integer powers (mixed positive and negative)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6b/e/differentiate-radical-functions-intro', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Tangents of polynomials', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-6b/v/tangents-of-polynomials' },
          ],
        },
        {
          name: 'Derivatives of cos(x), sin(x), 𝑒ˣ, and ln(x)',
          items: [
            { label: 'Derivatives of sin(x) and cos(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/v/derivatives-of-sinx-and-cosx' },
            { label: 'Worked example: Derivatives of sin(x) and cos(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/v/sine-and-cosine-differentiation' },
            { label: 'Proving the derivatives of sin(x) and cos(x)', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/a/proving-the-derivatives-of-sinx-and-cosx' },
            { label: 'Derivative of 𝑒ˣ', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/v/derivative-of-ex' },
            { label: 'Derivative of ln(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/v/derivative-of-lnx' },
            { label: 'Derivatives of 𝑒ˣ and ln(x)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/e/derivatives-of-ex-and-lnx', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Proof: The derivative of 𝑒ˣ is 𝑒ˣ', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/a/proof-the-derivative-of-is' },
            { label: 'Proof: the derivative of ln(x) is 1/x', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-7/a/proof-the-derivative-of-lnx-is-1x' },
          ],
        },
        {
          name: 'The product rule',
          items: [
            { label: 'Product rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/v/applying-the-product-rule-for-derivatives' },
            { label: 'Differentiating products', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/v/differentiating-products' },
            { label: 'Differentiate products', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/e/differentiate-products', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Worked example: Product rule with table', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/v/product-rule-example-implicit' },
            { label: 'Worked example: Product rule with mixed implicit & explicit', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/v/product-rule-example-mixed-implicit-explicit' },
            { label: 'Product rule with tables', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/e/product_rule', question: { prompt: 'Find d/dx of x·sin(x).', answer: 'sin(x) + x·cos(x)', explanation: 'Product rule: u\'v + uv\' with u=x, v=sin(x).' } },
            { label: 'Proving the product rule', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/a/proving-the-product-rule' },
            { label: 'Product rule review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/a/product-rule-review' },
          ],
        },
        {
          name: 'The quotient rule',
          items: [
            { label: 'Quotient rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/v/quotient-rule' },
            { label: 'Differentiate quotients', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/e/differentiate-quotients', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Worked example: Quotient rule with table', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/v/quotient-rule-example' },
            { label: 'Quotient rule with tables', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/e/quotient_rule', question: { prompt: 'Find d/dx of x/(x+1).', answer: '1/(x+1)²', explanation: 'Quotient rule simplifies to 1/(x+1)².' } },
            { label: 'Differentiating rational functions', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/v/rational-functions-differentiation' },
            { label: 'Differentiate rational functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/e/differentiate-rational-functions', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Quotient rule review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-9/a/quotient-rule-review' },
          ],
        },
        {
          name: 'Finding the derivatives of tangent, cotangent, secant, and/or cosecant functions',
          items: [
            { label: 'Derivatives of tan(x) and cot(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-10/v/derivatives-of-tanx-and-cotx' },
            { label: 'Derivatives of sec(x) and csc(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-10/v/derivatives-of-secx-and-cscx' },
            { label: 'Derivatives of tan(x), cot(x), sec(x), and csc(x)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-10/e/differentiate-basic-trigonometric-functions', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
          ],
        },
        {
          name: 'Optional videos',
          items: [
            { label: 'Proof: Differentiability implies continuity', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/differentiability-implies-continuity' },
            { label: 'Justifying the power rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/is-the-power-rule-reasonable' },
            { label: 'Proof of power rule for positive integer powers', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/proof-d-dx-x-n' },
            { label: 'Proof of power rule for square root function', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/proof-d-dx-sqrt-x' },
            { label: 'Limit of sin(x)/x as x approaches 0', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/sinx-over-x-as-x-approaches-0' },
            { label: 'Limit of (1-cos(x))/x as x approaches 0', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/1-cosx-over-x-as-x-approaches-0' },
            { label: 'Proof of the derivative of sin(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/derivative-of-sin-x' },
            { label: 'Proof of the derivative of cos(x)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/derivative-of-cos-x' },
            { label: 'Product rule proof', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-1-new/ab-diff-1-optional/v/product-rule-proof' },
          ],
        },
      ],
    },
    {
      name: 'Differentiation: composite, implicit, and inverse functions',
      lessons: [
        {
          name: 'The chain rule: introduction',
          items: [
            { label: 'Chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/chain-rule-introduction' },
            { label: 'Common chain rule misunderstandings', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/common-chain-rule-misunderstandings' },
            { label: 'Identifying composite functions', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/recognizing-compositions-of-functions' },
            { label: 'Identify composite functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/e/identify-composite-functions', question: { prompt: 'Practice: Identify composite functions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: Derivative of cos³(x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/differentiating-composite-functions-1' },
            { label: 'Worked example: Derivative of √(3x²-x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/chain-rule-definition-and-example' },
            { label: 'Worked example: Derivative of ln(√x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/v/differentiating-composite-functions-2' },
            { label: 'Chain rule intro', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1a/e/differentiate-composite-functions-intro', question: { prompt: 'Find d/dx of (2x+1)³.', answer: '6(2x+1)²', explanation: 'Chain rule: 3(2x+1)² × 2.' } },
          ],
        },
        {
          name: 'The chain rule: further practice',
          items: [
            { label: 'Worked example: Chain rule with table', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/chain-rule-example-implicit' },
            { label: 'Chain rule with tables', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/e/chain_rule_1', question: { prompt: 'Find d/dx of (2x+1)³.', answer: '6(2x+1)²', explanation: 'Chain rule: 3(2x+1)² × 2.' } },
            { label: 'Derivative of aˣ (for any positive base a)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/exponential-functions-differentiation-intro' },
            { label: 'Derivative of logₐx (for any positive base a≠1)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/logarithmic-functions-differentiation-intro' },
            { label: 'Derivatives of aˣ and logₐx', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/e/differentiate-exponential-functions-intro', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
            { label: 'Worked example: Derivative of 7^(x²-x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/exponential-functions-differentiation' },
            { label: 'Worked example: Derivative of log₄(x²+x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/log-functions-differentiation' },
            { label: 'Worked example: Derivative of sec(3π/2-x) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/trig-functions-differentiation-sec' },
            { label: 'Worked example: Derivative of ∜(x³+4x²+7) using the chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/v/radical-functions-differentiation' },
            { label: 'Chain rule capstone', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/e/exp-log-trig-radical-composite-diff', question: { prompt: 'Find d/dx of (2x+1)³.', answer: '6(2x+1)²', explanation: 'Chain rule: 3(2x+1)² × 2.' } },
            { label: 'Proving the chain rule', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/a/proving-the-chain-rule' },
            { label: 'Derivative rules review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-1b/a/differentiation-rules-review' },
          ],
        },
        {
          name: 'Implicit differentiation',
          items: [
            { label: 'Implicit differentiation', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-2/v/implicit-differentiation-1' },
            { label: 'Worked example: Implicit differentiation', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-2/v/implicit-derivative-of-x-y-2-x-y-1' },
            { label: 'Worked example: Evaluating derivative with implicit differentiation', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-2/v/finding-slope-of-tangent-line-with-implicit-differentiation' },
            { label: 'Showing explicit and implicit differentiation give same result', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-2/v/showing-explicit-and-implicit-differentiation-give-same-result' },
            { label: 'Implicit differentiation review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-2/a/implicit-differentiation-review' },
          ],
        },
        {
          name: 'Differentiating inverse functions',
          items: [
            { label: 'Derivatives of inverse functions', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-3/v/derivatives-of-inverse-functions' },
            { label: 'Derivatives of inverse functions: from equation', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-3/v/derivatives-of-inverse-functions-implicit' },
            { label: 'Derivatives of inverse functions: from table', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-3/v/derivatives-of-inverse-functions-table' },
          ],
        },
        {
          name: 'Differentiating inverse trigonometric functions',
          items: [
            { label: 'Derivative of inverse sine', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-4/v/derivative-inverse-sine' },
            { label: 'Derivative of inverse cosine', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-4/v/derivative-inverse-cosine' },
            { label: 'Derivative of inverse tangent', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-4/v/derivative-inverse-tangent' },
            { label: 'Derivatives of inverse trigonometric functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-4/e/derivatives-of-inverse-trigonometric-functions', question: { prompt: 'Evaluate sin(30°).', answer: '1/2', explanation: 'sin(30°) = 1/2 (special angle).' } },
            { label: 'Differentiating inverse trig functions review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-4/a/differentiating-inverse-trig-functions-review' },
          ],
        },
        {
          name: 'Selecting procedures for calculating derivatives: strategy',
          items: [
            { label: 'Differentiating functions: Find the error', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5a/v/correcting-work-on-derivative-strategies' },
            { label: 'Manipulating functions before differentiation', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5a/v/strategies-applying-derivative-rules' },
            { label: 'Strategy in differentiating functions', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5a/a/review-categorizing-functions-for-taking-derivatives' },
          ],
        },
        {
          name: 'Selecting procedures for calculating derivatives: multiple rules',
          items: [
            { label: 'Differentiating using multiple rules: strategy', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/v/differentiating-using-multiple-rules-strategy' },
            { label: 'Applying the chain rule and product rule', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/v/applying-the-chain-rule-and-product-rule' },
            { label: 'Applying the chain rule twice', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/v/applying-chain-rule-twice' },
            { label: 'Derivative of eᶜᵒˢˣ⋅cos(eˣ)', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/v/using-the-product-rule-and-the-chain-rule' },
            { label: 'Derivative of sin(ln(x²))', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/v/chain-rule-with-triple-composition' },
            { label: 'Differentiating using multiple rules', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-5b/e/derivatives-capstone', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
          ],
        },
        {
          name: 'Calculating higher-order derivatives',
          items: [
            { label: 'Second derivatives', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-6/v/second-derivatives' },
            { label: 'Second derivatives (implicit equations): find expression', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-6/v/finding-second-derivative-implicit' },
            { label: 'Second derivatives (implicit equations): evaluate derivative', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-6/v/evaluating-second-derivative-implicit' },
            { label: 'Second derivatives (implicit equations)', type: 'exercise', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-6/e/second-derivatives-implicit-equations', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
            { label: 'Second derivatives review', type: 'article', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-6/a/second-derivatives-review' },
          ],
        },
        {
          name: 'Further practice connecting derivatives and limits',
          items: [
            { label: 'Disguised derivatives', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-3-7/v/disguised-derivatives' },
          ],
        },
        {
          name: 'Optional videos',
          items: [
            { label: 'Proof: Differentiability implies continuity', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-diff-2-optional/v/differentiability-implies-continuity' },
            { label: 'If function u is continuous at x, then Δu→0 as Δx→0', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-diff-2-optional/v/change-in-continuous-function-approaches-0' },
            { label: 'Chain rule proof', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-diff-2-optional/v/chain-rule-proof' },
            { label: 'Quotient rule from product & chain rules', type: 'video', href: '/math/ap-calculus-ab/ab-differentiation-2-new/ab-diff-2-optional/v/quotient-rule-from-product-rule' },
          ],
        },
      ],
    },
    {
      name: 'Contextual applications of differentiation',
      lessons: [
        {
          name: 'Interpreting the meaning of the derivative in context',
          items: [
            { label: 'Interpreting the meaning of the derivative in context', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-1/v/interpreting-the-meaning-of-the-derivative-in-context' },
            { label: 'Analyzing problems involving rates of change in applied contexts', type: 'article', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-1/a/analyzing-problems-involving-rates-of-change-in-applied-contexts' },
          ],
        },
        {
          name: 'Straight-line motion: connecting position, velocity, and acceleration',
          items: [
            { label: 'Introduction to one-dimensional motion with calculus', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/v/one-dimensional-motion-with-calculus' },
            { label: 'Interpreting direction of motion from position-time graph', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/v/interpreting-direction-from-position-time' },
            { label: 'Interpreting direction of motion from velocity-time graph', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/v/interpreting-direction-from-velocity-time' },
            { label: 'Interpreting change in speed from velocity-time graph', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/v/interpreting-speed-from-velocity-time' },
            { label: 'Interpret motion graphs', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/e/interpret-motion-graphs', question: { prompt: 'Practice: Interpret motion graphs. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: Motion problems with derivatives', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/v/motion-problems-with-derivatives' },
            { label: 'Motion problems (differential calc)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-2/e/applications-of-derivatives--motion-along-a-line', question: { prompt: 'Practice: Motion problems (differential calc). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Rates of change in other applied contexts (non-motion problems)',
          items: [
            { label: 'Applied rate of change: forgetfulness', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-3/v/modeling-a-forgetting-curve' },
            { label: 'Rates of change in other applied contexts (non-motion problems)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-3/e/applications-of-differentiation-in-biology--economics--physics--etc', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Marginal cost & differential calculus', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-3/v/derivative-and-marginal-cost' },
          ],
        },
        {
          name: 'Introduction to related rates',
          items: [
            { label: 'Related rates intro', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/rates-of-change-between-radius-and-area-of-circle' },
            { label: 'Analyzing problems involving related rates', type: 'article', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/a/analyzing-problems-involving-related-rates' },
            { label: 'Analyzing related rates problems: expressions', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/analyzing-related-rates-problems-expressions' },
            { label: 'Analyzing related rates problems: equations (Pythagoras)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/analyzing-related-rates-problems-equations' },
            { label: 'Analyzing related rates problems: equations (trig)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/related-rates-example-with-trigonometry' },
            { label: 'Analyzing related rates problems: equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/e/analyzing-related-rates-problems-equations', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Differentiating related functions intro', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/differentiating-related-functions-intro' },
            { label: 'Worked example: Differentiating related functions', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/v/differentiating-related-functions' },
            { label: 'Differentiate related functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-4/e/implicit-differentiation-of-related-functions', question: { prompt: 'Find d/dx of x³.', answer: '3x²', explanation: 'Power rule: d/dx[x^n] = nx^(n-1).' } },
          ],
        },
        {
          name: 'Solving related rates problems',
          items: [
            { label: 'Related rates intro', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/e/related-rates', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Related rates (multiple rates)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/e/related-rates-multiple-rates', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Related rates: Approaching cars', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/v/rate-of-change-of-distance-between-approaching-cars' },
            { label: 'Related rates: Falling ladder', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/v/falling-ladder-related-rates' },
            { label: 'Related rates (Pythagorean theorem)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/e/related-rates-pythagorean-theorem', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Related rates: water pouring into a cone', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/v/related-rates-of-water-pouring-into-cone' },
            { label: 'Related rates (advanced)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/e/related-rates-advanced', question: { prompt: 'A car drives 120 miles in 2 hours. What is the unit rate?', answer: '60 mph', explanation: '120 ÷ 2 = 60 miles per hour.' } },
            { label: 'Related rates: shadow', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/v/speed-of-shadow-of-diving-bird' },
            { label: 'Related rates: balloon', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-5/v/rate-of-change-of-balloon-height' },
          ],
        },
        {
          name: 'Approximating values of a function using local linearity and linearization',
          items: [
            { label: 'Local linearity', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-6/v/local-linearization-intro' },
            { label: 'Local linearity and differentiability', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-6/v/local-linearity-and-differentiability' },
            { label: 'Worked example: Approximation with local linearity', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-6/v/approximation-with-local-linearity' },
            { label: 'Approximation with local linearity', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-6/e/local-linearization', question: { prompt: 'Practice: Approximation with local linearity. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Linear approximation of a rational function', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-6/v/linear-approximation-example' },
          ],
        },
        {
          name: 'Using L’Hôpital’s rule for finding limits of indeterminate forms',
          items: [
            { label: 'L\'Hôpital\'s rule introduction', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/v/introduction-to-l-hopital-s-rule' },
            { label: 'L\'Hôpital\'s rule: limit at 0 example', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/v/l-hopital-s-rule-example-1' },
            { label: 'L\'Hôpital\'s rule: 0/0', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/e/lhopitals_rule', question: { prompt: 'Practice: L\'Hôpital\'s rule: 0/0. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'L\'Hôpital\'s rule: limit at infinity example', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/v/l-hopital-s-rule-example-2' },
            { label: 'L\'Hôpital\'s rule: ∞/∞', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/e/lhopitals-rule-inf', question: { prompt: 'Practice: L\'Hôpital\'s rule: ∞/∞. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Proof of special case of l\'Hôpital\'s rule', type: 'article', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-7/a/proof-of-special-case-of-lhpitals-rule' },
          ],
        },
        {
          name: 'Optional videos',
          items: [
            { label: 'Proof of special case of l\'Hôpital\'s rule', type: 'video', href: '/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-diff-context-optional/v/proof-of-special-case-of-l-hopital-s-rule' },
          ],
        },
      ],
    },
    {
      name: 'Applying derivatives to analyze functions',
      lessons: [
        {
          name: 'Using the mean value theorem',
          items: [
            { label: 'Mean value theorem', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/mean-value-theorem-1' },
            { label: 'Mean value theorem example: polynomial', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/finding-where-the-derivative-is-equal-to-the-average-change' },
            { label: 'Mean value theorem example: square root function', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/mean-value-theorem-example-square-root' },
            { label: 'Using the mean value theorem', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/e/mean-value-theorem', question: { prompt: 'Find the mean of {3, 5, 7}.', answer: '5', explanation: '(3+5+7)/3 = 15/3 = 5.' } },
            { label: 'Justification with the mean value theorem: table', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/justification-with-the-mean-value-theorem-table' },
            { label: 'Justification with the mean value theorem: equation', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/justification-with-the-mean-value-theorem-equation' },
            { label: 'Establishing differentiability for MVT', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/a/review-establishing-differentiability-for-mvt' },
            { label: 'Justification with the mean value theorem', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/e/conditions-for-mvt-table', question: { prompt: 'Find the mean of {3, 5, 7}.', answer: '5', explanation: '(3+5+7)/3 = 15/3 = 5.' } },
            { label: 'Mean value theorem application', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/v/getting-a-ticket-because-of-the-mean-value-theorem' },
            { label: 'Mean value theorem review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-1/a/mean-value-theorem-review' },
          ],
        },
        {
          name: 'Extreme value theorem, global versus local extrema, and critical points',
          items: [
            { label: 'Extreme value theorem', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-2/v/extreme-value-theorem' },
            { label: 'Critical points introduction', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-2/v/minima-maxima-and-critical-points' },
            { label: 'Finding critical points', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-2/v/finding-critical-numbers' },
            { label: 'Find critical points', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-2/e/find-critical-points', question: { prompt: 'Practice: Find critical points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Determining intervals on which a function is increasing or decreasing',
          items: [
            { label: 'Finding decreasing interval given the function', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-3/v/increasing-decreasing-intervals-given-the-function' },
            { label: 'Finding increasing interval given the derivative', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-3/v/finding-increasing-interval-given-derivative' },
            { label: 'Increasing & decreasing intervals', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-3/e/find-increasing-and-decreasing-intervals', question: { prompt: 'Practice: Increasing & decreasing intervals. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Increasing & decreasing intervals review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-3/a/increasing-and-decreasing-intervals-review' },
          ],
        },
        {
          name: 'Using the first derivative test to find relative (local) extrema',
          items: [
            { label: 'Introduction to minimum and maximum points', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/v/relative-minima-maxima' },
            { label: 'Finding relative extrema (first derivative test)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/v/testing-critical-points-for-local-extrema' },
            { label: 'Worked example: finding relative extrema', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/v/finding-relative-maximum-example' },
            { label: 'Analyzing mistakes when finding extrema (example 1)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/v/analyzing-mistakes-when-finding-extrema-1' },
            { label: 'Analyzing mistakes when finding extrema (example 2)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/v/analyzing-mistakes-when-finding-extrema-2' },
            { label: 'Relative minima & maxima', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/e/critical-numbers', question: { prompt: 'Practice: Relative minima & maxima. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Relative minima & maxima review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-4/a/relative-minima-and-maxima-review' },
          ],
        },
        {
          name: 'Using the candidates test to find absolute (global) extrema',
          items: [
            { label: 'Finding absolute extrema on a closed interval', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-5/v/using-extreme-value-theorem' },
            { label: 'Absolute minima & maxima (closed intervals)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-5/e/extreme-value-theorem', question: { prompt: 'Practice: Absolute minima & maxima (closed intervals). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Absolute minima & maxima (entire domain)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-5/v/absolute-extrema-on-entire-domain' },
            { label: 'Absolute minima & maxima review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-5/a/absolute-minima-and-maxima-review' },
          ],
        },
        {
          name: 'Determining concavity of intervals and finding points of inflection: graphical',
          items: [
            { label: 'Concavity introduction', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/v/concavity-concave-upwards-and-concave-downwards-intervals' },
            { label: 'Analyzing concavity (graphical)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/v/recognizing-concavity-exercise' },
            { label: 'Concavity intro', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/e/recognizing_concavity', question: { prompt: 'Practice: Concavity intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Inflection points introduction', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/v/inflection-points' },
            { label: 'Inflection points (graphical)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/v/inflection-points-graphically-given-function' },
            { label: 'Inflection points intro', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6a/e/analyze-points-of-inflection-graphical', question: { prompt: 'Practice: Inflection points intro. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Determining concavity of intervals and finding points of inflection: algebraic',
          items: [
            { label: 'Analyzing concavity (algebraic)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/v/analyzing-concavity-algebraically' },
            { label: 'Inflection points (algebraic)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/v/inflection-points-algebraically' },
            { label: 'Mistakes when finding inflection points: second derivative undefined', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/v/mistakes-when-finding-inflection-points-second-derivative-undefined' },
            { label: 'Mistakes when finding inflection points: not checking candidates', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/v/mistakes-when-finding-inflection-points-not-checking-candidates' },
            { label: 'Analyzing the second derivative to find inflection points', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/a/review-analyzing-the-second-derivative-to-find-inflection-points' },
            { label: 'Analyze concavity', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/e/analyze-concavity-algebraic', question: { prompt: 'Practice: Analyze concavity. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Find inflection points', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/e/analyze-points-of-inflection-algebraic', question: { prompt: 'Practice: Find inflection points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Concavity review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/a/concavity-review' },
            { label: 'Inflection points review', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-6b/a/inflection-points-review' },
          ],
        },
        {
          name: 'Using the second derivative test to find extrema',
          items: [
            { label: 'Second derivative test', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-7/v/second-derivative-test' },
          ],
        },
        {
          name: 'Sketching curves of functions and their derivatives',
          items: [
            { label: 'Curve sketching with calculus: polynomial', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-8/v/calculus-graphing-using-derivatives' },
            { label: 'Curve sketching with calculus: logarithm', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-8/v/calculus-graphing-with-derivatives-example' },
            { label: 'Analyzing a function with its derivative', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-8/v/analyzing-a-function-with-its-derivative' },
          ],
        },
        {
          name: 'Connecting a function, its first derivative, and its second derivative',
          items: [
            { label: 'Calculus-based justification for function increasing', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/calculus-based-justification-for-function-increasing' },
            { label: 'Justification using first derivative', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/justification-using-first-derivative' },
            { label: 'Inflection points from graphs of function & derivatives', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/identifying-inflection-points-from-graphs-of-function-and-derivatives' },
            { label: 'Justification using second derivative: inflection point', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/justification-for-inflection-point' },
            { label: 'Justification using second derivative: maximum point', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/calculus-based-justification-using-second-derivative-max' },
            { label: 'Justification using second derivative', type: 'article', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/a/justification-using-second-derivative' },
            { label: 'Connecting f, f\', and f\'\' graphically', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/connecting-function-and-derivatives-graphically' },
            { label: 'Connecting f, f\', and f\'\' graphically (another example)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-9/v/connecting-function-and-derivatives-graphically-exp' },
          ],
        },
        {
          name: 'Solving optimization problems',
          items: [
            { label: 'Optimization: sum of squares', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/minimizing-sum-of-squares' },
            { label: 'Optimization: box volume (Part 1)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/optimizing-box-volume-graphically' },
            { label: 'Optimization: box volume (Part 2)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/optimizing-box-volume-analytically' },
            { label: 'Optimization: profit', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/optimizing-profit-at-a-shoe-factory' },
            { label: 'Optimization: cost of materials', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/minimizing-the-cost-of-a-storage-container' },
            { label: 'Optimization: area of triangle & square (Part 1)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/expression-for-combined-area-of-triangle-and-square' },
            { label: 'Optimization: area of triangle & square (Part 2)', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/minimizing-combined-area' },
            { label: 'Optimization', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/e/optimization', question: { prompt: 'Practice: Optimization. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Motion problems: finding the maximum acceleration', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-11/v/rectilinear-motion-example-maximum-acceleration' },
          ],
        },
        {
          name: 'Exploring behaviors of implicit relations',
          items: [
            { label: 'Horizontal tangent to implicit curve', type: 'video', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-12/v/implicit-curve-horizontal-tangent' },
            { label: 'Tangents to graphs of implicit relations', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-12/e/explore-behaviors-of-implicit-relations', question: { prompt: 'Evaluate sin(30°).', answer: '1/2', explanation: 'sin(30°) = 1/2 (special angle).' } },
          ],
        },
        {
          name: 'Calculator-active practice',
          items: [
            { label: 'Analyze functions (calculator-active)', type: 'exercise', href: '/math/ap-calculus-ab/ab-diff-analytical-applications-new/ab-5-13/e/analyze-functions-calculator-active', question: { prompt: 'Practice: Analyze functions (calculator-active). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
      ],
    },
    {
      name: 'Integration and accumulation of change',
      lessons: [
        {
          name: 'Exploring accumulations of change',
          items: [
            { label: 'Introduction to integral calculus', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-1/v/introduction-to-integral-calculus' },
            { label: 'Definite integrals intro', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-1/v/definite-integrals-intro' },
            { label: 'Exploring accumulation of change', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-1/a/accumulation-and-net-change-in-context' },
            { label: 'Worked example: accumulation of change', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-1/v/area-under-rate-function-example' },
            { label: 'Accumulation of change', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-1/e/area-under-a-rate-function-equals-net-change', question: { prompt: 'Practice: Accumulation of change. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Approximating areas with Riemann sums',
          items: [
            { label: 'Riemann approximation introduction', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/simple-riemann-approximation-using-rectangles' },
            { label: 'Over- and under-estimation of Riemann sums', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/riemann-sums-over-and-under-estimation' },
            { label: 'Left & right Riemann sums', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/a/left-and-right-riemann-sums' },
            { label: 'Worked example: finding a Riemann sum using a table', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/riemann-sum-from-table' },
            { label: 'Worked example: over- and under-estimation of Riemann sums', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/riemann-sums-over-under-example' },
            { label: 'Midpoint sums', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/midpoint-sums' },
            { label: 'Trapezoidal sums', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/v/trapezoidal-approximation-of-area-under-curve' },
            { label: 'Understanding the trapezoidal rule', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/a/understanding-the-trapezoid-rule' },
            { label: 'Midpoint & trapezoidal sums', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/e/trapezoid-rule', question: { prompt: 'Practice: Midpoint & trapezoidal sums. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Riemann sums review', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-2/a/riemann-sums-review' },
          ],
        },
        {
          name: 'Riemann sums, summation notation, and definite integral notation',
          items: [
            { label: 'Summation notation', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/sigma-notation-sum' },
            { label: 'Worked examples: Summation notation', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/summation-notation-worked-examples' },
            { label: 'Riemann sums in summation notation', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/generalizing-a-left-riemann-sum-with-equally-spaced-rectangles' },
            { label: 'Worked example: Riemann sums in summation notation', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/practice-approximating-area-under-curve' },
            { label: 'Definite integral as the limit of a Riemann sum', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/riemann-sums-and-integrals' },
            { label: 'Worked example: Rewriting definite integral as limit of Riemann sum', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/rewriting-definite-integral-as-limit-of-riemann-sum' },
            { label: 'Worked example: Rewriting limit of Riemann sum as definite integral', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-3/v/writing-riemann-sum-limit-as-definite-integral' },
          ],
        },
        {
          name: 'The fundamental theorem of calculus and accumulation functions',
          items: [
            { label: 'The fundamental theorem of calculus and accumulation functions', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-4/v/fundamental-theorem-of-calculus' },
            { label: 'Functions defined by definite integrals (accumulation functions)', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-4/v/functions-defined-by-definite-integrals' },
            { label: 'Finding derivative with fundamental theorem of calculus', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-4/v/applying-the-fundamental-theorem-of-calculus' },
            { label: 'Finding derivative with fundamental theorem of calculus: chain rule', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-4/v/derivative-with-ftc-and-chain-rule' },
          ],
        },
        {
          name: 'Interpreting the behavior of accumulation functions involving area',
          items: [
            { label: 'Interpreting the behavior of accumulation functions', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-5/v/interpreting-behavior-of-antiderivative' },
          ],
        },
        {
          name: 'Applying properties of definite integrals',
          items: [
            { label: 'Negative definite integrals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/negative-definite-integrals' },
            { label: 'Finding definite integrals using area formulas', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/definite-integrals-with-area-formulas' },
            { label: 'Definite integral over a single point', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/same-integration-bounds' },
            { label: 'Integrating scaled version of function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/integrating-scaled-function' },
            { label: 'Switching bounds of definite integral', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/switching-integral-bounds' },
            { label: 'Integrating sums of functions', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/integrating-function-sums' },
            { label: 'Worked examples: Finding definite integrals using algebraic properties', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/properties-of-definite-integrals-2' },
            { label: 'Finding definite integrals using algebraic properties', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/e/properties-of-integrals', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Definite integrals on adjacent intervals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/breaking-integral-interval' },
            { label: 'Worked example: Breaking up the integral\'s interval', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/evaluating-function-defined-by-integral' },
            { label: 'Worked example: Merging definite integrals over adjacent intervals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/merging-definite-integrals-over-adjacent-intervals' },
            { label: 'Definite integrals over adjacent intervals', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/e/definite-integral-properties-2', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Functions defined by integrals: switched interval', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/evaluating-function-defined-by-integral-switch' },
            { label: 'Finding derivative with fundamental theorem of calculus: x is on lower bound', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/swapping-the-bounds-for-definite-integral' },
            { label: 'Finding derivative with fundamental theorem of calculus: x is on both bounds', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/v/both-bounds-being-a-function-of-x' },
            { label: 'Definite integrals properties review', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-6/a/definite-integrals-properties-review' },
          ],
        },
        {
          name: 'The fundamental theorem of calculus and definite integrals',
          items: [
            { label: 'The fundamental theorem of calculus and definite integrals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-7/v/connecting-the-first-and-second-fundamental-theorems-of-calculus' },
            { label: 'Antiderivatives and indefinite integrals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-7/v/antiderivatives-and-indefinite-integrals' },
            { label: 'Proof of fundamental theorem of calculus', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-7/a/proof-of-fundamental-theorem-of-calculus' },
          ],
        },
        {
          name: 'Finding antiderivatives and integrals: basic rules and notation: reverse power rule',
          items: [
            { label: 'Reverse power rule', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/v/indefinite-integrals-of-x-raised-to-a-power' },
            { label: 'Reverse power rule: negative and fractional powers', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/e/basic-integration', question: { prompt: 'Practice: Reverse power rule: negative and fractional powers. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Indefinite integrals: sums & multiples', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/v/indefinite-integral-properties' },
            { label: 'Reverse power rule: sums & multiples', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/e/integration', question: { prompt: 'Practice: Reverse power rule: sums & multiples. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Rewriting before integrating', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/v/rewriting-integrand-before-integrating' },
            { label: 'Reverse power rule: rewriting before integrating', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/e/reverse-power-rule-rewriting', question: { prompt: 'Practice: Reverse power rule: rewriting before integrating. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Reverse power rule review', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8a/a/reverse-power-rule-review' },
          ],
        },
        {
          name: 'Finding antiderivatives and integrals: basic rules and notation: common indefinite integrals',
          items: [
            { label: 'Indefinite integral of 1/x', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8b/v/antiderivative-of-x-1' },
            { label: 'Indefinite integrals of sin(x), cos(x), and eˣ', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8b/v/basic-trig-and-exponential-antiderivatives' },
            { label: 'Indefinite integrals: eˣ & 1/x', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8b/e/indefinite-integrals-of-e-x-1-x', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Indefinite integrals: sin & cos', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8b/e/integrating-sin-cos', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Common integrals review', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8b/a/common-integrals-review' },
          ],
        },
        {
          name: 'Finding antiderivatives and integrals: basic rules and notation: definite integrals',
          items: [
            { label: 'Definite integrals: reverse power rule', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/reverse-power-rule-for-definite-integrals' },
            { label: 'Definite integral of rational function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/evaluating-definite-integral-with-power-rule' },
            { label: 'Definite integral of radical function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/definite-integral-of-cube-root' },
            { label: 'Definite integral of trig function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/definite-integral-of-sine-based-function' },
            { label: 'Definite integral involving natural log', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/definite-integral-involving-natural-log' },
            { label: 'Definite integrals: common functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/e/evaluating-definite-integrals-2', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Definite integral of piecewise function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/definite-integrals-of-piecewise-functions' },
            { label: 'Definite integral of absolute value function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/v/definite-integral-of-absolute-value' },
            { label: 'Definite integrals of piecewise functions', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-8c/e/integrating-piecewise-functions', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
          ],
        },
        {
          name: 'Integrating using substitution',
          items: [
            { label: '𝘶-substitution intro', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution' },
            { label: '𝘶-substitution: multiplying by a constant', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-example-3' },
            { label: '𝘶-substitution: defining 𝘶', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-defining-u' },
            { label: '𝘶-substitution: defining 𝘶 (more examples)', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-defining-u-exp' },
            { label: '𝘶-substitution', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/a/review-applying-u-substitution' },
            { label: '𝘶-substitution: rational function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-example-2' },
            { label: '𝘶-substitution: logarithmic function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-with-ln-x' },
            { label: '𝘶-substitution warmup', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/a/worksheet-u-substitution' },
            { label: '𝘶-substitution: indefinite integrals', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/e/integration-by-u-substitution', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: '𝘶-substitution: definite integrals', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-definite-integrals' },
            { label: '𝘶-substitution with definite integrals', type: 'article', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/a/u-substitution-definite-integrals' },
            { label: '𝘶-substitution: definite integral of exponential function', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-9/v/u-substitution-exponential' },
          ],
        },
        {
          name: 'Integrating functions using long division and completing the square',
          items: [
            { label: 'Integration using long division', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-10/v/integral-partial-fraction' },
            { label: 'Integration using completing the square and the derivative of arctan(x)', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-10/v/integration-using-completing-the-square-arctan' },
            { label: 'Integration using completing the square', type: 'exercise', href: '/math/ap-calculus-ab/ab-integration-new/ab-6-10/e/integration-using-completing-the-square', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Optional videos',
          items: [
            { label: 'Proof of fundamental theorem of calculus', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-integration-optional/v/proof-of-fundamental-theorem-of-calculus' },
            { label: 'Intuition for second part of fundamental theorem of calculus', type: 'video', href: '/math/ap-calculus-ab/ab-integration-new/ab-integration-optional/v/intuition-for-second-fundamental-theorem-of-calculus' },
          ],
        },
      ],
    },
    {
      name: 'Differential equations',
      lessons: [
        {
          name: 'Modeling situations with differential equations',
          items: [
            { label: 'Differential equations introduction', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-1/v/differential-equation-introduction' },
            { label: 'Writing a differential equation', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-1/v/writing-a-differential-equation' },
            { label: 'Write differential equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-1/e/write-differential-equations', question: { prompt: 'Practice: Write differential equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Verifying solutions for differential equations',
          items: [
            { label: 'Verifying solutions to differential equations', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-2/v/verifying-solutions-to-differential-equations' },
            { label: 'Verify solutions to differential equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-2/e/introduction-to-differential-equations-and-initial-value-problems', question: { prompt: 'Practice: Verify solutions to differential equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Sketching slope fields',
          items: [
            { label: 'Slope fields introduction', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-3/v/creating-a-slope-field' },
            { label: 'Worked example: equation from slope field', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-3/v/differential-equation-from-slope-field' },
            { label: 'Worked example: slope field from equation', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-3/v/identifying-slope-field-example' },
            { label: 'Worked example: forming a slope field', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-3/v/example-of-steps-for-constructing-slope-field' },
            { label: 'Slope fields & equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-3/e/slope-fields', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
          ],
        },
        {
          name: 'Reasoning using slope fields',
          items: [
            { label: 'Approximating solution curves in slope fields', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-4/v/slope-field-to-visualize-solutions' },
            { label: 'Worked example: range of solution curve from slope field', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-4/v/range-of-solution-curve-from-slope-field' },
            { label: 'Reasoning using slope fields', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-4/e/slope-fields-and-solutions', question: { prompt: 'Find slope between (1,2) and (3,8).', answer: '3', explanation: '(8-2)/(3-1) = 6/2 = 3.' } },
          ],
        },
        {
          name: 'Finding general solutions using separation of variables',
          items: [
            { label: 'Separable equations introduction', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/v/separable-differential-equations-introduction' },
            { label: 'Addressing treating differentials algebraically', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/v/addressing-treating-differentials-algebraically' },
            { label: 'Separable differential equations', type: 'article', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/a/applying-procedures-for-separable-differential-equations' },
            { label: 'Separable differential equations: find the error', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/e/separable-differential-equations-find-the-error', question: { prompt: 'Practice: Separable differential equations: find the error. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: separable differential equations', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/v/separable-differential-equations-examples' },
            { label: 'Worked example: identifying separable equations', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/v/identifying-separable-equations' },
            { label: 'Identifying separable equations', type: 'article', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/a/identifying-separable-equations' },
            { label: 'Identify separable equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-6/e/identify-separable-equations', question: { prompt: 'Practice: Identify separable equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Finding particular solutions using initial conditions and separation of variables',
          items: [
            { label: 'Particular solutions to differential equations: rational function', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/v/finding-constant-of-integration-rational' },
            { label: 'Particular solutions to differential equations: exponential function', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/v/finding-constant-of-integration-exponential' },
            { label: 'Particular solutions to differential equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/e/indefinite-integrals', question: { prompt: 'Practice: Particular solutions to differential equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Worked example: finding a specific solution to a separable equation', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/v/particular-solution-to-differential-equation-example' },
            { label: 'Worked example: separable equation with an implicit solution', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/v/using-particular-solution-to-separable-differential-equation' },
            { label: 'Particular solutions to separable differential equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-7/e/separable-differential-equations', question: { prompt: 'Practice: Particular solutions to separable differential equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Exponential models with differential equations',
          items: [
            { label: 'Exponential models & differential equations (Part 1)', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/v/modeling-population-with-simple-differential-equation' },
            { label: 'Exponential models & differential equations (Part 2)', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/v/particular-solution-given-initial-conditions-for-population' },
            { label: 'Worked example: exponential solution to differential equation', type: 'video', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/v/exponential-solution-to-differential-equation' },
            { label: 'Differential equations: exponential model equations', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/e/exponential-model-equations', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
            { label: 'Differential equations: exponential model word problems', type: 'exercise', href: '/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/e/diff-eq-exponential-models-word-problems', question: { prompt: 'Simplify 2³ × 2².', answer: '32', explanation: 'Add exponents: 2^(3+2) = 2⁵ = 32.' } },
          ],
        },
      ],
    },
    {
      name: 'Applications of integration',
      lessons: [
        {
          name: 'Finding the average value of a function on an interval',
          items: [
            { label: 'Average value over a closed interval', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-1/v/average-function-value-closed-interval' },
            { label: 'Calculating average value of function over interval', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-1/v/calculating-function-average-over-interval' },
            { label: 'Average value of a function', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-1/e/average-value-of-a-function', question: { prompt: 'Practice: Average value of a function. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Mean value theorem for integrals', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-1/v/mean-value-theorem-integrals' },
          ],
        },
        {
          name: 'Connecting position, velocity, and acceleration functions using integrals',
          items: [
            { label: 'Motion problems with integrals: displacement vs. distance', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/v/motion-problems-with-integrals' },
            { label: 'Analyzing motion problems: position', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/v/analyzing-motion-problems-position' },
            { label: 'Analyzing motion problems: total distance traveled', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/v/analyzing-motion-problems-total-dist-traveled' },
            { label: 'Motion problems (with definite integrals)', type: 'article', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/a/analyzing-problems-involving-definite-integrals-and-motion' },
            { label: 'Analyzing motion problems (integral calculus)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/e/analyzing-motion-problems-integral-calc', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Worked example: motion problems (with definite integrals)', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/v/antiderivative-acceleration' },
            { label: 'Motion problems (with integrals)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/e/particle-motion', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Average acceleration over interval', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-2/v/average-acceleration-over-interval' },
          ],
        },
        {
          name: 'Using accumulation functions and definite integrals in applied contexts',
          items: [
            { label: 'Area under rate function gives the net change', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/v/area-under-rate-net-change' },
            { label: 'Interpreting definite integral as net change', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/v/interpreting-definite-integral-as-net-change' },
            { label: 'Worked examples: interpreting definite integrals in context', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/v/interpreting-definite-integrals-in-context' },
            { label: 'Interpreting definite integrals in context', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/e/interpreting-definite-integrals-in-context', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
            { label: 'Analyzing problems involving definite integrals', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/v/analyzing-problems-involving-definite-integrals' },
            { label: 'Worked example: problem involving definite integral (algebraic)', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/v/definite-integral-word-problem' },
            { label: 'Problems involving definite integrals (algebraic)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-3/e/net-change-algebraic', question: { prompt: 'Find ∫ 2x dx.', answer: 'x² + C', explanation: 'Antiderivative of 2x is x² (plus constant).' } },
          ],
        },
        {
          name: 'Finding the area between curves expressed as functions of x',
          items: [
            { label: 'Area between a curve and the x-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/v/evaluating-simple-definite-integral' },
            { label: 'Area between a curve and the x-axis: negative area', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/v/definite-integrals-and-negative-area' },
            { label: 'Area between curves', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/v/area-between-curves' },
            { label: 'Worked example: area between curves', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/v/area-between-curves-example' },
            { label: 'Area between two curves given end points', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/e/area-between-two-curves-given-end-points', question: { prompt: 'Practice: Area between two curves given end points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Area between two curves', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/e/find-the-area-between-two-curves', question: { prompt: 'Practice: Area between two curves. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Composite area between curves', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-4/v/area-between-curves-with-multiple-boundaries' },
          ],
        },
        {
          name: 'Finding the area between curves expressed as functions of y',
          items: [
            { label: 'Area between a curve and the 𝘺-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-5/v/area-between-curve-and-y-axis' },
            { label: 'Horizontal area between curves', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-5/v/area-between-two-functions-of-y' },
            { label: 'Horizontal areas between curves', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-5/e/area-between-a-curve-and-the-y-axis', question: { prompt: 'Practice: Horizontal areas between curves. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Finding the area between curves that intersect at more than two points',
          items: [
            { label: 'Area between curves that intersect at more than two points (calculator-active)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-6/e/area-between-curves-that-intersect-at-more-than-two-points', question: { prompt: 'Practice: Area between curves that intersect at more than two points (calculator-active). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Volumes with cross sections: squares and rectangles',
          items: [
            { label: 'Volume with cross sections: intro', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-7/v/volume-with-cross-sections-intro' },
            { label: 'Volumes with cross sections: squares and rectangles (intro)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-7/e/volumes-of-solids-of-known-cross-section', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume with cross sections: squares and rectangles (no graph)', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-7/v/volume-from-cross-sections-without-graph-shown' },
            { label: 'Volume with cross sections perpendicular to y-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-7/v/volume-with-cross-sections-perpendicular-to-y-axis' },
            { label: 'Volumes with cross sections: squares and rectangles', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-7/e/volumes-with-square-and-rectangle-cross-sections', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
          ],
        },
        {
          name: 'Volumes with cross sections: triangles and semicircles',
          items: [
            { label: 'Volume with cross sections: semicircle', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-8/v/volume-solid-semicircle-cross-section' },
            { label: 'Volume with cross sections: triangle', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-8/v/volume-triangular-cross-section' },
            { label: 'Volumes with cross sections: triangles and semicircles', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-8/e/volumes-with-triangles-and-semicircles-cross-sections', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
          ],
        },
        {
          name: 'Volume with disc method: revolving around x- or y-axis',
          items: [
            { label: 'Disc method around x-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-9/v/disk-method-around-x-axis' },
            { label: 'Generalizing disc method around x-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-9/v/generalizing-disc-method-around-x-axis' },
            { label: 'Disc method around y-axis', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-9/v/disc-method-around-y-axis' },
            { label: 'Disc method: revolving around x- or y-axis', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-9/e/the-disk-method', question: { prompt: 'Practice: Disc method: revolving around x- or y-axis. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Volume with disc method: revolving around other axes',
          items: [
            { label: 'Disc method rotation around horizontal line', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-10/v/disc-method-rotation-around-horizontal-line' },
            { label: 'Disc method rotating around vertical line', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-10/v/disc-method-rotating-around-vertical-line' },
            { label: 'Calculating integral disc around vertical line', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-10/v/calculating-integral-disc-method-around-vertical-line' },
            { label: 'Disc method: revolving around other axes', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-10/e/disc-method-other-axes', question: { prompt: 'Practice: Disc method: revolving around other axes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Volume with washer method: revolving around x- or y-axis',
          items: [
            { label: 'Solid of revolution between two functions (leading up to the washer method)', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-11/v/disc-method-washer-method-for-rotation-around-x-axis' },
            { label: 'Generalizing the washer method', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-11/v/generalizing-the-washer-method' },
            { label: 'Washer method: revolving around x- or y-axis', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-11/e/the-washer-method', question: { prompt: 'Practice: Washer method: revolving around x- or y-axis. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Volume with washer method: revolving around other axes',
          items: [
            { label: 'Washer method rotating around horizontal line (not x-axis), part 1', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-12/v/washer-method-rotating-around-non-axis' },
            { label: 'Washer method rotating around horizontal line (not x-axis), part 2', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-12/v/part-2-of-washer-for-not-axis-rotation' },
            { label: 'Washer method rotating around vertical line (not y-axis), part 1', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-12/v/washer-or-ring-method-for-vertical-line-rotation' },
            { label: 'Washer method rotating around vertical line (not y-axis), part 2', type: 'video', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-12/v/evaluating-integral-for-washer-method-around-vertical-line' },
            { label: 'Washer method: revolving around other axes', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-12/e/washer-method-other-axes', question: { prompt: 'Practice: Washer method: revolving around other axes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Calculator-active practice',
          items: [
            { label: 'Contextual and analytical applications of integration (calculator-active)', type: 'exercise', href: '/math/ap-calculus-ab/ab-applications-of-integration-new/ab-8-14/e/applications-of-integration-calculator-active', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
      ],
    },
    {
      name: 'AP Calculus AB solved free response questions from past exams',
      lessons: [
        {
          name: 'AP Calculus AB 2017 free response',
          items: [
            { label: '2017 AP Calculus AB/BC 4a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2017-new/v/2017-ap-calculus-abbc-4a' },
            { label: '2017 AP Calculus AB/BC 4b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2017-new/v/2017-ap-calculus-abbc-4b' },
            { label: '2017 AP Calculus AB/BC 4c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2017-new/v/2017-ap-calculus-abbc-4c' },
          ],
        },
        {
          name: 'AP Calculus AB 2015 free response',
          items: [
            { label: '2015 AP Calculus AB/BC 1ab', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-1ab' },
            { label: '2015 AP Calculus AB/BC 1c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-1c' },
            { label: '2015 AP Calculus AB/BC 1d', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-1d' },
            { label: '2015 AP Calculus AB 2a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ap-2a' },
            { label: '2015 AP Calculus AB 2b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ap-2b' },
            { label: '2015 AP Calculus 2c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-2c' },
            { label: '2015 AP Calculus AB/BC 3a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-3a' },
            { label: '2015 AP Calculus AB/BC 3b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-3b' },
            { label: '2015 AP Calculus AB/BC 3cd', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-3cd' },
            { label: '2015 AP Calculus AB/BC 4ab', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-4-a-b' },
            { label: '2015 AP Calculus AB/BC 4cd', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-abbc-4-c-d' },
            { label: '2015 AP Calculus AB 5a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-5-a' },
            { label: '2015 AP Calculus AB 5b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-5b' },
            { label: '2015 AP Calculus AB 5c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-5c' },
            { label: '2015 AP Calculus AB 5d', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-5d' },
            { label: '2015 AP Calculus AB 6a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-6a' },
            { label: '2015 AP Calculus AB 6b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-6b' },
            { label: '2015 AP Calculus AB 6c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2015-new/v/2015-ap-calculus-ab-6c' },
          ],
        },
        {
          name: 'AP Calculus AB 2011 free response',
          items: [
            { label: '2011 Calculus AB free response #1a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-1a' },
            { label: '2011 Calculus AB Free Response #1 (b, c, & d)', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-1-parts-b-c-d' },
            { label: '2011 Calculus AB free response #2 (a & b)', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-2-a-b' },
            { label: '2011 Calculus AB free response #2 (c & d)', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-2-c-d' },
            { label: '2011 Calculus AB free response #3 (a & b)', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-3-a-b' },
            { label: '2011 Calculus AB free response #3 (c)', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-3-c' },
            { label: '2011 Calculus AB free response #4a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-4a' },
            { label: '2011 Calculus AB free response #4b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-4b' },
            { label: '2011 Calculus AB free response #4c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-4c' },
            { label: '2011 Calculus AB free response #4d', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-4d' },
            { label: '2011 Calculus AB free response #5a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-5a' },
            { label: '2011 Calculus AB free response #5b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-5b' },
            { label: '2011 Calculus AB free response #5c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-5c' },
            { label: '2011 Calculus AB free response #6a', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-6a' },
            { label: '2011 Calculus AB free response #6b', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-6b' },
            { label: '2011 Calculus AB free response #6c', type: 'video', href: '/math/ap-calculus-ab/ab-solved-exams-new/ab-solved-exams-2011-new/v/2011-calculus-ab-free-response-6c' },
          ],
        },
      ],
    },
    {
      name: 'AP®︎ Calculus AB Standards mappings',
      lessons: [
        {
          name: 'See how our content aligns with AP®︎ Calculus AB standards',
          items: [
            { label: 'AP®︎ Calculus AB content aligned to standards', type: 'article', href: '/math/ap-calculus-ab/ap-calc-ab-standards-mappings/ab-standards-mapping/a/ap-calc-ab-content-aligned-to-standards' },
            { label: 'AP®︎ Calculus AB standards aligned to course content', type: 'article', href: '/math/ap-calculus-ab/ap-calc-ab-standards-mappings/ab-standards-mapping/a/ap-calc-ab-standards-aligned-to-course-content' },
          ],
        },
      ],
    },
  ],
};
