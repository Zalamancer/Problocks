import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '7',
  label: 'Grade 7 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-7th-reading-vocab',
  units: [
    {
      name: 'Living Tongues',
      description: 'Study language, dialects, and endangered languages through informational and literary texts.',
      lessons: [
        {
          name: 'Theme and central idea',
          description: 'Identify the central message conveyed across language-focused readings.',
          questions: [
            { prompt: '"A language dies every two weeks, erasing centuries of stories." Central idea?', answer: 'Language loss destroys cultural heritage.', explanation: 'The sentence links language death to loss of stories/culture.' },
            { prompt: 'A dialect article ends: "Every accent tells a story." Theme?', answer: 'Dialects carry identity and history.', explanation: 'Ending lines often state theme.' },
          ],
        },
        {
          name: 'Inference',
          description: 'Draw conclusions from details about speakers and their communities.',
          questions: [
            { prompt: '"Maya whispered the old word only her grandmother still knew." Infer about Maya.', answer: 'She values a disappearing language.', explanation: 'Whispering a rare word suggests reverence.' },
            { prompt: 'A village "held a feast each time a child spoke Ainu." Why?', answer: 'To encourage language revival.', explanation: 'Celebration rewards rare behavior.' },
          ],
        },
        {
          name: "Author's craft and word choice",
          description: 'Analyze diction, imagery, and tone in passages about language.',
          questions: [
            { prompt: 'Author calls a language "a living library." This metaphor suggests?', answer: 'Languages store collective knowledge.', explanation: 'Libraries hold information; the metaphor implies preservation.' },
            { prompt: '"Dialects bloom like wildflowers along rivers." Effect?', answer: 'Dialects feel natural and beautiful.', explanation: 'Simile connects dialects to organic growth.' },
          ],
        },
        {
          name: 'Tone and mood',
          description: 'Identify emotional atmosphere of texts about endangered languages.',
          questions: [
            { prompt: '"The last speaker smiled and was silent." Tone?', answer: 'Melancholy.', explanation: 'Contrast of smile and silence evokes quiet sadness.' },
            { prompt: 'A teacher "beamed as students chanted in Navajo." Mood?', answer: 'Hopeful.', explanation: 'Beaming conveys optimism about revival.' },
          ],
        },
        {
          name: 'Vocabulary in context',
          description: 'Determine meanings of tier-2 words using surrounding clues.',
          questions: [
            { prompt: '"Elders lamented the loss of old songs." Lamented means?', answer: 'Expressed sorrow.', explanation: 'Context links lamented to loss.' },
            { prompt: '"Linguists document vanishing tongues." Document means?', answer: 'Record carefully.', explanation: 'Scholars documenting suggests recording.' },
          ],
        },
      ],
    },
    {
      name: 'Mysteries of the Past',
      description: 'Read about historical mysteries to practice inference, evidence, and nonfiction text structures.',
      lessons: [
        {
          name: 'Citing textual evidence',
          description: 'Support claims with precise quotes from nonfiction passages.',
          questions: [
            { prompt: 'Claim: "Stonehenge required planning." Best evidence?', answer: '"Stones were hauled 150 miles using sledges."', explanation: 'Concrete detail supports planning claim.' },
            { prompt: 'Which quote proves the Mary Celeste crew "left quickly"?', answer: '"Meals sat uneaten on the table."', explanation: 'Unfinished food implies sudden departure.' },
          ],
        },
        {
          name: 'Text structure',
          description: 'Identify chronological, cause-effect, and problem-solution organization.',
          questions: [
            { prompt: 'Article walks through excavation in order of discovery. Structure?', answer: 'Chronological.', explanation: 'Events sequence over time.' },
            { prompt: 'Text lists a mystery, then proposes theories. Structure?', answer: 'Problem-solution.', explanation: 'Theories solve the mystery.' },
          ],
        },
        {
          name: 'Inference from evidence',
          description: 'Combine details to draw logical conclusions about the past.',
          questions: [
            { prompt: 'Tomb held food jars and sandals. Infer about beliefs.', answer: 'Belief in an afterlife.', explanation: 'Items accompany the dead for travel.' },
            { prompt: 'Roman letters mention rain but no harvest. Infer?', answer: 'Crops failed.', explanation: 'Missing harvest after heavy rain implies failure.' },
          ],
        },
        {
          name: 'Central idea of nonfiction',
          description: 'Determine main point across an entire informational article.',
          questions: [
            { prompt: 'Article covers Nazca Lines from multiple angles. Central idea?', answer: 'Their purpose remains debated.', explanation: 'Multiple theories point to ongoing mystery.' },
            { prompt: 'Text on Pompeii focuses on preserved homes. Central idea?', answer: 'Eruption froze daily Roman life.', explanation: 'Preserved homes reveal daily life.' },
          ],
        },
        {
          name: 'Vocabulary: roots and affixes',
          description: 'Use Greek and Latin roots to unlock unfamiliar words.',
          questions: [
            { prompt: '"Archaeology" — root arch- means?', answer: 'Ancient.', explanation: 'Archaeo- means ancient/original.' },
            { prompt: '"Inscribed on stone." Root scrib- means?', answer: 'Write.', explanation: 'Scrib/script means writing.' },
          ],
        },
      ],
    },
    {
      name: 'Trailblazing Women',
      description: "Read biographies and speeches of pioneering women while analyzing author's purpose.",
      lessons: [
        {
          name: "Author's purpose",
          description: 'Determine why an author wrote about a historical figure.',
          questions: [
            { prompt: 'Biography praises Ada Lovelace\'s foresight. Purpose?', answer: 'To honor her contribution.', explanation: 'Praise indicates celebration.' },
            { prompt: 'Speech by Sojourner Truth demands equality. Purpose?', answer: 'To persuade.', explanation: 'Demands aim to convince audiences.' },
          ],
        },
        {
          name: 'Point of view',
          description: 'Identify narrator perspective and its impact on meaning.',
          questions: [
            { prompt: '"We owe her our vote," writes a suffrage leader. POV?', answer: 'First-person plural, advocating.', explanation: '"We" signals group perspective.' },
            { prompt: 'Neutral biography of Marie Curie uses "she." POV?', answer: 'Third-person objective.', explanation: 'Third-person with neutral tone.' },
          ],
        },
        {
          name: 'Rhetorical devices',
          description: 'Recognize repetition, parallelism, and appeals in speeches.',
          questions: [
            { prompt: '"Ain\'t I a woman? Ain\'t I a woman?" Device?', answer: 'Repetition.', explanation: 'Same phrase repeated for emphasis.' },
            { prompt: '"I fought, I marched, I voted." Device?', answer: 'Parallelism.', explanation: 'Same grammatical pattern.' },
          ],
        },
        {
          name: 'Tracing an argument',
          description: 'Follow a claim through reasons and evidence in a speech or essay.',
          questions: [
            { prompt: 'Amelia Earhart argued women belong in aviation. Strongest evidence?', answer: 'She flew the Atlantic solo.', explanation: 'Personal accomplishment proves capability.' },
            { prompt: 'Author claims Malala advanced education rights. Proof?', answer: 'Her fund built 200 schools.', explanation: 'Concrete results support claim.' },
          ],
        },
        {
          name: 'Connotation and diction',
          description: 'Note shades of meaning in word choices about pioneers.',
          questions: [
            { prompt: '"Stubborn" vs "determined." Which connotation fits a biography praising Curie?', answer: 'Determined.', explanation: 'Positive synonym fits praise.' },
            { prompt: '"Audacious flight" — audacious connotes?', answer: 'Bold admiration.', explanation: 'Audacious carries positive boldness.' },
          ],
        },
      ],
    },
    {
      name: 'Uncovering Meaning',
      description: 'Apply close-reading strategies to determine theme, tone, and word choice across genres.',
      lessons: [
        {
          name: 'Theme in fiction',
          description: 'Track a unifying idea through plot and character.',
          questions: [
            { prompt: 'A boy returns a found wallet despite needing money. Theme?', answer: 'Honesty over convenience.', explanation: 'Action demonstrates moral choice.' },
            { prompt: 'Two rival sisters team up to save a dog. Theme?', answer: 'Compassion bridges differences.', explanation: 'Cooperation resolves rivalry.' },
          ],
        },
        {
          name: 'Figurative language',
          description: 'Interpret similes, metaphors, and personification.',
          questions: [
            { prompt: '"Silence pressed against the walls." Device and meaning?', answer: 'Personification; silence feels heavy.', explanation: 'Silence given human action.' },
            { prompt: '"Her laugh was sunlight." Simile or metaphor? Meaning?', answer: 'Metaphor; her laugh is warm.', explanation: 'Direct equation, no like/as.' },
          ],
        },
        {
          name: 'Tone and mood shifts',
          description: 'Notice how tone or mood changes within a passage.',
          questions: [
            { prompt: 'Opening is cheerful, ending "empty and cold." Shift?', answer: 'From joyful to desolate.', explanation: 'Diction reverses emotional charge.' },
            { prompt: 'Narrator moves from angry to reflective. Signal word?', answer: '"Later, I understood…"', explanation: 'Temporal reflection indicates shift.' },
          ],
        },
        {
          name: 'Word choice effects',
          description: 'Explain why specific words shape meaning.',
          questions: [
            { prompt: 'Why choose "stumbled" over "walked" in a scared scene?', answer: 'Shows loss of control.', explanation: 'Stumbled conveys fear and weakness.' },
            { prompt: 'Author writes "roar" not "noise." Effect?', answer: 'Heightens intensity.', explanation: 'Roar conveys power.' },
          ],
        },
        {
          name: 'Close reading synthesis',
          description: 'Combine evidence across a passage to reach a conclusion.',
          questions: [
            { prompt: 'Character trembles, sweats, then smiles. Conclude?', answer: 'Nervous but hopeful.', explanation: 'Physical details plus smile.' },
            { prompt: 'Narrator repeats "if only." Conclude about feelings?', answer: 'Regret.', explanation: '"If only" signals wishful regret.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Informational Text',
      description: 'Cite evidence, analyze structure, and evaluate arguments in complex nonfiction.',
      lessons: [
        {
          name: 'Central idea and supporting details',
          description: 'Distinguish main points from supporting evidence.',
          questions: [
            { prompt: 'Article on bees emphasizes pollination. Central idea?', answer: 'Bees are essential to food systems.', explanation: 'Pollination enables food crops.' },
            { prompt: 'Passage states: "Recycling saves energy." Supporting detail?', answer: '"Aluminum recycling uses 95% less power."', explanation: 'Statistic supports claim.' },
          ],
        },
        {
          name: 'Analyzing text structure',
          description: 'Identify compare/contrast, cause-effect, and sequential patterns.',
          questions: [
            { prompt: 'Text compares solar and wind power. Structure?', answer: 'Compare-contrast.', explanation: 'Two things weighed side by side.' },
            { prompt: 'Article explains how drought leads to migration. Structure?', answer: 'Cause-effect.', explanation: 'One event triggers another.' },
          ],
        },
        {
          name: 'Evaluating arguments',
          description: 'Judge the validity of claims, reasoning, and evidence.',
          questions: [
            { prompt: 'Claim: "Reading improves memory." Weakest evidence?', answer: '"My friend reads and has good memory."', explanation: 'Anecdote lacks rigor.' },
            { prompt: 'Claim cites a peer-reviewed study. Strength?', answer: 'Strong.', explanation: 'Research evidence is reliable.' },
          ],
        },
        {
          name: 'Integrating multiple sources',
          description: 'Synthesize information from two or more texts.',
          questions: [
            { prompt: 'Text A says electric cars cut emissions; Text B notes mining harm. Synthesis?', answer: 'EVs reduce tailpipe but create mining issues.', explanation: 'Balance both points.' },
            { prompt: 'Articles agree schools boost literacy. Synthesis focus?', answer: 'Consistent benefit of school attendance.', explanation: 'Sources corroborate.' },
          ],
        },
      ],
    },
    {
      name: 'Reading Literature',
      description: 'Analyze theme, character development, and figurative language in short stories and poems.',
      lessons: [
        {
          name: 'Character development',
          description: 'Track how a character changes across a narrative.',
          questions: [
            { prompt: 'Character starts selfish, ends sharing lunch. Change?', answer: 'Grows generous.', explanation: 'Action shift indicates growth.' },
            { prompt: 'Shy narrator speaks up in court. Development?', answer: 'Gains confidence.', explanation: 'Behavior contradicts earlier shyness.' },
          ],
        },
        {
          name: 'Plot and conflict',
          description: 'Identify conflict type and plot arc.',
          questions: [
            { prompt: 'Girl battles blizzard to reach home. Conflict?', answer: 'Person vs nature.', explanation: 'Weather is the antagonist.' },
            { prompt: 'Hero confronts own fear of failure. Conflict?', answer: 'Person vs self.', explanation: 'Internal struggle.' },
          ],
        },
        {
          name: 'Figurative language in poetry',
          description: 'Analyze similes, metaphors, and imagery in short poems.',
          questions: [
            { prompt: '"My heart is a caged bird." Device and meaning?', answer: 'Metaphor; feels trapped.', explanation: 'Heart equated with bird.' },
            { prompt: 'Imagery "salt wind on cracked lips." Sense?', answer: 'Touch and taste.', explanation: 'Multiple senses.' },
          ],
        },
        {
          name: 'Theme across genres',
          description: 'Compare themes across a short story and a poem.',
          questions: [
            { prompt: 'Story and poem both end with forgiveness. Shared theme?', answer: 'Healing through forgiveness.', explanation: 'Common outcome implies theme.' },
            { prompt: 'Both texts feature characters leaving home. Likely theme?', answer: 'Growth requires change.', explanation: 'Leaving triggers development.' },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary',
      description: 'Build tier-2 academic vocabulary using roots, affixes, and context across paired passages.',
      lessons: [
        {
          name: 'Roots and affixes',
          description: 'Break words into meaningful parts to infer meaning.',
          questions: [
            { prompt: '"Predict" — prefix pre- means?', answer: 'Before.', explanation: 'Pre- = before.' },
            { prompt: '"Biography" — root bio- means?', answer: 'Life.', explanation: 'Bio = life.' },
          ],
        },
        {
          name: 'Context clues',
          description: 'Use surrounding text to infer word meaning.',
          questions: [
            { prompt: '"The arid land had no rivers." Arid means?', answer: 'Dry.', explanation: 'No rivers implies dryness.' },
            { prompt: '"She was reticent, rarely speaking." Reticent means?', answer: 'Quiet.', explanation: 'Rarely speaking defines reticent.' },
          ],
        },
        {
          name: 'Connotation vs denotation',
          description: 'Distinguish literal meaning from emotional association.',
          questions: [
            { prompt: '"Cheap" vs "affordable" — which is negative?', answer: 'Cheap.', explanation: 'Cheap implies low quality.' },
            { prompt: '"Curious" vs "nosy." Positive word?', answer: 'Curious.', explanation: 'Curious is neutral/positive.' },
          ],
        },
        {
          name: 'Shades of meaning',
          description: 'Choose the precise word among close synonyms.',
          questions: [
            { prompt: 'Strongest: whisper, murmur, shout, say.', answer: 'Shout.', explanation: 'Shout = loudest.' },
            { prompt: 'Most sad: upset, devastated, annoyed, disappointed.', answer: 'Devastated.', explanation: 'Devastated = most intense.' },
          ],
        },
      ],
    },
  ],
};
