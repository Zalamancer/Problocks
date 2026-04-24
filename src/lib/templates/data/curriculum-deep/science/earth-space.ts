import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '12',
  label: 'Earth/Space Science & AP Electives',
  sourceUrl: 'https://www.khanacademy.org/science/cosmology-and-astronomy',
  units: [
    {
      name: 'Scale of the Universe',
      description: 'Compare sizes from subatomic particles to galaxy superclusters.',
      lessons: [
        {
          name: 'Powers of Ten',
          description: 'Use scientific notation to compare vastly different scales.',
          questions: [
            { prompt: 'Diameter of an atom is ~10^-10 m. Diameter of Earth is ~10^7 m. How many orders of magnitude apart?', answer: '17 orders of magnitude', explanation: '7 - (-10) = 17.' },
            { prompt: 'About how many atoms wide is a human hair (~10^-4 m wide)?', answer: 'About 10^6 atoms', explanation: '10^-4 / 10^-10 = 10^6.' },
          ],
        },
        {
          name: 'The Solar System',
          description: 'Identify planets, dwarf planets, and orbital structure.',
          questions: [
            { prompt: 'Distance from Earth to Sun (1 AU)?', answer: '≈ 1.496 x 10^11 m (≈ 150 million km)', explanation: 'Takes light about 8 minutes to arrive.' },
            { prompt: 'How many planets in our solar system?', answer: '8 (Pluto reclassified as dwarf planet in 2006)', explanation: 'Mercury to Neptune.' },
          ],
        },
        {
          name: 'Light-Years and Parsecs',
          description: 'Measure astronomical distances using time and parallax.',
          questions: [
            { prompt: 'How far does light travel in one year (roughly)?', answer: '≈ 9.46 x 10^15 m (one light-year)', explanation: 'c = 3 x 10^8 m/s times 3.15 x 10^7 s.' },
            { prompt: 'Nearest star to the Sun (besides Sun)?', answer: 'Proxima Centauri (~4.24 light-years away)', explanation: 'Part of the Alpha Centauri triple system.' },
          ],
        },
        {
          name: 'The Milky Way Galaxy',
          description: 'Describe the structure of our galaxy.',
          questions: [
            { prompt: 'Approximately how many stars in the Milky Way?', answer: '100-400 billion', explanation: 'Best estimates range from 10^11 to 4 x 10^11.' },
            { prompt: 'Where in the galaxy is our Solar System?', answer: 'In the Orion arm, roughly 26,000 light-years from the center.', explanation: 'About 2/3 of the way from center to edge.' },
          ],
        },
        {
          name: 'Galactic Clusters and Cosmic Web',
          description: 'Introduce galaxy groups, clusters, and large-scale structure.',
          questions: [
            { prompt: 'Name the galaxy cluster containing the Milky Way.', answer: 'Local Group', explanation: 'Contains ~80 galaxies, including Andromeda and the Magellanic Clouds.' },
            { prompt: 'What holds galaxy clusters together?', answer: 'Gravity (including dark matter).', explanation: 'Most mass in clusters is invisible dark matter.' },
          ],
        },
      ],
    },
    {
      name: 'Stars, Black Holes, and Galaxies',
      description: 'Trace stellar life cycles, supernovae, black holes, and galactic structure.',
      lessons: [
        {
          name: 'Stellar Nucleosynthesis',
          description: 'Stars fuse hydrogen into helium and heavier elements.',
          questions: [
            { prompt: 'What is the main fuel the Sun is currently fusing?', answer: 'Hydrogen (into helium)', explanation: 'Proton-proton chain in the core.' },
            { prompt: 'Elements heavier than iron form mostly where?', answer: 'Supernova explosions (and neutron star mergers).', explanation: 'Fusion up to iron occurs in stars; beyond that needs energy input.' },
          ],
        },
        {
          name: 'Hertzsprung-Russell Diagram',
          description: 'Plot stars by luminosity vs temperature.',
          questions: [
            { prompt: 'Where do most stars lie on the H-R diagram?', answer: 'The main sequence (diagonal band).', explanation: 'Where stars spend most of their lives fusing H to He.' },
            { prompt: 'Red giants are cooler than main-sequence stars. Why are they brighter?', answer: 'They are much larger, so total luminosity is greater.', explanation: 'L = 4πR^2σT^4; larger R wins despite lower T.' },
          ],
        },
        {
          name: 'Stellar Death',
          description: 'Low-mass vs high-mass end states: white dwarfs, neutron stars, black holes.',
          questions: [
            { prompt: 'What will the Sun become at the end of its life?', answer: 'White dwarf (after red giant phase)', explanation: 'Too low in mass for supernova.' },
            { prompt: 'Minimum mass for a star to collapse into a black hole?', answer: 'Roughly 20+ solar masses initially.', explanation: 'The remnant core must exceed ~3 solar masses.' },
          ],
        },
        {
          name: 'Black Holes',
          description: 'Describe event horizons, singularities, and Schwarzschild radius.',
          questions: [
            { prompt: 'What is the event horizon?', answer: 'The boundary beyond which nothing can escape, not even light.', explanation: 'Defined by the Schwarzschild radius.' },
            { prompt: 'What lies at the center of our Milky Way galaxy?', answer: 'Supermassive black hole Sagittarius A* (~4 million solar masses)', explanation: 'Imaged by the Event Horizon Telescope in 2022.' },
          ],
        },
        {
          name: 'Types of Galaxies',
          description: 'Classify spiral, elliptical, and irregular galaxies.',
          questions: [
            { prompt: 'What shape is the Milky Way galaxy?', answer: 'Barred spiral', explanation: 'It has spiral arms and a central bar.' },
            { prompt: 'Which galaxy type generally has the oldest stars?', answer: 'Elliptical', explanation: 'Little gas for new star formation.' },
          ],
        },
      ],
    },
    {
      name: 'Earth\'s Geological and Climatic History',
      description: 'Study plate tectonics, rock record, ice ages, and climate cycles.',
      lessons: [
        {
          name: 'Plate Tectonics',
          description: 'Explain how lithospheric plates move and interact.',
          questions: [
            { prompt: 'What drives plate motion?', answer: 'Convection currents in the mantle (and slab pull).', explanation: 'Hot rock rises, cool rock sinks.' },
            { prompt: 'Give an example of a convergent boundary.', answer: 'Himalayas (India-Eurasia) or Andes (Nazca-South America).', explanation: 'Plates collide, causing mountain building or subduction.' },
          ],
        },
        {
          name: 'Rock Cycle',
          description: 'Trace transitions among igneous, sedimentary, and metamorphic rocks.',
          questions: [
            { prompt: 'What process turns sediment into sedimentary rock?', answer: 'Compaction and cementation (lithification)', explanation: 'Pressure and mineral cements bind grains.' },
            { prompt: 'How does igneous rock form?', answer: 'From cooled and solidified magma or lava.', explanation: 'Intrusive cools slowly (granite); extrusive cools fast (basalt).' },
          ],
        },
        {
          name: 'Geologic Time Scale',
          description: 'Divide Earth\'s history into eons, eras, and periods.',
          questions: [
            { prompt: 'Approximate age of Earth?', answer: '4.54 billion years', explanation: 'Determined from oldest meteorites and zircon crystals.' },
            { prompt: 'What era are we in now?', answer: 'Cenozoic era (age of mammals)', explanation: 'Began ~66 Ma after the dinosaur extinction.' },
          ],
        },
        {
          name: 'Ice Ages and Milankovitch Cycles',
          description: 'Link Earth\'s orbit variations to long-term climate change.',
          questions: [
            { prompt: 'Name the three Milankovitch cycles.', answer: 'Eccentricity, obliquity (axial tilt), and precession.', explanation: 'Each affects solar insolation on 10,000-100,000 year cycles.' },
            { prompt: 'When did the last glacial maximum end?', answer: 'About 20,000 years ago', explanation: 'Holocene began ~11,700 years ago.' },
          ],
        },
        {
          name: 'Climate Change',
          description: 'Contrast natural cycles with modern anthropogenic warming.',
          questions: [
            { prompt: 'Main greenhouse gas responsible for current warming?', answer: 'Carbon dioxide (CO2)', explanation: 'Methane and water vapor also contribute.' },
            { prompt: 'Pre-industrial atmospheric CO2 was ~280 ppm. Current (2024) is about?', answer: '≈ 420 ppm', explanation: 'Roughly 50% increase since 1850.' },
          ],
        },
      ],
    },
    {
      name: 'Life on Earth and in the Universe',
      description: 'Examine origins of life, civilization, and search for extraterrestrial life.',
      lessons: [
        {
          name: 'Origins of Life',
          description: 'Explore abiogenesis hypotheses and early Earth conditions.',
          questions: [
            { prompt: 'What did the Miller-Urey experiment demonstrate?', answer: 'Amino acids can form from simple inorganic molecules under early-Earth conditions.', explanation: 'Supported abiogenesis hypothesis.' },
            { prompt: 'When did life first appear on Earth (earliest evidence)?', answer: 'About 3.5-3.8 billion years ago', explanation: 'Microfossils and stromatolites provide evidence.' },
          ],
        },
        {
          name: 'Evolution of Complex Life',
          description: 'Follow the Cambrian explosion and rise of multicellular organisms.',
          questions: [
            { prompt: 'What dramatic event occurred ~540 million years ago?', answer: 'Cambrian explosion - rapid diversification of complex life.', explanation: 'Most modern animal phyla appear in the fossil record.' },
            { prompt: 'Earth\'s atmosphere became oxygen-rich due to what organisms?', answer: 'Cyanobacteria (blue-green algae)', explanation: 'The Great Oxygenation Event was ~2.4 billion years ago.' },
          ],
        },
        {
          name: 'Habitable Zones',
          description: 'Define conditions required for liquid water and life.',
          questions: [
            { prompt: 'What defines a star\'s "habitable zone"?', answer: 'The range of orbital distances where liquid water can exist.', explanation: 'Sometimes called the "Goldilocks Zone."' },
            { prompt: 'Is Mars inside the Sun\'s habitable zone?', answer: 'At the outer edge, marginal.', explanation: 'Mars likely had surface water billions of years ago.' },
          ],
        },
        {
          name: 'SETI and the Drake Equation',
          description: 'Estimate probability of communicative alien civilizations.',
          questions: [
            { prompt: 'What does SETI stand for?', answer: 'Search for Extraterrestrial Intelligence', explanation: 'Listens for radio signals from space.' },
            { prompt: 'Why hasn\'t SETI found confirmed signals?', answer: 'Possibly rare intelligent life, vast distances, or communication timescales.', explanation: 'This is the "Fermi paradox."' },
          ],
        },
        {
          name: 'Exoplanet Detection',
          description: 'Introduce transit, radial velocity, and direct imaging methods.',
          questions: [
            { prompt: 'What method did Kepler use to find most exoplanets?', answer: 'Transit method (star brightness dips)', explanation: 'Measures tiny drops as planet crosses the star.' },
            { prompt: 'Roughly how many confirmed exoplanets as of recent counts?', answer: 'Over 5,000', explanation: 'First confirmed in 1992; NASA Exoplanet Archive tracks the total.' },
          ],
        },
      ],
    },
    {
      name: 'AP Biology Capstone Topics',
      description: 'Deep dive into chemistry of life, cellular energetics, heredity, and ecology.',
      lessons: [
        {
          name: 'Chemistry of Life',
          description: 'Review water properties and biomolecules essential to life.',
          questions: [
            { prompt: 'Why is water a good solvent for life?', answer: 'Its polarity and hydrogen bonding dissolve many substances.', explanation: 'Enables transport and biochemical reactions.' },
            { prompt: 'Name the four major classes of biomolecules.', answer: 'Carbohydrates, lipids, proteins, and nucleic acids.', explanation: 'All built from carbon-based monomers.' },
          ],
        },
        {
          name: 'Cellular Energetics (Advanced)',
          description: 'Dissect photosynthesis and respiration in detail.',
          questions: [
            { prompt: 'What is chemiosmosis?', answer: 'The movement of ions (usually H+) across a membrane to drive ATP synthesis.', explanation: 'Coupling of ETC to ATP synthase.' },
            { prompt: 'Where does the Calvin cycle occur?', answer: 'Stroma of the chloroplast', explanation: 'Uses ATP and NADPH from light reactions to fix CO2.' },
          ],
        },
        {
          name: 'Heredity (Advanced)',
          description: 'Examine linkage, recombination, and chromosomal basis of inheritance.',
          questions: [
            { prompt: 'What is gene linkage?', answer: 'Genes located close on the same chromosome are inherited together.', explanation: 'They do not assort independently.' },
            { prompt: 'What map unit distance corresponds to 1% recombination frequency?', answer: '1 centimorgan (cM)', explanation: 'Used in gene mapping.' },
          ],
        },
        {
          name: 'Gene Expression Regulation',
          description: 'Trace operons, transcription factors, and epigenetics.',
          questions: [
            { prompt: 'What epigenetic modification typically silences genes?', answer: 'DNA methylation (at cytosine bases)', explanation: 'Adds methyl groups, preventing transcription.' },
            { prompt: 'What is an enhancer?', answer: 'A DNA region that boosts transcription of a distant gene.', explanation: 'Bound by activators that loop DNA to promoter.' },
          ],
        },
        {
          name: 'Population Ecology (Advanced)',
          description: 'Quantify population dynamics using logistic and exponential models.',
          questions: [
            { prompt: 'Write the logistic growth equation.', answer: 'dN/dt = rN(1 - N/K)', explanation: 'Growth slows as N approaches carrying capacity K.' },
            { prompt: 'What is r in population models?', answer: 'Intrinsic rate of natural increase (per capita growth rate)', explanation: 'Difference between birth and death rates.' },
          ],
        },
      ],
    },
    {
      name: 'AP Chemistry Capstone Topics',
      description: 'Advanced coverage of kinetics, equilibrium, thermodynamics, and electrochemistry.',
      lessons: [
        {
          name: 'Chemical Kinetics',
          description: 'Study reaction rates and rate laws.',
          questions: [
            { prompt: 'What does a rate constant k depend on?', answer: 'Temperature and the presence of catalysts.', explanation: 'Arrhenius: k = A*e^(-Ea/RT).' },
            { prompt: 'Doubling [A] in a second-order reaction does what to the rate?', answer: 'Quadruples it (rate ∝ [A]^2).', explanation: 'Rate = k[A]^2.' },
          ],
        },
        {
          name: 'Equilibrium and Le Chatelier',
          description: 'Apply Kc, Kp, and shifts in response to stress.',
          questions: [
            { prompt: 'Increasing pressure shifts equilibrium which way?', answer: 'Toward the side with fewer moles of gas.', explanation: 'System relieves the stress.' },
            { prompt: 'If Kc > 1, do products or reactants dominate at equilibrium?', answer: 'Products', explanation: 'Kc = [products]/[reactants] at equilibrium.' },
          ],
        },
        {
          name: 'Acid-Base Equilibria',
          description: 'Calculate pH of weak acids/bases and buffers.',
          questions: [
            { prompt: 'What is the pKa if Ka = 1 x 10^-5?', answer: '5', explanation: 'pKa = -log(Ka) = 5.' },
            { prompt: 'Henderson-Hasselbalch equation for a buffer?', answer: 'pH = pKa + log([A-]/[HA])', explanation: 'Gives buffer pH from component concentrations.' },
          ],
        },
        {
          name: 'Thermodynamics and Spontaneity',
          description: 'Use ΔG = ΔH - TΔS to predict reaction direction.',
          questions: [
            { prompt: 'When is a reaction spontaneous?', answer: 'When ΔG < 0 (negative Gibbs free energy)', explanation: 'Energetically favorable under given T.' },
            { prompt: 'ΔH > 0 and ΔS > 0. What condition makes this spontaneous?', answer: 'High temperature', explanation: 'TΔS must exceed ΔH for ΔG to be negative.' },
          ],
        },
        {
          name: 'Electrochemistry',
          description: 'Analyze galvanic cells, standard reduction potentials, and Faraday\'s laws.',
          questions: [
            { prompt: 'In a galvanic cell, which electrode is the anode?', answer: 'Where oxidation occurs (negative terminal in galvanic cell).', explanation: 'Remember: An Ox (anode = oxidation).' },
            { prompt: 'If E°_cell is positive, is the redox reaction spontaneous?', answer: 'Yes', explanation: 'ΔG° = -nFE°_cell; negative ΔG means spontaneous.' },
          ],
        },
      ],
    },
    {
      name: 'AP Physics 1 Capstone Topics',
      description: 'Advanced study of rotational dynamics, oscillations, fluids, and waves.',
      lessons: [
        {
          name: 'Rotational Motion',
          description: 'Introduce angular velocity, torque, and moment of inertia.',
          questions: [
            { prompt: 'What is the rotational analog of mass?', answer: 'Moment of inertia (I)', explanation: 'Depends on mass and how it is distributed.' },
            { prompt: 'Torque τ = rFsin(θ). When is torque maximum?', answer: 'When force is perpendicular to lever arm (θ = 90°)', explanation: 'sin(90°) = 1.' },
          ],
        },
        {
          name: 'Angular Momentum',
          description: 'L = Iω is conserved without external torque.',
          questions: [
            { prompt: 'A spinning figure skater pulls in her arms. What happens to her angular velocity?', answer: 'Increases (I decreases, ω increases to conserve L).', explanation: 'L = Iω is conserved.' },
            { prompt: 'Unit of angular momentum?', answer: 'kg·m^2/s', explanation: 'Mass times length squared per time.' },
          ],
        },
        {
          name: 'Simple Harmonic Motion',
          description: 'Model springs and pendulums with sinusoidal oscillations.',
          questions: [
            { prompt: 'Period of a mass-spring: T = 2π*sqrt(m/k). If k doubles, T changes how?', answer: 'T decreases by factor of sqrt(2)', explanation: 'T ∝ 1/sqrt(k).' },
            { prompt: 'At max displacement of a pendulum, kinetic energy is?', answer: 'Zero', explanation: 'All energy is potential at turning points.' },
          ],
        },
        {
          name: 'Fluids',
          description: 'Study pressure, buoyancy, and Bernoulli\'s principle.',
          questions: [
            { prompt: 'Archimedes\' principle: buoyant force equals what?', answer: 'Weight of displaced fluid', explanation: 'F_buoyant = ρ_fluid * V_displaced * g.' },
            { prompt: 'Bernoulli: as fluid speed increases, pressure does what?', answer: 'Decreases', explanation: 'Used to explain airplane lift.' },
          ],
        },
        {
          name: 'Mechanical Waves Review',
          description: 'Extend wave concepts with resonance and beats.',
          questions: [
            { prompt: 'What is resonance?', answer: 'Amplitude maximization when driving frequency matches natural frequency.', explanation: 'Causes catastrophic failures (e.g., Tacoma Narrows Bridge).' },
            { prompt: 'Two tuning forks at 440 Hz and 442 Hz produce what?', answer: 'Beats at 2 Hz.', explanation: 'Beat frequency = difference of the two frequencies.' },
          ],
        },
      ],
    },
    {
      name: 'Environmental Science and Sustainability',
      description: 'Analyze human impact, energy resources, and sustainability.',
      lessons: [
        {
          name: 'Energy Resources',
          description: 'Compare renewable and nonrenewable energy sources.',
          questions: [
            { prompt: 'Name three renewable energy sources.', answer: 'Solar, wind, hydroelectric (also geothermal, biomass).', explanation: 'Naturally replenished on human timescales.' },
            { prompt: 'What is the main source of carbon emissions from electricity?', answer: 'Burning coal, natural gas, and oil (fossil fuels)', explanation: 'Release CO2 when combusted.' },
          ],
        },
        {
          name: 'Pollution',
          description: 'Survey air, water, and soil pollution and mitigation strategies.',
          questions: [
            { prompt: 'What gas causes acid rain?', answer: 'Sulfur dioxide (SO2), also nitrogen oxides.', explanation: 'React with water to form H2SO4 and HNO3.' },
            { prompt: 'What is eutrophication?', answer: 'Excess nutrients cause algal blooms, oxygen depletion, and fish kills.', explanation: 'Often caused by agricultural runoff.' },
          ],
        },
        {
          name: 'Ozone Depletion',
          description: 'Understand CFCs and the Montreal Protocol.',
          questions: [
            { prompt: 'Which layer of the atmosphere contains the "ozone layer"?', answer: 'Stratosphere', explanation: '~10-50 km above Earth.' },
            { prompt: 'Which agreement phased out ozone-depleting substances?', answer: 'Montreal Protocol (1987)', explanation: 'Widely considered the most successful environmental treaty.' },
          ],
        },
        {
          name: 'Biodiversity Loss',
          description: 'Identify extinction drivers and conservation priorities.',
          questions: [
            { prompt: 'What is a biodiversity hotspot?', answer: 'A region with high endemic species and significant habitat loss.', explanation: 'Prioritized for conservation funding.' },
            { prompt: 'Name the "sixth mass extinction."', answer: 'The current human-caused extinction event (Holocene/Anthropocene).', explanation: 'Rate is 100-1000x background levels.' },
          ],
        },
        {
          name: 'Sustainability and Mitigation',
          description: 'Evaluate strategies for a sustainable future.',
          questions: [
            { prompt: 'Name three pillars of sustainability.', answer: 'Environmental, economic, and social (people, planet, profit).', explanation: 'Balanced to meet present needs without harming future.' },
            { prompt: 'What does "carbon neutral" mean?', answer: 'Net zero CO2 emissions - any released is offset or absorbed.', explanation: 'Achieved through offsets, renewables, or carbon capture.' },
          ],
        },
      ],
    },
  ],
};
