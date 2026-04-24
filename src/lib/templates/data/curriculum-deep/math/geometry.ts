import type { DeepGrade } from '../types';

export const GEOMETRY: DeepGrade = {
  grade: '10',
  label: 'High School Geometry',
  sourceUrl: 'https://www.khanacademy.org/math/geometry',
  units: [
    {
      name: 'Performing transformations',
      description: 'Translate, rotate, reflect, and dilate figures in the coordinate plane.',
      lessons: [
        {
          name: 'Translations',
          description: 'Slide figures using vectors.',
          questions: [
            { prompt: 'Translate (4,2) by <-3,5>.', answer: '(1,7)', explanation: 'Add components.' },
            { prompt: 'Translate (0,0) by <2,-2>.', answer: '(2,-2)', explanation: 'Add.' },
          ],
        },
        {
          name: 'Reflections',
          description: 'Reflect across lines in the plane.',
          questions: [
            { prompt: 'Reflect (3,4) across y=x.', answer: '(4,3)', explanation: 'Swap.' },
            { prompt: 'Reflect (5,-2) across x-axis.', answer: '(5,2)', explanation: 'Negate y.' },
          ],
        },
        {
          name: 'Rotations',
          description: 'Rotate figures by 90°, 180°, 270°.',
          questions: [
            { prompt: 'Rotate (1,2) 90° CCW about origin.', answer: '(-2,1)', explanation: '(x,y)→(-y,x).' },
            { prompt: 'Rotate (3,4) 180°.', answer: '(-3,-4)', explanation: 'Negate both.' },
          ],
        },
        {
          name: 'Dilations',
          description: 'Scale figures by a factor.',
          questions: [
            { prompt: 'Dilate (2,3) by 2 from origin.', answer: '(4,6)', explanation: 'Multiply.' },
            { prompt: 'Dilate (6,9) by 1/3.', answer: '(2,3)', explanation: 'Divide by 3.' },
          ],
        },
      ],
    },
    {
      name: 'Transformation properties and proofs',
      description: 'Use rigid transformations to establish properties of figures and write proofs.',
      lessons: [
        {
          name: 'Rigid motions',
          description: 'Identify properties preserved by rigid motions.',
          questions: [
            { prompt: 'Do rigid motions preserve length?', answer: 'Yes', explanation: 'Isometry.' },
            { prompt: 'Do they preserve orientation (all)?', answer: 'No', explanation: 'Reflections reverse.' },
          ],
        },
        {
          name: 'Symmetry',
          description: 'Identify line and rotational symmetry.',
          questions: [
            { prompt: 'How many lines of symmetry does a square have?', answer: '4', explanation: 'Through midpoints and diagonals.' },
            { prompt: 'Rotational symmetry of equilateral triangle?', answer: '120°', explanation: 'Order 3.' },
          ],
        },
        {
          name: 'Composing transformations',
          description: 'Compose multiple transformations.',
          questions: [
            { prompt: 'Two reflections across parallel lines =?', answer: 'Translation', explanation: 'Fact.' },
            { prompt: 'Two reflections across intersecting lines =?', answer: 'Rotation', explanation: 'About intersection.' },
          ],
        },
        {
          name: 'Proofs using transformations',
          description: 'Prove congruence using rigid motions.',
          questions: [
            { prompt: 'If transformation maps A to B, what is true?', answer: 'A ≅ B', explanation: 'Congruent.' },
            { prompt: 'Does rotation preserve angles?', answer: 'Yes', explanation: 'Rigid.' },
          ],
        },
      ],
    },
    {
      name: 'Congruence',
      description: 'Prove triangles congruent using SSS, SAS, ASA, AAS, and HL criteria.',
      lessons: [
        {
          name: 'Congruence postulates',
          description: 'Recognize SSS, SAS, ASA, AAS.',
          questions: [
            { prompt: 'Two triangles share 3 sides. Postulate?', answer: 'SSS', explanation: 'Side-side-side.' },
            { prompt: '2 angles and included side. Postulate?', answer: 'ASA', explanation: 'Angle-side-angle.' },
          ],
        },
        {
          name: 'CPCTC',
          description: 'Corresponding parts of congruent triangles are congruent.',
          questions: [
            { prompt: 'If △ABC ≅ △DEF, then AB = ?', answer: 'DE', explanation: 'Corresponding sides.' },
            { prompt: 'Angle A corresponds to angle...?', answer: 'D', explanation: 'Same order.' },
          ],
        },
        {
          name: 'Isoceles triangle theorem',
          description: 'Base angles of isoceles triangle are congruent.',
          questions: [
            { prompt: 'Isoceles with two 40° base angles. Apex?', answer: '100°', explanation: '180 - 80.' },
            { prompt: 'Equal sides imply equal...?', answer: 'base angles', explanation: 'Theorem.' },
          ],
        },
        {
          name: 'HL theorem',
          description: 'Hypotenuse-leg for right triangles.',
          questions: [
            { prompt: 'HL applies only to which triangles?', answer: 'Right triangles', explanation: 'By definition.' },
            { prompt: 'Is SSA valid for all triangles?', answer: 'No', explanation: 'Ambiguous case.' },
          ],
        },
      ],
    },
    {
      name: 'Similarity',
      description: 'Establish similarity using dilations and apply similarity theorems in proofs.',
      lessons: [
        {
          name: 'AA similarity',
          description: 'Angle-angle similarity criterion.',
          questions: [
            { prompt: 'Two triangles share two angles. Similar?', answer: 'Yes', explanation: 'AA.' },
            { prompt: 'Sum of angles in triangle?', answer: '180°', explanation: 'Triangle sum.' },
          ],
        },
        {
          name: 'SAS and SSS similarity',
          description: 'Similarity via proportional sides.',
          questions: [
            { prompt: 'Triangle sides 3,4,5 and 6,8,10 similar?', answer: 'Yes', explanation: 'Ratio 2.' },
            { prompt: 'Scale factor between above?', answer: '2', explanation: 'Doubled.' },
          ],
        },
        {
          name: 'Similar triangle ratios',
          description: 'Ratios of sides, perimeters, areas.',
          questions: [
            { prompt: 'If side ratio is 3, area ratio?', answer: '9', explanation: 'Squared.' },
            { prompt: 'Perimeter ratio if sides are 1:2?', answer: '1:2', explanation: 'Same as sides.' },
          ],
        },
        {
          name: 'Applications of similarity',
          description: 'Use similarity to find missing lengths.',
          questions: [
            { prompt: 'In similar triangles, 3/x = 6/10. x?', answer: '5', explanation: 'Cross multiply.' },
            { prompt: 'Shadow of 6-ft stake is 4 ft. Tree shadow 12 ft. Tree height?', answer: '18 ft', explanation: 'Similar.' },
          ],
        },
      ],
    },
    {
      name: 'Right triangles & trigonometry',
      description: 'Apply the Pythagorean theorem and use sine, cosine, and tangent in right triangles.',
      lessons: [
        {
          name: 'Pythagorean theorem',
          description: 'Find missing sides of right triangles.',
          questions: [
            { prompt: 'Legs 6,8. Hypotenuse?', answer: '10', explanation: 'Pythagorean triple.' },
            { prompt: 'Hypotenuse 13, leg 5. Other leg?', answer: '12', explanation: '169-25=144.' },
          ],
        },
        {
          name: 'Trig ratios',
          description: 'Use sin, cos, tan for right triangles.',
          questions: [
            { prompt: 'sin θ if opposite=3, hypotenuse=5?', answer: '3/5', explanation: 'Definition.' },
            { prompt: 'tan 45°?', answer: '1', explanation: 'Opp=adj.' },
          ],
        },
        {
          name: 'Special right triangles',
          description: '30-60-90 and 45-45-90 triangles.',
          questions: [
            { prompt: 'Legs of 45-45-90 with hypotenuse √2?', answer: '1 and 1', explanation: 'Ratio 1:1:√2.' },
            { prompt: 'Side opposite 60° in 30-60-90 if short leg=1?', answer: '√3', explanation: 'Ratio 1:√3:2.' },
          ],
        },
        {
          name: 'Solving right triangles',
          description: 'Solve for all sides and angles.',
          questions: [
            { prompt: 'Right triangle hypotenuse 10, angle 30°. Opp?', answer: '5', explanation: 'sin 30° = 1/2.' },
            { prompt: 'Adjacent to 60°, hyp 8. Adj?', answer: '4', explanation: 'cos 60°.' },
          ],
        },
      ],
    },
    {
      name: 'Non-right triangles & trigonometry (Advanced)',
      description: 'Apply the laws of sines and cosines to solve non-right triangles.',
      lessons: [
        {
          name: 'Law of sines',
          description: 'Use a/sin A = b/sin B.',
          questions: [
            { prompt: 'Law of sines uses which ratio?', answer: 'side over sin(opposite angle)', explanation: 'Ratio is equal for all sides.' },
            { prompt: 'Given a=5, sin A=1/2, sin B=1. Find b.', answer: '10', explanation: 'b = a·sin B / sin A.' },
          ],
        },
        {
          name: 'Law of cosines',
          description: 'Use c^2 = a^2 + b^2 - 2ab cos C.',
          questions: [
            { prompt: 'Sides 5 and 12 with included 90°. Third side?', answer: '13', explanation: 'Pythagorean (cos 90°=0).' },
            { prompt: 'Law of cosines with C=60°, a=b=1?', answer: 'c = 1', explanation: 'Equilateral.' },
          ],
        },
        {
          name: 'Area of a triangle with sine',
          description: 'Use (1/2)ab sin C.',
          questions: [
            { prompt: 'Triangle a=8, b=10, C=30°. Area?', answer: '20', explanation: '1/2·80·0.5.' },
            { prompt: 'Area formula requires which parts?', answer: 'Two sides and included angle', explanation: 'Standard form.' },
          ],
        },
        {
          name: 'Ambiguous case',
          description: 'Recognize when SSA gives 0, 1, or 2 triangles.',
          questions: [
            { prompt: 'SSA may yield how many triangles?', answer: '0, 1, or 2', explanation: 'Ambiguous.' },
            { prompt: 'If the side opposite is less than h, triangles?', answer: '0', explanation: 'No triangle.' },
          ],
        },
      ],
    },
    {
      name: 'Analytic geometry',
      description: 'Use coordinates to prove geometric theorems and find distances, midpoints, and slopes.',
      lessons: [
        {
          name: 'Distance and midpoint',
          description: 'Compute distance and midpoint in the plane.',
          questions: [
            { prompt: 'Distance from (0,0) to (6,8).', answer: '10', explanation: 'Pythagorean.' },
            { prompt: 'Midpoint of (2,4) and (8,10).', answer: '(5,7)', explanation: 'Average.' },
          ],
        },
        {
          name: 'Slope and parallel lines',
          description: 'Use slope to identify parallel lines.',
          questions: [
            { prompt: 'Lines with same slope are...?', answer: 'Parallel', explanation: 'Coplanar.' },
            { prompt: 'Slope of line perpendicular to y = 2x?', answer: '-1/2', explanation: 'Neg reciprocal.' },
          ],
        },
        {
          name: 'Partitioning segments',
          description: 'Partition a segment in a given ratio.',
          questions: [
            { prompt: '1:1 partition of (0,0)-(6,0)?', answer: '(3,0)', explanation: 'Midpoint.' },
            { prompt: '1:2 partition of (0,0)-(9,0)?', answer: '(3,0)', explanation: '1/3 of way.' },
          ],
        },
        {
          name: 'Coordinate proofs',
          description: 'Prove theorems using coordinates.',
          questions: [
            { prompt: 'To prove parallelogram, show...?', answer: 'opposite sides parallel', explanation: 'Slopes match.' },
            { prompt: 'To prove rhombus, show...?', answer: 'all sides equal', explanation: 'Equal distances.' },
          ],
        },
      ],
    },
    {
      name: 'Conic sections',
      description: 'Derive and graph equations of circles, parabolas, ellipses, and hyperbolas.',
      lessons: [
        {
          name: 'Circles',
          description: 'Equation (x-h)^2 + (y-k)^2 = r^2.',
          questions: [
            { prompt: 'Center and radius of x^2 + y^2 = 25.', answer: '(0,0), r=5', explanation: 'Standard.' },
            { prompt: 'Equation of circle center (2,3) r=4.', answer: '(x-2)^2 + (y-3)^2 = 16', explanation: 'Plug in.' },
          ],
        },
        {
          name: 'Parabolas',
          description: 'Vertex and directrix of parabolas.',
          questions: [
            { prompt: 'Vertex of y = (x-3)^2 + 2.', answer: '(3,2)', explanation: 'Inside opposite.' },
            { prompt: 'Parabola opens up if a > ?', answer: '0', explanation: 'Positive leading.' },
          ],
        },
        {
          name: 'Ellipses (intro)',
          description: 'Read ellipse equation in standard form.',
          questions: [
            { prompt: 'Center of (x^2/9) + (y^2/4) = 1.', answer: '(0,0)', explanation: 'Standard.' },
            { prompt: 'Major axis length if a=3?', answer: '6', explanation: '2a.' },
          ],
        },
        {
          name: 'Hyperbolas (intro)',
          description: 'Recognize hyperbola standard form.',
          questions: [
            { prompt: 'Form x^2/a^2 - y^2/b^2 = 1 opens?', answer: 'Horizontally', explanation: 'Along x-axis.' },
            { prompt: 'Asymptotes pass through which point?', answer: 'Center', explanation: 'Linear lines.' },
          ],
        },
      ],
    },
    {
      name: 'Circles',
      description: 'Investigate arcs, chords, inscribed angles, and the equation of a circle.',
      lessons: [
        {
          name: 'Arc measure',
          description: 'Find arc and central angle measures.',
          questions: [
            { prompt: 'Central angle 60°. Arc?', answer: '60°', explanation: 'Same measure.' },
            { prompt: 'Full circle arc?', answer: '360°', explanation: 'Around.' },
          ],
        },
        {
          name: 'Inscribed angles',
          description: 'Inscribed angle is half the arc.',
          questions: [
            { prompt: 'Inscribed angle for 80° arc?', answer: '40°', explanation: 'Half.' },
            { prompt: 'Inscribed angle in semicircle?', answer: '90°', explanation: 'Right angle.' },
          ],
        },
        {
          name: 'Tangents and secants',
          description: 'Relationships of tangent and secant lines.',
          questions: [
            { prompt: 'Angle between tangent and radius at point?', answer: '90°', explanation: 'Perpendicular.' },
            { prompt: 'Two tangents from external point?', answer: 'Equal length', explanation: 'Tangent segments.' },
          ],
        },
        {
          name: 'Equation of circle',
          description: 'Derive equation from center and radius.',
          questions: [
            { prompt: 'Circle center (0,0) radius 3.', answer: 'x^2 + y^2 = 9', explanation: 'r^2.' },
            { prompt: 'Circle passing (3,4) center (0,0)?', answer: 'x^2 + y^2 = 25', explanation: 'r=5.' },
          ],
        },
      ],
    },
    {
      name: 'Solid geometry',
      description: 'Find surface area and volume of prisms, pyramids, cylinders, cones, and spheres.',
      lessons: [
        {
          name: 'Volume of prisms and cylinders',
          description: 'Apply V = Bh.',
          questions: [
            { prompt: 'Rectangular prism 3×4×5. Volume?', answer: '60', explanation: 'Multiply.' },
            { prompt: 'Cylinder r=2 h=5 (π≈3.14). Volume?', answer: '62.8', explanation: 'π·4·5.' },
          ],
        },
        {
          name: 'Volume of pyramids and cones',
          description: 'Apply V = (1/3)Bh.',
          questions: [
            { prompt: 'Pyramid base 6×6 height 5. Volume?', answer: '60', explanation: '1/3·36·5.' },
            { prompt: 'Cone r=3 h=6 (π≈3.14). Volume?', answer: '56.52', explanation: '1/3·π·9·6.' },
          ],
        },
        {
          name: 'Spheres',
          description: 'Apply V = (4/3)πr^3 and SA = 4πr^2.',
          questions: [
            { prompt: 'Sphere r=3 (π≈3.14). Volume?', answer: '113.04', explanation: '4/3·π·27.' },
            { prompt: 'Surface area of sphere r=2 (π≈3.14)?', answer: '50.24', explanation: '4π·4.' },
          ],
        },
        {
          name: 'Cross-sections',
          description: 'Identify cross-sections of 3D figures.',
          questions: [
            { prompt: 'Horizontal cross-section of cone?', answer: 'Circle', explanation: 'Parallel to base.' },
            { prompt: 'Vertical cross-section of cylinder?', answer: 'Rectangle', explanation: 'Through axis.' },
          ],
        },
      ],
    },
  ],
};
