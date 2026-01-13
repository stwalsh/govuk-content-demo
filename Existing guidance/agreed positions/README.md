# Agreed Positions and Technical Interpretations

## Source

`originals/PUBLISHED V7 pEPR Agreed Positions_06_10_2025.docx` — Version 7.0, dated 6 October 2025. Published jointly by the Environment Agency, Natural Resources Wales, NIEA, and SEPA.

## Converted file

`agreed-positions-clean.md` — Converted via pandoc with cleanup for tables and checkmarks.

## How to use this document

### It IS:
- Authoritative on legal and policy interpretation
- Detailed and accurate on technical matters
- A key reference for Legal/Policy review
- The regulators' agreed position on ambiguous areas of the pEPR Regulations

### It is NOT:
- A model for GOV.UK style, language, or structure
- Written in plain English
- User-focused
- Suitable to copy or closely adapt

**Do not use this document as a basis for tone, sentence structure, or content organisation.** The language is complex, the structure is regulatory rather than task-based, and it does not meet GDS content standards.

## GOV.UK formatting constraints

- **Heading levels:** Only H2 and H3 are usable (H4 exists but is visually identical to H3)
- **Tables:** The source document over-uses tables. GOV.UK has a mild preference for running copy. Restructure as headed prose where possible. Preserve tables only where the information genuinely requires a matrix format (e.g., cross-referencing multiple variables).
- **Images:** Cut all images. The source contains 6 images (4 regulator logos, 3 flowcharts). Logos have no content value. Flowcharts must be converted to prose decision logic during drafting.

## Current status

**Phase 1 drafting: COMPLETE** (12 January 2026)

Draft output: `../../drafts/agreed-positions-v1.md` (~1,988 lines)

Supporting material: `../../drafts/crosswalk-activities-functions.md` (producer functions ↔ packaging activities bridging content)

**Awaiting:**
- Style Claude review (bold usage, sentence length, passive voice)
- Legal Claude review (accuracy against Regulations)
- Human review

## Agreed plan

**Phase 1: Lift-and-shift with clarity edit** ✓ COMPLETE
- Rewrite the agreed positions document for GOV.UK compliance
- Keep structure largely intact (single document)
- Focus on: plain English, active voice, accessibility, tables-to-prose where sensible
- Convert all flowcharts to numbered steps / decision logic
- Satisfies stakeholder preference for single-doc reference

**Phase 2: Iterate and improve**
- Implement gap analysis findings (absorb missing content into existing guidance or create new pages)
- Resolve conflicts with existing guidance
- Potentially break into separate pages based on user feedback

## Phase 1 task breakdown

| Chunk | Content | Approx lines |
|-------|---------|--------------|
| 1 | Intro + Part 1 (What is packaging) | ~300 |
| 2 | Part 2 (Producer obligations) | ~350 |
| 3 | Part 3 sections 3:1–3:10 | ~400 |
| 4 | Part 3 sections 3:11–3:20 | ~400 |
| 5 | Part 3 sections 3:21–3:27 | ~250 |
| 6 | Appendices 1–5 | ~1,900 (table-heavy) |
| 7 | Appendices 6–11 | ~600 |

## Analysis completed

Analysis documents are in the `analysis/` subfolder.

**Structural analysis:** `analysis/agreed-positions-analysis.txt`
- Full document outline with line numbers
- Content type categorisation
- Table inventory (essential vs convertible to prose)
- Cross-reference mapping

**Gap analysis (sections 3:1–3:10):** `analysis/gap-analysis-3.1-3.10.md` (also `.docx`)
- Comparison against existing GOV.UK guidance
- Coverage status for each section
- Specific gaps and missing examples
- Recommendations (absorb / standalone page / expand)

### Key findings from gap analysis

**Critical gaps requiring new content:**
- 3:2 (Supply) — Four supply scenarios missing entirely
- 3:5 (Multi-branded packaging) — 7 worked examples missing
- 3:6 (Branded by packaging type) — Entire topic absent from existing guidance
- 3:7 (Importer) — 9 detailed scenarios and "caused the import" concept missing

**Minor absorptions needed:**
- 3:1, 3:3, 3:4, 3:8, 3:9, 3:10 — Examples and clarifications to add to existing pages

## Contents overview

- **Part 1:** What is packaging? (definition, six-step decision chart)
- **Part 2:** Packaging producer obligations (thresholds, producer years, data reporting)
- **Part 3:** Agreed positions on specific topics (27 sections covering household packaging, supply, brands, importers, online marketplaces, etc.)
- **Part 4:** Appendices 1–11 (determination charts, supply routes, specific items, labels, materials, binned packaging, self-managed waste, reporting obligations, mid-year changes, distributor guidance)

## Images inventory (all to be cut)

| Image | Content | Action |
|-------|---------|--------|
| 1–4 | Regulator logos | Cut — no content value |
| 5 (line 281) | Six Steps Decision Chart | Cut — fully captured in prose (lines 285–313) |
| 6 (line 1683) | Appendix 1: Household packaging flowchart | Convert to prose decision logic |
| 7 (line 3628) | Appendix 7: Self-managed waste flowchart | Convert to prose decision logic |
| 8 (line 3908) | Appendix 10: Distributor flowchart | Strengthen existing prose |
