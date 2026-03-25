<div align="center">
  <img src="./docs/logo.svg" alt="OpenVibeRead Logo" width="160" height="160" />
  <h1>OpenVibeRead</h1>
  <p><em>An open-source research reading workbench for papers, code, and ideas.</em></p>
</div>

<br/>

[简体中文](./README.zh-CN.md)

OpenVibeRead is an open-source research reading workbench built around three linked workflows:

- **Read With Context** — inline, paragraph-level AI assistance directly adjacent to the original text.
- **Read With Code** — map paper methods and symbols to real GitHub repository implementations.
- **Read To Create** — capture reading-time ideas and expand them into structured output documents.

This is not a generic "PDF + chat" application. It is a purpose-built tool that keeps all three workflows in one continuous reading experience so researchers never have to leave the document.

## Feature Overview

### 1. Read With Context

Inline AI assistance appears next to each paragraph without covering the original text:

- **Paragraph-level context cards** — summary, translation, term definitions, and "why this paragraph matters"
- **Evidence-backed explanations** — every AI output is traceable to a specific paragraph anchor
- **Reading-intent modes** — choose a goal (Quick Overview, Method Deep Dive, Reproduction Path, Critical Review) to reprioritize which paragraphs receive emphasis
- **Jump-back behavior** — clicking an evidence link scrolls back to the source paragraph

### 2. Read With Code

Connect paper terminology to real source code without leaving the workspace:

- **GitHub repository indexing** — enter any `owner/repo` URL to index class definitions, function names, configuration keys, and file paths
- **Code candidates per paragraph** — for each paragraph, ranked candidate code targets (High / Medium / Low confidence) are generated automatically
- **Human-confirmed mappings** — confirm or reject each suggestion; decisions persist and improve future suggestions
- **Code-side backlinks** — navigate from a confirmed mapping back to the paper paragraph that references it
- **Supported file types** — `.py`, `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.yaml`, `.yml`, `.ipynb`

### 3. Read To Create

Turn reading-time insights into structured documents:

- **Paragraph-anchored idea capture** — tag an idea as Improvement, Question, Experiment, or Project while reading
- **Idea filtering** — filter captured ideas by tag, time range, or free text
- **AI document expansion** — select a set of ideas and generate a structured Markdown draft in one of three modes:
  - **Project Proposal** — problem framing, thesis, motivation, and open questions
  - **Experiment Plan** — methodology, validation strategy, expected results
  - **Reading Memo** — synthesis, reflections, and follow-up actions
- **Snapshot versioning** — save named snapshots of any draft, compare versions, and track idea evolution
- **Draft recovery** — unsaved work is automatically preserved in local storage
- **Markdown export** — copy or download any draft for use in external tools

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 with React Router 7 |
| Language | TypeScript 5 (strict mode) |
| PDF Processing | pdf.js (text extraction and rendering) |
| Build Tool | Vite 8 |
| Persistence | Browser LocalStorage (local-first, no backend required) |
| API Integration | GitHub REST API (direct browser fetch) |
| Styling | Custom CSS, dark theme with glassmorphism |

The application is fully client-side. No server is required. All user data (ideas, code-link decisions, repository cache) is stored in the browser's LocalStorage.

## Current Status

The project is in an active MVP implementation cycle (Phase 4–5).

**Completed:**
- Planning baseline and feature scope frozen
- Open-source landscape research archived
- Information architecture and wireframes committed
- Reader core: PDF anchoring, evidence schema, jump-back behavior
- Demo sample frozen (Segment Anything Model as primary test paper)
- Idea workspace: filtering, editing, draft recovery, named snapshots

**In progress:**
- Bidirectional code-link management
- Real GitHub repository indexing and code-target linking
- Code-side backlink resolution
- Lightweight draft versioning with snapshots

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node.js)

### Setup

```bash
# Install dependencies
npm install

# Start the development server (defaults to http://localhost:5173)
npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and build a production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all `.ts` and `.tsx` files |

### Project Structure

```
src/
├── app/
│   ├── App.tsx               # Root router (/, /workspace)
│   └── pages/
│       ├── HomePage.tsx      # Landing page
│       └── WorkspacePage.tsx # Main application UI
├── features/
│   ├── reader/               # PDF loading, rendering, and context cards
│   │   ├── pdf.ts            # pdf.js wrapper, paragraph extraction
│   │   ├── context.ts        # Context card building logic
│   │   └── types.ts          # Shared domain types
│   ├── code-link/            # Paper-to-code linking workflow
│   │   ├── github.ts         # GitHub API integration and repo indexing
│   │   ├── candidates.ts     # Code candidate generation and ranking
│   │   ├── symbols.ts        # Symbol cache and confidence ranking
│   │   ├── mappings.ts       # User decision tracking
│   │   ├── storage.ts        # LocalStorage persistence for repo index
│   │   ├── source.ts         # GitHub URL parsing
│   │   └── demoSamples.ts    # Pre-configured demo papers
│   └── idea-workspace/       # Idea capture and document expansion
│       ├── composer.ts       # Draft document generation
│       ├── snapshots.ts      # Snapshot versioning and comparison
│       └── storage.ts        # LocalStorage persistence for ideas and drafts
├── components/               # Shared UI components
├── lib/                      # Utilities and adapters
├── styles/
│   ├── global.css            # CSS variables and base element styles
│   └── app.css               # Page and workspace component styles
└── main.tsx                  # React entry point
```

### Key Data Flows

**Reading workflow**
1. User uploads a PDF file.
2. pdf.js extracts text blocks with y-position anchors.
3. Paragraphs are scored for importance based on the selected `ReadingIntent`.
4. Clicking a paragraph triggers `buildContextCard()` to generate a summary, terms, and evidence references.

**Code-linking workflow**
1. User enters a GitHub repo URL (`owner/repo`).
2. `fetchGitHubRepoIndex()` crawls the GitHub API and extracts symbols.
3. `buildCodeCandidates()` matches paragraph text against indexed symbols.
4. User confirms or rejects each suggestion; decisions are saved to LocalStorage.

**Idea-capture workflow**
1. User captures a paragraph as an idea with a tag and note.
2. Ideas are anchored to `(pageNumber, paragraphId)`.
3. User selects ideas and calls `buildIdeaDocumentDraft(ideas, mode)`.
4. The generated Markdown is saved as a draft and can be snapshotted or exported.

### LocalStorage Keys

All data is namespaced and versioned to avoid collisions:

```
openviberead.ideas.v1
openviberead.code-links.v1
openviberead.repo-source.v1
openviberead.composer-draft.v1
openviberead.composer-snapshots.v1
```

### Extending the Codebase

Each feature in `src/features/` is self-contained with its own types, storage helpers, and business logic. To add a new workflow:

1. Create a new folder under `src/features/`.
2. Define domain types in a `types.ts` file.
3. Add a `storage.ts` file to handle LocalStorage reads and writes.
4. Implement core logic in focused modules (one responsibility per file).
5. Wire the feature into `WorkspacePage.tsx`.

No external state management library is used. Features communicate through props and shared LocalStorage keys where needed.

## Documentation

Detailed planning and research documents live in [`docs/`](./docs):

| File | Description |
|------|-------------|
| [`docs/plan.md`](./docs/plan.md) | Master project plan with phases, milestones, and constraints |
| [`docs/feature_scope_v1.md`](./docs/feature_scope_v1.md) | P0 / P1 / P2 feature breakdown |
| [`docs/information_architecture.md`](./docs/information_architecture.md) | App structure and navigation model |
| [`docs/wireframes_v1.md`](./docs/wireframes_v1.md) | Low-fidelity interaction prototypes |
| [`docs/demo_sample_candidates.md`](./docs/demo_sample_candidates.md) | Pre-selected academic papers for testing |
| [`docs/opensource_reference_research.md`](./docs/opensource_reference_research.md) | Competitive analysis of similar tools |
| [`docs/existing_implementation_gap_matrix.md`](./docs/existing_implementation_gap_matrix.md) | Feature completeness tracking |
| [`docs/research_archive.md`](./docs/research_archive.md) | Literature and reference videos |
