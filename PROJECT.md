# GOV.UK Guidance Drafting Demo

## Purpose

Experiment with using Claude to draft GOV.UK guidance content. This sandbox contains real reference materials from the Extended Producer Responsibility (EPR) for Packaging regulations.

## Team Structure

| Role | Responsibility |
|------|----------------|
| **Human Lead** | Steers decisions, provides direction, synthesises feedback |
| **Drafting Claude** | Produces content based on source materials |
| **Style Review Claude** | Reviews against GOV.UK style standards |
| **Legal/Policy Claude** | Checks factual accuracy and legal compliance |

## Workflow

1. Human provides task and points to source materials
2. Drafting Claude produces content in `drafts/`
3. Review Claudes provide feedback in `FEEDBACK.md`
4. Human decides which feedback to implement
5. Iterate until content meets standards

## Reference Materials

### Legislation
- `Legislation/2024-1332/` — Producer Responsibility Obligations (Packaging and Packaging Waste) Regulations 2024
- Split into 11 Parts and 8 Schedules as markdown files

### Existing guidance
- `Existing guidance/` — Current GOV.UK pages on EPR for Packaging
- Use these as examples of structure and tone

### Style guides
- `Style and content principles/` — GOV.UK style guide and content design resources

## Preview

```bash
npm start
```

Visit http://localhost:3000 to see drafts rendered with GOV.UK styling.

## Getting started

See README.md for setup instructions and example exercises.
