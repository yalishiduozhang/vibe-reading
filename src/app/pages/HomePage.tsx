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
  'Reader Core anchors, evidence schema, and jump-back are working',
  'Primary demo sample is now frozen for paper-to-code linking',
  'Idea composer now supports draft editing and Markdown export',
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
          <strong>Phase 4 and Phase 5 in progress</strong>
          <p>
            The workspace has moved past reader-only work. The active push now
            combines real repo indexing, confirmation memory, and editable
            idea-to-draft output inside the same flow.
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
            <h2>Deepen code links and turn ideas into exportable drafts.</h2>
          </div>
          <p className="accent-copy">
            The active milestone is no longer just loading PDFs. The current
            work is tightening real repo artifacts, paper-to-code confirmation
            memory, and the editable Markdown draft path for captured ideas.
          </p>
        </section>
      </main>
    </div>
  )
}
