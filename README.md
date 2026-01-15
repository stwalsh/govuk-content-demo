# GOV.UK Guidance Analysis with Claude

A demo sandbox for a content design tool

It uses Claude to analyse and draft government guidance for GOV.UK.

I ran it up in 2 hours on Sunday afternoon. 1.5 of those hours were gathering material. Don’t let anyone sell you a six-figure content solution that’s just this in disguise. 

I've no commercial plans for this. I'm just sharing it so the community can see what's possible. If you want me to talk to you about it, let me know. 

It really looks like it works but I want people to try it out and see where it breaks. 

The repo contains real reference materials from the Extended Producer Responsibility (EPR) for Packaging regulations — legislation, existing guidance, and style guides.

## What the tool is useful for

This tool can help with these tasks:

- **Gap analysis** — What does the legislation require that the guidance doesn't explain?
- **Consistency checking** — Are terms, definitions, and numbers used consistently across documents?
- **Conflict detection** — Where do different documents contradict each other?
- **Document breakdown** — Extracting structure, summarising sections, identifying key provisions
- **Cross-referencing** — Tracing how guidance maps to specific legislative provisions
- **First drafts** — Producing initial drafts from source material for a human to edit
- **Document and feedback analysis** - pull stakeholder comments from a Word doc, analyse, prioritise and action them

### What's missing

The most obvious things to add are folders of UR and analytics. That'll expand what it can do. This is a private project so I haven't pointed it at any material that isn't completely and intuitively public.

A folder of high quality GOV.UK content in clean markdown would be useful as reference material. Examples of good practice from across government, not just this topic. I've had it fetch the odd GOV.UK page and convert it to Markdown but this could probably be more robust. I can't see it being _hard_ to get it to rip through a collection and grab and convert all the guidance.

This is designed for guidance. I can see how it would work for service content - if you can't, either come and find me or ask Claude. 

## Tips

- It likes markdown as a source format — plain text, easy to diff, works well with version control
- Be directive about structure and length: "keep it under 500 words" or "I want this as 3 separate pages" saves iteration
- Point Claude at specific files before asking questions — "read X then tell me Y"
- If you need additional tools, ask Claude to build them

### Usage caps

There's a cap on how much you can use Claude, per session and per week. It's not based on time but on how much token processing Claude is doing - effectively, how hard it's thinking.

You can check usage in the CLI by typing /status and tabbing to usage. 

If you're a Pro user you can hit your cap surprisingly easily. Follow the tips for more efficent usage but also:

- tell it use a different, less advanced model for easier jobs
- resist the lure of telling it to do things that you can do yourself


## CAREFUL!!

This is processing data on Anthropic's servers. Do not I repeat do not give it _anything_ sensitive. In fact I advise you to play it safe and stick to published materials.

The CLI asks permission before running commands or editing files. Read what it's asking before you approve. Be especially careful with anything destructive — deleting files, force-pushing to git, or running unfamiliar scripts.

Keep the human in the loop. Verify everything. 


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
├── accuracy-review.md          # Instructions for "Legal/Policy Review Claude" role
├── FEEDBACK.md              # Shared log for review feedback
├── drafts/                  # Working drafts go here
│
├── server.js                # Preview server with GOV.UK styling
├── fetch-legislation.js     # Tool to fetch UK legislation as markdown
└── sync-check.js            # Tool to compare against live GOV.UK
```

## Setup

You need a Claude Pro or Max account. Two ways to run this:

### Option A: Browser (easiest to start)

Use [Claude Code on the web](https://claude.ai/code) — no install needed.

1. Go to claude.ai/code
2. Connect this GitHub repo
3. Start running exercises

Claude works in a cloud environment and can push changes to branches.

Note: The web version is slower and flakier than local CLI. Easier setup but harder to use well. Fine for trying it out; switch to local if you get frustrated.

### Option B: Local CLI

Install Claude Code locally for offline work or if you prefer the terminal.

```bash
npm install -g @anthropic-ai/claude-code
git clone https://github.com/stwalsh/govuk-content-demo
cd govuk-content-demo
npm install
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

The role files (`drafting.md`, `style-review.md`, `accuracy-review.md`) set up different perspectives:

- **Style Review Claude** — checks GOV.UK standards
- **Accuracy Claude** — verifies facts against source material
- **Drafting Claude** — produces content when needed

Running separate sessions with different role instructions lets each focus on its domain. A human synthesises the outputs and makes decisions.

---

## Adapting for your own domain

To use this setup with different legislation or guidance:

### 1. Swap the legislation

Delete `Legislation/2024-1332/` and fetch your own:

```bash
node fetch-legislation.js uksi/2023/123    # Your SI number
node fetch-legislation.js ukpga/2020/1     # Or an Act
```

This pulls from legislation.gov.uk and converts to markdown. Find identifiers at legislation.gov.uk — they're in the URL (e.g. `/uksi/2024/1332`).

### 2. Replace the existing guidance

Delete the contents of `Existing guidance/` and add your own GOV.UK pages. Save as markdown — just copy the main content, not the navigation chrome.

### 3. Update sync config (optional)

If you want to track when live GOV.UK pages change, edit `sync-config.json` to map your local files to GOV.UK URLs:

```json
{
  "mappings": [
    {
      "local": "Existing guidance/your-page.md",
      "govuk": "/guidance/your-page-url",
      "description": "What this page covers"
    }
  ]
}
```

Then run `node sync-check.js` to check for drift.

### 4. Keep or adapt the role files

The role instructions (`drafting.md`, `style-review.md`, `accuracy-review.md`) are generic GOV.UK guidance — they should work for any topic. Tweak if your domain has specific conventions.

---

## Why this exists

We're using these regs as a sandbox because they're real, complex, and public. All source material is on GOV.UK or legislation.gov.uk.

The exercises focus on analytical tasks (cross-referencing, consistency, gaps) rather than drafting. Drafting's pretty good - try out some stuff - but you'll spot the style and formatting holes. 
