# GOV.UK Content Types

Notes on the different publishing systems and content types we encounter.

---

## Publishing Systems

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

## Notes

- Mainstream tends to be tighter on plain English than Whitehall
- Same GOV.UK style principles apply to both, but Mainstream enforces them more strictly
- The Content API structure differs, but our fetcher handles both
