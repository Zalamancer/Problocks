# Novak's Game Development Life Cycle (GDLC)

**Source:** Jeannie Novak, *Game Development Essentials: An Introduction*, Ch. 10 (Roles & Responsibilities) and Ch. 11 (Production & Management). This is the authoritative academic GDLC reference for this project.

---

## Development Phases

Novak defines eight phases in the game development process. Each phase focuses on specific objectives and involves different team members. (Note: some phases differ by project and publisher.)

---

### 1. Concept

**What it is:** The concept phase begins when an idea for a game is envisioned and ends when a decision is made to begin planning the project (i.e., to enter pre-production).

**Team size:** Small — typically a designer, programmer, artist, and producer.

**What happens:**
- Identify a target market
- Assess company resources
- Identify a concept that resonates with developers and has potential market appeal
- Many short game design treatments are considered
- Goals are written down to convey the idea to others

**Documentation produced:** Concept document (also called a pitch document) — no more than 5 pages. Created by producer or creative director.

---

### 2. Pre-Production

**What it is:** The planning phase. Begins after the concept receives interest; ends with the completion of the GDD and Technical Design Document.

**What happens:**
- Develop the game proposal (10–20 pages)
- Create the art style guide
- Create the production plan
- End product: GDD + Technical Design Document

**Documentation produced:** Game Proposal, Art Style Guide, Game Design Document (GDD), Technical Design Document, Project Plan (initial version).

---

### 3. Prototype

**What it is:** Creating a tangible working piece of software that captures the essence of what makes the game special — what sets it apart and what will make it successful.

**What happens:**
- Start with a low-fidelity prototype (often paper-based — cards, boards, tiles, miniatures) to test gameplay mechanics before digital work
- Create a digital prototype to show publishers and funding sources
- Prepare standalone tech demos proving planned technology is feasible
- The finished prototype shows vision and establishes that the production path works

**Key principle:** The prototype stage is too early for final technology. Simulate the feel without it. Game engines are often used for prototyping even if different technology ships in the final game.

**Documentation produced:** No new primary documents, but the prototype itself is the deliverable. May include playtesting notes.

---

### 4. Production

**What it is:** The longest phase — the game is actually developed. Lasts six months to two years.

**What happens:**
- Full team is engaged building all game systems, art, audio, levels, and scripting
- Localization occurs here (language translation, content modification for regional regulations)
- Project plan is actively maintained and updated

**Key note:** This phase often suffers from "crunch time" — 100-hour weeks. Novak emphasizes that this is avoidable with proper planning in pre-production. Management must balance time, money, and value throughout.

**Documentation produced:** Updated GDD, Updated Project Plan. Game manual (draft begins).

---

### 5. Alpha

**What it is:** The point at which the game is playable from start to finish. There may be gaps; art assets may not be final; but the engine and user interface are complete.

**Focus:** Finishing and polishing, not building. Drop features if necessary to make the release date.

**Testing begins:** Testing department is brought on. This is the first time the game is seen by people outside the development team.

**To pass Alpha, the following must be complete:**
- One gameplay path (playable beginning to end)
- Primary language text
- Basic interface with preliminary documentation
- Compatibility with most specified hardware and software configurations
- Minimum system requirements tested
- Most manual interfaces tested for compatibility
- Placeholder art and audio
- Multiplayer functionality tested (if applicable)
- Draft of game manual

**Documentation produced:** Bug database and test plan created. Performance results recorded.

---

### 6. Beta

**What it is:** After passing Alpha. Focus is entirely on fixing bugs. All assets are integrated; production ceases.

**Goal:** Stabilize the project and eliminate as many bugs as possible before shipping.

**What happens:**
- Beta testers recruited online to test for playability
- Isolate all significant bugs and performance problems
- Complete testing, bug fixing, and performance tuning
- Tests on all supported platforms
- Console games: hardware manufacturer certification/submission process (first, second, final)
- PC games: compatibility testing across hardware configurations
- Code freeze period at the end — master game media sent to testing; only urgent bug fixes allowed

**To pass Beta, the following must be complete:**
- Code
- Content
- Language version text
- Game path navigation
- User interface
- Hardware and software compatibility
- Manual interface compatibility
- Art and audio
- Game manual

**Documentation produced:** Final code and content. Completed game manual. Visual interfaces finalized.

---

### 7. Gold

**What it is:** The game has passed Beta. Master disc has been thoroughly tested and found acceptable.

**What happens:**
- Senior management reviews product and bug database ("bugbase") and agrees the product is ready
- Manufacturing begins (disc pressing, packaging) — takes several weeks
- Game is released into the marketplace
- Digital distribution increasingly skips the manufacturing phase

**Documentation produced:** No new primary documents. Bug database closed/archived.

---

### 8. Post-Production (Post-Release)

**What it is:** Everything after gold release. Several subsequent versions of the game may be released.

**What happens:**
- **Patches:** Fix software bugs and issues on unusual hardware combinations — released free of charge
- **Updates:** Additional content to enhance the original game — extend the game's life
- **Expansions:** Self-contained games requiring their own software (sometimes also the original game)
- **DLC (Downloadable Content):** Increasingly created during production rather than post-release

**Documentation produced:** Patch notes, update documentation. Ongoing test plans for new content.

---

## Iterative Development

Novak describes iterative development (p. 367) as more appropriate for games than film-like linear production. It is borrowed from software and web development (Van Duyne et al., *The Design of Sites*).

**The three-stage iterative loop:**

```
Design → Prototype → Evaluate → (back to Design)
```

- **Design:** Planning and pre-production
- **Prototype:** A working playable version of the design
- **Evaluate:** The team plays and tests; decides what works and what doesn't; then returns to the Design phase to modify the prototype

This loop repeats until the game is no longer a prototype but a completed product.

**Key principles:**
- Each prototype should have its own cycle of requirements, deliverables, and schedule
- Continuously refine the design based on what has been built so far
- Do not build assets you might not need later (this is the opposite of "gold-plating")
- Involve prospective players in the Evaluate phase to get a player perspective on usability, gameplay, and fun factor
- Particularly well-suited to games that can be easily beta-tested online

---

## Common Mistakes (p. 369)

Drawn from Steve McConnell's *Rapid Development*. Game producers should keep these in mind:

| Mistake | Problem |
|---|---|
| Lack of motivation | Team members are not given reasons to do a good job |
| Lack of skill | Hiring for speed rather than skill |
| Difficult employees | A single problem person destroys morale and efficiency |
| Restricted environment | Noisy, crowded offices reduce productivity |
| Insufficient tracking | Not monitoring whether the team is on schedule |
| Incomplete task list | Time-consuming tasks (interviews, reviews, conference days) omitted from the plan |
| Misunderstandings | Tasks not clearly explained to team members |
| Unplanned tasks | Last-minute management requests not budgeted in the plan |
| Waiting to fix bugs | Deferring bug fixes; fixing bugs often uncovers other hidden bugs |

---

## Recovery from Mistakes (p. 370)

Novak identifies four anti-patterns that producers fall into when trying to recover:

| Bad Recovery Action | Why It Fails |
|---|---|
| Planning to catch up later | Delays compound; address problems immediately |
| Requiring mandatory overtime | Extended overtime drops productivity and motivation, producing more bugs |
| Adding people to the project | New people need ramp-up time; meetings grow longer; mid-project additions almost never help |
| Holding more meetings | Status meetings interrupt immersive intellectual work; a full day of meetings nearly guarantees a productivity drop |

---

## Game Documentation

Documentation is created during concept, pre-production, and production to communicate to team members and prospective partners (publishers, manufacturers, licensors). No strict industry standards exist; the following are the essential components.

---

### 1. Concept Document (Pitch Document)

**Phase:** Concept
**Length:** Max 5 pages; should take no more than one week to create
**Created by:** Producer or creative director
**Purpose:** Convey the goal and purpose of the proposed game. Sell the idea to funding sources, publishers, or internal decision makers. Assess whether the idea is viable, timely, and feasible.

**Contents:**
- **Premise / High Concept:** 1–2 sentences describing the mood and unique hook of the game (used on posters and packaging)
- **Player Motivation:** Brief statement of victory condition — how does the player win/what drives them to play to the end?
- **Unique Selling Proposition (USP):** What makes this game unique versus competitors; no more than one paragraph
- **Target Market:** Age range, demographics, psychographics; no more than one paragraph
- **Genre:** Primary genre; discuss hybrids carefully
- **Target Rating:** Expected ESRB rating
- **Target Platform and Hardware Requirements:** Primary platform; ports if planned; minimum and recommended specs
- **License:** If adapted from an existing IP, describe the deal
- **Competitive Analysis:** 3–5 competing titles; how this game will differentiate
- **Goals:** The experiential goal — what mood or feeling the game creates

---

### 2. Game Proposal

**Phase:** Pre-Production (after concept receives interest)
**Length:** 10–20 pages
**Created by:** Producer and directors of art, programming, and design teams
**Purpose:** Present the full details of the game to a company or partner already interested in the concept. Also used to explain the game in detail to prospective team members.

**Contents:** Everything in the Concept Document, plus:
- **Hook:** 3–5 best features that will attract and retain players
- **Gameplay:** 10–20 elements describing the experience of playing; paths, challenges, activities
- **Online Features:** Multiplayer, cooperative, PvP features (if applicable)
- **Technology:** Special software or hardware technologies; licensed engine details
- **Art & Audio Features:** Unique visual/audio selling points; composer; motion capture
- **Production Details:** Team bios and roles; rough budget estimate; proposed ship date; key milestones
- **Backstory:** Brief paragraph summarizing what has happened prior to the game's opening
- **Story Synopsis:** One paragraph main story idea
- **Character Descriptions:** One paragraph per primary character — name, physical description, personality, background, relevance to story
- **Risk Analysis:** What could go wrong; mitigation plans
- **Development Budget:** Direct costs, COGS, marketing estimate, MDF, income estimates, allowances, ROI projection
- **Concept Art:** Character sketches (front/side/back views), 2D mockup screenshots

---

### 3. Game Design Document (GDD)

**Phase:** Pre-Production (completed at end of phase); living document through Production
**Length:** 50–200 pages
**Created by:** Design team; all departments contribute
**Purpose:** Not to sell the idea — that is the proposal's job. The GDD is the reference guide to the entire development process. It must specify the rules of the game in enough detail that you could, in theory, play it without a computer. Accessible on a network to all team members; updated almost daily.

**Contents:** Everything in the Game Proposal, plus:
- **Game Interface:** Each passive and active interface planned — elements, production time, cost to produce, need, viability, usability
- **Game World:** Level elements — cinematics, art, gameplay, animation, characters, pick-up items, background danger items
- **Character Abilities and Items:** Acquired, non-acquired, combat, and defense abilities; weapons and pick-ups; concept art
- **Game Engine Constraints:** What the engine can and cannot do — characters onscreen at once, animations per character, camera restrictions, polygon counts, texture color limits, special controller support

---

### 4. Art Style Guide (Art Plan)

**Phase:** Pre-Production
**Created by:** Concept artist and art director
**Purpose:** Establish the look and feel of the game; provide a consistent visual reference for all artists throughout production.

**Contents:**
- Pencil sketches and digitized images capturing the final look
- Visual reference library reflecting the direction art should take
- Ensures consistent style is followed throughout the game
- Reference images from any print or web source for internal reference only

---

### 5. Technical Design Document

**Phase:** Pre-Production (completed at end of phase)
**Created by:** Technical lead or technical director
**Based on:** The GDD
**Purpose:** Describes the specifics of the game engine — the software in which the game is built. Compares it to other engines. Establishes the technology production path.

**Contents:**
- How the game will transition from concept to software (technology production path)
- Who will be involved in engine development
- What tasks each person will perform and how long each task will take
- What core tools will be used to build the game
- What hardware and software must be purchased

---

### 6. Project Plan

**Phase:** Pre-Production (initial); updated continuously through Production
**Created by:** Producer
**Purpose:** Outlines the path taken to develop the game. Begins with raw task lists from the Technical Design Document; establishes dependencies; adds overhead hours; turns all of this into a real-world schedule.

**Contents:**
- **Resource Plan:** Spreadsheet of all personnel, start dates, salary allocation, hardware purchase timing, external cost timing, monthly cash requirements, overall budget
- **Schedule:** Phase-by-phase milestone schedule
- **Budget:** Derived from resource plan
- **Milestones:** Checkpoints to track project progress

*Note: Sticking to the schedule is imperative — marketing, PR, reviews, and previews are all timed around the release date.*

---

### 7. Test Plan

**Phase:** Alpha (created); updated continuously through Beta
**Created by:** QA department
**Purpose:** Documents the procedures for how the game will be tested. Consistently revised throughout the process to cover new and modified areas.

**Contents:**
- Test cases for each aspect of the game
- Testing checklist — itemizing each area to focus on during testing
- Procedures describing how the game will be tested

---

## Team Roles per Phase

| Phase | Primary Roles Active |
|---|---|
| Concept | Producer, Creative Director, 1–2 Designers, 1 Programmer, 1 Artist |
| Pre-Production | Executive Producer, Producer, Lead Designer, Technical Director, Art Director, Lead Programmer |
| Prototype | Designer(s), Programmer(s), Artist(s), QA (playtesting) |
| Production | Full team — all design, art, programming, audio, and QA roles |
| Alpha | Testing department brought on; playability testers added |
| Beta | Beta testers (external, recruited online); QA; all programmers for bug fixes |
| Gold | Senior management, manufacturing liaison, QA sign-off |
| Post-Production | Small team — programmers (patches), designers (DLC/updates), QA |

**Key team structure from Ch. 10:**

**Production:** Executive Producer (oversight, multiple projects), Producer (goals, budget, schedule, reporting), Associate Producer (research, asset management, milestone review), Assistant Producer (paperwork, scheduling admin)

**Design:** Creative Director (overall vision and style consistency), Design Director (staff support, documentation, prototype guidance), Lead Designer (gameplay, documentation, level design), Narrative Designer (story/dialogue), Interface Designer (layout, navigation, usability), Level Designer (game world/environment)

**Art:** Art Director (style, scheduling, budgeting), Lead Artist (supervises art team by specialty), Concept Artist (drawings/sketches for environment/props/characters; storyboards), Modeler (3D assets from 2D drawings), Texture Artist (2D image maps applied to 3D models), Animator (movement — keyframing and motion capture), Technical Artist (art-programming bridge; pipeline and tools)

**Programming:** Technical Director (technical design; tools, hardware, code standards), Lead Programmer (supervises programming team), Engine Programmer (core game engine, graphics rendering, collision detection), Tools Programmer (level editors, art pipeline plugins, scripting engines), Network Programmer (multiplayer, client/server, protocols), Graphics Programmer (3D graphics APIs — DirectX/OpenGL), AI Programmer (NPC behaviors, pathfinding, strategic planning, dialogue), Audio Programmer (sound card, music programming), Physics Programmer (physics, collision, particle systems, body dynamics), Interface Programmer (expandable UI systems)

**Audio:** Audio Director (department management, personnel hiring, licensing), Composer (musical score — often outsourced), Sound Designer (sound effects and ambient sound), Voiceover Artist / Voice Actor (character dialogue — usually outsourced)

**Testing & QA:** Testing Manager (manages testing + QA teams across multiple projects), Lead Tester (supervises daily testing; searches for errors in geometry, logic, aesthetics), Production/QA/Regression Testers (in-house, paid, 4–6 months), Beta Testers (external volunteers for playability/usability), Focus Testers (target customers for market appeal assessment), Compatibility/Format Testers (cross-platform and hardware configuration testing)

---

## Cross-Reference: How This Maps to game-dev-presets.md

The Novak GDLC is the authoritative source for the phase names used throughout the dev-methodologies folder. The presets in `game-dev-presets.md` map to it as follows:

| Preset | Novak GDLC Alignment | Key Divergence |
|---|---|---|
| **Classic Waterfall Preset** | Closest to Novak's linear phase sequence (Concept → Pre-Production → Prototype → Production → Alpha → Beta → Gold → Post) | No iteration within phases; each phase exits completely before the next begins |
| **Scrum Sprint Preset** | Maps primarily to Novak's Production phase; treats each sprint as a mini production cycle | Concept and pre-production done up front before sprints begin |
| **Kanban Flow Preset** | Maps to Alpha and Post-Production phases; best for ongoing bug work, polish, and DLC | No defined phase boundaries; continuous flow |
| **RAD / Game Jam Preset** | Collapses Concept + Prototype phases into one rapid cycle; skips formal pre-production docs | No GDD; no formal proposal; prototype IS the product |
| **Scrumban Hybrid Preset** | Covers Production through Post-Production; sprints for production, kanban board for polish and bug work | Iterative Development loop (Novak p. 367) is the theoretical basis |

**Novak's Iterative Development loop (Design → Prototype → Evaluate) is the backbone of the Scrum Sprint, RAD, and Scrumban presets.** The loop matches Novak's explicit description on p. 367: prototype early, evaluate with real players, feed results back into the next design cycle.

The linear Novak phase sequence (Concept through Gold) is the backbone of the Classic Waterfall Preset and is the reference model that all other presets diverge from.
