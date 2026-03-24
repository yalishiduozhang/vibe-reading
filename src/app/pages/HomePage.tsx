import { Link } from 'react-router-dom'

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

const completedSteps = [
  'Approved planning baseline in docs/',
  'Open-source landscape research archived',
  'Information architecture and wireframes committed',
  'Reader Core MVP is now in implementation',
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">OpenVibeRead</p>
          <h1>Read papers, map code, grow ideas.</h1>
          <p className="hero-text">
            A research reading workbench that keeps context, code, and idea
            growth inside one continuous reading flow.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" to="/workspace">
              Open Workspace
            </Link>
            <a className="secondary-link" href="#phase-status">
              View Current Phase
            </a>
          </div>
        </div>
        <div className="hero-panel" id="phase-status">
          <span className="panel-label">Current Stage</span>
          <strong>Phase 2: Reader Core MVP</strong>
          <p>
            The project has moved past planning. The active focus is stable PDF
            reading, paragraph anchors, and a workspace layout that can support
            inline assist, code mapping, and idea capture.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="card card-wide">
          <div className="section-head">
            <p className="section-kicker">Product Pillars</p>
            <h2>Three linked workflows define the product.</h2>
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
            <h2>What the first release must prove</h2>
          </div>
          <ul className="feature-list">
            {p0Features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="section-head">
            <p className="section-kicker">Progress Baseline</p>
            <h2>Locked before implementation</h2>
          </div>
          <ul className="feature-list feature-list-compact">
            {completedSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card card-wide accent-card">
          <div className="section-head">
            <p className="section-kicker">Implementation Focus</p>
            <h2>PDF first, then paragraph-aware interaction.</h2>
          </div>
          <p className="accent-copy">
            The next milestone is a working reading workspace: a real PDF viewer,
            paragraph anchors for the current page, and adjacent panels that are
            already ready to host evidence, code links, and idea capture.
          </p>
        </section>
      </main>
    </div>
  )
}
