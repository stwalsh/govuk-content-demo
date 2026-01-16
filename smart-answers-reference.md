# GOV.UK Smart Answers: Flow Design Reference

A practical guide for designing interactive flows, extracted from the GOV.UK smart-answers codebase.

---

## 1. Flow Structure Patterns

### Basic Architecture

Every smart answer has three components:
- **Start page**: Landing page with title, description, and "Start" button
- **Questions**: Sequential nodes that collect user input
- **Outcomes**: Terminal nodes that present results

### Question Sequencing

The first question defined is always the entry point. All subsequent routing is explicit—there's no implicit "next question" based on definition order.

**Routing works through a `next_node` block on each question:**
```
Question A → (user answer) → routing logic → Question B or Outcome X
```

Each question must explicitly declare where to go next based on the user's response. This makes flows self-documenting but requires careful planning.

### Branching Patterns

**1. Linear flow** (simplest)
```
Q1 → Q2 → Q3 → Outcome
```

**2. Early exit** (filter users out quickly)
```
Q1: "Are you eligible?"
  ├─ No → Outcome: "Not eligible"
  └─ Yes → Q2 → Q3 → Outcome: "Your result"
```

**3. Parallel branches** (different paths based on initial categorisation)
```
Q1: "What type of vehicle?"
  ├─ Car → Q2a → Q3a → Outcome A
  ├─ Van → Q2b → Q3b → Outcome B
  └─ Bus → Q2c → Outcome C
```

**4. Convergent branches** (different paths lead to shared questions/outcomes)
```
Q1 → Q2
  ├─ Path A → Q3 ─┐
  └─ Path B → Q4 ─┴→ Q5 → Outcome
```

### Outcome Structure

Outcomes contain:
- **Title**: Clear statement of the result
- **Body**: Main content with guidance, links, next steps
- **Next steps**: Related actions or resources (optional)

Outcomes can be:
- **Static**: Same content for everyone who reaches them
- **Dynamic**: Content varies based on collected answers (using conditionals in templates)

---

## 2. Good Examples to Study

### Register a Death
**Path**: `app/flows/register_a_death_flow.rb`

The simplest well-structured flow. Only 3 questions leading to 4 outcomes based on location (England/Wales, Scotland, Northern Ireland, overseas).

**Why it's good:**
- Clear early branching on location
- Questions flow naturally (Where? → Where specifically? → Was it expected?)
- Outcomes are distinct and location-specific
- Templates use conditionals to vary content without multiplying outcomes

**Study for:** Basic flow structure, early branching, conditional outcome content.

---

### Towing Rules
**Path**: `app/flows/towing_rules_flow.rb`

A pure decision tree with 17 questions and 16 outcomes. No calculations—just branching logic based on vehicle type, licence dates, and age.

**Why it's good:**
- Clean parallel branches (car, van, large vehicle, minibus, bus)
- Each branch asks only relevant questions
- Well-commented with question numbers
- Demonstrates how to organise complex branching

**Study for:** Parallel branching, organising large flows, decision trees.

---

### State Pension Age
**Path**: `app/flows/state_pension_age_flow.rb`

Compact flow (only ~70 lines) that asks minimal questions but uses a calculator for complex date logic.

**Why it's good:**
- Only asks questions that affect the outcome
- Gender question only appears when needed (conditional question display)
- Calculator handles all the complexity
- Multiple outcomes based on eligibility status

**Study for:** Conditional questions, keeping flows minimal.

---

### Check Building Safety Costs
**Path**: `app/flows/check_building_safety_costs_flow.rb`

Mixed question types (yes/no, year, money, percentage) with validation and early exits.

**Why it's good:**
- Multiple question types demonstrated
- Early exits filter ineligible users quickly
- Input validation with clear error messages
- Progressive disclosure—only asks relevant follow-ups

**Study for:** Mixed input types, validation, progressive disclosure.

---

### Check Benefits Financial Support
**Path**: `app/flows/check_benefits_financial_support_flow.rb`

Complex eligibility checker with 13 questions building a user profile.

**Why it's good:**
- Uses checkbox questions for multiple selections
- Progressive questioning based on circumstances
- Single outcome displays personalised content
- Good example of "eligibility checker" pattern

**Study for:** Profile-building flows, checkbox questions, personalised outcomes.

---

## 3. Content Patterns

### Question Titles

**Format:** Direct question in second person, always ending with `?`

**Good examples:**
- "Where did the death happen?"
- "What kind of vehicle do you want to tow with?"
- "Are you an apprentice?"
- "How much do you get paid before tax in the pay period?"

**Patterns:**
- Simple and specific
- Avoid jargon—use terms users understand
- Include scope when needed ("...in the pay period")

---

### Radio Button Options

**Format:** Clear, mutually exclusive choices with enough context

**Good examples:**
```
"england_wales": "England or Wales"
"scotland": "Scotland"
"northern_ireland": "Northern Ireland"
"overseas": "Abroad"
```

```
"car-or-light-vehicle": "Car (category B)"
"medium-sized-vehicle": "Medium-sized vehicle (category C1)"
```

**Patterns:**
- User-friendly labels (not internal codes)
- Include official categories in parentheses when helpful
- For Yes/No: just use "Yes" and "No"

---

### Hint Text

**Purpose:** Clarify ambiguity, define terms, specify what to include/exclude

**Good examples:**
- "Check the employment contract if you're not sure about the holiday entitlement."
- "Do not include payments for overtime or anything extra to your pay."
- "The ground floor is storey 1. Do not count any underground floors."
- "If you're 19 or over and you've completed the first year of your apprenticeship, you're not eligible for the apprenticeship rate."

**Patterns:**
- Concise and specific
- Anticipate common misunderstandings
- Use "Do not include..." to clarify boundaries
- Reference supporting documents when relevant

---

### Error Messages

**Format:** Specific, actionable, tells user what to do

**Good examples:**
- "Please enter a whole number greater than 0"
- "You must enter your accounting period end date using numbers only, in the format MM and YYYY"

**Patterns:**
- State the expected format
- Don't just say "invalid"—explain what's wrong

---

### Outcome Page Content

**Structure:**
1. **Title**: State the result clearly ("Your statutory holiday entitlement is X days")
2. **Body**: Explanation, calculation breakdown, guidance
3. **Next steps**: Links to related actions

**Formatting (Govspeak):**
- `##` for section headings
- `-` or `*` for bullet points
- `$C ... $C` for callout/alert boxes
- `$! ... $!` for emphasised results
- `^ ... ^` for info boxes
- Tables with `|` delimiters

**Good example structure:**
```
## What you need to do
The register office will tell you what you need to do when you contact them.

## Documents you'll get
When you register a death, you'll get:
- a certificate for burial or cremation
- death certificates (these cost £X each)

## Next steps
[Order death certificates online](/order-copy-birth-death-marriage-certificate)
```

---

## 4. Design Lessons

### What Makes a Flow Work Well

**1. Filter early**
Ask the most discriminating question first. If 40% of users are ineligible, find that out in Q1 and give them a clear "not for you" outcome immediately.

**2. Only ask what you need**
Every question should change the outcome. If a question doesn't affect routing or outcome content, don't ask it.

**3. One thing at a time**
Each question should ask one thing. "Do you work full-time or part-time, and how many hours?" is two questions.

**4. Progressive disclosure**
Only show follow-up questions when relevant. Don't ask about children's ages if the user said they have no children.

**5. Match user mental models**
Ask questions in the order users think about them. For "register a death": location first (that's what varies the process), then circumstances.

**6. Clear outcomes**
Users should immediately understand their result. Lead with the answer, then explain.

---

### Common Pitfalls to Avoid

**1. Too many questions**
If your flow has 15+ questions, users will abandon it. Look for ways to reduce or split into separate tools.

**2. Unnecessary branching**
Don't create separate branches when conditional content in a shared outcome would work. If outcomes are 80% identical, use one outcome with conditionals.

**3. Ambiguous options**
"Other" is rarely helpful. If users might need "other", your options aren't covering the real cases.

**4. Dead ends without guidance**
Every outcome—even "not eligible"—should tell users what to do next.

**5. Internal jargon**
Use plain language. "Category B licence" means nothing without "(car)".

**6. Asking the obvious**
Don't ask questions you could infer. If someone selected "Scotland" for location, don't ask "Are you in the UK?"

---

### Flow Design Checklist

Before building:
- [ ] What's the core question users are trying to answer?
- [ ] What's the minimum information needed to give an answer?
- [ ] Can any questions be eliminated or combined?
- [ ] Where are the natural exit points?

For each question:
- [ ] Does this question change the outcome?
- [ ] Are options mutually exclusive and comprehensive?
- [ ] Would users understand all the terms used?
- [ ] Is there hint text for anything ambiguous?

For each outcome:
- [ ] Is the result immediately clear?
- [ ] Does it tell users what to do next?
- [ ] Are there links to related guidance?

---

## Quick Reference: Question Types

| Type | Use for | Example |
|------|---------|---------|
| Radio | Single choice from list | "Where do you live?" |
| Checkbox | Multiple selections | "Which of these apply?" |
| Date | Specific date needed | "When is the baby due?" |
| Year | Year only | "What year did you start?" |
| Money | Currency amounts | "How much do you earn?" |
| Value | Numbers/text | "How many hours per week?" |
| Country | Country selection | "Where were you born?" |
| Postcode | UK postcodes | "What's your postcode?" |

---

## File Structure Reference

```
app/flows/
├── {flow_name}_flow.rb          # Flow definition (questions, routing)
└── {flow_name}_flow/
    ├── start.erb                # Landing page
    ├── questions/
    │   ├── question_one.erb     # Question template
    │   └── question_two.erb
    └── outcomes/
        ├── eligible.erb         # Outcome template
        └── not_eligible.erb
```

---

*Reference extracted from GOV.UK smart-answers repository, January 2026*
