import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '4',
  label: 'Grade 4 Reading & Vocabulary',
  sourceUrl: 'https://www.khanacademy.org/ela/cc-4th-reading-vocab',
  units: [
    {
      name: 'Superheroes',
      description: 'Read stories and articles about heroes from around the world to practice character analysis and theme.',
      lessons: [
        {
          name: 'Main Idea and Theme',
          description: 'Find theme in superhero stories.',
          questions: [
            {
              prompt: 'A hero refuses reward and says helping others is the real reward. What is the theme?',
              answer: 'Helping others is its own reward',
              explanation: 'The hero\'s words state the theme directly.',
            },
            {
              prompt: 'A young hero doubts herself, then learns to trust her courage. What is the theme?',
              answer: 'Believing in yourself matters',
              explanation: 'Growth into self-trust is the theme.',
            },
          ],
        },
        {
          name: 'Inference and Character',
          description: 'Use clues to describe how heroes think and feel.',
          questions: [
            {
              prompt: 'Ana trembled, but stepped forward to face the villain. What can you infer?',
              answer: 'She was scared but brave',
              explanation: 'Trembling = fear; stepping forward = courage.',
            },
            {
              prompt: 'Kai gave his last bread to a stranger and smiled. What does this show?',
              answer: 'He is generous',
              explanation: 'Giving food shows generosity.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Use passage clues to learn new words.',
          questions: [
            {
              prompt: '"The villain was menacing — everyone in town feared him." What does menacing mean?',
              answer: 'Threatening',
              explanation: '"Feared" hints at threat.',
            },
            {
              prompt: '"She was a formidable fighter — no one dared challenge her." What does formidable mean?',
              answer: 'Powerful or hard to beat',
              explanation: 'Nobody challenges strong opponents.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare heroes from different cultures.',
          questions: [
            {
              prompt: 'A Greek hero fights monsters; a Japanese hero uses wisdom. What differs?',
              answer: 'How they solve problems',
              explanation: 'Each culture values different strengths.',
            },
            {
              prompt: 'Both heroes protect their villages. What is the same?',
              answer: 'They care about their community',
              explanation: 'Protection is a shared motive.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify narrative structure in hero stories.',
          questions: [
            {
              prompt: 'A story: hero learns a skill, faces villain, wins. What structure?',
              answer: 'Problem and solution',
              explanation: 'Face-then-solve is problem/solution.',
            },
            {
              prompt: 'Tales listing heroes one by one across cultures — what structure?',
              answer: 'Description/categorical',
              explanation: 'The author describes many examples.',
            },
          ],
        },
      ],
    },
    {
      name: 'Growth Mindset',
      description: 'Read biographies and brain-science articles while building vocabulary around learning and resilience.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the main idea in growth-mindset articles.',
          questions: [
            {
              prompt: 'The brain makes new connections when we struggle with a new skill. What is the main idea?',
              answer: 'Practice grows the brain',
              explanation: 'Struggle leads to new connections.',
            },
            {
              prompt: 'Michael Jordan was cut from his school team, then practiced daily. What is the main idea?',
              answer: 'Effort leads to success',
              explanation: 'His story shows growth through practice.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use story clues to see a growth mindset.',
          questions: [
            {
              prompt: 'Sara failed the quiz but asked her teacher to explain her mistakes. What kind of mindset?',
              answer: 'Growth mindset',
              explanation: 'Learning from mistakes shows growth.',
            },
            {
              prompt: 'Tom said "I\'ll never be good at math" and gave up. What mindset?',
              answer: 'Fixed mindset',
              explanation: 'Giving up shows fixed thinking.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn learning-related words from context.',
          questions: [
            {
              prompt: '"Her perseverance — never giving up — paid off." What does perseverance mean?',
              answer: 'Not giving up',
              explanation: 'The sentence defines it.',
            },
            {
              prompt: '"The brain is malleable, meaning it changes with effort." What does malleable mean?',
              answer: 'Able to change',
              explanation: 'The sentence gives the meaning.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare fixed and growth mindsets.',
          questions: [
            {
              prompt: 'Growth: try harder. Fixed: give up. What differs?',
              answer: 'Response to challenge',
              explanation: 'Each mindset reacts to challenge differently.',
            },
            {
              prompt: 'Both mindsets appear in students. What is the same?',
              answer: 'Everyone can have either at times',
              explanation: 'Mindsets are universal and flexible.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Use cause and effect in brain articles.',
          questions: [
            {
              prompt: '"When you practice, your brain forms new paths." What structure?',
              answer: 'Cause and effect',
              explanation: 'Practice causes growth.',
            },
            {
              prompt: '"Students who quit miss learning." What structure?',
              answer: 'Cause and effect',
              explanation: 'Quitting causes missed learning.',
            },
          ],
        },
      ],
    },
    {
      name: 'Journeys West',
      description: 'Explore Westward Expansion through informational and fictional texts about people, places, and events.',
      lessons: [
        {
          name: 'Main Idea',
          description: 'Find the main idea in historical passages.',
          questions: [
            {
              prompt: 'Pioneers traveled in wagons for months through dangerous land. What is the main idea?',
              answer: 'The journey west was long and hard',
              explanation: 'Months + danger = difficulty.',
            },
            {
              prompt: 'The Pony Express delivered mail quickly across the West. What is the main idea?',
              answer: 'The Pony Express sped mail delivery',
              explanation: '"Quickly" and "delivered mail" explain purpose.',
            },
          ],
        },
        {
          name: 'Inference',
          description: 'Use clues to understand pioneer life.',
          questions: [
            {
              prompt: 'Wagons had limited room, and families chose only a few items. What can you infer?',
              answer: 'Choices were hard',
              explanation: 'Limited space forces tough decisions.',
            },
            {
              prompt: 'Settlers stored dried meat and grain. Why?',
              answer: 'To keep food from spoiling',
              explanation: 'Drying preserves food for long trips.',
            },
          ],
        },
        {
          name: 'Vocabulary in Context',
          description: 'Learn period words from context.',
          questions: [
            {
              prompt: '"The frontier was the far edge of settled land." What does frontier mean?',
              answer: 'The far edge of settled land',
              explanation: 'The sentence defines frontier.',
            },
            {
              prompt: '"Pioneers were treacherous trails." (corrected: "faced treacherous trails" — dangerous ones.) What does treacherous mean?',
              answer: 'Dangerous',
              explanation: 'Treacherous trails pose risk.',
            },
          ],
        },
        {
          name: 'Compare & Contrast',
          description: 'Compare Native American and settler perspectives.',
          questions: [
            {
              prompt: 'Settlers wanted new land; Native peoples already lived there. What differs?',
              answer: 'Views on the land',
              explanation: 'Groups saw ownership differently.',
            },
            {
              prompt: 'Both groups depended on the land. What is the same?',
              answer: 'They both needed it to live',
              explanation: 'Each group used the land for survival.',
            },
          ],
        },
        {
          name: 'Text Structure',
          description: 'Identify sequence in historical events.',
          questions: [
            {
              prompt: 'A timeline: 1803 Louisiana Purchase, 1849 Gold Rush. What structure?',
              answer: 'Chronological/sequence',
              explanation: 'Dates show order of events.',
            },
            {
              prompt: '"First they saved money, then bought supplies, finally headed west." Structure?',
              answer: 'Sequence',
              explanation: 'Signal words show order.',
            },
          ],
        },
      ],
    },
    {
      name: 'Vocabulary Acquisition and Use',
      description: 'Determine word meanings using context, affixes, Greek and Latin roots, and reference tools.',
      lessons: [
        {
          name: 'Context Clues',
          description: 'Use surrounding sentences to decode words.',
          questions: [
            {
              prompt: '"The trek was arduous — exhausting and long." What does arduous mean?',
              answer: 'Very hard',
              explanation: 'The definition follows the dash.',
            },
            {
              prompt: '"She was indignant, angry at the unfair ruling." What does indignant mean?',
              answer: 'Angry at unfairness',
              explanation: '"Angry at the unfair ruling" defines it.',
            },
          ],
        },
        {
          name: 'Affixes',
          description: 'Use prefixes and suffixes to learn meanings.',
          questions: [
            {
              prompt: 'What does "misread" mean?',
              answer: 'Read wrong',
              explanation: '"Mis-" means wrong.',
            },
            {
              prompt: 'What does "careless" mean?',
              answer: 'Without care',
              explanation: '"-less" means without.',
            },
          ],
        },
        {
          name: 'Roots',
          description: 'Use Greek and Latin roots.',
          questions: [
            {
              prompt: '"Graph" means "write." What does "autograph" mean?',
              answer: 'Writing of one\'s own name',
              explanation: 'Auto = self; graph = write.',
            },
            {
              prompt: '"Aqua" means water. What does "aquarium" mean?',
              answer: 'A place for water animals',
              explanation: 'Aqua = water.',
            },
          ],
        },
        {
          name: 'Figurative Language',
          description: 'Interpret idioms and figures of speech.',
          questions: [
            {
              prompt: '"It\'s raining cats and dogs." What does this mean?',
              answer: 'Raining heavily',
              explanation: 'A common idiom for heavy rain.',
            },
            {
              prompt: '"Her words were a knife." What does this metaphor mean?',
              answer: 'Her words hurt',
              explanation: 'Metaphor compares words to something sharp.',
            },
          ],
        },
        {
          name: 'Reference Tools',
          description: 'Use dictionaries and thesauruses.',
          questions: [
            {
              prompt: 'Which tool helps find a synonym?',
              answer: 'Thesaurus',
              explanation: 'A thesaurus lists similar words.',
            },
            {
              prompt: 'You need the part of speech of "quick." What tool?',
              answer: 'Dictionary',
              explanation: 'Dictionaries show parts of speech.',
            },
          ],
        },
      ],
    },
  ],
};
