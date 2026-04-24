import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '5',
  label: 'Grade 5 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-5th-reading-vocab',
  units: [
    {
      name: 'Imaginative Worlds',
      description: 'Analyze fantasy and science fiction passages to practice theme, point of view, and figurative language.',
      lessons: [
        {
          name: 'Main Idea and Theme',
          description: 'Find theme in fantasy and sci-fi texts.',
          questions: [
            {
              prompt: 'In a story, travelers cross a magical bridge only if they trust each other. What is the theme?',
              answer: 'Trust builds bridges',
              explanation: 'The magic requires trust to pass.',
            },
            {
              prompt: 'A lonely robot learns to feel by helping humans. What is the theme?',
              answer: 'Connection changes us',
              explanation: 'The robot grows through relationships.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use clues to uncover unstated ideas.',
          questions: [
            {
              prompt: 'Mira hid the glowing stone beneath her cloak when the stranger arrived. Why?',
              answer: 'She did not trust him',
              explanation: 'Hiding signals caution.',
            },
            {
              prompt: 'The spaceship\'s lights flickered, and alarms wailed. What can you infer?',
              answer: 'Something is wrong',
              explanation: 'Flickering + alarms signal danger.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Decode imaginative vocabulary from context.',
          questions: [
            {
              prompt: '"The forest was ominous, its shadows hiding unknown dangers." What does ominous mean?',
              answer: 'Threatening',
              explanation: '"Unknown dangers" hint at threat.',
            },
            {
              prompt: '"The alien spoke in an incomprehensible tongue — no one understood." What does incomprehensible mean?',
              answer: 'Impossible to understand',
              explanation: '"No one understood" defines it.',
            },
          ],
        },
        {
          name: 'Point of View',
          description: 'Identify whose perspective tells the story.',
          questions: [
            {
              prompt: '"I stepped onto the strange planet." What point of view?',
              answer: 'First person',
              explanation: '"I" signals first person.',
            },
            {
              prompt: '"She wondered if the spell would work." What point of view?',
              answer: 'Third person',
              explanation: '"She" signals third person.',
            },
          ],
        },
        {
          name: 'Figurative Language',
          description: 'Recognize metaphors and personification.',
          questions: [
            {
              prompt: '"The wind whispered secrets." What is this?',
              answer: 'Personification',
              explanation: 'Wind is given human actions.',
            },
            {
              prompt: '"Her courage was a shield." What is this?',
              answer: 'Metaphor',
              explanation: 'Direct comparison without "like."',
            },
          ],
        },
      ],
    },
    {
      name: 'Inventing Progress',
      description: 'Read about inventors and their impact while building vocabulary around innovation and cause-effect.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the central idea in biographies.',
          questions: [
            {
              prompt: 'Thomas Edison failed thousands of times before inventing the light bulb. What is the main idea?',
              answer: 'Persistence led to invention',
              explanation: 'His failures led to success.',
            },
            {
              prompt: 'Marie Curie studied radioactivity despite barriers for women in science. What is the main idea?',
              answer: 'Determination overcame obstacles',
              explanation: 'She pushed past limits.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Infer inventor motivations and results.',
          questions: [
            {
              prompt: 'Alexander Graham Bell built a device so his deaf mother could communicate. What can you infer?',
              answer: 'He cared about helping others',
              explanation: 'Helping his mother shows care.',
            },
            {
              prompt: 'After the telephone, people could talk across the country. What can you infer?',
              answer: 'Communication became faster',
              explanation: 'Distance shrank with telephones.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn innovation words.',
          questions: [
            {
              prompt: '"The invention was revolutionary — it changed everything." What does revolutionary mean?',
              answer: 'Greatly changing',
              explanation: '"Changed everything" defines it.',
            },
            {
              prompt: '"She collaborated with engineers — working together." What does collaborated mean?',
              answer: 'Worked together',
              explanation: 'The definition is given.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare two inventors.',
          questions: [
            {
              prompt: 'Edison worked alone; Tesla worked in teams. What differs?',
              answer: 'Their work style',
              explanation: 'Solo versus team approach.',
            },
            {
              prompt: 'Both created electrical inventions. What is the same?',
              answer: 'Their field — electricity',
              explanation: 'Both advanced electricity.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify cause and effect.',
          questions: [
            {
              prompt: '"Because of the cotton gin, cotton production soared." What structure?',
              answer: 'Cause and effect',
              explanation: '"Because" signals cause/effect.',
            },
            {
              prompt: '"Air travel led to global business growth." What structure?',
              answer: 'Cause and effect',
              explanation: '"Led to" signals cause/effect.',
            },
          ],
        },
      ],
    },
    {
      name: 'Athletes in Action',
      description: 'Study biographies and informational texts about athletes to practice summarizing and evidence.',
      lessons: [
        {
          name: 'Summarizing',
          description: 'Summarize an athlete biography.',
          questions: [
            {
              prompt: 'Serena Williams won dozens of titles after years of daily practice. Summarize.',
              answer: 'Williams\' hard work led to many wins',
              explanation: 'A summary captures the main point briefly.',
            },
            {
              prompt: 'Jesse Owens won 4 gold medals in 1936. Summarize.',
              answer: 'Owens earned 4 Olympic golds in 1936',
              explanation: 'Key fact stated concisely.',
            },
          ],
        },
        {
          name: 'Text Evidence',
          description: 'Support claims with quotes or details.',
          questions: [
            {
              prompt: '"Usain Bolt ran the 100m in 9.58 seconds." What evidence shows his speed?',
              answer: 'The 9.58-second time',
              explanation: 'A specific time is evidence.',
            },
            {
              prompt: 'A passage says Simone Biles has more medals than any other gymnast. What claim is supported?',
              answer: 'She is among the greatest gymnasts',
              explanation: 'Medal count supports the claim.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn sports vocabulary.',
          questions: [
            {
              prompt: '"Her endurance allowed her to run for hours." What does endurance mean?',
              answer: 'Ability to keep going',
              explanation: 'Running for hours shows endurance.',
            },
            {
              prompt: '"He was unrivaled — no one could beat him." What does unrivaled mean?',
              answer: 'Having no equal',
              explanation: '"No one could beat him" defines it.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare two athletes.',
          questions: [
            {
              prompt: 'One runs marathons; one sprints. What differs?',
              answer: 'Race distance',
              explanation: 'Marathons are long; sprints are short.',
            },
            {
              prompt: 'Both train daily. What is the same?',
              answer: 'Both commit to daily practice',
              explanation: 'Practice is shared.',
            },
          ],
        },
        {
          name: 'Author\'s Purpose',
          description: 'Identify why the author wrote the text.',
          questions: [
            {
              prompt: 'A biography celebrating an athlete\'s achievements. Why written?',
              answer: 'To inspire readers',
              explanation: 'Celebrating achievements inspires.',
            },
            {
              prompt: 'An article lists stats about NBA teams. Why written?',
              answer: 'To inform',
              explanation: 'Stats inform.',
            },
          ],
        },
      ],
    },
    {
      name: 'Life on the Edge',
      description: 'Read narratives and nonfiction about extreme environments to build inference and domain vocabulary.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find main ideas in survival texts.',
          questions: [
            {
              prompt: 'Mountain climbers use oxygen tanks because air is thin. What is the main idea?',
              answer: 'High altitudes need extra oxygen',
              explanation: 'Thin air causes this need.',
            },
            {
              prompt: 'Antarctic researchers live in insulated stations. What is the main idea?',
              answer: 'Cold climates require special homes',
              explanation: 'Insulation fights extreme cold.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Infer challenges of extreme environments.',
          questions: [
            {
              prompt: 'Divers shiver as they surface from deep water. What can you infer?',
              answer: 'Deep water is cold',
              explanation: 'Shivering signals cold.',
            },
            {
              prompt: 'The team carries triple the normal food on the ice trek. Why?',
              answer: 'They will burn more energy',
              explanation: 'Cold and effort burn calories.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn survival-related words.',
          questions: [
            {
              prompt: '"The summit was perilous — one wrong step could be fatal." What does perilous mean?',
              answer: 'Dangerous',
              explanation: '"Fatal step" hints at danger.',
            },
            {
              prompt: '"They had to acclimate to the altitude over days." What does acclimate mean?',
              answer: 'Adjust to',
              explanation: 'Adjusting slowly = acclimating.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare two extreme places.',
          questions: [
            {
              prompt: 'Deserts are hot and dry; tundras are cold and dry. What differs?',
              answer: 'Temperature',
              explanation: 'Both are dry, but temperature varies.',
            },
            {
              prompt: 'Both have sparse plants. What is the same?',
              answer: 'Limited plant life',
              explanation: 'Harshness limits plants.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify problem-and-solution structure.',
          questions: [
            {
              prompt: '"Thin air (problem) — climbers bring oxygen (solution)." What structure?',
              answer: 'Problem and solution',
              explanation: 'Explicit problem + fix.',
            },
            {
              prompt: '"To protect from sun, researchers wear UV suits." What structure?',
              answer: 'Problem and solution',
              explanation: 'Suits solve UV problem.',
            },
          ],
        },
      ],
    },
    {
      name: 'The Stories We Tell',
      description: 'Compare how cultures share stories and traditions across fiction and nonfiction texts.',
      lessons: [
        {
          name: 'Main Idea and Theme',
          description: 'Find the main idea in cultural stories.',
          questions: [
            {
              prompt: 'Many cultures tell trickster tales to teach kids wisdom. What is the main idea?',
              answer: 'Tricksters teach lessons',
              explanation: 'Stories with tricksters carry morals.',
            },
            {
              prompt: 'A family passes down a grandmother\'s recipe for generations. What theme?',
              answer: 'Traditions connect families',
              explanation: 'Shared recipes bond generations.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Infer cultural meanings from stories.',
          questions: [
            {
              prompt: 'An elder tells a story only during full moons. What can you infer?',
              answer: 'The story has cultural significance',
              explanation: 'Timing shows special value.',
            },
            {
              prompt: 'A character shares bread with a poor stranger and is rewarded. What value?',
              answer: 'Kindness is valued',
              explanation: 'Rewarding kindness teaches a lesson.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn culture-related words.',
          questions: [
            {
              prompt: '"The oral tradition — stories told aloud for ages — kept history alive." What does oral mean?',
              answer: 'Spoken, not written',
              explanation: '"Told aloud" defines it.',
            },
            {
              prompt: '"The custom was ancestral — passed down by ancestors." What does ancestral mean?',
              answer: 'From ancestors',
              explanation: 'The definition is in the sentence.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare stories from different cultures.',
          questions: [
            {
              prompt: 'One culture tells flood stories with heroes; another with gods. What differs?',
              answer: 'Who saves the day',
              explanation: 'The role players vary.',
            },
            {
              prompt: 'Both flood tales explain how life restarted. What is the same?',
              answer: 'Theme of renewal',
              explanation: 'Rebirth is shared.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify description and sequence in stories.',
          questions: [
            {
              prompt: 'A legend gives a hero\'s journey from birth to old age. What structure?',
              answer: 'Chronological',
              explanation: 'Tracking life events shows sequence.',
            },
            {
              prompt: 'A passage describes festival foods. What structure?',
              answer: 'Description',
              explanation: 'Listing features is description.',
            },
          ],
        },
      ],
    },
  ],
};
