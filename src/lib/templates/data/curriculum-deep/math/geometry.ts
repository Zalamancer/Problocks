import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '10',
  label: 'High School Geometry',
  sourceUrl: 'https://www.khanacademy.org/math/geometry',
  units: [
    {
      name: 'Performing transformations',
      lessons: [
        {
          name: 'Intro to Euclidean geometry',
          items: [
            { label: 'Getting ready for performing transformations', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-intro-euclid/a/getting-ready-for-performing-transformations' },
            { label: 'Euclid as the father of geometry', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-intro-euclid/v/euclid-as-the-father-of-geometry' },
            { label: 'Terms & labels in geometry', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-intro-euclid/v/language-and-notation-of-basic-geometry' },
            { label: 'Geometric definitions example', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-intro-euclid/v/geometric-precision-practice' },
            { label: 'Geometric definitions', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-intro-euclid/e/geometric-definitions', question: { prompt: 'Practice: Geometric definitions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Introduction to rigid transformations',
          items: [
            { label: 'Rigid transformations intro', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/v/introduction-to-transformations' },
            { label: 'Dilations intro', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/v/dilations-intro' },
            { label: 'Translations intro', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/a/intro-to-translations' },
            { label: 'Rotations intro', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/a/intro-to-rotations' },
            { label: 'Identifying transformations', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/v/identifying-transformations' },
            { label: 'Identify transformations', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-transformations-intro/e/identify-transformations', question: { prompt: 'Reflect (3,4) across the x-axis. New point?', answer: '(3,-4)', explanation: 'Reflection across x-axis negates y.' } },
          ],
        },
        {
          name: 'Translations',
          items: [
            { label: 'Translating points', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/v/translating-points' },
            { label: 'Translate points', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/e/performing-translations-on-the-coordinate-plane', question: { prompt: 'Practice: Translate points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Determining translations', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/v/formal-translation-tool-example' },
            { label: 'Determine translations', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/e/defining-translations', question: { prompt: 'Practice: Determine translations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Translating shapes', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/v/drawing-image-of-translation' },
            { label: 'Translate shapes', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/e/translations', question: { prompt: 'Practice: Translate shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Translation challenge problem', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/v/determing-a-translation-between-points' },
            { label: 'Properties of translations', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-translations/a/properties-of-translations' },
          ],
        },
        {
          name: 'Rotations',
          items: [
            { label: 'Rotating points', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/v/rotating-points' },
            { label: 'Rotate points', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/e/performing-rotations-on-the-coordinate-plane', question: { prompt: 'Practice: Rotate points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Determining rotations', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/v/defining-rotation-example' },
            { label: 'Determine rotations', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/e/defining-rotations', question: { prompt: 'Practice: Determine rotations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Rotating shapes', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/v/points-after-rotation' },
            { label: 'Rotating shapes about the origin by multiples of 90°', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/a/rotating-shapes' },
            { label: 'Rotate shapes', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-rotations/e/rotations-1', question: { prompt: 'Practice: Rotate shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Reflections',
          items: [
            { label: 'Reflecting points', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/v/reflecting-points' },
            { label: 'Reflect points', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/e/performing-reflections-on-the-coordinate-plane', question: { prompt: 'Practice: Reflect points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Determining reflections', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/v/determining-reflections' },
            { label: 'Determine reflections', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/e/determine-reflections', question: { prompt: 'Practice: Determine reflections. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Determining reflections (advanced)', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/v/points-on-line-of-reflection' },
            { label: 'Determine reflections (advanced)', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/e/defining-reflections', question: { prompt: 'Practice: Determine reflections (advanced). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Reflecting shapes', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/v/reflecting-shapes' },
            { label: 'Reflecting shapes: diagonal line of reflection', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/v/reflecting-segments-over-line' },
            { label: 'Reflect shapes', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-reflections/e/reflections-1', question: { prompt: 'Practice: Reflect shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Dilations',
          items: [
            { label: 'Dilating points', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/dilating-points-example' },
            { label: 'Dilate points', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/e/performing-dilations', question: { prompt: 'Practice: Dilate points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Dilations: scale factor', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/dilation-scale-factor' },
            { label: 'Dilations: center', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/example-identifying-the-center-of-dilation' },
            { label: 'Dilating shapes: expanding', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/thinking-about-dilations' },
            { label: 'Dilating shapes: shrinking', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/dilating-shapes-shrinking' },
            { label: 'Dilating triangles: find the error', type: 'video', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/v/dilating-triangles-find-the-error' },
            { label: 'Dilate triangles', type: 'exercise', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/e/dilations', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Performing transformations FAQ', type: 'article', href: '/math/geometry/hs-geo-transformations/hs-geo-dilations/a/performing-transformations-faq' },
          ],
        },
      ],
    },
    {
      name: 'Transformation properties and proofs',
      lessons: [
        {
          name: 'Rigid transformations overview',
          items: [
            { label: 'Getting ready for transformation properties', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-rigid-transformations-overview/a/getting-ready-for-transformation-properties' },
            { label: 'Finding measures using rigid transformations', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-rigid-transformations-overview/v/finding-measures-using-rigid-transformations' },
            { label: 'Find measures using rigid transformations', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-rigid-transformations-overview/e/find-measures-using-rigid-transformations', question: { prompt: 'Reflect (3,4) across the x-axis. New point?', answer: '(3,-4)', explanation: 'Reflection across x-axis negates y.' } },
            { label: 'Rigid transformations: preserved properties', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-rigid-transformations-overview/v/rigid-transformations-preserved-properties' },
            { label: 'Mapping shapes', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-rigid-transformations-overview/v/mapping-shapes' },
          ],
        },
        {
          name: 'Dilation preserved properties',
          items: [
            { label: 'Dilations and properties', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/xff63fac4:hs-geo-dilation-preserved-properties/v/dilations-and-properties' },
          ],
        },
        {
          name: 'Properties & definitions of transformations',
          items: [
            { label: 'Sequences of transformations', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-transformations-definitions/v/sequences-of-transformations' },
            { label: 'Defining transformations', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-transformations-definitions/v/defining-transformations' },
            { label: 'Precisely defining rotations', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-transformations-definitions/a/precisely-defining-rotations' },
            { label: 'Identifying type of transformation', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-transformations-definitions/v/possible-transformations-example' },
          ],
        },
        {
          name: 'Symmetry',
          items: [
            { label: 'Intro to reflective symmetry', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/v/axis-of-symmetry' },
            { label: 'Reflective symmetry of 2D shapes', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/e/symmetry-of-two-dimensional-shapes', question: { prompt: 'Practice: Reflective symmetry of 2D shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Intro to rotational symmetry', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/v/example-rotating-polygons' },
            { label: 'Rotational symmetry of 2D shapes', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/e/rotational-symmetry-of-2d-shapes', question: { prompt: 'Practice: Rotational symmetry of 2D shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Finding a quadrilateral from its symmetries', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/v/constructing-quad-based-on-symmetry' },
            { label: 'Finding a quadrilateral from its symmetries (example 2)', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/hs-geo-symmetry/v/reflecting-across-two-lines' },
          ],
        },
        {
          name: 'Proofs with transformations',
          items: [
            { label: 'Proofs with transformations', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/xff63fac4:hs-geo-proofs-with-transformations/v/line-and-angle-proofs-exercise' },
            { label: 'Transformation properties and proofs FAQ', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-transformation-properties-and-proofs/xff63fac4:hs-geo-proofs-with-transformations/a/transformation-properties-and-proofs-faq' },
          ],
        },
      ],
    },
    {
      name: 'Congruence',
      lessons: [
        {
          name: 'Transformations & congruence',
          items: [
            { label: 'Getting ready for congruence', type: 'article', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/a/getting-ready-for-congruence' },
            { label: 'Congruent shapes & transformations', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/v/testing-congruence-by-transformations-example' },
            { label: 'Non-congruent shapes & transformations', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/v/another-congruence-by-transformation-example' },
            { label: 'Congruence & transformations', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/e/exploring-rigid-transformations-and-congruence', question: { prompt: 'If two triangles are congruent, what is true about their sides?', answer: 'All corresponding sides are equal', explanation: 'Congruent means identical in shape and size.' } },
            { label: 'Segment congruence equivalent to having same length', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/v/segment-congruence-equivalent-to-having-same-length' },
            { label: 'Angle congruence equivalent to having same measure', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-trans-and-congruence/v/angle-congruence-equivalent-to-having-same-measure' },
          ],
        },
        {
          name: 'Triangle congruence from transformations',
          items: [
            { label: 'Proving the SSS triangle congruence criterion using transformations', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-congruence/v/proving-the-sss-triangle-congruence-criterion-using-transformations' },
            { label: 'Proving the SAS triangle congruence criterion using transformations', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-congruence/v/proving-the-sas-triangle-congruence-criterion-using-transformations' },
            { label: 'Proving the ASA and AAS triangle congruence criteria using transformations', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-congruence/v/proving-asa-and-aas-triangle-congruence' },
            { label: 'Why SSA isn\'t a congruence postulate/criterion', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-congruence/v/more-on-why-ssa-is-not-a-postulate' },
            { label: 'Justify triangle congruence', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-congruence/e/justify-triangle-congruence', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Congruent triangles',
          items: [
            { label: 'Triangle congruence postulates/criteria', type: 'video', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/v/other-triangle-congruence-postulates' },
            { label: 'Determining congruent triangles', type: 'video', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/v/finding-congruent-triangles' },
            { label: 'Calculating angle measures to verify congruence', type: 'video', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/v/calculating-angle-measures-to-verify-congruence' },
            { label: 'Determine congruent triangles', type: 'exercise', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/e/congruent_triangles_1', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Corresponding parts of congruent triangles are congruent', type: 'video', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/v/congruent-triangles-and-sss' },
            { label: 'Proving triangle congruence', type: 'video', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/v/proving-triangle-congruence' },
            { label: 'Prove triangle congruence', type: 'exercise', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/e/prove-triangle-congruence', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Triangle congruence review', type: 'article', href: '/math/geometry/hs-geo-congruence/xff63fac4:hs-geo-congruent-triangles/a/triangle-congruence-review' },
          ],
        },
        {
          name: 'Theorems concerning triangle properties',
          items: [
            { label: 'Properties of congruence and equality', type: 'article', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/a/properties-of-congruence-and-equality' },
            { label: 'Angles in a triangle sum to 180° proof', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/v/proof-sum-of-measures-of-angles-in-a-triangle-are-180' },
            { label: 'Proofs concerning isosceles triangles', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/v/congruent-legs-and-base-angles-of-isosceles-triangles' },
            { label: 'Proofs concerning equilateral triangles', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/v/equilateral-triangle-sides-and-angles-congruent' },
            { label: 'Triangle exterior angle example', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/v/triangle-angle-example-1' },
            { label: 'Prove triangle properties', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-congruence-theorems/e/prove-triangle-properties', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Working with triangles',
          items: [
            { label: 'Corresponding angles in congruent triangles', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/v/figuring-out-all-the-angles-for-congruent-triangles-example' },
            { label: 'Find angles in congruent triangles', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/e/congruent_triangles_2', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Isosceles & equilateral triangles problems', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/v/equilateral-and-isosceles-example-problems' },
            { label: 'Find angles in isosceles triangles', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/e/find-angles-in-isosceles-triangles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Finding angles in isosceles triangles', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/v/another-isosceles-example-problem' },
            { label: 'Finding angles in isosceles triangles (example 2)', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-working-with-triangles/v/example-involving-an-isosceles-triangle-and-parallel-lines' },
          ],
        },
        {
          name: 'Theorems concerning quadrilateral properties',
          items: [
            { label: 'Proof: Opposite sides of a parallelogram', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/proof-opposite-sides-of-parallelogram-congruent' },
            { label: 'Proof: Diagonals of a parallelogram', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/proof-diagonals-of-a-parallelogram-bisect-each-other' },
            { label: 'Proof: Opposite angles of a parallelogram', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/proof-opposite-angles-of-parallelogram-congruent' },
            { label: 'Proof: The diagonals of a kite are perpendicular', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/two-column-proof-showing-segments-are-perpendicular' },
            { label: 'Proof: Rhombus diagonals are perpendicular bisectors', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/proof-rhombus-diagonals-are-perpendicular-bisectors' },
            { label: 'Proof: Rhombus area', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/v/proof-rhombus-area-half-product-of-diagonal-length' },
            { label: 'Prove parallelogram properties', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-quadrilaterals-theorems/e/prove-quadrilateral-properties', question: { prompt: 'Evaluate log₂(8).', answer: '3', explanation: '2³ = 8, so log₂(8) = 3.' } },
          ],
        },
        {
          name: 'Proofs of general theorems',
          items: [
            { label: 'Geometry proof problem: midpoint', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-theorems/v/congruent-triangle-proof-example' },
            { label: 'Geometry proof problem: congruent segments', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-theorems/v/congruent-triangle-example-2' },
            { label: 'Geometry proof problem: squared circle', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-theorems/v/problem-involving-angle-derived-from-square-and-circle' },
            { label: 'Line and angle proofs', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-triangle-theorems/e/line-and-angle-proofs', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Constructing lines & angles',
          items: [
            { label: 'Geometric constructions: congruent angles', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/geometric-constructions-congruent-angles' },
            { label: 'Geometric constructions: parallel line', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/constructing-parallel-lines' },
            { label: 'Geometric constructions: perpendicular bisector', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/constructing-a-perpendicular-bisector-using-a-compass-and-straightedge' },
            { label: 'Geometric constructions: perpendicular line through a point on the line', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/constructing-a-perpendicular-line-using-a-compass-and-straightedge' },
            { label: 'Geometric constructions: perpendicular line through a point not on the line', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/geometric-constructions-perpendicular-line-through-a-point-not-on-the-line' },
            { label: 'Geometric constructions: angle bisector', type: 'video', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/v/constructing-an-angle-bisector-using-a-compass-and-straightedge' },
            { label: 'Justify constructions', type: 'exercise', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/e/justify-constructions-using-triangle-congruence', question: { prompt: 'Practice: Justify constructions. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Congruence FAQ', type: 'article', href: '/math/geometry/hs-geo-congruence/hs-geo-bisectors/a/congruence-faq' },
          ],
        },
      ],
    },
    {
      name: 'Similarity',
      lessons: [
        {
          name: 'Definitions of similarity',
          items: [
            { label: 'Getting ready for similarity', type: 'article', href: '/math/geometry/hs-geo-similarity/hs-geo-similarity-definitions/a/getting-ready-for-similarity' },
            { label: 'Similar shapes & transformations', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similarity-definitions/v/testing-similarity-through-transformations' },
            { label: 'Similarity & transformations', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-similarity-definitions/e/exploring-angle-preserving-transformations-and-similarity', question: { prompt: 'Triangles are similar with ratio 1:2. If a side is 5, what is the matching side?', answer: '10', explanation: 'Multiply by ratio: 5 × 2 = 10.' } },
            { label: 'Rational equations intro', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similarity-definitions/v/rational-equation-intro' },
          ],
        },
        {
          name: 'Introduction to triangle similarity',
          items: [
            { label: 'Intro to triangle similarity', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/v/similar-triangle-basics' },
            { label: 'Triangle similarity postulates/criteria', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/v/similarity-postulates' },
            { label: 'Angle-angle triangle similarity criterion', type: 'article', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/a/angle-angle-triangle-similarity-criterion' },
            { label: 'Determine similar triangles: Angles', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/e/similar_triangles_1', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Determine similar triangles: SSS', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/e/similar_triangles_2', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Determining similar triangles', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/v/similar-triangle-example-problems' },
            { label: 'Prove triangle similarity', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/e/prove-triangle-similarity', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Triangle similarity review', type: 'article', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/a/triangle-similarity-review' },
          ],
        },
        {
          name: 'Solving similar triangles',
          items: [
            { label: 'Solving similar triangles', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-solving-similar-triangles/v/similarity-example-problems' },
            { label: 'Solve similar triangles (basic)', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-solving-similar-triangles/e/solving_similar_triangles_1', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Solving similar triangles: same side plays different roles', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-solving-similar-triangles/v/similarity-example-where-same-side-plays-different-roles' },
            { label: 'Solve similar right triangles', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-solving-similar-triangles/e/solving_similar_triangles_2', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Angle bisector theorem',
          items: [
            { label: 'Intro to angle bisector theorem', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-angle-bisector-theorem/v/angle-bisector-theorem-proof' },
            { label: 'Using the angle bisector theorem', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-angle-bisector-theorem/v/angle-bisector-theorem-examples' },
            { label: 'Solve triangles: angle bisector theorem', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-angle-bisector-theorem/e/angle_bisector_theorem', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Solving problems with similar & congruent triangles',
          items: [
            { label: 'Using similar & congruent triangles', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles/v/finding-area-using-similarity-and-congruence' },
            { label: 'Use similar triangles', type: 'exercise', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles/e/solving-problems-with-similar-and-congruent-triangles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Challenging similarity problem', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles/v/challenging-similarity-problem' },
          ],
        },
        {
          name: 'Proving relationships using similarity',
          items: [
            { label: 'Pythagorean theorem proof using similarity', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/pythagorean-theorem-proof-using-similarity' },
            { label: 'Exploring medial triangles', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/exploring-medial-triangles' },
            { label: 'Proof: Parallel lines divide triangle sides proportionally', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/proof-parallel-lines-divide-triangle-sides-proportionally' },
            { label: 'Prove theorems using similarity', type: 'exercise', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/e/prove-length-theorems-using-similarity', question: { prompt: 'Triangles are similar with ratio 1:2. If a side is 5, what is the matching side?', answer: '10', explanation: 'Multiply by ratio: 5 × 2 = 10.' } },
            { label: 'Proving slope is constant using similarity', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/similar-triangles-to-prove-that-the-slope-is-constant-for-a-line' },
            { label: 'Proof: parallel lines have the same slope', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/proving-that-parallel-lines-have-the-same-slope' },
            { label: 'Proof: perpendicular lines have opposite reciprocal slopes', type: 'video', href: '/math/geometry/hs-geo-similarity/xff63fac4:hs-geo-proving-relationships-using-similarity/v/proof-that-perpendicular-lines-have-negative-reciprocal-slope' },
          ],
        },
        {
          name: 'Solving modeling problems with similar & congruent triangles',
          items: [
            { label: 'Geometry word problem: the golden ratio', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles-modeling/v/goldren-ratio-and-rembrandt-s-self-portrait' },
            { label: 'Geometry word problem: Earth & Moon radii', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles-modeling/v/golden-ratio-to-find-radius-of-moon' },
            { label: 'Geometry word problem: a perfect pool shot', type: 'video', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles-modeling/v/triangle-similarity-in-pool' },
            { label: 'Similarity FAQ', type: 'article', href: '/math/geometry/hs-geo-similarity/hs-geo-similar-and-congruent-triangles-modeling/a/similarity-faq' },
          ],
        },
      ],
    },
    {
      name: 'Right triangles & trigonometry',
      lessons: [
        {
          name: 'Pythagorean theorem',
          items: [
            { label: 'Getting ready for right triangles and trigonometry', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-pyth-theorem/a/getting-ready-for-right-triangles-and-trigonometry' },
            { label: 'Pythagorean theorem in 3D', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pyth-theorem/v/pythagoriean-theorem-in-3d' },
            { label: 'Pythagorean theorem with isosceles triangle', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pyth-theorem/v/pythagorean-theorem-with-right-triangle' },
            { label: 'Multi-step word problem with Pythagorean theorem', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pyth-theorem/v/multi-step-word-problem-with-pythagorean-theorem' },
            { label: 'Pythagorean theorem challenge', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-pyth-theorem/e/pythagorean-theorem-word-problems', question: { prompt: 'Find the hypotenuse if legs are 3 and 4.', answer: '5', explanation: '3²+4² = 25, so hypotenuse = √25 = 5.' } },
          ],
        },
        {
          name: 'Pythagorean theorem proofs',
          items: [
            { label: 'Garfield\'s proof of the Pythagorean theorem', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pythagorean-proofs/v/garfield-s-proof-of-the-pythagorean-theorem' },
            { label: 'Bhaskara\'s proof of the Pythagorean theorem', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pythagorean-proofs/v/bhaskara-s-proof-of-pythagorean-theorem-avi' },
            { label: 'Pythagorean theorem proof using similarity', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pythagorean-proofs/v/pythagorean-theorem-proof-using-similarity' },
            { label: 'Another Pythagorean theorem proof', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-pythagorean-proofs/v/another-pythagorean-theorem-proof' },
          ],
        },
        {
          name: 'Special right triangles',
          items: [
            { label: 'Special right triangles proof (part 1)', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/v/30-60-90-triangle-side-ratios-proof' },
            { label: 'Special right triangles proof (part 2)', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/v/45-45-90-triangle-side-ratios' },
            { label: 'Special right triangles', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/e/pythagorean_theorem_2', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: '30-60-90 triangle example problem', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/v/30-60-90-triangle-example-problem' },
            { label: 'Area of a regular hexagon', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/v/area-of-a-regular-hexagon' },
            { label: 'Special right triangles review', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/a/special-right-triangles-review' },
          ],
        },
        {
          name: 'Ratios in right triangles',
          items: [
            { label: 'Hypotenuse, opposite, and adjacent', type: 'article', href: '/math/geometry/hs-geo-trig/xff63fac4:hs-geo-trig-ratios-similarity/a/opposite-adjacent-hypotenuse' },
            { label: 'Side ratios in right triangles as a function of the angles', type: 'article', href: '/math/geometry/hs-geo-trig/xff63fac4:hs-geo-trig-ratios-similarity/a/side-ratios-in-right-triangles-as-a-function-of-the-angles' },
            { label: 'Using similarity to estimate ratio between side lengths', type: 'video', href: '/math/geometry/hs-geo-trig/xff63fac4:hs-geo-trig-ratios-similarity/v/using-similarity-to-estimate-ratio-between-side-lengths' },
            { label: 'Using right triangle ratios to approximate angle measure', type: 'video', href: '/math/geometry/hs-geo-trig/xff63fac4:hs-geo-trig-ratios-similarity/v/using-right-triangle-ratios-to-approximate-angle-measure' },
            { label: 'Use ratios in right triangles', type: 'exercise', href: '/math/geometry/hs-geo-trig/xff63fac4:hs-geo-trig-ratios-similarity/e/use-ratios-in-right-triangles', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
          ],
        },
        {
          name: 'Introduction to the trigonometric ratios',
          items: [
            { label: 'Triangle similarity & the trigonometric ratios', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-trig-ratios-intro/v/similarity-to-define-sine-cosine-and-tangent' },
            { label: 'Trigonometric ratios in right triangles', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-trig-ratios-intro/v/basic-trigonometry-ii' },
          ],
        },
        {
          name: 'Solving for a side in a right triangle using the trigonometric ratios',
          items: [
            { label: 'Solving for a side in right triangles with trigonometry', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-solve-for-a-side/v/example-trig-to-solve-the-sides-and-angles-of-a-right-triangle' },
            { label: 'Solve for a side in right triangles', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-solve-for-a-side/e/trigonometry_2', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Solving for an angle in a right triangle using the trigonometric ratios',
          items: [
            { label: 'Intro to inverse trig functions', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-solve-for-an-angle/a/inverse-trig-functions-intro' },
            { label: 'Solve for an angle in right triangles', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-solve-for-an-angle/e/solve-for-an-angle-in-a-right-triangle', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
          ],
        },
        {
          name: 'Sine & cosine of complementary angles',
          items: [
            { label: 'Sine & cosine of complementary angles', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-complementary-angles/v/showing-relationship-between-cosine-and-sine-of-complements' },
            { label: 'Using complementary angles', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-complementary-angles/v/sine-and-cosine-of-complements-example' },
            { label: 'Relate ratios in right triangles', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-complementary-angles/e/relate-ratios-in-right-triangles', question: { prompt: 'If 2 cookies cost $1, how much do 6 cookies cost?', answer: '$3', explanation: '6/2 = 3, so cost is 3 × $1 = $3.' } },
            { label: 'Trig word problem: complementary angles', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-complementary-angles/v/how-much-of-a-pyramid-is-submerged' },
            { label: 'Trig challenge problem: trig values & side ratios', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-complementary-angles/v/example-relating-trig-function-to-side-ratios' },
          ],
        },
        {
          name: 'Modeling with right triangles',
          items: [
            { label: 'Right triangle word problem', type: 'video', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/v/angle-to-aim-to-get-alien' },
            { label: 'Angles of elevation and depression', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/a/angles-of-elevation-and-depression' },
            { label: 'Right triangle trigonometry word problems', type: 'exercise', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/e/applying-right-triangles', question: { prompt: 'How many degrees in a right angle?', answer: '90', explanation: 'A right angle measures 90°.' } },
            { label: 'Right triangle trigonometry review', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/a/right-triangle-trigonometry-review' },
            { label: 'Right triangles and trigonometry FAQ', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/a/right-triangles-and-trigonometry-faq' },
          ],
        },
      ],
    },
    {
      name: 'Analytic geometry',
      lessons: [
        {
          name: 'Distance and midpoints',
          items: [
            { label: 'Getting ready for analytic geometry', type: 'article', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/a/getting-ready-for-analytic-geometry' },
            { label: 'Distance formula', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/v/distance-formula' },
            { label: 'Distance between two points', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/e/distance_formula', question: { prompt: 'Practice: Distance between two points. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Midpoint formula', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/v/midpoint-formula' },
            { label: 'Distance formula review', type: 'article', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/a/distance-formula-review' },
            { label: 'Midpoint formula review', type: 'article', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-distance-and-midpoints/a/midpoint-formula-review' },
          ],
        },
        {
          name: 'Dividing line segments',
          items: [
            { label: 'Dividing line segments: graphical', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dividing-segments/v/finding-a-point-part-way-between-two-points' },
            { label: 'Dividing line segments', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dividing-segments/v/ratios-of-distances-between-colinear-points' },
            { label: 'Divide line segments', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dividing-segments/e/dividing-line-segments', question: { prompt: 'Practice: Divide line segments. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Proving triangle medians intersect at a point', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dividing-segments/v/proving-triangle-medians-intersect-at-a-point' },
          ],
        },
        {
          name: 'Problem solving with distance on the coordinate plane',
          items: [
            { label: 'Area of trapezoid on the coordinate plane', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/v/area-of-trapezoid-on-coordinate-plane' },
            { label: 'Area & perimeter on the coordinate plane', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/e/find-area-and-perimeter-on-the-coordinate-plane', question: { prompt: 'What is the perimeter of a rectangle with sides 9 and 8?', answer: '34', explanation: 'Perimeter = 2(l+w) = 2(9+8) = 34.' } },
            { label: 'Points inside/outside/on a circle', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/v/point-relative-to-circle' },
            { label: 'Challenge problem: Points on two circles', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/v/recognizing-points-on-a-circle' },
            { label: 'Coordinate plane word problem', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/v/minions-within-reach-of-wizard' },
            { label: 'Coordinate plane word problems: polygons', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-dist-problems/e/coordinate-plane-word-problems-with-polygons', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
          ],
        },
        {
          name: 'Parallel & perpendicular lines on the coordinate plane',
          items: [
            { label: 'Parallel & perpendicular lines intro', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-lines/v/parallel-and-perpendicular-lines-intro' },
            { label: 'Parallel & perpendicular lines from graph', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-lines/v/classify-lines' },
            { label: 'Classifying quadrilaterals on the coordinate plane', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-lines/v/classfying-a-quadrilateral-on-the-coordinate-plane' },
            { label: 'Classifying figures with coordinates', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-lines/v/classifying-figures-with-coordinates' },
            { label: 'Classify figures by coordinates', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-lines/e/classify-figures-by-coordinates', question: { prompt: 'Practice: Classify figures by coordinates. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Equations of parallel & perpendicular lines',
          items: [
            { label: 'Parallel lines from equation', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/parallel-lines' },
            { label: 'Parallel lines from equation (example 2)', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/parallel-lines-2' },
            { label: 'Parallel lines from equation (example 3)', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/parallel-lines-3' },
            { label: 'Perpendicular lines from equation', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/perpendicular-lines' },
            { label: 'Parallel & perpendicular lines from equation', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/e/line_relationships', question: { prompt: 'Practice: Parallel & perpendicular lines from equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Writing equations of perpendicular lines', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/perpendicular-lines-2' },
            { label: 'Writing equations of perpendicular lines (example 2)', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/find-the-equation-of-a-line' },
            { label: 'Write equations of parallel & perpendicular lines', type: 'exercise', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/e/writing-equations-for-parallel-or-perpendicular-lines', question: { prompt: 'Practice: Write equations of parallel & perpendicular lines. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Proof: parallel lines have the same slope', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/proving-that-parallel-lines-have-the-same-slope' },
            { label: 'Proof: perpendicular lines have opposite reciprocal slopes', type: 'video', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/v/proof-that-perpendicular-lines-have-negative-reciprocal-slope' },
            { label: 'Analytic geometry FAQ', type: 'article', href: '/math/geometry/hs-geo-analytic-geometry/hs-geo-parallel-perpendicular-eq/a/analytic-geometry-faq' },
          ],
        },
      ],
    },
    {
      name: 'Conic sections',
      lessons: [
        {
          name: 'Graphs of circles intro',
          items: [
            { label: 'Getting ready for conic sections', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/alg2-graphs-of-circles-intro/a/getting-ready-for-conic-sections' },
            { label: 'Intro to conic sections', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/alg2-graphs-of-circles-intro/v/introduction-to-conic-sections' },
            { label: 'Graphing circles from features', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/alg2-graphs-of-circles-intro/v/graphing-circles-from-features' },
            { label: 'Graph a circle from its features', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/alg2-graphs-of-circles-intro/e/graph-a-circle-according-to-its-features', question: { prompt: 'Practice: Graph a circle from its features. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Features of a circle from its graph', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/alg2-graphs-of-circles-intro/v/center-and-radius-of-circle-from-graph' },
          ],
        },
        {
          name: 'Standard equation of a circle',
          items: [
            { label: 'Features of a circle from its standard equation', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-standard-equation/v/radius-and-center-for-a-circle-equation-in-standard-form' },
            { label: 'Graphing a circle from its standard equation', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-standard-equation/v/graphing-a-circle-from-standard-equation' },
            { label: 'Graph a circle from its standard equation', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-standard-equation/e/graphing_circles', question: { prompt: 'Practice: Graph a circle from its standard equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Writing standard equation of a circle', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-standard-equation/v/writing-standard-equation-of-circle' },
            { label: 'Write standard equation of a circle', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-standard-equation/e/write-the-equation-of-a-circle', question: { prompt: 'Practice: Write standard equation of a circle. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Expanded equation of a circle',
          items: [
            { label: 'Features of a circle from its expanded equation', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-expanded-equation/v/completing-the-square-to-write-equation-in-standard-form-of-a-circle' },
            { label: 'Graph a circle from its expanded equation', type: 'exercise', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-expanded-equation/e/graphing_circles_2', question: { prompt: 'Practice: Graph a circle from its expanded equation. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Circle equation review', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/hs-geo-circle-expanded-equation/a/circle-equation-review' },
          ],
        },
        {
          name: 'Focus and directrix of a parabola',
          items: [
            { label: 'Intro to focus & directrix', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/xff63fac4:hs-geo-parabola/v/focus-and-directrix-introduction' },
            { label: 'Equation of a parabola from focus & directrix', type: 'video', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/xff63fac4:hs-geo-parabola/v/equation-for-parabola-from-focus-and-directrix' },
            { label: 'Parabola focus & directrix review', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/xff63fac4:hs-geo-parabola/a/parabola-focus-directrix-review' },
            { label: 'Conic sections FAQ', type: 'article', href: '/math/geometry/xff63fac4:hs-geo-conic-sections/xff63fac4:hs-geo-parabola/a/conic-section-faq' },
          ],
        },
      ],
    },
    {
      name: 'Circles',
      lessons: [
        {
          name: 'Circle basics',
          items: [
            { label: 'Getting ready for circles', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-circle-basics/a/getting-ready-for-circles' },
            { label: 'Circles glossary', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-circle-basics/v/language-and-notation-of-the-circle' },
            { label: 'Area of a circle intuition', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-circle-basics/v/informal-argument-for-the-area-of-circle-formula' },
            { label: 'Proof: all circles are similar', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-circle-basics/v/seeing-circle-similarity-through-translation-and-dilation' },
          ],
        },
        {
          name: 'Arc measure',
          items: [
            { label: 'Intro to arc measure', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-measures/v/intro-arc-measure' },
            { label: 'Finding arc measures', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-measures/v/arc-measure-example-problems' },
            { label: 'Arc measure', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-arc-measures/e/arc-measure', question: { prompt: 'Practice: Arc measure. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Finding arc measures with equations', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-measures/v/arc-measure-with-equations-examples' },
            { label: 'Arc measure with equations', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-arc-measures/e/arc-measure-with-equations', question: { prompt: 'Practice: Arc measure with equations. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Arc length (from degrees)',
          items: [
            { label: 'Arc length from subtended angle', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-deg/v/length-of-an-arc-that-subtends-a-central-angle' },
            { label: 'Subtended angle from arc length', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-deg/v/finding-central-angle-measure-given-arc-length' },
            { label: 'Arc length', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-deg/e/circles_and_arcs', question: { prompt: 'Practice: Arc length. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Challenge problems: Arc length 1', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-deg/a/challenge-problems-arc-length' },
            { label: 'Challenge problems: Arc length 2', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-deg/a/challenge-problems-find-arc-measure-given-arc-length' },
          ],
        },
        {
          name: 'Introduction to radians',
          items: [
            { label: 'Radians as ratio of arc length to radius', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/v/radians-as-ratio-of-arc-length-to-radius' },
            { label: 'Arcs, ratios, and radians', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/a/arcs-ratios-and-radians' },
            { label: 'Intro to radians', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/v/introduction-to-radians' },
            { label: 'Radians & degrees', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/v/radian-and-degree-conversion-practice' },
            { label: 'Degrees to radians', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/v/we-converting-degrees-to-radians' },
            { label: 'Radians to degrees', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-radians-intro/v/we-converting-radians-to-degrees' },
          ],
        },
        {
          name: 'Arc length (from radians)',
          items: [
            { label: 'Arc length as fraction of circumference', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-rad/v/arc-length-as-fraction-of-circumference' },
            { label: 'Arc length from subtended angle: radians', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-rad/v/arc-length-from-angle-measure' },
            { label: 'Radians & arc length', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-rad/e/cc-radians-and-arc-length', question: { prompt: 'Practice: Radians & arc length. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Challenge problems: Arc length (radians) 1', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-rad/a/challenge-problems-arc-length-angles-in-radians' },
            { label: 'Challenge problems: Arc length (radians) 2', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-arc-length-rad/a/challenge-problems-find-arc-measure-in-radians-given-arc-length' },
          ],
        },
        {
          name: 'Sectors',
          items: [
            { label: 'Area of a sector', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-sectors/v/area-of-a-sector-given-a-central-angle' },
          ],
        },
        {
          name: 'Inscribed angles',
          items: [
            { label: 'Inscribed angles', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-angles/v/inscribed-angles-exercise-example' },
            { label: 'Challenge problems: Inscribed angles', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-angles/a/challenge-problems-inscribed-angles' },
            { label: 'Inscribed angle theorem proof', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-angles/v/inscribed-and-central-angles' },
          ],
        },
        {
          name: 'Inscribed shapes problem solving',
          items: [
            { label: 'Inscribed shapes: find diameter', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/v/hypotenuse-of-right-triangle-inscribed-in-circle' },
            { label: 'Inscribed shapes: angle subtended by diameter', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/v/solving-for-unknown-angle' },
            { label: 'Inscribed shapes: find inscribed angle', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/v/finding-inscribed-angle-measure' },
            { label: 'Solving inscribed quadrilaterals', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/v/example-showing-supplementary-oppositie-angles-in-inscribed-quadrilateral' },
            { label: 'Inscribed shapes', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/e/inscribed-angle-problem-solving', question: { prompt: 'Practice: Inscribed shapes. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Challenge problems: Inscribed shapes', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-shapes/a/challenge-problems-inscribed-shapes' },
          ],
        },
        {
          name: 'Proofs with inscribed shapes',
          items: [
            { label: 'Proof: Right triangles inscribed in circles', type: 'video', href: '/math/geometry/hs-geo-circles/xff63fac4:hs-geo-proofs-with-inscribed-shapes/v/right-triangles-inscribed-in-circles-proof' },
            { label: 'Inscribed quadrilaterals proof', type: 'video', href: '/math/geometry/hs-geo-circles/xff63fac4:hs-geo-proofs-with-inscribed-shapes/v/proving-the-opposite-angles-of-inscribed-quadrilateral-are-supplementary' },
            { label: 'Proof: radius is perpendicular to a chord it bisects', type: 'video', href: '/math/geometry/hs-geo-circles/xff63fac4:hs-geo-proofs-with-inscribed-shapes/v/sss-to-show-a-radius-is-perpendicular-to-a-chord-that-it-bisects' },
            { label: 'Proof: perpendicular radius bisects chord', type: 'video', href: '/math/geometry/hs-geo-circles/xff63fac4:hs-geo-proofs-with-inscribed-shapes/v/perpendicular-radius-bisects-chord' },
          ],
        },
        {
          name: 'Properties of tangents',
          items: [
            { label: 'Proof: Radius is perpendicular to tangent line', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/v/proving-radius-is-perpendicular-to-tangent-line' },
            { label: 'Determining tangent lines: angles', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/a/determining-if-a-line-is-tangent-by-looking-at-angles' },
            { label: 'Determining tangent lines: lengths', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/a/determining-if-a-line-is-tangent-by-looking-at-lengths' },
            { label: 'Proof: Segments tangent to circle from outside point are congruent', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/v/segments-tangent-to-circle-from-outside-point-congruent' },
            { label: 'Tangents of circles problem (example 1)', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/v/tangents-of-circles-exercise-examples' },
            { label: 'Tangents of circles problem (example 2)', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/v/measure-of-circumscribed-angle' },
            { label: 'Tangents of circles problem (example 3)', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/v/example-with-tangent-and-radius' },
            { label: 'Tangents of circles problems', type: 'exercise', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/e/central--inscribed--and-circumscribed-angles', question: { prompt: 'Evaluate sin(30°).', answer: '1/2', explanation: 'sin(30°) = 1/2 (special angle).' } },
            { label: 'Challenge problems: radius & tangent', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/a/challenge-problems-radius-of-a-circle-with-a-tangent' },
            { label: 'Challenge problems: circumscribing shapes', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-tangents/a/challenge-problems-perimeter-of-circumscribing-shapes' },
          ],
        },
        {
          name: 'Constructing regular polygons inscribed in circles',
          items: [
            { label: 'Geometric constructions: circle-inscribed square', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-polygons/v/constructing-square-inscribed-in-circle' },
            { label: 'Geometric constructions: circle-inscribed equilateral triangle', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-polygons/v/constructing-equilateral-triangle-inscribed-in-circle' },
            { label: 'Geometric constructions: circle-inscribed regular hexagon', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-inscribed-polygons/v/constructing-regular-hexagon-inscribed-in-circle' },
          ],
        },
        {
          name: 'Constructing circumcircles & incircles',
          items: [
            { label: 'Geometric constructions: triangle-inscribing circle', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-circum-in-circles/v/constructing-circle-inscribing-triangle' },
            { label: 'Geometric constructions: triangle-circumscribing circle', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-circum-in-circles/v/constructing-circumscribing-circle' },
          ],
        },
        {
          name: 'Constructing a line tangent to a circle',
          items: [
            { label: 'Geometric constructions: circle tangent', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-constructing-tangents/v/constructing-a-tangent-line-using-compass-and-straightedge' },
            { label: 'Geometric constructions: circle tangent (example 2)', type: 'video', href: '/math/geometry/hs-geo-circles/hs-geo-constructing-tangents/v/another-example-using-compass-and-straightedge-for-tangent-line' },
            { label: 'Circles FAQ', type: 'article', href: '/math/geometry/hs-geo-circles/hs-geo-constructing-tangents/a/circles-faq' },
          ],
        },
      ],
    },
    {
      name: 'Solid geometry',
      lessons: [
        {
          name: '2D vs. 3D objects',
          items: [
            { label: 'Getting ready for solid geometry', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/a/getting-ready-for-hs-solid-geometry' },
            { label: 'Solid geometry vocabulary', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/a/solid-geometry-vocabulary' },
            { label: 'Dilating in 3D', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/v/dilating-in-3d' },
            { label: 'Slicing a rectangular pyramid', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/v/vertical-slice-of-rectangular-pyramid' },
            { label: 'Cross sections of 3D objects (basic)', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/e/slicing-3d-figures', question: { prompt: 'Practice: Cross sections of 3D objects (basic). Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Ways to cross-section a cube', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/v/ways-to-cut-a-cube' },
            { label: 'Cross sections of 3D objects', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/e/cross-sections-of-3d-shapes', question: { prompt: 'Practice: Cross sections of 3D objects. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Rotating 2D shapes in 3D', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/v/rotating-2d-shapes-in-3d' },
            { label: 'Rotate 2D shapes in 3D', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-2d-vs-3d/e/rotate-2d-shapes-to-make-3d-objects', question: { prompt: 'Practice: Rotate 2D shapes in 3D. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
          ],
        },
        {
          name: 'Cavalieri\'s principle and dissection methods',
          items: [
            { label: 'Cavalieri\'s principle in 2D', type: 'article', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/a/cavalieri-s-principle-in-2d' },
            { label: 'Cavalieri\'s principle in 3D', type: 'article', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/a/cavalieri-s-principle-in-3d' },
            { label: 'Apply Cavalieri\'s principle', type: 'exercise', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/e/explain-related-volumes', question: { prompt: 'Practice: Apply Cavalieri\'s principle. Solve a sample problem matching this skill.', answer: 'See worked example', explanation: 'Apply the lesson concept step by step to reach the answer.' } },
            { label: 'Volume of pyramids intuition', type: 'video', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/v/volume-of-pyramids-intuition' },
            { label: 'Volume of a pyramid or cone', type: 'article', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/a/volume-of-a-pyramid-or-cone' },
            { label: 'Volumes of cones intuition', type: 'video', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/v/volumes-of-cones-intuition' },
            { label: 'Using related volumes', type: 'video', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/v/using-related-volumes' },
            { label: 'Use related volumes', type: 'exercise', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/e/use-related-volumes', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume of prisms and pyramids', type: 'exercise', href: '/math/geometry/hs-geo-solids/xff63fac4:hs-geo-cavalieri-s-principle/e/volume-of-prisms-and-pyramids', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
          ],
        },
        {
          name: 'Volume and surface area',
          items: [
            { label: 'Volume of triangular prism & cube', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/v/solid-geometry-volume' },
            { label: 'Volume of a cone', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/v/volume-cone-example' },
            { label: 'Cylinder volume & surface area', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/v/cylinder-volume-and-surface-area' },
            { label: 'Volume of a sphere', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/v/volume-of-a-sphere' },
            { label: 'Volume and surface area of cylinders', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/e/solid_geometry', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Applying volume of solids', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/v/applying-volume-of-solids' },
            { label: 'Volume of composite figures', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/a/volume-of-composite-figures' },
            { label: 'Apply volume of solids', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/e/apply-volume-of-solids', question: { prompt: 'Find the volume of a cube with side 3.', answer: '27', explanation: 'V = s³ = 3³ = 27.' } },
            { label: 'Volume formulas review', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/a/volume-formulas-review' },
          ],
        },
        {
          name: 'Density',
          items: [
            { label: 'Area density', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-density/v/area-density' },
            { label: 'Volume density', type: 'video', href: '/math/geometry/hs-geo-solids/hs-geo-density/v/volume-density' },
            { label: 'Density word problems', type: 'exercise', href: '/math/geometry/hs-geo-solids/hs-geo-density/e/surface-and-volume-density-word-problems', question: { prompt: 'Sara has 8 apples and gives 3 to a friend. How many are left?', answer: '5', explanation: '8 - 3 = 5.' } },
            { label: 'Solid geometry FAQ', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-density/a/solid-geometry-faq' },
            { label: 'Article', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/a/right-triangle-trigonometry-review?ref=geometry_articles' },
            { label: 'Right triangle trigonometry review', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-modeling-with-right-triangles/a/right-triangle-trigonometry-review?ref=geometry_articles' },
            { label: 'Volume formulas review', type: 'article', href: '/math/geometry/hs-geo-solids/hs-geo-solids-intro/a/volume-formulas-review?ref=geometry_articles' },
            { label: 'Special right triangles review', type: 'article', href: '/math/geometry/hs-geo-trig/hs-geo-special-right-triangles/a/special-right-triangles-review?ref=geometry_articles' },
            { label: 'Triangle similarity review', type: 'article', href: '/math/geometry/hs-geo-similarity/hs-geo-triangle-similarity-intro/a/triangle-similarity-review?ref=geometry_articles' },
            { label: 'Laws of sines and cosines review', type: 'article', href: '/math/precalculus/x9e81a4f98389efdf:trig/x9e81a4f98389efdf:solving-general-triangles/a/laws-of-sines-and-cosines-review?ref=geometry_articles' },
          ],
        },
      ],
    },
  ],
};
