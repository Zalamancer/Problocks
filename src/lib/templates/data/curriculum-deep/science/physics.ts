import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '11',
  label: 'High School Physics',
  sourceUrl: 'https://www.khanacademy.org/science/highschool-physics',
  units: [
    {
      name: 'Motion and forces',
      lessons: [
        {
          name: 'Describing motion',
          items: [
            { label: 'Introduction to high school physics', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/v/introduction-to-high-school-physics' },
            { label: 'Position, velocity, and speed', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/v/position_velocity_speed' },
            { label: 'Acceleration', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/v/intro_to_acceleration' },
            { label: 'Interpreting motion data', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/v/interpreting_motion_data' },
            { label: 'Understand: motion variables', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/e/understand-motion-variables', question: { prompt: 'Solve a quick numerical example related to: Understand: motion variables.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: constant speed motion', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/e/apply-constant-speed-motion', question: { prompt: 'An object travels 60 m in 12 s. What is its average speed?', answer: '5 m/s', explanation: 'speed = distance / time.' } },
            { label: 'Apply: accelerated motion', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/e/apply-accelerated-motion', question: { prompt: 'Solve a quick numerical example related to: Apply: accelerated motion.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Forces',
          items: [
            { label: 'Intro to forces (part 1)', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:forces/v/intro_to_forces_1' },
            { label: 'Intro to forces (part 2)', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:forces/v/intro_to_forces_2' },
            { label: 'Understand: forces', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:forces/e/understand-forces', question: { prompt: 'Solve a quick numerical example related to: Understand: forces.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: free body diagrams', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:forces/e/apply-free-body-diagrams', question: { prompt: 'Solve a quick numerical example related to: Apply: free body diagrams.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: net force', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:forces/e/apply-net-force', question: { prompt: 'Solve a quick numerical example related to: Apply: net force.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Newton\'s first and second laws',
          items: [
            { label: 'Newton\'s first law', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/v/newtons_first_law' },
            { label: 'Newton\'s second law', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/v/newtons_second_law' },
            { label: 'Newton\'s first and second laws', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/a/what-is-newtons-second-law' },
            { label: 'Understand: Newton\'s first and second laws', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/e/understand-newton-s-second-law', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
            { label: 'Apply: Newton\'s first and second laws', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/e/apply-newton-s-second-law', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
            { label: 'Newton\'s second law calculations', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/v/newtons_second_law_calculations' },
            { label: 'Apply: Newton\'s second law calculations', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/e/apply-newton-s-second-law-calculations', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
          ],
        },
        {
          name: 'Activity: How do engineers design strong bridges?',
          items: [
            { label: 'Activity: How do engineers design strong bridges?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:activity-how-do-engineers-design-strong-bridges/a/activity-how-do-engineers-design-strong-bridges' },
          ],
        },
      ],
    },
    {
      name: 'Force pairs and momentum',
      lessons: [
        {
          name: 'Newton\'s third law',
          items: [
            { label: 'Newton\'s third law', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:newtons-third-law/v/newtons_third_law' },
            { label: 'Systems and Newton\'s third law', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:newtons-third-law/a/what-is-newtons-third-law' },
            { label: 'Understand: Newton\'s third law', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:newtons-third-law/e/understand-newton-s-third-law', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
            { label: 'Apply: Newton\'s third law', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:newtons-third-law/e/apply-newton-s-third-law', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
          ],
        },
        {
          name: 'Momentum',
          items: [
            { label: 'Momentum', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:momentum/v/momentum' },
            { label: 'Understand: momentum', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:momentum/e/understand-momentum', question: { prompt: 'A 2.0 kg cart at 3.0 m/s has what momentum?', answer: '6.0 kg·m/s', explanation: 'p = m v = 2.0 x 3.0 = 6.0.' } },
            { label: 'Conservation of momentum', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:momentum/v/conservation_of_momentum' },
            { label: 'Understand: conservation of momentum', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:momentum/e/understand-conservation-momentum', question: { prompt: 'A 2.0 kg cart at 3.0 m/s has what momentum?', answer: '6.0 kg·m/s', explanation: 'p = m v = 2.0 x 3.0 = 6.0.' } },
          ],
        },
        {
          name: 'Impulse',
          items: [
            { label: 'Impulse', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:impulse/v/impulse' },
            { label: 'Understand: impulse', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:impulse/e/understand-impulse', question: { prompt: 'A 2.0 kg cart at 3.0 m/s has what momentum?', answer: '6.0 kg·m/s', explanation: 'p = m v = 2.0 x 3.0 = 6.0.' } },
            { label: 'Apply: impulse', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:impulse/e/apply-impulse', question: { prompt: 'A 2.0 kg cart at 3.0 m/s has what momentum?', answer: '6.0 kg·m/s', explanation: 'p = m v = 2.0 x 3.0 = 6.0.' } },
          ],
        },
        {
          name: 'Activity: How do engineers design safety cushions to save lives?',
          items: [
            { label: 'Activity: How do engineers design safety cushions to save lives?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:force-pairs-and-momentum/x6679aa2c65c01e53:activity-how-do-engineers-design-safety-cushions-to-save-lives/a/activity-how-do-engineers-design-safety-cushions-to-save-lives' },
          ],
        },
      ],
    },
    {
      name: 'Gravitation',
      lessons: [
        {
          name: 'Newton\'s law of gravitation',
          items: [
            { label: 'Newton\'s law of gravitation', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:newtons-law-of-gravitation/v/newtons_law_of_gravitation' },
            { label: 'Understand: Newton\'s law of gravitation', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:newtons-law-of-gravitation/e/understand-newton-s-law-of-gravitation', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
            { label: 'Apply: Newton\'s law of gravitation', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:newtons-law-of-gravitation/e/apply-newton-s-law-of-gravitation', question: { prompt: 'A 5.0 kg object is pushed with 20 N net force. What is its acceleration?', answer: '4.0 m/s2', explanation: 'a = F / m = 20 / 5.0 = 4.0.' } },
          ],
        },
        {
          name: 'Falling objects',
          items: [
            { label: 'Falling objects', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:falling-objects/v/falling_objects' },
            { label: 'Understand: falling objects', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:falling-objects/e/understand-falling-objects', question: { prompt: 'Solve a quick numerical example related to: Understand: falling objects.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Orbital motion',
          items: [
            { label: 'Centripetal force', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:orbital-motion/v/centripetal_force' },
            { label: 'Understand: centripetal force', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:orbital-motion/e/understand-centripetal-force', question: { prompt: 'Centripetal acceleration points in which direction?', answer: 'Toward the center of the circle.', explanation: 'a_c = v^2 / r.' } },
            { label: 'Orbital motion', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:orbital-motion/v/orbital_motion' },
            { label: 'Understand: orbital motion', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:orbital-motion/e/understand-orbital-motion', question: { prompt: 'Solve a quick numerical example related to: Understand: orbital motion.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: orbital motion', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:orbital-motion/e/apply-orbital-motion', question: { prompt: 'Solve a quick numerical example related to: Apply: orbital motion.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Activity: Why is a Neptune year so long?',
          items: [
            { label: 'Activity: Why is a Neptune year so long?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:gravitation/x6679aa2c65c01e53:activity-why-is-a-neptune-year-so-long/a/activity-why-is-a-neptune-year-so-long' },
          ],
        },
      ],
    },
    {
      name: 'Electrostatics',
      lessons: [
        {
          name: 'Coulomb\'s law',
          items: [
            { label: 'Coulomb\'s law', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:coulombs-law/v/coulombs_law' },
            { label: 'Electric fields', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:coulombs-law/v/electric-field-definition' },
            { label: 'Understand: Coulomb\'s law', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:coulombs-law/e/understand-coulombs-law', question: { prompt: 'Solve a quick numerical example related to: Understand: Coulomb\'s law.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: Coulomb\'s law', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:coulombs-law/e/apply-coulombs-law', question: { prompt: 'Solve a quick numerical example related to: Apply: Coulomb\'s law.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Static electricity',
          items: [
            { label: 'Static electricity', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:static-electricity/v/static_electricity' },
            { label: 'Apply: static electricity', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:static-electricity/e/apply-static-electricity', question: { prompt: 'Solve a quick numerical example related to: Apply: static electricity.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Activity: Why do clothes develop static cling in a dryer?',
          items: [
            { label: 'Activity: Why do clothes develop static cling in a dryer?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electrostatics/x6679aa2c65c01e53:activity-why-do-clothes-develop-static-cling-in-a-dryer/a/activity-why-do-clothes-develop-static-cling-in-a-dryer' },
          ],
        },
      ],
    },
    {
      name: 'Energy',
      lessons: [
        {
          name: 'Kinetic and potential energy',
          items: [
            { label: 'Kinetic energy', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:kinetic-and-potential-energy/v/kinetic_energy' },
            { label: 'Apply: kinetic energy', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:kinetic-and-potential-energy/e/apply-kinetic-energy', question: { prompt: 'A 2.0 kg ball moves at 4.0 m/s. What is its kinetic energy?', answer: '16 J', explanation: 'KE = 0.5 m v^2 = 0.5 x 2 x 16 = 16.' } },
            { label: 'Potential energy', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:kinetic-and-potential-energy/v/potential_energy' },
            { label: 'Apply: potential energy', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:kinetic-and-potential-energy/e/apply-potential-energy', question: { prompt: 'A 1.0 kg book is lifted 2.0 m. Find its gravitational PE (g = 10 m/s2).', answer: '20 J', explanation: 'PE = m g h = 1 x 10 x 2 = 20.' } },
          ],
        },
        {
          name: 'Conservation of energy',
          items: [
            { label: 'Conservation of energy', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:conservation-of-energy/v/conservation_of_energy' },
            { label: 'Apply: conservation of energy', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:conservation-of-energy/e/apply-conservation-of-energy', question: { prompt: 'State the law of conservation of energy.', answer: 'Energy is neither created nor destroyed, only transformed.', explanation: 'Total energy of an isolated system is constant.' } },
          ],
        },
        {
          name: 'Activity: How do engineers design roller coasters?',
          items: [
            { label: 'Activity: How do engineers design roller coasters?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:activity-how-do-engineers-design-roller-coasters/a/activity-how-do-engineers-design-roller-coasters' },
          ],
        },
        {
          name: 'Work and power',
          items: [
            { label: 'Work and power', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:work-and-power/v/work_and_power' },
            { label: 'Translational kinetic energy and work', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:work-and-power/a/what-is-kinetic-energy' },
            { label: 'Apply: work and power', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:energy/x6679aa2c65c01e53:work-and-power/e/apply-work-and-power', question: { prompt: 'Solve a quick numerical example related to: Apply: work and power.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
      ],
    },
    {
      name: 'Electromagnetics',
      lessons: [
        {
          name: 'Voltage and current',
          items: [
            { label: 'Voltage (electric potential difference)', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:voltage-and-current/v/what_is_voltage' },
            { label: 'Electric current', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:voltage-and-current/v/electric_current' },
            { label: 'Apply: voltage and current', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:voltage-and-current/e/apply-voltage-and-current', question: { prompt: 'A 12 V battery drives 4.0 A through a resistor. What is its resistance?', answer: '3.0 Ω', explanation: 'R = V / I = 12 / 4 = 3.' } },
          ],
        },
        {
          name: 'Magnetic field due to current',
          items: [
            { label: 'Magnetic field due to current', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/v/oersteds-experiment-magnetic-field-due-to-current' },
            { label: 'Right hand thumb rule', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/v/right-hand-thumb-rule-solved-numerical' },
            { label: 'Apply: magnetic field due to straight current-carrying conductors', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/e/apply-magnetic-field-due-to-straight-current-carrying-conductor', question: { prompt: 'A 12 V battery drives 4.0 A through a resistor. What is its resistance?', answer: '3.0 Ω', explanation: 'R = V / I = 12 / 4 = 3.' } },
            { label: 'Magnetic field due to current-carrying loop', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/v/magnetic-field-due-to-current-carrying-loop' },
            { label: 'Magnetic field due to a solenoid', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/v/magnetic-fields-through-solenoids' },
            { label: 'Apply: magnetic field due to current-carrying coils', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:magnetic-field-due-to-current/e/apply-magnetic-field-due-to-current-carrying-coils', question: { prompt: 'A 12 V battery drives 4.0 A through a resistor. What is its resistance?', answer: '3.0 Ω', explanation: 'R = V / I = 12 / 4 = 3.' } },
          ],
        },
        {
          name: 'Electric motors',
          items: [
            { label: 'Force on a current-carrying conductor in a magnetic field', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-motors/v/force-on-a-current-carrying-conductor-ni-a-magnetic-field' },
            { label: 'Apply: force on a current-carrying conductor in a magnetic field', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-motors/e/apply-force-on-a-current-carrying-conductor-in-a-magnetic-field', question: { prompt: 'A 12 V battery drives 4.0 A through a resistor. What is its resistance?', answer: '3.0 Ω', explanation: 'R = V / I = 12 / 4 = 3.' } },
            { label: 'Electric motors', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-motors/v/electric-motor' },
            { label: 'Apply: electric motors', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-motors/e/apply-electric-motors', question: { prompt: 'Solve a quick numerical example related to: Apply: electric motors.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Electromagnetic induction',
          items: [
            { label: 'Electromagnetic induction', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electromagnetic-induction/v/electromagnetic-induction-faradays-experiments' },
            { label: 'Apply: electromagnetic induction', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electromagnetic-induction/e/apply-electromagnetic-induction', question: { prompt: 'A current-carrying wire creates what kind of field around it?', answer: 'A magnetic field (in circular loops around the wire).', explanation: 'Right-hand rule gives the direction.' } },
          ],
        },
        {
          name: 'Activity: How can motion produce electricity?',
          items: [
            { label: 'Activity: How can motion produce electricity?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:activity-how-can-motion-produce-electricity/a/activity-how-can-motion-produce-electricity' },
          ],
        },
        {
          name: 'Electric generators',
          items: [
            { label: 'Right hand generator rule', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-generators/v/right-hand-generator-rule' },
            { label: 'AC and DC generators', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-generators/v/ac-dc-generator' },
            { label: 'Apply: electric generators', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetics/x6679aa2c65c01e53:electric-generators/e/apply-electric-generators', question: { prompt: 'Solve a quick numerical example related to: Apply: electric generators.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
      ],
    },
    {
      name: 'Electromagnetic radiation',
      lessons: [
        {
          name: 'The electromagnetic spectrum',
          items: [
            { label: 'The electromagnetic spectrum', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:the-electromagnetic-spectrum/a/the-electromagnetic-spectrum' },
            { label: 'Apply: the electromagnetic spectrum', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:the-electromagnetic-spectrum/e/apply-the-electromagnetic-spectrum', question: { prompt: 'A current-carrying wire creates what kind of field around it?', answer: 'A magnetic field (in circular loops around the wire).', explanation: 'Right-hand rule gives the direction.' } },
          ],
        },
        {
          name: 'Wave behaviors of EM radiation',
          items: [
            { label: 'Electromagnetic waves', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:wave-behaviors-of-em-radiation/v/electromagnetic_waves' },
            { label: 'Apply: electromagnetic waves', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:wave-behaviors-of-em-radiation/e/apply-electromagnetic-waves', question: { prompt: 'A current-carrying wire creates what kind of field around it?', answer: 'A magnetic field (in circular loops around the wire).', explanation: 'Right-hand rule gives the direction.' } },
            { label: 'Refraction of light', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:wave-behaviors-of-em-radiation/v/refraction_of_light' },
            { label: 'Diffraction and interference of light', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:wave-behaviors-of-em-radiation/v/diffraction_and_interference_of_light' },
            { label: 'Apply: refraction, diffraction, and interference of light', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:wave-behaviors-of-em-radiation/e/apply-refraction-diffraction-and-interference-of-light', question: { prompt: 'What is the angle of reflection if the angle of incidence is 30°?', answer: '30°', explanation: 'Law of reflection: angles are equal.' } },
          ],
        },
        {
          name: 'Activity: Why do optical discs reflect rainbow colors?',
          items: [
            { label: 'Activity: Why do optical discs reflect rainbow colors?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:activity-why-do-optical-discs-reflect-rainbow-colors/a/activity-why-do-optical-discs-reflect-rainbow-colors' },
          ],
        },
        {
          name: 'Particle behaviors of EM radiation',
          items: [
            { label: 'The photoelectric and photovoltaic effects', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:particle-behaviors-of-em-radiation/v/the_photoelectric_and_photovoltaic_effects' },
            { label: 'Apply: the photoelectric and photovoltaic effects', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:particle-behaviors-of-em-radiation/e/apply-the-photoelectric-and-photovoltaic-effects', question: { prompt: 'Solve a quick numerical example related to: Apply: the photoelectric and photovoltaic effects.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Atomic spectra', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:particle-behaviors-of-em-radiation/v/atomic_spectra' },
            { label: 'Apply: atomic spectra', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:particle-behaviors-of-em-radiation/e/apply-atomic-spectra', question: { prompt: 'Solve a quick numerical example related to: Apply: atomic spectra.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Activity: How can starlight reveal the elements in a star?',
          items: [
            { label: 'Activity: How can starlight reveal the elements in a star?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:activity-how-can-starlight-reveal-the-elements-in-a-star/a/activity-how-can-starlight-reveal-the-elements-in-a-star' },
          ],
        },
        {
          name: 'EM radiation from the Sun',
          items: [
            { label: 'Blackbody radiation', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/v/blackbody_radiation' },
            { label: 'Stars', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/a/modeling-stars' },
            { label: 'Why is the sky blue?', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/v/why-is-the-sky-blue' },
            { label: 'The greenhouse effect', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/v/the-_greenhouse_effect' },
            { label: 'Apply: EM radiation from the Sun', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/e/apply-em-radiation-from-the-sun', question: { prompt: 'Solve a quick numerical example related to: Apply: EM radiation from the Sun.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'The Big Bang theory', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:em-radiation-from-the-sun/a/the-big-bang-theory' },
          ],
        },
        {
          name: 'Activity: How do carbon dioxide and albedo affect how Earth interacts with sunlight?',
          items: [
            { label: 'Activity: How do carbon dioxide and albedo affect how Earth interacts with sunlight?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:electromagnetic-radiation/x6679aa2c65c01e53:activity-how-do-carbon-dioxide-and-albedo-affect-how-earth-interacts-with-sunlight/a/activity-how-do-carbon-dioxide-and-albedo-affect-how-earth-interacts-with-sunlight' },
          ],
        },
      ],
    },
    {
      name: 'Nuclear physics',
      lessons: [
        {
          name: 'Radioactive decay',
          items: [
            { label: 'Intro to radioactive decay', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/v/intro-to-radioactive-decay' },
            { label: 'Alpha decay', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/v/alpha-decay' },
            { label: 'Apply: alpha decay', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/e/apply-alpha-decay', question: { prompt: 'Solve a quick numerical example related to: Apply: alpha decay.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Beta decay', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/v/beta-decay' },
            { label: 'Apply: beta decay', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/e/apply-beta-decay', question: { prompt: 'Solve a quick numerical example related to: Apply: beta decay.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Gamma decay', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/v/gamma-decay' },
            { label: 'Understand: radioactive decay', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/e/understand-radioactive-decay', question: { prompt: 'Solve a quick numerical example related to: Understand: radioactive decay.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: alpha, beta, and gamma decay', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:radioactive-decay/e/apply-alpha-beta-gamma', question: { prompt: 'Solve a quick numerical example related to: Apply: alpha, beta, and gamma decay.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Half-life',
          items: [
            { label: 'Half-life', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:half-life/v/half-life-radiometric-dating' },
            { label: 'Understand: half-life and radiometric dating', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:half-life/e/understand-half-life-and-radiometric-dating', question: { prompt: 'Solve a quick numerical example related to: Understand: half-life and radiometric dating.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: half-life and radiometric dating', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:half-life/e/apply-half-life-and-radiometric-dating', question: { prompt: 'Solve a quick numerical example related to: Apply: half-life and radiometric dating.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Activity: How do we know when dinosaurs lived on Earth?',
          items: [
            { label: 'Activity: How do we know when dinosaurs lived on Earth?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:activity-how-do-we-know-when-dinosaurs-lived-on-earth/a/activity-how-do-we-know-when-dinosaurs-lived-on-earth' },
          ],
        },
        {
          name: 'Nuclear fusion',
          items: [
            { label: 'Nuclear fusion', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:nuclear-fusion/v/nuclear-fusion' },
            { label: 'Understand: nuclear fusion', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:nuclear-fusion/e/understand-nuclear-fusion', question: { prompt: 'Solve a quick numerical example related to: Understand: nuclear fusion.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
        {
          name: 'Nuclear fission',
          items: [
            { label: 'Nuclear fission', type: 'video', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:nuclear-fission/v/nuclear-fission' },
            { label: 'Understand: nuclear fission', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:nuclear-fission/e/understand-nuclear-fission', question: { prompt: 'Solve a quick numerical example related to: Understand: nuclear fission.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
            { label: 'Apply: nuclear fission', type: 'exercise', href: '/science/highschool-physics/x6679aa2c65c01e53:nuclear-physics/x6679aa2c65c01e53:nuclear-fission/e/apply-nuclear-fission', question: { prompt: 'Solve a quick numerical example related to: Apply: nuclear fission.', answer: 'A clean numerical answer (e.g. round numbers) using the lesson formula.', explanation: 'Use the lesson formula with simple values.' } },
          ],
        },
      ],
    },
    {
      name: 'Teacher resources',
      lessons: [
        {
          name: 'Unit guides',
          items: [
            { label: 'How to use our NGSS-aligned unit guides', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:unit-guides/a/how-to-use-our-ngss-aligned-unit-guides' },
            { label: 'High school physics unit guides', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:unit-guides/a/physics-unit-guides' },
          ],
        },
        {
          name: 'Hands-on physics activities',
          items: [
            { label: 'Introduction to hands-on science activities', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/introduction-to-hands-on-science-activities' },
            { label: 'Activity: How do engineers design strong bridges?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-do-engineers-design-strong-bridges' },
            { label: 'Activity: How do engineers design safety cushions to save lives?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-do-engineers-design-safety-cushions-to-save-lives' },
            { label: 'Activity: Why is a Neptune year so long?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-why-is-a-neptune-year-so-long' },
            { label: 'Activity: Why do clothes develop static cling in a dryer?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-why-do-clothes-develop-static-cling-in-a-dryer' },
            { label: 'Activity: How do engineers design roller coasters?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-do-engineers-design-roller-coasters' },
            { label: 'Activity: How can motion produce electricity?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-can-motion-produce-electricity' },
            { label: 'Activity: Why do optical discs reflect rainbow colors?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-why-do-optical-discs-reflect-rainbow-colors' },
            { label: 'Activity: How can starlight reveal the elements in a star?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-can-starlight-reveal-the-elements-in-a-star' },
            { label: 'Activity: How do carbon dioxide and albedo affect how Earth interacts with sunlight?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-do-carbon-dioxide-and-albedo-affect-how-earth-interacts-with-sunlight' },
            { label: 'Activity: How do we know when dinosaurs lived on Earth?', type: 'article', href: '/science/highschool-physics/x6679aa2c65c01e53:teacher-resources/x6679aa2c65c01e53:untitled-227/a/activity-how-do-we-know-when-dinosaurs-lived-on-earth' },
          ],
        },
      ],
    },
  ],
};
