import { useRef, useEffect, useState, useCallback } from 'react'

const NS = 'http://www.w3.org/2000/svg'

// Layout constants
const W = 130, H = 52, G = 24, W2 = 115
const ROW1_Y = 40, ROW2_Y = 185
const X0 = 65

const AGENTS = [
  { id: 'analyzer',  lbl: 'Analyzer',      sub: 'ModuleMap',       row: 1 },
  { id: 'architect', lbl: 'Architect',      sub: 'PromptArtifacts', row: 1 },
  { id: 'commdes',   lbl: 'Comm Designer',  sub: 'InterAgentMap',   row: 1 },
  { id: 'critic',    lbl: 'Critic',         sub: '5-dim scoring',   row: 2 },
  { id: 'refiner',   lbl: 'Refiner',        sub: 'revision loop',   row: 2 },
  { id: 'packager',  lbl: 'Packager',       sub: 'final assembly',  row: 2 },
]

function getPositions() {
  const positions = []
  // Row 1: use W
  for (let i = 0; i < 3; i++) {
    positions.push({ x: X0 + i * (W + G), y: ROW1_Y, w: W })
  }
  // Row 2: use W2, aligned under commdes
  const row2Start = X0 + 2 * (W + G)
  for (let i = 0; i < 3; i++) {
    positions.push({ x: row2Start + i * (W2 + G), y: ROW2_Y, w: W2 })
  }
  return positions
}

function cx(pos) { return pos.x + pos.w / 2 }
function cy(pos) { return pos.y + H / 2 }

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

function buildDiagram(svg) {
  const positions = getPositions()
  const svgW = positions[5].x + positions[5].w + 70
  svg.setAttribute('viewBox', `0 0 ${svgW} 300`)

  const refs = { nodes: {}, edges: {} }

  // Helper: add text
  function addText(attrs, text) {
    const t = svgEl('text', attrs)
    t.textContent = text
    svg.appendChild(t)
    return t
  }

  // "idea ->" label
  addText(
    { x: X0 - 12, y: cy(positions[0]), class: 'hint-text', 'text-anchor': 'end' },
    'idea \u2192'
  )

  // Edges (behind nodes)
  function addLine(id, x1, y1, x2, y2) {
    const l = svgEl('line', { x1, y1, x2, y2, class: 'edge-line' })
    svg.appendChild(l)
    const ax = x2 - 5
    const arr = svgEl('polygon', {
      points: `${ax-4},${y2-4} ${ax+4},${y2} ${ax-4},${y2+4}`,
      class: 'edge-head',
    })
    svg.appendChild(arr)
    refs.edges[id] = { line: l, head: arr }
  }

  function addPath(id, d, cls) {
    const p = svgEl('path', { d, class: cls || 'edge-line', fill: 'none' })
    svg.appendChild(p)
    refs.edges[id] = { line: p, head: null }
    return p
  }

  function addArrow(id, x, y, dir) {
    let pts
    if (dir === 'right') pts = `${x-4},${y-4} ${x+4},${y} ${x-4},${y+4}`
    else if (dir === 'down') pts = `${x-4},${y-4} ${x},${y+4} ${x+4},${y-4}`
    else if (dir === 'up') pts = `${x-4},${y+4} ${x},${y-4} ${x+4},${y+4}`
    const arr = svgEl('polygon', { points: pts, class: 'edge-head' })
    svg.appendChild(arr)
    if (refs.edges[id]) refs.edges[id].head = arr
    return arr
  }

  // 0->1
  addLine('01', positions[0].x + positions[0].w, cy(positions[0]), positions[1].x, cy(positions[1]))
  // 1->2
  addLine('12', positions[1].x + positions[1].w, cy(positions[1]), positions[2].x, cy(positions[2]))
  // 2->3 (down turn)
  const turnY = ROW1_Y + H + 25
  addPath('23', `M ${cx(positions[2])},${positions[2].y + H} L ${cx(positions[2])},${turnY} L ${cx(positions[3])},${turnY} L ${cx(positions[3])},${positions[3].y}`)
  addArrow('23', cx(positions[3]), positions[3].y, 'down')

  // 3<->4 loop (dashed)
  const loopY1 = positions[3].y + 16
  const loopY2 = positions[3].y + H - 12
  const criticRight = positions[3].x + positions[3].w
  const refinerLeft = positions[4].x
  addPath('loop-fwd', `M ${criticRight},${loopY1} L ${refinerLeft},${loopY1}`, 'loop-line')
  addPath('loop-rev', `M ${refinerLeft},${loopY2} L ${criticRight},${loopY2}`, 'loop-line')

  // Loop label
  addText(
    { x: (criticRight + refinerLeft) / 2, y: positions[3].y + H + 18, class: 'hint-text', 'text-anchor': 'middle' },
    '\u2264 3 iterations'
  )

  // 3->5 bypass (below, to packager)
  const bypassY = ROW2_Y + H + 28
  addPath('35', `M ${cx(positions[3])},${positions[3].y + H} L ${cx(positions[3])},${bypassY} L ${cx(positions[5])},${bypassY} L ${cx(positions[5])},${positions[5].y + H}`)
  addArrow('35', cx(positions[5]), positions[5].y + H, 'up')

  // Bypass label
  const bypassLabel = addText(
    { x: (cx(positions[3]) + cx(positions[5])) / 2, y: bypassY + 14, class: 'hint-text', 'text-anchor': 'middle' },
    'all passed'
  )
  bypassLabel.style.opacity = '0'
  bypassLabel.style.transition = 'opacity 0.4s'
  refs.bypassLabel = bypassLabel

  // Output label
  const outLabel = addText(
    { x: positions[5].x + positions[5].w + 14, y: cy(positions[5]), class: 'hint-text', 'text-anchor': 'start' },
    '\u2192 output'
  )
  outLabel.style.opacity = '0'
  outLabel.style.transition = 'opacity 0.5s'
  refs.outLabel = outLabel

  // Nodes (on top of edges)
  AGENTS.forEach((agent, i) => {
    const pos = positions[i]
    const g = svgEl('g', { class: 'node-group' })
    g.appendChild(svgEl('rect', { class: 'node-rect', x: pos.x, y: pos.y, width: pos.w, height: H, rx: 7 }))
    const label = svgEl('text', { class: 'node-label', x: pos.x + pos.w / 2, y: pos.y + H / 2 - 7 })
    label.textContent = agent.lbl
    g.appendChild(label)
    const sub = svgEl('text', { class: 'node-sub', x: pos.x + pos.w / 2, y: pos.y + H / 2 + 10 })
    sub.textContent = agent.sub
    g.appendChild(sub)
    svg.appendChild(g)
    refs.nodes[agent.id] = g
  })

  return refs
}

async function runAnimation(refs, setStatus, setCardsVisible) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const { nodes, edges, bypassLabel, outLabel } = refs

  function nodeActive(id) {
    nodes[id].classList.add('node-active')
    nodes[id].classList.remove('node-done')
  }
  function nodeDone(id) {
    nodes[id].classList.remove('node-active')
    nodes[id].classList.add('node-done')
  }
  function edgeActive(id) {
    const e = edges[id]
    if (e.line) e.line.classList.add('edge-active')
    if (e.head) e.head.classList.add('head-active')
  }
  function edgeDone(id) {
    const e = edges[id]
    if (e.line) { e.line.classList.remove('edge-active'); e.line.classList.add('edge-done') }
    if (e.head) { e.head.classList.remove('head-active'); e.head.classList.add('head-done') }
  }
  function loopOn() {
    edges['loop-fwd'].line.classList.add('loop-active')
    edges['loop-rev'].line.classList.add('loop-active')
  }
  function loopOff() {
    edges['loop-fwd'].line.classList.remove('loop-active')
    edges['loop-rev'].line.classList.remove('loop-active')
  }

  // Analyzer
  setStatus({ text: 'Decomposing project idea into modules...', cls: 's-active' })
  nodeActive('analyzer')
  await wait(1100)
  nodeDone('analyzer')
  edgeActive('01')
  await wait(350)
  edgeDone('01')

  // Architect
  setStatus({ text: 'Generating prompt artifacts per module...', cls: 's-active' })
  nodeActive('architect')
  await wait(1100)
  nodeDone('architect')
  edgeActive('12')
  await wait(350)
  edgeDone('12')

  // Comm Designer
  setStatus({ text: 'Designing inter-agent communication...', cls: 's-active' })
  nodeActive('commdes')
  await wait(1100)
  nodeDone('commdes')
  edgeActive('23')
  await wait(500)
  edgeDone('23')

  // Critic
  setStatus({ text: 'Scoring prompts across 5 dimensions...', cls: 's-active' })
  nodeActive('critic')
  await wait(900)

  // Loop cycle
  setStatus({ text: '2 prompts below threshold, refining (1/3)...', cls: 's-loop' })
  loopOn()
  nodeDone('critic')
  nodeActive('refiner')
  await wait(1100)

  // Re-score
  setStatus({ text: 'Re-scoring refined prompts...', cls: 's-loop' })
  nodeDone('refiner')
  nodeActive('critic')
  await wait(900)

  // Passed
  setStatus({ text: 'All prompts passed quality threshold \u2713', cls: 's-active' })
  loopOff()
  nodeDone('critic')
  await wait(500)

  // Edge to Packager
  bypassLabel.style.opacity = '1'
  edgeActive('35')
  await wait(400)
  edgeDone('35')

  // Packager
  setStatus({ text: 'Assembling final outputs...', cls: 's-active' })
  nodeActive('packager')
  await wait(900)
  nodeDone('packager')

  // Output
  outLabel.style.opacity = '1'
  outLabel.style.fill = '#4ade80'
  setStatus({ text: '\u2713 Pipeline complete, 3 artifacts generated', cls: 's-done' })
  setCardsVisible(true)
}

export default function Pipeline() {
  const svgRef = useRef(null)
  const diagramRef = useRef(null)
  const animRan = useRef(false)
  const [status, setStatus] = useState({ text: '', cls: '' })
  const [cardsVisible, setCardsVisible] = useState(false)

  // Build SVG on mount
  useEffect(() => {
    if (svgRef.current && !diagramRef.current) {
      diagramRef.current = buildDiagram(svgRef.current)
    }
  }, [])

  // Observe for scroll trigger
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animRan.current && diagramRef.current) {
            animRan.current = true
            runAnimation(diagramRef.current, setStatus, setCardsVisible)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.25 }
    )
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section pipeline-section" id="pipeline">
      <div className="pipeline-header">
        <div className="section-label rv">The pipeline</div>
        <h2 className="section-heading rv">Six agents, one pass, production-ready output</h2>
        <p className="section-body rv">
          Your idea enters the pipeline. Each agent transforms the state and
          passes structured data forward. The Critic and Refiner form a quality
          loop: any prompt scoring below 7.0/10 gets revised, up to three times.
        </p>
      </div>

      <div className="pipeline-svg-wrap">
        <svg
          className="pipeline-svg"
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Animated diagram of the six-agent pipeline"
          data-testid="pipeline-svg"
        />
      </div>

      <div className={`pipeline-status ${status.cls}`} data-testid="pipeline-status">
        {status.text}
      </div>

      <div className={`output-cards${cardsVisible ? ' show' : ''}`} data-testid="output-cards">
        <div className="ocard">
          <div className="ocard-name">prompt_config.json</div>
          <div className="ocard-desc">
            Machine-readable config: modules, prompts, context slots,
            communication maps, quality scores.
          </div>
        </div>
        <div className="ocard">
          <div className="ocard-name">architecture_spec.md</div>
          <div className="ocard-desc">
            Human-readable spec with full system prompts, technique
            explanations, inter-agent design, and score history.
          </div>
        </div>
        <div className="ocard">
          <div className="ocard-name">scaffolding/</div>
          <div className="ocard-desc">
            Starter Python project: prompts/, agents/, config.py, main.py,
            ready to extend.
          </div>
        </div>
      </div>
    </section>
  )
}
