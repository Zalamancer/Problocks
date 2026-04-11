# Project Management and Testing for Student Game Development

Adapted from Sommerville Ch 8 (Software Testing), Ch 22–23 (Project Management + Planning), Ch 25 (Configuration Management). Applied to the Problocks game development context.

---

## 1. Testing Stages (Sommerville's Model Adapted for Game Dev)

Sommerville defines three top-level testing stages: **development testing**, **release testing**, and **user testing**. Each maps directly to game development.

### Stage 1: Development Testing (ongoing during build)

Development testing is carried out by the team building the game. It has three sub-levels:

**Unit testing** — test individual functions or game systems in isolation.
- In game dev: test one mechanic (e.g., does the jump arc calculation return correct values? does the scoring system increment correctly?)
- Use automated tests where possible; test both normal inputs and boundary cases (score = 0, lives = 0, empty level)
- Write two kinds of test case: one that confirms normal behavior works, one that confirms edge cases don't crash

**Component testing** — test that multiple systems work together at their interfaces.
- In game dev: does the collision system correctly interact with the player controller? Does the save system correctly serialize the score and level state?
- Interface bugs often only appear when combining components — test the combination, not just each part

**System testing** — integrate all components and test the full gameplay loop.
- In game dev: can a player start the game, play through a level, die, respawn, reach the win condition, and see the end screen — all without crashing?
- Test use-case scenarios (complete playthroughs), not just individual features
- This is distinct from a playtest: system testing is checking correctness; playtesting is checking fun

### Stage 2: Test-Driven Development (optional but recommended)

TDD means writing a test before writing the code that satisfies it. For game dev:
- Before implementing a scoring system, write a test that asserts `addPoints(10)` increases score by 10
- Run it — it fails (expected). Write the code. Run it — it passes. Move on.
- Benefits: forces clarity on what a system is supposed to do; creates a regression suite automatically; debugging is easier because you know exactly which new code caused a failure
- Game-specific limitation: TDD works well for logic systems (scoring, inventory, AI state machines) but cannot test subjective feel. Use TDD for systems; use playtesting for feel.

### Stage 3: Release Testing (before publishing)

A separate pass — ideally by someone who didn't build the feature — testing the complete game before it goes live. Goals:

- Verify all Must-have features are present and working
- Confirm no game-breaking bugs: crashes, soft-locks, unbeatable states
- Test non-functional requirements: performance on target hardware, load times, audio levels
- This is not the same as playtesting. Release testing checks correctness. It answers: "does the game do what it's supposed to do?" not "is the game fun?"

Student shortcut: if you have no separate tester, do a structured self-test pass using a written checklist. Create the checklist before building — not after.

### Stage 4: User Testing (playtesting)

Sommerville calls this acceptance testing. In game dev it is called playtesting. It answers validation questions: "Are we building the right game?"

Three types used in the game dev context:

| Type | When | Who | What you observe |
|---|---|---|---|
| **Alpha playtest** | During production (before content-complete) | Peers, classmates | Core loop comprehension, confusion points |
| **Beta playtest** | After content-complete, before launch | Wider audience | Difficulty balance, fun level, friction |
| **Post-launch feedback** | After publish | Real players | Bug reports, feature requests, drop-off points |

Key rule from Sommerville: testing can only show the presence of errors, not their absence. A game that passes all tests can still be unfun, confusing, or broken in untested states. Test systematically but never assume you're done.

---

## 2. Project Planning for Student Games

### Plan-Driven vs Agile Planning

Sommerville distinguishes plan-driven development (complete project plan upfront, activity network, fixed milestones) from agile planning (plan the next increment in detail, defer later decisions).

For student games:

| Approach | When to use | What to plan upfront | What to defer |
|---|---|---|---|
| Plan-driven | Milestone Run (Preset 5), semester projects with graded deadlines | All milestones, MoSCoW feature list, team roles | Exact feature implementation |
| Agile | Game Sprint (Preset 1), Build Board (Preset 2) | Current sprint/cycle only | Future sprints, unstarted features |
| Hybrid | Most student projects | Overall milestone dates + MoSCoW list | Sprint-by-sprint contents |

### Project Scheduling

Sommerville's activity network approach, adapted simply for student teams:

1. **List all tasks** — break the game into concrete deliverables (core mechanic, enemy AI, level 1, audio, UI, store listing)
2. **Identify dependencies** — which tasks must finish before others can start? (art style must be decided before final assets are made; core loop must work before content is built on top of it)
3. **Estimate duration** — use past experience or comparison: "this feature is similar to X, which took 3 days"
4. **Find the critical path** — the sequence of dependent tasks that determines the minimum possible completion time; any slip on the critical path delays the whole project
5. **Build a bar chart** — assign tasks to team members across the calendar; check no one is over-allocated

**Milestones** are predictable outcomes at fixed dates. Each milestone should produce a tangible deliverable, not just a progress update. Sommerville is explicit: "a deliverable is a work product that is delivered to the project customer." For students, the "customer" is the instructor or the player — make something they can actually see or play.

### Estimation Techniques

Sommerville describes two approaches relevant to students:

**Experience-based estimation** — judge effort based on past work. Practical form for students: compare a new feature to a feature you already built. "The inventory system is twice as complex as the health system, which took 4 hours. Estimate: 8 hours." Write down estimates before starting; review them after finishing.

**Agile planning game (story points)** — assign relative story points to backlog items, not time. A simple feature = 1 point, a medium feature = 3 points, a complex feature = 8 points. After 2 sprints, your team's average output (velocity) tells you how many points per sprint you can reliably complete.

Practical student rules from Sommerville's key points:
- Always produce a range (best case / expected / worst case), not a single number
- Estimates are wrong; build slack into your schedule (assume 20% of time goes to unexpected bugs)
- Doubling team size does not halve the schedule — communication overhead increases. A 2-person team is often faster than a 4-person team on a small game.

---

## 3. Risk Management Basics

Sommerville's risk management process has four steps: identify, analyze, plan, monitor.

### Risks Relevant to Student Game Projects

| Risk | Type | Probability | Severity | Strategy |
|---|---|---|---|---|
| Scope is too large for the timeline | Estimation | High | Serious | Cut features at milestone review; use MoSCoW |
| Core mechanic turns out not to be fun | Product | Moderate | Serious | Prototype and playtest in week 1–2 before building content on top |
| Team member drops the project or goes inactive | People | Moderate | Serious | No single-point-of-failure ownership; document everything in the repo |
| Chosen engine/framework can't do what you need | Technology | Low–Moderate | Serious | Technical spike in week 1: build a proof of concept for the hardest thing |
| Art style takes longer than expected | Estimation | High | Tolerable | Lock art style early; use placeholder art throughout, replace at end |
| External dependency unavailable (API, assets, AI tool) | Technology | Low | Serious | Have a fallback plan; don't design a game that requires a specific external tool |

### Risk Process for Student Teams

At the start of each project (or sprint/milestone):
1. **Identify**: write down the top 5 risks. Be honest — what is most likely to go wrong?
2. **Analyze**: for each, rate probability (low/medium/high) and impact (tolerable/serious/catastrophic)
3. **Plan**: for the top 3, write one sentence: what will you do if this happens? (avoidance, minimization, or contingency)
4. **Monitor**: check the list at every sprint review or milestone. Has anything changed?

Sommerville notes that agile development reduces some risks (requirements change is expected) while increasing others (staff turnover is more disruptive because knowledge is less documented). For student teams, the equivalent is: an agile approach survives changing ideas but is vulnerable to a team member going silent, because there is no documentation to fall back on.

---

## 4. Configuration Management for Game Projects

Sommerville's four CM activities: version control, system building, change management, release management.

### Version Control (Git for Students)

Git is a distributed version control system. The project's definitive code lives in a shared remote repository (GitHub/GitLab). Each developer has a local clone.

**Basic student workflow (feature branch model):**
1. `git pull` — get the latest version before starting work
2. Create a branch for your feature: `git checkout -b feature/enemy-ai`
3. Work and commit frequently: `git commit -m "add patrol behavior to enemy"` — small commits, each message says what changed and why
4. Push branch: `git push origin feature/enemy-ai`
5. Open a pull request; teammate reviews; merge to `main`
6. Never commit directly to `main` — it is always the working, playable version of the game

**Commit discipline:** Sommerville emphasizes that the mainline should always be the definitive working system. In game dev: `main` branch should always be in a playable state. Feature branches are where broken work lives. Nothing broken merges to `main`.

**What to put in the repo:**
- All source code and scripts
- Level files, scene files, project config
- README with build instructions

**What to keep out (via .gitignore):**
- Compiled builds (they can be regenerated)
- Auto-generated files
- Large binary assets that change frequently (use Git LFS or a separate asset store for large audio/texture files)

### Change Management (Bug Tracking)

Sommerville defines change management as tracking, costing, and approving changes. For students:

Use an issue tracker (GitHub Issues, Trello, Notion) for every bug and feature request. For each issue, record:
- What is wrong (observed behavior)
- What was expected
- Priority: game-breaking / quality-degrading / polish
- Who is assigned to fix it

At each sprint review or milestone, triage the open issues: fix game-breaking bugs immediately; schedule quality bugs for the next sprint; defer polish until the polish phase.

**Change decision rule (simplified from Sommerville):** Before implementing any change post-beta, ask:
1. Does it fix a game-breaking problem?
2. Does it benefit more than one player?
3. Can it be done without destabilizing existing features?

If the answer to all three is yes, implement it. If scope is a concern, defer it to a post-launch update.

### Release Management (How to Cut a Game Version)

A release is a tagged, stable version of the game distributed to players. Sommerville distinguishes major releases (significant new content/features) from minor releases (bug fixes, patches).

**Student release checklist:**

```
Pre-release:
[ ] All game-breaking bugs from beta playtest are fixed
[ ] Performance tested on target hardware
[ ] All placeholder art/audio replaced
[ ] Main menu, credits, and basic instructions present
[ ] Game description and screenshots prepared

Release creation:
[ ] Tag the commit in git: git tag v1.0 -m "initial launch"
[ ] Push the tag: git push origin v1.0
[ ] Build the export from the tagged commit (not from uncommitted changes)
[ ] Upload to distribution platform

Post-release:
[ ] Monitor for player bug reports
[ ] Collect reports in the issue tracker
[ ] Batch fixes into a v1.1 patch; don't push hotfixes directly to a live build without testing
```

**Semantic versioning for student games:**
- `v0.x` — prototype/alpha builds (not for public release)
- `v1.0` — initial public release
- `v1.x` — patch releases (bugs, balance tweaks)
- `v2.0` — major content update

---

## 5. Additions Needed in game-dev-presets.md

The current presets cover methodology, ceremonies, and milestone stages well. The following testing, planning, and configuration steps are missing from each preset and should be added.

### Preset 1: Game Sprint (Scrum)

**Testing gaps:**
- Sprint 0 should include setting up an issue tracker and defining what "done" means for testing (not just for features)
- Each Sprint Review should be split: (a) system test pass by a non-author team member before the session, then (b) playtest during the session — these are different activities
- Sprint 4 (Polish Sprint) should include an explicit release testing checklist pass, not just "fix what exists"

**Planning gaps:**
- Sprint 0 should produce a risk register (top 5 risks) reviewed at each Sprint Review
- Velocity tracking is mentioned nowhere — after Sprint 1, the team should calculate how many story points they completed and use that to right-size Sprint 2's backlog

**Config management gaps:**
- No mention of git workflow. Sprint 0 setup should include: create repo, agree on branch naming convention, set `main` as protected, set up issue tracker
- No mention of tagging releases — the Sprint 5 deliverable should be a tagged `v1.0` commit, not just "publish to platform"

---

### Preset 2: Build Board (Kanban)

**Testing gaps:**
- The "Review / Test" column exists but has no definition of what testing means. Add: unit test for logic systems; manual playthrough for new features; record pass/fail in the issue tracker before moving a card to Done
- No regression testing step — when a new card is completed, explicitly check that previously completed features still work

**Planning gaps:**
- No estimation guidance. Cards moving to "Ready" should have a rough time estimate attached. Cycle time tracking (already mentioned) should be compared against these estimates to calibrate future estimates
- No risk identification step. At Setup, write 3 risks on sticky notes and pin them visibly. Review weekly.

**Config management gaps:**
- No git guidance at all. The Board Setup section should include: create repo, agree on one branch per card, merge to `main` only when the card reaches Done
- No release versioning. The "Launch" card should include tagging the git commit as `v1.0`

---

### Preset 3: Bet It (Shape Up)

**Testing gaps:**
- Shaping Week should explicitly include a technical spike / proof-of-concept for the hardest part of the bet — this is development testing at the design stage, and Shape Up's "rabbit holes" concept maps directly to Sommerville's risk identification
- Cooldown periods should include a structured system test pass, not just "fix small bugs" — what does "fixed" mean without a test?
- No user testing step defined — the end of each cycle should include a structured playtest with at least 3 outside players, with written notes, not just "share build"

**Planning gaps:**
- The Hill Chart is good for progress tracking but contains no estimation. Add: at the start of each cycle, estimate hours for the downhill phase (implementation); compare to actuals at end of cycle to calibrate future bets
- No risk register. The shaping document should include a "known risks" section (this is the "rabbit holes" concept, made explicit)

**Config management gaps:**
- No git guidance. Each cycle maps to a long-lived feature branch merged to `main` at ship time
- Cooldown should include tagging the shipped build in git: `v1.0`, `v2.0` per cycle

---

### Preset 4: Fast Loop (RAD)

**Testing gaps:**
- This preset is almost entirely about playtesting, which is good, but development testing is absent. Add after each Build Pass: a 15-minute structured bug hunt (play specifically looking for crashes and soft-locks, not for fun) before the playtesting session
- The "Decision Point" step should include asking: "did anyone observe a crash or unrecoverable state?" — this is system testing, not just fun assessment

**Planning gaps:**
- No risk step. In game jam context, add a 10-minute risk discussion at the Concept stage: "what is the hardest technical thing we need to build? Can we prototype that first?"
- Time-boxing is present and good; add explicit scope-cutting rule: if you reach the Release Pass and have more than 3 broken features, cut features rather than extending the pass — this matches Sommerville's instruction to treat time as fixed and scope as variable

**Config management gaps:**
- For game jams specifically: create a repo at the very start, commit every hour. This is cheap insurance. Add this to the Setup step.
- At the Release Pass: tag the commit before uploading to the jam platform. `git tag jam-submission` takes 5 seconds and means you can always rebuild the exact submitted version.

---

### Preset 5: Milestone Run (Incremental)

**Testing gaps — this is the preset most aligned with Sommerville's model, but still missing:**
- Milestone 2 (Alpha): deliverable requires "playtest feedback from 5 external players" but no guidance on what to observe. Add: use a structured observation protocol — watch silently, note every moment of confusion, ask 3 questions after: "What did you think the goal was? What confused you? What would you change?" Do not explain the game before they play.
- Milestone 3 (Beta): "zero game-breaking bugs" is a quality gate but there is no defined testing process for verifying it. Add: a release testing checklist pass (see Section 4 of this document) before calling Beta done
- The post-mortem should explicitly include: what testing did we skip, and what bugs did players find that our testing should have caught?

**Planning gaps:**
- No risk register. Milestone 0 (Pitch Week) should produce a top-5 risk list alongside the MoSCoW feature list. Review at every milestone.
- MoSCoW discipline is well-defined but lacks estimation guidance. At Milestone 0, each Must-have feature should have a rough hour estimate. At each milestone review, compare actuals to estimates; use the ratio to adjust remaining estimates.
- The Lead Developer role should own a simple activity dependency map: which features block which other features? This prevents the situation where two parallel builders accidentally need the same system finished at the same time.

**Config management gaps:**
- No git guidance. Add to Milestone 0 setup: create shared repo, define branch convention (feature branches, protected `main`), set up issue tracker
- Each milestone should be tagged in git: `v0.1-prototype`, `v0.2-alpha`, `v0.3-beta`, `v1.0-gold`. This makes it trivial to roll back to a known-good state if a feature breaks the build before submission.
- The post-launch section should describe the patch release process: collect bug reports → triage → fix on a `hotfix/` branch → test → merge to `main` → tag `v1.1` → re-publish
