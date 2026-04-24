import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '9',
  label: 'High School Biology',
  sourceUrl: 'https://www.khanacademy.org/science/high-school-biology',
  units: [
    {
      name: 'Cells',
      description: 'Investigate cell theory, organelles, membranes, and how cells carry out processes.',
      lessons: [
        {
          name: 'Cell Theory and Discovery',
          description: 'Learn the three principles of cell theory and key historical discoveries.',
          questions: [
            { prompt: 'State all three principles of cell theory.', answer: 'All living things are made of cells; cells are the basic unit of life; all cells come from pre-existing cells.', explanation: 'These three tenets form the foundation of modern biology.' },
            { prompt: 'Which scientist first observed and named "cells" in cork?', answer: 'Robert Hooke', explanation: 'Hooke used a compound microscope in 1665 and saw empty chambers resembling monastery cells.' },
          ],
        },
        {
          name: 'Prokaryotic vs Eukaryotic Cells',
          description: 'Compare structure and complexity of bacterial and animal/plant cells.',
          questions: [
            { prompt: 'Name two structural features found in eukaryotes but not prokaryotes.', answer: 'Membrane-bound nucleus and membrane-bound organelles such as mitochondria.', explanation: 'Prokaryotes lack any internal membrane-bound compartments.' },
            { prompt: 'Which domain of life contains only prokaryotes?', answer: 'Bacteria and Archaea', explanation: 'Eukarya is the only domain with eukaryotic cells.' },
          ],
        },
        {
          name: 'Organelles and Their Functions',
          description: 'Match each major organelle to the job it performs inside the cell.',
          questions: [
            { prompt: 'Which organelle produces most of a cell\'s ATP?', answer: 'Mitochondrion', explanation: 'The inner membrane hosts the electron transport chain and ATP synthase.' },
            { prompt: 'What is the primary function of the rough endoplasmic reticulum?', answer: 'Protein synthesis and modification', explanation: 'Ribosomes on its surface translate proteins destined for membranes or secretion.' },
          ],
        },
        {
          name: 'Cell Membrane Structure',
          description: 'Describe the fluid mosaic model and how it controls what enters and exits.',
          questions: [
            { prompt: 'What two molecules form the basic bilayer of the plasma membrane?', answer: 'Phospholipids', explanation: 'Phospholipids arrange in a bilayer with hydrophilic heads outside and hydrophobic tails inside.' },
            { prompt: 'Why is the membrane called a "fluid mosaic"?', answer: 'Lipids and proteins move laterally within the bilayer, forming a mosaic-like pattern.', explanation: 'The model was proposed by Singer and Nicolson in 1972.' },
          ],
        },
        {
          name: 'Levels of Biological Organization',
          description: 'Order biological structures from atoms to the biosphere.',
          questions: [
            { prompt: 'Put in order smallest to largest: tissue, organ, cell, organ system.', answer: 'Cell, tissue, organ, organ system.', explanation: 'Cells group into tissues, tissues into organs, and organs into organ systems.' },
            { prompt: 'Which level includes all populations of all species in an area?', answer: 'Community', explanation: 'A community plus its abiotic environment makes an ecosystem.' },
          ],
        },
      ],
    },
    {
      name: 'Energy and Transport in Cells',
      description: 'Study photosynthesis, cellular respiration, and how cells move materials in and out.',
      lessons: [
        {
          name: 'Photosynthesis Overview',
          description: 'Trace how plants convert light energy into chemical energy stored in glucose.',
          questions: [
            { prompt: 'Write the balanced overall equation for photosynthesis.', answer: '6CO2 + 6H2O -> C6H12O6 + 6O2', explanation: 'Six carbon dioxide and six water yield one glucose and six oxygen using light energy.' },
            { prompt: 'In which organelle does photosynthesis occur?', answer: 'Chloroplast', explanation: 'Light reactions happen in thylakoids and the Calvin cycle in the stroma.' },
          ],
        },
        {
          name: 'Cellular Respiration',
          description: 'Follow glucose through glycolysis, the Krebs cycle, and the electron transport chain.',
          questions: [
            { prompt: 'How many net ATP molecules does aerobic respiration typically yield per glucose?', answer: 'About 30-32 ATP', explanation: 'Newer textbooks cite ~30-32 accounting for the cost of shuttling NADH.' },
            { prompt: 'Where does the Krebs cycle take place inside the cell?', answer: 'Mitochondrial matrix', explanation: 'Pyruvate is converted to acetyl-CoA and enters the cycle in the matrix.' },
          ],
        },
        {
          name: 'Passive Transport',
          description: 'Explore diffusion, osmosis, and facilitated diffusion across membranes.',
          questions: [
            { prompt: 'A cell placed in hypertonic solution will do what?', answer: 'Lose water and shrink (crenate or plasmolyze).', explanation: 'Water moves from high to low water concentration, leaving the cell.' },
            { prompt: 'Does passive transport require ATP?', answer: 'No', explanation: 'Movement follows the concentration gradient and requires no cellular energy.' },
          ],
        },
        {
          name: 'Active Transport',
          description: 'Examine pumps, endocytosis, and exocytosis that move molecules against gradients.',
          questions: [
            { prompt: 'What is pumped by the sodium-potassium pump and in which direction?', answer: '3 Na+ out, 2 K+ in per ATP hydrolyzed.', explanation: 'This creates an electrochemical gradient essential for nerve signaling.' },
            { prompt: 'Which process engulfs large particles into the cell?', answer: 'Phagocytosis', explanation: 'A form of endocytosis in which the membrane wraps around solid material.' },
          ],
        },
        {
          name: 'Enzymes and Metabolism',
          description: 'Understand activation energy, active sites, and factors affecting enzyme activity.',
          questions: [
            { prompt: 'What do enzymes lower so reactions can occur faster?', answer: 'Activation energy', explanation: 'Enzymes stabilize the transition state, reducing the energy barrier.' },
            { prompt: 'Will heating an enzyme to 80 C typically increase or decrease its activity? Why?', answer: 'Decrease - high heat denatures the protein and destroys its active site.', explanation: 'Denaturation breaks the 3D shape needed for substrate binding.' },
          ],
        },
      ],
    },
    {
      name: 'Reproduction and Cell Division',
      description: 'Examine mitosis, meiosis, and how sexual reproduction produces genetic variation.',
      lessons: [
        {
          name: 'The Cell Cycle',
          description: 'Identify phases of interphase and checkpoints that regulate division.',
          questions: [
            { prompt: 'What occurs during the S phase of interphase?', answer: 'DNA replication', explanation: 'Each chromosome is duplicated into two sister chromatids.' },
            { prompt: 'Name the three main checkpoints of the cell cycle.', answer: 'G1, G2, and M (spindle) checkpoints.', explanation: 'These ensure DNA integrity and proper spindle attachment.' },
          ],
        },
        {
          name: 'Mitosis Phases',
          description: 'Walk through prophase, metaphase, anaphase, telophase, and cytokinesis.',
          questions: [
            { prompt: 'During which phase do sister chromatids separate?', answer: 'Anaphase', explanation: 'Microtubules pull chromatids toward opposite poles.' },
            { prompt: 'A human body cell enters mitosis with 46 chromosomes. Each daughter cell has how many?', answer: '46', explanation: 'Mitosis produces two genetically identical diploid daughter cells.' },
          ],
        },
        {
          name: 'Meiosis and Gamete Formation',
          description: 'Compare meiosis I and II and how they produce haploid gametes.',
          questions: [
            { prompt: 'How many daughter cells result from one cell going through meiosis?', answer: 'Four haploid cells', explanation: 'Two sequential divisions yield four genetically unique gametes.' },
            { prompt: 'A human gamete contains how many chromosomes?', answer: '23', explanation: 'Haploid (n) = half of the diploid number 46.' },
          ],
        },
        {
          name: 'Sources of Genetic Variation',
          description: 'Explore crossing over, independent assortment, and random fertilization.',
          questions: [
            { prompt: 'During which meiotic phase does crossing over occur?', answer: 'Prophase I', explanation: 'Homologous chromosomes pair up and exchange segments at chiasmata.' },
            { prompt: 'Roughly how many unique gamete combinations can humans make from independent assortment alone?', answer: '2^23 ≈ 8.4 million', explanation: 'Each of 23 chromosome pairs can orient two ways.' },
          ],
        },
        {
          name: 'Asexual vs Sexual Reproduction',
          description: 'Weigh trade-offs between speed, variation, and adaptability.',
          questions: [
            { prompt: 'Give one advantage of asexual reproduction over sexual reproduction.', answer: 'Faster and does not require a mate.', explanation: 'All energy goes to offspring production instead of finding partners.' },
            { prompt: 'Why is sexual reproduction favored in changing environments?', answer: 'It creates genetic variation, improving survival chances.', explanation: 'Variation provides raw material for natural selection.' },
          ],
        },
      ],
    },
    {
      name: 'Classical Genetics',
      description: 'Apply Mendel\'s laws, Punnett squares, and pedigrees to predict inherited traits.',
      lessons: [
        {
          name: 'Mendel\'s Laws',
          description: 'Study segregation and independent assortment discovered with pea plants.',
          questions: [
            { prompt: 'State Mendel\'s Law of Segregation.', answer: 'Each parent passes only one of its two alleles to each offspring.', explanation: 'Alleles separate during gamete formation.' },
            { prompt: 'What does the Law of Independent Assortment state?', answer: 'Alleles of different genes assort independently during gamete formation.', explanation: 'Only applies to genes on different chromosomes (or far apart on the same).' },
          ],
        },
        {
          name: 'Punnett Squares',
          description: 'Use grid diagrams to predict offspring genotypes and phenotypes.',
          questions: [
            { prompt: 'What ratio of offspring results from crossing Tt x Tt?', answer: '1 TT : 2 Tt : 1 tt (or 3:1 dominant:recessive phenotypes).', explanation: 'The classic monohybrid cross ratio.' },
            { prompt: 'Cross TT x tt. What percent of offspring are heterozygous?', answer: '100%', explanation: 'All offspring inherit one T and one t allele.' },
          ],
        },
        {
          name: 'Incomplete Dominance and Codominance',
          description: 'Explore exceptions to simple dominance patterns.',
          questions: [
            { prompt: 'Red (RR) x White (WW) snapdragons produce pink flowers. What inheritance pattern is this?', answer: 'Incomplete dominance', explanation: 'The heterozygote shows a blended intermediate phenotype.' },
            { prompt: 'In human blood type AB, both A and B antigens appear. What is this called?', answer: 'Codominance', explanation: 'Both alleles are fully expressed in the heterozygote.' },
          ],
        },
        {
          name: 'Sex-Linked Inheritance',
          description: 'Track genes on the X chromosome, such as colorblindness and hemophilia.',
          questions: [
            { prompt: 'Why are males more likely to express X-linked recessive disorders?', answer: 'They have only one X chromosome, so a single recessive allele is expressed.', explanation: 'Females need two recessive alleles to be affected.' },
            { prompt: 'A carrier mother (X^C X^c) and unaffected father (X^C Y) have a son. What is the chance he is colorblind?', answer: '50%', explanation: 'Sons inherit X from mother; half of her X chromosomes carry the recessive allele.' },
          ],
        },
        {
          name: 'Pedigrees',
          description: 'Interpret family trees to determine inheritance patterns.',
          questions: [
            { prompt: 'If a trait appears in every generation and affects both sexes equally, what pattern is likely?', answer: 'Autosomal dominant', explanation: 'No skipping of generations and equal sex distribution suggests dominant autosomal.' },
            { prompt: 'Two unaffected parents have an affected child. What inheritance pattern does this suggest?', answer: 'Recessive (both parents carriers)', explanation: 'Recessive traits skip generations when carriers mate.' },
          ],
        },
      ],
    },
    {
      name: 'Molecular Genetics',
      description: 'Explore DNA structure, replication, transcription, translation, and gene regulation.',
      lessons: [
        {
          name: 'DNA Structure',
          description: 'Identify bases, the double helix, and base-pairing rules.',
          questions: [
            { prompt: 'Which base pairs with adenine in DNA?', answer: 'Thymine', explanation: 'A-T forms two hydrogen bonds; G-C forms three.' },
            { prompt: 'What are the two directions of DNA strands called?', answer: 'Antiparallel (5\' to 3\' and 3\' to 5\')', explanation: 'One strand runs 5\' to 3\', the complementary strand runs the opposite direction.' },
          ],
        },
        {
          name: 'DNA Replication',
          description: 'Examine semi-conservative copying by helicase, polymerase, and ligase.',
          questions: [
            { prompt: 'Why is DNA replication called "semi-conservative"?', answer: 'Each new DNA molecule contains one original and one new strand.', explanation: 'Demonstrated by Meselson and Stahl in 1958.' },
            { prompt: 'What enzyme unwinds the double helix?', answer: 'Helicase', explanation: 'Helicase breaks hydrogen bonds between base pairs.' },
          ],
        },
        {
          name: 'Transcription',
          description: 'Convert DNA code into mRNA inside the nucleus.',
          questions: [
            { prompt: 'Which enzyme carries out transcription?', answer: 'RNA polymerase', explanation: 'It reads template DNA 3\' to 5\' and builds RNA 5\' to 3\'.' },
            { prompt: 'In RNA, uracil pairs with which DNA base?', answer: 'Adenine', explanation: 'RNA uses U instead of T in DNA.' },
          ],
        },
        {
          name: 'Translation',
          description: 'Assemble amino acids into proteins at the ribosome using codons.',
          questions: [
            { prompt: 'How many nucleotides make up one codon?', answer: '3', explanation: 'Each triplet codes for one amino acid (or stop signal).' },
            { prompt: 'What molecule carries amino acids to the ribosome?', answer: 'tRNA (transfer RNA)', explanation: 'Each tRNA has an anticodon that pairs with the mRNA codon.' },
          ],
        },
        {
          name: 'Mutations and Gene Regulation',
          description: 'Classify mutations and introduce how cells switch genes on and off.',
          questions: [
            { prompt: 'What type of mutation replaces a single nucleotide?', answer: 'Point (substitution) mutation', explanation: 'Can be silent, missense, or nonsense.' },
            { prompt: 'In the lac operon, what represses transcription when lactose is absent?', answer: 'The lac repressor protein bound to the operator.', explanation: 'Lactose inactivates the repressor, turning the genes on.' },
          ],
        },
      ],
    },
    {
      name: 'Evolution',
      description: 'Study natural selection, speciation, and evidence for common ancestry.',
      lessons: [
        {
          name: 'Natural Selection',
          description: 'Identify the four conditions needed for selection to occur.',
          questions: [
            { prompt: 'Name Darwin\'s four requirements for natural selection.', answer: 'Variation, heritability, differential reproduction, and competition for resources.', explanation: 'Together they cause adaptive change over generations.' },
            { prompt: 'Does natural selection act on the individual or the population?', answer: 'Individuals are selected, but populations evolve.', explanation: 'Allele frequencies in the gene pool shift over time.' },
          ],
        },
        {
          name: 'Evidence for Evolution',
          description: 'Review fossils, anatomy, embryology, and molecular biology evidence.',
          questions: [
            { prompt: 'What do homologous structures suggest about species?', answer: 'Common ancestry', explanation: 'Similar structure despite different function (e.g., bat wing and human arm).' },
            { prompt: 'Give one molecular line of evidence for evolution.', answer: 'Shared DNA sequences or universal genetic code among all life.', explanation: 'All organisms share the same 4 bases and 20 amino acids.' },
          ],
        },
        {
          name: 'Speciation',
          description: 'Explore how reproductive isolation creates new species.',
          questions: [
            { prompt: 'What is the biological species concept?', answer: 'Organisms that can interbreed and produce fertile offspring.', explanation: 'It does not apply well to asexual organisms.' },
            { prompt: 'Name one form of reproductive isolation.', answer: 'Geographic, temporal, behavioral, or mechanical isolation.', explanation: 'Any barrier preventing gene flow between populations.' },
          ],
        },
        {
          name: 'Hardy-Weinberg Equilibrium',
          description: 'Use p + q = 1 and p^2 + 2pq + q^2 = 1 to calculate allele frequencies.',
          questions: [
            { prompt: 'If q = 0.3, what is the frequency of homozygous dominant (p^2)?', answer: '0.49', explanation: 'p = 0.7, so p^2 = 0.49.' },
            { prompt: 'Name one Hardy-Weinberg assumption.', answer: 'No mutation, random mating, large population, no migration, no selection.', explanation: 'If any assumption fails, allele frequencies change.' },
          ],
        },
        {
          name: 'Human Evolution',
          description: 'Trace the hominin lineage from early primates to Homo sapiens.',
          questions: [
            { prompt: 'What species preceded Homo sapiens and coexisted in Europe?', answer: 'Homo neanderthalensis (Neanderthals)', explanation: 'They went extinct ~40,000 years ago but interbred with H. sapiens.' },
            { prompt: 'About how old are the oldest Homo sapiens fossils?', answer: 'About 300,000 years', explanation: 'Discovered at Jebel Irhoud, Morocco.' },
          ],
        },
      ],
    },
    {
      name: 'Human Body Systems',
      description: 'Tour major organ systems and how they maintain homeostasis.',
      lessons: [
        {
          name: 'Circulatory System',
          description: 'Trace blood flow through the heart, arteries, capillaries, and veins.',
          questions: [
            { prompt: 'How many chambers does the human heart have?', answer: '4 (two atria and two ventricles)', explanation: 'Right side pumps to lungs; left side pumps to body.' },
            { prompt: 'Which blood vessels carry oxygen-poor blood to the lungs?', answer: 'Pulmonary arteries', explanation: 'Unusual because most arteries carry oxygen-rich blood.' },
          ],
        },
        {
          name: 'Respiratory System',
          description: 'Study gas exchange across alveoli and the mechanics of breathing.',
          questions: [
            { prompt: 'Where does gas exchange occur in the lungs?', answer: 'Alveoli', explanation: 'Tiny air sacs surrounded by capillaries allow oxygen and CO2 diffusion.' },
            { prompt: 'Which muscle contracts to cause inhalation?', answer: 'Diaphragm', explanation: 'Its contraction lowers pressure, pulling air in.' },
          ],
        },
        {
          name: 'Nervous System',
          description: 'Compare central and peripheral divisions and how neurons signal.',
          questions: [
            { prompt: 'What is the resting membrane potential of a typical neuron?', answer: 'About -70 mV', explanation: 'Maintained by the Na+/K+ pump and K+ leak channels.' },
            { prompt: 'Name the gap between neurons.', answer: 'Synapse', explanation: 'Neurotransmitters cross it to pass the signal.' },
          ],
        },
        {
          name: 'Digestive System',
          description: 'Follow food from mouth to intestines and how nutrients are absorbed.',
          questions: [
            { prompt: 'Where does most nutrient absorption occur?', answer: 'Small intestine', explanation: 'Villi and microvilli massively increase surface area.' },
            { prompt: 'What enzyme in saliva begins carbohydrate digestion?', answer: 'Amylase', explanation: 'It breaks starch into maltose.' },
          ],
        },
        {
          name: 'Immune System',
          description: 'Distinguish innate and adaptive immunity and vaccine function.',
          questions: [
            { prompt: 'Which cells directly kill virus-infected or cancer cells?', answer: 'Cytotoxic T cells (CD8+)', explanation: 'They release perforin and granzymes to induce apoptosis.' },
            { prompt: 'How do vaccines produce long-term immunity?', answer: 'By creating memory B and T cells against an antigen.', explanation: 'Memory cells respond rapidly during later real infections.' },
          ],
        },
        {
          name: 'Homeostasis',
          description: 'Explore feedback loops that regulate temperature, glucose, and water.',
          questions: [
            { prompt: 'Which hormone lowers blood glucose levels?', answer: 'Insulin', explanation: 'Secreted by pancreatic beta cells after eating.' },
            { prompt: 'Is human body temperature regulated by positive or negative feedback?', answer: 'Negative feedback', explanation: 'Deviations trigger responses that return values to normal.' },
          ],
        },
      ],
    },
    {
      name: 'Ecology',
      description: 'Examine populations, communities, ecosystems, cycles, and biodiversity.',
      lessons: [
        {
          name: 'Population Ecology',
          description: 'Model growth curves, carrying capacity, and limiting factors.',
          questions: [
            { prompt: 'What type of growth shows a J-shaped curve?', answer: 'Exponential growth', explanation: 'Occurs in ideal, unlimited-resource conditions.' },
            { prompt: 'What letter represents carrying capacity?', answer: 'K', explanation: 'Maximum population size an environment can sustainably support.' },
          ],
        },
        {
          name: 'Community Interactions',
          description: 'Classify symbiosis, predation, and competition among species.',
          questions: [
            { prompt: 'A tick on a dog is an example of which symbiotic relationship?', answer: 'Parasitism', explanation: 'One benefits (+) while the other is harmed (-).' },
            { prompt: 'Both organisms benefit in which relationship?', answer: 'Mutualism (+/+)', explanation: 'Example: bees and flowers.' },
          ],
        },
        {
          name: 'Energy Flow and Food Webs',
          description: 'Apply the 10 percent rule across trophic levels.',
          questions: [
            { prompt: 'If primary producers store 10,000 kcal, about how much reaches secondary consumers?', answer: '100 kcal', explanation: '10% transfer across each of two levels: 10,000 -> 1,000 -> 100.' },
            { prompt: 'What role do decomposers play in an ecosystem?', answer: 'Recycle nutrients by breaking down dead matter.', explanation: 'Bacteria and fungi return nitrogen, phosphorus, and carbon to soil.' },
          ],
        },
        {
          name: 'Biogeochemical Cycles',
          description: 'Trace the water, carbon, and nitrogen cycles through ecosystems.',
          questions: [
            { prompt: 'Which process converts atmospheric N2 to a usable form for plants?', answer: 'Nitrogen fixation (by bacteria)', explanation: 'Rhizobium bacteria in legume roots are a major source.' },
            { prompt: 'Name the largest reservoir of carbon on Earth.', answer: 'Oceans (or sedimentary rocks)', explanation: 'Oceans hold about 50x more CO2 than the atmosphere.' },
          ],
        },
        {
          name: 'Biodiversity and Conservation',
          description: 'Understand species richness, ecosystem services, and conservation strategies.',
          questions: [
            { prompt: 'Name two major threats to biodiversity.', answer: 'Habitat loss, climate change, pollution, invasive species, overexploitation.', explanation: 'Often remembered by the acronym HIPPO.' },
            { prompt: 'What is a keystone species?', answer: 'A species whose removal causes major change in its ecosystem.', explanation: 'Example: sea otters controlling urchin populations.' },
          ],
        },
      ],
    },
  ],
};
