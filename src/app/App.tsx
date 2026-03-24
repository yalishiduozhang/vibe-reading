import '../styles/app.css'

const pillars = [
  {
    title: 'Read With Context',
    description:
      'Keep AI support next to the paper itself with inline paragraph cards, reading-intent modes, and traceable evidence.',
  },
  {
    title: 'Read With Code',
    description:
      'Map method names, modules, and experiment settings from a paper to GitHub or local repositories with human-confirmed links.',
  },
  {
    title: 'Read To Create',
    description:
      'Capture ideas next to the triggering paragraph and expand them into proposals, experiment plans, and review documents.',
  },
]

const p0Features = [
  'Inline paragraph cards',
  'Reading-intent mode',
  'Paper-to-code linking',
  'Paragraph-bound idea capture',
  'AI-expanded idea documents',
  'Evidence-backed explanations',
]

const phaseZero = [
  'Approved planning baseline in docs/',
  'Open-source landscape research archived',
  'Feature scope locked for P0 / P1 / P2',
  'Web-first scaffold selected: Vite + React + TypeScript',
]

export default function App() {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">OpenVibeRead</p>
          <h1>Read papers, map code, grow ideas.</h1>
          <p className="hero-text">
            A web-first research reading workbench that treats inline reading,
            implementation mapping, and idea generation as one continuous flow.
          </p>
        </div>
        <div className="hero-panel">
          <span className="panel-label">Current Stage</span>
          <strong>Phase 1 kickoff</strong>
          <p>
            Repo structure and app scaffold are in place. Next up: information
            architecture, wireframes, and Reader Core MVP.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="card card-wide">
          <div className="section-head">
            <p className="section-kicker">Product Pillars</p>
            <h2>Three linked workflows define the project.</h2>
          </div>
          <div className="pillars-grid">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <p className="section-kicker">P0 Scope</p>
            <h2>First build target</h2>
          </div>
          <ul className="feature-list">
            {p0Features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="section-head">
            <p className="section-kicker">Planning Progress</p>
            <h2>What is already done</h2>
          </div>
          <ul className="feature-list feature-list-compact">
            {phaseZero.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card card-wide accent-card">
          <div className="section-head">
            <p className="section-kicker">Next Implementation Focus</p>
            <h2>Reader Core before feature sprawl.</h2>
          </div>
          <p className="accent-copy">
            The next meaningful milestone is not more AI surface area. It is a
            stable PDF reading base with reliable paragraph anchors, scroll
            recovery, and layout-aware positioning.
          </p>
        </section>
      </main>
    </div>
  )
}
