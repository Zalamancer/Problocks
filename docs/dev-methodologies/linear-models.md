# Linear and Plan-Driven Models

These methodologies move through defined phases in a structured sequence. Some are strictly one-pass (Waterfall, V-Model); others allow limited iteration or staged delivery (Incremental, Spiral). What they share is an emphasis on upfront planning and documentation, with change being expensive once a phase is complete.

---

## 1. Waterfall Model

**Description:** The original sequential SDLC, derived from engineering process models used in large military systems (Royce 1970). It represents the fundamental software development activities as separate phases with each phase producing a document or artifact that is "signed off" before the next phase begins. The cascade from one phase to another gives the model its name.

### Phases (in order)
1. **Requirements analysis and definition** — System services, constraints, and goals are established by consultation with users; defined in detail as a system specification
2. **System and software design** — Allocates requirements to hardware or software; establishes overall system architecture and identifies fundamental software abstractions and relationships
3. **Implementation and unit testing** — The design is realized as programs or program units; unit testing verifies each unit meets its specification
4. **Integration and system testing** — Individual units are integrated and tested as a complete system to ensure requirements are met; the system is then delivered to the customer
5. **Operation and maintenance** — Normally the longest phase; the system is installed and put into practical use; maintenance corrects errors, improves implementation units, and enhances services as new requirements emerge

### Cycle Length
A complete Waterfall project typically runs **3 months to several years**. Time is distributed roughly as: 20–40% on requirements + design, 30–40% on coding, and the remainder on testing and deployment. There is no cycle — it's a single linear pass.

### Iterative?
No. Strictly linear. Once a phase is signed off, revisiting it formally requires a change control process.

### Team Size
Works at any scale, but was designed for large teams (10–100+) with specialist roles for each phase — business analysts, architects, developers, testers — each handing off to the next.

### What Makes It Unique
Every phase produces detailed documentation that is reviewed and approved before the next phase starts. In principle, phases do not overlap. In practice, stages overlap and feed back into each other — during design, requirements problems are found; during coding, design problems emerge. The software process is never a simple linear model in practice, and feedback from one phase to another is common. A real risk is that both customers and developers prematurely "freeze" the specification to avoid expensive change — leading to requirements that don't reflect what users actually need.

An important variant is **formal system development**, where a mathematical model of the specification is refined using mathematical transformations into executable code. Used only for critical systems with stringent safety, reliability, or security requirements (e.g., the B method).

### When Waterfall Is Appropriate (Sommerville)
Waterfall is only appropriate for certain types of system:
1. **Embedded systems** where software must interface with hardware — hardware inflexibility means software decisions cannot be delayed
2. **Critical systems** requiring extensive safety and security analysis of specification and design — complete documents are necessary for this analysis; safety problems in spec/design are very expensive to fix at implementation
3. **Large systems developed by multiple partner companies** — complete specifications allow independent development of subsystems; a common model for hardware and software is needed

Waterfall is the wrong choice when informal team communication is possible and requirements change quickly.

### Real-World Use Cases
- Embedded systems for automotive, aerospace, or medical devices
- Safety-critical and security-critical systems (avionics, railway signaling)
- Large multi-organization projects requiring complete interface specifications
- Regulated environments requiring detailed audit trails (FDA, DoD)

### Student Game Dev Translation
Waterfall suits a student game project where the concept is fully defined at the start and won't change — a school assignment with a fixed brief, for example. Students write a design document first, build to spec, test against that doc, and submit. It teaches documentation discipline but can feel frustrating if the game idea evolves.

---

## 2. V-Model (Verification and Validation Model)

**Description:** The V-Model is a representation of the plan-driven waterfall testing process, not a separate methodology. Sommerville presents it as an illustration of how test plans are the link between testing and development activities in a plan-driven process (Figure 2.7 in Sommerville Ch. 2). "Turn the V on its side and you see the V." It makes explicit that test planning for each development phase should occur in parallel with that phase — not after it.

### Phases
**Left side — development (descending):**
1. **Requirements specification** ↔ Customer test plan
2. **System specification** ↔ System integration test plan
3. **System design** ↔ Sub-system integration test plan
4. **Component design** ↔ Component code and test

**Right side — test execution (ascending):**
5. **Component code and test**
6. **Sub-system integration test**
7. **System integration test**
8. **Customer test** → Service

### Cycle Length
Similar to Waterfall: **months to years**. The key difference is that test planning begins in parallel with design, so the testing phases move faster when they arrive.

### Iterative?
No. Still fundamentally linear, though defects found during testing can trigger targeted rework on the corresponding left-side phase.

### Team Size
Best for **medium to large teams** (10–50+) with dedicated QA roles. The explicit test planning requires dedicated testing engineers involved from day one.

### What Makes It Unique
The V-shape forces teams to think about "how will we know this works?" at the same time they define what the system needs to do. Test criteria are defined before coding begins. In plan-driven regulated processes this creates a traceable audit trail from requirement to test result. Sommerville notes that beta testing — delivering to a number of potential customers who agree to use the system and report problems — is used when the system is marketed as a software product.

### Real-World Use Cases
- Plan-driven safety-critical systems (medical devices, avionics, railway)
- Any plan-driven process where test planning must be aligned with development phases

### Student Game Dev Translation
A student game team applying V-Model thinking would define acceptance criteria (what does a winning condition look like? what constitutes a working level?) before writing that level. Teaches testability thinking. Most useful as a planning discipline rather than a strict methodology for small teams.

---

## 3. Incremental Development

**Description:** One of Sommerville's three fundamental generic process models (alongside Waterfall and Integration/Configuration). Incremental development is based on developing an initial implementation, getting feedback, and evolving the software through several versions until the required system is developed. Specification, development, and validation activities are **interleaved** rather than separate, with rapid feedback across activities.

Critically, incremental development can be either **plan-driven** (increments identified in advance) or **agile** (early increments identified, later ones depend on progress and customer priorities). This is not a "weaker Agile" — it is the underlying development model that most agile methods implement.

### Activity Model (concurrent, not strictly sequential)
From an outline description, these activities proceed with rapid feedback:
- **Specification** — understand requirements for the current version
- **Development** — design and implement that version
- **Validation** — confirm the version meets requirements
Each iteration produces an initial version, intermediate versions, and eventually a final version.

### Phases for Incremental Delivery (plan-driven variant)
1. Define outline requirements
2. Assign requirements to increments
3. **Design system architecture** (done once upfront — necessary to support all increments)
4. Develop system increment
5. Validate increment
6. Integrate increment
7. Validate system
8. Deploy increment (if system is complete, stop; otherwise loop back to step 4)

### Cycle Length
Each increment: typically **4–8 weeks** in plan-driven variants. Agile increments may be 1–4 weeks.

### Iterative?
Yes. This is the most common approach for application systems and software products.

### Team Size
**Small to medium** (3–15). Works well when the team is consistent across increments.

### Advantages over Waterfall (Sommerville)
1. Reduced cost of implementing requirements changes — less analysis and documentation to redo
2. Easier to get customer feedback — customers comment on demonstrations, not documents
3. Early delivery of useful software — customers gain value before the whole system is complete

### Management Problems (Sommerville)
1. **Not visible** — managers need regular deliverables to measure progress; producing documents for every version is not cost-effective
2. **System structure degrades** — regular change leads to messy code; agile methods recommend regular refactoring to counter this
3. Problems become acute for large, long-lifetime systems where multiple teams need stable architecture

### Note on Incremental Delivery vs. Incremental Development
Sommerville distinguishes these: incremental *development* means building the system in increments without necessarily delivering each one. Incremental *delivery* means deploying each increment to real users. Delivery has the advantage that customers use early increments as prototypes, but it is problematic when replacing an existing system (users need full functionality from the old system and are unwilling to work with an incomplete replacement).

### What Makes It Unique
Incremental development is now the most common approach for application systems and software products. It reflects the way humans actually solve problems — not by working out a complete solution in advance, but by moving toward a solution in steps, backtracking when mistakes are found.

### Real-World Use Cases
- Virtually all modern software product development (agile teams)
- Enterprise software phased rollouts
- Any system where requirements are likely to change during development

### Student Game Dev Translation
A student builds a game in stages: Increment 1 = playable core loop, Increment 2 = enemies added, Increment 3 = scoring + levels, Increment 4 = polish. Each stage is playable. Good for semester-long projects with intermediate milestones.

---

## 4. Integration and Configuration (Reuse-Oriented)

**Description:** Sommerville's third fundamental generic process model. This approach relies on the availability of reusable components or systems. Rather than developing software from scratch, the development process focuses on configuring existing components for a new setting and integrating them into a system. Since 2000, this approach has become very widely used.

Three types of reusable software components are commonly integrated:
1. **Stand-alone application systems** configured for a particular environment (COTS — commercial off-the-shelf software)
2. **Collections of objects/components** developed as a package within a component framework (e.g., Java Spring)
3. **Web services** developed to service standards and available for remote invocation

### Process Stages
1. **Requirements specification** — propose initial requirements (not elaborated in detail; brief descriptions of essential requirements and desirable features)
2. **Software discovery and evaluation** — search for components/systems that provide required functionality; evaluate candidates for fitness
3. **Requirements refinement** — refine requirements using information about reusable components found; modify requirements to reflect available components; if impossible, re-enter component analysis to find alternatives
4. **Application system configuration** — if an off-the-shelf application meets requirements, configure it to create the new system
5. **Component adaptation and integration** — if no off-the-shelf system exists, adapt individual reusable components and develop new components; integrate to create the system

### What Makes It Unique
The obvious advantage is reduced amount of software to develop — lower costs and risks, faster delivery. The disadvantage is that requirements compromises are inevitable, since available components may not match exact needs. Some control over system evolution is lost as new versions of reusable components are not under the organization's control.

### Real-World Use Cases
- ERP implementations (SAP, Oracle — configure standard platform for specific business)
- CMS-based websites
- Any system built on a framework (Spring, React, Rails)
- SaaS integrations using third-party APIs and services

### Student Game Dev Translation
Most student game development implicitly uses this model: Unity or Godot is the "application system" being configured, third-party asset packs are components, and the student's custom code fills the gaps. Understanding this model helps students see that choosing and configuring existing tools is legitimate engineering, not cheating.

---

## 5. Prototype Model

**Description:** Before committing to full development, the team builds a quick rough version of the system (or part of it) to validate ideas, test UX concepts, and clarify requirements. There are two variants: **throwaway prototyping** (build it, show it, throw it away, then build the real thing) and **evolutionary prototyping** (prototype is refined until it becomes the actual product).

### Phases
1. **Initial Requirements** — gather a rough understanding of what's needed
2. **Quick Design** — sketch the key screens, flows, or mechanics
3. **Build Prototype** — create a working but incomplete version
4. **User Evaluation** — show to stakeholders; collect feedback
5. **Refine Requirements** — update understanding based on what was learned
6. **Repeat steps 2–5** until requirements are clear enough to build the real system
7. **Full Development** — (throwaway only) build the actual product using clarified requirements

### Cycle Length
Each prototype iteration: **days to 2 weeks**. The prototyping phase as a whole: **2–8 weeks** before full development begins. Full evolutionary prototyping cycles can stretch over months.

### Iterative?
Yes — the prototyping loop is explicitly iterative. The full-development phase (in throwaway mode) then reverts to a more linear model.

### Team Size
Best for **small teams** (2–6). Fast prototype iterations require close collaboration. Works well as a solo research activity.

### What Makes It Unique
It is the only methodology that explicitly treats the first version of the software as disposable. This takes psychological pressure off early development and encourages honest exploration. It also directly engages users before significant investment is made — making it ideal when requirements are vague or unknown.

### Real-World Use Cases
- UI/UX design research before frontend development
- Hardware product companion apps (rapid prototyping to validate device interaction)
- Novel game mechanics or interaction patterns
- Early-stage startup MVPs to validate product-market fit
- Systems integration experiments (can system A talk to system B?)

### Student Game Dev Translation
The most natural methodology for game jam participants and early concept exploration. Students build a quick "paper prototype" or playable stub to test whether the core mechanic is fun — before investing weeks in art and code. Encourages the "kill your darlings" mindset: if the prototype reveals a bad idea, throw it out and try something else. Widely used in professional game design (cf. "pre-production" phase at major studios).

---

## 6. Spiral Model

**Description:** Developed by Barry Boehm in 1986 as a risk-driven alternative to Waterfall. Each "spiral" (iteration) passes through four quadrants: planning, risk analysis, engineering, and evaluation. The team builds increasingly complete versions of the software while systematically identifying and mitigating risks at each loop. Risk management is the dominant organizing principle.

### Phases (per spiral, repeated)
1. **Planning** — determine objectives, alternatives, and constraints for this spiral
2. **Risk Analysis** — identify potential risks, evaluate alternatives, prototype or experiment to resolve key uncertainties
3. **Engineering** — develop and test the deliverables for this spiral
4. **Customer Evaluation** — review with stakeholders; plan next spiral based on findings

### Cycle Length
Each spiral: **6 months to 1 year** in large projects. The entire project might run **2–4 spirals** over multiple years. Unlike agile sprints, spirals are not short — they're thorough passes through a complete mini-lifecycle.

### Iterative?
Yes — the spiral loops back to planning after each evaluation. However, the pace is slow compared to agile; this is iterative in the sense of multiple passes, not rapid feedback.

### Team Size
**Medium to large** (15–100+). Requires experienced risk analysts and senior architects. Not suitable for small student teams without mentorship.

### What Makes It Unique
Risk analysis is a first-class citizen — it's not an afterthought but happens every cycle before engineering begins. The spiral grows outward: early spirals establish concepts and architecture, later spirals add features and refinement. This makes it highly suited to projects where technical unknowns could be catastrophic if discovered late.

### Real-World Use Cases
- Large defense and aerospace software (original use case)
- Banking core infrastructure overhauls
- NASA mission control and flight software
- Enterprise ERP systems with novel technical requirements
- Any project with a budget constraint where risk evaluation is critical
- Long-term projects where economic priorities may shift

### Student Game Dev Translation
Too heavy for most student projects. However, the risk analysis concept is genuinely useful: before starting any game feature, ask "what could go wrong? what don't we know?" Students who adopt even a lightweight version of spiral thinking (prototype risky mechanics first) avoid the common trap of spending a month building a mechanic that turns out not to be fun. Can be taught as a mindset rather than a full methodology.
