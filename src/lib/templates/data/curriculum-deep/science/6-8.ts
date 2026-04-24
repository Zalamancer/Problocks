import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '6-8',
  label: 'Middle School Science (Integrated)',
  sourceUrl: 'https://www.khanacademy.org/science/middle-school-physics',
  units: [
    {
      name: 'Physics: Motion and Forces',
      description: "Describe motion with speed and velocity, then apply Newton's laws to everyday interactions.",
      lessons: [
        {
          name: 'Speed and Velocity',
          description: 'Speed is distance over time; velocity adds direction.',
          questions: [
            {
              prompt: 'A car travels 120 km in 2 hours. What is its average speed?',
              answer: '60 km/h',
              explanation: 'Speed = distance divided by time.',
            },
            {
              prompt: 'Two objects have the same speed but different velocities. What differs?',
              answer: 'Their direction of motion',
              explanation: 'Velocity is a vector, including direction.',
            },
          ],
        },
        {
          name: 'Acceleration',
          description: 'Acceleration measures how quickly velocity changes.',
          questions: [
            {
              prompt: 'If a cyclist speeds up from rest to 10 m/s in 5 seconds, what is the acceleration?',
              answer: '2 m/s^2',
              explanation: 'Acceleration = change in velocity divided by time.',
            },
            {
              prompt: 'Can an object moving at constant speed still accelerate?',
              answer: 'Yes, if it changes direction',
              explanation: 'Direction change is also acceleration.',
            },
          ],
        },
        {
          name: "Newton's First Law",
          description: 'Objects keep their motion unless an unbalanced force acts.',
          questions: [
            {
              prompt: 'Why do passengers lurch forward when a car brakes?',
              answer: 'Inertia keeps them moving while the car stops',
              explanation: "Newton's first law: motion continues without a new force.",
            },
            {
              prompt: 'What property measures an object resistance to change in motion?',
              answer: 'Mass (inertia)',
              explanation: 'Greater mass means greater inertia.',
            },
          ],
        },
        {
          name: "Newton's Second Law",
          description: 'Force equals mass times acceleration (F = ma).',
          questions: [
            {
              prompt: 'What force is needed to accelerate a 10 kg cart at 3 m/s^2?',
              answer: '30 N',
              explanation: 'F = m * a = 10 * 3 = 30 newtons.',
            },
            {
              prompt: 'If the same force is applied to a heavy and a light object, which accelerates more?',
              answer: 'The light one',
              explanation: 'Smaller mass means greater acceleration.',
            },
          ],
        },
        {
          name: "Newton's Third Law",
          description: 'Every action has an equal and opposite reaction.',
          questions: [
            {
              prompt: 'When a rocket pushes exhaust down, what pushes the rocket up?',
              answer: 'The reaction force from the exhaust',
              explanation: 'Action-reaction forces are equal and opposite.',
            },
            {
              prompt: 'Why does walking forward require pushing backward on the ground?',
              answer: 'The ground pushes you forward in reaction',
              explanation: "Newton's third law makes walking possible.",
            },
          ],
        },
      ],
    },
    {
      name: 'Physics: Non-Contact Forces',
      description: 'Explore gravitational, electric, and magnetic forces that act across empty space.',
      lessons: [
        {
          name: 'Gravity and Mass',
          description: 'Gravity pulls masses together without touching.',
          questions: [
            {
              prompt: 'Why does an apple fall from a tree?',
              answer: 'Earth gravity pulls it down',
              explanation: 'All masses attract; Earth pull dominates.',
            },
            {
              prompt: 'How does gravity change with distance?',
              answer: 'It gets weaker as distance increases',
              explanation: 'Gravity follows an inverse-square law.',
            },
          ],
        },
        {
          name: 'Electric Charge',
          description: 'Like charges repel; opposite charges attract.',
          questions: [
            {
              prompt: 'Two negative charges are placed near each other. What happens?',
              answer: 'They repel',
              explanation: 'Like charges push each other apart.',
            },
            {
              prompt: 'Why does hair stand up after rubbing with a balloon?',
              answer: 'The hairs share a charge and repel each other',
              explanation: 'Static charge causes repulsion.',
            },
          ],
        },
        {
          name: 'Magnetic Fields',
          description: 'Magnets create fields that push or pull on other magnets.',
          questions: [
            {
              prompt: 'What happens when two north poles face each other?',
              answer: 'They repel',
              explanation: 'Like poles repel in magnetism.',
            },
            {
              prompt: 'What shape does a magnetic field take around a bar magnet?',
              answer: 'Loops from north to south',
              explanation: 'Field lines curve from N to S outside the magnet.',
            },
          ],
        },
        {
          name: 'Electromagnets',
          description: 'Current-carrying wires produce magnetic fields.',
          questions: [
            {
              prompt: 'How can you make an electromagnet stronger?',
              answer: 'Add more coils or more current',
              explanation: 'More turns and more current increase field strength.',
            },
            {
              prompt: 'Name a device that uses an electromagnet.',
              answer: 'A scrapyard crane (or motor, or doorbell)',
              explanation: 'Many devices depend on electromagnets.',
            },
          ],
        },
        {
          name: 'Fields and Energy',
          description: 'Fields store energy that can do work on objects.',
          questions: [
            {
              prompt: 'Why does a dropped ball gain kinetic energy?',
              answer: 'Gravity field does work on it',
              explanation: 'Gravitational potential energy becomes kinetic.',
            },
            {
              prompt: 'What happens to two magnets when you push them together against repulsion?',
              answer: 'Energy is stored in the field',
              explanation: 'You do work against the field, storing energy.',
            },
          ],
        },
      ],
    },
    {
      name: 'Physics: Energy',
      description: 'Study kinetic and potential energy, transfers, and the principle of energy conservation.',
      lessons: [
        {
          name: 'Kinetic Energy',
          description: 'Moving objects have kinetic energy proportional to mass and speed squared.',
          questions: [
            {
              prompt: 'If speed doubles, what happens to kinetic energy?',
              answer: 'It quadruples',
              explanation: 'KE = (1/2)mv^2, and v^2 grows by a factor of 4.',
            },
            {
              prompt: 'Which has more kinetic energy: a walking adult or a sprinting child of equal mass?',
              answer: 'The sprinting child',
              explanation: 'Higher speed means more kinetic energy.',
            },
          ],
        },
        {
          name: 'Potential Energy',
          description: 'Stored energy depends on position or configuration.',
          questions: [
            {
              prompt: 'Where does a roller coaster have the most gravitational potential energy?',
              answer: 'At the highest point',
              explanation: 'Higher position means greater potential energy.',
            },
            {
              prompt: 'A stretched rubber band stores what kind of potential energy?',
              answer: 'Elastic potential energy',
              explanation: 'Elastic energy comes from stretching or compressing.',
            },
          ],
        },
        {
          name: 'Conservation of Energy',
          description: 'Energy changes form but total energy stays the same.',
          questions: [
            {
              prompt: 'As a pendulum swings down, what happens to its energy?',
              answer: 'Potential becomes kinetic',
              explanation: 'Energy converts between forms but total is constant.',
            },
            {
              prompt: 'Why does a bouncing ball eventually stop?',
              answer: 'Energy leaves as heat and sound',
              explanation: 'Energy is still conserved; it transfers out of the ball.',
            },
          ],
        },
        {
          name: 'Energy Transfer',
          description: 'Energy moves by conduction, convection, radiation, or waves.',
          questions: [
            {
              prompt: 'How does the Sun transfer energy to Earth?',
              answer: 'By radiation',
              explanation: 'Light and infrared waves carry energy across space.',
            },
            {
              prompt: 'Why does a metal spoon get hot in soup?',
              answer: 'By conduction',
              explanation: 'Heat transfers through the spoon by particle contact.',
            },
          ],
        },
        {
          name: 'Efficiency and Thermal Energy',
          description: 'Real systems lose some energy as heat.',
          questions: [
            {
              prompt: 'Why are most machines less than 100 percent efficient?',
              answer: 'Friction and heat loss reduce output',
              explanation: 'Some energy always leaves as thermal energy.',
            },
            {
              prompt: 'How can efficiency be improved in a machine?',
              answer: 'Reduce friction (oil, better bearings)',
              explanation: 'Less friction means less wasted heat.',
            },
          ],
        },
      ],
    },
    {
      name: 'Physics: Waves',
      description: 'Learn wave properties and how sound, light, and electromagnetic waves carry information.',
      lessons: [
        {
          name: 'Wave Properties',
          description: 'Waves have amplitude, wavelength, frequency, and speed.',
          questions: [
            {
              prompt: 'What does a higher frequency wave sound like?',
              answer: 'A higher pitch',
              explanation: 'Frequency determines pitch for sound waves.',
            },
            {
              prompt: 'How are wavelength and frequency related?',
              answer: 'Inversely',
              explanation: 'Higher frequency means shorter wavelength.',
            },
          ],
        },
        {
          name: 'Transverse and Longitudinal Waves',
          description: 'Transverse waves move sideways; longitudinal waves move in compressions.',
          questions: [
            {
              prompt: 'What type of wave is sound?',
              answer: 'Longitudinal',
              explanation: 'Sound travels as compressions in a medium.',
            },
            {
              prompt: 'Is a wave on a rope longitudinal or transverse?',
              answer: 'Transverse',
              explanation: 'The rope moves perpendicular to the wave direction.',
            },
          ],
        },
        {
          name: 'Sound Waves',
          description: 'Sound needs a medium and travels as pressure changes.',
          questions: [
            {
              prompt: 'Why does sound travel faster in water than in air?',
              answer: 'Water particles are closer together',
              explanation: 'Denser medium transmits vibrations faster.',
            },
            {
              prompt: 'What makes a sound louder?',
              answer: 'Greater amplitude',
              explanation: 'Amplitude controls sound intensity.',
            },
          ],
        },
        {
          name: 'Light and the EM Spectrum',
          description: 'Light is an electromagnetic wave; many types exist beyond visible.',
          questions: [
            {
              prompt: 'Name one type of electromagnetic wave besides visible light.',
              answer: 'Radio (or ultraviolet, or X-ray)',
              explanation: 'EM waves span from radio to gamma rays.',
            },
            {
              prompt: 'Which has shorter wavelengths: ultraviolet or infrared?',
              answer: 'Ultraviolet',
              explanation: 'UV sits at higher frequency and shorter wavelength than infrared.',
            },
          ],
        },
        {
          name: 'Digital Signals and Communication',
          description: 'Waves can carry information in digital pulses.',
          questions: [
            {
              prompt: 'Why are digital signals more reliable than analog ones over long distances?',
              answer: 'They are less affected by noise',
              explanation: 'On/off patterns are easier to recover.',
            },
            {
              prompt: 'What waves do Wi-Fi devices use?',
              answer: 'Radio waves',
              explanation: 'Wi-Fi uses high-frequency radio signals.',
            },
          ],
        },
      ],
    },
    {
      name: 'Biology: Cells and Organisms',
      description: 'Examine cell structure, levels of organization, and how body systems work together.',
      lessons: [
        {
          name: 'Cell Theory',
          description: 'All living things are made of cells; cells come from cells.',
          questions: [
            {
              prompt: 'What are the three main points of cell theory?',
              answer: 'Cells are life units, all life is cells, cells come from cells',
              explanation: 'These principles define cell theory.',
            },
            {
              prompt: 'Are viruses considered alive under cell theory?',
              answer: 'No',
              explanation: 'Viruses are not cells and cannot reproduce alone.',
            },
          ],
        },
        {
          name: 'Prokaryotes vs Eukaryotes',
          description: 'Eukaryotic cells have a nucleus; prokaryotes do not.',
          questions: [
            {
              prompt: 'Which type of cell has a membrane-bound nucleus?',
              answer: 'Eukaryotic',
              explanation: 'Plants, animals, and fungi have eukaryotic cells.',
            },
            {
              prompt: 'Name a prokaryotic organism.',
              answer: 'A bacterium',
              explanation: 'Bacteria are prokaryotic.',
            },
          ],
        },
        {
          name: 'Organelles and Their Jobs',
          description: 'Each organelle has a specific function in the cell.',
          questions: [
            {
              prompt: 'What organelle produces energy in the cell?',
              answer: 'Mitochondria',
              explanation: 'Mitochondria convert glucose into ATP.',
            },
            {
              prompt: 'What does the nucleus store?',
              answer: 'Genetic information (DNA)',
              explanation: 'The nucleus is the control center of the cell.',
            },
          ],
        },
        {
          name: 'Levels of Organization',
          description: 'Cells form tissues, organs, and systems.',
          questions: [
            {
              prompt: 'Put these in order: cells, tissues, organs, systems.',
              answer: 'Cells -> tissues -> organs -> systems',
              explanation: 'Each level is made of the previous one.',
            },
            {
              prompt: 'Is the heart an organ or a tissue?',
              answer: 'An organ',
              explanation: 'The heart contains multiple tissue types.',
            },
          ],
        },
        {
          name: 'Body Systems Working Together',
          description: 'Systems like circulatory and respiratory coordinate to keep the body alive.',
          questions: [
            {
              prompt: 'Which system carries oxygen to cells?',
              answer: 'Circulatory system',
              explanation: 'Blood transports oxygen from lungs to tissues.',
            },
            {
              prompt: 'Why must respiratory and circulatory systems work together?',
              answer: 'Oxygen must be absorbed and then delivered',
              explanation: 'Lungs absorb oxygen; blood delivers it.',
            },
          ],
        },
      ],
    },
    {
      name: 'Biology: Matter and Energy in Organisms',
      description: 'Trace how organisms take in matter and transform energy through photosynthesis and respiration.',
      lessons: [
        {
          name: 'Photosynthesis',
          description: 'Plants convert sunlight, water, and carbon dioxide into sugar and oxygen.',
          questions: [
            {
              prompt: 'What gas is released during photosynthesis?',
              answer: 'Oxygen',
              explanation: 'Oxygen is a product of photosynthesis.',
            },
            {
              prompt: 'What is the main energy source for photosynthesis?',
              answer: 'Sunlight',
              explanation: 'Light energy powers the chemical reaction.',
            },
          ],
        },
        {
          name: 'Cellular Respiration',
          description: 'Cells break down glucose to release usable energy.',
          questions: [
            {
              prompt: 'What gas do animals breathe in for respiration?',
              answer: 'Oxygen',
              explanation: 'Oxygen is needed to release energy from glucose.',
            },
            {
              prompt: 'What energy molecule is produced in respiration?',
              answer: 'ATP',
              explanation: 'ATP powers cellular processes.',
            },
          ],
        },
        {
          name: 'Food as Energy and Matter',
          description: 'Food supplies both chemical energy and building materials.',
          questions: [
            {
              prompt: 'What do body cells build from proteins in food?',
              answer: 'New proteins (and body tissues)',
              explanation: 'Amino acids are reused to make structures.',
            },
            {
              prompt: 'Why is glucose important to animals?',
              answer: 'It provides energy for cells',
              explanation: 'Glucose is broken down in respiration.',
            },
          ],
        },
        {
          name: 'Matter Cycles in Organisms',
          description: 'Atoms cycle through plants, animals, and decomposers.',
          questions: [
            {
              prompt: 'Where do the carbon atoms in your body come from?',
              answer: 'Food (from plants and animals)',
              explanation: 'All carbon traces back through food chains.',
            },
            {
              prompt: 'What role do decomposers play in the carbon cycle?',
              answer: 'They return carbon to the air and soil',
              explanation: 'Decomposers break down dead matter.',
            },
          ],
        },
        {
          name: 'Energy Pyramids',
          description: 'Only a small fraction of energy passes to the next trophic level.',
          questions: [
            {
              prompt: 'What percent of energy typically passes up one level?',
              answer: 'About 10 percent',
              explanation: 'Most energy is lost as heat at each level.',
            },
            {
              prompt: 'Why are there fewer top predators than producers?',
              answer: 'Less energy is available at higher levels',
              explanation: 'Energy pyramids narrow at the top.',
            },
          ],
        },
      ],
    },
    {
      name: 'Biology: Interactions in Ecosystems',
      description: 'Model energy flow, competition, symbiosis, and human impacts on ecosystems.',
      lessons: [
        {
          name: 'Populations and Communities',
          description: 'A population is one species; a community is many species.',
          questions: [
            {
              prompt: 'What makes up a population?',
              answer: 'Members of the same species in one area',
              explanation: 'Populations share a location and species.',
            },
            {
              prompt: 'What limits how big a population can grow?',
              answer: 'Resources like food, space, or water',
              explanation: 'Carrying capacity is set by resources.',
            },
          ],
        },
        {
          name: 'Competition and Predation',
          description: 'Organisms compete for resources or hunt one another.',
          questions: [
            {
              prompt: 'What can happen if two species compete for the same food?',
              answer: 'One may leave, adapt, or die out',
              explanation: 'Competition shapes ecosystems.',
            },
            {
              prompt: 'What is a predator-prey relationship?',
              answer: 'One species eats another',
              explanation: 'Predators hunt prey for energy.',
            },
          ],
        },
        {
          name: 'Symbiosis',
          description: 'Symbiosis includes mutualism, commensalism, and parasitism.',
          questions: [
            {
              prompt: 'Which symbiosis benefits both organisms?',
              answer: 'Mutualism',
              explanation: 'Both partners gain from mutualism.',
            },
            {
              prompt: 'What is an example of parasitism?',
              answer: 'A tick on a deer',
              explanation: 'One organism benefits while the other is harmed.',
            },
          ],
        },
        {
          name: 'Biodiversity',
          description: 'High diversity makes ecosystems more stable.',
          questions: [
            {
              prompt: 'Why is biodiversity important?',
              answer: 'It helps ecosystems recover from change',
              explanation: 'Diverse systems are resilient.',
            },
            {
              prompt: 'Name a cause of biodiversity loss.',
              answer: 'Habitat destruction (or pollution)',
              explanation: 'Human activities shrink habitats.',
            },
          ],
        },
        {
          name: 'Human Impacts',
          description: 'People change ecosystems through pollution and land use.',
          questions: [
            {
              prompt: 'How does plastic pollution affect ocean life?',
              answer: 'Animals eat or get tangled in plastic',
              explanation: 'Plastic harms wildlife and food chains.',
            },
            {
              prompt: 'Name one way to reduce your impact on ecosystems.',
              answer: 'Recycle, reduce waste, or use less energy',
              explanation: 'Small actions reduce pollution.',
            },
          ],
        },
      ],
    },
    {
      name: 'Biology: Genetics and Evolution',
      description: 'Study inheritance, variation of traits, natural selection, and the tree of life.',
      lessons: [
        {
          name: 'Genes and Inheritance',
          description: 'Genes on chromosomes pass traits to offspring.',
          questions: [
            {
              prompt: 'What molecule stores genetic information?',
              answer: 'DNA',
              explanation: 'DNA carries instructions for traits.',
            },
            {
              prompt: 'How many chromosomes do human body cells have?',
              answer: '46',
              explanation: 'We inherit 23 pairs, one from each parent.',
            },
          ],
        },
        {
          name: 'Variation of Traits',
          description: 'Mutations and sexual reproduction create variation.',
          questions: [
            {
              prompt: 'How does sexual reproduction create variation?',
              answer: 'It mixes genes from two parents',
              explanation: 'Offspring get a unique combination.',
            },
            {
              prompt: 'What is a mutation?',
              answer: 'A change in DNA',
              explanation: 'Mutations can create new traits.',
            },
          ],
        },
        {
          name: 'Natural Selection',
          description: 'Organisms with helpful traits survive and pass them on.',
          questions: [
            {
              prompt: 'Why do fast rabbits survive longer when predators are fast?',
              answer: 'They escape predation more often',
              explanation: 'Helpful traits improve survival.',
            },
            {
              prompt: 'Who proposed natural selection as a cause of evolution?',
              answer: 'Charles Darwin',
              explanation: 'Darwin observed and described natural selection.',
            },
          ],
        },
        {
          name: 'Evidence for Evolution',
          description: 'Fossils, DNA, and homologous structures support evolution.',
          questions: [
            {
              prompt: 'Name one type of evidence for evolution.',
              answer: 'Fossils (or DNA similarities, or homologous structures)',
              explanation: 'Multiple lines support evolutionary theory.',
            },
            {
              prompt: 'Why do human and whale forelimbs share similar bones?',
              answer: 'They share a common ancestor',
              explanation: 'Homologous structures indicate shared ancestry.',
            },
          ],
        },
        {
          name: 'Adaptations',
          description: 'Adaptations are traits that help survive in an environment.',
          questions: [
            {
              prompt: 'Why do polar bears have thick fur?',
              answer: 'To stay warm in the cold',
              explanation: 'Fur is an adaptation to the Arctic.',
            },
            {
              prompt: 'Name one adaptation of a cactus.',
              answer: 'Spines (or thick stem, or deep roots)',
              explanation: 'Adaptations help cacti survive dry climates.',
            },
          ],
        },
      ],
    },
    {
      name: 'Chemistry: Atoms, Matter, and the Periodic Table',
      description: 'Classify matter, understand atomic structure, and read the periodic table of elements.',
      lessons: [
        {
          name: 'Atoms and Elements',
          description: 'All matter is made of atoms; each element has unique atoms.',
          questions: [
            {
              prompt: 'What subatomic particle has a positive charge?',
              answer: 'Proton',
              explanation: 'Protons sit in the nucleus.',
            },
            {
              prompt: 'How many elements are on the periodic table (approximately)?',
              answer: 'About 118',
              explanation: 'The modern table has 118 confirmed elements.',
            },
          ],
        },
        {
          name: 'The Periodic Table',
          description: 'Elements are arranged by atomic number and repeating properties.',
          questions: [
            {
              prompt: 'What does the atomic number tell you?',
              answer: 'The number of protons',
              explanation: 'Atomic number equals proton count.',
            },
            {
              prompt: 'Why are elements in the same column similar?',
              answer: 'They have the same number of valence electrons',
              explanation: 'Column (group) members share chemistry.',
            },
          ],
        },
        {
          name: 'Compounds and Molecules',
          description: 'Atoms combine into compounds with new properties.',
          questions: [
            {
              prompt: 'What is the chemical formula for water?',
              answer: 'H2O',
              explanation: 'Two hydrogen atoms bond with one oxygen.',
            },
            {
              prompt: 'Is table salt (NaCl) an element or a compound?',
              answer: 'A compound',
              explanation: 'NaCl has two different elements bonded.',
            },
          ],
        },
        {
          name: 'Pure Substances and Mixtures',
          description: 'Pure substances have one type; mixtures have multiple.',
          questions: [
            {
              prompt: 'Is sugar dissolved in water a compound or a mixture?',
              answer: 'A mixture (solution)',
              explanation: 'The components can be separated.',
            },
            {
              prompt: 'Give an example of a pure substance.',
              answer: 'Gold (or water, or oxygen gas)',
              explanation: 'These contain only one type of particle.',
            },
          ],
        },
        {
          name: 'Scale of the Atom',
          description: 'Atoms are extremely small but make up everything.',
          questions: [
            {
              prompt: 'About how many atoms fit across a grain of sand?',
              answer: 'Many billions',
              explanation: 'Atoms are far smaller than the visible scale.',
            },
            {
              prompt: 'Which is larger: an atom or a molecule of water?',
              answer: 'A molecule',
              explanation: 'Molecules contain multiple atoms.',
            },
          ],
        },
      ],
    },
    {
      name: 'Chemistry: States of Matter and Chemical Reactions',
      description: 'Investigate phase changes, properties of matter, and how atoms rearrange in reactions.',
      lessons: [
        {
          name: 'States of Matter and Particles',
          description: 'Particles move differently in solids, liquids, and gases.',
          questions: [
            {
              prompt: 'How are particles arranged in a solid?',
              answer: 'Tightly packed and vibrating in place',
              explanation: 'Solids have fixed positions.',
            },
            {
              prompt: 'How do gas particles behave differently from liquids?',
              answer: 'They move freely and fill any container',
              explanation: 'Gas particles have much more space between them.',
            },
          ],
        },
        {
          name: 'Phase Changes',
          description: 'Energy causes matter to change between states.',
          questions: [
            {
              prompt: 'What phase change happens when water vapor becomes liquid?',
              answer: 'Condensation',
              explanation: 'Condensation is gas turning to liquid.',
            },
            {
              prompt: 'What happens to particle motion when a solid melts?',
              answer: 'It increases',
              explanation: 'Particles move more freely as they absorb heat.',
            },
          ],
        },
        {
          name: 'Chemical Reactions',
          description: 'Atoms rearrange to form new substances.',
          questions: [
            {
              prompt: 'What is a sign that a chemical reaction happened?',
              answer: 'New color, gas, or heat',
              explanation: 'Reactions often create visible changes.',
            },
            {
              prompt: 'Is burning wood a physical or chemical change?',
              answer: 'Chemical',
              explanation: 'New substances form during combustion.',
            },
          ],
        },
        {
          name: 'Conservation of Mass',
          description: 'In reactions, total mass stays the same.',
          questions: [
            {
              prompt: 'If reactants weigh 20 g and products weigh 20 g, is mass conserved?',
              answer: 'Yes',
              explanation: 'Matter is not created or destroyed in reactions.',
            },
            {
              prompt: 'Why must chemical equations be balanced?',
              answer: 'To show conservation of atoms',
              explanation: 'Equal atoms appear on both sides.',
            },
          ],
        },
        {
          name: 'Endothermic vs Exothermic',
          description: 'Reactions either absorb or release energy.',
          questions: [
            {
              prompt: 'Is a hand warmer that heats up an endothermic or exothermic reaction?',
              answer: 'Exothermic',
              explanation: 'It releases heat.',
            },
            {
              prompt: 'What is endothermic mean?',
              answer: 'It absorbs energy',
              explanation: 'Endothermic reactions take in heat.',
            },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space: Earth in Space',
      description: "Explore Earth's place in the solar system, galaxy, and the observable universe.",
      lessons: [
        {
          name: 'The Solar System',
          description: 'The Sun and planets orbit together in our solar system.',
          questions: [
            {
              prompt: 'How many planets orbit the Sun?',
              answer: 'Eight',
              explanation: 'Mercury through Neptune, with Pluto a dwarf planet.',
            },
            {
              prompt: 'Which planet is closest to the Sun?',
              answer: 'Mercury',
              explanation: 'Mercury orbits innermost.',
            },
          ],
        },
        {
          name: 'Gravity and Orbits',
          description: 'Gravity keeps planets and moons in orbit.',
          questions: [
            {
              prompt: 'Why does the Moon orbit Earth?',
              answer: "Earth's gravity pulls it",
              explanation: 'Gravity provides the centripetal force.',
            },
            {
              prompt: 'Why do outer planets take longer to orbit the Sun?',
              answer: 'They travel a larger orbit at lower speed',
              explanation: 'Greater distance means a longer year.',
            },
          ],
        },
        {
          name: 'Stars and Galaxies',
          description: 'Stars form galaxies; the Sun is one star in the Milky Way.',
          questions: [
            {
              prompt: 'What galaxy is our solar system in?',
              answer: 'The Milky Way',
              explanation: 'The Milky Way holds our Sun and billions of stars.',
            },
            {
              prompt: 'Are all stars the same size as the Sun?',
              answer: 'No',
              explanation: 'Stars vary widely in size and brightness.',
            },
          ],
        },
        {
          name: 'The Observable Universe',
          description: 'The universe contains billions of galaxies.',
          questions: [
            {
              prompt: 'Why can we only observe part of the universe?',
              answer: 'Light from far objects has not yet reached us',
              explanation: 'The observable universe is limited by light travel time.',
            },
            {
              prompt: 'What unit measures huge distances in space?',
              answer: 'Light-years',
              explanation: 'One light-year is the distance light travels in a year.',
            },
          ],
        },
        {
          name: 'Scale of the Universe',
          description: 'Distances in space are vastly greater than on Earth.',
          questions: [
            {
              prompt: 'How long does sunlight take to reach Earth?',
              answer: 'About 8 minutes',
              explanation: 'Light travels the Sun-Earth distance in 8 minutes.',
            },
            {
              prompt: 'Is the Milky Way bigger than our solar system?',
              answer: 'Yes, much bigger',
              explanation: 'Galaxies contain billions of stellar systems.',
            },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space: Earth-Sun-Moon System',
      description: 'Explain seasons, lunar phases, eclipses, and tides from orbital geometry.',
      lessons: [
        {
          name: 'Seasons and Tilt',
          description: "Earth's axial tilt causes seasonal temperature changes.",
          questions: [
            {
              prompt: 'Why is it summer in the Northern Hemisphere in July?',
              answer: 'The North Pole tilts toward the Sun',
              explanation: 'Tilt gives more direct sunlight.',
            },
            {
              prompt: 'What angle is Earth tilt?',
              answer: 'About 23.5 degrees',
              explanation: "Earth's axis is tilted 23.5 degrees.",
            },
          ],
        },
        {
          name: 'Moon Phases',
          description: 'Phases depend on the relative position of the Sun, Earth, and Moon.',
          questions: [
            {
              prompt: 'How long is one full Moon phase cycle?',
              answer: 'About 29.5 days',
              explanation: "A lunar month is the Moon's synodic period.",
            },
            {
              prompt: 'During which phase is the Moon between Earth and Sun?',
              answer: 'New moon',
              explanation: 'In a new moon, the far side faces us unlit.',
            },
          ],
        },
        {
          name: 'Eclipses',
          description: 'Solar eclipses and lunar eclipses occur in specific alignments.',
          questions: [
            {
              prompt: 'What happens during a solar eclipse?',
              answer: 'The Moon blocks the Sun from Earth',
              explanation: "The Moon casts a shadow on Earth's surface.",
            },
            {
              prompt: 'When can a lunar eclipse occur?',
              answer: 'During a full moon when Earth blocks the Sun',
              explanation: "Earth's shadow falls on the Moon.",
            },
          ],
        },
        {
          name: 'Tides',
          description: 'The Moon and Sun gravity create ocean tides.',
          questions: [
            {
              prompt: 'What primarily causes ocean tides?',
              answer: "The Moon's gravity",
              explanation: 'The Moon pulls oceans, creating bulges.',
            },
            {
              prompt: 'How many high tides does a coast typically see each day?',
              answer: 'About two',
              explanation: 'Earth rotates through two tidal bulges daily.',
            },
          ],
        },
        {
          name: 'Day Length and Latitude',
          description: 'Day length varies by latitude and season.',
          questions: [
            {
              prompt: 'Why does the Arctic have 24-hour daylight in summer?',
              answer: 'The pole tilts toward the Sun continuously',
              explanation: 'The Sun does not set at high latitudes in summer.',
            },
            {
              prompt: 'Which place has nearly equal day and night year-round?',
              answer: 'The equator',
              explanation: 'Equatorial regions vary little in day length.',
            },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space: The Geosphere',
      description: 'Study rocks, plate tectonics, the rock cycle, and geologic history of Earth.',
      lessons: [
        {
          name: "Earth's Layers",
          description: 'Earth has crust, mantle, outer core, and inner core.',
          questions: [
            {
              prompt: 'Which layer of Earth is liquid?',
              answer: 'The outer core',
              explanation: 'The outer core is molten metal.',
            },
            {
              prompt: 'What is the thinnest layer of Earth?',
              answer: 'The crust',
              explanation: 'The crust is a thin outer shell.',
            },
          ],
        },
        {
          name: 'Plate Tectonics',
          description: 'Earth crust is broken into plates that move slowly.',
          questions: [
            {
              prompt: 'What happens when two plates collide at a convergent boundary?',
              answer: 'Mountains form or one plate subducts',
              explanation: 'Colliding plates build mountains or trenches.',
            },
            {
              prompt: 'What type of boundary is the San Andreas Fault?',
              answer: 'Transform',
              explanation: 'Plates slide past each other at transforms.',
            },
          ],
        },
        {
          name: 'The Rock Cycle',
          description: 'Rocks change between igneous, sedimentary, and metamorphic.',
          questions: [
            {
              prompt: 'What kind of rock forms from cooled magma?',
              answer: 'Igneous',
              explanation: 'Igneous rocks cool from molten rock.',
            },
            {
              prompt: 'What process turns sediments into sedimentary rock?',
              answer: 'Compaction and cementation',
              explanation: 'Pressure and minerals glue particles together.',
            },
          ],
        },
        {
          name: 'Earthquakes and Volcanoes',
          description: 'Plate motion causes quakes and volcanic activity.',
          questions: [
            {
              prompt: 'What measures the size of an earthquake?',
              answer: 'The magnitude (Richter scale)',
              explanation: 'Magnitude rates the energy released.',
            },
            {
              prompt: 'Why are volcanoes common near plate boundaries?',
              answer: 'Magma rises where plates interact',
              explanation: 'Subduction and rifts feed volcanoes.',
            },
          ],
        },
        {
          name: 'Geologic Time',
          description: 'Earth is billions of years old, recorded in rocks and fossils.',
          questions: [
            {
              prompt: 'About how old is Earth?',
              answer: '4.5 billion years',
              explanation: 'Radioactive dating of rocks gives this age.',
            },
            {
              prompt: 'What do fossils tell us?',
              answer: 'About past life and environments',
              explanation: 'Fossils record ancient species and conditions.',
            },
          ],
        },
      ],
    },
    {
      name: 'Earth and Space: Earth and Society',
      description: 'Evaluate natural resources, hazards, climate change, and human impact on the planet.',
      lessons: [
        {
          name: 'Natural Resources',
          description: 'Resources include water, minerals, soil, and energy sources.',
          questions: [
            {
              prompt: 'What is a renewable resource?',
              answer: 'One that replenishes naturally',
              explanation: 'Wind and solar are renewable.',
            },
            {
              prompt: 'Name a nonrenewable energy source.',
              answer: 'Coal (or oil, or natural gas)',
              explanation: 'Fossil fuels take millions of years to form.',
            },
          ],
        },
        {
          name: 'Natural Hazards',
          description: 'Floods, storms, and quakes threaten communities.',
          questions: [
            {
              prompt: 'How can cities prepare for earthquakes?',
              answer: 'Build flexible structures and warn residents',
              explanation: 'Engineering reduces damage and deaths.',
            },
            {
              prompt: 'What is the difference between weather and climate?',
              answer: 'Weather is short term; climate is long term',
              explanation: 'Climate averages decades of weather.',
            },
          ],
        },
        {
          name: 'Climate Change',
          description: 'Human greenhouse gas emissions warm the planet.',
          questions: [
            {
              prompt: 'What gas is the main driver of recent climate change?',
              answer: 'Carbon dioxide',
              explanation: 'CO2 from burning fuels traps heat.',
            },
            {
              prompt: 'What are two impacts of climate change?',
              answer: 'Rising sea levels and more extreme weather',
              explanation: 'Warming disrupts many Earth systems.',
            },
          ],
        },
        {
          name: 'Human Impact',
          description: 'Pollution, deforestation, and overuse change Earth systems.',
          questions: [
            {
              prompt: 'How does deforestation affect the atmosphere?',
              answer: 'It raises CO2 since trees absorb less',
              explanation: 'Trees store carbon; removing them releases it.',
            },
            {
              prompt: 'Name one way to reduce plastic pollution.',
              answer: 'Use reusable bottles (or recycle)',
              explanation: 'Less single-use plastic reduces waste.',
            },
          ],
        },
        {
          name: 'Sustainability',
          description: 'Sustainability balances resource use with preservation.',
          questions: [
            {
              prompt: 'What does sustainable mean?',
              answer: 'Able to continue without harm',
              explanation: 'Sustainable practices protect future resources.',
            },
            {
              prompt: 'Name a sustainable energy source.',
              answer: 'Solar (or wind, or hydro)',
              explanation: 'These renewable sources produce little pollution.',
            },
          ],
        },
      ],
    },
  ],
};
