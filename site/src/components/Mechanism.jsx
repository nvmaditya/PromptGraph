export default function Mechanism() {
  return (
    <section className="section" id="mechanism">
      <div className="section-inner">
        <div className="section-label rv">Under the hood</div>
        <h2 className="section-heading rv">How quality gets enforced</h2>

        <div className="mechanism-grid">
          <div className="mech-item rv">
            <div className="mech-title">Five-dimension critic scoring</div>
            <div className="mech-body">
              Every generated prompt is scored independently on five axes. A
              prompt must reach 7.0/10 on each to pass. Scores below that
              threshold trigger the Refiner, which receives the specific failing
              dimensions and the original score rationale as context for its
              revision.
              <div className="score-dims">
                <span className="score-dim">clarity</span>
                <span className="score-dim">compliance</span>
                <span className="score-dim">robustness</span>
                <span className="score-dim">creativity</span>
                <span className="score-dim">measurability</span>
              </div>
            </div>
          </div>

          <div className="mech-item rv">
            <div className="mech-title">Schema self-healing retry</div>
            <div className="mech-body">
              The LLM client has a three-layer retry stack. Layer one handles
              HTTP transport failures with exponential backoff. Layer two
              enforces rate limits for Groq's free tier. Layer three catches
              invalid JSON or schema mismatches: when the LLM returns a response
              that doesn't match the expected Pydantic model, the client
              automatically re-prompts with the validation error and a compact
              schema representation that uses ~59% fewer tokens than
              raw <code>model_json_schema()</code>.
            </div>
          </div>

          <div className="mech-item rv">
            <div className="mech-title">Checkpoint and resume</div>
            <div className="mech-body">
              Pipeline state is checkpointed
              to <code>.prompter_state/&lt;run-id&gt;/pipeline_state.json</code> after
              every agent stage. If a run fails (rate limit, network error,
              anything), resume from the last successful stage
              with <code>--resume</code> instead of re-running the entire
              pipeline. All Pydantic models survive serialization round-trips via
              a model registry.
            </div>
          </div>

          <div className="mech-item rv">
            <div className="mech-title">Interactive review</div>
            <div className="mech-body">
              The <code>interactive</code> command pauses after the Analyzer to
              show you the module decomposition before the rest of the pipeline
              runs. You can approve, modify, or cancel. Useful when you want to
              sanity-check the breakdown before committing API calls to prompt
              generation.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
