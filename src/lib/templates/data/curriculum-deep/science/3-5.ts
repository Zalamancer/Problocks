import type { DeepGrade } from '../types';

export const GRADE_DATA: DeepGrade = {
  grade: '3-5',
  label: 'Elementary 3-5 Science',
  sourceUrl: 'https://www.nextgenscience.org/sites/default/files/3-5Topic.pdf',
  units: [
    {
      name: 'Forces, Motion, and Interactions',
      description: 'Students investigate balanced and unbalanced forces, magnets, and electricity in everyday systems.',
      lessons: [
        {
          name: 'Balanced and Unbalanced Forces',
          description: 'Balanced forces do not change motion, but unbalanced ones do.',
          questions: [
            {
              prompt: 'In a tug-of-war, neither team is moving. Are the forces balanced?',
              answer: 'Yes',
              explanation: 'Equal pulling forces cancel each other out.',
            },
            {
              prompt: 'What happens to a soccer ball when you kick it harder than the grass pushes back?',
              answer: 'It moves forward',
              explanation: 'The kick force is greater, so motion changes.',
            },
          ],
        },
        {
          name: 'Patterns of Motion',
          description: 'Motion can repeat in patterns like swinging or bouncing.',
          questions: [
            {
              prompt: 'What pattern does a swing make when you push it and let go?',
              answer: 'It goes back and forth',
              explanation: 'A swing moves in a repeating back-and-forth motion.',
            },
            {
              prompt: 'If a ball bounces lower each time, is its motion slowing down?',
              answer: 'Yes',
              explanation: 'Energy is lost to the floor each bounce.',
            },
          ],
        },
        {
          name: 'Magnetic Forces',
          description: 'Magnets pull on iron and some other metals without touching.',
          questions: [
            {
              prompt: 'Will a magnet stick to a plastic spoon?',
              answer: 'No',
              explanation: 'Plastic is not magnetic.',
            },
            {
              prompt: 'Name an object a magnet would pick up in your kitchen.',
              answer: 'A steel nail or paperclip',
              explanation: 'Magnets attract iron and steel objects.',
            },
          ],
        },
        {
          name: 'Electric Forces',
          description: 'Rubbed balloons can pull small objects by static charge.',
          questions: [
            {
              prompt: 'Why does a rubbed balloon stick to a wall?',
              answer: 'Static electricity',
              explanation: 'Rubbing gives the balloon a charge that attracts the wall.',
            },
            {
              prompt: 'Can static electricity pick up tiny paper pieces?',
              answer: 'Yes',
              explanation: 'A charged object attracts lightweight things like paper.',
            },
          ],
        },
        {
          name: 'Solving a Force Problem',
          description: 'Forces help us design bridges, ramps, and machines.',
          questions: [
            {
              prompt: 'Why do ramps make loading a truck easier?',
              answer: 'They spread the pushing force over a longer distance',
              explanation: 'You use less force along a ramp than lifting straight up.',
            },
            {
              prompt: 'What could you add to a skateboard to slow it down?',
              answer: 'Brakes or rougher wheels',
              explanation: 'Friction from brakes or rough surfaces slows it.',
            },
          ],
        },
      ],
    },
    {
      name: 'Energy and Energy Transfer',
      description: 'Learners trace how energy moves between objects through motion, collisions, sound, light, and heat.',
      lessons: [
        {
          name: 'What Is Energy?',
          description: 'Energy makes things move, heat up, or give off light.',
          questions: [
            {
              prompt: 'Name two forms of energy you see at home.',
              answer: 'Light and heat (or sound, or motion)',
              explanation: 'Lamps, ovens, and fans all use energy.',
            },
            {
              prompt: 'What kind of energy does a running dog have?',
              answer: 'Motion energy',
              explanation: 'Moving objects have motion, or kinetic, energy.',
            },
          ],
        },
        {
          name: 'Energy in Collisions',
          description: 'When things collide, energy moves from one to the other.',
          questions: [
            {
              prompt: 'When a bowling ball hits pins, what happens to the energy?',
              answer: 'It transfers to the pins',
              explanation: 'The moving ball pushes its energy into the pins.',
            },
            {
              prompt: 'Why does a moving car take longer to stop than a bicycle?',
              answer: 'Cars have more energy because they are heavier',
              explanation: 'More mass at the same speed means more energy.',
            },
          ],
        },
        {
          name: 'Sound Energy',
          description: 'Sound is energy that travels in waves through air.',
          questions: [
            {
              prompt: 'Why do you feel the boom of a drum in your chest?',
              answer: 'Sound waves vibrate the air and your body',
              explanation: 'Loud sounds carry energy that shakes things.',
            },
            {
              prompt: 'Can you hear sound in outer space?',
              answer: 'No',
              explanation: 'Space has no air to carry sound waves.',
            },
          ],
        },
        {
          name: 'Light Energy',
          description: 'Light travels from sources like the Sun and lamps.',
          questions: [
            {
              prompt: 'Why can you see a book in daylight but not in a dark closet?',
              answer: 'You need light to bounce off the book into your eyes',
              explanation: 'Seeing requires light reflection.',
            },
            {
              prompt: 'Name a source of light.',
              answer: 'The Sun (or a lamp, or a flashlight)',
              explanation: 'These objects give off light energy.',
            },
          ],
        },
        {
          name: 'Electric Circuits',
          description: 'Energy can flow through wires to power devices.',
          questions: [
            {
              prompt: 'Why does a flashlight stop working when the batteries die?',
              answer: 'There is no more energy to flow',
              explanation: 'Batteries store energy; empty batteries give no power.',
            },
            {
              prompt: 'Why is a switch useful on a lamp?',
              answer: 'It stops or starts the flow of energy',
              explanation: 'Switches break the circuit to turn the lamp on or off.',
            },
          ],
        },
      ],
    },
    {
      name: 'Life Cycles, Traits, and Inheritance',
      description: 'Students examine how organisms grow, reproduce, and inherit traits from their parents.',
      lessons: [
        {
          name: 'Life Cycles of Plants and Animals',
          description: 'Living things are born, grow, reproduce, and die.',
          questions: [
            {
              prompt: 'What comes after the egg in a butterfly life cycle?',
              answer: 'A caterpillar (larva)',
              explanation: 'Butterflies hatch from eggs as caterpillars.',
            },
            {
              prompt: 'Name the stage when a seed starts to grow.',
              answer: 'Germination',
              explanation: 'A seed sprouts when it germinates.',
            },
          ],
        },
        {
          name: 'Inherited Traits',
          description: 'Traits passed from parents include eye color and leaf shape.',
          questions: [
            {
              prompt: 'Why might a kitten look like its mother cat?',
              answer: 'It inherited traits from her',
              explanation: 'Offspring get traits from their parents.',
            },
            {
              prompt: 'Name a trait you may have inherited.',
              answer: 'Hair color (or eye color, or height)',
              explanation: 'These traits are passed through genes.',
            },
          ],
        },
        {
          name: 'Traits Influenced by the Environment',
          description: 'Some traits change because of food, light, or exercise.',
          questions: [
            {
              prompt: 'Why might a plant with little water be shorter than one with plenty?',
              answer: 'Water is needed for growth',
              explanation: 'The environment affects how much a plant grows.',
            },
            {
              prompt: 'Can exercise change how strong a person becomes?',
              answer: 'Yes',
              explanation: 'The environment can shape muscle growth.',
            },
          ],
        },
        {
          name: 'Variation in Populations',
          description: 'Individuals of a species look a little different from each other.',
          questions: [
            {
              prompt: 'Why are no two puppies exactly the same in a litter?',
              answer: 'They have different trait combinations',
              explanation: 'Genes mix to make each puppy unique.',
            },
            {
              prompt: 'What is an advantage of variation in a wild population?',
              answer: 'Some individuals may survive changes better',
              explanation: 'Variation helps a species survive new conditions.',
            },
          ],
        },
        {
          name: 'Group Behaviors',
          description: 'Animals often live in groups for safety or food.',
          questions: [
            {
              prompt: 'Why do wolves hunt in packs?',
              answer: 'To catch bigger prey and protect each other',
              explanation: 'Group hunting is more successful than alone.',
            },
            {
              prompt: 'Name an animal that lives in large herds.',
              answer: 'A buffalo (or zebra, or elephant)',
              explanation: 'Herd animals stay together for safety.',
            },
          ],
        },
      ],
    },
    {
      name: 'Ecosystems and Food Webs',
      description: 'Learners model how matter and energy flow among producers, consumers, and decomposers.',
      lessons: [
        {
          name: 'Producers and Consumers',
          description: 'Producers make food; consumers eat producers or other consumers.',
          questions: [
            {
              prompt: 'Is a sunflower a producer or a consumer?',
              answer: 'A producer',
              explanation: 'Plants make their own food using sunlight.',
            },
            {
              prompt: 'Name a consumer that eats only plants.',
              answer: 'A cow (or rabbit, or deer)',
              explanation: 'Herbivores are consumers that eat plants.',
            },
          ],
        },
        {
          name: 'Food Chains',
          description: 'Energy flows from plants to animals in a food chain.',
          questions: [
            {
              prompt: 'In grass -> rabbit -> fox, who is the producer?',
              answer: 'The grass',
              explanation: 'Grass makes its own food first.',
            },
            {
              prompt: 'What happens to the fox if rabbits disappear?',
              answer: 'It has less food and may struggle to survive',
              explanation: 'Food chains link survival from one level to the next.',
            },
          ],
        },
        {
          name: 'Decomposers',
          description: 'Decomposers like mushrooms break down dead things and recycle matter.',
          questions: [
            {
              prompt: 'Why are decomposers important to soil?',
              answer: 'They return nutrients back to the ground',
              explanation: 'Decomposers recycle matter for plants to reuse.',
            },
            {
              prompt: 'Name a decomposer you might see in the woods.',
              answer: 'A mushroom (or earthworm, or bacteria)',
              explanation: 'These organisms break down dead leaves and wood.',
            },
          ],
        },
        {
          name: 'Ecosystem Interactions',
          description: 'Plants and animals depend on one another to survive.',
          questions: [
            {
              prompt: 'Why do bees and flowers both benefit when bees visit flowers?',
              answer: 'Bees get nectar, flowers get pollinated',
              explanation: 'They help each other in a mutual way.',
            },
            {
              prompt: 'What could happen to a pond if all the frogs disappeared?',
              answer: 'Insects could increase and plants could be affected',
              explanation: 'Removing one species changes the whole ecosystem.',
            },
          ],
        },
        {
          name: 'Changes in Environments',
          description: 'Changes like fires or droughts affect ecosystems.',
          questions: [
            {
              prompt: 'What happens to animals when their forest burns down?',
              answer: 'They must find new homes or may die',
              explanation: 'Habitat loss threatens survival.',
            },
            {
              prompt: 'Can some ecosystems recover from fire?',
              answer: 'Yes, over time',
              explanation: 'Plants regrow and animals return after disturbances.',
            },
          ],
        },
      ],
    },
    {
      name: "Earth's Systems and Processes",
      description: "Students study weathering, erosion, the water cycle, and how Earth's systems interact.",
      lessons: [
        {
          name: 'Weathering and Erosion',
          description: 'Rocks break down and are carried away by water and wind.',
          questions: [
            {
              prompt: 'How does a river change rocks over time?',
              answer: 'It wears them smooth',
              explanation: 'Moving water slowly erodes rocks.',
            },
            {
              prompt: 'What is erosion?',
              answer: 'When soil or rock pieces are moved away',
              explanation: 'Wind or water carries broken rock to new places.',
            },
          ],
        },
        {
          name: 'The Water Cycle',
          description: 'Water moves between oceans, clouds, rain, and rivers.',
          questions: [
            {
              prompt: 'What is it called when water rises into the air as a gas?',
              answer: 'Evaporation',
              explanation: 'Heat turns liquid water into water vapor.',
            },
            {
              prompt: 'How does water get from a cloud back to the ground?',
              answer: 'Precipitation (rain or snow)',
              explanation: 'Clouds release water as rain, snow, or hail.',
            },
          ],
        },
        {
          name: 'Earth Systems Interact',
          description: 'Water, land, air, and living things affect each other.',
          questions: [
            {
              prompt: 'How does rain affect soil?',
              answer: 'It can wet the soil and carry some away',
              explanation: 'Water shapes the land and helps plants.',
            },
            {
              prompt: 'Why is the ocean important for weather?',
              answer: 'It supplies water that makes clouds and rain',
              explanation: 'Oceans drive the water cycle.',
            },
          ],
        },
        {
          name: 'Natural Hazards',
          description: 'Earthquakes, floods, and volcanoes can change land quickly.',
          questions: [
            {
              prompt: 'Name one way people stay safe during an earthquake.',
              answer: 'Drop, cover, and hold on',
              explanation: 'Taking cover protects from falling objects.',
            },
            {
              prompt: 'What changes land the fastest: a rainstorm or a volcano eruption?',
              answer: 'A volcano eruption',
              explanation: 'Volcanoes can reshape land in hours.',
            },
          ],
        },
        {
          name: 'Protecting Resources',
          description: 'We can save water, soil, and forests with smart choices.',
          questions: [
            {
              prompt: 'Name one way kids can save water at home.',
              answer: 'Turn off the tap while brushing teeth',
              explanation: 'Small habits save a lot of water.',
            },
            {
              prompt: 'Why is planting trees good for the land?',
              answer: 'Roots hold soil and prevent erosion',
              explanation: 'Trees help protect soil and provide habitat.',
            },
          ],
        },
      ],
    },
    {
      name: 'Space Systems: Sun, Moon, and Stars',
      description: 'Kids observe patterns of the Sun, Moon, and stars and the rotation of Earth.',
      lessons: [
        {
          name: 'Day and Night',
          description: 'Earth rotates once each day, creating day and night.',
          questions: [
            {
              prompt: 'Why do we have night?',
              answer: 'Our side of Earth faces away from the Sun',
              explanation: 'Earth spins, and half faces away from sunlight.',
            },
            {
              prompt: 'How many hours does Earth take to spin once?',
              answer: '24 hours',
              explanation: 'One full rotation is a day.',
            },
          ],
        },
        {
          name: 'Shadows and the Sun',
          description: 'Shadows change length and direction as the Sun moves.',
          questions: [
            {
              prompt: 'When is your shadow longest: noon or evening?',
              answer: 'Evening',
              explanation: 'The Sun is lower, making shadows longer.',
            },
            {
              prompt: 'Which direction does the Sun rise in?',
              answer: 'East',
              explanation: 'Earth rotating makes the Sun appear to rise in the east.',
            },
          ],
        },
        {
          name: 'Phases of the Moon',
          description: 'The Moon looks different each week because of its position.',
          questions: [
            {
              prompt: 'What do we call a fully lit Moon?',
              answer: 'A full moon',
              explanation: 'A full moon happens when the Sun lights its whole visible face.',
            },
            {
              prompt: 'How long is the full cycle of Moon phases?',
              answer: 'About a month (29 days)',
              explanation: 'The Moon orbits Earth once a month.',
            },
          ],
        },
        {
          name: 'Stars and the Night Sky',
          description: 'Stars are distant suns that make patterns called constellations.',
          questions: [
            {
              prompt: 'Why do stars only appear at night?',
              answer: 'The Sun is too bright during the day',
              explanation: 'Sunlight hides faint starlight.',
            },
            {
              prompt: 'Name a constellation.',
              answer: 'Orion (or Big Dipper, or Ursa Major)',
              explanation: 'Constellations are star patterns we have named.',
            },
          ],
        },
        {
          name: 'Seasons',
          description: 'The tilt of Earth causes warmer and cooler seasons.',
          questions: [
            {
              prompt: 'Why is summer warmer than winter?',
              answer: 'The Sun is higher and days are longer',
              explanation: 'Earth tilt gives more direct sunlight in summer.',
            },
            {
              prompt: 'Which season has the longest nights?',
              answer: 'Winter',
              explanation: 'Winter has fewer hours of daylight.',
            },
          ],
        },
      ],
    },
    {
      name: 'Matter and Its Properties',
      description: 'Students explore particles, states of matter, mixtures, and conservation of mass.',
      lessons: [
        {
          name: 'States of Matter',
          description: 'Matter exists as solids, liquids, and gases.',
          questions: [
            {
              prompt: 'Is steam a solid, liquid, or gas?',
              answer: 'A gas',
              explanation: 'Steam is water in gas form.',
            },
            {
              prompt: 'What state holds its own shape: solid, liquid, or gas?',
              answer: 'Solid',
              explanation: 'Solids keep their shape because particles are packed together.',
            },
          ],
        },
        {
          name: 'Particles We Cannot See',
          description: 'All matter is made of tiny particles.',
          questions: [
            {
              prompt: 'Can we see the particles that make up air?',
              answer: 'No',
              explanation: 'Air particles are far too small to see.',
            },
            {
              prompt: 'Why does sugar disappear in water?',
              answer: 'Its particles spread out in the water',
              explanation: 'Sugar dissolves but still exists in the liquid.',
            },
          ],
        },
        {
          name: 'Mixtures',
          description: 'Mixtures contain two or more things combined.',
          questions: [
            {
              prompt: 'Is salad a mixture?',
              answer: 'Yes',
              explanation: 'Salad has many foods mixed together.',
            },
            {
              prompt: 'How could you separate iron nails from sand?',
              answer: 'Use a magnet',
              explanation: 'Magnets grab iron and leave sand behind.',
            },
          ],
        },
        {
          name: 'Conservation of Matter',
          description: 'Matter is not lost when it changes state or mixes.',
          questions: [
            {
              prompt: 'If you melt an ice cube, does the water weigh the same as the ice?',
              answer: 'Yes',
              explanation: 'Melting changes state, not the amount of matter.',
            },
            {
              prompt: 'Where does the water go when a puddle dries up?',
              answer: 'It evaporates into the air',
              explanation: 'The water becomes gas but still exists.',
            },
          ],
        },
        {
          name: 'Physical and Chemical Changes',
          description: 'Some changes make new materials, others do not.',
          questions: [
            {
              prompt: 'Is rusting an iron nail a physical or chemical change?',
              answer: 'Chemical',
              explanation: 'Rust is a new material, not just a shape change.',
            },
            {
              prompt: 'Is tearing paper a physical or chemical change?',
              answer: 'Physical',
              explanation: 'The paper is still paper after tearing.',
            },
          ],
        },
      ],
    },
    {
      name: 'Engineering Design (3-5)',
      description: 'Learners define criteria and constraints, then iterate on designs to solve real problems.',
      lessons: [
        {
          name: 'Defining a Problem',
          description: 'A clear problem states what must be solved and why.',
          questions: [
            {
              prompt: 'What are criteria in engineering?',
              answer: 'Things the design must do well',
              explanation: 'Criteria are the goals a design must meet.',
            },
            {
              prompt: 'Give an example of a constraint on a design.',
              answer: 'A limited budget (or size, or materials)',
              explanation: 'Constraints are limits designers must work within.',
            },
          ],
        },
        {
          name: 'Brainstorming Solutions',
          description: 'Engineers think of many ideas before picking one.',
          questions: [
            {
              prompt: 'Why do engineers think of more than one idea?',
              answer: 'Different ideas may work better',
              explanation: 'Brainstorming helps find the best design.',
            },
            {
              prompt: 'What is one way to compare two designs?',
              answer: 'Make a chart of their good and bad points',
              explanation: 'Charts help compare pros and cons.',
            },
          ],
        },
        {
          name: 'Building Prototypes',
          description: 'A prototype is an early model to test a design.',
          questions: [
            {
              prompt: 'Why build a prototype instead of the final product first?',
              answer: 'To test cheaply and find problems early',
              explanation: 'Prototypes let engineers find flaws before spending money.',
            },
            {
              prompt: 'Name a simple material for building a prototype.',
              answer: 'Cardboard (or tape, or foam)',
              explanation: 'Simple materials make quick testing easy.',
            },
          ],
        },
        {
          name: 'Testing and Collecting Data',
          description: 'Measuring results shows how well a design works.',
          questions: [
            {
              prompt: 'Why is it important to test the same way each time?',
              answer: 'To compare results fairly',
              explanation: 'Fair tests keep only one thing different at a time.',
            },
            {
              prompt: 'What is a fair test of paper airplanes?',
              answer: 'Same throw height, same launch force',
              explanation: 'Changing only the plane design shows which flies best.',
            },
          ],
        },
        {
          name: 'Improving and Iterating',
          description: 'Engineers use test results to improve the design.',
          questions: [
            {
              prompt: 'What is iteration in design?',
              answer: 'Repeating the design cycle to improve it',
              explanation: 'Designers test, learn, and try again.',
            },
            {
              prompt: 'Why might a design need more than one test?',
              answer: 'Each test shows something new to fix',
              explanation: 'Many tests lead to better designs.',
            },
          ],
        },
      ],
    },
  ],
};
