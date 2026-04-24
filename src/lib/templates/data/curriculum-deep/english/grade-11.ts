import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '11',
  label: 'Grade 11 English Language Arts',
  sourceUrl: 'https://www.thecorestandards.org/ELA-Literacy/RL/11-12/',
  units: [
    {
      name: 'Reading: Literature',
      description: 'Cite strong textual evidence, analyze theme, and evaluate how authors draw on source material.',
      lessons: [
        {
          name: 'RL.11-12.1 — Strong textual evidence',
          description: 'Cite evidence supporting explicit and inferential analysis.',
          questions: [
            { prompt: 'In Gatsby, strongest evidence for Gatsby\'s longing?', answer: '"He stretched out his arms toward the green light."', explanation: 'Action embodies yearning.' },
            { prompt: 'Evidence supporting inference character is guilty?', answer: 'Narrator says "my hands trembled, stained."', explanation: 'Physical detail reveals guilt.' },
          ],
        },
        {
          name: 'RL.11-12.2 — Theme and objective summary',
          description: 'Determine two or more themes and summarize objectively.',
          questions: [
            { prompt: 'Beloved weaves memory and trauma. Two themes?', answer: 'Haunting past; communal healing.', explanation: 'Multiple themes interact.' },
            { prompt: 'Objective summary means?', answer: 'Without opinion or evaluation.', explanation: 'Neutral restatement.' },
          ],
        },
        {
          name: 'RL.11-12.3 — Author\'s choices on plot/character',
          description: 'Analyze how structural and character choices shape meaning.',
          questions: [
            { prompt: 'Why might a novel delay revealing narrator\'s identity?', answer: 'To build suspense.', explanation: 'Structural suspense.' },
            { prompt: 'Killing a main character early does?', answer: 'Raises stakes for remaining.', explanation: 'Shifts tension.' },
          ],
        },
        {
          name: 'RL.11-12.4 — Word choice and figurative meaning',
          description: 'Analyze figurative and connotative meaning.',
          questions: [
            { prompt: '"Her voice was full of money" (Gatsby). Meaning?', answer: 'Wealth and status.', explanation: 'Synesthesia metaphor.' },
            { prompt: 'Why choose "shroud" not "cover"?', answer: 'Connotes death.', explanation: 'Darker connotation.' },
          ],
        },
        {
          name: 'RL.11-12.9 — Source material analysis',
          description: 'Analyze how authors draw on foundational texts.',
          questions: [
            { prompt: 'Beloved draws from slave narratives. Why?', answer: 'Grounds fiction in history.', explanation: 'Source authenticates.' },
            { prompt: 'Hamilton musical adapts founding-era texts. Effect?', answer: 'Reframes history for new audience.', explanation: 'Adaptation updates.' },
          ],
        },
      ],
    },
    {
      name: 'Reading: Informational Text',
      description: 'Analyze seminal US documents and evaluate reasoning, rhetoric, and evidence.',
      lessons: [
        {
          name: 'RI.11-12.1 — Strong textual evidence',
          description: 'Cite evidence from founding documents and essays.',
          questions: [
            { prompt: 'Strongest evidence Jefferson valued equality in Declaration?', answer: '"All men are created equal."', explanation: 'Direct statement.' },
            { prompt: 'Evidence Lincoln linked war to union?', answer: '"A house divided against itself cannot stand."', explanation: 'Thesis line.' },
          ],
        },
        {
          name: 'RI.11-12.2 — Central ideas over complex text',
          description: 'Identify two central ideas that interact.',
          questions: [
            { prompt: 'Federalist 10 central ideas?', answer: 'Factions; republic remedies.', explanation: 'Madison\'s focus.' },
            { prompt: 'Letter from Birmingham Jail central ideas?', answer: 'Unjust laws; moral urgency.', explanation: 'King\'s focus.' },
          ],
        },
        {
          name: 'RI.11-12.4 — Figurative, connotative, technical',
          description: 'Analyze word meanings in complex nonfiction.',
          questions: [
            { prompt: 'Lincoln: "new birth of freedom." Meaning?', answer: 'Renewed national ideal.', explanation: 'Metaphor.' },
            { prompt: 'Technical term "habeas corpus" in constitutional essay?', answer: 'Right against unlawful detention.', explanation: 'Legal term.' },
          ],
        },
        {
          name: 'RI.11-12.6 — Point of view and rhetoric',
          description: 'Determine POV and purpose in seminal texts.',
          questions: [
            { prompt: 'MLK writes as imprisoned activist. POV effect?', answer: 'Adds moral authority.', explanation: 'Personal stake.' },
            { prompt: 'Rhetorical question purpose?', answer: 'Engage reader.', explanation: 'Forces reflection.' },
          ],
        },
        {
          name: 'RI.11-12.8 — Reasoning and evidence',
          description: 'Evaluate premises, purposes, and rhetoric of seminal documents.',
          questions: [
            { prompt: 'MLK\'s letter uses theology and history. Effect?', answer: 'Layered ethos.', explanation: 'Multi-source credibility.' },
            { prompt: 'Federalist 10\'s logical argument against faction strength?', answer: 'Republic size reduces faction power.', explanation: 'Logical reasoning.' },
          ],
        },
      ],
    },
    {
      name: 'Writing: Arguments',
      description: 'Write arguments with valid reasoning, relevant evidence, and effective counterclaims.',
      lessons: [
        {
          name: 'W.11-12.1a — Precise claims',
          description: 'Introduce precise, knowledgeable claims.',
          questions: [
            { prompt: 'Strongest claim? "Things should change." "Colleges should adopt test-optional admissions."', answer: 'Second — specific and arguable.', explanation: 'Precision matters.' },
            { prompt: 'Revise "Social media is bad."', answer: '"Social media harms teen sleep."', explanation: 'Add specificity.' },
          ],
        },
        {
          name: 'W.11-12.1b — Developing reasons and evidence',
          description: 'Develop claim using relevant evidence.',
          questions: [
            { prompt: 'Which evidence better supports teen sleep claim?', answer: 'Study showing screen-time link.', explanation: 'Research beats anecdote.' },
            { prompt: 'Best evidence for minimum-wage increase claim?', answer: 'Economic data from multiple cities.', explanation: 'Broad data.' },
          ],
        },
        {
          name: 'W.11-12.1c — Cohesion and transitions',
          description: 'Use transitions to link claims and evidence.',
          questions: [
            { prompt: 'Good transition between counter and rebuttal?', answer: '"However, the data suggest…"', explanation: 'Signals pivot.' },
            { prompt: 'Transition adding evidence?', answer: '"Furthermore, …"', explanation: 'Additive.' },
          ],
        },
        {
          name: 'W.11-12.1e — Formal style',
          description: 'Maintain formal tone.',
          questions: [
            { prompt: 'Revise "Kids are super chill about homework." formally.', answer: 'Students report indifference about homework.', explanation: 'Remove slang.' },
            { prompt: 'Formal version of "a lot of"?', answer: 'Many or numerous.', explanation: 'Academic diction.' },
          ],
        },
        {
          name: 'W.11-12.1f — Concluding statement',
          description: 'Write conclusions that support the argument.',
          questions: [
            { prompt: 'Best conclusion for essay on ranked-choice voting?', answer: 'Synthesize benefits and call for adoption.', explanation: 'Restates and acts.' },
            { prompt: 'Avoid conclusion that?', answer: 'Introduces unrelated idea.', explanation: 'Stays on topic.' },
          ],
        },
      ],
    },
    {
      name: 'Writing: Informative/Explanatory',
      description: 'Convey complex ideas clearly with well-organized evidence, analysis, and transitions.',
      lessons: [
        {
          name: 'W.11-12.2a — Introduction and organization',
          description: 'Introduce topic clearly and organize ideas.',
          questions: [
            { prompt: 'Best introduction for essay on genome editing?', answer: 'Defines topic and previews aspects.', explanation: 'Clear scope.' },
            { prompt: 'Organization by subtopic creates?', answer: 'Logical clarity.', explanation: 'Structured exposition.' },
          ],
        },
        {
          name: 'W.11-12.2b — Developing with facts',
          description: 'Develop topic with well-chosen facts and examples.',
          questions: [
            { prompt: 'Best fact for essay on urbanization?', answer: 'UN statistic on city growth.', explanation: 'Authoritative data.' },
            { prompt: 'Weak example?', answer: '"My cousin moved to a city."', explanation: 'Anecdote.' },
          ],
        },
        {
          name: 'W.11-12.2c — Transitions and cohesion',
          description: 'Use transitions to clarify relationships.',
          questions: [
            { prompt: 'Transition for contrast?', answer: '"In contrast, …"', explanation: 'Signals opposition.' },
            { prompt: 'Cause-effect transition?', answer: '"As a result, …"', explanation: 'Signals effect.' },
          ],
        },
        {
          name: 'W.11-12.2d — Precise language',
          description: 'Use precise words and domain-specific vocabulary.',
          questions: [
            { prompt: 'Replace "gets bigger" in science writing.', answer: 'Expands or increases.', explanation: 'Precise verbs.' },
            { prompt: 'Domain term for heart doctor?', answer: 'Cardiologist.', explanation: 'Specific term.' },
          ],
        },
      ],
    },
    {
      name: 'Writing: Narrative',
      description: 'Develop real or imagined experiences using technique, detail, and structured sequences.',
      lessons: [
        {
          name: 'W.11-12.3a — Situation and POV',
          description: 'Engage reader with situation and narrator.',
          questions: [
            { prompt: 'Strong opening for narrative?', answer: 'Action that raises a question.', explanation: 'Hooks reader.' },
            { prompt: 'First-person POV benefit?', answer: 'Intimacy with narrator.', explanation: 'Direct access.' },
          ],
        },
        {
          name: 'W.11-12.3b — Narrative techniques',
          description: 'Use dialogue, pacing, and description.',
          questions: [
            { prompt: 'Best use of dialogue?', answer: 'Reveal character conflict.', explanation: 'Purposeful exchanges.' },
            { prompt: 'Pacing slows during?', answer: 'Emotional climaxes.', explanation: 'Lingers on impact.' },
          ],
        },
        {
          name: 'W.11-12.3c — Sequence and transitions',
          description: 'Create a sequence with clear transitions.',
          questions: [
            { prompt: 'Transition for flashback?', answer: '"Years earlier, …"', explanation: 'Signals time shift.' },
            { prompt: 'Transition to next scene?', answer: '"By morning, …"', explanation: 'Moves forward.' },
          ],
        },
        {
          name: 'W.11-12.3d — Precise details',
          description: 'Use sensory detail and precise words.',
          questions: [
            { prompt: 'Replace "It was cold."', answer: '"Frost etched the windows."', explanation: 'Specific sensory.' },
            { prompt: 'Specific sensory detail for fear?', answer: 'Ears ringing; heart pounding.', explanation: 'Physical detail.' },
          ],
        },
      ],
    },
    {
      name: 'Speaking & Listening',
      description: 'Initiate and participate in collaborative discussions and present findings with evidence.',
      lessons: [
        {
          name: 'SL.11-12.1 — Collaborative discussion',
          description: 'Participate effectively in discussions.',
          questions: [
            { prompt: 'Best behavior in Socratic seminar?', answer: 'Cite text and invite others.', explanation: 'Collaborative norms.' },
            { prompt: 'Avoid what in discussion?', answer: 'Dominating airtime.', explanation: 'Equal participation.' },
          ],
        },
        {
          name: 'SL.11-12.3 — Evaluate speaker',
          description: "Evaluate speaker's reasoning and evidence.",
          questions: [
            { prompt: 'Speaker cites unverified stat. Action?', answer: 'Ask for source.', explanation: 'Verify.' },
            { prompt: 'Speaker uses clear logic and data. Evaluate?', answer: 'Reasoning is sound.', explanation: 'Well-supported.' },
          ],
        },
        {
          name: 'SL.11-12.4 — Presenting findings',
          description: 'Present information clearly and concisely.',
          questions: [
            { prompt: 'Best visual aid for trend data?', answer: 'Line graph.', explanation: 'Shows change over time.' },
            { prompt: 'Avoid which in presentation?', answer: 'Reading slides verbatim.', explanation: 'Engage audience.' },
          ],
        },
      ],
    },
    {
      name: 'Language & Vocabulary',
      description: 'Apply grammar and usage, and acquire college-ready academic and domain-specific vocabulary.',
      lessons: [
        {
          name: 'L.11-12.1 — Standard English grammar',
          description: 'Apply grammar and usage rules.',
          questions: [
            { prompt: 'Correct: "Neither the coach nor the players (is/are) ready."', answer: 'Are.', explanation: 'Proximity rule.' },
            { prompt: 'Who vs whom: "(Who/Whom) did you call?"', answer: 'Whom.', explanation: 'Object pronoun.' },
          ],
        },
        {
          name: 'L.11-12.2 — Mechanics',
          description: 'Apply capitalization, punctuation, and spelling.',
          questions: [
            { prompt: 'Correct semicolon use?', answer: '"We left; the storm came."', explanation: 'Joins related clauses.' },
            { prompt: 'Colon use?', answer: 'Before a list.', explanation: 'Introduces.' },
          ],
        },
        {
          name: 'L.11-12.4 — Vocabulary strategies',
          description: 'Use context, affixes, and references to infer meaning.',
          questions: [
            { prompt: '"His ubiquitous phone dominated meetings." Means?', answer: 'Everywhere present.', explanation: 'Context.' },
            { prompt: 'Root "ambi-" in "ambivalent"?', answer: 'Both.', explanation: 'Both sides.' },
          ],
        },
        {
          name: 'L.11-12.5 — Figurative language',
          description: 'Interpret figurative and connotative meanings.',
          questions: [
            { prompt: '"The economy is a house of cards." Device?', answer: 'Metaphor.', explanation: 'Fragile comparison.' },
            { prompt: 'Connotation of "youthful" vs "childish"?', answer: 'Positive vs negative.', explanation: 'Shading differs.' },
          ],
        },
      ],
    },
    {
      name: 'SAT Reading & Writing Prep',
      description: 'Practice Information and Ideas, Craft and Structure, Expression of Ideas, and Standard English Conventions.',
      lessons: [
        {
          name: 'Information and Ideas',
          description: 'Central idea, detail, inference, evidence.',
          questions: [
            { prompt: 'Best central idea: passage on urban bees. "Bees adapt to cities" or "Bees die in cities"?', answer: 'Bees adapt to cities.', explanation: 'Matches evidence.' },
            { prompt: 'Best textual evidence sentence is the one that?', answer: 'Directly supports the answer to the prior question.', explanation: 'Command of Evidence.' },
          ],
        },
        {
          name: 'Craft and Structure',
          description: 'Words in context, text structure, cross-text connections.',
          questions: [
            { prompt: '"The committee\'s resolve was (ambiguous)." Means?', answer: 'Unclear.', explanation: 'Words in context.' },
            { prompt: 'Texts A/B discuss same study. Likely relationship?', answer: 'Agreement or dispute over data.', explanation: 'Cross-text.' },
          ],
        },
        {
          name: 'Expression of Ideas',
          description: 'Transitions, rhetorical synthesis.',
          questions: [
            { prompt: 'Transition linking cause to effect?', answer: 'Consequently.', explanation: 'Signals result.' },
            { prompt: 'Rhetorical synthesis prompt asks to?', answer: 'Combine notes to achieve a goal.', explanation: 'Synthesize bullets.' },
          ],
        },
        {
          name: 'Standard English Conventions',
          description: 'Subject-verb, pronouns, punctuation.',
          questions: [
            { prompt: '"Each of the students (have/has) a laptop."', answer: 'Has.', explanation: 'Singular subject.' },
            { prompt: 'Correct: "The book, which won awards, (is/are) popular."', answer: 'Is.', explanation: 'Singular subject.' },
          ],
        },
      ],
    },
  ],
};
