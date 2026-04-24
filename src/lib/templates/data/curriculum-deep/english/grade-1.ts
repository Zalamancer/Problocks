import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '1',
  label: 'Grade 1 English Language Arts',
  sourceUrl: 'https://www.thecorestandards.org/ELA-Literacy/',
  units: [
    {
      name: 'Reading: Literature',
      description: 'Ask and answer questions about key details, retell stories with central messages, and describe characters, settings, and events.',
      lessons: [
        {
          name: 'Key Ideas and Details',
          description: 'Ask and answer questions about key details in stories.',
          questions: [
            {
              prompt: 'Max lost his red ball at the park. He looked under the bench. He found it in the grass. Where did Max find his ball?',
              answer: 'In the grass',
              explanation: 'The passage says "He found it in the grass."',
            },
            {
              prompt: 'Lily baked muffins with Mom on Saturday. Who helped Lily bake?',
              answer: 'Mom',
              explanation: 'The sentence names Mom as the one who baked with Lily.',
            },
          ],
        },
        {
          name: 'Retelling Stories',
          description: 'Retell familiar stories, including key details and central messages.',
          questions: [
            {
              prompt: 'In "The Tortoise and the Hare," the hare runs fast but naps. The tortoise keeps going slowly and wins. What is the lesson?',
              answer: 'Slow and steady wins the race',
              explanation: 'The story teaches that steady effort beats rushing and resting.',
            },
            {
              prompt: 'A mouse helps a lion by chewing ropes. The lion had helped the mouse before. What is the message?',
              answer: 'Help others because it can come back to you',
              explanation: 'Kindness is repaid — a common fable theme.',
            },
          ],
        },
        {
          name: 'Characters, Settings, and Events',
          description: 'Describe who is in the story, where it happens, and what happens.',
          questions: [
            {
              prompt: 'Anna walked into the quiet library and sat at a round table. Where is Anna?',
              answer: 'The library',
              explanation: 'The setting is named directly: "the quiet library."',
            },
            {
              prompt: 'Ben felt sad when his kite ripped in the strong wind. How did Ben feel?',
              answer: 'Sad',
              explanation: 'The sentence states Ben "felt sad."',
            },
          ],
        },
        {
          name: 'Craft and Structure',
          description: 'Identify words that appeal to senses and tell who is telling the story.',
          questions: [
            {
              prompt: 'The soup was hot and steamy, and the kitchen smelled sweet. Which senses are used?',
              answer: 'Touch and smell',
              explanation: '"Hot" describes touch; "smelled sweet" describes smell.',
            },
            {
              prompt: '"I ran to the gate," said Tom. Who is telling this part?',
              answer: 'Tom',
              explanation: 'The word "I" and the tag "said Tom" show Tom is speaking.',
            },
          ],
        },
        {
          name: 'Integration of Knowledge',
          description: 'Use illustrations and details to describe characters and events.',
          questions: [
            {
              prompt: 'A picture shows a girl smiling and holding a trophy. What does the picture show?',
              answer: 'She won something',
              explanation: 'A trophy and a smile usually mean winning an event.',
            },
            {
              prompt: 'Two stories are about a lost dog. Both dogs find their way home. What do the stories share?',
              answer: 'The dogs return home',
              explanation: 'Both stories end with the dog coming home.',
            },
          ],
        },
      ],
    },
    {
      name: 'Reading: Informational Text',
      description: 'Identify main topics, key details, and text features in simple nonfiction passages.',
      lessons: [
        {
          name: 'Main Topic and Key Details',
          description: 'Find the main topic and two key details in a short passage.',
          questions: [
            {
              prompt: 'Bees live in hives. Bees make honey. Bees help flowers grow. What is the main topic?',
              answer: 'Bees',
              explanation: 'Every sentence tells about bees.',
            },
            {
              prompt: 'Rain falls from clouds. Rain helps plants grow. What do plants need?',
              answer: 'Rain',
              explanation: 'The passage says rain helps plants grow.',
            },
          ],
        },
        {
          name: 'Text Features',
          description: 'Use headings, captions, and labels to find facts quickly.',
          questions: [
            {
              prompt: 'A page has a heading "Frogs" and a photo of a frog with the label "eye." What does the label tell you?',
              answer: 'The part of the frog shown',
              explanation: 'Labels name parts of pictures.',
            },
            {
              prompt: 'A chapter in a book is titled "Stars." What will that chapter be about?',
              answer: 'Stars',
              explanation: 'Headings announce the chapter topic.',
            },
          ],
        },
        {
          name: 'Connections Between Ideas',
          description: 'See how two ideas in a text are connected.',
          questions: [
            {
              prompt: 'Seeds need water. Seeds need sun. What do seeds need to grow?',
              answer: 'Water and sun',
              explanation: 'Both details connect to what seeds need.',
            },
            {
              prompt: 'Dogs can bark to warn us. Dogs can help us find things. What can dogs do?',
              answer: 'Help people',
              explanation: 'Both sentences show dogs helping people.',
            },
          ],
        },
        {
          name: 'Author\'s Purpose',
          description: 'Tell why the author wrote a passage.',
          questions: [
            {
              prompt: 'A short text lists foods that grow on trees: apples, oranges, peaches. Why did the author write it?',
              answer: 'To teach about fruit that grows on trees',
              explanation: 'The author lists examples to inform the reader.',
            },
            {
              prompt: 'An author writes a silly poem about a dancing cat. Why?',
              answer: 'To make readers laugh',
              explanation: 'Silly poems entertain readers.',
            },
          ],
        },
        {
          name: 'Compare Two Texts',
          description: 'Compare two texts on the same topic.',
          questions: [
            {
              prompt: 'One book says cats nap a lot. Another book says cats play a lot. What topic do both share?',
              answer: 'Cats',
              explanation: 'Both books are about cats.',
            },
            {
              prompt: 'Two texts about rain: one describes storms, one describes soft drizzle. What do they share?',
              answer: 'Rain',
              explanation: 'Rain is the common topic.',
            },
          ],
        },
      ],
    },
    {
      name: 'Reading: Foundational Skills',
      description: 'Practice print concepts, phonological awareness, phonics, word recognition, and fluency.',
      lessons: [
        {
          name: 'Print Concepts',
          description: 'Recognize features of a sentence like capital letters and end marks.',
          questions: [
            {
              prompt: 'Which sentence begins correctly? (a) the dog ran. (b) The dog ran.',
              answer: '(b) The dog ran.',
              explanation: 'Sentences begin with a capital letter.',
            },
            {
              prompt: 'What ends the sentence "Is it raining"?',
              answer: 'A question mark',
              explanation: 'Questions end with a question mark.',
            },
          ],
        },
        {
          name: 'Phonological Awareness',
          description: 'Blend and segment sounds in one-syllable words.',
          questions: [
            {
              prompt: 'Blend the sounds /k/ /a/ /t/. What word is it?',
              answer: 'cat',
              explanation: 'Blending the three sounds makes "cat."',
            },
            {
              prompt: 'What is the first sound in "sun"?',
              answer: '/s/',
              explanation: 'The word starts with the /s/ sound.',
            },
          ],
        },
        {
          name: 'Phonics and Word Analysis',
          description: 'Decode regular one-syllable words and common spellings.',
          questions: [
            {
              prompt: 'Read the word: "ship." What is the first sound?',
              answer: '/sh/',
              explanation: '"sh" is a digraph that makes one sound.',
            },
            {
              prompt: 'What word rhymes with "cake"? (a) bake (b) book',
              answer: '(a) bake',
              explanation: 'Both end with the /ake/ sound.',
            },
          ],
        },
        {
          name: 'High-Frequency Words',
          description: 'Recognize common sight words by sight.',
          questions: [
            {
              prompt: 'Which word means "a person you know and like"? (a) the (b) friend',
              answer: '(b) friend',
              explanation: '"Friend" names a person you like.',
            },
            {
              prompt: 'Fill in: "I ___ happy today." (am / are)',
              answer: 'am',
              explanation: '"I am" is correct.',
            },
          ],
        },
        {
          name: 'Fluency',
          description: 'Read grade-level text with accuracy and expression.',
          questions: [
            {
              prompt: 'How should you read a sentence that ends with "!" ?',
              answer: 'With excitement',
              explanation: 'Exclamation marks show strong feeling.',
            },
            {
              prompt: 'If you get a word wrong, what is a good thing to do?',
              answer: 'Reread it',
              explanation: 'Good readers self-correct by rereading.',
            },
          ],
        },
      ],
    },
    {
      name: 'Writing',
      description: 'Compose short opinion pieces, informative/explanatory texts, and narratives with sequenced events.',
      lessons: [
        {
          name: 'Opinion Writing',
          description: 'State an opinion and give one reason.',
          questions: [
            {
              prompt: 'Write one reason why dogs are great pets.',
              answer: 'Sample: Dogs are fun because they play with you.',
              explanation: 'An opinion needs a clear reason.',
            },
            {
              prompt: 'Which is an opinion? (a) Pizza is the best food. (b) Pizza has cheese.',
              answer: '(a) Pizza is the best food.',
              explanation: '"Best" shows a personal feeling.',
            },
          ],
        },
        {
          name: 'Informative Writing',
          description: 'Name a topic and give some facts about it.',
          questions: [
            {
              prompt: 'Write one fact about cats.',
              answer: 'Sample: Cats have whiskers and soft fur.',
              explanation: 'A fact is true information.',
            },
            {
              prompt: 'Which fits an informative piece? (a) I love frogs! (b) Frogs live near water.',
              answer: '(b) Frogs live near water.',
              explanation: 'Fact-based writing shares information, not feelings.',
            },
          ],
        },
        {
          name: 'Narrative Writing',
          description: 'Write about two or more events in order.',
          questions: [
            {
              prompt: 'What word shows something happens later? (a) first (b) then',
              answer: '(b) then',
              explanation: '"Then" signals a next step.',
            },
            {
              prompt: 'Order these: "I ate lunch. I went to school. I came home." What is first?',
              answer: 'I went to school',
              explanation: 'Going to school usually comes before lunch and coming home.',
            },
          ],
        },
        {
          name: 'Revising with Support',
          description: 'Add details after feedback to improve a draft.',
          questions: [
            {
              prompt: 'A friend asks "What did the puppy look like?" You wrote "I got a puppy." How do you fix it?',
              answer: 'Add a detail about how it looks',
              explanation: 'Good writers add details readers want to know.',
            },
            {
              prompt: 'Revise: "We played." Add one detail.',
              answer: 'Sample: We played tag at the park.',
              explanation: 'Extra detail makes the sentence clearer.',
            },
          ],
        },
        {
          name: 'Research with a Partner',
          description: 'Gather facts from pictures and books to answer a question.',
          questions: [
            {
              prompt: 'You want to know what giraffes eat. What is a good first step?',
              answer: 'Look in a book about giraffes',
              explanation: 'Books and online sources give facts.',
            },
            {
              prompt: 'Which source is best for facts about bees? (a) a joke book (b) an animal book',
              answer: '(b) an animal book',
              explanation: 'Animal books have facts; joke books entertain.',
            },
          ],
        },
      ],
    },
    {
      name: 'Speaking & Listening',
      description: 'Follow discussion rules, ask and answer questions about read-alouds, and describe people and events.',
      lessons: [
        {
          name: 'Discussion Rules',
          description: 'Take turns and listen to others in conversation.',
          questions: [
            {
              prompt: 'What should you do before you speak in a group discussion?',
              answer: 'Raise your hand or wait your turn',
              explanation: 'Respectful speakers take turns.',
            },
            {
              prompt: 'If a classmate is talking, you should…',
              answer: 'listen carefully',
              explanation: 'Good listening is a discussion rule.',
            },
          ],
        },
        {
          name: 'Asking and Answering',
          description: 'Ask and answer questions about a read-aloud.',
          questions: [
            {
              prompt: 'Teacher reads: "The bunny hopped over the fence." Ask a "where" question.',
              answer: 'Where did the bunny hop?',
              explanation: '"Where" asks about place.',
            },
            {
              prompt: 'What word starts a question about reasons?',
              answer: 'Why',
              explanation: '"Why" asks for reasons.',
            },
          ],
        },
        {
          name: 'Describe People and Events',
          description: 'Describe a person, place, or thing with details.',
          questions: [
            {
              prompt: 'Describe a clown in one sentence.',
              answer: 'Sample: A clown wears funny clothes and makes people laugh.',
              explanation: 'Describe uses details about looks or actions.',
            },
            {
              prompt: 'Which describes better? (a) It was a dog. (b) A big brown dog barked loudly.',
              answer: '(b) A big brown dog barked loudly.',
              explanation: 'More details paint a clearer picture.',
            },
          ],
        },
        {
          name: 'Speak Clearly',
          description: 'Speak in complete sentences in class.',
          questions: [
            {
              prompt: 'Which is a complete sentence? (a) Went home. (b) We went home.',
              answer: '(b) We went home.',
              explanation: 'A sentence needs a subject and a verb.',
            },
            {
              prompt: 'How should you speak when presenting?',
              answer: 'Loudly and clearly',
              explanation: 'Clear speech helps listeners understand.',
            },
          ],
        },
        {
          name: 'Use Visuals',
          description: 'Add drawings to clarify ideas.',
          questions: [
            {
              prompt: 'You describe your pet. What visual could help?',
              answer: 'A drawing of your pet',
              explanation: 'Pictures help listeners see your idea.',
            },
            {
              prompt: 'Why add a picture to a story you tell?',
              answer: 'To make it clearer',
              explanation: 'Visuals support spoken details.',
            },
          ],
        },
      ],
    },
    {
      name: 'Language',
      description: 'Use grade-appropriate grammar, punctuation, and spelling, and determine meanings of unknown words.',
      lessons: [
        {
          name: 'Grammar: Nouns and Verbs',
          description: 'Use common, proper, and possessive nouns and matching verbs.',
          questions: [
            {
              prompt: 'Which is a proper noun? (a) girl (b) Maria',
              answer: '(b) Maria',
              explanation: 'Proper nouns name specific people and start with capitals.',
            },
            {
              prompt: 'Fill in: "The dog ___ fast." (run / runs)',
              answer: 'runs',
              explanation: 'Singular subjects use -s verbs in present.',
            },
          ],
        },
        {
          name: 'Sentences',
          description: 'Produce and expand simple and compound sentences.',
          questions: [
            {
              prompt: 'Combine: "I like apples. I like bananas." Use "and."',
              answer: 'I like apples and bananas.',
              explanation: '"And" joins two ideas into one sentence.',
            },
            {
              prompt: 'Which is a complete sentence? (a) The big cat. (b) The big cat jumped.',
              answer: '(b) The big cat jumped.',
              explanation: 'A complete sentence needs a verb.',
            },
          ],
        },
        {
          name: 'Capitalization and Punctuation',
          description: 'Capitalize names and dates, and use end punctuation.',
          questions: [
            {
              prompt: 'Fix this: "we go to school on monday."',
              answer: 'We go to school on Monday.',
              explanation: 'Days and the first word are capitalized.',
            },
            {
              prompt: 'Which end mark fits "What a great day"?',
              answer: '!',
              explanation: 'Strong feeling uses an exclamation mark.',
            },
          ],
        },
        {
          name: 'Spelling',
          description: 'Spell untaught words phonetically and use conventional spellings.',
          questions: [
            {
              prompt: 'Spell the word /b/ /a/ /g/.',
              answer: 'bag',
              explanation: 'Match sounds to letters to spell "bag."',
            },
            {
              prompt: 'Which spelling is correct? (a) hous (b) house',
              answer: '(b) house',
              explanation: '"House" uses silent "e" and "ou."',
            },
          ],
        },
        {
          name: 'Vocabulary from Context',
          description: 'Use sentence clues to figure out new words.',
          questions: [
            {
              prompt: '"The puppy was enormous — as big as a couch." What does enormous mean?',
              answer: 'Very big',
              explanation: 'The clue "as big as a couch" explains enormous.',
            },
            {
              prompt: '"The soup was piping hot, so Jo blew on it." What does piping hot mean?',
              answer: 'Very hot',
              explanation: 'Jo blew on it to cool it down.',
            },
          ],
        },
      ],
    },
  ],
};
