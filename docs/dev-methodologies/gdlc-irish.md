# Game Development Life Cycle — Dan Irish (The Game Producer's Handbook, 2005)

Source: *The Game Producer's Handbook*, Dan Irish, Course Technology PTR, 2005.
Chapters 1 and 6. All definitions are Irish's own unless bracketed.

---

## 1. Stages of Game Development

Irish presents eight sequential stages that "nearly all [publisher pipelines] boil down to."

| Stage | Irish's Definition |
|---|---|
| **Concept** | The game concept is written down. Brainstorming occurs; ideas are generated. |
| **Prototype** | A prototype is developed so users can start to experience the fun as described in concept documentation. Typically lasts 2–4 months depending on tools available. |
| **Pitch** | Developers pitch the game to management or, if independent, to a publisher's representatives. The pitch explains why the concept is strong, why it is ready for the market, whether it is producible, and how it will be developed. |
| **Green Light** | Begins after the pitch is approved for production. Involves assembling the team — interviewing developers, resolving business and legal issues (IP ownership, character/story rights) before pre-production can begin. |
| **Pre-Production** | The team defines production pipelines, identifies tool needs, and fleshes out the game design details. Irish recommends completing a prototype or mini-game during this phase as a test case for the full game. |
| **Production** | Game building actually begins. 3D models, worlds, sound, textures, cinematics, game logic — all pieces are made and assembled. At least 12 months; often much longer. |
| **Quality Assurance** | The testing phase, occurring at the final stage of production, approximately 3–4 months before the scheduled manufacturing date. The game is tested for bugs, errors, deficiencies, and incompatibilities. |
| **Final Gold Master** | The master disc is burned and sent to the manufacturing facility for duplication. For consoles, includes the "Submit to Hardware Manufacturer" process; each manufacturer has its own rigorous QA requirements. Online games require continued patching even after gold. |

---

## 2. Five Software-Production Methods

Irish surveys these five approaches; he does not rank them uniformly — each suits different project types.

### 2.1 Code-Like-Hell, Fix-Like-Hell
Also called the *extreme game development method* or *XP method*. Some advance planning is done but rarely followed. Programmers code as fast as possible to implement what they think the design calls for; code is then tested and fixed. Errors are left unfixed until someone finds them, at which point the code is further along than when the errors were introduced.

- Prone to failure due to constant-frenetic-pace stress on programmers, designers, and testers.
- Generally only suitable for **small projects with simple requirements** (under ~6 months).
- Code is difficult to maintain over a longer period.

### 2.2 Increments to Completion
Software is developed in relatively compact, finite increments. High-level design documentation captures key requirements; low-level documentation is completed just before or just after each feature is implemented — usually when designers and programmers agree on what is possible.

- Features can be developed **in parallel or independently** of each other.
- Allows the team to demonstrate a playable game early and continually integrate new systems and artwork.
- Requires a high degree of coordination and easily modifiable code structures.
- Lessons from early increments (e.g., a prototype phase) are highly useful long-term.

### 2.3 The Cascade
The entire team focuses on the next part of the game as each prior part is completed (staircase flow: design → lower-level features → coding + testing → implementation → testing → complete). Parts come together quickly but with little time for testing between feature creation and implementation.

- Difficult to change major parts or systems once built — requires everything to go correctly from the start.
- Irish's verdict: **not recommended for game development.**

### 2.4 Iterate Until You Drop
Probably the most flexible method. Its purpose is to help the producer define the key areas of the game, begin developing them, and finalize the design *partway through* the development process. Responds to changing market forces; allows the team, publisher, and designers to iterate on the fun factor as they play more.

- Beneficial when the developer is unsure which features competing products will include.
- Risk: without discipline it becomes a never-ending treadmill of improvements, justifying ever-expanding budgets and timelines.
- It is the producer's role to ensure this method does not go out of control.
- Requires proper tools and object-oriented methodologies.

### 2.5 Agile Project Management
Irish draws on Jim Highsmith's *Agile Project Management* (Pearson, 2004). He describes it as the best method for combining the strengths of Iterate Until You Drop with disciplined process. Highsmith deliberately avoids terms like "initiate," "plan," and "direct" because those terms imply predictive accuracy — which game software projects are "probably the antithesis" of.

Agile centers on five stages:

| Stage | Irish's Definition |
|---|---|
| **Envision** | Articulate the game designer's vision or essence statement. Determine scope, gaming-community support, and how the team will work together. Answer "What game are you making and who is it for?" and "Who is going to use this to make this game?" The game designer works with the producer to spread enthusiasm and define how key team members will work together. |
| **Speculate** | Determine high-level requirements; outline all work required to complete the game; create a development plan including a schedule with resource allocations, a feature list, risk-management plans, and a budget. Irish notes the word *speculate* is intentional — it accurately describes the reality of volatile game software markets and the uncertainty of any development plan. |
| **Explore** | Find and deliver features. Deliver features required by the game design using effective time-management, resource-allocation, and risk-management strategies. The team creates a collaborative, self-organizing community; the producer acts as a facilitator. The producer also manages the team's interactions with management, Marketing, QA, and licensors. |
| **Adapt** | Make necessary modifications to keep the project focused and on schedule. Incorporate lessons learned; apply them to the project in midstream. Analyze project status against the published plan, focusing on budgetary and fiscal impact. Results feed back into re-planning and the next iteration. "Responding to change is more important than simply following a plan blindly." |
| **Finalize** | Complete the project; document and learn from mistakes and lessons. Irish notes that the goal of a project ending often eludes game teams due to required patches, upgrades, and add-on packs — but most projects are worthy of celebration once completed. |

---

## 3. Planning and Scheduling

### 3.1 Top-Down Approach
Developed by a single person or small group to provide an overview of what a project schedule *might* look like. Often gets "adopted as gospel" and is rarely revised without considerable frustration. Does not involve participation from those who will actually do the work.

- Should only be considered a **goal or guideline** — at best a guess; at worst, totally wrong.
- Useful for understanding scope and complexity.
- Must be clearly labeled as provisional and revised when team input is available.

### 3.2 Bottom-Up Approach
The producer gathers relevant team members to collaboratively plan what is possible, by when, and what resources are required. All art assets, game features, and project requirements are identified. Can only occur after significant pre-production planning.

- Identifies short- and near-term goals; checks items off the feature/art-asset list as team concurs.
- Shares ownership of the schedule — people protect their own commitments.
- Warning: only as good as the game design. Nebulous design makes any bottom-up plan unreliable.

### 3.3 Scheduling Constraint Models

**Time-Constrained Model**
Focus on the tasks, features, owners, and dependencies *without* accounting for resource requirements. Guess at durations; link dependent tasks such that the most fundamental and riskiest come first. The point is to determine whether a project of a given size and scope can fit within the available timeframe at all.

**Resource-Constrained Model**
Convert the time-constrained model into one where tasks are assigned to actual available skills. Identify gaps (tasks for which no appropriate resource exists — these require hiring or retraining). Account for work days, vacations, weekends, sick days, meetings, and administrative overhead. Include contingency buffers distributed equally across all areas of the plan. Divide the plan into major milestones. Irish notes this model may need to be re-created multiple times as the game progresses.

### 3.4 Critical-Path Planning
The *critical path* is the series of tasks or events that make up the start and end of a project — it has no available schedule cushion or buffer. Generally fewer than 25% of total tasks are on the critical path, but those items *must* follow a specific order and sequence.

- To shorten project duration, focus exclusively on critical-path tasks.
- Critical-path planning involves knowing the sequences of events and ensuring all potential problems associated with critical-path tasks are addressed *before* reaching that task on the schedule.

### 3.5 Schedule Estimation Formula
Irish's "Extremely Flexible Project Planning Formula":

```
(2 × Best Case) + (3 × Worst Case) + Most Likely Case
-------------------------------------------------------- = Estimated Duration
                          6
```

Example: Best 10d, Worst 25d, Most Likely 15d → (20 + 75 + 15) / 6 = 18.33 days. Provides a 3.33-day buffer over the most-likely scenario. The formula can be adjusted for team members who can only devote a fraction of their time to production work.

---

## 4. GDD Structure — Elements of a Producible Video Game Design Document (Ch. 6)

Irish divides GDD content into **Major** and **Secondary** components. The design document is meant to be a *guide* for the team during design and production phases — it should be clear, concise, and updated continuously. Irish cites Mark Cerny (DICE 2002): "the single worst thing you can do to kick off your Pre-production is to sit down and write a 100-page design document."

### 4.1 Major Game Design Components
- Essence Statement
- Core Concept or Gameplay Promise
- General Gameplay Description
- Game Flow Chart, including use cases
- Technology Requirements
- Interface Design and Use
- Character Design
- Minimal Discussion of Story or License Use

### 4.2 Secondary Game Design Components (selected)
AI Design, Behaviors Data Table, Damage, Death Sequences, Demo/Attract Mode, Difficulty Levels, Document Revisions, Enemy Description, Export Pipeline Documentation & Procedures, Gameplay Specifications (Hardware Target Spec), Level Briefings, Lexicon, Memory Map and Footprint Estimate, Mission/Level Design Checklist, Modability, Model Lists, Multiplayer Design, Music and Sound Effects Lists, Object Description, Player and Camera Behavior, Rewards Table, Save Game Methods, Score, Scripting, Simulation Time, Sound Design, Special Effects, Specialized Art Requirements, Start Up, Story, Terrain Features, Transitions, Voiceover Lists, Weapon Systems, Weapons Data Table, Winning Sequences.

### 4.3 Technical Design vs. Creative Design

**Technical Design** explains *how* features will be implemented. Early in the project it covers polygon counts, rendering capabilities, and frame rate. As development progresses it is updated to reflect how each feature was actually built — ultimately becoming "Programmer Task Annotations." Key sections:

Automated build creation, Camera, Commands, Computer opponents and enemy AI, Front end (resolution/scaling), Game data, Game Logic (multiplayer and single player), Graphics and Rendering (poly/texture budget), Infrastructure and architecture (mod support, data-driven engine), Initialization and shutdown, Localization, Movie Sequences/cutscenes, Networking, NPC/Unit AI, Optimization opportunities, Scripting system, Simulation, Sounds, Tools (Mission Editor, sound/FX placement, mod tools).

**Creative Design** articulates the *what* — the artistic and gameplay vision. It includes the essence statement, character design, story, level briefs, interface look and feel, and concept art. The creative design undergoes formal internal and external reviews. Irish introduces *use case scenarios* — step-by-step descriptions of how a player uses a system — as a key tool for capturing functional requirements from the player's perspective.

### 4.4 Game Constraints Irish Identifies

| Constraint Category | Key Points |
|---|---|
| **Memory** | Fixed on consoles (as low as 6 MB on older consoles); variable on PC (minimum spec, typically 32 MB+). Sub-categories: program code RAM, texture RAM, video buffer RAM, models/animation, sound, level/game data. Keep memory usage minimal at all times. |
| **Platform / Graphics** | Console specs are known and unchanging for the console's lifetime; PC specs shift constantly. Design must conform to the target platform's API constraints (DirectX, OpenGL, console SDKs). |
| **Genre and Demographics** | Genre determines platform fit (e.g., RTS games do not sell well on consoles). Target demographic is determined by market research — the primary purchasing demographic is males ages 15–45. Different platforms attract different demographics (Nintendo = children 10–17; Xbox/PS2 = mature audience). |
| **License Constraints** | A license restricts and guides genre, story, character use, art direction, and overall game experience. The licensee has explicit requirements (e.g., Star Trek — USS Enterprise cannot be destroyed). Requires a formal approvals process through the licensor. |
| **Key Feature Requirements** | Marketing departments set required features for established brands. These are non-negotiable and must be included in the design (e.g., all *Myst* products must scale across hardware generations; *Need for Speed* must support steering wheels on all platforms). |
| **Storage Device** | CD-ROM, DVD, ROM cartridge, and memory card each have distinct read speeds, seek speeds, and size limits. Big file systems and streaming-from-RAM mitigate slow seek times. Console save data is tightly constrained by memory card capacity. |

---

## 5. Key Differences from Novak

Janice Novak's *Game Development Essentials* is the most common counterpart text. Where Irish and Novak diverge:

| Topic | Irish | Novak (typical framing) |
|---|---|---|
| **Phase naming** | Uses "Green Light" as a discrete stage between Pitch and Pre-Production | Novak folds green-light into the broader "Pre-Production" or omits it as a named stage |
| **Prototype placement** | Prototype is a standalone stage *before* the pitch, not part of pre-production | Novak typically places prototyping *within* pre-production |
| **QA as a stage** | Irish treats QA as its own named stage, distinct from Production | Novak often treats testing as a sub-phase embedded in late production |
| **Final Gold Master** | Irish gives Gold Master its own stage with console submission process detail | Novak's equivalent is often called "Ship" or "Launch" without the console-certification specificity |
| **Production methods** | Irish provides 5 named software-production methods with explicit pros/cons and diagrams | Novak focuses more on a linear SDLC with iterative commentary rather than named method variants |
| **Agile framing** | Irish explicitly cites Highsmith (2004) and maps Agile's 5 phases to game development | Novak's treatment of Agile (where it appears) is less formally structured |
| **GDD philosophy** | Irish argues against the 100-page upfront GDD (citing Cerny), favoring living documentation updated throughout production | Novak emphasizes completeness of the GDD before production begins |
| **Top-down scheduling** | Irish is explicitly skeptical — calls it "at best a guess; at worst, totally wrong" | Novak treats top-down planning more neutrally as a valid starting approach |
| **Concept stage** | Irish's Concept stage is minimal — just "brainstorming and idea generation" | Novak's Concept stage includes a more formal concept document / high-concept pitch document |
