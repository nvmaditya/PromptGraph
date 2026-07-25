export default function Nav() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="nav" role="navigation" aria-label="Main">
      <div className="nav-inner">
        <div className="nav-logo">
          Prompt<span>Graph</span>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#pipeline" onClick={(e) => handleNavClick(e, 'pipeline')}>
              pipeline
            </a>
          </li>
          <li>
            <a href="#mechanism" onClick={(e) => handleNavClick(e, 'mechanism')}>
              how it works
            </a>
          </li>
          <li>
            <a
              href="#quickstart"
              onClick={(e) => handleNavClick(e, 'quickstart')}
            >
              quickstart
            </a>
          </li>
          <li>
            <a
              href="https://github.com/nvmaditya/PromptGraph"
              target="_blank"
              rel="noopener noreferrer"
            >
              github ↗
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
