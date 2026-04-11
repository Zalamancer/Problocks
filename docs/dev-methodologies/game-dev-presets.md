# Game Development Presets

This file maps each major development methodology to game development specifically, then defines five curated "preset" development workflows that would work well in the Problocks student game creation context.

---

## How Methodologies Map to Game Development

Game development has its own lifecycle — commonly called GDLC (Game Development Lifecycle) — with three top-level phases:

1. **Pre-Production**: concept, game design document, prototype core mechanic
2. **Production**: build all game systems, levels, art, audio, scripting
3. **Post-Production**: playtest, polish, optimize, publish

Most software methodologies map to this structure, but with varying emphasis and fit:

| Methodology | Best GDLC Phase Fit | Student Fit | Main Risk |
|---|---|---|---|
| Waterfall | Pre-production is planned fully upfront | Low | Game ideas change; rigid plan breaks |
| V-Model | Projects with hard testable requirements | Low | Games are experiential, hard to test formally |
| Incremental | Building game layer by layer | Medium | Each increment needs a playable loop |
| Prototype | Pre-production mechanic validation | High | Easy to get stuck prototyping, never shipping |
| Spiral | High-risk, novel technical games | Low | Too slow and heavy for student timelines |
| Agile (general) | All phases, adaptable | High | Too vague without a specific framework |
| Scrum | Full production cycles | High | Ceremonies can feel heavy for small teams |
| Kanban | Ongoing polish, bug work, solo dev | High | No plan = no direction on scope |
| Scrumban | Mixed production + support/polish | High | Requires both disciplines to work |
| XP | Code-heavy projects, engine systems | Medium | Pair programming suits 2-person teams |
| Crystal Clear | Small co-located teams | High | Communication must be active |
| FDD | Large games with many features | Medium | Feature-level planning suits mid-size projects |
| DSDM | MoSCoW prioritization, milestone-driven | High | Governance is overkill; MoSCoW principle isn't |
| Lean | Eliminating waste, improving process | Medium | Teaching tool; not a standalone workflow |
| Shape Up | Feature-by-feature, appetite-based | High | Shaping requires design maturity |
| DevOps | Continuous build + auto-publish | Medium | CI/CD habits are excellent to build early |
| RAD | Rapid prototyping + play-driven design | High | Best for game jams and short cycles |
| RUP | Architecture-first game engine projects | Low | Heavy for student scope; phases are useful |
| SAFe | Multi-team game studio simulation | Very Low | Requires 50+ people to be meaningful |
| DAD | Process selection / meta-learning | Medium | Useful for advanced students |

---

## Universal Game Dev Phase Skeleton

Before describing the presets, here is the universal phase structure that all five presets build from:

| # | Phase Name | What Gets Built | Key Deliverable |
|---|---|---|---|
| 1 | **Concept** | Game idea, genre, core mechanic hypothesis | 1-page pitch / concept doc |
| 2 | **Design** | Game design document, level sketches, mechanic spec | GDD or equivalent |
| 3 | **Prototype** | Playable rough version of core mechanic | Playable prototype |
| 4 **Core Build** | Main gameplay loop, player systems, first level | First playable build |
| 5 | **Content** | Additional levels, enemies, art, audio, polish | Content-complete build |
| 6 | **Test + Polish** | Bug fixes, playtesting, UX improvements | Polished build |
| 7 | **Launch** | Publish to platform, write description, screenshots | Published game |
| 8 | **Post-Launch** | Gather player feedback, hotfixes, updates | Updated live game |

All five presets use these same phases — they differ in *how long*, *how often*, *how they iterate*, and *how decisions are made*.

---

## Preset 1: "Game Sprint" (Scrum-based)

**Best for:** Teams of 2–5 students. Semester-long projects (8–16 weeks). Students who want structured meetings and clear accountability.

**Philosophy:** Work in 2-week sprints. Every sprint ends with something playable. Sprint Reviews are playtests. The team self-organizes but uses Scrum ceremonies to stay aligned.

### Roles
- **Product Owner** (1 person): owns the game vision, prioritizes the backlog, defines "done" for each feature
- **Scrum Master** (1 person): runs ceremonies, removes blockers, keeps the team on track
- **Developers** (all): build the game — code, art, audio, design (overlapping roles expected)

On a 3-person team, PO and SM roles rotate or overlap.

### Milestone Stages

**Sprint 0 — Setup (week 1–2, before sprints start)**
- Define game concept (genre, core loop, target player)
- Write initial Product Backlog (all planned features as user stories)
- Set up project: game engine, repo, task board, build pipeline
- Deliverable: concept doc + backlog

**Sprint 1 — Core Mechanic Prototype (weeks 3–4)**
- Goal: build the riskiest/most fun mechanic in rough form
- No art, placeholder everything, just gameplay
- Sprint Review: playtest with at least 3 peers; collect feedback
- Retrospective: what worked in our process? what didn't?

**Sprint 2 — Core Loop Complete (weeks 5–6)**
- Goal: player can start, play, and end a session
- Add win/lose condition, basic scoring or progression
- First pass of actual art style (color palette, character silhouette)
- Sprint Review: playable session demo

**Sprint 3 — Content Expansion (weeks 7–8)**
- Goal: add more levels, enemies, challenges, or variety
- Sound effects and background music added
- Bug triage: fix anything that breaks the experience
- Sprint Review: show expanded game

**Sprint 4 — Polish Sprint (weeks 9–10)**
- Goal: make what exists feel good, not add new features
- UI, menus, tutorial, onboarding
- Performance optimization
- Sprint Review: near-final build

**Sprint 5 — Launch Sprint (weeks 11–12)**
- Goal: publish the game
- Final playtesting, bug fixes, release notes
- Publish to platform (itch.io, Problocks, etc.)
- Sprint Review: live published game demo

**Post-Launch (ongoing, 1–2 weeks)**
- Gather player comments
- Hotfix critical bugs
- Reflect: what would we do differently?

### Key Rules
- Every sprint ends with a playable, shareable build
- Nothing carries over: if a feature isn't done, it's cut or re-scoped
- The backlog is groomed weekly (15 min): items added, removed, re-prioritized
- Daily standup (5 min): what did I do yesterday, what am I doing today, any blocks?

---

## Preset 2: "Build Board" (Kanban-based)

**Best for:** Solo developers or very small teams (1–2 people). Projects with ongoing development and no fixed deadline. Students who prefer flow over ceremony.

**Philosophy:** Visualize all work on a board. Limit work in progress so you finish before starting. No sprints — just continuous flow from idea to shipped feature.

### Board Setup

| Column | WIP Limit | Meaning |
|---|---|---|
| **Backlog** | Unlimited | All ideas and planned features |
| **Ready** | 3 max | Clearly scoped, ready to start |
| **Building** | 2 max (1 per person) | Actively being implemented |
| **Review / Test** | 2 max | Built; being playtested or debugged |
| **Done** | Unlimited | Shipped in the game |

### Milestone Stages

**Setup (Day 1)**
- Create board (Trello, Notion, physical cards)
- Write 10–20 feature cards from the game concept
- Prioritize top 3 into "Ready"
- Deliverable: game concept card + populated board

**Core Build (weeks 1–3)**
- Pull from Ready → Building; finish before starting new
- Ship core mechanic (player input, basic physics/rules)
- Ship first level or game state
- WIP limit enforced: no starting card 3 while card 1 and 2 are unfinished

**Content Build (weeks 4–6)**
- Continue flow: features move across the board
- Art, audio, levels added as cards finish
- Backlog is continuously reprioritized based on what was learned from playing

**Polish Flow (weeks 7–8)**
- Shift backlog to contain only polish, bugfix, and UX cards
- Dedicated "Bug" swimlane if bugs are accumulating
- Aim: board has fewer than 5 cards left not in Done

**Launch (week 9)**
- Publish card: upload, description, screenshots, tags
- Announce to playtesters

**Post-Launch (ongoing)**
- Add player feedback cards to backlog
- Prioritize and pull as time allows

### Key Rules
- Never exceed WIP limit in any column — if stuck, improve the system
- Review the board at least twice per week; re-prioritize backlog
- Track cycle time: how many days does a feature take from Ready to Done?
- Every Friday: play the game for 10 minutes and write down 3 things to improve

### Metrics to Track
- **Cycle time** per feature (days from start to done)
- **Throughput** (features shipped per week)
- **Bug accumulation** (are bugs growing or shrinking over time?)

---

## Preset 3: "Bet It" (Shape Up-based)

**Best for:** Teams of 2–3 students. Projects with 6–10 weeks of focused time. Students with some prior game dev experience who want to build larger, more polished features.

**Philosophy:** Don't build from a backlog. Bet on specific shaped work. Every 6-week cycle ships one complete, polished feature or game section. No carryover — if it's not done, it's re-shaped or cut.

### Milestone Stages

**Shaping Week (1 week before each cycle)**
- The game designer (or whole team) explores one feature idea
- Ask: how much time is this worth? (1 week or 3 weeks?)
- Sketch the rough solution: what does "done" look like?
- Identify rabbit holes: what could go wrong?
- Write a one-paragraph pitch

**Cycle 1 — Core Mechanic (weeks 1–6)**
- Bet on: "playable core game loop"
- Team of 2–3 works autonomously with no external interruptions
- Week 1–2: uphill (figuring out implementation)
- Week 3–5: downhill (building it)
- Week 6: ship, fix final bugs, share build
- No new features accepted mid-cycle

**Cooldown 1 (1 week)**
- Fix small bugs from Cycle 1
- Shape the next bet: what's the most important thing to add?
- Team rest and reflection

**Cycle 2 — Game World / Content (weeks 8–13)**
- Bet on: "2 additional levels + art style locked in"
- Same process: uphill → downhill → ship

**Cooldown 2 (1 week)**
- Bug fix, shape Cycle 3

**Cycle 3 — Polish + Launch (weeks 15–20)**
- Bet on: "game is polished and published"
- Audio, UI, onboarding, menus, store listing
- Publish by end of week 6 — no extensions

### Key Rules
- The 6-week window is sacred: if the work isn't done, it doesn't ship. Redesign the scope, don't extend the time.
- "Small batch" tasks (minor features, bug fixes) happen during cooldowns, not during cycles.
- The whole team works only on the bet — no side quests.
- No backlog. Features that didn't get bet on simply don't happen yet.

### Hill Chart Tracking
- Weekly self-assessment: where is each piece of work on the hill?
- **Uphill** = still figuring out the approach (unexplored territory)
- **Peak** = solution is clear, execution remains
- **Downhill** = implementing, completing, testing

If something has been uphill for 2+ weeks, escalate immediately — that's the risk to resolve.

---

## Preset 4: "Fast Loop" (RAD / Prototype-based)

**Best for:** Solo developers or pairs. Game jams (48–72 hours). Short prototype projects (2–3 weeks). Students exploring a new mechanic or genre for the first time.

**Philosophy:** Build the fastest possible version that answers the most important question: "is this fun?" Throw it away if the answer is no. Iterate if yes.

### Milestone Stages

**Concept (hours 1–4 or Day 1)**
- Write one sentence: "A game where the player does X and the challenge is Y"
- Identify the single riskiest assumption: "the game is fun because of mechanic Z"
- That assumption becomes the first prototype target

**Rapid Prototype (hours 5–24 or Day 2–3)**
- Build the smallest version of mechanic Z that can be played
- No art (use primitives: squares, circles, placeholder sprites)
- No audio, no menus, no scoring — just the mechanic
- Play it 5 times yourself
- Ask 2 people to play it and watch them silently

**Decision Point (Day 3–4)**
- Is it fun? → refine and expand
- Is it broken? → identify what's wrong; fix the core issue
- Is the concept wrong? → throw away, start Concept again with a new idea

**Build Pass 1 — Core Loop (days 5–10)**
- Add: win/lose condition, basic progression, restarting
- Still no art, basic sound
- Playtest with 3–5 people; note what confuses them

**Build Pass 2 — Content + Art (days 11–18)**
- Add visual polish (real sprites or simple consistent shapes)
- Add levels or variation
- Add sound effects
- Playtest with 5–10 people; note friction points

**Release Pass (days 19–21)**
- Fix top 3 friction points from playtesting
- Add main menu, credits, basic instructions
- Publish

### Key Rules
- "Does this answer the fun question?" is more important than "is this code clean?"
- The prototype is for learning, not shipping. The code can be garbage.
- Time-box each pass strictly. If you're not done with "Core Loop" by day 10, cut features — never extend the pass.
- Get external playtesters every pass. Watching someone play your game for 2 minutes is worth more than 2 hours of solo playtesting.

### When to Use
- Game jams (48–72 hour events)
- Exploring a mechanic idea before committing to a full project
- First game project (building confidence by shipping quickly)
- When the concept is new and you're not sure if it works

---

## Preset 5: "Milestone Run" (Incremental / Hybrid)

**Best for:** Teams of 3–6 students. Full semester projects (12–16 weeks) with graded milestones. Students who want a clear linear structure with predictable deliverables.

**Philosophy:** Plan the whole game upfront (loosely), then build it in graded increments where each increment is fully playable. Use MoSCoW to lock scope per milestone. Never delay a deadline — cut features instead.

### Roles
- **Lead Designer**: owns the GDD and feature priorities
- **Lead Developer**: owns technical architecture and build pipeline
- **Team Members**: build, test, contribute to design

### Milestone Stages

**Milestone 0 — Pitch Week (week 1)**
- Concept document (1 page): genre, mechanic, audience, art style
- Feature list with MoSCoW labels (Must / Should / Could / Won't)
- Technical feasibility check: can the chosen engine do what we need?
- Team agreement on working hours and communication method
- Deliverable: signed-off pitch document

**Milestone 1 — Prototype (week 2–4)**
- Build: core mechanic (Must have only)
- No art polish, placeholder assets
- Playable start-to-finish (even if 30 seconds)
- Deliverable: playable prototype build + 3-sentence reflection

**Milestone 2 — Alpha (weeks 5–8)**
- Build: all Must haves + at least 50% of Should haves
- First real art style applied
- 3+ playable minutes of content
- Basic audio (at minimum: one sound effect per major action)
- Deliverable: alpha build + playtest feedback from 5 external players

**Milestone 3 — Beta (weeks 9–12)**
- Build: all remaining Should haves + selected Could haves
- All levels / content complete
- Full audio pass
- UI and menus complete
- Zero game-breaking bugs
- Deliverable: beta build + playtesting report

**Milestone 4 — Gold / Launch (weeks 13–15)**
- Polish only: no new features
- Fix bugs from beta playtest
- Performance optimization
- Publish to platform
- Write game description, take screenshots/video
- Deliverable: published live game

**Post-Launch (week 16)**
- Gather player feedback
- Submit post-mortem (what worked, what didn't, what you'd do differently)

### MoSCoW Discipline Per Milestone
At the start of each milestone:
1. Review the feature list
2. Confirm Must haves are achievable in the time available
3. If not: move items from Must to Should (negotiate with deadline reality, not wishful thinking)
4. Review after milestone: did scope change? Update the list honestly.

### Key Rules
- Milestone dates do not move. Scope moves instead.
- Every milestone produces a playable, shareable build — not a progress report.
- The post-mortem at the end is as important as the game itself for learning.
- "Alpha," "Beta," and "Gold" are quality gates, not just dates. Alpha = complete core loop. Beta = content-complete. Gold = shippable to real players.

---

## Preset Selection Guide

Use this quick guide to recommend the right preset to a student:

| Student Situation | Recommended Preset |
|---|---|
| Solo developer, no deadline | Build Board (Kanban) |
| Solo developer, game jam | Fast Loop (RAD) |
| First game project, any team size | Fast Loop (RAD) |
| 2–4 person team, semester project with graded milestones | Milestone Run (Incremental) |
| 2–5 person team, want sprints and ceremonies | Game Sprint (Scrum) |
| 2–3 person team, experienced, focused 6-week project | Bet It (Shape Up) |
| Solo, building ongoing long-term project | Build Board (Kanban) |
| Student wanting to learn pro studio process | Game Sprint (Scrum) |
| Student exploring a new mechanic idea | Fast Loop (RAD) |

---

## What Every Student Should Know About All Methodologies

Regardless of which preset they choose, every student game developer should internalize these cross-methodology truths:

1. **Ship early, ship often.** Every methodology that survives contact with reality produces something playable at frequent intervals. If you haven't shipped anything in 3 weeks, something is wrong.

2. **Scope is the variable.** Time and quality are fixed. When a deadline approaches, cut features — never crunch indefinitely.

3. **External playtesting is non-negotiable.** The developer is the worst judge of their own game. Get 3 people who haven't seen the game to play it, watch silently, and take notes. Do this every 2 weeks minimum.

4. **Your first plan is wrong.** Every methodology either accounts for this (Agile, Shape Up, Prototype) or suffers for ignoring it (Waterfall). Build in feedback loops.

5. **Waste is the enemy, not effort.** A week spent building a mechanic that gets cut is not "wasted effort" — it's learning. A week spent in meetings that produced no decisions is waste. Know the difference.

6. **Retrospect and adapt.** Every methodology includes a reflection step. Teams that skip retrospectives repeat the same mistakes. The question is simple: what should we start, stop, and continue doing?
