# GOV.UK Content Types

Notes on the different publishing systems and content types we encounter.

---

## Publishing Systems

**Before choosing a system**, check `Style and content principles/Planning content.md` for the mainstream vs specialist criteria. Mainstream is for general public with no specialist knowledge; specialist assumes expertise. Don't suggest mainstream for specialist audiences.

### Whitehall Publisher

Used for: detailed guidance, policy papers, consultations, corporate information.

**Technical:**
- Content in `details.body` (single HTML blob)
- `document_type`: `detailed_guide`, `publication`, etc.
- Tends to be longer, more detailed
- Often part of collections

**Style:**
- More tolerance for complexity
- Technical/specialist audiences acceptable
- Can be denser

### Mainstream Publisher

Used for: high-traffic citizen-facing guidance (benefits, tax, driving, etc.)

**Technical:**
- Content in `details.parts[]` (array of sections)
- Each part has: `title`, `slug`, `body`
- `document_type`: `guide`, `answer`, `simple_smart_answer`
- Multi-part structure is native

**Style:**
- Tighter plain English requirements
- Must work for general public
- Shorter sentences, simpler vocabulary
- Higher accessibility bar

---

## Content Types Encountered

| Type | System | Structure | Example |
|------|--------|-----------|---------|
| `detailed_guide` | Whitehall | single body | EPR packaging guidance |
| `guide` | Mainstream | multi-part | Universal Credit |

*Add new types here as we encounter them.*

---

## Whitehall Content Types Reference

Most of our work will be **detailed_guide** or **publication** (guidance subtype). But if content doesn't fit, consider:

**For step-by-step processes:** detailed_guide
**For complex hierarchical content:** manual (2+ navigation levels)
**For standalone documents:** publication (reports, strategies, statutory guidance)
**For real examples:** case_study
**For grouped documents:** document_collection

**Other types** (less common for our work):
- Policy/news: policy_paper, news_story, press_release, speech, government_response
- Consultations: consultation, call_for_evidence
- Organisational: organisation, people/roles, corporate pages
- Specialist: decision (tribunals), licence, fatality_notice

Full descriptions: https://www.gov.uk/guidance/content-design/content-types

---

## Simple Smart Answers

Interactive branching flows that guide users through questions to reach specific outcomes. Built and managed by content teams — no developers required.

**Technical:**
- Schema: `simple_smart_answer`
- Built in Mainstream Publisher
- Rendered by Frontend app
- Uses Govspeak for supplementary content

**Components:**
- Radio buttons for question responses
- Error summaries for validation
- Summary lists showing user's selections
- Can integrate with step-by-step navigation

**When to use:**
- Straightforward tools without complex calculations
- Users need a specific answer, not general information
- Multiple user paths lead to different outcomes

**Costs:**
- Every branch needs writing and maintaining
- Combinatorial explosion risk (paths multiply quickly)
- Resistance to implementation due to maintenance burden
- Trade-off: moves complexity from user to content team

**Examples:** Vehicle sale reporting, UK Visas contact tools, DVLA contact pathways

**Design guide:** https://design-guide.publishing.service.gov.uk/frontend-templates/smart-answer/simple-smart-answer/

---

## GitHub Smart Answers

Interactive tools for **complicated variables or calculations**. Require developer involvement — not a content-only workflow.

**Technical:**
- Schema: `smart_answer`
- Built with Ruby (.rb), YAML (.yml), and ERB (.erb) templates
- Managed in the `smart-answers` GitHub repository
- Rendered by smart-answers app

**Components:**
- Radio buttons
- Select dropdowns
- Date input fields
- Summary lists for response review
- Error summaries for validation

**When to use:**
- Calculations required (dates, money, entitlements)
- Complex logic beyond simple branching
- Variables that interact with each other

**Costs:**
- Requires developer time to build and maintain
- Changes need deployment, not just publishing
- Largely deprecated — resistance to new ones

**Examples:** Visa eligibility checks, State Pension age calculator, holiday entitlement calculator

**Design guide:** https://design-guide.publishing.service.gov.uk/frontend-templates/smart-answer/github-smart-answer/

---

## Simple vs GitHub Smart Answers

| | Simple | GitHub |
|---|--------|--------|
| Logic | Branching only | Calculations + branching |
| Built by | Content team | Developers |
| Tool | Mainstream Publisher | Code in GitHub repo |
| Input types | Radio buttons | Radio, dropdowns, dates |
| Changes | Publish immediately | Requires deployment |
| Status | Active | Largely deprecated |

**Rule of thumb:** If you need maths or dates, it's probably GitHub. If it's just "if this, then that", it might be simple.

**Flow design reference:** See `smart-answers-reference.md` for patterns, examples, and a design checklist extracted from the GOV.UK smart-answers codebase.

---

## Questions to ask the human

When encountering a new content type:
1. What's its function? (citizen guidance, professional reference, transaction support?)
2. Who's the audience?
3. Any special conventions or constraints?
4. How does it relate to other content in the journey?

---

## Detailed Guide vs HTML Publication

Both are Whitehall types for long-form specialist content. The line between them is blurry.

### Detailed guide

- Single HTML page
- Good for task-focused guidance
- One-click access to content
- Simpler to maintain
- No persistent navigation within the content

### HTML publication

- Has a **splash page** (cover page) introducing the content
- Can contain multiple HTML documents as attachments
- Persistent left-hand navigation between documents
- Better handling of images and complex tables
- Good for reference material users will return to
- Can also attach non-HTML files (CSV, PDF, ODS)

### Trade-offs

| HTML publication | Detailed guide |
|------------------|----------------|
| 2-click journey to reach content (splash → document) | 1-click journey |
| Persistent nav helps users move between sections | Single page — use page contents/anchors |
| Better for large, structured reference documents | Better for task-focused "do this thing" guidance |
| Some content designers dislike the extra click | Simpler mental model |

### When to use which

**Use HTML publication when:**
- Content is reference material (specifications, code tables, detailed rules)
- Users need to navigate between multiple related documents
- Tables are complex and benefit from full-width rendering
- There are attachments (CSVs, templates) alongside the guidance

**Use detailed guide when:**
- Content is task-focused ("how to do X")
- Users arrive, get the answer, leave
- Single page can cover the topic adequately

### Splash page pattern

The splash page (cover page) of a publication typically includes:

1. Title and summary
2. Who the guidance is for
3. What it covers (brief overview)
4. Links to related guidance
5. How to get help / give feedback

The splash page introduces; the attached documents deliver the detail.

**Example structure:**
```
Publication: "Organisation details: how to create your file for EPR"
├── Splash page (introduction, audience, links)
├── HTML document: File specification
├── HTML document: Field-by-field guidance
└── Attachment: CSV template
```

---

## Converting Word documents

Use pandoc to convert .docx to markdown:

```bash
pandoc -f docx -t markdown source.docx -o output.md
```

### Table conversion

Pandoc converts Word tables to **grid tables** (verbose, hard to read). To convert to cleaner formats:

```bash
pandoc -f markdown -t gfm input.md -o output.md
```

**But note:** If tables have multi-line cells, pandoc converts to HTML tables rather than markdown pipe tables. GFM pipe tables can't handle multi-line cell content.

| Original | Conversion | Result |
|----------|------------|--------|
| Word table | pandoc to markdown | Grid tables |
| Grid tables | pandoc to GFM | HTML tables (if multi-line cells) or pipe tables (if simple) |

**Recommendation:** For complex tables with multi-line cells, keep HTML tables — they render correctly. Convert to pipe tables only when you can simplify cell content.

---

## Notes

- Mainstream tends to be tighter on plain English than Whitehall
- Same GOV.UK style principles apply to both, but Mainstream enforces them more strictly
- The Content API structure differs, but our fetcher handles both
