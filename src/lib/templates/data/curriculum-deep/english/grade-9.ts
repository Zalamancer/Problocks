import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '9',
  label: 'Grade 9 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-9th-reading-vocab',
  units: [
    {
      name: 'Borders',
      description: 'Read texts about physical and cultural borders while analyzing theme and point of view.',
      lessons: [
        {
          name: 'Theme across borders',
          description: 'Trace theme in texts about division and belonging.',
          questions: [
            { prompt: 'Story ends with a family reunited across a wall. Theme?', answer: 'Love transcends borders.', explanation: 'Resolution reveals theme.' },
            { prompt: 'Essay concludes: "Lines on maps divide; stories connect." Theme?', answer: 'Narrative bridges difference.', explanation: 'Thesis-style ending.' },
          ],
        },
        {
          name: 'Point of view and perspective',
          description: 'Analyze narrator stance in cross-cultural writing.',
          questions: [
            { prompt: 'Immigrant narrator describes new city with awe. POV effect?', answer: 'Fresh perspective on familiar place.', explanation: 'Outsider view reframes.' },
            { prompt: 'Third-person limited follows border guard. Effect?', answer: 'Restricted sympathy to one side.', explanation: 'Single perspective limits.' },
          ],
        },
        {
          name: "Author's craft",
          description: 'Analyze imagery and metaphor in border narratives.',
          questions: [
            { prompt: '"The fence grew like a scar." Device and effect?', answer: 'Simile; suggests lasting wound.', explanation: 'Fence likened to scar.' },
            { prompt: '"Two languages at the dinner table" implies?', answer: 'Dual cultural identity.', explanation: 'Concrete detail signals duality.' },
          ],
        },
        {
          name: 'Tone and mood',
          description: 'Describe emotional tone across passages.',
          questions: [
            { prompt: 'Passage repeats "cold," "silent," "closed." Mood?', answer: 'Isolating.', explanation: 'Diction creates mood.' },
            { prompt: 'Reunion scene uses "warm," "laughter." Mood?', answer: 'Joyful.', explanation: 'Positive diction.' },
          ],
        },
        {
          name: 'Vocabulary in context',
          description: 'Use context to define border-related vocabulary.',
          questions: [
            { prompt: '"Diaspora" means?', answer: 'Scattered people with shared roots.', explanation: 'Term for dispersion.' },
            { prompt: '"Assimilate" means?', answer: 'Absorb into a culture.', explanation: 'To become part of.' },
          ],
        },
      ],
    },
    {
      name: 'Crossing the Line',
      description: 'Analyze arguments and narratives about ethics, choices, and consequences.',
      lessons: [
        {
          name: 'Argument structure',
          description: 'Identify claim, reasons, and evidence in argument texts.',
          questions: [
            { prompt: '"Teens should have earlier curfews." This is?', answer: 'A claim.', explanation: 'Position statement.' },
            { prompt: '"Studies show fewer accidents" supports claim by?', answer: 'Providing data.', explanation: 'Evidence.' },
          ],
        },
        {
          name: 'Rhetorical devices',
          description: 'Analyze ethos, pathos, logos in argumentative pieces.',
          questions: [
            { prompt: '"20 years as a pediatrician…" Appeal?', answer: 'Ethos.', explanation: 'Credibility.' },
            { prompt: '"Imagine losing a friend…" Appeal?', answer: 'Pathos.', explanation: 'Emotion.' },
          ],
        },
        {
          name: 'Evaluating evidence',
          description: 'Weigh strength of data, anecdote, and expert opinion.',
          questions: [
            { prompt: 'Cherry-picked stat from single study. Weakness?', answer: 'Insufficient and selective.', explanation: 'Single source.' },
            { prompt: 'Meta-analysis across 50 studies. Strength?', answer: 'Broad evidence base.', explanation: 'Many sources.' },
          ],
        },
        {
          name: 'Ethics in narrative',
          description: 'Analyze moral conflict in fiction.',
          questions: [
            { prompt: 'Character lies to protect a friend. Ethical tension?', answer: 'Loyalty vs honesty.', explanation: 'Two values clash.' },
            { prompt: 'Boss demands unethical reporting. Stakes?', answer: 'Career vs integrity.', explanation: 'Choice with consequences.' },
          ],
        },
      ],
    },
    {
      name: 'Bridging the Gap',
      description: 'Read paired texts on communication, connection, and understanding across differences.',
      lessons: [
        {
          name: 'Paired passages synthesis',
          description: 'Combine ideas from two texts on a shared theme.',
          questions: [
            { prompt: 'Text A and B both argue empathy reduces conflict. Synthesis?', answer: 'Empathy is cross-culturally effective.', explanation: 'Shared conclusion.' },
            { prompt: 'Texts differ on digital vs face-to-face. Synthesis?', answer: 'Both offer connection tradeoffs.', explanation: 'Balance perspectives.' },
          ],
        },
        {
          name: 'Tone comparison',
          description: 'Compare tones between two related passages.',
          questions: [
            { prompt: 'Text A hopeful; Text B skeptical. Effect on reader?', answer: 'Encourages weighing views.', explanation: 'Balanced tones.' },
            { prompt: 'Both texts urgent. Effect?', answer: 'Heightens sense of importance.', explanation: 'Aligned tones reinforce.' },
          ],
        },
        {
          name: "Author's purpose",
          description: 'Identify why each author wrote their text.',
          questions: [
            { prompt: 'Memoir on immigration. Purpose?', answer: 'Share experience and foster empathy.', explanation: 'Personal narrative.' },
            { prompt: 'Policy essay on language access. Purpose?', answer: 'Inform and persuade.', explanation: 'Argumentative piece.' },
          ],
        },
        {
          name: 'Inference and synthesis',
          description: 'Reach conclusions by combining evidence from both texts.',
          questions: [
            { prompt: 'Text A: "Smiles translate." Text B: "Gestures vary." Inference?', answer: 'Some cues are universal; others are not.', explanation: 'Both perspectives.' },
            { prompt: 'Inference about communication across cultures?', answer: 'Requires awareness and flexibility.', explanation: 'Combining both.' },
          ],
        },
      ],
    },
    {
      name: 'Thriving',
      description: 'Analyze how individuals and communities succeed, using evidence from fiction and nonfiction.',
      lessons: [
        {
          name: 'Character resilience',
          description: 'Analyze how characters overcome obstacles.',
          questions: [
            { prompt: 'Character rebuilds after losing home. Trait shown?', answer: 'Resilience.', explanation: 'Rebuilding after loss.' },
            { prompt: 'Teen trains daily for scholarship. Trait?', answer: 'Perseverance.', explanation: 'Sustained effort.' },
          ],
        },
        {
          name: 'Central idea in profiles',
          description: 'Find main point in success-focused nonfiction.',
          questions: [
            { prompt: 'Article profiles entrepreneur emphasizing grit. Central idea?', answer: 'Grit drives success.', explanation: 'Focus on persistence.' },
            { prompt: 'Profile of athlete stresses mentors. Central idea?', answer: 'Support systems enable thriving.', explanation: 'Mentors as key.' },
          ],
        },
        {
          name: 'Figurative language',
          description: 'Interpret metaphors about growth and success.',
          questions: [
            { prompt: '"Her roots grew deeper with each setback." Meaning?', answer: 'Adversity strengthens.', explanation: 'Roots = foundation.' },
            { prompt: '"Dreams like seeds need patience." Device?', answer: 'Simile.', explanation: 'Like comparison.' },
          ],
        },
        {
          name: 'Synthesis across texts',
          description: 'Combine evidence across profiles for common traits.',
          questions: [
            { prompt: 'Three profiles share community focus. Common trait?', answer: 'Success tied to helping others.', explanation: 'Shared pattern.' },
            { prompt: 'All three include failure stories. Implication?', answer: 'Failure is part of thriving.', explanation: 'Pattern of setback.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Informational Text',
      description: 'Cite textual evidence, analyze structure, and evaluate arguments in complex nonfiction.',
      lessons: [
        {
          name: 'Citing strong evidence',
          description: 'Pick the quote that best supports a claim.',
          questions: [
            { prompt: 'Claim: "Remote work boosts wellness." Strongest quote?', answer: '"Survey: 72% report lower stress."', explanation: 'Direct data.' },
            { prompt: 'Claim: "Bees are endangered." Strongest?', answer: '"Colony counts fell 40% since 2006."', explanation: 'Specific statistic.' },
          ],
        },
        {
          name: 'Text structure analysis',
          description: 'Recognize compare, cause-effect, and chronological patterns.',
          questions: [
            { prompt: 'Article traces climate change from 1900 to present. Structure?', answer: 'Chronological.', explanation: 'Ordered by time.' },
            { prompt: 'Text lists pros and cons of nuclear power. Structure?', answer: 'Compare-contrast.', explanation: 'Two sides weighed.' },
          ],
        },
        {
          name: 'Evaluating argument',
          description: 'Assess logic, evidence, and reasoning quality.',
          questions: [
            { prompt: 'Argument uses "everyone knows." Flaw?', answer: 'Appeal to common belief.', explanation: 'Not evidence.' },
            { prompt: 'Two well-cited studies. Strength?', answer: 'Credible support.', explanation: 'Evidence-based.' },
          ],
        },
        {
          name: 'Purpose and perspective',
          description: "Determine author's purpose and stance.",
          questions: [
            { prompt: 'Op-ed advocates paper ballots. Purpose?', answer: 'Persuade.', explanation: 'Takes position.' },
            { prompt: 'Explainer on voting methods. Purpose?', answer: 'Inform.', explanation: 'Neutral explanation.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Literature',
      description: 'Analyze theme, character, and figurative language across short stories, drama, and poetry.',
      lessons: [
        {
          name: 'Theme across genres',
          description: 'Compare themes in stories, plays, and poems.',
          questions: [
            { prompt: 'Poem and play both end with forgiveness. Theme?', answer: 'Reconciliation heals.', explanation: 'Shared resolution.' },
            { prompt: 'Three works feature sacrifice. Theme?', answer: 'Love requires sacrifice.', explanation: 'Common pattern.' },
          ],
        },
        {
          name: 'Complex characters',
          description: 'Analyze multi-faceted characters across a work.',
          questions: [
            { prompt: 'Protagonist acts kindly yet lies often. Complexity?', answer: 'Good intentions, flawed methods.', explanation: 'Contradictions add depth.' },
            { prompt: 'Villain saves a child at end. Complexity?', answer: 'Shows redemption.', explanation: 'Nuanced portrayal.' },
          ],
        },
        {
          name: 'Figurative language',
          description: 'Interpret metaphor, symbolism, and extended imagery.',
          questions: [
            { prompt: 'Poem repeats "river" as life metaphor. Effect?', answer: 'Emphasizes flow of time.', explanation: 'Recurring symbol.' },
            { prompt: 'Story uses broken clock as symbol. Meaning?', answer: 'Stopped or lost time.', explanation: 'Symbol of stasis.' },
          ],
        },
        {
          name: 'Structure and style',
          description: 'Analyze how form shapes meaning in drama and poetry.',
          questions: [
            { prompt: 'Play uses soliloquy to reveal doubt. Effect?', answer: 'Direct access to thoughts.', explanation: 'Soliloquy reveals interiority.' },
            { prompt: 'Poem breaks lines mid-phrase. Effect?', answer: 'Creates pause/tension.', explanation: 'Enjambment.' },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary',
      description: 'Acquire academic and domain-specific vocabulary through paired passages and word analysis.',
      lessons: [
        {
          name: 'Academic vocabulary',
          description: 'Learn tier-2 words used across subjects.',
          questions: [
            { prompt: '"Analyze" means?', answer: 'Examine in detail.', explanation: 'Academic verb.' },
            { prompt: '"Synthesize" means?', answer: 'Combine ideas.', explanation: 'Put together.' },
          ],
        },
        {
          name: 'Greek and Latin roots',
          description: 'Break complex words into roots.',
          questions: [
            { prompt: '"Chronology" — chron- means?', answer: 'Time.', explanation: 'Greek root.' },
            { prompt: '"Benefactor" — bene- means?', answer: 'Good.', explanation: 'Latin root.' },
          ],
        },
        {
          name: 'Shades of meaning',
          description: 'Choose precise words among close synonyms.',
          questions: [
            { prompt: 'Strongest agreement: agree, concur, align, tolerate.', answer: 'Concur.', explanation: 'Formal strong agreement.' },
            { prompt: 'Most negative: mistake, blunder, error, slip.', answer: 'Blunder.', explanation: 'Serious stupid mistake.' },
          ],
        },
        {
          name: 'Figurative vs literal',
          description: 'Distinguish figurative meanings in texts.',
          questions: [
            { prompt: '"The news hit him like a wave." Figurative?', answer: 'Yes; feelings overwhelmed him.', explanation: 'Simile.' },
            { prompt: '"Broke the ice" means?', answer: 'Eased tension.', explanation: 'Idiom.' },
          ],
        },
      ],
    },
  ],
};
