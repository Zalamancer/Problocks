import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '8',
  label: 'Grade 8 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-8th-reading-vocab',
  units: [
    {
      name: 'Funny Business',
      description: "Read humorous fiction and essays to analyze tone, irony, and author's craft.",
      lessons: [
        {
          name: 'Irony and humor',
          description: 'Identify verbal, situational, and dramatic irony in comic texts.',
          questions: [
            { prompt: 'Fire station burns down. Irony type?', answer: 'Situational irony.', explanation: 'Opposite of expected outcome.' },
            { prompt: '"Oh great, another flat tire," sighs the character. Irony?', answer: 'Verbal irony.', explanation: 'Says opposite of what is meant.' },
          ],
        },
        {
          name: 'Tone in humor',
          description: 'Describe comic tone: playful, sarcastic, self-deprecating.',
          questions: [
            { prompt: 'Essay mocks the author\'s own cooking. Tone?', answer: 'Self-deprecating.', explanation: 'Humor directed at self.' },
            { prompt: '"Reading homework is the pinnacle of joy." Tone?', answer: 'Sarcastic.', explanation: 'Praise that clearly means opposite.' },
          ],
        },
        {
          name: "Author's craft",
          description: 'Analyze word choice and exaggeration that create humor.',
          questions: [
            { prompt: '"I waited a thousand years at the DMV." Device?', answer: 'Hyperbole.', explanation: 'Extreme exaggeration.' },
            { prompt: 'Author names dog "Einstein" because dog is clumsy. Device?', answer: 'Irony through naming.', explanation: 'Name contradicts behavior.' },
          ],
        },
        {
          name: 'Theme in comic texts',
          description: 'Find the serious idea beneath the humor.',
          questions: [
            { prompt: 'Story jokes about forgetting names; ends noting loneliness. Theme?', answer: 'Connection matters despite flaws.', explanation: 'Humor hides genuine insight.' },
            { prompt: 'Satire mocks fashion; implies people chase approval. Theme?', answer: 'Conformity has social cost.', explanation: 'Mockery reveals truth.' },
          ],
        },
        {
          name: 'Vocabulary: tone words',
          description: 'Learn words for describing attitude in comic writing.',
          questions: [
            { prompt: '"Droll" most nearly means?', answer: 'Dryly humorous.', explanation: 'Droll = quietly funny.' },
            { prompt: '"Wry" smile suggests?', answer: 'Amused and ironic.', explanation: 'Wry conveys mild irony.' },
          ],
        },
      ],
    },
    {
      name: 'Crossing the Line',
      description: 'Examine texts about boundaries, ethics, and choices to practice argument analysis.',
      lessons: [
        {
          name: 'Identifying claims',
          description: 'Locate the central claim in argumentative passages.',
          questions: [
            { prompt: 'Op-ed title: "Phones Harm Focus in Schools." Claim?', answer: 'Phones should be limited in schools.', explanation: 'Title states the argument.' },
            { prompt: '"Self-driving cars must be regulated." Sentence type?', answer: 'Claim.', explanation: 'Statement of position.' },
          ],
        },
        {
          name: 'Reasoning and evidence',
          description: 'Evaluate how reasons connect evidence to claims.',
          questions: [
            { prompt: 'Claim: "Curfews keep teens safe." Evidence: "Crime drops 20%." Strong?', answer: 'Yes, data supports claim.', explanation: 'Statistics reinforce reasoning.' },
            { prompt: 'Claim: "Recycling helps planet." Weakest support?', answer: '"I recycle and feel good."', explanation: 'Anecdote lacks strength.' },
          ],
        },
        {
          name: 'Counterclaims',
          description: 'Recognize how writers address opposing views.',
          questions: [
            { prompt: '"Some argue phones help learning, but studies show distraction." Author\'s move?', answer: 'Acknowledges and rebuts.', explanation: 'Concedes then counters.' },
            { prompt: 'Why include a counterclaim?', answer: 'Shows fair consideration of opposition.', explanation: 'Strengthens credibility.' },
          ],
        },
        {
          name: 'Ethical reasoning',
          description: 'Analyze moral choices characters face.',
          questions: [
            { prompt: 'Character returns lost cash despite need. Ethical stance?', answer: 'Honesty over benefit.', explanation: 'Shows values-driven choice.' },
            { prompt: 'Friend asks student to share test answers. Crossing a line?', answer: 'Yes, academic dishonesty.', explanation: 'Violates ethics.' },
          ],
        },
      ],
    },
    {
      name: 'Obscuring the Truth',
      description: 'Evaluate how authors use evidence and rhetoric to shape or distort the truth.',
      lessons: [
        {
          name: 'Rhetorical devices',
          description: 'Identify logos, pathos, ethos, and loaded language.',
          questions: [
            { prompt: '"Think of the children!" Appeal?', answer: 'Pathos.', explanation: 'Emotional appeal.' },
            { prompt: '"As a scientist, I know…" Appeal?', answer: 'Ethos.', explanation: 'Appeal to credibility.' },
          ],
        },
        {
          name: 'Detecting bias',
          description: 'Spot slant through word choice and selective evidence.',
          questions: [
            { prompt: 'Headline: "Radical Plan Threatens Schools." Biased word?', answer: 'Radical.', explanation: 'Loaded negative connotation.' },
            { prompt: 'Article quotes only one side. Bias?', answer: 'One-sided reporting.', explanation: 'Lacks balance.' },
          ],
        },
        {
          name: 'Misleading evidence',
          description: 'Recognize statistics or anecdotes that distort meaning.',
          questions: [
            { prompt: '"90% prefer our brand" — based on 10 employees. Problem?', answer: 'Biased, tiny sample.', explanation: 'Selection bias.' },
            { prompt: 'Graph cut at y=95 exaggerates gap. Technique?', answer: 'Misleading scale.', explanation: 'Distorts visual.' },
          ],
        },
        {
          name: 'Evaluating sources',
          description: 'Assess credibility and purpose of a source.',
          questions: [
            { prompt: 'A vape company funds a vaping safety study. Red flag?', answer: 'Conflict of interest.', explanation: 'Funder may bias results.' },
            { prompt: 'Peer-reviewed journal article is most reliable because?', answer: 'Experts checked methods.', explanation: 'Peer review adds rigor.' },
          ],
        },
        {
          name: 'Vocabulary: rhetoric words',
          description: 'Learn terms for argumentative techniques.',
          questions: [
            { prompt: '"Propaganda" most nearly means?', answer: 'Biased persuasion.', explanation: 'Biased persuasive material.' },
            { prompt: '"Euphemism" means?', answer: 'Mild substitute for harsh term.', explanation: 'Softens reality.' },
          ],
        },
      ],
    },
    {
      name: 'To Your Health',
      description: 'Read health- and science-related nonfiction to build domain vocabulary and central-idea skills.',
      lessons: [
        {
          name: 'Central idea in science texts',
          description: 'Find main scientific claim across a passage.',
          questions: [
            { prompt: 'Article covers sleep stages and teen brains. Central idea?', answer: 'Teens need adequate sleep for development.', explanation: 'Focus ties stages to teens.' },
            { prompt: 'Text on nutrition stresses whole foods. Central idea?', answer: 'Whole foods support better health.', explanation: 'Emphasis repeats throughout.' },
          ],
        },
        {
          name: 'Cause and effect',
          description: 'Trace scientific chains in health articles.',
          questions: [
            { prompt: '"Stress raises cortisol, weakening immunity." Effect?', answer: 'Reduced immune function.', explanation: 'Follows from cortisol.' },
            { prompt: 'Dehydration causes headaches. Solution implied?', answer: 'Drink water.', explanation: 'Removes cause.' },
          ],
        },
        {
          name: 'Domain vocabulary',
          description: 'Learn science words used in health reading.',
          questions: [
            { prompt: '"Metabolism" refers to?', answer: 'Body\'s energy processing.', explanation: 'Chemical processes for energy.' },
            { prompt: '"Immunity" means?', answer: 'Resistance to disease.', explanation: 'Body\'s defense capability.' },
          ],
        },
        {
          name: 'Graphics and text features',
          description: 'Interpret charts, captions, and sidebars.',
          questions: [
            { prompt: 'Caption: "Figure 1: Sleep by Age." Purpose?', answer: 'Explains the graphic.', explanation: 'Captions clarify visuals.' },
            { prompt: 'Bar chart shows rising obesity. Purpose?', answer: 'Visualize trend.', explanation: 'Graphs show patterns.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Informational Text',
      description: 'Analyze central ideas, structure, and conflicting viewpoints across nonfiction texts.',
      lessons: [
        {
          name: 'Central ideas and summary',
          description: 'Summarize main points concisely.',
          questions: [
            { prompt: 'Article argues city parks boost wellness. 10-word summary?', answer: 'Urban parks provide physical, mental, and social health benefits.', explanation: 'Captures core claim.' },
            { prompt: 'Essay lists drawbacks of social media. Summary?', answer: 'Social media can harm sleep and self-esteem.', explanation: 'Focus on harms.' },
          ],
        },
        {
          name: 'Analyzing structure',
          description: 'Identify problem-solution, comparison, and classification patterns.',
          questions: [
            { prompt: 'Text groups energy types by renewable status. Structure?', answer: 'Classification.', explanation: 'Organized by category.' },
            { prompt: 'Essay notes pollution, then proposes filters. Structure?', answer: 'Problem-solution.', explanation: 'Issue then fix.' },
          ],
        },
        {
          name: 'Conflicting viewpoints',
          description: 'Compare opposing positions across texts.',
          questions: [
            { prompt: 'Text A favors zoos for conservation; Text B calls zoos cruel. Disagree on?', answer: 'Ethics of captivity.', explanation: 'Focus differs.' },
            { prompt: 'How to resolve conflict?', answer: 'Evaluate evidence on both.', explanation: 'Use criteria.' },
          ],
        },
        {
          name: 'Purpose and perspective',
          description: "Determine author's purpose and point of view.",
          questions: [
            { prompt: 'Op-ed calls for plastic ban. Purpose?', answer: 'Persuade.', explanation: 'Calls to action.' },
            { prompt: 'Neutral news report. Purpose?', answer: 'Inform.', explanation: 'Factual reporting.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Literature',
      description: 'Analyze dialogue, plot, and modern adaptations of traditional stories.',
      lessons: [
        {
          name: 'Dialogue and characterization',
          description: 'Analyze how dialogue reveals character.',
          questions: [
            { prompt: '"Fine, whatever," he muttered. Character trait?', answer: 'Dismissive or frustrated.', explanation: 'Diction plus muttered.' },
            { prompt: '"I will make this right." Trait?', answer: 'Determined.', explanation: 'Vow shows resolve.' },
          ],
        },
        {
          name: 'Plot complications',
          description: 'Track rising action and turning points.',
          questions: [
            { prompt: 'Mid-story twist: hero\'s ally is a spy. Role?', answer: 'Turning point.', explanation: 'Changes plot direction.' },
            { prompt: 'Final battle climax purpose?', answer: 'Peak tension.', explanation: 'Climax is highest point.' },
          ],
        },
        {
          name: 'Modern adaptations',
          description: 'Compare a classic story with its retelling.',
          questions: [
            { prompt: 'Modern Cinderella sets tale in tech startup. Change?', answer: 'Setting updates; theme persists.', explanation: 'Adaptation keeps core theme.' },
            { prompt: 'Retelling gives stepmother sympathetic past. Effect?', answer: 'Adds complexity.', explanation: 'Humanizes antagonist.' },
          ],
        },
        {
          name: 'Theme and symbolism',
          description: 'Interpret recurring objects and ideas.',
          questions: [
            { prompt: 'Story repeatedly features a locked door. Symbol of?', answer: 'Secrets or barriers.', explanation: 'Locked = hidden.' },
            { prompt: 'Character plants a tree after loss. Symbol?', answer: 'Renewal.', explanation: 'Growth after loss.' },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary',
      description: 'Determine meanings of grade-level words using context, word parts, and reference tools.',
      lessons: [
        {
          name: 'Context clues',
          description: 'Use sentence hints to decode unfamiliar words.',
          questions: [
            { prompt: '"The gregarious puppy greeted everyone." Meaning?', answer: 'Sociable.', explanation: 'Greeted everyone = friendly.' },
            { prompt: '"He was taciturn, avoiding chats." Means?', answer: 'Quiet.', explanation: 'Avoids talking.' },
          ],
        },
        {
          name: 'Word parts',
          description: 'Break words into prefix, root, suffix.',
          questions: [
            { prompt: '"Antibiotic" — anti- means?', answer: 'Against.', explanation: 'Anti- = against.' },
            { prompt: '"Transport" — trans- means?', answer: 'Across.', explanation: 'Trans- = across.' },
          ],
        },
        {
          name: 'Figurative meanings',
          description: 'Interpret idioms and figurative phrases.',
          questions: [
            { prompt: '"Bite the bullet" means?', answer: 'Face something hard.', explanation: 'Idiom for endurance.' },
            { prompt: '"Cost an arm and a leg" means?', answer: 'Very expensive.', explanation: 'Hyperbolic idiom.' },
          ],
        },
        {
          name: 'Reference tools',
          description: 'Use dictionaries and thesauruses effectively.',
          questions: [
            { prompt: 'Dictionary gives "advocate (v): to support." Best sentence?', answer: 'She advocates for cleaner parks.', explanation: 'Uses verb form.' },
            { prompt: 'Thesaurus use for varied writing?', answer: 'Find synonyms.', explanation: 'Avoid repetition.' },
          ],
        },
      ],
    },
  ],
};
