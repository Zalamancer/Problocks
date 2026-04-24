import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '3',
  label: 'Grade 3 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab',
  units: [
    {
      name: 'Pets',
      description: 'Build reading stamina and vocabulary through fiction and informational texts about pets.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the central point of a passage about pets.',
          questions: [
            {
              prompt: 'Dogs need walks, food, and love. Caring for a dog is a big job. What is the main idea?',
              answer: 'Owning a dog takes work',
              explanation: 'The passage lists caring tasks and calls it a big job.',
            },
            {
              prompt: 'Cats clean themselves, sleep a lot, and love cozy spots. What is the main idea?',
              answer: 'Cats have their own habits',
              explanation: 'The details all describe cat behavior.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use text clues to draw a conclusion.',
          questions: [
            {
              prompt: 'Max thumped his tail every time Leo grabbed the leash. Why?',
              answer: 'He was excited for a walk',
              explanation: 'Tail thumping plus the leash signals excitement.',
            },
            {
              prompt: 'Goldfish swim away and hide when the tank is tapped. What can you infer?',
              answer: 'Tapping scares them',
              explanation: 'Hiding is a common fear reaction.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Use context to learn new pet-related words.',
          questions: [
            {
              prompt: '"The puppy was lethargic after playing, barely moving." What does lethargic mean?',
              answer: 'Very tired',
              explanation: '"Barely moving" hints at tiredness.',
            },
            {
              prompt: '"Feed your hamster daily — consistency helps." What does consistency mean?',
              answer: 'Doing it the same way regularly',
              explanation: 'The sentence implies routine feeding.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare two pet types.',
          questions: [
            {
              prompt: 'Dogs bark; cats meow. What is different?',
              answer: 'The sounds they make',
              explanation: 'Dogs and cats communicate differently.',
            },
            {
              prompt: 'Both cats and dogs sleep a lot. What is the same?',
              answer: 'They nap often',
              explanation: 'Sleeping is a shared trait.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify the structure of a pet-care passage.',
          questions: [
            {
              prompt: 'A passage gives steps to bathe a dog: first, wet fur; then, shampoo; finally, rinse. What structure?',
              answer: 'Sequence/steps',
              explanation: 'First, then, finally signal order.',
            },
            {
              prompt: 'A passage says "Cats purr because they are content." What structure?',
              answer: 'Cause and effect',
              explanation: '"Because" signals cause and effect.',
            },
          ],
        },
      ],
    },
    {
      name: 'Homes',
      description: 'Compare homes across cultures and habitats while practicing main idea and key details.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the main idea in texts about homes.',
          questions: [
            {
              prompt: 'Igloos are made of snow. They keep out cold wind. People build them in the Arctic. What is the main idea?',
              answer: 'Igloos are homes made for cold places',
              explanation: 'Details explain how igloos fit the Arctic.',
            },
            {
              prompt: 'Stilt houses sit on poles above water to avoid floods. What is the main idea?',
              answer: 'Stilt houses protect against flooding',
              explanation: 'Poles raise the house over water.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Infer why homes differ by place.',
          questions: [
            {
              prompt: 'Desert homes have thick walls and few windows. Why?',
              answer: 'To stay cool inside',
              explanation: 'Thick walls and small windows block heat.',
            },
            {
              prompt: 'Homes in rainy places have steep roofs. Why?',
              answer: 'So rain runs off',
              explanation: 'Steep slopes drain water quickly.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Figure out home-related words from clues.',
          questions: [
            {
              prompt: '"The dwelling was small but cozy." What does dwelling mean?',
              answer: 'A place to live',
              explanation: 'Context shows dwelling = home.',
            },
            {
              prompt: '"The nomads traveled with portable tents." What does portable mean?',
              answer: 'Easy to carry',
              explanation: 'Traveling requires movable items.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare homes from different cultures.',
          questions: [
            {
              prompt: 'Igloos use snow; adobe houses use clay. What differs?',
              answer: 'The building material',
              explanation: 'Materials depend on local resources.',
            },
            {
              prompt: 'All homes shelter people. What is the same?',
              answer: 'Their purpose — shelter',
              explanation: 'Every home provides protection.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Use descriptions and headings to organize facts.',
          questions: [
            {
              prompt: 'A heading "Homes Around the World" and a map — what structure?',
              answer: 'Description by location',
              explanation: 'The map organizes homes by place.',
            },
            {
              prompt: 'A chart lists homes and their climates. What structure?',
              answer: 'Description with categories',
              explanation: 'Charts group related facts.',
            },
          ],
        },
      ],
    },
    {
      name: 'Extreme Environments',
      description: 'Read about survival in harsh places and practice inference, cause and effect, and academic vocabulary.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find what a passage about extreme places is mostly about.',
          questions: [
            {
              prompt: 'Deep-sea creatures glow to find food in the dark. What is the main idea?',
              answer: 'Glowing helps creatures survive in dark water',
              explanation: 'Glowing = adaptation for dark habitat.',
            },
            {
              prompt: 'Camels store fat in humps to survive desert heat. What is the main idea?',
              answer: 'Camels are built for deserts',
              explanation: 'Their body design fits harsh deserts.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Infer how animals adapt to extreme places.',
          questions: [
            {
              prompt: 'Polar bears have thick fur and fat. Why?',
              answer: 'To stay warm in cold places',
              explanation: 'Fur and fat insulate against cold.',
            },
            {
              prompt: 'Cactuses have spines instead of leaves. Why?',
              answer: 'To save water',
              explanation: 'Spines reduce water loss.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn survival vocabulary from clues.',
          questions: [
            {
              prompt: '"The frog is nocturnal — it is active only at night." What does nocturnal mean?',
              answer: 'Active at night',
              explanation: 'Definition given right in the sentence.',
            },
            {
              prompt: '"To hibernate, bears sleep through winter." What does hibernate mean?',
              answer: 'Sleep through winter',
              explanation: 'Context defines it.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare survival in two extreme environments.',
          questions: [
            {
              prompt: 'Polar bears live in ice; fennec foxes live in desert. What differs?',
              answer: 'Their climate',
              explanation: 'Climates shape the species.',
            },
            {
              prompt: 'Both polar bears and fennec foxes have adapted coats. What is the same?',
              answer: 'Adaptation helps each survive',
              explanation: 'Both rely on body changes to survive.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify cause-and-effect and problem-solution.',
          questions: [
            {
              prompt: 'Little food on mountains — climbers get weak. What structure?',
              answer: 'Cause and effect',
              explanation: 'Low food causes weakness.',
            },
            {
              prompt: 'People bring oxygen tanks to climb Everest. What structure?',
              answer: 'Problem and solution',
              explanation: 'Tanks solve the thin-air problem.',
            },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary Acquisition and Use',
      description: 'Learn word parts, figurative language, and shades of meaning for grade 3 words.',
      lessons: [
        {
          name: 'Prefixes and Suffixes',
          description: 'Use word parts to figure out meanings.',
          questions: [
            {
              prompt: 'What does "preheat" mean?',
              answer: 'Heat before',
              explanation: '"Pre-" means before.',
            },
            {
              prompt: 'What does "careful" mean?',
              answer: 'Full of care',
              explanation: '"-ful" means "full of."',
            },
          ],
        },
        {
          name: 'Greek and Latin Roots',
          description: 'Learn common roots like "tele" and "port."',
          questions: [
            {
              prompt: '"Tele" means "far." What does "telephone" mean?',
              answer: 'Sound from far away',
              explanation: 'Phone = sound; tele = far.',
            },
            {
              prompt: '"Port" means "carry." What does "portable" mean?',
              answer: 'Able to be carried',
              explanation: 'Port + able = carryable.',
            },
          ],
        },
        {
          name: 'Figurative Language',
          description: 'Recognize similes and metaphors.',
          questions: [
            {
              prompt: '"Her smile was as bright as the sun." What kind of phrase?',
              answer: 'Simile',
              explanation: 'Similes use "like" or "as."',
            },
            {
              prompt: '"The classroom was a zoo." What does it mean?',
              answer: 'It was loud and wild',
              explanation: 'Metaphor compares without "like."',
            },
          ],
        },
        {
          name: 'Shades of Meaning',
          description: 'Notice small differences between similar words.',
          questions: [
            {
              prompt: 'Which is stronger: angry or furious?',
              answer: 'Furious',
              explanation: '"Furious" is more intense than "angry."',
            },
            {
              prompt: 'Which is gentler: giggle or roar?',
              answer: 'Giggle',
              explanation: 'Giggles are soft; roars are loud.',
            },
          ],
        },
        {
          name: 'Reference Tools',
          description: 'Use a dictionary or glossary.',
          questions: [
            {
              prompt: 'Where do you look up a word\'s definition?',
              answer: 'A dictionary',
              explanation: 'Dictionaries list meanings.',
            },
            {
              prompt: 'A glossary in a science book has what?',
              answer: 'Definitions of key words in that book',
              explanation: 'Glossaries give book-specific terms.',
            },
          ],
        },
      ],
    },
  ],
};
