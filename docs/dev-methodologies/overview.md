# Software Development Methodologies — Overview

## What is a Development Methodology?

A software development methodology is a structured framework that defines how a team organizes, plans, executes, and delivers software. It answers: in what order do we work? how often do we check in? who decides what? how do we handle change? Methodologies exist because building software is a collaborative, multi-phase activity that goes wrong in predictable ways — scope creep, poor communication, unvalidated requirements, untested code, and missed deadlines. A methodology is a set of guardrails against those failure modes.

Methodologies differ along several key axes:
- **Linear vs. iterative**: does work flow one-way through phases, or does the team loop back repeatedly?
- **Prescriptive vs. adaptive**: are the rules rigid and documented, or are teams expected to tailor the process?
- **Plan-driven vs. value-driven**: is the goal to execute a plan faithfully, or to deliver the most valuable thing possible at any moment?
- **Document-heavy vs. working-software-first**: how much is written down vs. built?

No methodology is universally best. The right choice depends on project size, how well requirements are understood upfront, team experience, stakeholder involvement, and risk tolerance.

---

## Sommerville's Four Fundamental Process Activities

Sommerville (Ch. 2) identifies four fundamental activities that all software processes must include, regardless of which methodology is used. Every process model is essentially a different way of organizing these four activities:

### 1. Software Specification
Understanding and defining what services are required from the system and identifying constraints on its operation and development. Also called *requirements engineering*. Mistakes here inevitably lead to problems in design and implementation.

Three sub-activities within requirements engineering:
- **Requirements elicitation and analysis** — deriving requirements through observation of existing systems, discussions with users, task analysis, and prototypes
- **Requirements specification** — translating gathered information into a document defining user requirements (abstract, for customers/end-users) and system requirements (detailed functional description)
- **Requirements validation** — checking requirements for realism, consistency, and completeness; errors discovered here require modification of the document

In agile methods, requirements specification is not a separate activity — requirements are informally specified for each increment just before it is developed, based on user priorities.

### 2. Software Design and Implementation
The process of converting a specification into an executable system. In plan-driven development, these are separate activities with formal design documents. In agile development, they are interleaved — design is recorded informally on whiteboards and in programmer notes.

Four design activities for information systems (Sommerville Fig. 2.5):
- **Architectural design** — overall system structure, principal components (subsystems/modules), and their relationships
- **Database design** — system data structures and how they are represented
- **Interface design** — interfaces between system components (must be unambiguous, enabling independent development)
- **Component selection and design** — search for reusable components; design new components where none exist

Design outputs for critical systems are detailed documents. For agile methods, design outputs may be represented in the code itself.

**Testing and debugging** are part of implementation: testing establishes the existence of defects; debugging is the separate process of locating and correcting them.

### 3. Software Validation
Verification and Validation (V & V) — showing that a system conforms to its specification and meets user expectations. Program testing (executing the system with simulated test data) is the principal validation technique.

Three testing stages (Sommerville Fig. 2.6):
- **Component testing** — individual components tested independently by developers; automated test frameworks (e.g., JUnit) enable re-running tests when components change
- **System testing** — components integrated into a complete system; tests for unanticipated interactions and interface problems; shows the system meets functional and non-functional requirements
- **Customer testing** — system tested with real customer data; for custom software, may reveal requirements errors; for products, called *beta testing* (potential customers report problems)

In plan-driven development, an independent team develops test plans from system specifications. In test-first development (TDD), tests are developed from requirements before coding begins.

### 4. Software Evolution
The flexibility of software — that it can be changed at any time during or after development — is one of the main reasons more software is being incorporated into complex systems. Historically there was a split between "development" and "maintenance," but this distinction is increasingly irrelevant. It is more realistic to treat software engineering as an evolutionary process where software is continually changed over its lifetime in response to changing requirements (Sommerville Fig. 2.8: define requirements → assess existing systems → propose changes → modify systems → new system).

---

## Coping with Change (Sommerville §2.3)

Change is inevitable in all large software projects. Change adds cost because completed work must be redone — this is called **rework**. Two strategies reduce rework costs:

**1. Change anticipation** — the process includes activities that can anticipate or predict changes before significant rework is required.
- Example: *System prototyping* — a version of the system or part of it is developed quickly to check customer requirements and design feasibility; users experiment before delivery, reducing post-delivery change proposals

**2. Change tolerance** — the process and software are designed so that changes can be made easily. This normally involves incremental development.
- Example: *Incremental delivery* — system increments are delivered to customers for comment and experimentation; avoids premature commitment to requirements; allows changes to be incorporated into later increments at low cost
- *Refactoring* (improving program structure without changing behavior) also supports change tolerance — continuously counteracting the structural degradation that incremental development causes

**Note:** These two strategies are not mutually exclusive. Prototyping anticipates changes; incremental delivery tolerates them. Both are commonly used together.

---

## Process Improvement (Sommerville §2.4)

Software process improvement means understanding existing processes and changing them to increase product quality and/or reduce costs and development time. It is a continuous, long-term activity (each stage may last several months).

### The Process Improvement Cycle (Fig. 2.11)
Three stages, cycling continuously:
1. **Process measurement** — measure one or more attributes of the process or product; forms a baseline; re-measure after introducing improvements to assess effectiveness
2. **Process analysis** — assess the current process; identify weaknesses and bottlenecks; may produce process models (process maps)
3. **Process change** — propose and introduce changes to address identified weaknesses; cycle resumes to collect effectiveness data

### Two Approaches to Process Improvement

**Process maturity approach** (plan-driven, CMM/CMMI-based):
- Focuses on improving process and project management; introducing good software engineering practice
- Primary goals: improved product quality and process predictability
- Rooted in plan-driven development; introduces overhead activities not directly related to program development

**Agile approach:**
- Focuses on iterative development and reducing process overheads
- Primary characteristics: rapid delivery of functionality and responsiveness to changing customer requirements
- Philosophy: best processes are those with lowest overheads

### The Capability Maturity Model (CMMI)
Introduced by the Software Engineering Institute (SEI) in the late 1980s (Humphrey 1988) so the U.S. Department of Defense could assess software engineering capability of defense contractors. Five maturity levels:

| Level | Name | Description |
|---|---|---|
| 1 | **Initial** | Goals associated with the process area are satisfied; scope of work is explicitly set out and communicated |
| 2 | **Managed** | Goals are met; organizational policies define when each process should be used; documented project plans, resource management, and process monitoring in place |
| 3 | **Defined** | Organizational standardization and deployment; each project has a managed process adapted from a defined set of organizational processes; process assets and measurements collected for future improvement |
| 4 | **Quantitatively managed** | Statistical and other quantitative methods used to control subprocesses; collected measurements must be used in process management |
| 5 | **Optimizing** | Process and product measurements used to drive process improvement; trends analyzed; processes adapted to changing business needs |

**Practical note (Sommerville):** There is too much overhead in formal process improvement for small companies, and maturity estimation with agile processes is difficult. Only large software companies now use the maturity-focused approach.

---

## The Universal Skeleton

Despite their differences, virtually every methodology addresses the same underlying activities. These are the phases that appear — in some form — across all of them:

| # | Universal Phase | What happens |
|---|---|---|
| 1 | **Concept / Ideation** | Define the problem, establish goals, identify constraints |
| 2 | **Planning** | Scope the work, estimate effort, sequence tasks, assign roles |
| 3 | **Specification** | Understand what must be built from the user's perspective; define constraints |
| 4 | **Design / Architecture** | Decide how to build it — structure, data models, interfaces, component selection |
| 5 | **Build / Implementation** | Write code, create assets, integrate components |
| 6 | **Validation** | Confirm the software meets requirements and user expectations (component → system → customer testing) |
| 7 | **Deploy / Release** | Put working software in front of real users |
| 8 | **Review / Reflect** | Evaluate what was delivered; decide what comes next |
| 9 | **Evolution / Maintenance** | Change the delivered system to meet new requirements — treated as a continuum with development, not a separate activity |

In linear methodologies (Waterfall, V-Model), these phases run once in sequence. In iterative methodologies (Scrum, XP), specification, development, and validation are interleaved and run in short repeated loops. In flow-based methodologies (Kanban, DevOps), work items move through stages continuously and simultaneously.

The key insight for student game development: **all game projects need all of these activities.** A methodology is just an agreement about how to time and order them.

---

## Comparison Table

| Methodology | Type | Typical Cycle Length | Best Team Size | Best For |
|---|---|---|---|---|
| **Waterfall** | Linear | Months–years (one pass) | Any (works best large) | Embedded, critical, multi-org systems with fixed specs |
| **V-Model** | Linear (testing variant of Waterfall) | Months–years | Medium–large | Plan-driven processes requiring test traceability |
| **Integration & Configuration** | Reuse-oriented | Varies | Any | Systems built on existing components/platforms/APIs |
| **Incremental** | Interleaved iterative (plan-driven or agile) | Varies; 1–8 weeks/increment | Any | Most application development; basis of all agile methods |
| **Prototype** | Exploratory–iterative | Days–weeks per prototype | Small | Fuzzy requirements, UI-heavy projects, change anticipation |
| **Spiral** | Risk-driven iterative | 6–18 months per loop | Medium–large | High-risk, large-budget projects |
| **RAD** | Iterative–prototype | 60–90 days total | Small (3–8) | Business apps, short deadlines |
| **Agile (general)** | Iterative | 1–4 weeks per iteration | Small–medium | Product development; custom systems with involved customer |
| **Scrum** | Iterative | 2–4 week sprints | up to 7 developers | Feature-driven product development |
| **Kanban** | Continuous flow | No fixed iteration | Any | Support, ops, maintenance, solo work |
| **Scrumban** | Hybrid | Optional 2–4 week sprints | Any | Mixed maintenance + feature work |
| **XP** | Iterative (test-first) | Short release cycles (weeks) | 2–12 | High-quality technical software; practices often used within Scrum |
| **Crystal** | Iterative (adaptive) | 1–3 months per cycle | 1–40 (varies by color) | Teams wanting lightweight tailoring |
| **FDD** | Iterative (feature-based) | 1–2 weeks per feature | 20–50+ | Large projects with many features |
| **DSDM** | Iterative–timeboxed | 2–6 week timeboxes | 4–8 per team | Business-sponsored agile delivery |
| **Lean** | Flow / continuous | Ongoing, no fixed cycle | Any | Optimizing existing delivery pipelines |
| **SAFe** | Multi-level iterative | 8–12 week PI (5 sprints) | 50–125 per ART | Large enterprises, multiple teams |
| **Shape Up** | Fixed-cycle | 6-week cycles + 2-week cooldown | 1 designer + 1–2 devs | Product companies, focused features |
| **DevOps** | Continuous loop | Deploy multiple times daily | Cross-functional | Rapid delivery, cloud-native products |
| **RUP / OpenUP** | Iterative–phased | 2–6 weeks per iteration | Medium–large | Enterprise, architecture-heavy projects |
| **DAD** | Hybrid–context-sensitive | Varies | Any | Enterprises needing tailored agile |

---

## How to Read This Series

- **linear-models.md** — Waterfall, V-Model, Incremental, Integration & Configuration, Prototype, Spiral
- **agile-family.md** — Agile manifesto, Scrum, Kanban, Scrumban, XP, Crystal, FDD, DSDM, SAFe
- **modern-methods.md** — Shape Up, Lean, DevOps, RAD, RUP/OpenUP, DAD
- **game-dev-presets.md** — How each methodology maps to game development; 5 curated student presets
