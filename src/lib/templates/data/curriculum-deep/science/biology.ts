import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '9',
  label: 'High School Biology',
  sourceUrl: 'https://www.khanacademy.org/science/high-school-biology',
  units: [
    {
      name: 'Biology foundations',
      lessons: [
        {
          name: 'Biology and the scientific method',
          items: [
            { label: 'Biology overview', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/v/overview-of-biology' },
            { label: 'Preparing to study biology', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/a/preparing-to-study-biology-article' },
            { label: 'What is life?', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/a/what-is-life' },
            { label: 'The scientific method', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/v/the-scientific-method' },
            { label: 'Data to justify experimental claims examples', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/v/data-to-justify-experimental-claims-examples' },
            { label: 'Scientific method and data analysis', type: 'exercise', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/e/hs-scientific-method-and-experimental-design', question: { prompt: 'Explain in 1-2 sentences the central idea of: Scientific method and data analysis.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
            { label: 'Introduction to experimental design', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/v/introduction-to-experimental-design' },
            { label: 'Controlled experiments', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/a/experiments-and-observations' },
            { label: 'Biology and the scientific method review', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/a/hs-biology-and-the-scientific-method-review' },
            { label: 'Experimental design and bias', type: 'exercise', href: '/science/high-school-biology/hs-biology-foundations/hs-biology-and-the-scientific-method/e/hs-experimental-design-and-bias', question: { prompt: 'Explain in 1-2 sentences the central idea of: Experimental design and bias.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Important molecules for biology',
          items: [
            { label: 'Elements and atoms', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/elements-and-atoms' },
            { label: 'Introduction to carbohydrates', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/introduction-to-carbohydrates' },
            { label: 'Introduction to proteins and amino acids', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/introduction-to-proteins-and-amino-acids' },
            { label: 'Introduction to lipids', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/introduction-to-lipids' },
            { label: 'Introduction to nucleic acids and nucleotides', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/introduction-to-nucleic-acids-and-nucleotides' },
            { label: 'Introduction to vitamins and minerals', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/v/introduction-to-vitamins-and-minerals' },
            { label: 'Biological macromolecules review', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/a/hs-biological-macromolecules-review' },
            { label: 'Biological macromolecules', type: 'exercise', href: '/science/high-school-biology/hs-biology-foundations/hs-biological-macromolecules/e/biological-macromolecules', question: { prompt: 'Explain in 1-2 sentences the central idea of: Biological macromolecules.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Water and life',
          items: [
            { label: 'Hydrogen bonding in water', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-water-and-life/v/hydrogen-bonding-in-water' },
            { label: 'Water as a solvent', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-water-and-life/v/water-as-a-solvent' },
            { label: 'Lesson summary: Water and life', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-water-and-life/a/hs-water-and-life-review' },
            { label: 'Water and life', type: 'exercise', href: '/science/high-school-biology/hs-biology-foundations/hs-water-and-life/e/water-and-life', question: { prompt: 'Explain in 1-2 sentences the central idea of: Water and life.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'pH, acids, and bases',
          items: [
            { label: 'Introduction to pH', type: 'video', href: '/science/high-school-biology/hs-biology-foundations/hs-ph-acids-and-bases/v/introduction-to-ph' },
            { label: 'pH, acids, and bases review', type: 'article', href: '/science/high-school-biology/hs-biology-foundations/hs-ph-acids-and-bases/a/hs-ph-acids-and-bases-review' },
            { label: 'pH, acids, and bases', type: 'exercise', href: '/science/high-school-biology/hs-biology-foundations/hs-ph-acids-and-bases/e/ph', question: { prompt: 'Explain in 1-2 sentences the central idea of: pH, acids, and bases.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
      ],
    },
    {
      name: 'Cells',
      lessons: [
        {
          name: 'Introduction to cells',
          items: [
            { label: 'Scale of cells', type: 'video', href: '/science/high-school-biology/hs-cells/hs-introduction-to-cells/v/scale-of-cells' },
            { label: 'Cell theory', type: 'video', href: '/science/high-school-biology/hs-cells/hs-introduction-to-cells/v/cell-theory' },
            { label: 'Microscopy', type: 'article', href: '/science/high-school-biology/hs-cells/hs-introduction-to-cells/a/microscopy' },
            { label: 'Introduction to cells review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-introduction-to-cells/a/hs-intro-to-cells-review' },
            { label: 'Intro to cells', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-introduction-to-cells/e/intro-to-cells', question: { prompt: 'Explain in 1-2 sentences the central idea of: Intro to cells.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Basic cell structures',
          items: [
            { label: 'Introduction to the cell', type: 'video', href: '/science/high-school-biology/hs-cells/hs-basic-cell-structures/v/introduction-to-the-cell' },
            { label: 'Introduction to cilia, flagella and pseudopodia', type: 'video', href: '/science/high-school-biology/hs-cells/hs-basic-cell-structures/v/introduction-to-cilia-flagella-and-pseudopodia' },
            { label: 'Basic cell structures review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-basic-cell-structures/a/hs-basic-cell-structures-review' },
            { label: 'Identifying cell structures', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-basic-cell-structures/e/identifying-cell-structures', question: { prompt: 'Explain in 1-2 sentences the central idea of: Identifying cell structures.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
            { label: 'Basic cell structures', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-basic-cell-structures/e/cell-structures', question: { prompt: 'Explain in 1-2 sentences the central idea of: Basic cell structures.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The cell membrane',
          items: [
            { label: 'Fluid mosaic model of cell membranes', type: 'video', href: '/science/high-school-biology/hs-cells/hs-the-cell-membrane/v/fluid-mosaic-model-of-cell-membranes' },
            { label: 'Structure of the plasma membrane', type: 'article', href: '/science/high-school-biology/hs-cells/hs-the-cell-membrane/a/structure-of-the-plasma-membrane' },
            { label: 'The cell membrane review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-the-cell-membrane/a/hs-the-cell-membrane-review' },
            { label: 'The cell membrane', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-the-cell-membrane/e/cell-membrane-and-homeostasis', question: { prompt: 'Define osmosis.', answer: 'The diffusion of water across a selectively permeable membrane from high to low water concentration.', explanation: 'It is passive, requiring no energy.' } },
          ],
        },
        {
          name: 'Eukaryotic cell structures',
          items: [
            { label: 'Organelles in eukaryotic cells', type: 'video', href: '/science/high-school-biology/hs-cells/hs-eukaryotic-cell-structures/v/organelles-in-eukaryotic-cells' },
            { label: 'Eukaryotic cell structures review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-eukaryotic-cell-structures/a/hs-eukaryotic-cell-structures-review' },
            { label: 'Identifying eukaryotic cell structures', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-eukaryotic-cell-structures/e/identifying-eukaryotic-cell-structures', question: { prompt: 'Which organelle synthesizes ATP through oxidative phosphorylation?', answer: 'Mitochondria', explanation: 'The inner-membrane electron transport chain drives ATP synthase.' } },
            { label: 'Eukaryotic cell structures', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-eukaryotic-cell-structures/e/hs-eukaryotic-cell-structures', question: { prompt: 'Which organelle synthesizes ATP through oxidative phosphorylation?', answer: 'Mitochondria', explanation: 'The inner-membrane electron transport chain drives ATP synthase.' } },
          ],
        },
        {
          name: 'Prokaryotes and eukaryotes',
          items: [
            { label: 'Prokaryotic and eukaryotic cells', type: 'video', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/v/prokaryotic-and-eukaryotic-cells' },
            { label: 'Prokaryotic cells', type: 'article', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/a/prokaryotic-cells' },
            { label: 'Intro to eukaryotic cells', type: 'article', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/a/intro-to-eukaryotic-cells' },
            { label: 'Mitochondria and chloroplasts', type: 'article', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/a/chloroplasts-and-mitochondria' },
            { label: 'Prokaryotes and eukaryotes review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/a/hs-prokaryotes-and-eukaryotes-review' },
            { label: 'Prokaryotes and eukaryotes', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-prokaryotes-and-eukaryotes/e/prokaryotes-and-eukaryotes', question: { prompt: 'Explain in 1-2 sentences the central idea of: Prokaryotes and eukaryotes.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Plant vs animal cells',
          items: [
            { label: 'Overview of animal and plant cells', type: 'video', href: '/science/high-school-biology/hs-cells/hs-plant-vs-animal-cells/v/overview-of-animal-and-plant-cells' },
            { label: 'Plant vs animal cells review', type: 'article', href: '/science/high-school-biology/hs-cells/hs-plant-vs-animal-cells/a/hs-plant-vs-animal-cells-review' },
            { label: 'Plant vs animal cells', type: 'exercise', href: '/science/high-school-biology/hs-cells/hs-plant-vs-animal-cells/e/plant-vs-animal-cells', question: { prompt: 'Which tissue carries sugars from leaves to other parts of a plant?', answer: 'Phloem', explanation: 'Xylem moves water and minerals upward.' } },
          ],
        },
      ],
    },
    {
      name: 'Energy and transport',
      lessons: [
        {
          name: 'Introduction to metabolism',
          items: [
            { label: 'Introduction to metabolism: Anabolism and catabolism', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-introduction-to-metabolism/v/introduction-to-metabolism-anabolism-and-catabolism' },
            { label: 'Overview of metabolism', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-introduction-to-metabolism/a/overview-of-metabolism' },
            { label: 'ATP: Adenosine triphosphate', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-introduction-to-metabolism/v/adenosine-triphosphate' },
            { label: 'Introduction to metabolism review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-introduction-to-metabolism/a/hs-introduction-to-metabolism-review' },
            { label: 'Introduction to metabolism', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-introduction-to-metabolism/e/introduction-to-metabolism', question: { prompt: 'How does an enzyme speed up a reaction?', answer: 'By lowering its activation energy.', explanation: 'Enzymes do not change the equilibrium, only the rate.' } },
          ],
        },
        {
          name: 'Enzymes',
          items: [
            { label: 'Introduction to kinetics', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-enzymes/v/introduction-to-kinetics' },
            { label: 'Activation energy', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-enzymes/a/activation-energy' },
            { label: 'Enzymes', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-enzymes/v/enzymes' },
            { label: 'Enzymes review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-enzymes/a/hs-enzymes-review' },
          ],
        },
        {
          name: 'Passive and active transport',
          items: [
            { label: 'Introduction to passive and active transport', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/v/introduction-to-passive-and-active-transport' },
            { label: 'Diffusion - Introduction', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/v/diffusion-video' },
            { label: 'Concentration gradients', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/v/concentration-gradients' },
            { label: 'Passive transport review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/a/hs-passive-transport-review' },
            { label: 'Passive transport', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/e/hs-passive-transport', question: { prompt: 'Define osmosis.', answer: 'The diffusion of water across a selectively permeable membrane from high to low water concentration.', explanation: 'It is passive, requiring no energy.' } },
            { label: 'Sodium potassium pump', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/v/sodium-potassium-pump-video' },
            { label: 'Active transport review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/a/hs-active-transport-review' },
            { label: 'Active transport', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-passive-and-active-transport/e/hs-active-transport', question: { prompt: 'Define osmosis.', answer: 'The diffusion of water across a selectively permeable membrane from high to low water concentration.', explanation: 'It is passive, requiring no energy.' } },
          ],
        },
        {
          name: 'Osmosis and tonicity',
          items: [
            { label: 'Osmosis', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-osmosis-and-tonicity/v/osmosis' },
            { label: 'Hypotonic, isotonic, and hypertonic solutions (tonicity)', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-osmosis-and-tonicity/v/hypotonic-isotonic-and-hypertonic-solutions-tonicity' },
            { label: 'Osmosis and tonicity review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-osmosis-and-tonicity/a/hs-osmosis-and-tonicity-review' },
            { label: 'Osmosis and tonicity', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-osmosis-and-tonicity/e/osmosis', question: { prompt: 'Define osmosis.', answer: 'The diffusion of water across a selectively permeable membrane from high to low water concentration.', explanation: 'It is passive, requiring no energy.' } },
          ],
        },
        {
          name: 'Photosynthesis',
          items: [
            { label: 'Breaking down photosynthesis stages', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-photosynthesis/v/breaking-down-photosynthesis-stages' },
            { label: 'Photosynthesis review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-photosynthesis/a/hs-photosynthesis-review' },
            { label: 'Photosynthesis', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-photosynthesis/e/hs-photosynthesis', question: { prompt: 'Write the overall chemical equation for photosynthesis.', answer: '6 CO2 + 6 H2O -> C6H12O6 + 6 O2 (with light energy)', explanation: 'It captures light energy as glucose.' } },
          ],
        },
        {
          name: 'Cellular respiration',
          items: [
            { label: 'Cellular respiration introduction', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-cellular-respiration/v/introduction-to-cellular-respiration' },
            { label: 'Lactic acid fermentation', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-cellular-respiration/v/lactic-acid-fermentation' },
            { label: 'Alcohol or ethanol fermentation', type: 'video', href: '/science/high-school-biology/hs-energy-and-transport/hs-cellular-respiration/v/alcohol-or-ethanol-fermentation' },
            { label: 'Cellular respiration review', type: 'article', href: '/science/high-school-biology/hs-energy-and-transport/hs-cellular-respiration/a/hs-cellular-respiration-review' },
            { label: 'Cellular respiration', type: 'exercise', href: '/science/high-school-biology/hs-energy-and-transport/hs-cellular-respiration/e/hs-cellular-respiration', question: { prompt: 'Roughly how many ATP does aerobic respiration of one glucose typically yield?', answer: 'About 30 to 32 ATP', explanation: 'Glycolysis (~2), Krebs (~2), and oxidative phosphorylation (~26 to 28).' } },
          ],
        },
      ],
    },
    {
      name: 'Reproduction and cell division',
      lessons: [
        {
          name: 'Types of reproduction',
          items: [
            { label: 'Asexual and sexual reproduction', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-types-of-reproduction/v/asexual-and-sexual-reproduction' },
            { label: 'Types of reproduction review', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-types-of-reproduction/a/hs-types-of-reproduction-review' },
            { label: 'Types of reproduction', type: 'exercise', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-types-of-reproduction/e/types-of-reproduction', question: { prompt: 'Explain in 1-2 sentences the central idea of: Types of reproduction.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Chromosome structure and numbers',
          items: [
            { label: 'Chromosomes', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-chromosome-structure-and-numbers/a/dna-and-chromosomes-article' },
            { label: 'Chromosomes, chromatids and chromatin', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-chromosome-structure-and-numbers/v/chromosomes-chromatids-chromatin-etc' },
            { label: 'Chromosome structure and numbers review', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-chromosome-structure-and-numbers/a/hs-chromosome-structure-and-numbers-review' },
          ],
        },
        {
          name: 'The cell cycle and mitosis',
          items: [
            { label: 'Interphase', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-the-cell-cycle-and-mitosis/v/interphase' },
            { label: 'Mitosis', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-the-cell-cycle-and-mitosis/v/mitosis' },
            { label: 'Cancer', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-the-cell-cycle-and-mitosis/v/cancer' },
            { label: 'The cell cycle and mitosis review', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-the-cell-cycle-and-mitosis/a/hs-the-cell-cycle-and-mitosis-review' },
            { label: 'The cell cycle and mitosis', type: 'exercise', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-the-cell-cycle-and-mitosis/e/hs-the-cell-cycle-and-mitosis', question: { prompt: 'Name the four phases of mitosis in order.', answer: 'Prophase, metaphase, anaphase, telophase.', explanation: 'Cytokinesis follows to split the cell.' } },
          ],
        },
        {
          name: 'Meiosis',
          items: [
            { label: 'Chromosomal crossover in meiosis I', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/v/chromosomal-crossover-in-meiosis-i' },
            { label: 'Phases of meiosis I', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/v/phases-of-meiosis-i' },
            { label: 'Phases of meiosis II', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/v/phases-of-meiosis-ii' },
            { label: 'Comparing mitosis and meiosis', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/v/comparing-mitosis-and-meiosis' },
            { label: 'Meiosis review', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/a/hs-meiosis-review' },
            { label: 'Meiosis', type: 'exercise', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-meiosis/e/hs-meiosis', question: { prompt: 'How does meiosis create genetic variation?', answer: 'Through independent assortment and crossing over (recombination).', explanation: 'Both occur during meiosis I.' } },
          ],
        },
        {
          name: 'Fertilization and development',
          items: [
            { label: 'Human fertilization and early development', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-fertilization-and-development/v/human-fertilization-and-early-development' },
            { label: 'Apoptosis', type: 'video', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-fertilization-and-development/v/apoptosis' },
            { label: 'Fertilization and development review', type: 'article', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-fertilization-and-development/a/hs-fertilization-and-development-review' },
            { label: 'Fertilization and development', type: 'exercise', href: '/science/high-school-biology/hs-reproduction-and-cell-division/hs-fertilization-and-development/e/hs-fertilization-and-development', question: { prompt: 'Explain in 1-2 sentences the central idea of: Fertilization and development.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
      ],
    },
    {
      name: 'Classical genetics',
      lessons: [
        {
          name: 'Introduction to heredity',
          items: [
            { label: 'Introduction to heredity', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/v/introduction-to-heredity' },
            { label: 'Alleles and genes', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/v/alleles-and-genes' },
            { label: 'Worked example: Punnett squares', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/v/punnett-square-fun' },
            { label: 'Mendel and his peas', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/a/mendel-and-his-peas' },
            { label: 'The law of segregation', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/a/the-law-of-segregation' },
            { label: 'The law of independent assortment', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/a/the-law-of-independent-assortment' },
            { label: 'Probabilities in genetics', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/a/probabilities-in-genetics' },
            { label: 'Introduction to heredity review', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/a/hs-introduction-to-heredity-review' },
            { label: 'Punnett squares and probability', type: 'exercise', href: '/science/high-school-biology/hs-classical-genetics/hs-introduction-to-heredity/e/hs-punnett-squares', question: { prompt: 'Cross Pp x Pp. What is the phenotype ratio for a complete-dominance trait?', answer: '3 dominant : 1 recessive', explanation: 'Genotype ratio is 1 PP : 2 Pp : 1 pp.' } },
          ],
        },
        {
          name: 'Non-Mendelian inheritance',
          items: [
            { label: 'Co-dominance and incomplete dominance', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/v/co-dominance-and-incomplete-dominance' },
            { label: 'Multiple alleles, incomplete dominance, and codominance', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/a/multiple-alleles-incomplete-dominance-and-codominance' },
            { label: 'Pleiotropy and lethal alleles', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/a/pleiotropy-lethal-alleles-and-sex-linkage' },
            { label: 'Polygenic inheritance and environmental effects', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/a/polygenic-inheritance-and-environmental-effects' },
            { label: 'Non-Mendelian inheritance review', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/a/hs-non-mendelian-inheritance-review' },
            { label: 'Non-Mendelian inheritance', type: 'exercise', href: '/science/high-school-biology/hs-classical-genetics/hs-non-mendelian-inheritance/e/hs-non-mendelian-inheritance', question: { prompt: 'Cross Pp x Pp. What is the phenotype ratio for a complete-dominance trait?', answer: '3 dominant : 1 recessive', explanation: 'Genotype ratio is 1 PP : 2 Pp : 1 pp.' } },
          ],
        },
        {
          name: 'Sex linkage',
          items: [
            { label: 'Worked example: Punnett square for sex-linked recessive trait', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-sex-linkage/v/example-punnet-square-for-sex-linked-recessive-trait' },
            { label: 'X-linked inheritance', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-sex-linkage/a/sex-linkage-sex-determination-and-x-inactivation' },
            { label: 'X-inactivation', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-sex-linkage/a/x-inactivation' },
            { label: 'Sex linkage review', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-sex-linkage/a/hs-sex-linkage-review' },
            { label: 'Sex linkage', type: 'exercise', href: '/science/high-school-biology/hs-classical-genetics/hs-sex-linkage/e/hs-sex-linkage', question: { prompt: 'Explain in 1-2 sentences the central idea of: Sex linkage.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Pedigrees',
          items: [
            { label: 'Pedigrees', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-pedigrees/v/pedigrees' },
            { label: 'Pedigree for determining probability of exhibiting sex linked recessive trait', type: 'video', href: '/science/high-school-biology/hs-classical-genetics/hs-pedigrees/v/pedigree-for-determining-probability-of-exhibiting-sex-linked-recessive-trait' },
            { label: 'Pedigrees review', type: 'article', href: '/science/high-school-biology/hs-classical-genetics/hs-pedigrees/a/hs-pedigrees-review' },
          ],
        },
      ],
    },
    {
      name: 'Molecular genetics',
      lessons: [
        {
          name: 'DNA structure and replication',
          items: [
            { label: 'Discovery of the structure of DNA', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/a/discovery-of-the-structure-of-dna' },
            { label: 'DNA', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/v/dna-deoxyribonucleic-acid' },
            { label: 'Molecular structure of DNA', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/v/molecular-structure-of-dna' },
            { label: 'Antiparallel structure of DNA strands', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/v/antiparallel-structure-of-dna-strands' },
            { label: 'Leading and lagging strands in DNA replication', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/v/leading-and-lagging-strands-in-dna-replication' },
            { label: 'DNA proofreading and repair', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/a/dna-proofreading-and-repair' },
            { label: 'DNA structure and replication review', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/a/hs-dna-structure-and-replication-review' },
            { label: 'DNA structure and replication', type: 'exercise', href: '/science/high-school-biology/hs-molecular-genetics/hs-discovery-and-structure-of-dna/e/hs-discovery-and-structure-of-dna', question: { prompt: 'In which direction is a new DNA strand always synthesized?', answer: '5\\\' to 3\\\'', explanation: 'DNA polymerase only adds nucleotides to a 3\\\' OH.' } },
          ],
        },
        {
          name: 'RNA and protein synthesis',
          items: [
            { label: 'Molecular structure of RNA', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/v/molecular-structure-of-rna' },
            { label: 'DNA replication and RNA transcription and translation', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/v/rna-transcription-and-translation' },
            { label: 'Intro to gene expression (central dogma)', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/a/intro-to-gene-expression-central-dogma' },
            { label: 'The genetic code', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/a/the-genetic-code' },
            { label: 'Impact of mutations on translation into amino acids', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/v/impact-of-mutations-on-translation-into-amino-acids' },
            { label: 'RNA and protein synthesis review', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/a/hs-rna-and-protein-synthesis-review' },
            { label: 'Transcription and translation', type: 'exercise', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/e/hs-rna-and-protein-synthesis', question: { prompt: 'In which direction is a new DNA strand always synthesized?', answer: '5\\\' to 3\\\'', explanation: 'DNA polymerase only adds nucleotides to a 3\\\' OH.' } },
            { label: 'Codons and mutations', type: 'exercise', href: '/science/high-school-biology/hs-molecular-genetics/hs-rna-and-protein-synthesis/e/hs-mutations', question: { prompt: 'Explain in 1-2 sentences the central idea of: Codons and mutations.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Biotechnology',
          items: [
            { label: 'Introduction to genetic engineering', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/v/introduction-to-genetic-engineering' },
            { label: 'Polymerase chain reaction (PCR)', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/v/the-polymerase-chain-reaction-pcr' },
            { label: 'Gel electrophoresis', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/v/gel-electrophoresis-dna' },
            { label: 'DNA cloning and recombinant DNA', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/v/dna-cloning-and-recombinant-dna' },
            { label: 'DNA sequencing', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/a/dna-sequencing' },
            { label: 'Can we clone extinct dinosaurs from DNA preserved in their fossils?', type: 'video', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/v/clone-dinosaurs' },
            { label: 'Biotechnology review', type: 'article', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/a/hs-biotechnology-review' },
            { label: 'Biotechnology', type: 'exercise', href: '/science/high-school-biology/hs-molecular-genetics/hs-biotechnology/e/hs-biotechnology', question: { prompt: 'Explain in 1-2 sentences the central idea of: Biotechnology.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
      ],
    },
    {
      name: 'Evolution',
      lessons: [
        {
          name: 'Evolution and natural selection',
          items: [
            { label: 'Introduction to evolution and natural selection', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/v/introduction-to-evolution-and-natural-selection' },
            { label: 'Ape clarification', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/v/ape-clarification' },
            { label: 'Natural selection and the owl butterfly', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/v/natural-selection-and-the-owl-butterfly' },
            { label: 'Variation in a species', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/v/variation-in-a-species' },
            { label: 'Evolution and natural selection review', type: 'article', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/a/hs-evolution-and-natural-selection-review' },
            { label: 'Evolution and natural selection', type: 'exercise', href: '/science/high-school-biology/hs-evolution/hs-evolution-and-natural-selection/e/hs-evolution-and-natural-selection', question: { prompt: 'Define fitness in evolutionary biology.', answer: 'Reproductive success: an individual\'s ability to survive and pass on genes.', explanation: 'It is not just strength or speed.' } },
          ],
        },
        {
          name: 'Evidence of evolution',
          items: [
            { label: 'Evidence for evolution', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/evidence-for-evolution' },
            { label: 'Fossils: rocking the Earth', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/fossils-rocking-the-earth' },
            { label: 'Human evolution overview', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/human-evolution-overview' },
            { label: 'DNA spells evolution', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/dna-spells-evolution' },
            { label: 'Biogeography: where life lives', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/biogeography-where-life-lives' },
            { label: 'Molecular evidence for evolutionary relationships examples', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/v/molecular-evidence-for-evolutionary-relationships-examples' },
            { label: 'Evidence of evolution review', type: 'article', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/a/hs-evidence-of-evolution-review' },
            { label: 'Evidence of evolution', type: 'exercise', href: '/science/high-school-biology/hs-evolution/hs-evidence-of-evolution/e/hs-evidence-of-evolution', question: { prompt: 'Define fitness in evolutionary biology.', answer: 'Reproductive success: an individual\'s ability to survive and pass on genes.', explanation: 'It is not just strength or speed.' } },
          ],
        },
        {
          name: 'Phylogeny',
          items: [
            { label: 'Taxonomy and the tree of life', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/taxonomy-and-the-tree-of-life' },
            { label: 'Species', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/species' },
            { label: 'Biodiversity and natural selection', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/biodiversity-and-natural-selection-two' },
            { label: 'Genetic variation, gene flow, and new species', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/genetic-variation-gene-flow-and-new-species' },
            { label: 'Discovering the tree of life', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/discovering-the-tree-of-life' },
            { label: 'Phylogenetic trees', type: 'article', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/a/phylogenetic-trees' },
            { label: 'Understanding and building phylogenetic trees', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/understanding-and-building-phylogenetic-trees-or-cladograms' },
            { label: 'How do we know which kinds of dinosaurs were most closely related?', type: 'video', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/v/related-dinosaurs' },
            { label: 'Phylogeny review', type: 'article', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/a/hs-phylogeny-review' },
            { label: 'Phylogeny', type: 'exercise', href: '/science/high-school-biology/hs-evolution/hs-phylogeny/e/hs-phylogeny', question: { prompt: 'On a phylogenetic tree, what does a node represent?', answer: 'A common ancestor of the lineages branching from it.', explanation: 'Nodes mark divergence events.' } },
          ],
        },
      ],
    },
    {
      name: 'Human body systems',
      lessons: [
        {
          name: 'Body structure and homeostasis',
          items: [
            { label: 'Homeostasis', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-body-structure-and-homeostasis/v/homeostasis' },
            { label: 'Tissues, organs, & organ systems', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-body-structure-and-homeostasis/a/tissues-organs-organ-systems' },
            { label: 'Body structure and homeostasis review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-body-structure-and-homeostasis/a/hs-body-structure-and-homeostasis-review' },
            { label: 'Body structure and homeostasis', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-body-structure-and-homeostasis/e/hs-body-structure-and-homeostasis', question: { prompt: 'Explain in 1-2 sentences the central idea of: Body structure and homeostasis.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The circulatory and respiratory systems',
          items: [
            { label: 'Meet the heart!', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/v/meet-the-heart' },
            { label: 'Circulatory system and the heart', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/v/circulatory-system-and-the-heart' },
            { label: 'The circulatory system review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/a/hs-the-circulatory-system-review' },
            { label: 'Meet the lungs!', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/v/meet-the-lungs' },
            { label: 'The lungs and pulmonary system', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/v/the-lungs-and-pulmonary-system' },
            { label: 'The respiratory system review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/a/hs-the-respiratory-system-review' },
            { label: 'The circulatory and respiratory systems', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-circulatory-and-respiratory-systems/e/hs-the-circulatory-and-respiratory-systems', question: { prompt: 'Explain in 1-2 sentences the central idea of: The circulatory and respiratory systems.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The musculoskeletal system',
          items: [
            { label: 'Skeletal structure and function', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/skeletal-structure-and-function' },
            { label: 'Cartilage', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/cartilage' },
            { label: 'Ligaments, tendons, and joints', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/ligaments-tendons-and-joints' },
            { label: 'Three types of muscle', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/three-types-of-muscle' },
            { label: 'Anatomy of a skeletal muscle cell', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/anatomy-of-a-muscle-cell-1' },
            { label: 'LeBron Asks: What muscles do we use when shooting a basket?', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/v/lebron-asks-what-muscles-do-we-use-when-shooting-a-basket' },
            { label: 'The musculoskeletal system review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/a/hs-the-musculoskeletal-system-review' },
            { label: 'The musculoskeletal system', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-musculoskeletal-system/e/hs-the-musculoskeletal-system', question: { prompt: 'Explain in 1-2 sentences the central idea of: The musculoskeletal system.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The digestive and excretory systems',
          items: [
            { label: 'Meet the gastrointestinal tract!', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-digestive-and-excretory-systems/v/meet-the-gastrointestinal-tract' },
            { label: 'Kidney function and anatomy', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-digestive-and-excretory-systems/v/how-do-our-kidneys-work' },
            { label: 'Urination', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-digestive-and-excretory-systems/v/urination' },
            { label: 'The digestive and excretory systems review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-digestive-and-excretory-systems/a/hs-the-digestive-and-excretory-systems-review' },
            { label: 'The digestive and excretory systems', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-digestive-and-excretory-systems/e/hs-the-digestive-and-excretory-systems', question: { prompt: 'Explain in 1-2 sentences the central idea of: The digestive and excretory systems.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The nervous and endocrine systems',
          items: [
            { label: 'Structure of the nervous system', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-nervous-and-endocrine-systems/v/structure-of-the-nervous-system' },
            { label: 'Anatomy of a neuron', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-nervous-and-endocrine-systems/v/anatomy-of-a-neuron' },
            { label: 'Intro to the endocrine system', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-nervous-and-endocrine-systems/v/intro-to-the-endocrine-system' },
            { label: 'The nervous and endocrine systems review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-nervous-and-endocrine-systems/a/hs-the-nervous-and-endocrine-systems-review' },
            { label: 'The nervous and endocrine systems', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-nervous-and-endocrine-systems/e/hs-the-nervous-and-endocrine-systems', question: { prompt: 'Across a synapse, what kind of signal carries information?', answer: 'A chemical signal (neurotransmitters).', explanation: 'The action potential is electrical only within the neuron.' } },
          ],
        },
        {
          name: 'The reproductive system',
          items: [
            { label: 'Welcome to the reproductive system', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-reproductive-system/v/welcome-to-the-reproductive-system' },
            { label: 'Egg, sperm, and fertilization', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-reproductive-system/v/egg-sperm-and-fertilization' },
            { label: 'The reproductive system review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-reproductive-system/a/hs-the-reproductive-system-review' },
            { label: 'The reproductive system', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-reproductive-system/e/hs-the-reproductive-system', question: { prompt: 'Explain in 1-2 sentences the central idea of: The reproductive system.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'The immune system',
          items: [
            { label: 'Types of immune responses: Innate and adaptive, humoral vs. cell-mediated', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/v/types-of-immune-responses-innate-and-adaptive-humoral-vs-cell-mediated' },
            { label: 'Role of phagocytes in innate or nonspecific immunity', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/v/role-of-phagocytes-in-innate-or-nonspecific-immunity' },
            { label: 'Self vs. non-self immunity', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/v/self-versus-non-self' },
            { label: 'Intro to viruses', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/a/intro-to-viruses' },
            { label: 'Viral replication: lytic vs lysogenic', type: 'video', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/v/viral-replicaiton-lytic-vs-lysogenic' },
            { label: 'The immune system review', type: 'article', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/a/hs-the-immune-system-review' },
            { label: 'The immune system', type: 'exercise', href: '/science/high-school-biology/hs-human-body-systems/hs-the-immune-system/e/hs-the-immune-system', question: { prompt: 'What is the role of B cells in adaptive immunity?', answer: 'They produce antibodies against specific antigens.', explanation: 'T cells handle the cell-mediated branch.' } },
          ],
        },
      ],
    },
    {
      name: 'Ecology',
      lessons: [
        {
          name: 'Introduction to ecology',
          items: [
            { label: 'Ecology introduction', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-introduction-to-ecology/v/ecology-introduction' },
            { label: 'Ecosystems and biomes', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-introduction-to-ecology/v/ecosystems-and-biomes' },
            { label: 'Ecological levels: from individuals to ecosystems', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-introduction-to-ecology/a/ecological-levels-from-individuals-to-ecosystems' },
            { label: 'Introduction to ecology review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-introduction-to-ecology/a/hs-introduction-to-ecology-review' },
            { label: 'Introduction to ecology', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-introduction-to-ecology/e/hs-introduction-to-ecology', question: { prompt: 'Which level is broader: a community or an ecosystem?', answer: 'An ecosystem (community + abiotic environment).', explanation: 'Community is just the living organisms.' } },
          ],
        },
        {
          name: 'Population ecology',
          items: [
            { label: 'Population size, density, & dispersal', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-population-ecology/a/population-size-density-and-dispersal' },
            { label: 'Exponential and logistic growth in populations', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-population-ecology/v/exponential-and-logistic-growth-in-populations' },
            { label: 'Population regulation', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-population-ecology/v/density-dependent-and-density-independent-population-regulation' },
            { label: 'Population ecology review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-population-ecology/a/hs-population-ecology-review' },
            { label: 'Population ecology', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-population-ecology/e/hs-population-ecology', question: { prompt: 'Which level is broader: a community or an ecosystem?', answer: 'An ecosystem (community + abiotic environment).', explanation: 'Community is just the living organisms.' } },
          ],
        },
        {
          name: 'Community ecology',
          items: [
            { label: 'Ecosystem biodiversity', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/v/ecosystem-biodiversity' },
            { label: 'Ecosystems and ecological networks', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/v/biodiversity-ecosystems-and-ecological-networks' },
            { label: 'Community structure', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/a/community-structure' },
            { label: 'Introduced species and biodiversity', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/v/introduced-species-and-biodiversity' },
            { label: 'Ecological succession', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/v/ecological-succession' },
            { label: 'Community ecology review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/a/hs-community-ecology-review' },
            { label: 'Community ecology', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-community-ecology/e/hs-community-ecology', question: { prompt: 'Which level is broader: a community or an ecosystem?', answer: 'An ecosystem (community + abiotic environment).', explanation: 'Community is just the living organisms.' } },
          ],
        },
        {
          name: 'Ecological relationships',
          items: [
            { label: 'Interactions between populations', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-ecological-relationships/v/interactions-between-populations' },
            { label: 'Ecological interactions', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-ecological-relationships/a/ecological-interactions' },
            { label: 'Predator-prey cycles', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-ecological-relationships/v/predator-prey-cycle' },
            { label: 'Ecological relationships review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-ecological-relationships/a/hs-ecological-relationships-review' },
            { label: 'Ecological relationships', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-ecological-relationships/e/hs-ecological-relationships', question: { prompt: 'Explain in 1-2 sentences the central idea of: Ecological relationships.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Trophic levels',
          items: [
            { label: 'Flow of energy and matter through ecosystems', type: 'video', href: '/science/high-school-biology/hs-ecology/trophic-levels/v/flow-of-energy-and-matter-through-ecosystems' },
            { label: 'Food chains & food webs', type: 'article', href: '/science/high-school-biology/hs-ecology/trophic-levels/a/food-chains-and-food-webs-article' },
            { label: 'Example identifying roles in a food web', type: 'video', href: '/science/high-school-biology/hs-ecology/trophic-levels/v/example-identifying-roles-in-a-food-web' },
            { label: 'Energy flow and primary productivity', type: 'article', href: '/science/high-school-biology/hs-ecology/trophic-levels/a/energy-flow-and-primary-productivity' },
            { label: 'Trophic levels review', type: 'article', href: '/science/high-school-biology/hs-ecology/trophic-levels/a/hs-trophic-levels-review' },
            { label: 'Trophic levels', type: 'exercise', href: '/science/high-school-biology/hs-ecology/trophic-levels/e/hs-trophic-levels', question: { prompt: 'Explain in 1-2 sentences the central idea of: Trophic levels.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Biogeochemical cycles',
          items: [
            { label: 'Biogeochemical cycles overview', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/v/biogeochemical-cycles' },
            { label: 'The water cycle', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/v/the-water-cycle' },
            { label: 'The carbon cycle', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/v/carbon-cycle' },
            { label: 'The nitrogen cycle', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/v/nitrogen-cycle' },
            { label: 'Biogeochemical cycles review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/a/hs-biogeochemical-cycles-review' },
            { label: 'Biogeochemical cycles', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-biogeochemical-cycles/e/hs-biogeochemical-cycles', question: { prompt: 'Explain in 1-2 sentences the central idea of: Biogeochemical cycles.', answer: 'A clear sentence naming the concept and one supporting fact.', explanation: 'Use the related video for help.' } },
          ],
        },
        {
          name: 'Human impact on ecosystems',
          items: [
            { label: 'Human activities that threaten biodiversity', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/human-activities-that-threaten-biodiversity' },
            { label: 'What is a biodiversity hotspot?', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/biodiversity-hotspot' },
            { label: 'Conservation and the race to save biodiversity', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/conservation-and-the-race-to-save-biodiversity' },
            { label: 'Introduced species and biodiversity', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/introduced-species-and-biodiversity' },
            { label: 'How does climate change affect biodiversity?', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/how-does-climate-change-affect-biodiversity' },
            { label: 'Protecting biodiversity: the power of the individual', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/protecting-biodiversity-the-power-of-the-individual' },
            { label: 'Protecting biodiversity: local and global policies', type: 'video', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/v/protecting-biodiversity-local-and-global-policies' },
            { label: 'Human impact on ecosystems review', type: 'article', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/a/hs-human-impact-on-ecosystems-review' },
            { label: 'Human impact on ecosystems', type: 'exercise', href: '/science/high-school-biology/hs-ecology/hs-human-impact-on-ecosystems/e/hs-human-impact-on-ecosystems', question: { prompt: 'Which level is broader: a community or an ecosystem?', answer: 'An ecosystem (community + abiotic environment).', explanation: 'Community is just the living organisms.' } },
          ],
        },
      ],
    },
  ],
};
