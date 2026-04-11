# Requirements Engineering for Student Game Developers

Adapted from Sommerville, *Software Engineering* (10th ed.), Chapter 4.

---

## What Requirements Engineering Is

Requirements engineering (RE) is the process of finding out, analyzing, documenting, and checking what a system should do and the constraints on its operation. Sommerville's definition: "the descriptions of the services that a system should provide and the constraints on its operation."

RE produces two levels of description:

- **User requirements** — high-level, plain language statements of what the system must do. Written for non-technical readers. ("The player shall be able to save progress at any checkpoint.")
- **System requirements** — detailed specifications of what to implement. Written for developers. ("When the player reaches a checkpoint trigger zone, the game serializes the current state to localStorage under the key `save_slot_[n]`.")

In student game dev, you usually do both in one document (the GDD). The user-level statements come first; implementation notes come after.

---

## Functional vs Non-Functional Requirements

### Functional Requirements

What the system does — features, behaviors, responses to input.

**Game examples:**
- The player can jump by pressing the spacebar
- Enemies respawn 30 seconds after being defeated
- The game displays a score counter that increments on enemy defeat
- Collecting all coins in a level unlocks the next level

These are testable: either the feature works or it doesn't.

**Rule:** Write each functional requirement as one sentence starting with "The player shall..." or "The game shall..." Use "shall" for must-have, "should" for nice-to-have.

### Non-Functional Requirements

Constraints on the system as a whole — performance, usability, platform, quality.

**Game examples:**

| Type | Game Example |
|---|---|
| Performance | The game shall maintain 60fps on hardware with a 2GHz CPU and 4GB RAM |
| Usability | A new player shall be able to understand the core mechanic within 2 minutes without reading instructions |
| Platform | The game shall run in Chrome 110+ without plugins |
| Reliability | The game shall not crash or freeze during a standard play session |
| Portability | The game shall run on both 1080p and 720p screens without UI elements being clipped |

Non-functional requirements often matter more than individual features. A game with 20 features that runs at 10fps is unshippable. A game with 5 features that runs smoothly and feels good is a real game.

**Rule:** Make non-functional requirements measurable wherever possible. "The game should be fast" is useless. "The game shall load within 3 seconds on a 10Mbps connection" is testable.

---

## Requirements Elicitation for Games (Simplified)

Sommerville's elicitation is designed for enterprise systems with many stakeholders. For a student game, the stakeholders are: you (designer/developer), your teammates, and your players. Elicitation is still necessary — you need to surface your own assumptions before you start building.

**Techniques that transfer directly to game dev:**

### 1. Play Reference Games (Observation / Ethnography equivalent)
Before writing a single requirement, play 2–3 games in the same genre for 30 minutes each. Take notes:
- What controls are assumed without explanation?
- What does the game do when I fail?
- What does "winning" feel like and when does it happen?
- What would annoy me if it were missing?

This surfaces implicit requirements you would otherwise forget to specify.

### 2. Concept Interview (Self-interview or team interview)
Ask the team these questions and write down the answers:
- Who is the target player? (age, experience level, context — mobile, PC, classroom)
- What is the one thing the player does repeatedly? (the core loop)
- What makes it challenging? What makes it rewarding?
- What does a complete session look like start to finish?
- What would make someone recommend this game to a friend?

Answers become your user stories and scope boundaries.

### 3. Rapid Prototype Testing (Prototyping for elicitation)
Build the crudest playable version of the core mechanic. Watch someone else play it silently. Their confusion and friction are unarticulated requirements you hadn't thought of. This is the single most effective elicitation technique for games.

### 4. Scenario Writing
Write a short narrative of one complete play session: "Sarah opens the game, sees the main menu, clicks Play, the tutorial starts..." Walk through every moment. Each step where you're not sure what happens is a missing requirement.

---

## The Game Design Document as a Requirements Spec

A GDD is the game industry's equivalent of a Software Requirements Specification (SRS). For student projects, keep it short and live — update it as the game changes.

**Minimal GDD structure:**

```
1. Overview
   - One-sentence pitch
   - Genre and platform
   - Target player (who they are, what context they play in)
   - Session length (how long is one play session?)

2. Core Loop
   - What does the player do every 30 seconds?
   - What is the win condition?
   - What is the fail/reset condition?

3. Functional Requirements (Feature List)
   - Labeled Must / Should / Could (MoSCoW)
   - One sentence each: "The game shall..."

4. Non-Functional Requirements
   - Performance target (fps, load time, device)
   - Usability target (time to understand, accessibility)
   - Platform constraints

5. Player Stories
   - 5–10 stories covering core interactions

6. Out of Scope (Won't Have)
   - Explicitly list what you are NOT building
   - This prevents scope creep

7. Acceptance Criteria per Milestone
   - Milestone 1: what must be true for this to be "done"?
   - Milestone 2: etc.
```

The "Out of Scope" section is the most important and most often skipped. Writing down what you're not building forces an honest conversation about scope before it becomes a crisis mid-project.

---

## Player Stories (User Stories Applied to Games)

User story format from agile: **"As a [user], I want to [action] so that [benefit]."**

Applied to games, the "user" is always the player (or a specific player type):

**Examples:**
- As a player, I want to be able to restart a level instantly after dying so that failure doesn't feel punishing.
- As a first-time player, I want the controls explained in-game so that I don't have to read external instructions.
- As a competitive player, I want to see my best score saved so that I have a reason to replay the level.
- As a player on mobile, I want large touch targets so that I don't mis-tap under pressure.
- As a player, I want the game to remember my progress so that I don't have to replay completed levels.

**Acceptance criteria:** Every story should have a concrete "done" condition.

> Story: As a player, I want to save my progress.
> Done when: Player can close the browser tab, reopen the game, and resume from the last checkpoint reached.

Player stories go in the GDD's functional requirements section. Each story maps to one or more specific features. During milestones, stories move from "planned" to "implemented" to "tested."

---

## Requirements Change: Handling Scope Creep

Sommerville: "The requirements for large software systems are always changing." This is even more true for games, because fun is discovered during development, not designed upfront.

**Why requirements change in game projects:**
1. You build the mechanic and realize it's not fun — the design assumption was wrong
2. A playtest reveals that players don't understand something you thought was obvious
3. A new idea seems more interesting than what was planned
4. Time pressure forces cutting features that seemed essential

**The scope creep trap:** Every new idea feels small. "It'll only take an hour." Individually, each addition might be true. Collectively, they push the deadline by weeks and leave the core unpolished.

**Sommerville's change management process, adapted for game dev:**

1. **Identify the change:** Write down exactly what you want to add or change. Make it concrete.
2. **Assess the cost:** How many hours will this actually take? What existing work does it touch or break?
3. **Assess the trade-off:** What gets cut or delayed to make room? (Time is fixed; scope is the variable.)
4. **Decide and document:** If you add it, update the GDD. If you cut something else, note what was cut and why.

**Practical rule:** Any feature not in the original GDD requires a team decision and a GDD update before work starts. "I'll just add it" is how projects ship unfinished.

**Distinguishing enduring from volatile requirements** (Sommerville's framing):
- **Enduring:** core mechanic, win/lose condition, player movement — these rarely change once they work
- **Volatile:** specific level layouts, enemy counts, UI colors, power-up details — expect these to change based on playtesting

Design volatile requirements loosely. Invest in making enduring requirements solid before expanding.

**Version your GDD.** When requirements change significantly, note the date and what changed. This gives you a record of why the game is different from the original concept — useful for post-mortems.

---

## Additions needed in game-dev-presets.md

Each of the five presets currently jumps from "game concept" directly into building. None has an explicit requirements/GDD phase with defined deliverables, acceptance criteria, or scope-lock. The additions below should be inserted into each preset as a named stage before the first build sprint/cycle/pass.

---

### Preset 1: "Game Sprint" — insert into Sprint 0

**Add to Sprint 0 deliverables:**

- Write a minimal GDD (sections 1–6 from the structure above): overview, core loop, feature list with MoSCoW labels, 5+ player stories, and explicit "Out of Scope" list
- Each backlog item must link to a player story or a MoSCoW-labeled requirement — no free-floating tasks
- Non-functional requirements documented: target platform, target fps, session length
- Team signs off: everyone reads the GDD and agrees it reflects what they're building

**Done condition for Sprint 0:** The GDD is written and every team member can answer "what are we building and what are we not building?" without disagreement.

---

### Preset 2: "Build Board" — insert into Setup (Day 1)

**Add to Setup:**

- Before creating feature cards, write a one-page GDD: pitch sentence, core loop description, 5–10 "The game shall..." statements labeled Must/Should/Could, and an Out of Scope list
- Each card on the board must correspond to a "The game shall..." statement — if a card doesn't map to a requirement, the requirement is missing or the card shouldn't exist
- Non-functional requirements become board constraints, not cards (e.g., "all features must work at 60fps before moving to Done")

**Done condition:** Board is populated only with cards traceable to written requirements.

---

### Preset 3: "Bet It" — insert into Shaping Week

**Add to Shaping Week process:**

- The one-paragraph pitch must include: who the player is, what they do each loop, win condition, and explicit scope boundary ("this bet does NOT include X")
- Player stories written for the bet: 3–5 stories covering the feature being shaped
- Acceptance criteria defined upfront: "this cycle is done when a first-time player can [X] without assistance"
- Rabbit holes section must include non-functional risks (e.g., "if the physics sim runs at <30fps on target hardware, the whole cycle fails — validate this first")

**Done condition:** Bet is accepted only when acceptance criteria are written, not just when the pitch sounds good.

---

### Preset 4: "Fast Loop" — insert into Concept (Day 1)

**Add to Concept stage:**

- The one sentence ("A game where the player does X and the challenge is Y") must be expanded to include: target player, platform, and one non-functional constraint (device, fps, or session length)
- Write 3 Must-have functional requirements and 2 explicit Won't-haves before starting the prototype
- The "riskiest assumption" identified must be written as a testable hypothesis: "We believe [mechanic] will be fun because [reason]. We will know this is true when a playtest observer sees a player attempt the mechanic twice without prompting."

**Done condition for Concept:** Hypothesis written and team agrees on what a "yes this is fun" result looks like before building anything.

---

### Preset 5: "Milestone Run" — expand Milestone 0

**Milestone 0 already has the strongest foundation. Strengthen it:**

- Pitch document must follow the minimal GDD structure: overview, core loop, functional requirements with MoSCoW labels, non-functional requirements, player stories (minimum 5), and Out of Scope list
- Acceptance criteria written for each subsequent milestone before Milestone 0 is signed off: "Milestone 1 is done when [X]. Milestone 2 is done when [Y]."
- Requirements change protocol agreed at Milestone 0: any feature added post-sign-off requires Lead Designer approval and a GDD update with a change note

**Done condition:** Milestone 0 is not complete until acceptance criteria exist for all four subsequent milestones.
