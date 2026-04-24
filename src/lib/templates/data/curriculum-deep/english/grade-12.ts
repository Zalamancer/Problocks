import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '12',
  label: 'Grade 12 English Language Arts',
  sourceUrl: 'https://www.khanacademy.org/test-prep/sat-reading-and-writing',
  units: [
    {
      name: 'Reading: Literature',
      description: 'Analyze literary texts of recognized complexity with strong textual evidence and inference.',
      lessons: [
        {
          name: 'RL.11-12.1 — Textual evidence and inference',
          description: 'Cite strong evidence for explicit and inferred meanings.',
          questions: [
            { prompt: 'Strongest evidence for inference that Hamlet doubts the ghost?', answer: '"The spirit that I have seen may be the devil."', explanation: 'Direct doubt.' },
            { prompt: 'Evidence Daisy chooses wealth over love?', answer: '"Her voice is full of money."', explanation: 'Symbolic line.' },
          ],
        },
        {
          name: 'RL.11-12.2 — Multiple themes',
          description: 'Trace two or more themes interacting across a complex text.',
          questions: [
            { prompt: 'In Things Fall Apart two themes?', answer: 'Tradition vs change; pride and downfall.', explanation: 'Intertwined themes.' },
            { prompt: 'Objective summary excludes?', answer: 'Personal opinion.', explanation: 'Neutral.' },
          ],
        },
        {
          name: 'RL.11-12.3 — Structural and character choices',
          description: 'Analyze how structural and character choices shape meaning.',
          questions: [
            { prompt: 'Faulkner alternating narrators in As I Lay Dying. Effect?', answer: 'Multiple truths and biases.', explanation: 'Polyphony.' },
            { prompt: 'Shakespeare opens Macbeth with witches. Effect?', answer: 'Sets supernatural mood.', explanation: 'Tone-setting.' },
          ],
        },
        {
          name: 'RL.11-12.5 — Structure contribution to meaning',
          description: 'Analyze author\'s choices about structure.',
          questions: [
            { prompt: 'Frame narrative in Heart of Darkness effect?', answer: 'Distances and filters truth.', explanation: 'Narration layers.' },
            { prompt: 'In medias res opening effect?', answer: 'Plunges reader into action.', explanation: 'Immediate engagement.' },
          ],
        },
        {
          name: 'RL.11-12.9 — Source material analysis',
          description: 'Analyze how authors transform source material.',
          questions: [
            { prompt: 'West Side Story adapts Romeo and Juliet. Change?', answer: 'Context (NYC gangs) but keeps themes.', explanation: 'Modern retelling.' },
            { prompt: 'Morrison draws from Bible in Song of Solomon. Effect?', answer: 'Adds mythic resonance.', explanation: 'Allusion.' },
          ],
        },
      ],
    },
    {
      name: 'Reading: Informational Text',
      description: 'Evaluate seminal US and world documents for purpose, rhetoric, and historical significance.',
      lessons: [
        {
          name: 'RI.11-12.1 — Strong evidence',
          description: 'Cite strong evidence from seminal texts.',
          questions: [
            { prompt: 'Best evidence Lincoln sought unity in Second Inaugural?', answer: '"With malice toward none, with charity for all."', explanation: 'Reconciliation theme.' },
            { prompt: 'Evidence Douglass exposed slavery\'s cruelty?', answer: 'Detailed whipping scene.', explanation: 'Concrete detail.' },
          ],
        },
        {
          name: 'RI.11-12.2 — Central ideas',
          description: 'Track two central ideas and their interaction.',
          questions: [
            { prompt: 'Declaration central ideas?', answer: 'Equality; right to revolt.', explanation: 'Two linked claims.' },
            { prompt: 'Roosevelt\'s "Four Freedoms" core ideas?', answer: 'Fundamental liberties; global responsibility.', explanation: 'Dual focus.' },
          ],
        },
        {
          name: 'RI.11-12.5 — Structure and exposition',
          description: 'Analyze effective structure in seminal arguments.',
          questions: [
            { prompt: 'Gettysburg Address structure?', answer: 'Past, present, future.', explanation: 'Temporal frame.' },
            { prompt: 'Letter from Birmingham Jail structure?', answer: 'Responds point by point.', explanation: 'Rebuttal.' },
          ],
        },
        {
          name: 'RI.11-12.6 — Rhetoric and style',
          description: 'Analyze rhetorical choices in seminal documents.',
          questions: [
            { prompt: 'MLK uses anaphora in "Dream." Effect?', answer: 'Builds emotional momentum.', explanation: 'Repetition.' },
            { prompt: 'Parallelism in Declaration effect?', answer: 'Emphasizes shared rights.', explanation: 'Pattern emphasis.' },
          ],
        },
        {
          name: 'RI.11-12.8 — Evaluating argument',
          description: 'Evaluate reasoning, premises, purposes.',
          questions: [
            { prompt: 'Federalist 51 argues separation of powers. Logic?', answer: 'Checks prevent tyranny.', explanation: 'Core premise.' },
            { prompt: 'Weak rhetorical move?', answer: 'Ad hominem attack.', explanation: 'Attacks person, not argument.' },
          ],
        },
      ],
    },
    {
      name: 'Writing: Arguments',
      description: 'Craft college-ready arguments supported by valid reasoning and sufficient evidence.',
      lessons: [
        {
          name: 'W.11-12.1a — Precise claim',
          description: 'Introduce precise and knowledgeable claims.',
          questions: [
            { prompt: 'Stronger claim? "AI is interesting." "AI hiring tools reinforce bias."', answer: 'Second.', explanation: 'Specific and arguable.' },
            { prompt: 'Revise "Climate change is bad."', answer: '"Unchecked climate change threatens coastal cities."', explanation: 'Sharper thesis.' },
          ],
        },
        {
          name: 'W.11-12.1b — Reasons and evidence',
          description: 'Develop claim with sufficient evidence.',
          questions: [
            { prompt: 'Best evidence for AI bias claim?', answer: 'Peer-reviewed audit of hiring tools.', explanation: 'Authoritative data.' },
            { prompt: 'Weakest?', answer: '"A friend said so."', explanation: 'Hearsay.' },
          ],
        },
        {
          name: 'W.11-12.1c — Cohesion and counterclaims',
          description: 'Link claims and counterclaims.',
          questions: [
            { prompt: 'Transition acknowledging counterclaim?', answer: '"While opponents argue…"', explanation: 'Signals concession.' },
            { prompt: 'Return to claim after counter?', answer: '"Nevertheless, the evidence shows…"', explanation: 'Rebuttal transition.' },
          ],
        },
        {
          name: 'W.11-12.1f — Conclusion',
          description: 'Write conclusion that extends argument.',
          questions: [
            { prompt: 'Effective conclusion?', answer: 'Synthesizes and calls for action.', explanation: 'Beyond summary.' },
            { prompt: 'Avoid conclusion that?', answer: 'Introduces new claim.', explanation: 'Stays focused.' },
          ],
        },
      ],
    },
    {
      name: 'Writing: Informative/Explanatory',
      description: 'Examine complex ideas with precise language, organization, and formal style.',
      lessons: [
        {
          name: 'W.11-12.2b — Well-chosen facts',
          description: 'Develop topic with relevant facts, details, quotes.',
          questions: [
            { prompt: 'Best fact for essay on microplastics?', answer: 'Peer-reviewed ocean study.', explanation: 'Authoritative.' },
            { prompt: 'Quote choice should?', answer: 'Come from credible source.', explanation: 'Source matters.' },
          ],
        },
        {
          name: 'W.11-12.2d — Precise language',
          description: 'Use domain-specific vocabulary.',
          questions: [
            { prompt: 'Term for decreasing biodiversity?', answer: 'Species loss or biodiversity decline.', explanation: 'Precise term.' },
            { prompt: 'Revise "a lot of viruses" in science essay.', answer: 'Numerous pathogens.', explanation: 'Academic diction.' },
          ],
        },
        {
          name: 'W.11-12.2e — Formal style',
          description: 'Establish objective, formal tone.',
          questions: [
            { prompt: 'Revise "Scientists totally disagree" formally.', answer: 'Scientists express strong disagreement.', explanation: 'Remove slang.' },
            { prompt: 'Avoid in formal writing?', answer: 'Contractions.', explanation: 'Keep formal tone.' },
          ],
        },
        {
          name: 'W.11-12.2f — Conclusion',
          description: 'Conclude by reflecting on implications.',
          questions: [
            { prompt: 'Best conclusion move?', answer: 'State implications.', explanation: 'Looks forward.' },
            { prompt: 'Avoid?', answer: 'Unsupported prediction.', explanation: 'Stay evidence-based.' },
          ],
        },
      ],
    },
    {
      name: 'Research & Citation',
      description: 'Conduct sustained research, synthesize multiple sources, and cite responsibly.',
      lessons: [
        {
          name: 'W.11-12.7 — Sustained research',
          description: 'Conduct research to answer question or solve problem.',
          questions: [
            { prompt: 'Best first step for research?', answer: 'Refine research question.', explanation: 'Clarity first.' },
            { prompt: 'Avoid?', answer: 'Using only one source.', explanation: 'Diversify.' },
          ],
        },
        {
          name: 'W.11-12.8 — Source evaluation',
          description: 'Gather and assess credible sources.',
          questions: [
            { prompt: 'Most credible source for medical claim?', answer: 'Peer-reviewed journal.', explanation: 'Expert review.' },
            { prompt: 'Red flag on website?', answer: 'No author or date.', explanation: 'Cannot verify.' },
          ],
        },
        {
          name: 'Citation and attribution',
          description: 'Cite sources using MLA or APA.',
          questions: [
            { prompt: 'MLA in-text: Smith claims cities reduce emissions. Format?', answer: '(Smith 12).', explanation: 'Author page.' },
            { prompt: 'APA in-text?', answer: '(Smith, 2023, p. 12).', explanation: 'Author year page.' },
          ],
        },
        {
          name: 'Avoiding plagiarism',
          description: 'Integrate sources responsibly.',
          questions: [
            { prompt: 'Paraphrasing requires?', answer: 'Citing and rewording.', explanation: 'Both.' },
            { prompt: 'Quoting requires?', answer: 'Exact words and citation.', explanation: 'Marks source.' },
          ],
        },
      ],
    },
    {
      name: 'Speaking & Listening',
      description: 'Lead collaborative discussions and deliver well-structured, evidence-based presentations.',
      lessons: [
        {
          name: 'SL.11-12.1 — Leading discussion',
          description: 'Initiate and promote discussion.',
          questions: [
            { prompt: 'Effective leader move?', answer: 'Invite quieter voices.', explanation: 'Equitable participation.' },
            { prompt: 'Avoid?', answer: 'Interrupting peers.', explanation: 'Undermines dialogue.' },
          ],
        },
        {
          name: 'SL.11-12.3 — Evaluating speakers',
          description: "Evaluate speaker's reasoning and rhetoric.",
          questions: [
            { prompt: 'Speaker cites no sources. Assess?', answer: 'Weak evidence.', explanation: 'Unverified.' },
            { prompt: 'Clear logic, cited studies. Assess?', answer: 'Strong.', explanation: 'Well-supported.' },
          ],
        },
        {
          name: 'SL.11-12.4 — Presenting findings',
          description: 'Present with clear structure and appropriate style.',
          questions: [
            { prompt: 'Strong presentation opening?', answer: 'Hook with question or statistic.', explanation: 'Engages.' },
            { prompt: 'Visual aids should?', answer: 'Support, not distract.', explanation: 'Clarity.' },
          ],
        },
      ],
    },
    {
      name: 'Language & Vocabulary',
      description: 'Use precise grammar, usage, and mechanics, and master college-level academic vocabulary.',
      lessons: [
        {
          name: 'L.11-12.1 — Usage and grammar',
          description: 'Apply standard English usage.',
          questions: [
            { prompt: 'Correct: "The data (is/are) persuasive."', answer: 'Either accepted; "are" for plural.', explanation: 'Usage varies.' },
            { prompt: 'Who vs whom: "(Who/Whom) shall I thank?"', answer: 'Whom.', explanation: 'Object.' },
          ],
        },
        {
          name: 'L.11-12.2 — Mechanics',
          description: 'Apply punctuation and spelling conventions.',
          questions: [
            { prompt: 'Semicolon correctly?', answer: '"We left early; the storm approached."', explanation: 'Joins related clauses.' },
            { prompt: 'Em dash purpose?', answer: 'Emphasis or interruption.', explanation: 'Stylistic.' },
          ],
        },
        {
          name: 'L.11-12.4 — Vocabulary strategies',
          description: 'Use context, roots, and references to determine meaning.',
          questions: [
            { prompt: '"His pusillanimous retreat surprised fans." Means?', answer: 'Cowardly.', explanation: 'Context plus root.' },
            { prompt: 'Root "mal-" in "malevolent"?', answer: 'Bad.', explanation: 'Latin.' },
          ],
        },
        {
          name: 'L.11-12.5 — Figurative language',
          description: 'Interpret figures, connotations, and allusions.',
          questions: [
            { prompt: 'Allusion "Herculean effort" references?', answer: 'Hercules\'s labors.', explanation: 'Mythological.' },
            { prompt: '"Achilles\' heel" means?', answer: 'Weakness.', explanation: 'Allusion.' },
          ],
        },
      ],
    },
    {
      name: 'SAT Reading & Writing',
      description: 'Prepare for the Digital SAT across Information and Ideas, Craft and Structure, Expression of Ideas, and Standard English Conventions.',
      lessons: [
        {
          name: 'Information and Ideas',
          description: 'Central idea, detail, command of evidence, inference.',
          questions: [
            { prompt: 'Best central idea from passage on coral bleaching?', answer: 'Rising temperatures harm reefs.', explanation: 'Matches passage.' },
            { prompt: 'Command of Evidence question asks?', answer: 'Best evidence supporting prior answer.', explanation: 'Evidence pair.' },
          ],
        },
        {
          name: 'Craft and Structure',
          description: 'Words in context, text structure, cross-text connections.',
          questions: [
            { prompt: '"His claim was (tenuous)." Means?', answer: 'Weak.', explanation: 'Words in context.' },
            { prompt: 'Text B responds to Text A. Relationship?', answer: 'Counterargument.', explanation: 'Cross-text.' },
          ],
        },
        {
          name: 'Expression of Ideas',
          description: 'Transitions and rhetorical synthesis.',
          questions: [
            { prompt: 'Transition signaling contrast?', answer: 'However.', explanation: 'Opposition.' },
            { prompt: 'Rhetorical synthesis goal?', answer: 'Achieve specific writing purpose from notes.', explanation: 'Task-driven.' },
          ],
        },
        {
          name: 'Standard English Conventions',
          description: 'Agreement, pronouns, punctuation.',
          questions: [
            { prompt: '"The list of names (is/are) long."', answer: 'Is.', explanation: 'Singular subject.' },
            { prompt: 'Comma before coordinating conjunction joining independent clauses?', answer: 'Required.', explanation: 'Comma rule.' },
          ],
        },
      ],
    },
    {
      name: 'Grammar Mastery',
      description: 'Review parts of speech, punctuation, syntax, conventions, and usage for college-level writing.',
      lessons: [
        {
          name: 'Parts of speech',
          description: 'Identify and use nouns, verbs, adjectives, adverbs.',
          questions: [
            { prompt: 'Identify adverb: "She ran quickly."', answer: 'Quickly.', explanation: 'Modifies verb.' },
            { prompt: 'Identify preposition: "Under the table."', answer: 'Under.', explanation: 'Shows relation.' },
          ],
        },
        {
          name: 'Punctuation',
          description: 'Apply commas, semicolons, colons, dashes.',
          questions: [
            { prompt: 'Correct semicolon?', answer: '"I studied; I passed."', explanation: 'Joins independent clauses.' },
            { prompt: 'Colon correctly?', answer: '"Bring these: pen, paper, book."', explanation: 'Introduces list.' },
          ],
        },
        {
          name: 'Syntax and sentence structure',
          description: 'Identify simple, compound, complex sentences.',
          questions: [
            { prompt: '"Because it rained, we left." Type?', answer: 'Complex.', explanation: 'Dependent plus independent.' },
            { prompt: '"I studied, and I passed." Type?', answer: 'Compound.', explanation: 'Two independent.' },
          ],
        },
        {
          name: 'Conventions and usage',
          description: 'Apply agreement, case, and commonly confused words.',
          questions: [
            { prompt: 'Affect vs effect: "The speech (affected/effected) students."', answer: 'Affected.', explanation: 'Verb = influenced.' },
            { prompt: 'Its vs it\'s: "(Its/It\'s) cold outside."', answer: "It's.", explanation: 'It is.' },
          ],
        },
      ],
    },
  ],
};
