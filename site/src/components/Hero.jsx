import { useState, useCallback } from 'react'

export default function Hero() {
  const [copyText, setCopyText] = useState('click to copy')

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(
      'git clone https://github.com/nvmaditya/PromptGraph.git'
    )
    setCopyText('copied!')
    setTimeout(() => setCopyText('click to copy'), 2000)
  }, [])

  return (
    <section className="section hero" id="hero">
      <div className="section-inner">
        <h1 className="rv">
          Describe your project.{' '}
          <span className="hl">
            Get system prompts, agent communication, and a scaffolded codebase.
          </span>
        </h1>
        <p className="hero-sub rv">
          PromptGraph is a CLI tool that runs six AI agents in sequence to turn a
          plain-text idea into a complete multi-agent prompt architecture. Each
          agent builds on the last: decomposition, prompt generation,
          communication design, quality scoring, refinement, and packaging.
        </p>
        <button
          className="hero-cta rv"
          onClick={handleCopy}
          aria-label="Copy clone command"
        >
          <span className="prompt-char">$</span>
          <span>git clone https://github.com/nvmaditya/PromptGraph.git</span>
          <span className="copy-hint" style={copyText === 'copied!' ? { color: 'var(--green)' } : {}}>
            {copyText}
          </span>
        </button>
      </div>
    </section>
  )
}
