import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '2',
  label: 'Grade 2 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-2nd-reading-vocab',
  units: [
    {
      name: 'Fairy Tales Retold',
      description: 'Read and compare classic fairy tales and modern retellings to build vocabulary and story analysis skills.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find what a fairy tale is mostly about.',
          questions: [
            {
              prompt: 'Cinderella is kind even when her stepsisters are mean. She ends up happy. What is the main idea?',
              answer: 'Kindness is rewarded',
              explanation: 'The tale centers on Cinderella\'s kindness leading to happiness.',
            },
            {
              prompt: 'A modern "Three Little Pigs" shows the pigs building strong houses together. What is the main idea?',
              answer: 'Teamwork keeps you safe',
              explanation: 'The pigs cooperate instead of working alone.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use clues to figure out what the author does not say directly.',
          questions: [
            {
              prompt: 'The wolf grinned and hid behind a tree near Grandma\'s house. What will he probably do?',
              answer: 'Try to trick someone',
              explanation: 'Grinning and hiding are clues of sneaky plans.',
            },
            {
              prompt: 'The giant sniffed loudly and looked around the room. How does he feel?',
              answer: 'He thinks someone is hiding',
              explanation: 'Sniffing and looking around suggest suspicion.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Use story clues to figure out new words.',
          questions: [
            {
              prompt: '"The prince was valiant — he faced the dragon with no fear." What does valiant mean?',
              answer: 'Brave',
              explanation: 'Facing a dragon with no fear shows bravery.',
            },
            {
              prompt: '"The old witch cackled, a raspy laugh that made birds fly away." What does cackled mean?',
              answer: 'Laughed in a harsh way',
              explanation: 'The clue is "raspy laugh."',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare the classic tale with a retelling.',
          questions: [
            {
              prompt: 'Classic: the wolf is mean. Retelling: the wolf just wants friends. What is different?',
              answer: 'The wolf\'s goal',
              explanation: 'The retelling changes the wolf\'s motive.',
            },
            {
              prompt: 'In both versions of "Little Red," Red visits Grandma. What is the same?',
              answer: 'The visit to Grandma',
              explanation: 'Core plot remains across versions.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Recognize the beginning, middle, and end of a story.',
          questions: [
            {
              prompt: '"Once upon a time…" usually begins what part of a story?',
              answer: 'The beginning',
              explanation: '"Once upon a time" opens fairy tales.',
            },
            {
              prompt: '"They lived happily ever after." Which part is this?',
              answer: 'The end',
              explanation: 'This phrase closes fairy tales.',
            },
          ],
        },
      ],
    },
    {
      name: 'The Moon',
      description: 'Read informational texts about the Moon while practicing key details and nonfiction vocabulary.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the central point of a nonfiction passage.',
          questions: [
            {
              prompt: 'The Moon has no air. Astronauts wear suits to breathe on the Moon. What is the main idea?',
              answer: 'People need special suits on the Moon',
              explanation: 'Because there is no air, astronauts need suits.',
            },
            {
              prompt: 'The Moon moves around Earth every 27 days. What is the passage about?',
              answer: 'How the Moon orbits Earth',
              explanation: 'The passage gives a key fact about orbit.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use facts to make a smart guess.',
          questions: [
            {
              prompt: 'There is no wind on the Moon. Footprints stay for years. Why?',
              answer: 'Nothing blows them away',
              explanation: 'Without wind, marks are not erased.',
            },
            {
              prompt: 'The Moon has craters. What likely caused them?',
              answer: 'Space rocks crashing into it',
              explanation: 'Impacts form craters on rocky bodies.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn science words through clues.',
          questions: [
            {
              prompt: '"The Moon has many craters, which are bowl-shaped holes." What does crater mean?',
              answer: 'A bowl-shaped hole',
              explanation: 'The definition follows the word.',
            },
            {
              prompt: '"The Moon orbits Earth, or travels around it." What does orbit mean?',
              answer: 'Travel around',
              explanation: 'The sentence defines orbit.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare the Moon with Earth.',
          questions: [
            {
              prompt: 'Earth has air; the Moon does not. What is the difference?',
              answer: 'Earth has air and the Moon does not',
              explanation: 'The key difference is presence of air.',
            },
            {
              prompt: 'Both Earth and the Moon are round. What is the same?',
              answer: 'Their shape',
              explanation: 'Both are spheres.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Use headings and captions to find information.',
          questions: [
            {
              prompt: 'A section heading says "Moon Phases." What will it explain?',
              answer: 'How the Moon looks different over time',
              explanation: 'Phases describe changes in appearance.',
            },
            {
              prompt: 'A caption says "Astronaut on the Moon, 1969." What is being shown?',
              answer: 'An astronaut standing on the Moon',
              explanation: 'Captions name the photo content.',
            },
          ],
        },
      ],
    },
    {
      name: 'Rural, Suburban, Urban',
      description: 'Compare life in different kinds of communities through paired fiction and nonfiction passages.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Identify what a passage about community is mostly about.',
          questions: [
            {
              prompt: 'Rural towns have big farms and few people. What is the main idea?',
              answer: 'Rural life has open space and fewer people',
              explanation: 'Farms and few people describe rural.',
            },
            {
              prompt: 'Cities have tall buildings and busy streets. What is the main idea?',
              answer: 'Cities are busy and crowded',
              explanation: '"Tall buildings" and "busy streets" describe cities.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use details to figure out where a story happens.',
          questions: [
            {
              prompt: 'Mia hears roosters crow and sees a tractor nearby. Where is she?',
              answer: 'A rural area',
              explanation: 'Roosters and tractors are rural clues.',
            },
            {
              prompt: 'Sam rides a subway to a tall school. Where does he live?',
              answer: 'A city',
              explanation: 'Subways and tall schools suggest urban life.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Use sentence clues to learn community words.',
          questions: [
            {
              prompt: '"A suburb is a place between city and country." What is a suburb?',
              answer: 'A place between city and country',
              explanation: 'The definition appears in the sentence.',
            },
            {
              prompt: '"The rural road had no traffic — just cows." What does rural mean?',
              answer: 'Country-like',
              explanation: 'Cows and no traffic show rural setting.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare rural, suburban, and urban life.',
          questions: [
            {
              prompt: 'Cities have subways; farms have tractors. What is the difference?',
              answer: 'How people travel and work',
              explanation: 'Transportation and work tools differ.',
            },
            {
              prompt: 'All three communities have schools. What is the same?',
              answer: 'Schools',
              explanation: 'Schools exist in every community.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Read a compare-and-contrast passage.',
          questions: [
            {
              prompt: 'A passage has headings "Rural," "Suburban," "Urban." What structure is used?',
              answer: 'Compare and contrast',
              explanation: 'Multiple sections show comparisons.',
            },
            {
              prompt: 'Words like "however" and "both" signal what?',
              answer: 'Comparison',
              explanation: 'These signal compare/contrast.',
            },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary Acquisition and Use',
      description: 'Use context clues, prefixes, suffixes, and roots to learn new grade-level words.',
      lessons: [
        {
          name: 'Context Clues',
          description: 'Use the sentence to figure out a word\'s meaning.',
          questions: [
            {
              prompt: '"The hike was grueling, and we all felt worn out." What does grueling mean?',
              answer: 'Very tiring',
              explanation: '"Worn out" hints the hike was tiring.',
            },
            {
              prompt: '"The dog was timid — he hid behind a chair when guests came." What does timid mean?',
              answer: 'Shy',
              explanation: 'Hiding shows shyness.',
            },
          ],
        },
        {
          name: 'Prefixes',
          description: 'Add "un-" and "re-" to change meaning.',
          questions: [
            {
              prompt: 'What does "unhappy" mean?',
              answer: 'Not happy',
              explanation: '"Un-" means "not."',
            },
            {
              prompt: 'What does "redo" mean?',
              answer: 'Do again',
              explanation: '"Re-" means "again."',
            },
          ],
        },
        {
          name: 'Suffixes',
          description: 'Add "-ful" and "-less" to change meaning.',
          questions: [
            {
              prompt: 'What does "helpful" mean?',
              answer: 'Full of help',
              explanation: '"-ful" means "full of."',
            },
            {
              prompt: 'What does "hopeless" mean?',
              answer: 'Without hope',
              explanation: '"-less" means "without."',
            },
          ],
        },
        {
          name: 'Synonyms and Antonyms',
          description: 'Find words with similar or opposite meanings.',
          questions: [
            {
              prompt: 'Which is a synonym for "big"? (a) large (b) small',
              answer: '(a) large',
              explanation: 'Synonyms mean the same.',
            },
            {
              prompt: 'What is an antonym for "happy"?',
              answer: 'Sad',
              explanation: 'Antonyms mean the opposite.',
            },
          ],
        },
        {
          name: 'Shades of Meaning',
          description: 'Notice small differences between similar words.',
          questions: [
            {
              prompt: 'Which is stronger: warm or hot?',
              answer: 'Hot',
              explanation: 'Hot is a stronger form of warm.',
            },
            {
              prompt: 'Which is softer: shout or whisper?',
              answer: 'Whisper',
              explanation: 'Whispers are quiet.',
            },
          ],
        },
      ],
    },
    {
      name: 'Reading: Foundational Skills',
      description: 'Strengthen phonics, decoding, and fluency through short connected texts.',
      lessons: [
        {
          name: 'Vowel Teams',
          description: 'Decode words with vowel teams like ai, ea, oa.',
          questions: [
            {
              prompt: 'Read the word: "train." What vowel team is in it?',
              answer: 'ai',
              explanation: '"ai" makes the long /a/ sound.',
            },
            {
              prompt: 'What sound does "oa" make in "boat"?',
              answer: 'Long /o/',
              explanation: '"oa" often sounds like long O.',
            },
          ],
        },
        {
          name: 'R-controlled Vowels',
          description: 'Decode words with ar, er, ir, or, ur.',
          questions: [
            {
              prompt: 'Read: "star." What vowel sound is in it?',
              answer: '/ar/',
              explanation: '"ar" makes a special r-controlled sound.',
            },
            {
              prompt: 'Which word has /er/? (a) her (b) hat',
              answer: '(a) her',
              explanation: '"Her" uses the r-controlled vowel.',
            },
          ],
        },
        {
          name: 'Two-Syllable Words',
          description: 'Break longer words into syllables.',
          questions: [
            {
              prompt: 'How many syllables in "rabbit"?',
              answer: '2',
              explanation: '"rab-bit" has two parts.',
            },
            {
              prompt: 'Clap the word "basket." How many claps?',
              answer: '2',
              explanation: '"bas-ket" has two syllables.',
            },
          ],
        },
        {
          name: 'Irregular Words',
          description: 'Read common words that don\'t follow rules.',
          questions: [
            {
              prompt: 'Read: "said." Do you pronounce the letters as you\'d expect?',
              answer: 'No',
              explanation: '"Said" sounds like "sed."',
            },
            {
              prompt: 'Which word is a sight word? (a) was (b) cat',
              answer: '(a) was',
              explanation: '"Was" is irregular and memorized.',
            },
          ],
        },
        {
          name: 'Fluency',
          description: 'Read with appropriate rate and expression.',
          questions: [
            {
              prompt: 'What should you do at a comma?',
              answer: 'Pause briefly',
              explanation: 'Commas signal a short pause.',
            },
            {
              prompt: 'How should a question sound at the end?',
              answer: 'Voice goes up',
              explanation: 'Rising tone signals questions.',
            },
          ],
        },
      ],
    },
  ],
};
