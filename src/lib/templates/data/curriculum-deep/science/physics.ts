import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '11',
  label: 'High School Physics',
  sourceUrl: 'https://www.khanacademy.org/science/high-school-physics',
  units: [
    {
      name: 'Forces and Motion',
      description: 'Describe motion with kinematics and apply Newton\'s laws to 1D systems.',
      lessons: [
        {
          name: 'Distance, Displacement, and Speed',
          description: 'Distinguish scalar and vector quantities of motion.',
          questions: [
            { prompt: 'A runner goes 400 m north then 400 m south. What is displacement?', answer: '0 m', explanation: 'Start and end at the same point; vector sum is zero.' },
            { prompt: 'Average speed for 100 m in 20 s?', answer: '5 m/s', explanation: 'speed = distance/time = 100/20 = 5.' },
          ],
        },
        {
          name: 'Acceleration and Kinematics',
          description: 'Use v = u + at and other kinematic equations.',
          questions: [
            { prompt: 'A car speeds up from 0 to 30 m/s in 10 s. Find acceleration.', answer: '3 m/s^2', explanation: 'a = (v - u)/t = (30 - 0)/10 = 3.' },
            { prompt: 'How far does it travel? (u = 0, a = 3 m/s^2, t = 10 s)', answer: '150 m', explanation: 's = ut + (1/2)at^2 = 0 + 0.5 * 3 * 100 = 150.' },
          ],
        },
        {
          name: 'Newton\'s First Law',
          description: 'Objects keep moving (or stay still) unless acted on by a net force.',
          questions: [
            { prompt: 'What is the law of inertia also called?', answer: 'Newton\'s First Law', explanation: 'Objects resist changes in motion unless forced.' },
            { prompt: 'If net force on a sliding puck is zero, what happens?', answer: 'It continues at constant velocity.', explanation: 'No net force means no acceleration.' },
          ],
        },
        {
          name: 'Newton\'s Second Law',
          description: 'Apply F = ma to calculate forces, masses, or accelerations.',
          questions: [
            { prompt: 'A 5 kg block accelerates at 2 m/s^2. What force was applied?', answer: '10 N', explanation: 'F = ma = 5 * 2 = 10 N.' },
            { prompt: 'Double the mass, same force. What happens to acceleration?', answer: 'It halves', explanation: 'a = F/m is inversely proportional to m.' },
          ],
        },
        {
          name: 'Newton\'s Third Law',
          description: 'Every action has an equal and opposite reaction.',
          questions: [
            { prompt: 'You push a wall with 50 N. What force does the wall exert back?', answer: '50 N (opposite direction)', explanation: 'Action-reaction pairs are equal and opposite.' },
            { prompt: 'Why don\'t action-reaction forces cancel each other?', answer: 'They act on different objects.', explanation: 'Only forces on the same object can cancel.' },
          ],
        },
        {
          name: 'Friction',
          description: 'Differentiate static and kinetic friction.',
          questions: [
            { prompt: 'A 10 kg block has μk = 0.2. Find kinetic friction force (g = 10 m/s^2).', answer: '20 N', explanation: 'f = μ * N = 0.2 * (10 * 10) = 20 N.' },
            { prompt: 'Which is usually greater: static or kinetic friction?', answer: 'Static friction', explanation: 'It is harder to start motion than to keep something moving.' },
          ],
        },
      ],
    },
    {
      name: 'Two-Dimensional Motion and Projectiles',
      description: 'Use vectors to analyze projectile trajectories and circular motion.',
      lessons: [
        {
          name: 'Vector Components',
          description: 'Break vectors into perpendicular x and y pieces.',
          questions: [
            { prompt: 'A vector has magnitude 10 at 30° above horizontal. Find its x-component.', answer: '8.66 (≈ 10 * cos 30°)', explanation: 'x = v * cos(θ).' },
            { prompt: 'Find the y-component.', answer: '5 (10 * sin 30°)', explanation: 'y = v * sin(θ) = 10 * 0.5 = 5.' },
          ],
        },
        {
          name: 'Horizontal Projectile Motion',
          description: 'Analyze objects launched horizontally under gravity.',
          questions: [
            { prompt: 'A ball is thrown horizontally from 20 m high. How long until it lands? (g = 10 m/s^2)', answer: '2 s', explanation: 'h = (1/2)gt^2 -> t = sqrt(2h/g) = sqrt(4) = 2.' },
            { prompt: 'Initial velocity 10 m/s horizontal. How far does it travel?', answer: '20 m', explanation: 'x = v * t = 10 * 2 = 20.' },
          ],
        },
        {
          name: 'Angled Projectile Motion',
          description: 'Combine horizontal and vertical motion for projectiles launched at angles.',
          questions: [
            { prompt: 'What launch angle gives maximum range (no air resistance)?', answer: '45°', explanation: 'sin(2θ) is maximum at 2θ = 90°, so θ = 45°.' },
            { prompt: 'At the peak of flight, what is vertical velocity?', answer: '0 m/s', explanation: 'Momentarily zero as it changes direction.' },
          ],
        },
        {
          name: 'Uniform Circular Motion',
          description: 'Study centripetal acceleration keeping objects on circular paths.',
          questions: [
            { prompt: 'Centripetal acceleration for v = 10 m/s, r = 5 m?', answer: '20 m/s^2', explanation: 'a = v^2/r = 100/5 = 20.' },
            { prompt: 'Does centripetal force do work on the object?', answer: 'No', explanation: 'Force is perpendicular to motion, so W = 0.' },
          ],
        },
        {
          name: 'Gravitation',
          description: 'Apply Newton\'s law of universal gravitation.',
          questions: [
            { prompt: 'If distance between two masses doubles, gravitational force becomes?', answer: '1/4 of the original', explanation: 'F ∝ 1/r^2; double r -> force divided by 4.' },
            { prompt: 'What is g on Earth\'s surface?', answer: '9.8 m/s^2 (≈ 10 m/s^2)', explanation: 'Gravitational acceleration at sea level.' },
          ],
        },
      ],
    },
    {
      name: 'Introduction to Energy',
      description: 'Define work, kinetic and potential energy, and conservation.',
      lessons: [
        {
          name: 'Work',
          description: 'Calculate work as W = F*d*cos(θ).',
          questions: [
            { prompt: 'A 10 N force pushes a box 5 m in the force direction. Work done?', answer: '50 J', explanation: 'W = F * d = 10 * 5 = 50 J.' },
            { prompt: 'Force perpendicular to motion does how much work?', answer: '0 J', explanation: 'cos(90°) = 0, so W = 0.' },
          ],
        },
        {
          name: 'Kinetic Energy',
          description: 'Use KE = (1/2)mv^2.',
          questions: [
            { prompt: 'KE of a 2 kg object moving at 5 m/s?', answer: '25 J', explanation: 'KE = 0.5 * 2 * 25 = 25 J.' },
            { prompt: 'Double the speed. How does KE change?', answer: 'KE becomes 4 times larger.', explanation: 'KE ∝ v^2.' },
          ],
        },
        {
          name: 'Potential Energy',
          description: 'Calculate gravitational PE as mgh.',
          questions: [
            { prompt: 'PE of 3 kg lifted 10 m? (g = 10)', answer: '300 J', explanation: 'PE = mgh = 3 * 10 * 10 = 300 J.' },
            { prompt: 'At what height does gravitational PE equal zero?', answer: 'At the reference level (usually ground).', explanation: 'PE is measured relative to a chosen zero point.' },
          ],
        },
        {
          name: 'Conservation of Energy',
          description: 'Use total mechanical energy equals KE + PE.',
          questions: [
            { prompt: 'A 2 kg ball dropped from 5 m. Find speed just before hitting ground (g = 10).', answer: '10 m/s', explanation: 'mgh = (1/2)mv^2; v = sqrt(2gh) = sqrt(100) = 10.' },
            { prompt: 'Energy lost to friction goes to what?', answer: 'Heat (thermal energy)', explanation: 'Mechanical energy converts to internal energy.' },
          ],
        },
        {
          name: 'Power',
          description: 'Power = work/time or P = Fv.',
          questions: [
            { prompt: 'How much power to lift 50 kg 2 m in 10 s? (g = 10)', answer: '100 W', explanation: 'W = mgh = 1000 J; P = W/t = 100 W.' },
            { prompt: 'Unit of power?', answer: 'Watt (J/s)', explanation: '1 W = 1 J per second.' },
          ],
        },
      ],
    },
    {
      name: 'Momentum and Collisions',
      description: 'Use impulse and momentum conservation for collisions.',
      lessons: [
        {
          name: 'Momentum',
          description: 'Define p = m*v.',
          questions: [
            { prompt: 'Momentum of 4 kg moving at 5 m/s?', answer: '20 kg·m/s', explanation: 'p = mv = 4 * 5.' },
            { prompt: 'Is momentum a vector or scalar?', answer: 'Vector', explanation: 'It has both magnitude and direction.' },
          ],
        },
        {
          name: 'Impulse',
          description: 'Impulse equals force * time equals change in momentum.',
          questions: [
            { prompt: '10 N force applied for 2 s to a 5 kg object. Change in velocity?', answer: '4 m/s', explanation: 'J = Ft = 20 N·s; Δv = J/m = 20/5 = 4.' },
            { prompt: 'Why do airbags reduce injury?', answer: 'They extend collision time, reducing force for same impulse.', explanation: 'F = J/t, so more t means less F.' },
          ],
        },
        {
          name: 'Conservation of Momentum',
          description: 'Total momentum is conserved in closed systems.',
          questions: [
            { prompt: 'Cart A (2 kg, 3 m/s) collides with stationary cart B (4 kg). They stick. Final velocity?', answer: '1 m/s', explanation: 'p_initial = 6; p_final = 6 = 6*v -> v = 1.' },
            { prompt: 'In what system is momentum conserved?', answer: 'Any isolated system (no external forces).', explanation: 'External forces change total momentum.' },
          ],
        },
        {
          name: 'Elastic Collisions',
          description: 'Both momentum and kinetic energy are conserved.',
          questions: [
            { prompt: 'Are billiard ball collisions typically elastic or inelastic?', answer: 'Nearly elastic', explanation: 'Little KE is lost during the brief contact.' },
            { prompt: 'Two identical elastic carts: one moving, one still. After collision, what happens?', answer: 'Moving cart stops; still cart moves at initial speed.', explanation: 'Characteristic of equal-mass elastic collision.' },
          ],
        },
        {
          name: 'Inelastic Collisions',
          description: 'Momentum conserved, KE lost to deformation/heat.',
          questions: [
            { prompt: 'What defines a perfectly inelastic collision?', answer: 'Objects stick together after collision.', explanation: 'Maximum KE lost while conserving momentum.' },
            { prompt: 'Is KE conserved in an inelastic collision?', answer: 'No, some is converted to other forms.', explanation: 'Heat, sound, deformation absorb KE.' },
          ],
        },
      ],
    },
    {
      name: 'Waves and Sound',
      description: 'Study transverse and longitudinal waves, superposition, and sound.',
      lessons: [
        {
          name: 'Wave Properties',
          description: 'Define wavelength, frequency, amplitude, and period.',
          questions: [
            { prompt: 'Wave equation v = f * λ. If f = 10 Hz and λ = 2 m, find v.', answer: '20 m/s', explanation: 'v = 10 * 2 = 20 m/s.' },
            { prompt: 'What is the relationship between period T and frequency f?', answer: 'T = 1/f', explanation: 'Period is seconds per cycle; frequency is cycles per second.' },
          ],
        },
        {
          name: 'Transverse vs Longitudinal',
          description: 'Compare waves that oscillate perpendicular to and along the direction of motion.',
          questions: [
            { prompt: 'Is sound transverse or longitudinal?', answer: 'Longitudinal', explanation: 'Air particles vibrate parallel to wave direction.' },
            { prompt: 'Give an example of a transverse wave.', answer: 'Light (or wave on a rope)', explanation: 'Oscillations are perpendicular to travel.' },
          ],
        },
        {
          name: 'Superposition and Interference',
          description: 'Waves combine constructively or destructively.',
          questions: [
            { prompt: 'What happens when two in-phase waves meet?', answer: 'Constructive interference - amplitudes add.', explanation: 'Crests align, producing larger crest.' },
            { prompt: 'What causes destructive interference?', answer: 'Waves meeting 180° out of phase.', explanation: 'Crest meets trough, canceling amplitude.' },
          ],
        },
        {
          name: 'Sound Waves and Intensity',
          description: 'Relate sound properties: pitch, loudness, and speed.',
          questions: [
            { prompt: 'Approximate speed of sound in air at room temperature?', answer: '343 m/s', explanation: 'Depends on temperature and medium.' },
            { prompt: 'What property of a wave determines pitch?', answer: 'Frequency', explanation: 'Higher frequency = higher pitch.' },
          ],
        },
        {
          name: 'Doppler Effect',
          description: 'Pitch changes when source or observer moves.',
          questions: [
            { prompt: 'An ambulance approaches. Does the siren sound higher or lower?', answer: 'Higher pitch', explanation: 'Compressed wavefronts increase frequency.' },
            { prompt: 'What happens to observed frequency as the source moves away?', answer: 'It decreases.', explanation: 'Wavefronts stretch, lowering frequency.' },
          ],
        },
      ],
    },
    {
      name: 'Light and Electromagnetic Radiation',
      description: 'Explore the EM spectrum, reflection, refraction, and wave-particle duality.',
      lessons: [
        {
          name: 'Electromagnetic Spectrum',
          description: 'Order EM waves by wavelength and frequency.',
          questions: [
            { prompt: 'Which has higher frequency: radio waves or X-rays?', answer: 'X-rays', explanation: 'X-rays have much shorter wavelengths and higher energies.' },
            { prompt: 'What is the speed of light in vacuum?', answer: '3 x 10^8 m/s', explanation: 'Same for all EM waves in vacuum.' },
          ],
        },
        {
          name: 'Reflection',
          description: 'Apply the law of reflection: angle in = angle out.',
          questions: [
            { prompt: 'Light hits a mirror at 30° from the normal. What is the reflected angle?', answer: '30°', explanation: 'Angle of incidence equals angle of reflection.' },
            { prompt: 'What is specular reflection?', answer: 'Reflection from a smooth surface producing a clear image.', explanation: 'Opposite of diffuse reflection from rough surfaces.' },
          ],
        },
        {
          name: 'Refraction',
          description: 'Light bends when changing media; use Snell\'s law.',
          questions: [
            { prompt: 'Index of refraction for water?', answer: '≈ 1.33', explanation: 'Light travels ~25% slower in water than vacuum.' },
            { prompt: 'Does light bend toward or away from normal entering a denser medium?', answer: 'Toward the normal', explanation: 'It slows down, causing bending toward the normal.' },
          ],
        },
        {
          name: 'Lenses and Mirrors',
          description: 'Compare converging and diverging optical elements.',
          questions: [
            { prompt: 'A magnifying glass is what type of lens?', answer: 'Converging (convex) lens', explanation: 'Bends parallel rays to a focal point.' },
            { prompt: 'Do concave mirrors converge or diverge light?', answer: 'Converge', explanation: 'Parallel rays reflect through the focal point.' },
          ],
        },
        {
          name: 'Wave-Particle Duality',
          description: 'Introduce photons and Einstein\'s photoelectric effect.',
          questions: [
            { prompt: 'What is a photon?', answer: 'A quantum (particle) of light carrying energy E = hf.', explanation: 'Light behaves as both wave and particle.' },
            { prompt: 'Who received the Nobel Prize for explaining the photoelectric effect?', answer: 'Albert Einstein (1921)', explanation: 'Not for relativity - for photons!' },
          ],
        },
      ],
    },
    {
      name: 'Electricity and Magnetism',
      description: 'Analyze charges, circuits, Ohm\'s law, and magnetic fields.',
      lessons: [
        {
          name: 'Electric Charge and Coulomb\'s Law',
          description: 'Quantify force between point charges.',
          questions: [
            { prompt: 'Double the distance between two charges. The force becomes?', answer: '1/4 of original', explanation: 'F ∝ 1/r^2.' },
            { prompt: 'Like charges do what?', answer: 'Repel each other', explanation: 'Opposite charges attract.' },
          ],
        },
        {
          name: 'Ohm\'s Law',
          description: 'V = IR relates voltage, current, and resistance.',
          questions: [
            { prompt: 'A 12 V battery drives 3 A through a resistor. What is R?', answer: '4 Ω', explanation: 'R = V/I = 12/3 = 4.' },
            { prompt: 'What are the units of current?', answer: 'Amperes (A) = coulombs per second.', explanation: 'Charge flow rate.' },
          ],
        },
        {
          name: 'Series and Parallel Circuits',
          description: 'Combine resistors in two basic ways.',
          questions: [
            { prompt: 'Two 10 Ω resistors in series. Total?', answer: '20 Ω', explanation: 'R_total = R1 + R2.' },
            { prompt: 'Two 10 Ω resistors in parallel. Total?', answer: '5 Ω', explanation: '1/R = 1/10 + 1/10 = 1/5.' },
          ],
        },
        {
          name: 'Electric Power',
          description: 'Calculate power as P = IV.',
          questions: [
            { prompt: 'A 120 V device draws 2 A. Power used?', answer: '240 W', explanation: 'P = IV = 2 * 120 = 240.' },
            { prompt: 'How can you write P using R and I?', answer: 'P = I^2 * R', explanation: 'Substitute V = IR into P = IV.' },
          ],
        },
        {
          name: 'Magnetic Fields',
          description: 'Describe magnetic fields around magnets and current-carrying wires.',
          questions: [
            { prompt: 'What unit measures magnetic field strength?', answer: 'Tesla (T)', explanation: '1 T = 1 kg/(A·s^2).' },
            { prompt: 'Use the right-hand rule for current in a wire. Why?', answer: 'To find the direction of the magnetic field around the wire.', explanation: 'Thumb along I, fingers curl in B direction.' },
          ],
        },
      ],
    },
    {
      name: 'Thermodynamics',
      description: 'Relate heat, temperature, and energy through thermodynamic laws.',
      lessons: [
        {
          name: 'Temperature and Heat',
          description: 'Distinguish temperature (average KE) from heat (energy transfer).',
          questions: [
            { prompt: 'Convert 25 C to Kelvin.', answer: '298 K', explanation: 'K = C + 273.' },
            { prompt: 'Does a pot of boiling water have higher temperature or more total heat than an iceberg?', answer: 'Higher temperature, less total heat.', explanation: 'Heat depends on mass too.' },
          ],
        },
        {
          name: 'Zeroth Law',
          description: 'If A and B are in thermal equilibrium with C, A and B are with each other.',
          questions: [
            { prompt: 'What does the Zeroth Law enable us to do?', answer: 'Define temperature via thermometers.', explanation: 'Transitive property of thermal equilibrium.' },
            { prompt: 'What does thermal equilibrium mean?', answer: 'No net heat flow between objects.', explanation: 'They are at the same temperature.' },
          ],
        },
        {
          name: 'First Law of Thermodynamics',
          description: 'ΔU = Q - W: energy is conserved.',
          questions: [
            { prompt: '500 J of heat added to gas, it does 200 J of work. Change in internal energy?', answer: '300 J', explanation: 'ΔU = Q - W = 500 - 200 = 300.' },
            { prompt: 'The First Law restates what broader principle?', answer: 'Conservation of energy.', explanation: 'Energy cannot be created or destroyed.' },
          ],
        },
        {
          name: 'Second Law and Entropy',
          description: 'Entropy of an isolated system never decreases.',
          questions: [
            { prompt: 'Does entropy increase or decrease when ice melts?', answer: 'Increases', explanation: 'Disorder of molecules increases going from solid to liquid.' },
            { prompt: 'Can heat spontaneously flow from cold to hot?', answer: 'No', explanation: 'Violates the Second Law of Thermodynamics.' },
          ],
        },
        {
          name: 'Heat Engines and Efficiency',
          description: 'Efficiency = W/Qin; Carnot sets the maximum.',
          questions: [
            { prompt: 'An engine absorbs 1000 J and does 400 J of work. Efficiency?', answer: '40%', explanation: 'e = W/Qin = 400/1000.' },
            { prompt: 'What is the maximum theoretical efficiency called?', answer: 'Carnot efficiency', explanation: 'e = 1 - Tc/Th with temperatures in Kelvin.' },
          ],
        },
      ],
    },
  ],
};
