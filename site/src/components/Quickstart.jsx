import { useCallback } from 'react'

function CopyButton({ text }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    const btn = document.activeElement
    if (btn) {
      btn.textContent = 'copied!'
      btn.style.color = 'var(--green)'
      setTimeout(() => {
        btn.textContent = 'copy'
        btn.style.color = ''
      }, 2000)
    }
  }, [text])

  return (
    <button className="cp-btn" onClick={handleCopy} aria-label="Copy to clipboard">
      copy
    </button>
  )
}

function Terminal({ title, copyText, children }) {
  return (
    <div className="terminal">
      <div className="term-bar">
        <span className="term-dot" />
        <span className="term-dot" />
        <span className="term-dot" />
        <span className="term-title">{title}</span>
      </div>
      <div className="term-body">
        {copyText && <CopyButton text={copyText} />}
        {children}
      </div>
    </div>
  )
}

export default function Quickstart() {
  return (
    <section className="section" id="quickstart">
      <div className="section-inner">
        <div className="section-label rv">Get started</div>
        <h2 className="section-heading rv">Three minutes to your first run</h2>

        <div className="qs-steps">
          <div className="rv">
            <div className="qs-label">Install</div>
            <Terminal
              title="terminal"
              copyText={'git clone https://github.com/nvmaditya/PromptGraph.git\ncd PromptGraph\npip install -e ".[dev]"'}
            >
              <span className="ln"><span className="p">$</span> <span className="c">git clone</span> <span className="s">https://github.com/nvmaditya/PromptGraph.git</span></span>
              <span className="ln"><span className="p">$</span> <span className="c">cd</span> PromptGraph</span>
              <span className="ln"><span className="p">$</span> <span className="c">pip install</span> <span className="f">-e</span> <span className="s">".[dev]"</span></span>
            </Terminal>
          </div>

          <div className="rv">
            <div className="qs-label">Configure</div>
            <Terminal
              title=".env"
              copyText={'GROQ_API_KEY=your-api-key-here\nGROQ_MODEL=llama-3.3-70b-versatile'}
            >
              <span className="ln"><span className="c">GROQ_API_KEY</span>=<span className="s">your-api-key-here</span></span>
              <span className="ln"><span className="c">GROQ_MODEL</span>=<span className="s">llama-3.3-70b-versatile</span></span>
            </Terminal>
          </div>

          <div className="rv">
            <div className="qs-label">Generate</div>
            <Terminal
              title="terminal"
              copyText={'prompter generate "a quizzing platform for medical students"'}
            >
              <span className="ln"><span className="p">$</span> <span className="c">prompter generate</span> <span className="s">"a quizzing platform for medical students"</span></span>
              <span className="ln" />
              <span className="ln"><span className="o">▸ Analyzing project idea...</span></span>
              <span className="ln"><span className="o">▸ Generating prompt artifacts for 4 modules...</span></span>
              <span className="ln"><span className="o">▸ Designing inter-agent communication...</span></span>
              <span className="ln"><span className="o">▸ Critic scoring: 4/4 prompts passed (avg 8.2/10)</span></span>
              <span className="ln"><span className="o">▸ Packaging outputs...</span></span>
              <span className="ln" />
              <span className="ln"><span className="ok">✓ Generated to ./output/</span></span>
              <span className="ln"><span className="o">  prompt_config.json  architecture_spec.md  scaffolding/</span></span>
            </Terminal>
          </div>

          <div className="rv">
            <div className="qs-label">Other commands</div>
            <Terminal title="terminal">
              <span className="ln"><span className="cm"># Interactive mode: review module breakdown first</span></span>
              <span className="ln"><span className="p">$</span> <span className="c">prompter interactive</span> <span className="s">"your project idea"</span></span>
              <span className="ln" />
              <span className="ln"><span className="cm"># Resume a failed run from checkpoint</span></span>
              <span className="ln"><span className="p">$</span> <span className="c">prompter generate</span> <span className="s">"your idea"</span> <span className="f">--resume</span> .prompter_state/&lt;run-id&gt;</span>
              <span className="ln" />
              <span className="ln"><span className="cm"># Read idea from a file</span></span>
              <span className="ln"><span className="p">$</span> <span className="c">prompter generate</span> path/to/idea.md <span className="f">-o</span> ./my-output</span>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  )
}
