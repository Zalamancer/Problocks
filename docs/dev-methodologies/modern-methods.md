# Modern and Specialized Methods

These methodologies emerged from the 2000s onward, often in response to specific failure modes of earlier approaches — Agile adoption becoming bureaucratic, ops and dev remaining siloed, or two-week sprints feeling too slow for product decision-making. They represent the leading edge of how software teams organize work today.

---

## 1. Shape Up (Basecamp)

**Description:** Invented at Basecamp and documented in Ryan Singer's free book *Shape Up* (2019). Shape Up emerged from a specific frustration: teams doing Scrum felt trapped on an endless sprint treadmill — shipping small increments but never finishing "real" work. Shape Up introduces a different rhythm: longer focused cycles with actual appetite for each project, preceded by a shaping phase where product leadership does exploratory design work *before* any commitment is made.

### Phases

**Shaping (happens before the cycle, by senior product/design):**
1. **Set the appetite** — how much time is this idea worth? 2 weeks or 6 weeks? This is not an estimate; it's a budget decision.
2. **Rough solution** — sketch a rough design (wireframes, fat marker sketches) that fits within the appetite
3. **Find the holes** — identify rabbit holes, technical unknowns, and edge cases that could derail the team
4. **Write the pitch** — document the shaped work: problem, appetite, solution, rabbit holes, no-gos

**Betting (the decision meeting, 1–2 hours):**
5. **Betting Table** — senior leadership reviews pitches and decides what to build next cycle. No backlog voting; it's a deliberate bet.

**Building (the 6-week cycle):**
6. **Assign team** — 1 designer + 1–2 programmers get the hill chart and full autonomy
7. **Build and discover** — team scopes the work themselves, builds and tests, figures out implementation details
8. **Track via Hill Chart** — progress shown as position on a hill (uphill = figuring it out; downhill = building it)
9. **Ship by the end** — the 6-week budget is the hard deadline; if the work isn't done, it's either reshaped or dropped, never "carried over"

**Cooldown (2 weeks between cycles):**
10. Bug fixes, exploration, small improvements, personal projects
11. Shaping work for the next cycle happens here

### Cycle Length
**6-week building cycle + 2-week cooldown = 8 weeks total**. A year contains ~6 full cycles. Smaller "small batch" projects may use **2-week cycles** (multiple small batches per cooldown period).

### Iterative?
Yes — cycles repeat. However, Shape Up explicitly rejects the sprint model of "partial work that continues into the next sprint." Each shaped project must be fully shipped within its 6-week window. If it isn't, the project does not automatically continue — it goes back to shaping.

### Team Size
**1 designer + 1–2 programmers per project**. Extremely small, focused teams. The Betting Table at Basecamp included 4 people (CEO, CTO, senior programmer, product strategist).

### What Makes It Unique
Three things distinguish Shape Up from all other methodologies:

1. **Appetite, not estimates**: instead of estimating how long something will take and then being wrong, Shape Up asks "how much are we willing to spend on this?" and shapes the solution to fit. This is a philosophical reversal.

2. **Shaping is pre-work, not backlog grooming**: the team never receives a vague ticket to figure out. By the time a pitch reaches the building phase, a senior person has already done the exploratory design work and identified the hard problems.

3. **No backlog**: features that don't get bet on simply don't happen. There is no pile of debt. The Betting Table meets fresh each cycle with new pitches; old pitches that weren't bet on are not automatically carried forward — they must be re-pitched.

### Real-World Use Cases
- Basecamp (invented here, still in use)
- Product teams at medium-sized SaaS companies (e.g., Notion, HEY, Linear)
- Design-led product studios
- Teams where product quality and craft matter more than raw throughput
- Companies frustrated with sprint treadmills and sprint carryover

### Student Game Dev Translation
Shape Up maps excellently to semester-long game projects. A 6-week cycle = one major milestone. The **appetite concept** is directly usable: "we have 2 weeks for the combat system — what can we build that's worth 2 weeks?" This prevents over-engineering. The **Hill Chart** concept helps students reflect on whether they understand a problem yet or are still figuring it out. The **no carryover rule** teaches prioritization by consequence — if the mechanic isn't done by the demo day, it doesn't ship.

---

## 2. Lean Software Development

**Description:** Adapted from the Toyota Production System by Mary and Tom Poppendieck (book: *Lean Software Development*, 2003). Lean is a philosophy and value system more than a prescriptive methodology. It identifies seven types of waste in software development and provides seven principles for eliminating them. Lean is the intellectual parent of Kanban in software and heavily influenced the Agile Manifesto.

### The Seven Lean Principles

1. **Eliminate Waste** — anything that doesn't deliver value to the customer is waste. In software: unnecessary code, excessive documentation, waiting, partially done work, task switching, defects, unused features.
2. **Amplify Learning** — software development is a discovery process. Build feedback loops: short iterations, TDD, retrospectives. Don't decide early what you don't yet know.
3. **Decide as Late as Possible** — delay irreversible decisions until you have more information. Avoid premature commitment.
4. **Deliver as Fast as Possible** — compress cycle time to get feedback faster. Fast delivery ≠ sloppy; it means reducing delays, queues, and handoffs.
5. **Empower the Team** — people doing the work know best how to do it. Eliminate management bottlenecks; build trust.
6. **Build Quality In** — quality is not a testing phase; it must be embedded in the development process via TDD, pair programming, code review.
7. **See the Whole** — optimize the whole system, not local sub-systems. Don't make one stage faster if it creates a bottleneck elsewhere.

### The Seven Wastes (mapped to software)

| Lean Manufacturing Waste | Software Equivalent |
|---|---|
| Inventory | Partially done work, feature branches not merged |
| Overproduction | Features built but never used |
| Extra processing | Unnecessary documentation, meetings, approvals |
| Transportation | Handoffs between teams, long review queues |
| Waiting | Build times, approval gates, blocked tickets |
| Motion | Context switching between projects |
| Defects | Bugs, technical debt, rework |

### Phases / Cycle
Lean has no prescribed phases. It is applied as an overlay on an existing delivery process. Teams practicing Lean typically:
1. Map their current value stream (visualize all work and handoffs)
2. Identify wastes in the current flow
3. Implement changes to remove waste
4. Measure cycle time and throughput
5. Repeat continuously

### Cycle Length
Lean is continuous. Improvement cycles (kaizen events) can be as short as **1 day** or as long as a **quarterly retrospective**.

### Iterative?
Continuous improvement by definition.

### Team Size
Works at any scale. Toyota applies it to factories of thousands. In software, Lean principles are most directly applied to teams of **4–20**.

### What Makes It Unique
Lean is the only methodology that explicitly names waste and provides a conceptual vocabulary for talking about it. The "seven wastes" give teams language to critique their own process: "this two-week code review queue is a transportation waste — how do we fix it?" It also uniquely emphasizes the whole system over local optimization — a principle that is routinely violated in software (optimize developer output; ignore the testing bottleneck).

### Real-World Use Cases
- Toyota (origin)
- Spotify's engineering culture
- Amazon's DevOps practices
- Any mature engineering organization doing continuous delivery
- Financial services companies streamlining their software pipeline
- Teams measuring DORA metrics (deployment frequency, lead time, change failure rate)

### Student Game Dev Translation
Students can apply Lean immediately as a retrospective tool. After each milestone: "what was our biggest waste this sprint?" Common answers from game dev students: partially-done art assets sitting unused, features built but cut at the last minute, waiting for feedback from the team before continuing. The waste vocabulary makes process problems discussable and fixable.

---

## 3. DevOps

**Description:** DevOps is both a cultural philosophy and a technical practice set that breaks down the wall between software **development** (Dev) and IT **operations** (Ops). Historically, developers wrote software and "threw it over the wall" to operations to deploy and maintain — two teams with different incentives, tools, and languages. DevOps merges these functions through automation (CI/CD pipelines), shared responsibility, and a continuous feedback loop from production back to development.

The DevOps lifecycle is often depicted as an infinity loop (∞): the left half is development activities, the right half is operations activities, and they feed into each other continuously.

### The DevOps Lifecycle Phases

**Development side:**
1. **Plan** — define work items, requirements, features (often using Scrum or Kanban)
2. **Code** — write code in short-lived feature branches
3. **Build** — automated compilation, dependency resolution, artifact generation
4. **Test** — automated unit, integration, and security tests run on every commit

**Operations side:**
5. **Release** — version the artifact; trigger deployment pipeline
6. **Deploy** — automated deployment to staging, then production
7. **Operate** — run, monitor, scale the live system
8. **Monitor** — collect metrics, logs, alerts; feed insights back to Plan

The loop is continuous — monitoring insights create new planning items, which feed new code, which is automatically tested and deployed.

### Key Practices

- **Continuous Integration (CI)**: developers merge code to a shared branch multiple times per day; automated tests run on every merge
- **Continuous Delivery (CD)**: every code change that passes tests can be deployed to production at any time
- **Continuous Deployment**: every code change that passes tests *is* automatically deployed to production (no human gate)
- **Infrastructure as Code (IaC)**: infrastructure defined in version-controlled scripts (Terraform, Ansible)
- **Feature flags**: deploy code "off" and turn features on for specific users without re-deploying
- **Observability**: logs, metrics, traces give teams visibility into production behavior
- **Blameless post-mortems**: when things break, focus on system improvement, not individual blame

### Cycle Length
DevOps aims for **multiple deployments per day** in mature implementations. The "Four Keys" DORA metrics measure DevOps maturity: deployment frequency, lead time for changes, change failure rate, and time to restore service. Elite teams deploy on demand and restore service in under one hour.

### Iterative?
Continuous. There is no sprint, cycle, or phase boundary — the loop runs perpetually.

### Team Size
DevOps is usually implemented by **full-stack or cross-functional product teams** of 5–15 people with ownership over their entire stack (dev, deploy, operate). Large organizations have platform/SRE teams that provide internal tooling.

### What Makes It Unique
DevOps is the only methodology that extends past software delivery to include *operating* what was built. All other methodologies treat "deploy" as the endpoint; DevOps treats it as the middle of the loop. The cultural shift required is significant: developers must care about production reliability; operations must participate in design decisions. This shared ownership produces dramatically better outcomes — Google, Amazon, and Netflix credit their reliability and velocity to DevOps practices.

### Real-World Use Cases
- Every major cloud-native company (AWS, Google, Netflix, Stripe, GitHub)
- SaaS products with continuous delivery pipelines
- E-commerce platforms requiring zero-downtime deployments
- Financial services with automated compliance checks in the pipeline
- Any team deploying more than once per week

### Student Game Dev Translation
Full DevOps (CI/CD pipeline, IaC, observability) is overkill for a student game project. However, two DevOps practices are immediately applicable:
1. **Automated build**: set up a GitHub Action that builds the game on every push — students know if they broke the build within minutes, not at the next team meeting.
2. **Deployment**: use tools like itch.io, Netlify, or the Problocks marketplace to ship a playable build automatically. The habit of "every push is a potential release" changes how students think about code quality.

---

## 4. RAD (Rapid Application Development)

**Description:** Developed by James Martin in the early 1990s as a reaction to Waterfall's long development cycles and tendency to deliver software that no longer matched user needs after 2+ years. RAD compresses the full development cycle into **60–90 days** by combining early user involvement (Joint Application Development sessions), rapid prototyping, and code-generation tools. The emphasis is on user-driven design: users are partners in creating prototypes, not just recipients of requirements documents.

### Phases

1. **Requirements Planning** (~2 weeks)
   - Developers, users, and management define system goals
   - High-level requirements and constraints established
   - Technical feasibility confirmed

2. **User Design** (~4–6 weeks)
   - Users work directly with developers in JAD (Joint Application Development) workshops
   - Develop detailed prototypes representing system processes, inputs, outputs
   - Iterate on prototypes until users confirm the design is correct
   - Weekly or bi-weekly prototype review sessions

3. **Rapid Construction** (~2–4 weeks)
   - Build the actual system using rapid development tools (low-code platforms, code generators, component libraries)
   - Bug fixes and minor refinements happen simultaneously
   - Focus on speed: use existing frameworks, templates, and generators aggressively

4. **Cutover / Transition** (~1–2 weeks)
   - System and integration testing
   - User acceptance testing
   - Data migration (if replacing an existing system)
   - Training and go-live

### Cycle Length
Total: **60–90 days** for a mid-complexity business application. This was revolutionary compared to 18–24 month Waterfall projects.

### Iterative?
Hybrid. The User Design phase iterates on prototypes rapidly. The overall lifecycle is linear (phases don't repeat), but within User Design the prototype–review–refine loop runs multiple times.

### Team Size
**Small, focused teams of 4–10**. RAD breaks larger projects into parallel component-based workstreams handled by separate small teams (called RAD teams), each building a piece of the system simultaneously.

### What Makes It Unique
RAD was the first methodology to treat users as co-designers rather than requirement sources. The JAD workshop concept — getting developers and users in the same room prototyping together — predates modern UX research by decades. RAD also introduced the idea of deliberately constraining scope to meet a time box, which became a core Agile principle. Modern low-code/no-code platforms are essentially the embodiment of RAD's original vision.

### Real-World Use Cases
- Business process automation tools
- Internal enterprise dashboards and reporting systems
- Form-heavy business applications (insurance claims, HR systems)
- Government agency internal tooling
- Replacement of legacy systems where user processes are well-understood
- Any project where "good enough quickly" beats "perfect eventually"

### Student Game Dev Translation
RAD's philosophy directly matches game jam development: rapid prototyping, user (player) feedback integrated early, tools used aggressively to build quickly. A student game team can run a "RAD sprint" — a focused 2–3 week intensive where they prototype a core mechanic, get 3–5 peers to play it, and rebuild based on what they learned. The "use your tools" principle means: use the game engine's built-in physics, use existing asset packs, use pre-made audio — building everything from scratch is the enemy of rapid delivery.

---

## 5. Rational Unified Process (RUP) / OpenUP

**Description:** RUP was developed by Rational Software (later acquired by IBM) in the late 1990s and published as a comprehensive, customizable software development process framework. It organizes work into four sequential **phases** (Inception, Elaboration, Construction, Transition) and six **disciplines** (Business Modeling, Requirements, Analysis & Design, Implementation, Test, Deployment), where all disciplines are active in all phases but with different emphasis. It is iterative within each phase. **OpenUP** is the streamlined, open-source public-domain version released by IBM in 2006.

### Phases

1. **Inception** (~10–20% of project duration)
   - Define scope and business case
   - Identify major risks
   - Estimate feasibility
   - Deliverable: vision document, initial risk list

2. **Elaboration** (~25–35%)
   - Baseline the architecture
   - Address highest-priority risks through executable architecture
   - Refine requirements
   - Deliverable: architectural prototype, risk mitigation plan

3. **Construction** (~40–50%)
   - Build the product incrementally
   - Iterative development (2–6 week iterations)
   - Integration and testing
   - Deliverable: working software ready for beta

4. **Transition** (~10–15%)
   - Beta testing and user feedback
   - Bug fixing, performance tuning
   - Training and deployment
   - Deliverable: final released product

Within each phase, work runs in **iterations** (2–6 weeks each). The emphasis of disciplines shifts across phases: Inception emphasizes Requirements; Construction emphasizes Implementation and Test.

### Cycle Length
Overall project: **6 months to 2+ years**. Each iteration: **2–6 weeks**.

### Iterative?
Yes — within phases. Phases are sequential; iterations within each phase are iterative.

### Team Size
Designed for **medium to large teams** (10–50+). RUP defines specific roles (Architect, Developer, Tester, Business Analyst, Project Manager, etc.) which presupposes sufficient team size to staff them. OpenUP is scaled down for teams of 3–10.

### What Makes It Unique
RUP is unique in treating software development as a **configurable process**. Unlike Scrum (which prescribes specific ceremonies) or Waterfall (which prescribes a specific phase sequence), RUP provides a large library of roles, artifacts, and workflows from which each project selects a subset. This makes RUP highly adaptable but also difficult to implement — teams frequently either adopt too much (drowning in artifacts) or too little (getting no value from the framework).

The architecture-first emphasis is a key differentiator: Elaboration's goal is to reduce architectural risk before significant Construction investment begins. This makes RUP well-suited to novel technical domains where architecture choices have long-term consequences.

### Real-World Use Cases
- IBM internal software projects
- Defense and aerospace software (where the documentation model suits contract requirements)
- Enterprise application development (especially Java-ecosystem)
- Projects where architecture is complex and must be validated early
- Universities teaching software engineering (RUP is widely studied academically)

### Student Game Dev Translation
RUP's phase structure (Inception → Elaboration → Construction → Transition) maps surprisingly well to a game project:
- Inception: define the game concept, identify the riskiest mechanic
- Elaboration: prototype the core gameplay loop, prove the engine can do what you need
- Construction: build all features iteratively
- Transition: playtest, polish, publish

The key RUP lesson for game students: **establish your architecture (engine, renderer, input system) before building content**. Many student games fail because fundamental technical decisions (we'll just add multiplayer later) can't be undone partway through.

---

## 6. Disciplined Agile Delivery (DAD)

**Description:** Developed by Scott Ambler and Mark Lines, acquired by PMI (Project Management Institute) in 2019. DAD is a "meta-framework" — it doesn't define *one* way of working but instead provides a toolkit of practices from Scrum, Kanban, XP, SAFe, LeSS, Lean Startup, and others, and a goal-driven decision process for choosing which practices fit a given team's situation. The core idea is that no single process fits all teams, projects, or organizational contexts — but there are proven patterns for making good process choices.

### Phases
1. **Inception** (~1–4 weeks)
   - Form the team, establish vision
   - Initial architecture and risk assessment
   - Identify stakeholders and release strategy
2. **Construction** (iterative, bulk of the project)
   - Short iterations (1–4 weeks, team's choice)
   - Incrementally build and integrate the solution
   - Continuous improvement of team Way of Working (WoW)
3. **Transition** (~1–4 weeks)
   - Final testing, deployment, documentation
   - Handover to operations or support team

### Cycle Length
Highly variable — DAD adapts to the team. Construction iterations: **1–4 weeks** (team chooses). Full project: **months to years**.

### Iterative?
Yes — Construction iterations are iterative. DAD's Kaizen philosophy also applies iterative improvement to the team's process itself.

### Team Size
Explicitly context-sensitive. DAD supports:
- **Small teams** (3–5): use lighter, fewer practices
- **Large teams** (10–30): use more structured coordination
- **Enterprise** (100+): combine with SAFe or LeSS at scale

### What Makes It Unique
DAD's unique contribution is the **goal-driven approach to process selection**. Instead of prescribing "always have a daily standup" or "always run 2-week sprints," DAD asks: what are you trying to achieve? Then provides a decision tree of practices proven to achieve that goal. For example: "Goal: improve code quality" → options: pair programming, TDD, code reviews, mob programming — each with its tradeoffs documented.

### Real-World Use Cases
- PMI-affiliated organizations already using PMP/PMI frameworks
- Large enterprises that want Agile but can't commit to SAFe's full overhead
- Teams wanting to formally compare and choose between Scrum, Kanban, XP, etc.
- Organizations that have tried one Agile methodology and found it didn't fit

### Student Game Dev Translation
DAD's goal-driven practice selection is a useful meta-skill for advanced students: "given our team situation (3 people, 8 weeks, first game project), which practices from all the methodologies we've learned should we actually use?" This builds process literacy, not just process following.
