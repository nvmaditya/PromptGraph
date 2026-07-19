# AI Technical Interview Coach

## Project idea

Build a multi-agent system that runs mock technical interviews for software engineering candidates. It should feel like a senior interviewer: present coding and system-design challenges, evaluate answers in real time, adapt difficulty to performance, give progressive hints when the candidate is stuck, and produce a structured feedback report at the end.

The product is not a coding platform with a full IDE. It is the **prompt and agent architecture** for conducting the interview conversationally (text first), with clear phase control and fair evaluation.

## Goals

- Run a complete mock interview session from kickoff through wrap-up report.
- Support experience tiers: Junior, Mid, Senior, Principal.
- Cover at least coding challenges and system-design discussion in one session.
- Adapt difficulty based on recent performance without hard-resetting context mid-phase.
- Provide progressive hints (small nudge → structural hint → partial approach) without dumping full solutions early.
- Produce a final report with scores, evidence snippets, and concrete practice recommendations.

## Non-goals

- Live collaborative code execution or remote pair-programming IDE.
- Video/audio proctoring or identity verification.
- Real company hiring decisions or ATS integration (v1).
- Multi-language UI; English text interview is enough for v1.

## Users / personas

- **Candidate**: prepares for FAANG-style or general backend/fullstack interviews; wants realistic pressure and actionable feedback.
- **Coach / educator** (secondary): may reuse the architecture with fixed rubrics and topic packs.

## Core capabilities

- Ingest resume summary + target job description (or role level + topics).
- Phase machine: intro / resume deep-dive → system design → coding → wrap-up.
- Generate level-appropriate questions from selected topics (e.g. distributed systems, databases, concurrency).
- Conversational Q&A with follow-up probes on trade-offs and complexity.
- Evaluate submitted solutions for correctness, Big-O, edge cases, and communication clarity.
- End-of-session performance report with dimension scores and next steps.

## Multi-agent shape (suggested)

### Interview Director (orchestrator)

- Coordinates phase transitions and next action.
- Inputs: resume/JD, phase history, time budget.

### Question Architect

- Generates coding or system-design prompts matched to tier and topics.
- Inputs: candidate profile, topic list, difficulty target.

### Live Interviewer

- Presents questions, probes answers, manages hint ladder.
- Boundary: professional, encouraging, critical; never leak full solutions on first request.

### Solution Evaluator

- Scores code/design answers for correctness, complexity, edges, architecture trade-offs.
- Inputs: question spec, candidate submission.

### Performance Critic

- Compiles the final report (technical + communication + adaptability).
- Inputs: evaluator scores, transcript highlights, phase outcomes.

## State and data

Persist for the session (and optionally across resume):

- Candidate profile (tier, topics, resume/JD text).
- Current phase and phase history.
- Active question + expected evaluation rubric.
- Transcript turns (or summarized turns) with timestamps.
- Hint level used per question.
- Running scores per dimension.
- Final report artifact when complete.

## Interfaces

- **Human I/O**: text chat (candidate answers in natural language or pasted code).
- **Session start inputs**: tier, topics, optional resume/JD text, time budget.
- **Outputs**: live interview dialogue + final Markdown/JSON feedback report.

## Quality and safety constraints

- Fair scoring: rubric-first; avoid personality or demographic bias in feedback language.
- No premature solution dump; hints escalate only after struggle signals or explicit request.
- Stay in character as interviewer; do not become a general coding assistant mid-interview.
- Mark uncertainty when evaluation is incomplete (e.g. missing code).
- Do not invent candidate credentials or work history not provided.

## Acceptance checks

- [ ] Session can complete all phases without manual phase commands from the user.
- [ ] Difficulty adjusts after a clearly weak or strong answer in a measurable way.
- [ ] Three-level hint ladder is documented and enforced in the Live Interviewer prompt.
- [ ] Final report includes scores, evidence, and at least three practice recommendations.
- [ ] Junior vs Principal question generation differs in scope and expected depth.
- [ ] Evaluator output is structured (not free-form only) so the report can cite it.
- [ ] System never claims to be a real employer or official interview result.
