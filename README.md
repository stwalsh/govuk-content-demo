# GOV.UK Guidance Analysis with Claude

A demo sandbox for using Claude to analyse government guidance and legislation. This repo contains real reference materials from the Extended Producer Responsibility (EPR) for Packaging regulations — legislation, existing guidance, and style guides.

## What Claude is useful for

Content design is skilled work. Claude isn't here to replace that. But there are tasks where it can help:

- **Gap analysis** — What does the legislation require that the guidance doesn't explain?
- **Consistency checking** — Are terms, definitions, and numbers used consistently across documents?
- **Conflict detection** — Where do different documents contradict each other?
- **Document breakdown** — Extracting structure, summarising sections, identifying key provisions
- **Cross-referencing** — Tracing how guidance maps to specific legislative provisions
- **First drafts** — Producing initial drafts from source material for a human to edit

The analytical tasks — cross-referencing, consistency checking, gap-finding — are where Claude is most useful.

## What's here

```
├── Legislation/             # Producer Responsibility Regulations 2024
│   └── 2024-1332/           # Split into Parts and Schedules as markdown
│
├── Existing guidance/       # Live GOV.UK pages for reference
│   ├── who is affected.md
│   ├── register.md
│   ├── fees and obligations.md
│   └── ...
│
├── Style and content principles/   # GOV.UK style guide resources
│
├── drafting.md              # Instructions for "Drafting Claude" role
├── style-review.md          # Instructions for "Style Review Claude" role
├── legal-review.md          # Instructions for "Legal/Policy Review Claude" role
├── FEEDBACK.md              # Shared log for review feedback
├── drafts/                  # Working drafts go here
│
├── server.js                # Preview server with GOV.UK styling
├── fetch-legislation.js     # Tool to fetch UK legislation as markdown
└── sync-check.js            # Tool to compare against live GOV.UK
```

## Setup

### 1. Get Claude Pro

Sign up at [claude.ai](https://claude.ai) for a Pro account.

### 2. Install Claude Code

Claude Code is Anthropic's CLI for using Claude with local files.

```bash
npm install -g @anthropic-ai/claude-code
```

Or see the [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for other install methods.

### 3. Clone and install

```bash
git clone [this-repo-url]
cd govuk-content-demo
npm install
```

### 4. Run Claude Code

```bash
claude
```

Claude now has access to all the files in this directory.

## Example exercises

### Exercise 1: Gap analysis

**Goal:** Find what the legislation requires that the guidance doesn't cover.

```
Read Legislation/2024-1332/part-06-reprocessors-exporters.md

Now read "Existing guidance/Reprocessors and exporters/Packaging waste apply
for registration and accreditation.md"

Identify any requirements in the legislation that aren't explained in the
guidance. List them with the specific regulation reference and what's missing.
```

---

### Exercise 2: Consistency check

**Goal:** Find inconsistencies across documents.

```
Compare how "small producer" thresholds are described across these files:
- Existing guidance/who is affected.md
- Existing guidance/small producers.md
- Legislation/2024-1332/part-02-producers.md

Are the turnover and tonnage thresholds stated consistently? Are the same
terms used? Flag any discrepancies.
```

---

### Exercise 3: Contradiction detection

**Goal:** Find where documents disagree.

```
Read all the files in "Existing guidance/" that mention registration deadlines.

Cross-reference these against Legislation/2024-1332/part-02-producers.md and
any schedules that mention timing.

Do any of the guidance pages contradict each other or the legislation on dates
or deadlines? List specific conflicts with quotes from each source.
```

---

### Exercise 4: Document breakdown

**Goal:** Extract structure and key provisions from legislation.

```
Read Legislation/2024-1332/part-03-obligations.md

Create a structured summary that a content designer could use as a reference:
1. List each distinct obligation
2. Who it applies to
3. What triggers it
4. Any exemptions mentioned
5. Cross-references to other parts or schedules
```

---

### Exercise 5: Cross-reference mapping

**Goal:** Trace guidance back to legislative authority.

```
Read "Existing guidance/fees and obligations.md"

For each substantive claim in this guidance (obligations, amounts, deadlines),
find the specific regulation that authorises it.

Flag any claims that you cannot trace to a specific provision — these may need
verification or may indicate the guidance is interpreting rather than citing.
```

---

### Exercise 6: Style review

**Goal:** Check content against GOV.UK standards.

```
Read style-review.md for the review criteria.

Now read "Existing guidance/Household and non-household.md"

Review this page against GOV.UK style standards. Focus on:
- Sentence length (flag any over 25 words)
- Passive voice
- Jargon without explanation
- Structure and scannability

Log findings in FEEDBACK.md using the format in style-review.md
```

---

### Exercise 7: Terminology audit

**Goal:** Check consistent use of terms.

```
The regulations use specific defined terms. Check whether the guidance uses
these consistently:

1. Read Legislation/2024-1332/part-01-general.md for definitions
2. Search through "Existing guidance/" for how these terms are actually used
3. Flag where guidance uses different words for the same concept, or uses
   defined terms loosely
```

---

### Exercise 8: Draft from legislation

**Goal:** Produce a first draft from source material.

```
Read drafting.md for the drafting role instructions.

Read Legislation/2024-1332/part-07-corporate-groups.md and
Legislation/2024-1332/schedules/schedule-09-corporate-groups.md

Draft a guidance page (under 600 words) explaining how corporate groups
can register and report as a single entity. Focus on:
- Who can use this arrangement
- What the "nominated member" does
- How fees work for groups

Save to drafts/corporate-groups-draft.md

This is a first draft for a human to edit — don't aim for perfection.
```

---

### Exercise 9: Rewrite for clarity

**Goal:** Simplify existing content.

```
Read "Existing guidance/Household and non-household.md"

This explains how to classify packaging — a distinction that affects
reporting obligations.

Rewrite this to be clearer for a small business owner who isn't familiar
with waste industry terminology. Keep all the essential information but
try to reduce complexity.

Save to drafts/household-simplified.md
```

---

## Preview server

See drafts rendered with GOV.UK styling:

```bash
npm start
```

Visit http://localhost:3000 and select a file to preview.

## Other tools

### Fetch legislation

Pull any UK legislation from legislation.gov.uk and convert to markdown:

```bash
node fetch-legislation.js uksi/2024/1332    # UK Statutory Instrument
node fetch-legislation.js ukpga/2021/30     # UK Public General Act
```

### Sync check

Compare local guidance against live GOV.UK pages:

```bash
node sync-check.js          # Check for updates
node sync-check.js --diff   # Show content differences
```

---

## The multi-Claude approach

The role files (`drafting.md`, `style-review.md`, `legal-review.md`) set up different perspectives:

- **Style Review Claude** — checks GOV.UK standards
- **Legal/Policy Claude** — verifies accuracy against legislation
- **Drafting Claude** — produces content when needed

Running separate sessions with different role instructions lets each focus on its domain. A human synthesises the outputs and makes decisions.

---

## Why this exists

The EPR regulations work as a sandbox because they're real, complex, and public — all source material is on GOV.UK or legislation.gov.uk.

The exercises focus on analytical tasks (cross-referencing, consistency, gaps) rather than drafting. That's where Claude is most useful and least likely to need editing.
