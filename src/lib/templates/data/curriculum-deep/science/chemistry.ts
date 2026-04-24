import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '10',
  label: 'High School Chemistry',
  sourceUrl: 'https://www.khanacademy.org/science/high-school-chemistry',
  units: [
    {
      name: 'Atoms, Isotopes, and Ions',
      description: 'Study atomic structure, isotopes, ion formation, and electron configurations.',
      lessons: [
        {
          name: 'Subatomic Particles',
          description: 'Identify protons, neutrons, and electrons along with their charges.',
          questions: [
            { prompt: 'Which subatomic particle determines the element identity?', answer: 'Proton', explanation: 'The atomic number equals the number of protons.' },
            { prompt: 'What charge does a neutron carry?', answer: 'Zero (neutral)', explanation: 'Neutrons have mass but no electrical charge.' },
          ],
        },
        {
          name: 'Atomic Number and Mass Number',
          description: 'Calculate protons, neutrons, and electrons from isotope symbols.',
          questions: [
            { prompt: 'How many neutrons does carbon-14 contain?', answer: '8 neutrons', explanation: 'Mass 14 minus atomic number 6 (protons) = 8 neutrons.' },
            { prompt: 'What is the atomic number of an atom with 17 protons?', answer: '17 (chlorine)', explanation: 'Atomic number equals number of protons.' },
          ],
        },
        {
          name: 'Isotopes and Average Atomic Mass',
          description: 'Compute weighted averages of isotopes found in nature.',
          questions: [
            { prompt: 'Chlorine-35 (75%) and chlorine-37 (25%). What is the average atomic mass?', answer: '35.5 amu', explanation: '(0.75 * 35) + (0.25 * 37) = 26.25 + 9.25 = 35.5.' },
            { prompt: 'Do isotopes of an element have the same chemical properties?', answer: 'Yes', explanation: 'Electron configuration is unchanged; only mass differs.' },
          ],
        },
        {
          name: 'Ion Formation',
          description: 'Explain how atoms gain or lose electrons to form stable ions.',
          questions: [
            { prompt: 'How many electrons does Mg^2+ have?', answer: '10 electrons', explanation: 'Neutral Mg has 12; losing 2 gives 10 (neon configuration).' },
            { prompt: 'Does a nonmetal typically gain or lose electrons when forming ions?', answer: 'Gains electrons (forming anions)', explanation: 'Nonmetals achieve noble gas configuration by gaining electrons.' },
          ],
        },
        {
          name: 'Electron Configurations',
          description: 'Fill orbitals using the Aufbau principle and Hund\'s rule.',
          questions: [
            { prompt: 'Write the electron configuration of oxygen (Z = 8).', answer: '1s^2 2s^2 2p^4', explanation: 'Two electrons in 1s, two in 2s, four in 2p.' },
            { prompt: 'How many valence electrons does phosphorus have?', answer: '5', explanation: 'Group 15 elements have 5 valence electrons.' },
          ],
        },
      ],
    },
    {
      name: 'Atomic Models and Periodicity',
      description: 'Explore quantum models of the atom and periodic trends.',
      lessons: [
        {
          name: 'Evolution of Atomic Models',
          description: 'Trace from Dalton to the quantum mechanical model.',
          questions: [
            { prompt: 'Whose experiment discovered the atomic nucleus?', answer: 'Ernest Rutherford (gold foil experiment)', explanation: 'Alpha particles occasionally bounced back, revealing a dense positive core.' },
            { prompt: 'Which model treats electrons as probability clouds?', answer: 'Quantum mechanical (Schrödinger) model', explanation: 'Orbitals represent regions of highest electron probability.' },
          ],
        },
        {
          name: 'Atomic Radius Trend',
          description: 'Predict how atomic size changes across the periodic table.',
          questions: [
            { prompt: 'Does atomic radius increase or decrease across a period left to right?', answer: 'Decreases', explanation: 'More protons pull electrons closer without adding shells.' },
            { prompt: 'Which is larger: Na or K?', answer: 'K (potassium)', explanation: 'K has one more electron shell than Na.' },
          ],
        },
        {
          name: 'Ionization Energy',
          description: 'Describe the energy needed to remove an electron and its trends.',
          questions: [
            { prompt: 'How does ionization energy change down a group?', answer: 'Decreases', explanation: 'Outer electrons are farther from the nucleus and easier to remove.' },
            { prompt: 'Which element has the highest first ionization energy?', answer: 'Helium', explanation: 'Small size and full outer shell make it hardest to ionize.' },
          ],
        },
        {
          name: 'Electronegativity',
          description: 'Measure an atom\'s ability to attract bonding electrons.',
          questions: [
            { prompt: 'Which element has the highest electronegativity on the Pauling scale?', answer: 'Fluorine (3.98)', explanation: 'Smallest, most electronegative element.' },
            { prompt: 'Rank these by electronegativity: Na, Cl, H.', answer: 'Cl > H > Na', explanation: 'Pauling values: Cl = 3.16, H = 2.20, Na = 0.93.' },
          ],
        },
        {
          name: 'Periodic Law and Group Properties',
          description: 'Explain why elements in the same group have similar behavior.',
          questions: [
            { prompt: 'Why do Group 1 metals react similarly?', answer: 'They all have 1 valence electron.', explanation: 'Chemical properties depend on valence electron configuration.' },
            { prompt: 'What group contains the most unreactive elements?', answer: 'Group 18 (noble gases)', explanation: 'Full valence shells make them stable.' },
          ],
        },
      ],
    },
    {
      name: 'Chemical Bonding and Nomenclature',
      description: 'Compare ionic, covalent, and metallic bonding and name compounds.',
      lessons: [
        {
          name: 'Ionic vs Covalent Bonding',
          description: 'Distinguish electron transfer from electron sharing.',
          questions: [
            { prompt: 'Is NaCl ionic or covalent?', answer: 'Ionic', explanation: 'Electronegativity difference between Na and Cl is >1.7.' },
            { prompt: 'What type of bond forms between two fluorine atoms?', answer: 'Nonpolar covalent bond', explanation: 'Identical atoms share electrons equally.' },
          ],
        },
        {
          name: 'Naming Ionic Compounds',
          description: 'Write names and formulas for binary and polyatomic ionic compounds.',
          questions: [
            { prompt: 'Name the compound MgCl2.', answer: 'Magnesium chloride', explanation: 'Metal first, then nonmetal with -ide ending.' },
            { prompt: 'Write the formula for calcium nitrate.', answer: 'Ca(NO3)2', explanation: 'Ca^2+ balances with two NO3^- polyatomic ions.' },
          ],
        },
        {
          name: 'Naming Covalent Compounds',
          description: 'Use Greek prefixes to name binary molecular compounds.',
          questions: [
            { prompt: 'Name the compound N2O4.', answer: 'Dinitrogen tetroxide', explanation: 'Greek prefixes indicate the number of each atom.' },
            { prompt: 'Write the formula for carbon tetrachloride.', answer: 'CCl4', explanation: '"Tetra" means four Cl atoms.' },
          ],
        },
        {
          name: 'Metallic Bonding',
          description: 'Understand the electron sea model and properties of metals.',
          questions: [
            { prompt: 'Why do metals conduct electricity?', answer: 'Delocalized valence electrons flow freely.', explanation: 'The electron sea transmits charge easily.' },
            { prompt: 'Why are metals malleable?', answer: 'Layers of cations can slide past each other without breaking bonds.', explanation: 'The electron sea holds the lattice together during deformation.' },
          ],
        },
        {
          name: 'Lewis Structures',
          description: 'Draw valence electron arrangements for simple molecules.',
          questions: [
            { prompt: 'How many total valence electrons are in CO2?', answer: '16 electrons', explanation: 'C = 4, O = 6 each; 4 + 6 + 6 = 16.' },
            { prompt: 'How many lone pairs are on each oxygen in CO2?', answer: '2 lone pairs each', explanation: 'Each O forms a double bond with C and keeps 2 lone pairs.' },
          ],
        },
      ],
    },
    {
      name: 'Molecular Geometry and Intermolecular Forces',
      description: 'Use VSEPR to predict shapes and link polarity to attractions.',
      lessons: [
        {
          name: 'VSEPR Theory',
          description: 'Predict molecular shape from the number of electron domains.',
          questions: [
            { prompt: 'What is the shape of CH4?', answer: 'Tetrahedral', explanation: 'Four bonding pairs arrange at 109.5 degrees.' },
            { prompt: 'What is the shape of H2O?', answer: 'Bent (angular)', explanation: '2 bonding pairs + 2 lone pairs give ~104.5 degree angle.' },
          ],
        },
        {
          name: 'Polarity of Molecules',
          description: 'Determine overall polarity from bonds and geometry.',
          questions: [
            { prompt: 'Is CCl4 polar or nonpolar?', answer: 'Nonpolar', explanation: 'Tetrahedral symmetry cancels out bond dipoles.' },
            { prompt: 'Is NH3 polar or nonpolar?', answer: 'Polar', explanation: 'Trigonal pyramidal shape leaves a net dipole.' },
          ],
        },
        {
          name: 'London Dispersion Forces',
          description: 'Describe temporary dipoles that attract all molecules.',
          questions: [
            { prompt: 'Which has stronger dispersion forces: Ne or Xe?', answer: 'Xe', explanation: 'More electrons create stronger temporary dipoles.' },
            { prompt: 'Do dispersion forces exist between all molecules?', answer: 'Yes', explanation: 'They are the weakest force but always present.' },
          ],
        },
        {
          name: 'Dipole-Dipole Forces',
          description: 'Explain attractions between permanent dipoles in polar molecules.',
          questions: [
            { prompt: 'Which intermolecular force acts between HCl molecules?', answer: 'Dipole-dipole (and dispersion)', explanation: 'HCl is polar due to the large electronegativity difference.' },
            { prompt: 'Rank dipole-dipole vs dispersion in strength.', answer: 'Dipole-dipole is generally stronger (for similar size molecules).', explanation: 'Permanent dipoles interact more strongly than temporary ones.' },
          ],
        },
        {
          name: 'Hydrogen Bonding',
          description: 'Identify the strong attraction when H bonds to N, O, or F.',
          questions: [
            { prompt: 'Why does water boil at 100 C while H2S boils at -60 C?', answer: 'Water has hydrogen bonding; H2S does not.', explanation: 'Hydrogen bonds are far stronger than regular dipole-dipole forces.' },
            { prompt: 'Name the three atoms that enable hydrogen bonding.', answer: 'N, O, and F', explanation: 'Small, highly electronegative atoms with lone pairs.' },
          ],
        },
      ],
    },
    {
      name: 'Stoichiometry and the Mole',
      description: 'Use the mole to balance equations and calculate reaction quantities.',
      lessons: [
        {
          name: 'The Mole Concept',
          description: 'Use Avogadro\'s number to convert between moles and particles.',
          questions: [
            { prompt: 'How many atoms are in 2.0 moles of helium?', answer: '1.2 x 10^24 atoms', explanation: '2 * 6.022 x 10^23 = 1.2 x 10^24.' },
            { prompt: 'What is 1 mole of anything equal to?', answer: '6.022 x 10^23 particles (Avogadro\'s number)', explanation: 'Applies to atoms, molecules, or ions.' },
          ],
        },
        {
          name: 'Molar Mass',
          description: 'Sum atomic masses to find grams per mole.',
          questions: [
            { prompt: 'What is the molar mass of water?', answer: '18.0 g/mol', explanation: '2(1.0) + 16.0 = 18.0.' },
            { prompt: 'How many moles are in 44 g of CO2?', answer: '1.0 mol', explanation: 'Molar mass of CO2 = 44 g/mol, so 44/44 = 1.' },
          ],
        },
        {
          name: 'Balancing Equations',
          description: 'Apply conservation of mass to chemical reactions.',
          questions: [
            { prompt: 'Balance: H2 + O2 -> H2O', answer: '2 H2 + O2 -> 2 H2O', explanation: 'Four H and two O on each side.' },
            { prompt: 'Balance: CH4 + O2 -> CO2 + H2O', answer: 'CH4 + 2 O2 -> CO2 + 2 H2O', explanation: 'One C, four H, and four O on each side.' },
          ],
        },
        {
          name: 'Mole-to-Mole Stoichiometry',
          description: 'Use coefficient ratios to convert between reactant and product moles.',
          questions: [
            { prompt: 'Given N2 + 3 H2 -> 2 NH3, how many moles of NH3 form from 6 mol H2?', answer: '4 mol NH3', explanation: '6 mol H2 * (2 NH3 / 3 H2) = 4 mol.' },
            { prompt: 'How many moles of O2 are needed to react with 4 mol H2?', answer: '2 mol O2', explanation: 'From 2 H2 + O2 -> 2 H2O, ratio is 4 H2 : 2 O2.' },
          ],
        },
        {
          name: 'Limiting Reactants and Percent Yield',
          description: 'Identify the limiting reactant and compare actual to theoretical yield.',
          questions: [
            { prompt: 'If 2 mol H2 react with 2 mol O2 (2 H2 + O2 -> 2 H2O), which is limiting?', answer: 'H2 (hydrogen)', explanation: '2 mol H2 needs only 1 mol O2; H2 runs out first.' },
            { prompt: 'Theoretical yield is 50 g, actual yield is 40 g. What is the percent yield?', answer: '80%', explanation: '(40/50) * 100 = 80%.' },
          ],
        },
      ],
    },
    {
      name: 'Chemical Reactions',
      description: 'Classify synthesis, decomposition, combustion, and acid-base reactions.',
      lessons: [
        {
          name: 'Synthesis and Decomposition',
          description: 'Combine or break apart compounds in simple reactions.',
          questions: [
            { prompt: 'Classify: 2 H2 + O2 -> 2 H2O', answer: 'Synthesis (combination)', explanation: 'Two reactants combine into one product.' },
            { prompt: 'Classify: 2 H2O -> 2 H2 + O2', answer: 'Decomposition', explanation: 'One compound breaks into multiple products.' },
          ],
        },
        {
          name: 'Single and Double Replacement',
          description: 'Swap ions between compounds in aqueous reactions.',
          questions: [
            { prompt: 'Classify: Zn + 2 HCl -> ZnCl2 + H2', answer: 'Single replacement', explanation: 'Zn replaces H in HCl.' },
            { prompt: 'Predict the products of AgNO3 + NaCl.', answer: 'AgCl + NaNO3', explanation: 'Double replacement; AgCl is an insoluble precipitate.' },
          ],
        },
        {
          name: 'Combustion',
          description: 'React hydrocarbons with oxygen to form CO2 and H2O.',
          questions: [
            { prompt: 'Balance: C3H8 + O2 -> CO2 + H2O', answer: 'C3H8 + 5 O2 -> 3 CO2 + 4 H2O', explanation: 'Propane combustion; balance C first, then H, then O.' },
            { prompt: 'What products form when a hydrocarbon burns completely?', answer: 'CO2 and H2O', explanation: 'Complete combustion produces only these two products.' },
          ],
        },
        {
          name: 'Acid-Base Neutralization',
          description: 'Produce water and salt from acid + base reactions.',
          questions: [
            { prompt: 'What salt forms from HCl + NaOH -> ?', answer: 'NaCl (sodium chloride) + H2O', explanation: 'Neutralization produces salt and water.' },
            { prompt: 'How many moles of NaOH neutralize 1 mol H2SO4?', answer: '2 mol NaOH', explanation: 'H2SO4 has 2 acidic H; 2 NaOH fully neutralize it.' },
          ],
        },
        {
          name: 'Redox Reactions',
          description: 'Track oxidation and reduction by change in electrons.',
          questions: [
            { prompt: 'In Zn + CuSO4 -> ZnSO4 + Cu, what is reduced?', answer: 'Cu^2+ -> Cu (copper is reduced)', explanation: 'Cu gains 2 electrons; oxidation number decreases.' },
            { prompt: 'Define oxidation in terms of electrons.', answer: 'Loss of electrons', explanation: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain.' },
          ],
        },
      ],
    },
    {
      name: 'States of Matter and Gas Laws',
      description: 'Compare solids, liquids, gases and apply gas laws to PV-T problems.',
      lessons: [
        {
          name: 'Phases and Phase Changes',
          description: 'Identify six phase changes and associated energy changes.',
          questions: [
            { prompt: 'Name the phase change from liquid to gas.', answer: 'Vaporization (boiling or evaporation)', explanation: 'Endothermic; requires heat input.' },
            { prompt: 'Is condensation endothermic or exothermic?', answer: 'Exothermic', explanation: 'Energy is released as gas molecules slow and form liquid.' },
          ],
        },
        {
          name: 'Boyle\'s Law',
          description: 'Relate pressure and volume at constant temperature.',
          questions: [
            { prompt: 'Gas at 2.0 L and 1.0 atm compressed to 1.0 L. What is the new pressure?', answer: '2.0 atm', explanation: 'P1V1 = P2V2; (1.0)(2.0) = (P2)(1.0).' },
            { prompt: 'What does Boyle\'s Law say about P and V?', answer: 'They are inversely proportional at constant T.', explanation: 'Squeeze a gas, pressure rises.' },
          ],
        },
        {
          name: 'Charles\'s Law',
          description: 'Relate volume and temperature at constant pressure.',
          questions: [
            { prompt: 'A gas at 300 K has volume 2.0 L. Heated to 600 K, new volume?', answer: '4.0 L', explanation: 'V1/T1 = V2/T2; 2.0/300 = V2/600 -> V2 = 4.0 L.' },
            { prompt: 'Why must temperature be in Kelvin?', answer: 'To avoid zero or negative values that would break the ratio.', explanation: 'Kelvin is an absolute scale starting at absolute zero.' },
          ],
        },
        {
          name: 'Ideal Gas Law',
          description: 'Apply PV = nRT to solve multi-variable gas problems.',
          questions: [
            { prompt: 'What are the units of R = 0.0821 L·atm/(mol·K)?', answer: 'L·atm per mol·K', explanation: 'Matches pressure in atm, volume in liters.' },
            { prompt: 'Find n for P = 1 atm, V = 22.4 L, T = 273 K. (R = 0.0821)', answer: '1 mol', explanation: 'n = PV/RT = (1 x 22.4)/(0.0821 x 273) ≈ 1.0.' },
          ],
        },
        {
          name: 'Kinetic Molecular Theory',
          description: 'Describe gases as small particles in random constant motion.',
          questions: [
            { prompt: 'What happens to average kinetic energy if temperature increases?', answer: 'It increases proportionally.', explanation: 'KE is directly proportional to T in Kelvin.' },
            { prompt: 'Name two assumptions of the ideal gas model.', answer: 'No attractive forces, negligible particle volume.', explanation: 'Real gases deviate at low T or high P.' },
          ],
        },
      ],
    },
    {
      name: 'Thermochemistry',
      description: 'Measure enthalpy, heat transfer, and energy changes.',
      lessons: [
        {
          name: 'Exothermic vs Endothermic',
          description: 'Classify reactions by whether they release or absorb energy.',
          questions: [
            { prompt: 'Is combustion exothermic or endothermic?', answer: 'Exothermic', explanation: 'Heat is released to the surroundings (negative ΔH).' },
            { prompt: 'What sign does ΔH have for an endothermic reaction?', answer: 'Positive (+)', explanation: 'System absorbs energy from the surroundings.' },
          ],
        },
        {
          name: 'Specific Heat Capacity',
          description: 'Use q = mcΔT to calculate heat transfer.',
          questions: [
            { prompt: 'How much heat raises 100 g of water by 10 C? (c = 4.18 J/g·C)', answer: '4180 J', explanation: 'q = (100)(4.18)(10) = 4180 J.' },
            { prompt: 'What substance has a specific heat of 4.18 J/g·C?', answer: 'Water', explanation: 'Its high specific heat moderates Earth\'s climate.' },
          ],
        },
        {
          name: 'Enthalpy (ΔH)',
          description: 'Measure heat change at constant pressure.',
          questions: [
            { prompt: 'Given ΔH = -890 kJ/mol for CH4 combustion, how much heat from burning 2 mol?', answer: '1780 kJ released', explanation: '2 mol * 890 kJ/mol = 1780 kJ (exothermic).' },
            { prompt: 'Is ΔH a state function?', answer: 'Yes', explanation: 'It depends only on initial and final states.' },
          ],
        },
        {
          name: 'Hess\'s Law',
          description: 'Sum enthalpies of step reactions to find overall ΔH.',
          questions: [
            { prompt: 'If step 1 = -100 kJ and step 2 = +30 kJ, what is ΔH overall?', answer: '-70 kJ', explanation: 'Sum: -100 + 30 = -70 kJ.' },
            { prompt: 'What does Hess\'s Law rely on?', answer: 'Enthalpy being a state function.', explanation: 'Path-independent; total change only depends on endpoints.' },
          ],
        },
        {
          name: 'Calorimetry',
          description: 'Use calorimeters to measure heat of reactions.',
          questions: [
            { prompt: '200 g of water rose by 5 C in a coffee-cup calorimeter. How much heat absorbed?', answer: '4180 J', explanation: 'q = (200)(4.18)(5) = 4180 J.' },
            { prompt: 'What assumption does coffee-cup calorimetry make?', answer: 'No heat lost to surroundings (constant pressure).', explanation: 'Simplifies calculation; all heat goes into water.' },
          ],
        },
      ],
    },
    {
      name: 'Solutions, Acids, and Bases',
      description: 'Study solubility, concentration, pH, and proton transfer.',
      lessons: [
        {
          name: 'Solutions and Concentration',
          description: 'Define solute, solvent, and use molarity (M).',
          questions: [
            { prompt: 'Calculate molarity when 2 mol NaCl dissolves in 4 L.', answer: '0.5 M', explanation: 'M = mol/L = 2/4 = 0.5.' },
            { prompt: 'How many moles in 500 mL of 2.0 M HCl?', answer: '1.0 mol', explanation: 'mol = M * L = 2.0 * 0.5 = 1.0.' },
          ],
        },
        {
          name: 'Solubility and "Like Dissolves Like"',
          description: 'Predict whether polar and nonpolar substances dissolve.',
          questions: [
            { prompt: 'Will oil dissolve in water?', answer: 'No', explanation: 'Nonpolar oil does not mix with polar water.' },
            { prompt: 'Why does salt dissolve in water?', answer: 'Polar water molecules separate and surround Na+ and Cl- ions.', explanation: 'Ion-dipole attractions pull the ions apart.' },
          ],
        },
        {
          name: 'pH Scale',
          description: 'Relate [H+] concentration to pH and pOH.',
          questions: [
            { prompt: 'What is the pH of a 0.01 M HCl solution?', answer: 'pH = 2', explanation: 'pH = -log(0.01) = 2.' },
            { prompt: 'Is a pH of 3 acidic or basic?', answer: 'Acidic', explanation: 'pH < 7 is acidic; pH > 7 is basic.' },
          ],
        },
        {
          name: 'Acid-Base Definitions',
          description: 'Compare Arrhenius, Brønsted-Lowry, and Lewis definitions.',
          questions: [
            { prompt: 'According to Brønsted-Lowry, what is an acid?', answer: 'A proton (H+) donor', explanation: 'Bases are H+ acceptors.' },
            { prompt: 'Identify the conjugate base of HCl.', answer: 'Cl-', explanation: 'Remove one H+ from the acid to get the conjugate base.' },
          ],
        },
        {
          name: 'Strong vs Weak Acids and Bases',
          description: 'Distinguish full and partial ionization in water.',
          questions: [
            { prompt: 'Is acetic acid a strong or weak acid?', answer: 'Weak acid', explanation: 'It ionizes only partially in water.' },
            { prompt: 'Name two strong bases.', answer: 'NaOH and KOH (also LiOH, Ca(OH)2, Ba(OH)2)', explanation: 'Group 1 and heavier Group 2 hydroxides are strong.' },
          ],
        },
      ],
    },
  ],
};
