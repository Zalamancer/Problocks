import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '3',
  label: 'Grade 3 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab',
  units: [
    {
      name: 'Pets',
      lessons: [
        {
          name: 'Building knowledge',
          items: [
            { label: 'Welcome to the Pets unit!', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:building-knowledge/a/welcome-to-the-pets-unit' },
            { label: 'Pets: unit vocabulary', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:building-knowledge/a/pets-unit-vocabulary' },
          ],
        },
        {
          name: 'Close reading: informational text',
          items: [
            { label: 'Summarizing informational text', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading/v/what-is-a-summary-reading-nonfiction-khan-academy' },
            { label: 'What is a main idea? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading/v/what-is-a-main-idea-reading-khan-academy' },
            { label: 'Finding connections between ideas within a passage', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading/v/finding-connections-between-ideas-reading' },
            { label: 'Using text features to locate information | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading/v/using-text-features-to-locate-information-reading' },
            {
              label: 'Pets: reading informational text; Which Pet Is Right for You?',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading/e/pets--reading-informational-text--which-pet-is-right-for-you-3',
              question: {
                prompt: 'Read: "The crow grew thirsty. It dropped pebbles in a jug to raise the water." What does this fable teach?',
                answer: 'Cleverness solves problems',
                explanation: 'The crow uses thinking, not strength, to drink.',
              },
            },
          ],
        },
        {
          name: 'Close reading: opinions',
          items: [
            { label: 'Making inferences in informational texts', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading-opinions/v/making-inferences-in-informational-texts-reading-khan-academy' },
            { label: 'Evaluating a source\'s reasoning and evidence', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading-opinions/v/evaluating-a-sources-reasoning-and-evidence' },
            { label: 'Reading more than one source on a topic', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading-opinions/v/reading-more-than-one-source-on-a-topic-reading-khan-academy' },
            {
              label: 'Pets: reading opinions; Dogs Are the Best / Cheers for Cats',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:close-reading-opinions/e/pets--reading-opinions--dogs-are-the-best-cheers-for-cats-3',
              question: {
                prompt: 'Which is a synonym for "ancient"?',
                answer: 'Very old',
                explanation: '"Ancient" means belonging to a very long time ago.',
              },
            },
          ],
        },
        {
          name: 'Applying vocabulary knowledge',
          items: [
            { label: 'Using context clues to figure out new words', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:applying-knowledge/v/using-context-clues-to-figure-out-new-words-reading' },
            { label: 'Figurative language', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:applying-knowledge/v/figurative-language-reading' },
            {
              label: 'Pets: vocabulary; Which Pet Is Right for You?',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:applying-knowledge/e/pets--vocabulary--which-pet-is-right-for-you-3',
              question: {
                prompt: 'Read: "Maya whispered the secret so Mom would not hear." Why did Maya whisper?',
                answer: 'So Mom would not hear',
                explanation: 'The sentence gives the purpose after "so".',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: fiction',
          items: [
            { label: 'Characters\' thoughts and feelings | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding/v/characters-thoughts-and-feelings-reading' },
            { label: 'Character actions in stories | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding/v/character-actions-in-stories-reading' },
            { label: 'What do pictures bring to a story? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding/v/what-do-pictures-bring-to-a-story-reading' },
            {
              label: 'Pets: reading realistic fiction; A New Pet',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding/e/pets--reading-creative-fiction--a-new-pet-3',
              question: {
                prompt: 'A character who helps the main character is often called a ___?',
                answer: 'Friend or ally',
                explanation: 'Allies support the protagonist.',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: poetry',
          items: [
            { label: 'The elements of a poem', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding-poetry/v/the-elements-of-a-poem-reading' },
            { label: 'A story\'s point of view | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding-poetry/v/a-storys-point-of-view-reading' },
            {
              label: 'Pets: reading poetry; Dog Language',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-pets/xaf0c1b5d7010608e:reading-for-understanding-poetry/e/pets--reading-poetry--dog-language-3',
              question: {
                prompt: 'Which prefix means "not" in "unhappy"?',
                answer: 'un-',
                explanation: 'The prefix "un-" reverses meaning.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Homes',
      lessons: [
        {
          name: 'Building knowledge',
          items: [
            { label: 'Welcome to the Homes unit!', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:untitled-79/a/welcome-to-the-homes-unit' },
            { label: 'Homes: unit vocabulary', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:untitled-79/a/homes-unit-vocabulary' },
          ],
        },
        {
          name: 'Close reading: informational text',
          items: [
            { label: 'Making inferences in informational texts', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/v/making-inferences-in-informational-texts-reading-khan-academy' },
            { label: 'What is a main idea? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/v/what-is-a-main-idea-reading-khan-academy' },
            { label: 'Relationships between scientific ideas in a text', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/v/relationships-between-scientific-ideas-in-a-text-reading' },
            { label: 'Interpreting text features', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/v/interpreting-text-features-reading' },
            { label: 'Finding connections between ideas within a passage', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/v/finding-connections-between-ideas-reading' },
            {
              label: 'Homes: reading informational text; Have Home, Will Travel',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-informational-text/e/homes-reading-informational-text-have-home-will-travel-3',
              question: {
                prompt: 'Read: "Lions hunt at night. Their eyes see well in the dark." What is the main idea?',
                answer: 'Lions hunt at night using strong night vision',
                explanation: 'Both sentences support the same point.',
              },
            },
          ],
        },
        {
          name: 'Close reading: fiction',
          items: [
            { label: 'Looking back at the text for evidence', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/v/looking-back-at-the-text-for-evidence' },
            { label: 'Messages and morals | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/v/messages-and-morals-reading' },
            { label: 'Summarizing stories | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/v/summarizing-stories-reading-khan-academy' },
            { label: 'Character actions in stories | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/v/character-actions-in-stories-reading' },
            { label: 'What do pictures bring to a story? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/v/what-do-pictures-bring-to-a-story-reading' },
            {
              label: 'Homes: reading realistic fiction; A New Home',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:close-reading-fiction/e/homes-reading-realistic-fiction-a-new-home-3',
              question: {
                prompt: 'A story\'s most exciting moment is called the ___?',
                answer: 'Climax',
                explanation: 'The climax is the turning point of the plot.',
              },
            },
          ],
        },
        {
          name: 'Applying vocabulary knowledge',
          items: [
            { label: 'Using context clues to figure out new words', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:applying-vocabulary-knowledge/v/using-context-clues-to-figure-out-new-words-reading' },
            { label: 'Figurative language', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:applying-vocabulary-knowledge/v/figurative-language-reading' },
            { label: 'What are affixes? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:applying-vocabulary-knowledge/v/what-are-affixes-reading' },
            {
              label: 'Homes: vocabulary; Have Home, Will Travel',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:applying-vocabulary-knowledge/e/homes-vocabulary-have-home-will-travel-3',
              question: {
                prompt: 'Which word best fits: "She was so ___ she fell asleep at her desk."',
                answer: 'Tired',
                explanation: 'Falling asleep shows tiredness.',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: informational text',
          items: [
            { label: 'Summarizing informational text', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-informational-text/v/what-is-a-summary-reading-nonfiction-khan-academy' },
            { label: 'What language shows cause and effect? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-informational-text/v/cause-and-effect-reading' },
            {
              label: 'Homes: reading informational text; Under One Roof',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-informational-text/e/homes-reading-informational-text-under-one-roof-3',
              question: {
                prompt: 'Read: "The campfire crackled and the marshmallows turned gold." What sense words are used?',
                answer: 'Sound and sight',
                explanation: '"Crackled" is sound, "gold" is sight.',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: fiction',
          items: [
            { label: 'Making inferences in literary texts', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-fiction/v/making-inferences-in-literary-texts-reading' },
            { label: 'Understanding theme', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-fiction/v/understanding-theme-reading' },
            { label: 'The elements of a story', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-fiction/v/the-elements-of-a-story-reading' },
            { label: 'Reading (and comparing) multiple books | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-fiction/v/reading-and-comparing-multiple-books' },
            {
              label: 'Homes: reading realistic fiction; Feels Like Home',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-homes/xaf0c1b5d7010608e:reading-for-understanding-fiction/e/homes-reading-realistic-fiction-finding-a-way-home-3',
              question: {
                prompt: 'In informational text, a heading helps you ___?',
                answer: 'Find what a section is about',
                explanation: 'Headings label sections so readers locate ideas.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Extreme Environments',
      lessons: [
        {
          name: 'Building knowledge',
          items: [
            { label: 'Welcome to the Extreme Environments unit!', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-building-knowledge/a/welcome-to-the-extreme-environments-unit' },
            { label: 'Extreme Environments: unit vocabulary', type: 'article', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-building-knowledge/a/extreme-environments-unit-vocabulary' },
          ],
        },
        {
          name: 'Close reading: informational text',
          items: [
            { label: 'Summarizing informational text', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-informational/v/what-is-a-summary-reading-nonfiction-khan-academy' },
            { label: 'What language shows cause and effect? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-informational/v/cause-and-effect-reading' },
            { label: 'Interpreting text features', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-informational/v/interpreting-text-features-reading' },
            { label: 'Finding connections between ideas within a passage', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-informational/v/finding-connections-between-ideas-reading' },
            {
              label: 'Extreme Environments: reading informational text; Extreme Weather around the World',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-informational/e/extreme-environments-reading-informational-text-extreme-weather-around-the-world-3',
              question: {
                prompt: 'What does the suffix "-less" mean in "fearless"?',
                answer: 'Without',
                explanation: '"-less" means "without".',
              },
            },
          ],
        },
        {
          name: 'Close reading: fiction',
          items: [
            { label: 'Summarizing stories | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/v/summarizing-stories-reading-khan-academy' },
            { label: 'Understanding theme', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/v/understanding-theme-reading' },
            { label: 'Characters\' thoughts and feelings | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/v/characters-thoughts-and-feelings-reading' },
            { label: 'A story\'s point of view | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/v/a-storys-point-of-view-reading' },
            { label: 'Reading (and comparing) multiple books | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/v/reading-and-comparing-multiple-books' },
            {
              label: 'Extreme Environments: reading realistic fiction; The Adventures of Fisher',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-close-reading-fiction/e/extreme-environments-reading-realistic-fiction-the-adventures-of-fisher-3',
              question: {
                prompt: 'Read: "Grandpa snored loudly. Books shook on the shelf." Pick a hyperbole clue.',
                answer: 'Books shook on the shelf',
                explanation: 'It exaggerates how loud the snore is.',
              },
            },
          ],
        },
        {
          name: 'Applying vocabulary knowledge',
          items: [
            { label: 'Using context clues to figure out new words', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-vocabulary/v/using-context-clues-to-figure-out-new-words-reading' },
            { label: 'Figurative language', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-vocabulary/v/figurative-language-reading' },
            { label: 'What are affixes? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-vocabulary/v/what-are-affixes-reading' },
            {
              label: 'Extreme Environments: vocabulary; Extreme Weather around the World',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-vocabulary/e/extreme-environments-vocabulary-extreme-weather-around-the-world-3',
              question: {
                prompt: 'A made-up story with talking animals is called a ___?',
                answer: 'Fable',
                explanation: 'Fables use animals to teach lessons.',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: informational text; Antarctica',
          items: [
            { label: 'What is a main idea? | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-antarctica/v/what-is-a-main-idea-reading-khan-academy' },
            { label: 'Relationships between scientific ideas in a text', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-antarctica/v/relationships-between-scientific-ideas-in-a-text-reading' },
            {
              label: 'Extreme Environments: reading informational text; What Is Antarctica?',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-antarctica/e/extreme-environments-reading-informational-text-what-is-antarctica-3',
              question: {
                prompt: 'Read: "Lee tossed the ball. Spot ran to fetch it." What is Spot most likely?',
                answer: 'A dog',
                explanation: 'Fetching is a typical dog action.',
              },
            },
          ],
        },
        {
          name: 'Reading for understanding: informational text; The Arctic Circle',
          items: [
            { label: 'Using text features to locate information | Reading', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-arctic-circle/v/using-text-features-to-locate-information-reading' },
            { label: 'Reading more than one source on a topic', type: 'video', href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-arctic-circle/v/reading-more-than-one-source-on-a-topic-reading-khan-academy' },
            {
              label: 'Extreme Environments: reading informational text; The Arctic Circle',
              type: 'exercise',
              href: 'https://www.khanacademy.org/ela/cc-3rd-reading-vocab/xaf0c1b5d7010608e:cc-3rd-extreme-environments/xaf0c1b5d7010608e:extreme-environments-reading-for-understanding-informational-arctic-circle/e/extreme-environments-reading-informational-text-the-arctic-circle-3',
              question: {
                prompt: 'What does "context clue" mean?',
                answer: 'Words around an unknown word that hint at its meaning',
                explanation: 'Context clues help you figure out new vocabulary.',
              },
            },
          ],
        },
      ],
    },
  ],
};
