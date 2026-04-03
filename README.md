# PromptGraph

A multi-agent AI system that transforms natural-language project ideas into complete prompt architectures. Given a description like _"a quizzing platform for medical students"_, Prompter decomposes the project into modules, generates tailored system prompts with techniques like chain-of-thought and few-shot learning, designs inter-agent communication, scores quality across five dimensions, and outputs production-ready configuration files.

Built with [LangGraph](https://github.com/langchain-ai/langgraph) for orchestration and [Groq](https://groq.com/) for fast LLM inference.

## Architecture

```
Project Idea
     │
     ▼
┌──────────┐    ┌───────────┐    ┌──────────────────────┐
│ Analyzer │───▶│ Architect │───▶│ Communication Designer│
└──────────┘    └───────────┘    └──────────────────────┘
                                          │
                                          ▼
                                    ┌──────────┐
                              ┌────▶│ Packager │──▶ Output
                              │     └──────────┘
                              │
                         ┌────┴───┐     ┌─────────┐
                         │ Critic │◀───▶│ Refiner │
                         └────────┘     └─────────┘
                          (quality loop)
```

**6-agent pipeline:**

| Agent                      | Role                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| **Analyzer**               | Decomposes the idea into a `ModuleMap` with domain classification and interaction model         |
| **Architect**              | Generates `PromptArtifact` per AI module — technique selection, context slots, eval criteria    |
| **Communication Designer** | Creates an `InterAgentMap` — shared memory schema, handoff conditions, triggers                 |
| **Critic**                 | Scores each prompt on 5 dimensions (clarity, compliance, robustness, creativity, measurability) |
| **Refiner**                | Iteratively revises prompts that score below the quality threshold                              |
| **Packager**               | Assembles final JSON config, Markdown spec, and Python scaffolding                              |

The Critic-Refiner loop runs up to 3 iterations (configurable), only revising prompts that haven't passed.

## Installation

```bash
# Clone
git clone https://github.com/nvmaditya/Prompter.git
cd Prompter

# Install with dev dependencies
pip install -e ".[dev]"

# Configure
cp .env.example .env
# Edit .env and add your Groq API key
```

**Requirements:** Python >= 3.11

## Configuration

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile
```

Optional overrides:

| Variable                     | Default                   | Description                                               |
| ---------------------------- | ------------------------- | --------------------------------------------------------- |
| `GROQ_MODEL`                 | `llama-3.3-70b-versatile` | Groq model to use (`llama-3.1-8b-instant` also supported) |
| `PROMPTER_QUALITY_THRESHOLD` | `7.0`                     | Minimum critic score (0-10) for a prompt to pass          |
| `PROMPTER_MAX_ITERATIONS`    | `3`                       | Max critic-refiner loop iterations                        |
| `PROMPTER_RATE_LIMIT_TIER`   | `free`                    | `free` (adds delays between requests) or `paid`           |
| `PROMPTER_LLM_MAX_TOKENS`    | `4096`                    | Max response tokens per LLM call                          |
| `PROMPTER_VERBOSE`           | `false`                   | Enable debug logging                                      |

## Usage

### Generate prompts from an idea

```bash
prompter generate "a quizzing platform for medical students"
```

### Read idea from a file

```bash
prompter generate path/to/idea.txt
```

### Custom output directory

```bash
prompter generate "your project idea" -o ./my-output
```

### Interactive mode (review after analysis)

```bash
prompter interactive "your project idea"
```

This pauses after the Analyzer stage to show you the module breakdown. You can approve, modify, or cancel before the pipeline continues.

### Resume from checkpoint

If the pipeline fails partway through (e.g., rate limit), resume from the saved checkpoint:

```bash
prompter generate "your project idea" --resume .prompter_state/<run-id>
```

## Output

Prompter generates three artifacts in the output directory:

### `prompt_config.json`

Complete machine-readable configuration — all modules, prompts, context slots, communication maps, and quality scores. Validates against the `FinalOutputArtifact` Pydantic schema.

### `architecture_spec.md`

Human-readable Markdown document with:

- Project overview and module breakdown
- Full system prompts with technique explanations
- Inter-agent communication design
- Quality scores and improvement history

### `scaffolding/`

A starter Python project:

```
scaffolding/
├── prompts/           # System prompt .txt files per module
├── agents/            # Agent stub Python files
├── config.py          # Configuration template
├── main.py            # Orchestration entry point
└── README.md          # Setup instructions
```

## Project Structure

```
prompter/
├── prompter/
│   ├── agents/              # 6 agent implementations
│   ├── llm/                 # LLM client with 3-layer retry
│   ├── models/              # Pydantic data models
│   ├── output/              # JSON, Markdown, scaffold writers
│   ├── prompt_templates/    # System prompts for each agent
│   ├── utils/               # Checkpoint, logging, token counting
│   ├── cli.py               # Typer CLI
│   ├── config.py            # Settings via pydantic-settings
│   ├── graph.py             # LangGraph StateGraph builder
│   └── state.py             # PipelineState TypedDict
├── tests/
│   ├── unit/                # 5 test files (model, config, state, LLM, tokens)
│   ├── integration/         # 9 test files (all agents, graph, checkpoint, CLI)
│   └── regression/          # Real API smoke tests
├── docs/                    # PRD, SRS, architecture docs
├── .env.example
└── pyproject.toml
```

## Testing

```bash
# Run all mocked tests (fast, no API calls) — 190 tests
pytest tests/ -m "not slow" -v

# Run real API tests (requires valid GROQ_API_KEY) — 4 tests
pytest tests/regression/ -m slow -v

# Run everything
pytest tests/ -v
```

The test suite covers:

- **Unit tests** — Pydantic models, LLM client retry layers, JSON extraction, token counting, state creation
- **Integration tests** — Each agent end-to-end (mocked LLM), LangGraph routing, checkpoint round-trip, CLI validation
- **Regression tests** — Full pipeline against live Groq API

## Technical Details

### LLM Client (`prompter/llm/client.py`)

Three-layer retry:

1. **HTTP transport** — Tenacity exponential backoff for transient failures
2. **Rate limiting** — Enforced delays between requests for Groq free tier
3. **Schema self-healing** — When the LLM returns invalid JSON or wrong structure, automatically re-prompts with the validation error and schema

The client uses a compact schema representation (`_compact_schema`) that resolves `$ref` references and strips metadata, reducing token usage by ~59% compared to raw `model_json_schema()`.

### Checkpoint & Resume

Pipeline state is checkpointed to `.prompter_state/<run-id>/pipeline_state.json` after each agent stage. All Pydantic models survive serialization round-trips via a model registry with `__pydantic__` markers.

## License

MIT
