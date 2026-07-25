export default function OpenSource() {
  return (
    <section className="section" id="open-source">
      <div className="section-inner">
        <div className="section-label rv">Open source</div>
        <h2 className="section-heading rv">
          Early-stage, MIT-licensed, contributions welcome
        </h2>

        <div className="oss-grid rv">
          <div>
            <div className="oss-label">License</div>
            <div className="oss-value">MIT</div>
          </div>
          <div>
            <div className="oss-label">Repository</div>
            <div className="oss-value">
              <a
                href="https://github.com/nvmaditya/PromptGraph"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/nvmaditya/PromptGraph
              </a>
            </div>
          </div>
          <div>
            <div className="oss-label">Stack</div>
            <div className="oss-value">LangGraph + Groq</div>
          </div>
          <div>
            <div className="oss-label">Requires</div>
            <div className="oss-value">Python ≥ 3.11</div>
          </div>
        </div>

        <p className="oss-body rv">
          This is an early project. The pipeline works, the test suite has 190+
          tests, and the output is usable, but there's plenty of room for
          improvement: better prompt techniques, more LLM providers, richer
          scaffolding templates. If multi-agent prompt engineering interests you,
          take a look at the code and open an issue or PR.
        </p>
      </div>
    </section>
  )
}
