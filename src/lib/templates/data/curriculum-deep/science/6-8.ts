import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '6-8',
  label: 'Middle School Science (Integrated)',
  sourceUrl: 'https://www.khanacademy.org/science/ms-physics',
  units: [
    {
      name: 'Physics - Motion and forces',
      lessons: [
        {
          name: 'Motion',
          items: [
            { label: 'Introduction to middle school physics', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/v/intro-to-middle-school-physics' },
            { label: 'Speed and velocity', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/v/speed-and-velocity' },
            { label: 'Acceleration', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/v/ms-acceleration' },
            { label: 'Reference frames', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/v/reference-frames' },
            { label: 'Describing motion', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/a/describing-motion' },
            { label: 'Understand: motion', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/e/understand-representing-motion', question: { prompt: 'Define in one sentence: Understand: motion.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
            { label: 'Apply: motion', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:motion/e/apply-motion', question: { prompt: 'Define in one sentence: Apply: motion.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Forces',
          items: [
            { label: 'Forces', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:forces/v/forces' },
            { label: 'Newton\'s third law', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:forces/v/newtons-third-law' },
            { label: 'Forces and Newton\'s third law', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:forces/a/forces-and-newtons-third-law' },
            { label: 'Understand: forces and Newton\'s third law', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:forces/e/understand-action-and-reaction-forces', question: { prompt: 'What does Newton\'s Second Law state in equation form?', answer: 'F = m a', explanation: 'Force equals mass times acceleration.' } },
            { label: 'Apply: forces and Newton\'s third law', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:forces/e/apply-forces-and-newton-s-third-law', question: { prompt: 'What does Newton\'s Second Law state in equation form?', answer: 'F = m a', explanation: 'Force equals mass times acceleration.' } },
          ],
        },
        {
          name: 'Connecting motion and forces',
          items: [
            { label: 'Newton\'s first law', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:connecting-motion-and-forces/v/newtons-first-law' },
            { label: 'Newton\'s second law', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:connecting-motion-and-forces/v/newtons-second-law' },
            { label: 'Connecting motion and forces', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:connecting-motion-and-forces/a/forces-and-acceleration' },
            { label: 'Understand: connecting motion and forces', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:connecting-motion-and-forces/e/understand-forces-and-acceleration', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
            { label: 'Apply: connecting motion and forces', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:motion-and-forces/x1baed5db7c1bb50b:connecting-motion-and-forces/e/apply-forces-and-acceleration', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
          ],
        },
      ],
    },
    {
      name: 'Physics - Non-contact interactions',
      lessons: [
        {
          name: 'Gravitational force',
          items: [
            { label: 'Gravitational force', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:gravitational-force/v/gravitational-force' },
            { label: 'Understand: gravitational force', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:gravitational-force/e/understand-gravitational-forces', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
            { label: 'Apply: gravitational force', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:gravitational-force/e/apply-gravitational-force', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
          ],
        },
        {
          name: 'Activity: How can a skydiver fall safely?',
          items: [
            { label: 'Activity: How can a skydiver fall safely?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:unit-2-phenomenon-based-activities/a/activity-how-can-a-skydiver-fall-safely' },
          ],
        },
        {
          name: 'Electric and magnetic forces',
          items: [
            { label: 'Electric force', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:electric-and-magnetic-forces/v/electric-force' },
            { label: 'Magnetic force', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:electric-and-magnetic-forces/v/magnetic-force' },
            { label: 'Electric and magnetic forces', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:electric-and-magnetic-forces/a/electromagnetism' },
            { label: 'Understand: electric and magnetic forces', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:electric-and-magnetic-forces/e/understand-magnetic-forces', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
            { label: 'Apply: electric and magnetic forces', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:electric-and-magnetic-forces/e/understand-electromagnetism', question: { prompt: 'True or False: Gravity is a contact force.', answer: 'False', explanation: 'Gravity acts at a distance, no contact required.' } },
          ],
        },
        {
          name: 'Activity: How do bees pick up pollen in flowers?',
          items: [
            { label: 'Activity: How do bees pick up pollen in flowers?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:non-contact-interactions/x1baed5db7c1bb50b:activity-how-do-bees-pick-up-pollen-in-flowers/a/activity-how-do-bees-pick-up-pollen-in-flowers' },
          ],
        },
      ],
    },
    {
      name: 'Physics - Energy',
      lessons: [
        {
          name: 'Kinetic energy',
          items: [
            { label: 'Kinetic energy', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:kinetic-energy/v/ms-kinetic-energy' },
            { label: 'Understand: kinetic energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:kinetic-energy/e/understand-kinetic-energy', question: { prompt: 'A book on a high shelf has what kind of energy?', answer: 'Gravitational potential energy', explanation: 'It will convert to kinetic if it falls.' } },
            { label: 'Apply: kinetic energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:kinetic-energy/e/apply-kineticenergy', question: { prompt: 'A book on a high shelf has what kind of energy?', answer: 'Gravitational potential energy', explanation: 'It will convert to kinetic if it falls.' } },
          ],
        },
        {
          name: 'Potential energy',
          items: [
            { label: 'Potential energy', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:potential-energy/v/ms-potential-energy' },
            { label: 'Understand: potential energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:potential-energy/e/understand-potential-energy', question: { prompt: 'A book on a high shelf has what kind of energy?', answer: 'Gravitational potential energy', explanation: 'It will convert to kinetic if it falls.' } },
            { label: 'Apply: potential energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:potential-energy/e/apply-potentialenergy', question: { prompt: 'A book on a high shelf has what kind of energy?', answer: 'Gravitational potential energy', explanation: 'It will convert to kinetic if it falls.' } },
          ],
        },
        {
          name: 'Conservation of energy',
          items: [
            { label: 'Conservation of energy', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:conservation-of-energy/v/ms-conservation-of-energy' },
            { label: 'Understand: conservation of energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:conservation-of-energy/e/understand-changes-in-energy', question: { prompt: 'Define in one sentence: Understand: conservation of energy.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
            { label: 'Apply: conservation of energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:conservation-of-energy/e/apply-changes-in-energy', question: { prompt: 'Define in one sentence: Apply: conservation of energy.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Activity: Why doesn\'t a basketball bounce forever?',
          items: [
            { label: 'Activity: Why doesn\'t a basketball bounce forever?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:energy/x1baed5db7c1bb50b:unit-3-phenomenon-based-activities/a/activity-why-doesn-t-a-basketball-bounce-forever' },
          ],
        },
      ],
    },
    {
      name: 'Physics - Waves',
      lessons: [
        {
          name: 'Wave properties',
          items: [
            { label: 'Wave properties', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:wave-properties/v/wave-properties' },
            { label: 'Understand: wave properties', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:wave-properties/e/understand-wave-properties', question: { prompt: 'Define in one sentence: Understand: wave properties.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
            { label: 'Apply: wave properties', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:wave-properties/e/apply-wave-properties', question: { prompt: 'Define in one sentence: Apply: wave properties.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Sound waves',
          items: [
            { label: 'Sound waves', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:sound-waves/v/sound-waves' },
            { label: 'Understand: sound waves', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:sound-waves/e/understand-sound-waves', question: { prompt: 'Through which medium does sound travel fastest?', answer: 'Solids (then liquids, then gases)', explanation: 'Tightly packed particles transmit vibrations quickly.' } },
            { label: 'Human ear', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:sound-waves/v/human-ear-structure-working' },
          ],
        },
        {
          name: 'Electromagnetic waves',
          items: [
            { label: 'The electromagnetic spectrum', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/v/the-electromagnetic-spectrum' },
            { label: 'Electromagnetic waves and matter', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/v/electromagnetic-waves-and-matter' },
            { label: 'Electromagnetic waves', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/a/electromagnetic-waves' },
            { label: 'Understand: electromagnetic waves', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/e/understand-absorption-and-reflection', question: { prompt: 'What is the approximate speed of light in a vacuum?', answer: 'About 3 x 10^8 m/s (300,000 km/s)', explanation: 'Nothing with mass can travel faster.' } },
            { label: 'Apply: electromagnetic waves', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/e/apply-absorption-and-reflection', question: { prompt: 'What is the approximate speed of light in a vacuum?', answer: 'About 3 x 10^8 m/s (300,000 km/s)', explanation: 'Nothing with mass can travel faster.' } },
            { label: 'Human eye', type: 'video', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:electromagnetic-waves/v/structure-of-human-eye' },
          ],
        },
        {
          name: 'Activity: How can light interactions be used to create art?',
          items: [
            { label: 'Activity: How can light interactions be used to create art?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:waves/x1baed5db7c1bb50b:activity-how-can-light-interactions-be-used-to-create-art/a/activity-how-can-light-interactions-be-used-to-create-art' },
          ],
        },
      ],
    },
    {
      name: 'Physics - Explore physics through simulations',
      lessons: [
        {
          name: 'Introduction to simulation-based learning',
          items: [
            { label: 'Introduction to simulation-based learning', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:explore-physics-through-simulations/x1baed5db7c1bb50b:introduction-to-simulation-based-learning/a/introduction-to-simulation-based-learning' },
          ],
        },
        {
          name: 'Explore conservation of energy through simulations',
          items: [
            { label: 'Conservation of energy', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:explore-physics-through-simulations/x1baed5db7c1bb50b:explore-conservation-of-energy-through-simulations/a/changes-in-energy' },
            { label: 'PhET challenge: Conservation of energy', type: 'exercise', href: '/science/ms-physics/x1baed5db7c1bb50b:explore-physics-through-simulations/x1baed5db7c1bb50b:explore-conservation-of-energy-through-simulations/e/phet-simulation-exploring-conservation-of-energy', question: { prompt: 'Define in one sentence: PhET challenge: Conservation of energy.', answer: 'A short definition that names the physics quantity and its meaning.', explanation: 'Use the related video for help.' } },
          ],
        },
      ],
    },
    {
      name: 'Physics - Teacher resources',
      lessons: [
        {
          name: 'Unit guides',
          items: [
            { label: 'How to use our NGSS-aligned unit guides', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:unit-guides/a/how-to-use-our-ngss-aligned-unit-guides' },
            { label: 'Middle school physics unit guides', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:unit-guides/a/middle-school-physics-unit-guides' },
          ],
        },
        {
          name: 'Hands-on physics activities',
          items: [
            { label: 'Introduction to hands-on science activities', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:hands-on-physics-activities/a/introduction-to-hands-on-science-activities' },
            { label: 'Activity: How can a skydiver fall safely?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:hands-on-physics-activities/a/activity-how-can-a-skydiver-fall-safely' },
            { label: 'Activity: How do bees pick up pollen in flowers?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:hands-on-physics-activities/a/activity-how-do-bees-pick-up-pollen-in-flowers' },
            { label: 'Activity: Why doesn\'t a basketball bounce forever?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:hands-on-physics-activities/a/activity-why-doesn-t-a-basketball-bounce-forever' },
            { label: 'Activity: How can light interactions be used to create art?', type: 'article', href: '/science/ms-physics/x1baed5db7c1bb50b:teacher-resources/x1baed5db7c1bb50b:hands-on-physics-activities/a/activity-how-can-light-interactions-be-used-to-create-art' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Cells and organisms',
      lessons: [
        {
          name: 'Cells and organisms',
          items: [
            { label: 'Introduction to Middle school biology', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cells-organisms/v/introduction-to-middle-school-biology' },
            { label: 'Cells and organisms', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cells-organisms/v/ms-cells-and-organisms' },
            { label: 'Key points: Cells and organisms', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cells-organisms/a/cells-and-organisms' },
            { label: 'Understand: Cells and organisms', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cells-organisms/e/understand-cells-and-organisms', question: { prompt: 'Briefly explain the main idea of: Understand: Cells and organisms.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Cell parts and functions',
          items: [
            { label: 'Cell parts and their functions', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cell-parts-and-functions/v/cell-parts-and-their-functions' },
            { label: 'Comparing animal and plant cells', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cell-parts-and-functions/v/comparing-animal-and-plant-cells' },
            { label: 'Key points: Cell parts and functions', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cell-parts-and-functions/a/cell-parts-and-functions' },
            { label: 'Understand: cell parts and functions', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cell-parts-and-functions/e/understand-cell-parts-and-functions', question: { prompt: 'Which organelle is called the powerhouse of the cell?', answer: 'Mitochondria', explanation: 'Mitochondria release energy from food during cellular respiration.' } },
            { label: 'Apply: cell parts and functions', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:cell-parts-and-functions/e/apply-cell-parts-and-functions', question: { prompt: 'Which organelle is called the powerhouse of the cell?', answer: 'Mitochondria', explanation: 'Mitochondria release energy from food during cellular respiration.' } },
          ],
        },
        {
          name: 'Activity: Why do plants wilt when they don\'t get enough water?',
          items: [
            { label: 'Activity: Why do plants wilt when they don\'t get enough water?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:activity-why-do-plants-wilt-when-they-don-t-get-enough-water/a/activity-why-do-plants-wilt-when-they-don-t-get-enough-water' },
          ],
        },
        {
          name: 'Organization in the human body',
          items: [
            { label: 'Organization in the human body', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:organization-in-the-human-body/v/ms-organization-in-the-human-body' },
            { label: 'Key points: Organization in the human body', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:organization-in-the-human-body/a/organization-in-the-human-body' },
            { label: 'Understand: Organization in the human body', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:organization-in-the-human-body/e/understand-organization-in-the-human-body', question: { prompt: 'Which organ pumps blood through the human body?', answer: 'The heart', explanation: 'It is the central organ of the circulatory system.' } },
          ],
        },
        {
          name: 'Sensory processing and the brain',
          items: [
            { label: 'Sensory processing and the brain', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:sensory-processing-and-the-brain/v/ms-sensory-processing-and-the-brain' },
            { label: 'Key points: Sensory processing and the brain', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:sensory-processing-and-the-brain/a/sensory-processing-and-the-brain' },
            { label: 'Understand: sensory processing and the brain', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:cells-and-organisms/x0c5bb03129646fd6:sensory-processing-and-the-brain/e/understand-sensory-processing-and-the-brain', question: { prompt: 'Briefly explain the main idea of: Understand: sensory processing and the brain.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
      ],
    },
    {
      name: 'Biology - Organism growth and reproduction',
      lessons: [
        {
          name: 'Sexual and asexual reproduction',
          items: [
            { label: 'Sexual and asexual reproduction', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:sexual-and-asexual-reproduction/v/ms-sexual-and-asexual-reproduction' },
            { label: 'Key points: Sexual and asexual reproduction', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:sexual-and-asexual-reproduction/a/sexual-and-asexual-reproduction' },
            { label: 'Understand: Sexual and asexual reproduction', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:sexual-and-asexual-reproduction/e/understand-sexual-and-asexual-reproduction', question: { prompt: 'True or False: Sexual reproduction produces offspring genetically identical to the parents.', answer: 'False', explanation: 'Sexual reproduction mixes genes from two parents.' } },
          ],
        },
        {
          name: 'Animal behavior and offspring success',
          items: [
            { label: 'Animal behavior and offspring success', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:animal-behavior-and-offspring-success/v/ms-animal-behavior-and-offspring-success' },
            { label: 'Apply: animal behavior and offspring success', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:animal-behavior-and-offspring-success/e/apply-animal-behavior-and-offspring-success', question: { prompt: 'Briefly explain the main idea of: Apply: animal behavior and offspring success.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Plant reproductive success',
          items: [
            { label: 'Plant reproductive success', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:plant-reproductive-success/v/ms-plant-reproductive-success' },
            { label: 'Key points: Plant reproductive success', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:plant-reproductive-success/a/plant-reproductive-success' },
            { label: 'Understand: plant reproductive success', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:plant-reproductive-success/e/understand-plant-reproductive-success', question: { prompt: 'True or False: Sexual reproduction produces offspring genetically identical to the parents.', answer: 'False', explanation: 'Sexual reproduction mixes genes from two parents.' } },
            { label: 'Apply: plant reproductive success', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:plant-reproductive-success/e/apply-plant-reproductive-success', question: { prompt: 'True or False: Sexual reproduction produces offspring genetically identical to the parents.', answer: 'False', explanation: 'Sexual reproduction mixes genes from two parents.' } },
          ],
        },
        {
          name: 'Organism growth and the environment',
          items: [
            { label: 'Organism growth and the environment', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:organism-growth-and-the-environment/v/ms-organism-growth-and-the-environment' },
            { label: 'Apply: organism growth and the environment', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:organism-growth-and-the-environment/e/apply-organism-growth-and-the-environment', question: { prompt: 'Briefly explain the main idea of: Apply: organism growth and the environment.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Activity: What causes harmful algae blooms?',
          items: [
            { label: 'Activity: What causes harmful algae blooms?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:organism-growth-and-reproduction/x0c5bb03129646fd6:activity-what-causes-harmful-algae-blooms/a/activty-what-causes-harmful-algae-blooms' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Matter and energy in organisms',
      lessons: [
        {
          name: 'Photosynthesis in organisms',
          items: [
            { label: 'Photosynthesis in organisms', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:photosynthesis-in-organisms/v/ms-photosynthesis-in-organisms' },
            { label: 'Key points: Photosynthesis in organisms', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:photosynthesis-in-organisms/a/photosynthesis-in-organisms' },
            { label: 'Understand: photosynthesis in organisms', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:photosynthesis-in-organisms/e/understand-photosynthesis-in-organisms', question: { prompt: 'What two raw materials do plants use during photosynthesis?', answer: 'Carbon dioxide and water', explanation: 'Sunlight provides the energy that converts CO2 + water into glucose and oxygen.' } },
            { label: 'Apply: photosynthesis in organisms', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:photosynthesis-in-organisms/e/apply-photosynthesis-in-organisms', question: { prompt: 'What two raw materials do plants use during photosynthesis?', answer: 'Carbon dioxide and water', explanation: 'Sunlight provides the energy that converts CO2 + water into glucose and oxygen.' } },
          ],
        },
        {
          name: 'Food and energy in organisms',
          items: [
            { label: 'Food and energy in organisms', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:food-and-energy-in-organisms/v/food-and-energy-in-organisms-ms' },
            { label: 'Key points: Food and energy in organisms', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:food-and-energy-in-organisms/a/food-and-energy-in-organisms' },
            { label: 'Cellular respiration', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:food-and-energy-in-organisms/v/cellular-respiration-ms' },
            { label: 'Understand: food and energy in organisms', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:food-and-energy-in-organisms/e/understand-food-and-energy-in-organisms', question: { prompt: 'Briefly explain the main idea of: Understand: food and energy in organisms.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
            { label: 'Apply: food and energy in organisms', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:food-and-energy-in-organisms/e/apply-food-and-energy-in-organisms', question: { prompt: 'Briefly explain the main idea of: Apply: food and energy in organisms.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Activity: How can measuring cellular respiration help us reach a fitness goal?',
          items: [
            { label: 'Activity: How can measuring cellular respiration help us reach a fitness goal?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-organisms/x0c5bb03129646fd6:unit-3-phenomenon-based-activities/a/activity-how-can-measuring-cellular-respiration-help-us-reach-a-fitness-goal' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Interactions in ecosystems',
      lessons: [
        {
          name: 'Populations, communities, and ecosystems',
          items: [
            { label: 'Populations, communities, and ecosystems', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:populations-communities-and-ecosystems/v/ms-populations-communities-and-ecosystems' },
            { label: 'Apply: populations, communities, and ecosystems', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:populations-communities-and-ecosystems/e/apply-populations-communities-and-ecosystems', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
          ],
        },
        {
          name: 'Resources and population growth',
          items: [
            { label: 'Resources and population growth', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:resources-and-population-growth/v/ms-resources-and-population-growth' },
            { label: 'Key points: Resources and population growth', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:resources-and-population-growth/a/resources-and-population-growth' },
            { label: 'Understand: Resources and population growth', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:resources-and-population-growth/e/understand-resources-and-population-growth', question: { prompt: 'Briefly explain the main idea of: Understand: Resources and population growth.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
            { label: 'Apply: Resources and population growth', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:resources-and-population-growth/e/apply-resources-and-population-growth', question: { prompt: 'Briefly explain the main idea of: Apply: Resources and population growth.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Ecological interactions',
          items: [
            { label: 'Competition, predation, and mutualism', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:ecological-interactions/v/competition-predation-and-mutualism' },
            { label: 'Competitive, predatory, and mutualistic interactions', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:ecological-interactions/a/competitive-predatory-and-mutualistic-interactions' },
            { label: 'Understand: ecological interactions', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:ecological-interactions/e/understand-ecological-interactions', question: { prompt: 'Briefly explain the main idea of: Understand: ecological interactions.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
            { label: 'Apply: ecological interactions', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:ecological-interactions/e/apply-ecological-interactions', question: { prompt: 'Briefly explain the main idea of: Apply: ecological interactions.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Activity: How do limited resources impact populations that live near us?',
          items: [
            { label: 'Activity: How do limited resources impact populations that live near us?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:interactions-in-ecosystems/x0c5bb03129646fd6:activity-how-do-limited-resources-impact-populations-that-live-near-us/a/activity-how-do-limited-resources-impact-populations-that-live-near-us' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Matter and energy in ecosystems',
      lessons: [
        {
          name: 'Photosynthesis in ecosystems',
          items: [
            { label: 'Photosynthesis in ecosystems', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:photosynthesis-in-ecosystems/v/photosynthesis-in-ecosystems-ms' },
            { label: 'Understand: photosynthesis in ecosystems', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:photosynthesis-in-ecosystems/e/understand-photosynthesis-in-ecosystems', question: { prompt: 'What two raw materials do plants use during photosynthesis?', answer: 'Carbon dioxide and water', explanation: 'Sunlight provides the energy that converts CO2 + water into glucose and oxygen.' } },
          ],
        },
        {
          name: 'Matter and energy in foodwebs',
          items: [
            { label: 'Matter and energy in food webs', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:matter-and-energy-in-foodwebs/v/matter-and-energy-in-food-webs-ms' },
            { label: 'Worked example: Analyzing an ocean food web', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:matter-and-energy-in-foodwebs/v/worked-example-analyzing-an-ocean-food-web' },
            { label: 'Worked example: Analyzing a generic food web', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:matter-and-energy-in-foodwebs/v/worked-example-analyzing-a-generic-food-web' },
            { label: 'Understand: Matter and energy in food webs', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:matter-and-energy-in-foodwebs/e/understand-matter-and-energy-in-food-webs', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
            { label: 'Apply: Matter and energy in food webs', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:matter-and-energy-in-foodwebs/e/apply-matter-and-energy-in-food-webs', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
          ],
        },
        {
          name: 'Activity: What happens when a food web is disturbed?',
          items: [
            { label: 'Activity: What happens when a food web is disturbed?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:matter-and-energy-in-ecosystems/x0c5bb03129646fd6:unit-5-phenomenon-based-activities/a/activity-what-happens-when-a-food-web-is-disturbed' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Ecosystems and biodiversity',
      lessons: [
        {
          name: 'Ecosystem dynamics',
          items: [
            { label: 'Ecosystem dynamics: Clark\'s nutcrackers and the white bark pine', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:ecosystem-dynamics/v/ecosystem-dynamics-clarks-nutcrackers-and-the-white-bark-pine' },
            { label: 'Ecosystem dynamics', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:ecosystem-dynamics/a/ecosystem-dynamics' },
            { label: 'Understand: ecosystem dynamics', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:ecosystem-dynamics/e/understand-ecosystem-dynamics', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
            { label: 'Apply: ecosystem dynamics', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:ecosystem-dynamics/e/apply-ecosystem-dynamics', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
          ],
        },
        {
          name: 'Biodiversity and ecosystem health',
          items: [
            { label: 'Biodiversity and ecosystem health: a Hawaiian Islands case study', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:biodiversity-and-ecosystem-health/v/biodiversity-and-ecosystem-health-a-hawaiian-islands-case-study' },
            { label: 'Biodiversity and ecosystem health', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:biodiversity-and-ecosystem-health/a/biodiversity-and-ecosystem-health' },
            { label: 'Understand: biodiversity and ecosystem health', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:biodiversity-and-ecosystem-health/e/understand-biodiversity-and-ecosystem-health', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
          ],
        },
        {
          name: 'Activity: What evidence can scientists use to tell if an ecosystem is healthy?',
          items: [
            { label: 'Activity: What evidence can scientists use to tell if an ecosystem is healthy?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:activity-what-evidence-can-scientists-use-to-tell-if-an-ecosystem-is-healthy/a/activity-what-evidence-can-scientists-use-to-tell-if-an-ecosystem-is-healthy' },
          ],
        },
        {
          name: 'Humans and ecosystems',
          items: [
            { label: 'Humans and ecosystems: how do vultures provide ecosystem services?', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:humans-and-ecosystems/v/humans-and-ecosystems-how-do-vultures-provide-ecosystem-services' },
            { label: 'Humans and ecosystems', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:humans-and-ecosystems/a/humans-and-ecosystems' },
            { label: 'Understand: humans and ecosystems', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:humans-and-ecosystems/e/understand-humans-and-ecosystems', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
            { label: 'Apply: humans and ecosystems', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:ecosystems-and-biodiversity/x0c5bb03129646fd6:humans-and-ecosystems/e/apply-humans-and-ecosystems', question: { prompt: 'In a food chain, where does the energy originally come from?', answer: 'The Sun', explanation: 'Producers capture sunlight and pass that energy along when consumed.' } },
          ],
        },
      ],
    },
    {
      name: 'Biology - Inheritance and variation',
      lessons: [
        {
          name: 'Chromosomes',
          items: [
            { label: 'Chromosomes and genes', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:chromosomes/v/chromosomes-and-genes' },
            { label: 'Chromosome pairs', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:chromosomes/v/chromosome-pairs' },
            { label: 'Understand: chromosomes', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:chromosomes/e/understand-chromosomes', question: { prompt: 'Briefly explain the main idea of: Understand: chromosomes.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
            { label: 'Apply: chromosomes', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:chromosomes/e/apply-chromosomes', question: { prompt: 'Briefly explain the main idea of: Apply: chromosomes.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Genes, proteins, and traits',
          items: [
            { label: 'Genes, proteins, and traits', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:genes-proteins-and-traits/v/genes-proteins-and-traits' },
            { label: 'Understand: genes, proteins, and traits', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:genes-proteins-and-traits/e/understand-genes-proteins-and-traits', question: { prompt: 'What molecule carries genetic information in living cells?', answer: 'DNA', explanation: 'DNA stores instructions for building proteins.' } },
          ],
        },
        {
          name: 'Mutations',
          items: [
            { label: 'Mutations', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:mutations/v/mutations' },
            { label: 'Apply: mutations', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:mutations/e/apply-mutations', question: { prompt: 'Briefly explain the main idea of: Apply: mutations.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Activity: Why do some mutations cause genetic disorders?',
          items: [
            { label: 'Activity: Why do some mutations cause genetic disorders?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:unit-7-phenomenon-based-activities/a/activity-why-do-some-mutations-cause-genetic-disorders' },
          ],
        },
        {
          name: 'Reproduction and genetic variation',
          items: [
            { label: 'Sexual reproduction and genetic variation', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/v/sexual-reproduction-and-genetic-variation' },
            { label: 'Genetics vocabulary', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/v/genetics-vocabulary' },
            { label: 'Worked examples: Punnett squares', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/v/worked-examples-punnett-squares' },
            { label: 'Genetics vocabulary and Punnett squares', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/a/genetics-vocabulary-and-punnett-squares' },
            { label: 'Understand: sexual reproduction and genetic variation', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/e/understand-sexual-reproduction-and-genetic-variation', question: { prompt: 'What molecule carries genetic information in living cells?', answer: 'DNA', explanation: 'DNA stores instructions for building proteins.' } },
            { label: 'Apply: genetics vocabulary', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/e/apply-genetics-vocabulary', question: { prompt: 'What molecule carries genetic information in living cells?', answer: 'DNA', explanation: 'DNA stores instructions for building proteins.' } },
            { label: 'Apply: Punnett squares', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:reproduction-and-genetic-variation/e/apply-punnett-squares', question: { prompt: 'Briefly explain the main idea of: Apply: Punnett squares.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Activity: Why do puppies in the same litter look different?',
          items: [
            { label: 'Activity: Why do puppies in the same litter look different?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:inheritance-and-variation/x0c5bb03129646fd6:activity-why-do-puppies-in-the-same-litter-look-different/a/activity-why-do-puppies-in-the-same-litter-look-different' },
          ],
        },
      ],
    },
    {
      name: 'Biology - Evolution',
      lessons: [
        {
          name: 'Evolution and common ancestry',
          items: [
            { label: 'Evolution', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evolution-and-common-ancestry/v/evolution' },
            { label: 'Common ancestry and evolutionary trees', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evolution-and-common-ancestry/v/evolutionary-trees' },
            { label: 'Understand: evolution and common ancestry', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evolution-and-common-ancestry/e/understand-evolution-and-common-ancestry', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
            { label: 'Apply: evolutionary trees', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evolution-and-common-ancestry/e/apply-evolutionary-trees', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
          ],
        },
        {
          name: 'The fossil record',
          items: [
            { label: 'Fossils', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:the-fossil-record/v/fossils' },
            { label: 'Earth\'s fossil record', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:the-fossil-record/v/earth-s-fossil-record' },
            { label: 'Understand: the fossil record', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:the-fossil-record/e/understand-the-fossil-record', question: { prompt: 'Briefly explain the main idea of: Understand: the fossil record.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
            { label: 'Apply: the fossil record', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:the-fossil-record/e/apply-the-fossil-record', question: { prompt: 'Briefly explain the main idea of: Apply: the fossil record.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Evidence of evolution: anatomy',
          items: [
            { label: 'Evidence of evolution: anatomy', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evidence-of-evolution-anatomy/v/evidence-of-evolution-anatomy' },
            { label: 'Understand: anatomical evidence of evolution', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evidence-of-evolution-anatomy/e/understand-anatomical-evidence-of-evolution', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
            { label: 'Apply: anatomical evidence of evolution', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evidence-of-evolution-anatomy/e/apply-anatomical-evidence-of-evolution', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
          ],
        },
        {
          name: 'Activity: How can we use skeletons and fossils to understand whale evolution?',
          items: [
            { label: 'Activity: How can we use skeletons and fossils to understand whale evolution?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:activity-how-can-we-use-skeletons-and-fossils-to-understand-whale-evolution/a/activity-how-can-we-use-skeletons-and-fossils-to-understand-whale-evolution' },
          ],
        },
        {
          name: 'Evidence of evolution: embryology',
          items: [
            { label: 'Evidence of evolution: embryology', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evidence-of-evolution-embryology/v/evidence-of-evolution-embryology' },
            { label: 'Apply: embryology and evolution', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:evolution/x0c5bb03129646fd6:evidence-of-evolution-embryology/e/apply-embryology-and-evolution', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
          ],
        },
      ],
    },
    {
      name: 'Biology - Natural and artificial selection',
      lessons: [
        {
          name: 'Natural selection',
          items: [
            { label: 'Natural selection in peppered moths', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:natural-selection/v/natural-selection-in-peppered-moths' },
            { label: 'Key points: Natural selection', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:natural-selection/a/natural-selection' },
            { label: 'Understand: natural selection', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:natural-selection/e/understand-natural-selection-ms', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
          ],
        },
        {
          name: 'Adaptation and environmental change',
          items: [
            { label: 'Environmental change and adaptation in Galápagos finches', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:adaptation-and-environmental-change/v/environmental-change-and-adaptation-in-galapagos-finches' },
            { label: 'Adaptation and environmental change', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:adaptation-and-environmental-change/a/adaptation-and-environmental-change' },
            { label: 'PhET simulation: Explore natural selection', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:adaptation-and-environmental-change/a/phet-simulation-article-exploring-natural-selection' },
            { label: 'Apply: adaptation and environmental change', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:adaptation-and-environmental-change/e/apply-adaptation-and-environmental-change', question: { prompt: 'Briefly explain the main idea of: Apply: adaptation and environmental change.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
        {
          name: 'Artificial selection',
          items: [
            { label: 'Artificial selection and domestication', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:artificial-selection/v/artificial-selection-and-domestication' },
            { label: 'Key points: Artificial selection', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:artificial-selection/a/artificial-selection' },
            { label: 'Understand: Artificial selection', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:natural-and-artificial-selection/x0c5bb03129646fd6:artificial-selection/e/understand-artificial-selection', question: { prompt: 'Briefly explain the main idea of: Understand: Artificial selection.', answer: 'A short answer that names the key concept and gives one supporting detail.', explanation: 'Use the lesson video as a guide.' } },
          ],
        },
      ],
    },
    {
      name: 'Biology - Explore biology through simulations',
      lessons: [
        {
          name: 'Introduction to simulation-based learning',
          items: [
            { label: 'Introduction to simulation-based exercises', type: 'video', href: '/science/ms-biology/x0c5bb03129646fd6:explore-biology-through-simulations-ms-bio/x0c5bb03129646fd6:introduction-to-simulation-based-learning/v/introduction-to-simulation-based-exercises' },
            { label: 'Introduction to simulation-based learning', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:explore-biology-through-simulations-ms-bio/x0c5bb03129646fd6:introduction-to-simulation-based-learning/a/introduction-to-simulation-based-learning' },
          ],
        },
        {
          name: 'Explore natural selection through simulations',
          items: [
            { label: 'PhET simulation: Explore natural selection', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:explore-biology-through-simulations-ms-bio/x0c5bb03129646fd6:explore-natural-selection-through-simulations/a/phet-simulation-article-exploring-natural-selection' },
            { label: 'PhET challenge: Natural selection', type: 'exercise', href: '/science/ms-biology/x0c5bb03129646fd6:explore-biology-through-simulations-ms-bio/x0c5bb03129646fd6:explore-natural-selection-through-simulations/e/phet-simulation-exploring-natural-selection-ms-bio', question: { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', explanation: 'Darwin published On the Origin of Species in 1859.' } },
          ],
        },
      ],
    },
    {
      name: 'Biology - Teacher resources',
      lessons: [
        {
          name: 'Unit guides',
          items: [
            { label: 'How to use our NGSS-aligned unit guides', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:unit-guides/a/how-to-use-our-ngss-aligned-unit-guides' },
            { label: 'Middle school biology unit guides', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:unit-guides/a/ngss-ms-biology-unit-guides' },
          ],
        },
        {
          name: 'Hands-on biology activities',
          items: [
            { label: 'Introduction to hands-on science activities', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/introduction-to-hands-on-science-activities' },
            { label: 'Activity: Why do plants wilt when they don\'t get enough water?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-why-do-plants-wilt-when-they-don-t-get-enough-water' },
            { label: 'Activity: What causes harmful algae blooms?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activty-what-causes-harmful-algae-blooms' },
            { label: 'Activity: How can measuring cellular respiration help us reach a fitness goal?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-how-can-measuring-cellular-respiration-help-us-reach-a-fitness-goal' },
            { label: 'Activity: How do limited resources impact populations that live near us?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-how-do-limited-resources-impact-populations-that-live-near-us' },
            { label: 'Activity: What happens when a food web is disturbed?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-what-happens-when-a-food-web-is-disturbed' },
            { label: 'Activity: What evidence can scientists use to tell if an ecosystem is healthy?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-what-evidence-can-scientists-use-to-tell-if-an-ecosystem-is-healthy' },
            { label: 'Activity: Why do some mutations cause genetic disorders?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-why-do-some-mutations-cause-genetic-disorders' },
            { label: 'Activity: Why do puppies in the same litter look different?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-why-do-puppies-in-the-same-litter-look-different' },
            { label: 'Activity: How can we use skeletons and fossils to understand whale evolution?', type: 'article', href: '/science/ms-biology/x0c5bb03129646fd6:teacher-resources/x0c5bb03129646fd6:hands-on-biology-activities/a/activity-how-can-we-use-skeletons-and-fossils-to-understand-whale-evolution' },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Classifying matter',
      lessons: [
        {
          name: 'Introduction to middle school chemistry',
          items: [
            { label: 'Introduction to middle school chemistry', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:intro-to-ms-chemistry/v/introduction-to-middle-school-chemistry' },
          ],
        },
        {
          name: 'Elements and atoms',
          items: [
            { label: 'Elements', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/v/elements' },
            { label: 'Atoms', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/v/atoms' },
            { label: 'Understand: elements and atoms', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/e/understand-elements-and-atoms', question: { prompt: 'What is the chemical symbol for sodium?', answer: 'Na', explanation: 'From its Latin name, natrium.' } },
            { label: 'The periodic table', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/v/the-periodic-table' },
            { label: 'Learn and try: Elements, atoms, and the periodic table', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/a/elements-atoms-and-the-periodic-table' },
            { label: 'Understand: the periodic table', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/e/understand-the-periodic-table', question: { prompt: 'What does the atomic number of an element equal?', answer: 'The number of protons', explanation: 'It also equals electrons in a neutral atom.' } },
            { label: 'Apply: the periodic table', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:elements-and-atoms/e/apply-periodic-table', question: { prompt: 'What does the atomic number of an element equal?', answer: 'The number of protons', explanation: 'It also equals electrons in a neutral atom.' } },
          ],
        },
        {
          name: 'Compounds',
          items: [
            { label: 'Compounds and chemical formulas', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:compounds/v/compounds-and-chemical-formulas' },
            { label: 'Molecules, crystals, and diatomic elements', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:compounds/v/molecules-crystals-and-diatomic-elements' },
            { label: 'Molecules, compounds, and chemical formulas', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:compounds/a/compounds-and-chemical-formulas' },
            { label: 'Understand: compounds and chemical formulas', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:compounds/e/understand-compounds-and-chemical-formulas', question: { prompt: 'How many atoms total are in one molecule of water (H2O)?', answer: '3 atoms (2 hydrogen, 1 oxygen)', explanation: 'Subscripts in formulas count atoms.' } },
            { label: 'Apply: compounds and chemical formulas', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:compounds/e/apply-compounds-and-chemical-formulas', question: { prompt: 'How many atoms total are in one molecule of water (H2O)?', answer: '3 atoms (2 hydrogen, 1 oxygen)', explanation: 'Subscripts in formulas count atoms.' } },
          ],
        },
        {
          name: 'Mixtures',
          items: [
            { label: 'Types of mixtures', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:mixtures/v/types-of-mixtures-ms' },
            { label: 'Properties of homogeneous mixtures', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:mixtures/v/properties-of-homogeneous-mixtures' },
            { label: 'Mixtures', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:mixtures/a/mixtures' },
            { label: 'Understand: mixtures', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:mixtures/e/understand-mixtures', question: { prompt: 'In salt water, what is the solute and what is the solvent?', answer: 'Salt is the solute; water is the solvent.', explanation: 'The solute dissolves into the solvent.' } },
            { label: 'Apply: mixtures', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:classifying-matter/xc370bc422b7f75fc:mixtures/e/apply-mixtures', question: { prompt: 'In salt water, what is the solute and what is the solvent?', answer: 'Salt is the solute; water is the solvent.', explanation: 'The solute dissolves into the solvent.' } },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Physical properties of matter',
      lessons: [
        {
          name: 'Intrinsic and extrinsic properties',
          items: [
            { label: 'Physical properties', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/v/physical-properties' },
            { label: 'Understand: physical properties and changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/e/understand-physical-properties-extrinsic-intrinsic', question: { prompt: 'True or False: Melting ice is a chemical change.', answer: 'False', explanation: 'Melting changes state but not the substance, so it is physical.' } },
            { label: 'Physical changes', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/v/physical-changes' },
            { label: 'Learn and try: Physical properties and changes', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/a/physical-properties-and-changes' },
            { label: 'Apply: physical properties and changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/e/apply-physical-properties-changes', question: { prompt: 'True or False: Melting ice is a chemical change.', answer: 'False', explanation: 'Melting changes state but not the substance, so it is physical.' } },
            { label: 'Temperature and Celsius', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/v/temperature-and-celsius' },
            { label: 'Temperature', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/a/temperature' },
            { label: 'Understand: temperature', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:intrinsic-and-extrinsic-properties/e/understand-temperature', question: { prompt: 'True or False: Temperature measures the average kinetic energy of particles.', answer: 'True', explanation: 'Hotter substances have faster-moving particles.' } },
          ],
        },
        {
          name: 'States of matter and phase changes',
          items: [
            { label: 'States of matter', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/v/states-of-matter-ms' },
            { label: 'Phase changes', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/v/phase-changes' },
            { label: 'States of matter and phase changes', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/a/states-of-matter-and-phase-changes' },
            { label: 'Understand: states of matter', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/e/understand-states-of-matter', question: { prompt: 'Name the three common states of matter.', answer: 'Solid, liquid, gas', explanation: 'Plasma is a fourth state.' } },
            { label: 'Understand: phase changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/e/understand-phase-changes', question: { prompt: 'On the pH scale, what number is neutral?', answer: '7', explanation: 'Below 7 is acidic, above 7 is basic.' } },
            { label: 'Apply: phase changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:states-of-matter-and-phase-changes/e/apply-phase-changes', question: { prompt: 'On the pH scale, what number is neutral?', answer: '7', explanation: 'Below 7 is acidic, above 7 is basic.' } },
          ],
        },
        {
          name: 'Density',
          items: [
            { label: 'Density (conceptual)', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:density/v/density-conceptual' },
            { label: 'Density equation', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:density/v/density-equation' },
            { label: 'Density', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:density/a/density' },
            { label: 'Understand: density', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:density/e/understand-density', question: { prompt: 'A 20 g object has a volume of 4 cm3. What is its density?', answer: '5 g/cm3', explanation: 'Density = mass / volume.' } },
            { label: 'Apply: density', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:physical-properties-of-matter/xc370bc422b7f75fc:density/e/apply-density', question: { prompt: 'A 20 g object has a volume of 4 cm3. What is its density?', answer: '5 g/cm3', explanation: 'Density = mass / volume.' } },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Chemical changes',
      lessons: [
        {
          name: 'Chemical changes',
          items: [
            { label: 'Chemical changes', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-changes-ms/v/chemical-changes' },
            { label: 'Learn and try: Chemical properties and changes', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-changes-ms/a/chemical-properties-and-changes' },
            { label: 'Understand: chemical changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-changes-ms/e/understand-chemical-changes', question: { prompt: 'Give one sign that a chemical reaction has occurred.', answer: 'A new substance forms (e.g. gas, color change, temperature change)', explanation: 'These signal a different chemical identity.' } },
            { label: 'Apply: chemical changes', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-changes-ms/e/apply-chemical-changes', question: { prompt: 'Give one sign that a chemical reaction has occurred.', answer: 'A new substance forms (e.g. gas, color change, temperature change)', explanation: 'These signal a different chemical identity.' } },
          ],
        },
        {
          name: 'Chemical reactions',
          items: [
            { label: 'Chemical reactions', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/v/chemical-reactions' },
            { label: 'Chemical equations', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/v/chemical-equations' },
            { label: 'Understand: chemical equations', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/e/understand-chemical-equations', question: { prompt: 'Give a one-sentence definition for: Understand: chemical equations.', answer: 'A short, clear definition naming the key idea.', explanation: 'Refer to the related video or article.' } },
            { label: 'Apply: chemical equations', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/e/apply-chemical-equations', question: { prompt: 'Give a one-sentence definition for: Apply: chemical equations.', answer: 'A short, clear definition naming the key idea.', explanation: 'Refer to the related video or article.' } },
            { label: 'Worked examples: Balancing chemical equations', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/v/worked-examples-balancing-chemical-equations' },
            { label: 'Worked examples: Balancing more complex chemical equations', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/v/worked-examples-balancing-more-complex-chemical-equations' },
            { label: 'Balancing chemical equations', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/a/balancing-chemical-equations' },
            { label: 'Apply: balancing chemical equations', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:chemical-reactions/e/apply-balancing-chemical-equations', question: { prompt: 'Give a one-sentence definition for: Apply: balancing chemical equations.', answer: 'A short, clear definition naming the key idea.', explanation: 'Refer to the related video or article.' } },
          ],
        },
        {
          name: 'Energy changes in chemical reactions',
          items: [
            { label: 'Energy changes in chemical reactions (part 1)', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:energy-changes-in-chemical-reactions/v/energy-changes-in-chemical-reactions-part-1' },
            { label: 'Energy changes in chemical reactions (part 2)', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:energy-changes-in-chemical-reactions/v/energy-changes-in-chemical-reactions-part-2' },
            { label: 'Understand: energy changes in chemical reactions', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:energy-changes-in-chemical-reactions/e/understand-energy-changes-in-chemical-reactions', question: { prompt: 'Give one sign that a chemical reaction has occurred.', answer: 'A new substance forms (e.g. gas, color change, temperature change)', explanation: 'These signal a different chemical identity.' } },
            { label: 'Apply: energy changes in chemical reactions', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:chemical-changes/xc370bc422b7f75fc:energy-changes-in-chemical-reactions/e/apply-energy-changes-in-chemical-reactions', question: { prompt: 'Give one sign that a chemical reaction has occurred.', answer: 'A new substance forms (e.g. gas, color change, temperature change)', explanation: 'These signal a different chemical identity.' } },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Thermal energy and heat',
      lessons: [
        {
          name: 'Temperature and heat',
          items: [
            { label: 'Thermal energy and heat transfer', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:thermal-energy-and-heat/xc370bc422b7f75fc:temperature-and-heat/v/thermal-energy-and-heat-transfer' },
            { label: 'Apply: temperature and heat', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:thermal-energy-and-heat/xc370bc422b7f75fc:temperature-and-heat/e/apply-temperature-and-heat', question: { prompt: 'True or False: Temperature measures the average kinetic energy of particles.', answer: 'True', explanation: 'Hotter substances have faster-moving particles.' } },
          ],
        },
        {
          name: 'Heat capacity',
          items: [
            { label: 'Heat capacity', type: 'video', href: '/science/ms-chemistry/xc370bc422b7f75fc:thermal-energy-and-heat/xc370bc422b7f75fc:heat-capacity/v/heat-capacity-ms' },
            { label: 'Understand: heat capacity', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:thermal-energy-and-heat/xc370bc422b7f75fc:heat-capacity/e/understand-heat-capacity-ms', question: { prompt: 'True or False: Temperature measures the average kinetic energy of particles.', answer: 'True', explanation: 'Hotter substances have faster-moving particles.' } },
            { label: 'Apply: heat capacity', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:thermal-energy-and-heat/xc370bc422b7f75fc:heat-capacity/e/apply-heat-capacity-ms', question: { prompt: 'True or False: Temperature measures the average kinetic energy of particles.', answer: 'True', explanation: 'Hotter substances have faster-moving particles.' } },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Explore chemistry through simulations',
      lessons: [
        {
          name: 'Introduction to simulation-based learning',
          items: [
            { label: 'Introduction to simulation-based learning', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:explore-chemistry-through-simulations/xc370bc422b7f75fc:introduction-to-simulation-based-learning/a/introduction-to-simulation-based-learning' },
          ],
        },
        {
          name: 'Explore heat capacity through simulations',
          items: [
            { label: 'Heat capacity', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:explore-chemistry-through-simulations/xc370bc422b7f75fc:explore-heat-capacity-through-simulations/a/heat-capacity' },
            { label: 'PhET challenge: Heat capacity', type: 'exercise', href: '/science/ms-chemistry/xc370bc422b7f75fc:explore-chemistry-through-simulations/xc370bc422b7f75fc:explore-heat-capacity-through-simulations/e/phet-challenge-heat-capacity', question: { prompt: 'On the pH scale, what number is neutral?', answer: '7', explanation: 'Below 7 is acidic, above 7 is basic.' } },
          ],
        },
      ],
    },
    {
      name: 'Chemistry - Teacher resources',
      lessons: [
        {
          name: 'Unit guides',
          items: [
            { label: 'How to use our NGSS-aligned unit guides', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:teacher-resources/xc370bc422b7f75fc:unit-guides/a/how-to-use-our-ngss-aligned-unit-guides' },
            { label: 'Middle school chemistry unit guides', type: 'article', href: '/science/ms-chemistry/xc370bc422b7f75fc:teacher-resources/xc370bc422b7f75fc:unit-guides/a/middle-school-chemistry-unit-guides' },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - Earth in space',
      lessons: [
        {
          name: 'Earth\'s place in the universe',
          items: [
            { label: 'Introduction to Middle school Earth and space science', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:earths-place-in-the-universe/v/introduction-to-middle-school-earth-and-space-science' },
            { label: 'Earth\'s place in the universe', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:earths-place-in-the-universe/v/earths-place-in-the-universe' },
            { label: 'Earth’s place in the universe', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:earths-place-in-the-universe/a/earths-place-in-the-universe' },
            { label: 'Understand: Earth\'s place in the universe', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:earths-place-in-the-universe/e/understand-earths-place-in-the-universe', question: { prompt: 'Which galaxy do we live in?', answer: 'The Milky Way', explanation: 'It is a spiral galaxy with hundreds of billions of stars.' } },
          ],
        },
        {
          name: 'Galaxies and gravity',
          items: [
            { label: 'Galaxies and gravity', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:galaxies-and-gravity/v/galaxies-and-gravity' },
            { label: 'Understand: galaxies and gravity', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:galaxies-and-gravity/e/understand-galaxies-and-gravity', question: { prompt: 'Which galaxy do we live in?', answer: 'The Milky Way', explanation: 'It is a spiral galaxy with hundreds of billions of stars.' } },
            { label: 'Apply: galaxies and gravity', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:galaxies-and-gravity/e/apply-galaxies-and-gravity', question: { prompt: 'Which galaxy do we live in?', answer: 'The Milky Way', explanation: 'It is a spiral galaxy with hundreds of billions of stars.' } },
          ],
        },
        {
          name: 'The solar system',
          items: [
            { label: 'The solar system', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:the-solar-system/v/the-solar-system-ms' },
            { label: 'Understand: the solar system', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-in-space/x87d03b443efbea0a:the-solar-system/e/understand-the-solar-system', question: { prompt: 'How many planets are in our solar system?', answer: '8', explanation: 'Pluto was reclassified as a dwarf planet in 2006.' } },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - The Earth-sun-moon system',
      lessons: [
        {
          name: 'Seasons',
          items: [
            { label: 'Seasons', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:seasons/v/seasons-ms' },
            { label: 'Understand: seasons', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:seasons/e/understand-seasons', question: { prompt: 'In one sentence, what is the main idea of: Understand: seasons?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'The moon and its motions',
          items: [
            { label: 'Phases of the moon', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:the-moon-and-its-motions/v/phases-of-the-moon' },
            { label: 'Lunar eclipses', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:the-moon-and-its-motions/v/lunar-eclipses' },
            { label: 'The moon and its motions', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:the-moon-and-its-motions/a/the-moon-and-its-motions' },
            { label: 'Understand: the moon and its motions', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:the-moon-and-its-motions/e/understand-the-moon-and-its-motions', question: { prompt: 'A solar eclipse occurs when which body is in the middle?', answer: 'The Moon (between Sun and Earth)', explanation: 'The Moon\'s shadow falls on Earth.' } },
            { label: 'Apply: the moon and its motions', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:the-moon-and-its-motions/e/apply-the-moon-and-its-motions', question: { prompt: 'A solar eclipse occurs when which body is in the middle?', answer: 'The Moon (between Sun and Earth)', explanation: 'The Moon\'s shadow falls on Earth.' } },
          ],
        },
        {
          name: 'Solar eclipses',
          items: [
            { label: 'Solar eclipses', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:solar-eclipses/v/solar-eclipses' },
            { label: 'Understand: solar eclipses', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:solar-eclipses/e/understand-solar-eclipses', question: { prompt: 'A solar eclipse occurs when which body is in the middle?', answer: 'The Moon (between Sun and Earth)', explanation: 'The Moon\'s shadow falls on Earth.' } },
          ],
        },
        {
          name: 'Activity: What happens during a solar or lunar eclipse?',
          items: [
            { label: 'Activity: What happens during a solar or lunar eclipse?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-earth-sun-moon-system/x87d03b443efbea0a:unit-2-phenomenon-based-activities/a/activity-what-happens-during-a-solar-or-lunar-eclipse' },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - Weather and climate',
      lessons: [
        {
          name: 'The water cycle',
          items: [
            { label: 'The water cycle', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:the-water-cycle/v/the-water-cycle-ms' },
            { label: 'Understand: the water cycle', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:the-water-cycle/e/understand-the-water-cycle', question: { prompt: 'What is the process by which water vapor turns back into liquid water?', answer: 'Condensation', explanation: 'Evaporation is the reverse process.' } },
          ],
        },
        {
          name: 'Weather',
          items: [
            { label: 'Weather', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:weather/v/weather' },
            { label: 'Understand: weather', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:weather/e/understand-weather', question: { prompt: 'In one sentence, what is the main idea of: Understand: weather?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'Global winds and currents',
          items: [
            { label: 'Global winds and currents', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:global-winds-and-currents/v/global-winds-and-currents' },
            { label: 'Understand: global winds and currents', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:global-winds-and-currents/e/understand-global-winds-and-currents', question: { prompt: 'In one sentence, what is the main idea of: Understand: global winds and currents?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'Regional climates',
          items: [
            { label: 'Regional climates', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:regional-climates/v/regional-climates' },
            { label: 'Apply: regional climates', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:weather-and-climate/x87d03b443efbea0a:regional-climates/e/apply-regional-climates', question: { prompt: 'In one sentence, what is the main idea of: Apply: regional climates?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - The geosphere',
      lessons: [
        {
          name: 'The rock cycle',
          items: [
            { label: 'The rock cycle', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:the-rock-cycle/v/the-rock-cycle' },
            { label: 'Understand: the rock cycle', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:the-rock-cycle/e/understand-the-rock-cycle', question: { prompt: 'Which type of rock forms from cooled magma or lava?', answer: 'Igneous', explanation: 'Sedimentary forms from compressed sediment; metamorphic forms under heat and pressure.' } },
          ],
        },
        {
          name: 'Fossils and rock layers',
          items: [
            { label: 'Fossils and rock layers', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:fossils-and-rock-layers/v/fossils-and-rock-layers' },
            { label: 'Apply: fossils and rock layers', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:fossils-and-rock-layers/e/apply-fossils-and-rock-layers', question: { prompt: 'What can fossils tell scientists about Earth\'s past?', answer: 'What organisms lived and what environments existed long ago.', explanation: 'Fossils preserve ancient life or its traces in rock.' } },
          ],
        },
        {
          name: 'Plate tectonics',
          items: [
            { label: 'Introduction to plate tectonics', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:plate-tectonics/v/introduction-to-plate-tectonics' },
            { label: 'Plate tectonics and the ocean floor', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:plate-tectonics/v/plate-tectonics-the-ocean-floor' },
            { label: 'Understand: plate tectonics', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:plate-tectonics/e/understand-plate-tectonics', question: { prompt: 'What did Alfred Wegener call the ancient supercontinent?', answer: 'Pangaea', explanation: 'Pangaea broke apart over hundreds of millions of years into today\'s continents.' } },
            { label: 'Apply: plate tectonics', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:plate-tectonics/e/apply-plate-tectonics', question: { prompt: 'What did Alfred Wegener call the ancient supercontinent?', answer: 'Pangaea', explanation: 'Pangaea broke apart over hundreds of millions of years into today\'s continents.' } },
          ],
        },
        {
          name: 'Weathering and erosion',
          items: [
            { label: 'Weathering and erosion', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:weathering-and-erosion/v/weathering-and-erosion' },
            { label: 'Understand: weathering and erosion', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:weathering-and-erosion/e/understand-weathering-and-erosion', question: { prompt: 'In one sentence, what is the main idea of: Understand: weathering and erosion?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'Activity: How does weathering affect natural landscapes over time?',
          items: [
            { label: 'Activity: How does weathering affect natural landscapes over time?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:the-geosphere/x87d03b443efbea0a:unit-4-phenomenon-based-activities/a/activity-how-does-weathering-affect-natural-landscapes-over-time' },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - Earth and society',
      lessons: [
        {
          name: 'Natural resources',
          items: [
            { label: 'Natural resources', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:natural-resources/v/natural-resources' },
            { label: 'Understand: natural resources', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:natural-resources/e/understand-natural-resources', question: { prompt: 'Give one human activity that increases atmospheric CO2.', answer: 'Burning fossil fuels (coal, oil, natural gas)', explanation: 'Deforestation also reduces CO2 absorption.' } },
          ],
        },
        {
          name: 'Natural hazards',
          items: [
            { label: 'Natural hazards', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:natural-hazards/v/natural-hazards' },
            { label: 'Apply: natural hazards', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:natural-hazards/e/apply-natural-hazards', question: { prompt: 'In one sentence, what is the main idea of: Apply: natural hazards?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'Human impacts on the environment',
          items: [
            { label: 'Human impacts on the environment', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:human-impacts-on-the-environment/v/human-impacts-on-the-environment' },
            { label: 'Apply: human impacts on the environment', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:human-impacts-on-the-environment/e/apply-human-impacts-on-the-environment', question: { prompt: 'Give one human activity that increases atmospheric CO2.', answer: 'Burning fossil fuels (coal, oil, natural gas)', explanation: 'Deforestation also reduces CO2 absorption.' } },
          ],
        },
        {
          name: 'Activity: How can we reduce our garbage footprint?',
          items: [
            { label: 'Activity: How can we reduce our garbage footprint?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:unit-5-phenomenon-based-activities/a/activity-how-can-we-reduce-our-garbage-footprint' },
          ],
        },
        {
          name: 'Earth\'s changing climate',
          items: [
            { label: 'Earth\'s changing climate', type: 'video', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:earths-changing-climate/v/earths-changing-climate' },
            { label: 'PhET simulation: Explore climate change', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:earths-changing-climate/a/phet-simulation-article-exploring-climate-change' },
            { label: 'Apply: Earth\'s changing climate', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:earths-changing-climate/e/apply-earths-changing-climate', question: { prompt: 'In one sentence, what is the main idea of: Apply: Earth\'s changing climate?', answer: 'A short summary naming the key Earth-science concept.', explanation: 'Use the related video or article for context.' } },
          ],
        },
        {
          name: 'Activity: How and why is Earth\'s climate changing?',
          items: [
            { label: 'Activity: How and why is Earth\'s climate changing?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:earth-and-society/x87d03b443efbea0a:activity-how-and-why-is-earth-s-climate-changing/a/activity-how-and-why-is-earth-s-climate-changing' },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - Explore Earth and space science through simulations',
      lessons: [
        {
          name: 'Introduction to simulation-based learning',
          items: [
            { label: 'Introduction to simulation-based learning', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:explore-earth-and-space-science-through-simulations-ms-ess/x87d03b443efbea0a:introduction-to-simulation-based-learning/a/introduction-to-simulation-based-learning' },
          ],
        },
        {
          name: 'Explore climate change through simulations',
          items: [
            { label: 'PhET simulation: Explore climate change', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:explore-earth-and-space-science-through-simulations-ms-ess/x87d03b443efbea0a:explore-climate-change-through-simulations/a/phet-simulation-article-exploring-climate-change' },
            { label: 'PhET challenge: Climate change', type: 'exercise', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:explore-earth-and-space-science-through-simulations-ms-ess/x87d03b443efbea0a:explore-climate-change-through-simulations/e/phet-simulation-exploring-climate-change-ms-ess', question: { prompt: 'Name one greenhouse gas that traps heat in Earth\'s atmosphere.', answer: 'Carbon dioxide (or methane, water vapor)', explanation: 'These gases re-emit infrared radiation back toward Earth.' } },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space - Teacher resources',
      lessons: [
        {
          name: 'Hands-on Earth and space science activities',
          items: [
            { label: 'Introduction to hands-on science activities', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:teacher-resources/x87d03b443efbea0a:hands-on-earth-space-sci-activities/a/introduction-to-hands-on-science-activities' },
            { label: 'Activity: What happens during a solar or lunar eclipse?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:teacher-resources/x87d03b443efbea0a:hands-on-earth-space-sci-activities/a/activity-what-happens-during-a-solar-or-lunar-eclipse' },
            { label: 'Activity: How does weathering affect natural landscapes over time?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:teacher-resources/x87d03b443efbea0a:hands-on-earth-space-sci-activities/a/activity-how-does-weathering-affect-natural-landscapes-over-time' },
            { label: 'Activity: How can we reduce our garbage footprint?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:teacher-resources/x87d03b443efbea0a:hands-on-earth-space-sci-activities/a/activity-how-can-we-reduce-our-garbage-footprint' },
            { label: 'Activity: How and why is Earth\'s climate changing?', type: 'article', href: '/science/middle-school-earth-and-space-science/x87d03b443efbea0a:teacher-resources/x87d03b443efbea0a:hands-on-earth-space-sci-activities/a/activity-how-and-why-is-earth-s-climate-changing' },
          ],
        },
      ],
    },
  ],
};
