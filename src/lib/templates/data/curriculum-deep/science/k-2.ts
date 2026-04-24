import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: 'K-2',
  label: 'Elementary K-2 Science',
  sourceUrl: 'https://www.nextgenscience.org/sites/default/files/K-2Topic.pdf',
  units: [
    {
      name: 'Forces and Interactions: Pushes and Pulls',
      description: 'Students explore how pushes and pulls change the motion and direction of everyday objects.',
      lessons: [
        {
          name: 'What Is a Push or a Pull?',
          description: 'Pushes and pulls are simple forces that move things.',
          questions: [
            {
              prompt: 'True or false: Opening a drawer is a pull.',
              answer: 'True',
              explanation: 'You bring the drawer toward you, which is a pull.',
            },
            {
              prompt: 'Which is a push: kicking a ball or pulling a wagon?',
              answer: 'Kicking a ball',
              explanation: 'Your foot pushes the ball away from you.',
            },
          ],
        },
        {
          name: 'Strength of a Force',
          description: 'A bigger push or pull moves things farther or faster.',
          questions: [
            {
              prompt: 'True or false: A harder push makes a toy car go farther.',
              answer: 'True',
              explanation: 'More force adds more motion.',
            },
            {
              prompt: 'Which throw sends the ball farther: a gentle one or a strong one?',
              answer: 'A strong one',
              explanation: 'Stronger force gives the ball more speed.',
            },
          ],
        },
        {
          name: 'Changing Direction',
          description: 'Forces can change the direction an object is moving.',
          questions: [
            {
              prompt: 'True or false: A push can change which way a ball rolls.',
              answer: 'True',
              explanation: 'A side push sends the ball in a new direction.',
            },
            {
              prompt: 'If a soccer ball is rolling right and you kick it up, which way does it go?',
              answer: 'Up',
              explanation: 'The new force changes the ball direction.',
            },
          ],
        },
        {
          name: 'Objects Colliding',
          description: 'When objects bump, they push on each other and change motion.',
          questions: [
            {
              prompt: 'True or false: Bumper cars push on each other when they hit.',
              answer: 'True',
              explanation: 'Each car pushes the other, making both move.',
            },
            {
              prompt: 'What happens when a bowling ball hits pins?',
              answer: 'The pins fall over',
              explanation: 'The ball pushes the pins and moves them.',
            },
          ],
        },
        {
          name: 'Solving a Motion Problem',
          description: 'We can use pushes and pulls to move things we want.',
          questions: [
            {
              prompt: 'True or false: A ramp can help a ball roll down on its own.',
              answer: 'True',
              explanation: 'Gravity pulls the ball down the slope.',
            },
            {
              prompt: 'To get a stuck wagon up a hill, do you push or pull it?',
              answer: 'Either push or pull',
              explanation: 'Both can add force to move the wagon.',
            },
          ],
        },
      ],
    },
    {
      name: 'Interdependent Relationships in Ecosystems',
      description: 'Learners study how animals, plants, and their environments depend on each other to survive.',
      lessons: [
        {
          name: 'What Plants Need',
          description: 'Plants need sunlight, water, and air to grow.',
          questions: [
            {
              prompt: 'True or false: A plant in a dark closet will grow strong.',
              answer: 'False',
              explanation: 'Plants need sunlight to make food.',
            },
            {
              prompt: 'Name one thing every plant needs.',
              answer: 'Water (or sunlight or air)',
              explanation: 'All three are needed for healthy plant growth.',
            },
          ],
        },
        {
          name: 'What Animals Need',
          description: 'Animals need food, water, air, and shelter to live.',
          questions: [
            {
              prompt: 'True or false: Animals can live without water.',
              answer: 'False',
              explanation: 'All animals need water to survive.',
            },
            {
              prompt: 'Where do birds get their food?',
              answer: 'From plants or other animals',
              explanation: 'Birds eat seeds, fruit, or small creatures.',
            },
          ],
        },
        {
          name: 'How Plants and Animals Help Each Other',
          description: 'Animals spread seeds and pollen for plants.',
          questions: [
            {
              prompt: 'True or false: Bees help flowers by carrying pollen.',
              answer: 'True',
              explanation: 'Pollen moves from flower to flower as bees visit.',
            },
            {
              prompt: 'What happens when a squirrel buries an acorn and forgets it?',
              answer: 'A new oak tree can grow',
              explanation: 'The buried seed sprouts into a tree.',
            },
          ],
        },
        {
          name: 'Habitats',
          description: 'A habitat is the place where an animal or plant lives.',
          questions: [
            {
              prompt: 'True or false: A fish can live happily on dry land.',
              answer: 'False',
              explanation: 'Fish need water to breathe through gills.',
            },
            {
              prompt: 'Name one habitat where trees grow.',
              answer: 'Forest',
              explanation: 'Forests have soil, rain, and sun for trees.',
            },
          ],
        },
        {
          name: 'Comparing Habitats',
          description: 'Different habitats have different plants and animals.',
          questions: [
            {
              prompt: 'True or false: A desert has lots of rain.',
              answer: 'False',
              explanation: 'Deserts are dry with little rainfall.',
            },
            {
              prompt: 'Would you find a polar bear in the jungle or the Arctic?',
              answer: 'Arctic',
              explanation: 'Polar bears need cold, icy places.',
            },
          ],
        },
      ],
    },
    {
      name: 'Weather and Climate',
      description: 'Students observe daily weather patterns and identify typical conditions across seasons.',
      lessons: [
        {
          name: 'Kinds of Weather',
          description: 'Weather can be sunny, rainy, windy, snowy, or cloudy.',
          questions: [
            {
              prompt: 'True or false: Snow falls when it is very warm outside.',
              answer: 'False',
              explanation: 'Snow forms when air is cold.',
            },
            {
              prompt: 'What kind of weather brings rain from the sky?',
              answer: 'Rainy or stormy weather',
              explanation: 'Rain falls from clouds full of water.',
            },
          ],
        },
        {
          name: 'The Four Seasons',
          description: 'Spring, summer, fall, and winter each have their own weather.',
          questions: [
            {
              prompt: 'True or false: Leaves often fall from trees in autumn.',
              answer: 'True',
              explanation: 'Many trees lose leaves in the fall season.',
            },
            {
              prompt: 'Which season is usually the hottest?',
              answer: 'Summer',
              explanation: 'Summer has the warmest days of the year.',
            },
          ],
        },
        {
          name: 'Measuring Weather',
          description: 'Thermometers measure temperature and rain gauges measure rainfall.',
          questions: [
            {
              prompt: 'True or false: A thermometer tells us how hot or cold it is.',
              answer: 'True',
              explanation: 'Thermometers measure temperature.',
            },
            {
              prompt: 'What tool tells us how much rain fell?',
              answer: 'A rain gauge',
              explanation: 'Rain gauges collect and measure rainfall.',
            },
          ],
        },
        {
          name: 'Severe Weather',
          description: 'Some weather is dangerous, like thunderstorms and hurricanes.',
          questions: [
            {
              prompt: 'True or false: You should go outside during a thunderstorm.',
              answer: 'False',
              explanation: 'Thunderstorms have lightning, which is dangerous.',
            },
            {
              prompt: 'Name one kind of severe weather.',
              answer: 'Hurricane, tornado, or blizzard',
              explanation: 'All of these can damage homes or hurt people.',
            },
          ],
        },
        {
          name: 'Climate: Weather Over Time',
          description: 'Climate is the usual weather of a place over many years.',
          questions: [
            {
              prompt: 'True or false: A rainforest has a dry climate.',
              answer: 'False',
              explanation: 'Rainforests get lots of rain every year.',
            },
            {
              prompt: 'Is the Arctic climate hot or cold?',
              answer: 'Cold',
              explanation: 'The Arctic stays cold for most of the year.',
            },
          ],
        },
      ],
    },
    {
      name: 'Structure and Properties of Matter',
      description: 'Kids classify materials by observable properties like color, texture, hardness, and flexibility.',
      lessons: [
        {
          name: 'Observing Properties',
          description: 'Materials have colors, shapes, and textures we can see and feel.',
          questions: [
            {
              prompt: 'True or false: Sandpaper feels smooth.',
              answer: 'False',
              explanation: 'Sandpaper is rough and scratchy.',
            },
            {
              prompt: 'Name a property of a cotton ball.',
              answer: 'Soft (or white, or fluffy)',
              explanation: 'Cotton balls are light and soft to touch.',
            },
          ],
        },
        {
          name: 'Sorting Materials',
          description: 'We can group objects by shared properties.',
          questions: [
            {
              prompt: 'True or false: A rock and a sponge are both soft.',
              answer: 'False',
              explanation: 'Rocks are hard while sponges are soft.',
            },
            {
              prompt: 'What property would you use to sort metal coins from paper bills?',
              answer: 'Hardness or material',
              explanation: 'Coins are hard metal, bills are flexible paper.',
            },
          ],
        },
        {
          name: 'Flexible or Stiff?',
          description: 'Some things bend easily and others are stiff.',
          questions: [
            {
              prompt: 'True or false: A rubber band is flexible.',
              answer: 'True',
              explanation: 'Rubber bands bend and stretch easily.',
            },
            {
              prompt: 'Which is stiff: a stick or a piece of yarn?',
              answer: 'A stick',
              explanation: 'Sticks stay straight, while yarn flops.',
            },
          ],
        },
        {
          name: 'Building with Small Pieces',
          description: 'Big things can be built from many small pieces.',
          questions: [
            {
              prompt: 'True or false: A brick wall is made of many bricks.',
              answer: 'True',
              explanation: 'Each brick is a small piece of the wall.',
            },
            {
              prompt: 'Name something built from many small pieces.',
              answer: 'A LEGO model (or wall, or puzzle)',
              explanation: 'Many small blocks combine to make a bigger thing.',
            },
          ],
        },
        {
          name: 'Changes by Heating and Cooling',
          description: 'Heat can melt things and cold can freeze them.',
          questions: [
            {
              prompt: 'True or false: Water freezes when it gets cold enough.',
              answer: 'True',
              explanation: 'Cold turns liquid water into solid ice.',
            },
            {
              prompt: 'What happens to butter when you heat it in a pan?',
              answer: 'It melts',
              explanation: 'Heat turns solid butter into liquid.',
            },
          ],
        },
      ],
    },
    {
      name: "Earth's Systems: Land, Water, and Living Things",
      description: "Learners map where water, plants, and animals are found across Earth's surface.",
      lessons: [
        {
          name: 'Land and Water on Earth',
          description: 'Earth has land areas and water areas we can see on maps.',
          questions: [
            {
              prompt: 'True or false: Most of Earth is covered in water.',
              answer: 'True',
              explanation: 'Oceans cover more than half of Earth.',
            },
            {
              prompt: 'Name a large body of water.',
              answer: 'Ocean (or lake, or river)',
              explanation: 'These are all big collections of water.',
            },
          ],
        },
        {
          name: 'Where Living Things Live',
          description: 'Plants and animals live in specific places on Earth.',
          questions: [
            {
              prompt: 'True or false: Fish live in water.',
              answer: 'True',
              explanation: 'Fish need water to swim and breathe.',
            },
            {
              prompt: 'Where do trees usually grow?',
              answer: 'On land',
              explanation: 'Trees grow in soil where they can get water and sun.',
            },
          ],
        },
        {
          name: 'Weathering and Changes',
          description: 'Wind and water slowly change the land.',
          questions: [
            {
              prompt: 'True or false: Rocks can break into smaller pieces over time.',
              answer: 'True',
              explanation: 'Water and wind wear down rocks slowly.',
            },
            {
              prompt: 'What can a river do to the land it flows over?',
              answer: 'Carve or shape it',
              explanation: 'Rivers carry away dirt and reshape the land.',
            },
          ],
        },
        {
          name: 'Using Maps',
          description: 'Maps show where land, water, and places are located.',
          questions: [
            {
              prompt: 'True or false: Blue on a map often means water.',
              answer: 'True',
              explanation: 'Blue is used for oceans, lakes, and rivers.',
            },
            {
              prompt: 'What would you use a map for?',
              answer: 'To find places',
              explanation: 'Maps help us know where things are.',
            },
          ],
        },
        {
          name: 'Protecting Our Earth',
          description: 'We can help Earth by keeping water and land clean.',
          questions: [
            {
              prompt: 'True or false: Throwing trash in a river is good for fish.',
              answer: 'False',
              explanation: 'Trash hurts animals and pollutes water.',
            },
            {
              prompt: 'Name one way kids can help Earth.',
              answer: 'Recycle (or plant trees, or pick up trash)',
              explanation: 'Small actions help keep our world clean.',
            },
          ],
        },
      ],
    },
    {
      name: 'Engineering Design (K-2)',
      description: 'Students define simple problems and build, test, and improve basic design solutions.',
      lessons: [
        {
          name: 'What Is a Problem?',
          description: 'A problem is something that needs fixing or solving.',
          questions: [
            {
              prompt: 'True or false: A wobbly chair is a problem to solve.',
              answer: 'True',
              explanation: 'Wobbly chairs are uncomfortable and could break.',
            },
            {
              prompt: 'Name a problem you could solve with a tool.',
              answer: 'A leaky faucet (or messy room, or broken toy)',
              explanation: 'Tools or new designs can fix everyday problems.',
            },
          ],
        },
        {
          name: 'Sketching Ideas',
          description: 'Drawing a plan helps show an idea before building.',
          questions: [
            {
              prompt: 'True or false: Engineers never draw before they build.',
              answer: 'False',
              explanation: 'Engineers sketch plans to share their ideas.',
            },
            {
              prompt: 'Why should you draw your idea first?',
              answer: 'To plan it out',
              explanation: 'A sketch helps you think before building.',
            },
          ],
        },
        {
          name: 'Building a Model',
          description: 'A model is a small version of a real design.',
          questions: [
            {
              prompt: 'True or false: A toy car is a kind of model.',
              answer: 'True',
              explanation: 'Toy cars show what real cars look like.',
            },
            {
              prompt: 'Name something you could use to build a model bridge.',
              answer: 'Popsicle sticks (or blocks, or straws)',
              explanation: 'Simple materials can show a bridge shape.',
            },
          ],
        },
        {
          name: 'Testing Designs',
          description: 'Testing shows if the design works.',
          questions: [
            {
              prompt: 'True or false: It is okay if a first design does not work.',
              answer: 'True',
              explanation: 'Testing helps engineers find what to fix.',
            },
            {
              prompt: 'What do you do if a paper airplane will not fly?',
              answer: 'Change the design and try again',
              explanation: 'Engineers try new shapes until it works.',
            },
          ],
        },
        {
          name: 'Improving a Design',
          description: 'Engineers change designs to make them better.',
          questions: [
            {
              prompt: 'True or false: Making a design better is called improving.',
              answer: 'True',
              explanation: 'Engineers keep improving their work.',
            },
            {
              prompt: 'What is one way to improve a tower that keeps falling?',
              answer: 'Make a wider base',
              explanation: 'Wider bases are more stable.',
            },
          ],
        },
      ],
    },
  ],
};
