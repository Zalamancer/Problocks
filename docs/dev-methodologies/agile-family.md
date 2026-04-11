# The Agile Family

The Agile family shares a common origin: the 2001 Agile Manifesto, a one-page document signed by 17 software practitioners who were frustrated with heavy, plan-driven processes. They articulated four values and twelve principles that prioritize people, working software, and responsiveness over documentation and rigid plans.

The four core Agile values (Agile Manifesto, 2001):
1. **Individuals and interactions** over processes and tools
2. **Working software** over comprehensive documentation
3. **Customer collaboration** over contract negotiation
4. **Responding to change** over following a plan

The manifesto notes: "while there is value in the items on the right, we value the items on the left more."

Sommerville (Ch. 3) identifies five shared principles underlying all agile methods:

| Principle | Description |
|---|---|
| **Customer involvement** | Customers closely involved throughout; their role is to provide and prioritize new requirements and evaluate iterations |
| **Embrace change** | Expect requirements to change; design the system to accommodate changes |
| **Incremental delivery** | Software developed in increments; customer specifies requirements for each increment |
| **Maintain simplicity** | Focus on simplicity in both software and process; actively work to eliminate complexity |
| **People, not process** | Recognize and exploit team skills; leave members to develop their own ways of working |

Agile methods have been particularly successful for two kinds of development (Sommerville):
1. **Product development** — small or medium-sized product for sale; virtually all software products and apps are now developed using an agile approach
2. **Custom system development** within an organization where there is a clear commitment from the customer to be involved and there are few external stakeholders or regulations

Every methodology in this section either descends from the Agile Manifesto or is directly compatible with it. They differ in how prescriptive they are (Scrum defines specific roles and ceremonies; Kanban defines almost none), and how well they scale (Crystal scales by team size; SAFe by organizational level).

---

## 1. Agile (The General Framework)

**Description:** Agile is not a single methodology — it is a philosophy and a set of values. Teams that describe themselves as "doing Agile" are typically using one of the specific frameworks below (Scrum, Kanban, XP, etc.) but grounded in the shared Agile mindset: short feedback loops, working software over paperwork, and continuous adaptation.

### General Agile Lifecycle
1. **Concept** — define the product vision and initial feature set
2. **Inception** — form the team, establish the backlog, set up tools
3. **Iteration / Sprint** — 1–4 week loop: plan → build → test → demo
4. **Release** — deploy working software to users
5. **Maintenance** — support and improve the live product
6. **Retirement** — phase out the product or feature

### Cycle Length
Iterations: **1–4 weeks**, most commonly **2 weeks**.

### Iterative?
Yes. The iteration loop is the core mechanism. Agile teams cycle through plan–build–test–demo indefinitely.

### Team Size
**3–12 per team**. Scales via multiple teams (see SAFe, LeSS).

### What Makes It Unique
Agile is a mindset, not a recipe. It explicitly refuses to prescribe a single way of working, trusting teams to find their own optimal process. This is powerful for experienced practitioners and confusing for beginners — which is why Scrum (a concrete implementation) is so widely adopted.

### Real-World Use Cases
Best suited for product companies developing small to medium-sized products for sale, and for custom development with a committed, involved customer and few external regulatory constraints. Less suitable for embedded systems, large multi-team systems, or safety-critical software.

### Student Game Dev Translation
Students who "do Agile" should pick a specific framework (Scrum is recommended for its explicit structure). The Agile values themselves are immediately relevant: build something playable every 2 weeks, show it to real players, and be willing to cut or change features that don't work.

---

## 2. Scrum

**Description:** The most widely adopted Agile framework. Scrum organizes work into fixed-length iterations called **sprints** (1–4 weeks). Three roles define the team: the **Scrum Master** (facilitates the process), the **Product Owner** (owns the backlog and prioritizes value), and the **Developers** (build the product). Four ceremonies punctuate each sprint.

### Phases / Ceremonies (per sprint)
1. **Review work to be done** — assess the product backlog; Product Owner prioritizes items for the cycle
2. **Select items** — team selects highest-priority items from product backlog they believe can be completed
3. **Plan sprint** — create sprint backlog; team self-organizes to decide who works on what
4. **Sprint** — development iteration (2–4 weeks); daily Scrum meeting reviews progress and prioritizes work for that day; sprint is never extended for unfinished work — items return to product backlog
5. **Review sprint** — end-of-sprint meeting with two purposes: (1) process improvement — team reviews how it worked and reflects on how things could have been done better; (2) product input — provides input on the product state for the product backlog review preceding the next sprint

**Key artifacts:**
- **Product backlog** — the master "to do" list; may contain feature definitions, user stories, requirements, or supplementary tasks (e.g., architecture definition, user documentation)
- **Sprint backlog** — the subset of product backlog items committed for the current sprint
- **Potentially shippable product increment** — what each sprint produces; in a finished state requiring no further work to incorporate into the final product (in practice, not always achievable)
- **Velocity** — estimate of how much product backlog effort a team can cover in a single sprint; used to improve future estimates

**Note on Scrum terminology:** Scrum developers deliberately invented new terminology to distinguish their roles from conventional project management. The ScrumMaster is not a project manager in the conventional sense; in practice, however, ScrumMasters often take on project administration responsibilities.

### Cycle Length
One sprint = **1–4 weeks**. Industry surveys (State of Agile) show ~58% of teams use **2-week sprints**. 1-week sprints suit startups or new teams learning fast; 4-week sprints suit experienced teams with stable requirements.

### Iterative?
Yes. Sprints repeat indefinitely. Each sprint delivers a potentially shippable product increment.

### Team Size
**5–9 people per Scrum team** (Scrum Guide says 10 or fewer). Includes all roles (PO, SM, developers). Larger products use multiple Scrum teams coordinated through frameworks like LeSS or SAFe.

### What Makes It Unique
Scrum is the most prescribed of the Agile frameworks — it defines specific roles, artifacts (Product Backlog, Sprint Backlog, Increment), and ceremonies. This prescription is its strength for teams new to iterative development: there is a clear "right way" to run a sprint. It also makes team dysfunction visible: if backlog items consistently carry over between sprints, something is wrong with estimation, planning, or scope.

### Real-World Use Cases
Used by virtually every major software company: Spotify, Microsoft, Amazon, Salesforce. Dominant in product development teams of 5–50 people. Widely used in game studios (Bungie, Riot, Epic use Scrum-adjacent processes).

### Student Game Dev Translation
The most recommended methodology for student game teams (2–6 people). Each 2-week sprint delivers a new playable build. The daily standup keeps teammates accountable. The retrospective is where the team learns to self-improve. Roles: one student as Product Owner (game designer / vision holder), one as Scrum Master (keeps meetings running), all as developers.

---

## 3. Kanban

**Description:** Originating from Toyota's manufacturing production system (1940s), Kanban is a **continuous flow** method — not iterative. Work items are visualized on a board (columns = stages: To Do → In Progress → Review → Done) and the team limits how many items can be in any stage simultaneously (Work in Progress limits, or WIP limits). There are no sprints, no roles, no ceremonies mandated — only flow visualization and constraint.

### "Phases" (workflow stages, not time-bounded)
1. **Backlog / To Do** — all pending work
2. **Analysis / Ready** — requirements clarified, ready to start
3. **In Development** — actively being built
4. **Code Review / QA** — under review or testing
5. **Deploy / Done** — released or complete

These columns are team-defined and can be anything that reflects the actual workflow.

### Cycle Length
No fixed iterations. The key metric is **cycle time** — how long a single work item takes from "started" to "done." Kanban teams aim to reduce and stabilize cycle time through WIP limits. A typical software task: **1–5 days**. Cycle times vary by work type.

### Iterative?
Not in the sprint sense. Kanban is **continuous** — new work enters as old work exits. There is no sprint boundary, no planning ceremony, no retrospective requirement (though teams often adopt these practices anyway — see Scrumban).

### Team Size
Works at **any size**. Solo developers use Kanban effectively; support teams of 20 use it. WIP limits are typically set at 1–2 times the number of people in a stage.

### What Makes It Unique
Kanban is the only major methodology that doesn't impose a cadence. It respects that software work is unpredictable — new bugs and support requests can't be scheduled. Its WIP limit discipline forces teams to **finish before starting** new work, which dramatically reduces context-switching and partially-done work that adds no value. Kanban's core rule: if you can't pull new work, improve the system — don't just push more in.

### Real-World Use Cases
- Software support and maintenance teams (GitHub issues, customer bug queues)
- DevOps and infrastructure teams
- Solo indie game developers managing their own roadmap
- Marketing and content teams
- Operations teams managing unpredictable incoming work
- Startups before they have enough work to fill sprints

### Student Game Dev Translation
Best for solo developers or pairs. A student builds a personal Kanban board: their game's features flow from "Ideas" → "Building" → "Testing" → "Done." The WIP limit (don't start a new mechanic until you finish the one in progress) is the most directly applicable lesson — this is the #1 mistake beginning game developers make.

---

## 4. Scrumban

**Description:** A hybrid of Scrum and Kanban, initially designed as a transition path between the two. Teams retain Scrum's sprint structure and planning discipline while adding Kanban's WIP limits and continuous flow visualization. It has since evolved into its own mature methodology. Scrumban is ideal for teams that handle both planned feature work and unpredictable incoming work (bugs, support, client requests) simultaneously.

### Phases
- Optional time-boxed **sprints** (2–4 weeks), or pure continuous flow
- Kanban board for visual workflow
- **On-demand planning**: a planning session triggers when the "To Do" column drops below a set threshold — not on a fixed calendar
- WIP limits applied to each column
- Retrospectives as needed, not mandatory

### Cycle Length
Variable. Sprint-mode Scrumban: **2–4 week cycles**. Flow-mode Scrumban: no fixed cycle; planning happens when the queue empties.

### Iterative?
Hybrid. Optional sprint boundaries provide rhythm; Kanban flow allows continuous delivery between planned iterations.

### Team Size
No prescribed size. Scales from **solo to 20+**. Teams of 4–12 are most common.

### What Makes It Unique
Flexibility without chaos. Scrum is too rigid for support-heavy teams (you can't commit a sprint when production goes down mid-sprint). Kanban is too formless for teams that need planning discipline and stakeholder demos. Scrumban occupies the middle ground. It is also the least role-prescriptive: no Scrum Master or Product Owner are required, though they can exist.

### Real-World Use Cases
- SaaS product teams balancing new features with customer-reported bugs
- Agencies managing ongoing client retainers + new project work
- Game studios in early production (creative chaos) that need some structure
- Teams transitioning from Scrum toward a more flow-based system

### Student Game Dev Translation
Good for 2–4 student teams in the middle of a semester. Use a Kanban board for visibility; use light planning sessions before major milestones. WIP limits prevent the common trap of "everyone working on different things and nothing getting finished."

---

## 5. Extreme Programming (XP)

**Description:** Created by Kent Beck in the late 1990s on the Chrysler C3 payroll project, XP pushes software engineering best practices to their logical extreme — hence the name. If code review is good, review all the time (pair programming). If testing is good, test everything before you write it (TDD). If integration is good, integrate continuously (multiple times per day). XP is the most technically opinionated of all Agile methods.

### Release Cycle (Sommerville Fig. 3.3)
XP is organized around a release cycle — not separate weekly and quarterly loops. Each release cycle:
1. **Select user stories for this release** — customer selects stories from the story card pool
2. **Break stories into tasks** — development team decomposes stories into concrete tasks
3. **Plan release** — estimate effort and sequence tasks
4. **Develop/integrate/test software** — programmers work in pairs; all tests must pass before integration; several new versions may be developed, integrated, and tested in a single day
5. **Release software** — deliver the increment to the customer
6. **Evaluate system** — customer evaluates the release; new stories or changes feed back into the next cycle

### Cycle Length
A release cycle is typically **a few weeks** — short enough that new releases reach customers every 2–3 weeks.

### Iterative?
Yes — intensely so. The 1-week inner loop is the fastest iteration cadence of any mainstream methodology. New software is integrated and tested multiple times per day.

### Team Size
Best for **2–12 developers**. Pair programming (the signature XP practice) requires co-located pairs. Thoughtworks has scaled XP to ~60 people with distributed teams, but this is unusual.

### Key XP Practices (Sommerville Fig. 3.4)

| Practice | Description |
|---|---|
| **Collective ownership** | Pairs work on all areas of the system — no islands of expertise; any developer can change any code |
| **Continuous integration** | As soon as work on a task is complete, it is integrated into the whole system; all unit tests must pass after any integration |
| **Incremental planning** | Requirements recorded on story cards; stories included in a release are determined by time available and relative priority; developers break stories into tasks |
| **On-site customer** | A customer representative is available full time to the XP team; responsible for bringing requirements to the team for implementation |
| **Pair programming** | Developers work in pairs, checking each other's work; pairs are created dynamically so all team members work with each other |
| **Refactoring** | All developers are expected to refactor code continuously as soon as improvements are found; keeps code simple and maintainable |
| **Simple design** | Enough design to meet current requirements and no more |
| **Small releases** | The minimal useful set of functionality providing business value is developed first; frequent releases incrementally add functionality |
| **Sustainable pace** | Large amounts of overtime are not acceptable — the net effect is to reduce code quality and medium-term productivity |
| **Test-first development** | An automated unit test framework is used to write tests for new functionality *before* that functionality is implemented |

### What Makes It Unique
XP is the only methodology that mandates specific technical practices. While Scrum organizes the team and process, XP specifies *how to write code*. Sommerville notes that in practice, applying XP as originally proposed has proved more difficult than anticipated — it cannot be readily integrated with the management practices and culture of most businesses. As a result, companies often pick and choose XP practices that suit them, or use XP practices in conjunction with a management-focused method like Scrum.

Sommerville considers test-first development (TDD) one of the most important innovations in software engineering. Writing tests before code forces a clear relationship between requirements and implementation, forces ambiguities to be resolved before coding begins, and avoids "test-lag" (where implementation gets ahead of testing).

### Pair Programming (Sommerville)
Pairs are created dynamically — the same pair do not always program together. Formal studies show mixed results. With student volunteers, productivity with pair programming is comparable to two people working independently (Williams et al. 2000). With experienced programmers, there is a significant loss of productivity (Arisholm et al. 2007). However, pair programming supports collective ownership and the sharing of knowledge that reduces project risk when team members leave.

### Real-World Use Cases
- Thoughtworks (still uses XP)
- Pivotal Labs
- Teams using XP practices selectively within Scrum

### Student Game Dev Translation
XP practices are highly teachable in isolation even if the full methodology is heavy for students. Teaching moments: write a test for "player takes damage correctly" before writing the damage code; pair-program on the trickiest bug; integrate everyone's code to main branch daily. The biggest XP lesson for student games: don't add a feature until you need it — this directly prevents scope creep.

---

## 6. Crystal Methods

**Description:** Developed by Alistair Cockburn in the 1990s after studying dozens of projects. Crystal is not a single methodology but a **family**, with variants named by color: Crystal Clear (smallest teams), Crystal Yellow, Crystal Orange, Crystal Red. The color determines the methodology's weight — the larger and riskier the project, the "heavier" (more process, more documentation) the appropriate Crystal variant. The core principle: people and interactions are more important than process; tailor the process to fit the team, not the other way around.

### Crystal Family by Team Size

| Variant | Team Size | Project Duration | Release Cadence |
|---|---|---|---|
| **Crystal Clear** | 2–6 people | Months | 1–3 months |
| **Crystal Yellow** | 7–20 people | Months–1 year | 1–3 months |
| **Crystal Orange** | 21–40 people | 1–2 years | Every 3–4 months |
| **Crystal Red** | 41–80 people | Multi-year | Every 3–6 months |

### Core Phases (Crystal Clear / Yellow)
1. **Charter** — define the mission, team, and initial requirements
2. **Cycle** (iterative loop):
   - Reflection workshop (plan + retrospect)
   - Exploratory 360° (early ideas, architecture, prototypes)
   - Mini-iterations (1–2 week build cycles)
   - Integrating deliverable (working feature delivered)
3. **Wrap-up** — final testing, user acceptance, deployment

### Cycle Length
Delivery cycle: **1–3 months** (Clear/Yellow) or **3–4 months** (Orange). Within each delivery cycle, mini-iterations of **1–2 weeks**.

### Iterative?
Yes. Each delivery cycle is a full loop: plan → build → deliver → reflect → repeat.

### Team Size
See table above. Crystal is unique in explicitly selecting a methodology variant based on team size.

### What Makes It Unique
Crystal is the most **human-centered** methodology. Cockburn's research found that the single biggest predictor of project success was team communication and trust — not tools or process. Crystal Clear in particular is notable for its "osmotic communication" principle: team members learn by overhearing each other, which requires co-location or very active async communication. Crystal also explicitly considers project criticality (losing comfort vs. losing money vs. losing life) when selecting how much process to apply.

### Real-World Use Cases
- Small software consultancies
- In-house development teams in larger organizations
- Teams that tried Scrum and found it too rigid
- Research and prototyping teams
- Any team that wants a lightweight framework they can own and adapt

### Student Game Dev Translation
Crystal Clear is an excellent fit for 2–4 student teams. The principle of "deliver something usable every 1–3 months" matches a semester structure. The emphasis on communication over ceremony suits student teams who already talk daily. The "reflect and adapt" principle teaches metacognition about the development process itself — students learn not just how to make games but how to make teams work.

---

## 7. Feature-Driven Development (FDD)

**Description:** Developed by Jeff De Luca in 1997 for a 50-person bank software project in Singapore. FDD is a model-driven, short-iteration process organized around **features** — small, client-valued functions described in the form "action the result by object" (e.g. "calculate the total of a shopping cart"). The key insight is that large projects become manageable when broken into features that can be estimated, assigned, and built in 1–2 days each.

### Phases
FDD has five processes; the first two are sequential (done once per project), the last three repeat per feature:

1. **Develop an Overall Model** — domain experts and developers build a high-level object model of the system. Collaborative workshops. (~1–2 weeks)
2. **Build a Features List** — identify all features as short function descriptions. Organized into feature sets and subject areas. (~1 week)
3. **Plan by Feature** — sequence and assign features to development teams based on priority and dependencies. (~1 week)
4. **Design by Feature** *(iterates per feature)* — create sequence diagrams, detailed object models
5. **Build by Feature** *(iterates per feature)* — implement, unit test, integrate, code review

### Cycle Length
Each feature: **1–2 days** to design and build. Feature sets: **1–2 weeks**. Project milestones are tracked by percentage of features at each of six milestone stages (domain walkthrough, design, design inspection, code, code inspection, promote to build).

### Iterative?
Yes — the design-and-build cycle repeats per feature. The first three phases are run once.

### Team Size
Originally designed for **20–50+ developers** in organized feature teams of **3–5 people** each. Small teams under 10 people usually get more value from Scrum or XP.

### What Makes It Unique
FDD is the only Agile method with an explicit, upfront domain modeling phase. The object model is not treated as throwaway documentation — it's a shared language that enables large teams to stay aligned while working independently on different features. Progress is tracked in granular six-stage milestones per feature, giving managers real visibility on a project with hundreds of concurrent work items.

### Real-World Use Cases
- Large Singapore bank (the original project: 50 people, 15 months)
- Enterprise financial software
- Insurance and banking systems with complex domain rules
- Large-scale data management applications
- Any project with 20+ developers and a complex domain model

### Student Game Dev Translation
FDD is heavy for student projects (most game teams are under 10 people). However, the "features list as the plan" concept is extremely useful: instead of vague goals like "make the combat system good," write features as "calculate damage dealt to enemy by player sword attack" and "display health bar when player is hit." Breaking game design into atomic features makes progress measurable and planning concrete.

---

## 8. DSDM (Dynamic Systems Development Method)

**Description:** Developed in 1994 by a consortium of UK practitioners as an Agile framework specifically designed to satisfy business and enterprise governance requirements. DSDM predates the Agile Manifesto but shares its values. It is organized around **timeboxes** (fixed time, fixed budget — scope is the variable) and **MoSCoW prioritization** (Must have, Should have, Could have, Won't have). DSDM is one of the few Agile methods that integrates formal project governance, making it popular in regulated or public-sector environments.

### Lifecycle Phases
1. **Pre-Project** — ensure the project is worth doing before it starts
2. **Feasibility** — quick assessment (weeks) of technical and business viability
3. **Foundations** — establish project scope, risks, architecture, and team (2–4 weeks)
4. **Evolutionary Development** *(iterates)*:
   - Exploration iteration — understand requirements in depth
   - Engineering iteration — build and test to production quality
5. **Deployment** — release to live environment; user acceptance
6. **Post-Project** — review benefits; assess alignment with business goals

### MoSCoW Prioritization
Before each timebox, all requirements are labeled:
- **Must have**: non-negotiable; project fails without these
- **Should have**: important but not critical; include if possible
- **Could have**: nice-to-have; include if time allows
- **Won't have**: explicitly out of scope for this timebox

If the timebox runs short, Could have and Should have items are dropped — time and budget are fixed.

### Cycle Length
Foundation phase: **2–4 weeks**. Each development timebox: **2–6 weeks** (never more). Full project: **months to 1–2 years**.

### Iterative?
Yes — evolutionary development repeats until the system is ready. Each timebox is a self-contained development cycle.

### Team Size
Teams of **4–8 per timebox team**. Multiple teams can run in parallel for larger projects.

### What Makes It Unique
DSDM is the most governance-friendly Agile framework. It satisfies the need for audit trails, formal phase gates, and documented business cases while remaining genuinely iterative. It's also uniquely explicit about the constraint inversion: time is the constant, scope is the variable — the opposite of most non-Agile delivery contracts.

### Real-World Use Cases
- UK government and public sector IT projects
- Financial services companies with compliance obligations
- Organizations that need Agile within a PRINCE2 or PMI governance structure
- Enterprise system upgrades with regulated deliverables

### Student Game Dev Translation
MoSCoW prioritization is DSDM's most teachable concept for students. Before each game milestone, students explicitly label every planned feature: Must have (the game is broken without it), Should have (core experience, high priority), Could have (polish), Won't have (cut for now). This practice directly combats scope creep — the leading killer of student game projects.

---

## 9. SAFe (Scaled Agile Framework)

**Description:** SAFe is a comprehensive, enterprise-scale Agile framework for coordinating dozens to hundreds of teams working on a shared product or platform. Where Scrum governs a single team, SAFe governs an entire organization's product delivery across three levels: Team (Scrum), Program (Agile Release Train), and Portfolio (strategic themes and value streams). SAFe includes its own PI (Program Increment) planning event — a 2-day face-to-face ceremony where all teams align on goals for the next 8–12 weeks.

### Levels and Phases

**Team Level (Scrum/Kanban):**
- Standard 2-week sprints with Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective

**Program Level (Agile Release Train / ART):**
1. **PI Planning** — 2-day event at the start of each 8–12 week increment; all teams plan together
2. **Iterations 1–4** — 2-week sprints, all teams building toward shared PI Objectives
3. **Iteration 5 (Innovation & Planning / IP)** — dedicated to: innovation spikes, team training, architectural debt, PI retrospective, and planning the next PI

**Portfolio Level:**
- Strategic investment themes, Epic backlog, Lean budgeting
- Portfolio Kanban for large-scale epics

### Cycle Length
**PI (Program Increment)**: **8–12 weeks**, consisting of 4–5 development sprints + 1 IP sprint. This is the primary planning cadence. A year typically contains **4 PIs**.

### Iterative?
Yes — at every level. Sprints iterate weekly; PIs iterate quarterly; portfolio strategy iterates annually.

### Team Size
- Agile team: **5–11 people**
- ART (Agile Release Train): **50–125 people**, comprising 5–15 Agile teams
- Solution Train (full enterprise): can scale to 500+ people

### What Makes It Unique
SAFe is the only framework designed from the ground up for enterprises that cannot fit in a single Scrum team. It provides a full vocabulary and ceremony set for aligning multiple teams: ARTs, PI Objectives, system demos, inspect-and-adapt workshops, and release trains. Critics note that SAFe can become bureaucratic and heavy if adopted without discipline ("big process theater").

### Real-World Use Cases
- Major banks (JPMorgan Chase, Barclays)
- Insurance companies
- Telecom providers (AT&T, Lumen)
- Healthcare IT systems
- Government digital transformation programs
- Any organization with 50+ developers needing coordinated delivery

### Student Game Dev Translation
SAFe is not appropriate for student projects — it's designed for organizations of 50–500 people. However, the **PI Planning concept** is useful as a semester planning template: at the start of each major milestone period, the team writes specific objectives with acceptance criteria and explicitly identifies risks. The idea that all work should have a stated "PI Objective" (outcome, not just a task list) is a habit worth building early.

---

## Practical Problems with Agile Methods (Sommerville §3.4)

Agile methods are highly effective for product development and co-located small teams. Sommerville identifies three categories of practical problem for large, long-lifetime systems:

### 1. Contractual issues
When development uses an outside organization, a contract requires a software requirements document. Because interleaved requirements and code is fundamental to agile, there is no definitive statement of requirements to include in the contract. Agile contracts rely on the customer paying for time rather than for a specific set of requirements — which can create disputes if problems arise.

### 2. Maintenance problems
Three issues arise when maintaining agile-developed systems:
- **Lack of product documentation** — agile methods argue readable code is sufficient, but the system requirements document is the most important document for understanding the impact of proposed changes; without it, maintenance is more difficult and expensive
- **Keeping customers involved** — customers can justify involvement during development but are less likely to stay engaged during maintenance; alternative mechanisms (change proposals) are needed
- **Development team continuity** — agile relies on implicit team knowledge; when the team breaks up, that knowledge is lost and it is difficult for new members to build the same understanding

### 3. Scaling problems
Agile methods were designed for small co-located teams. Large systems present six complicating factors (Sommerville Fig. 3.13):
- Systems of systems (separate teams, different locations)
- Brownfield development (interaction with many existing systems)
- System configuration (not incremental code development)
- Regulatory constraints (external rules limiting development approach)
- Prolonged procurement and development time
- Diverse stakeholders

**Adaptations required for large-scale agile** (e.g., multi-team Scrum):
- Some upfront requirements engineering is essential — needed for contracts and to identify parts for different teams
- More than one Product Owner / customer representative
- More upfront design and system documentation (software architecture, database schemas, work breakdown)
- Cross-team communication mechanisms (regular calls, wikis, instant messaging)
- Frequent system builds and configuration management tools (continuous integration is impractical when many separate programs must be integrated)
