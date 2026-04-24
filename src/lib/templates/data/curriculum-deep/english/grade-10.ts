import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '10',
  label: 'Grade 10 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/10th-grade-reading-and-vocabulary',
  units: [
    {
      name: 'Into the Unknown',
      description: "Read stories and articles about exploration to analyze theme, structure, and author's craft.",
      lessons: [
        {
          name: 'Theme in exploration texts',
          description: 'Identify themes about discovery and risk.',
          questions: [
            { prompt: 'Explorer loses crew but maps new land. Theme?', answer: 'Discovery demands sacrifice.', explanation: 'Cost and reward.' },
            { prompt: 'Ocean narrative ends: "The horizon was only the start." Theme?', answer: 'Curiosity is boundless.', explanation: 'Horizon = edge of known.' },
          ],
        },
        {
          name: 'Structure of informational texts',
          description: 'Analyze how exploration articles are organized.',
          questions: [
            { prompt: 'Article alternates between modern and 1500s voyages. Structure?', answer: 'Compare-contrast.', explanation: 'Two periods compared.' },
            { prompt: 'Text lists problems then solutions in Mars travel. Structure?', answer: 'Problem-solution.', explanation: 'Issue then fix.' },
          ],
        },
        {
          name: "Author's craft",
          description: 'Analyze figurative language and tone in exploration writing.',
          questions: [
            { prompt: '"The ice swallowed our footprints." Device?', answer: 'Personification.', explanation: 'Ice given action.' },
            { prompt: 'Tone of "The silence was vast, the stars closer." ?', answer: 'Awestruck.', explanation: 'Wonder and scale.' },
          ],
        },
        {
          name: 'Inference and evidence',
          description: 'Draw conclusions and cite evidence.',
          questions: [
            { prompt: 'Crew rations food carefully. Infer?', answer: 'Journey may run long.', explanation: 'Rationing anticipates scarcity.' },
            { prompt: 'Strongest proof Amundsen reached pole?', answer: 'Photos with instruments.', explanation: 'Documented evidence.' },
          ],
        },
        {
          name: 'Vocabulary in context',
          description: 'Build exploration-related vocabulary.',
          questions: [
            { prompt: '"Uncharted" means?', answer: 'Unmapped.', explanation: 'Not recorded.' },
            { prompt: '"Intrepid" means?', answer: 'Fearless.', explanation: 'Brave.' },
          ],
        },
      ],
    },
    {
      name: 'Winds of Change',
      description: 'Read texts about transformation and social change to practice argument and evidence.',
      lessons: [
        {
          name: 'Claims and arguments',
          description: 'Locate and evaluate claims about social change.',
          questions: [
            { prompt: '"Clean energy creates jobs." Type?', answer: 'Claim.', explanation: 'Position statement.' },
            { prompt: 'Evidence: "GDP of renewables rose 40%." Supports?', answer: 'Economic claim.', explanation: 'Data supports.' },
          ],
        },
        {
          name: 'Rhetorical analysis',
          description: 'Examine ethos, pathos, logos in reform writing.',
          questions: [
            { prompt: 'MLK "I Have a Dream" uses anaphora. Effect?', answer: 'Builds emotional momentum.', explanation: 'Repetition intensifies.' },
            { prompt: '"Scientists agree" uses?', answer: 'Ethos.', explanation: 'Expert authority.' },
          ],
        },
        {
          name: 'Evaluating reasoning',
          description: 'Judge logic of arguments about change.',
          questions: [
            { prompt: '"Everyone should drive EVs because I do." Flaw?', answer: 'Hasty generalization.', explanation: 'Single-case basis.' },
            { prompt: '"Data and case studies" — reasoning strength?', answer: 'Well-supported.', explanation: 'Multiple sources.' },
          ],
        },
        {
          name: 'Perspective and purpose',
          description: 'Identify stance and reason for writing.',
          questions: [
            { prompt: 'Essay calls for voting reform. Purpose?', answer: 'Persuade.', explanation: 'Advocates change.' },
            { prompt: 'Historical account of suffrage. Purpose?', answer: 'Inform.', explanation: 'Narrates history.' },
          ],
        },
      ],
    },
    {
      name: 'Social Connections',
      description: 'Analyze relationships among humans and animals through paired fiction and nonfiction.',
      lessons: [
        {
          name: 'Paired passage synthesis',
          description: 'Synthesize ideas from two texts on relationships.',
          questions: [
            { prompt: 'Essay and memoir agree pets aid health. Synthesis?', answer: 'Animals support wellness.', explanation: 'Shared point.' },
            { prompt: 'Texts disagree on zoo ethics. Synthesis?', answer: 'Debate exists about captivity.', explanation: 'Balance sides.' },
          ],
        },
        {
          name: 'Character and relationship',
          description: 'Analyze how relationships shape characters.',
          questions: [
            { prompt: 'Narrator softens after adopting dog. Change?', answer: 'Empathy grows.', explanation: 'New bond affects trait.' },
            { prompt: 'Rivals bond during a storm. Dynamic?', answer: 'Shared struggle builds trust.', explanation: 'Crisis unites.' },
          ],
        },
        {
          name: 'Figurative language',
          description: 'Analyze metaphors about connection.',
          questions: [
            { prompt: '"Friendship is a bridge." Device?', answer: 'Metaphor.', explanation: 'Direct comparison.' },
            { prompt: 'Imagery "hands clasped like vines" meaning?', answer: 'Intertwined closeness.', explanation: 'Simile of nature.' },
          ],
        },
        {
          name: 'Theme across genres',
          description: 'Track a theme in fiction and nonfiction together.',
          questions: [
            { prompt: 'Story and article both show animals aid healing. Theme?', answer: 'Animal companions foster recovery.', explanation: 'Shared conclusion.' },
            { prompt: 'Both texts highlight listening. Theme?', answer: 'Connection requires attention.', explanation: 'Shared point.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Informational Text',
      description: 'Cite strong textual evidence and analyze how complex ideas develop in nonfiction.',
      lessons: [
        {
          name: 'Analyzing complex ideas',
          description: 'Trace how ideas develop across paragraphs.',
          questions: [
            { prompt: 'Article introduces AI, adds ethics, ends with policy. Development?', answer: 'Moves from concept to implication.', explanation: 'Builds outward.' },
            { prompt: 'Essay defines term then gives examples. Development?', answer: 'Definition to illustration.', explanation: 'Concrete supports abstract.' },
          ],
        },
        {
          name: 'Structure and connections',
          description: 'Analyze how paragraphs relate.',
          questions: [
            { prompt: 'Paragraph 3 provides counterexample to paragraph 2. Role?', answer: 'Introduces complication.', explanation: 'Counter adds nuance.' },
            { prompt: 'Final paragraph summarizes and calls to action. Role?', answer: 'Conclusion and appeal.', explanation: 'Ends with purpose.' },
          ],
        },
        {
          name: 'Purpose and rhetoric',
          description: "Analyze author's persuasive choices.",
          questions: [
            { prompt: 'Author uses statistics plus personal story. Why?', answer: 'Balances logos and pathos.', explanation: 'Combined appeals.' },
            { prompt: 'Author quotes opponents then refutes. Why?', answer: 'Builds credibility.', explanation: 'Addresses counterclaims.' },
          ],
        },
        {
          name: 'Evaluating evidence',
          description: 'Assess evidence relevance and sufficiency.',
          questions: [
            { prompt: '"Based on one tweet" — evidence strength?', answer: 'Weak.', explanation: 'Single anecdote.' },
            { prompt: 'Multiple peer-reviewed studies. Strength?', answer: 'Strong.', explanation: 'Varied credible sources.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Literature',
      description: 'Analyze theme, complex characters, and figurative language across literary texts.',
      lessons: [
        {
          name: 'Theme development',
          description: 'Track how theme emerges across a story.',
          questions: [
            { prompt: 'Early scene: character hoards; late: gives away. Theme?', answer: 'Generosity transforms.', explanation: 'Shift reveals theme.' },
            { prompt: 'Recurring image of clock. Theme?', answer: 'Time shapes choices.', explanation: 'Repeated symbol.' },
          ],
        },
        {
          name: 'Complex characters',
          description: 'Analyze multiple character traits and motivations.',
          questions: [
            { prompt: 'Teacher is strict yet secretly funds students. Complexity?', answer: 'Caring beneath strictness.', explanation: 'Mixed traits.' },
            { prompt: 'Hero doubts self but acts bravely. Complexity?', answer: 'Courage despite fear.', explanation: 'Contradiction adds depth.' },
          ],
        },
        {
          name: 'Figurative language',
          description: 'Analyze metaphor, symbolism, and imagery.',
          questions: [
            { prompt: '"She wore her grief like a coat." Device?', answer: 'Simile.', explanation: 'Like grief to coat.' },
            { prompt: 'Recurring white dove in novel. Symbol?', answer: 'Peace or hope.', explanation: 'Conventional symbol.' },
          ],
        },
        {
          name: 'Structure and style',
          description: 'Analyze non-linear plots and voice.',
          questions: [
            { prompt: 'Novel begins at end, flashes back. Effect?', answer: 'Creates suspense.', explanation: 'Known ending raises how/why.' },
            { prompt: 'First-person unreliable narrator. Effect?', answer: 'Makes reader question reality.', explanation: 'Trust is limited.' },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary',
      description: 'Build college- and career-ready vocabulary using context, word parts, and reference tools.',
      lessons: [
        {
          name: 'Advanced context clues',
          description: 'Infer meanings from complex passages.',
          questions: [
            { prompt: '"The ephemeral mist vanished by noon." Meaning?', answer: 'Short-lived.', explanation: 'Vanished quickly.' },
            { prompt: '"He was laconic, wasting no words." Meaning?', answer: 'Brief in speech.', explanation: 'Context defines.' },
          ],
        },
        {
          name: 'Etymology',
          description: 'Use word origins to decode meaning.',
          questions: [
            { prompt: '"Photograph" — photo- means?', answer: 'Light.', explanation: 'Greek.' },
            { prompt: '"Democracy" — demo- means?', answer: 'People.', explanation: 'Greek.' },
          ],
        },
        {
          name: 'Connotation',
          description: 'Distinguish emotional weight of words.',
          questions: [
            { prompt: '"Stubborn" vs "steadfast." Positive?', answer: 'Steadfast.', explanation: 'Positive connotation.' },
            { prompt: '"Slim" vs "scrawny." Positive?', answer: 'Slim.', explanation: 'Neutral/positive.' },
          ],
        },
        {
          name: 'Figurative vocabulary',
          description: 'Interpret idioms and figurative phrases.',
          questions: [
            { prompt: '"Under the weather" means?', answer: 'Unwell.', explanation: 'Idiom for sick.' },
            { prompt: '"Burning the midnight oil" means?', answer: 'Working late.', explanation: 'Idiom.' },
          ],
        },
      ],
    },
  ],
};
