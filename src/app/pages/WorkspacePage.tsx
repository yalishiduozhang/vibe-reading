import { startTransition, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { loadPdfDocument, renderPdfPage } from '../../features/reader/pdf'
import type { LoadedPdfDocument } from '../../features/reader/pdf'
import type {
  CodeCandidate,
  ContextCardData,
  IdeaTag,
  ReaderParagraph,
  ReaderPageSnapshot,
  ReadingIntent,
  StoredIdea,
} from '../../features/reader/types'
import { ideaTags, readingIntents } from '../../features/reader/types'

const ideaStorageKey = 'openviberead.ideas.v1'
const repoStorageKey = 'openviberead.repo-source.v1'

type AssistTab = 'context' | 'code'

export default function WorkspacePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputId = useId()
  const [intent, setIntent] = useState<ReadingIntent>('Method deep dive')
  const [assistTab, setAssistTab] = useState<AssistTab>('context')
  const [repoSource, setRepoSource] = useState(() => loadStoredRepo())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [documentProxy, setDocumentProxy] = useState<LoadedPdfDocument | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSnapshot, setPageSnapshot] = useState<ReaderPageSnapshot | null>(null)
  const [renderedIntent, setRenderedIntent] = useState<ReadingIntent | null>(null)
  const [selectedParagraphId, setSelectedParagraphId] = useState('')
  const [ideas, setIdeas] = useState<StoredIdea[]>(() => loadStoredIdeas())
  const [draftIdea, setDraftIdea] = useState('')
  const [draftTag, setDraftTag] = useState<IdeaTag>('Improvement')
  const [error, setError] = useState<string | null>(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)

  useEffect(() => {
    let isActive = true

    if (!pdfFile) {
      return () => {
        isActive = false
      }
    }

    void loadPdfDocument(pdfFile)
      .then((nextDocument) => {
        if (!isActive) {
          void nextDocument.destroy().catch(() => undefined)
          return
        }

        startTransition(() => {
          setDocumentProxy((currentDocument) => {
            if (currentDocument) {
              void currentDocument.destroy().catch(() => undefined)
            }

            return nextDocument
          })
          setCurrentPage(1)
          setPageSnapshot(null)
          setRenderedIntent(null)
          setSelectedParagraphId('')
        })
      })
      .catch((loadError: unknown) => {
        if (!isActive) {
          return
        }

        setError(getErrorMessage(loadError, 'Failed to load this PDF.'))
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingDocument(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [pdfFile])

  useEffect(() => {
    return () => {
      if (documentProxy) {
        void documentProxy.destroy().catch(() => undefined)
      }
    }
  }, [documentProxy])

  useEffect(() => {
    if (!documentProxy || !canvasRef.current) {
      return
    }

    let isActive = true

    void renderPdfPage({
      canvas: canvasRef.current,
      document: documentProxy,
      pageNumber: currentPage,
      intent,
    })
      .then((nextSnapshot) => {
        if (!isActive) {
          return
        }

        startTransition(() => {
          setPageSnapshot(nextSnapshot)
          setRenderedIntent(intent)
          setSelectedParagraphId((currentParagraphId) => {
            if (
              currentParagraphId &&
              nextSnapshot.paragraphs.some((paragraph) => paragraph.id === currentParagraphId)
            ) {
              return currentParagraphId
            }

            return nextSnapshot.paragraphs[0]?.id ?? ''
          })
        })
      })
      .catch((renderError: unknown) => {
        if (!isActive) {
          return
        }

        setError(getErrorMessage(renderError, 'Failed to render the current page.'))
      })

    return () => {
      isActive = false
    }
  }, [documentProxy, currentPage, intent])

  useEffect(() => {
    window.localStorage.setItem(ideaStorageKey, JSON.stringify(ideas))
  }, [ideas])

  useEffect(() => {
    window.localStorage.setItem(repoStorageKey, repoSource)
  }, [repoSource])

  const selectedParagraph =
    pageSnapshot?.paragraphs.find((paragraph) => paragraph.id === selectedParagraphId) ??
    pageSnapshot?.paragraphs[0] ??
    null
  const contextCard = buildContextCard(selectedParagraph, intent)
  const codeCandidates = buildCodeCandidates(selectedParagraph, repoSource)
  const pageStatus = documentProxy ? `Page ${currentPage} / ${documentProxy.numPages}` : 'No PDF loaded'
  const isRenderingPage = Boolean(documentProxy) &&
    (pageSnapshot?.pageNumber !== currentPage || renderedIntent !== intent)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    event.target.value = ''

    if (!nextFile) {
      return
    }

    setError(null)
    setIsLoadingDocument(true)
    setPdfFile(nextFile)
  }

  function handleIntentChange(event: ChangeEvent<HTMLSelectElement>) {
    setError(null)
    setIntent(event.target.value as ReadingIntent)
  }

  function handlePreviousPage() {
    setError(null)
    setCurrentPage((page) => Math.max(page - 1, 1))
  }

  function handleNextPage() {
    setError(null)
    setCurrentPage((page) => page + 1)
  }

  function handleParagraphSelect(paragraphId: string, nextTab: AssistTab = 'context') {
    setSelectedParagraphId(paragraphId)
    setAssistTab(nextTab)
  }

  function handleSaveIdea() {
    if (!selectedParagraph || !draftIdea.trim()) {
      return
    }

    const nextIdea: StoredIdea = {
      id: crypto.randomUUID(),
      text: draftIdea.trim(),
      tag: draftTag,
      pageNumber: selectedParagraph.pageNumber,
      paragraphId: selectedParagraph.id,
      quote: selectedParagraph.preview,
      createdAt: new Date().toISOString(),
    }

    setIdeas((currentIdeas) => [nextIdea, ...currentIdeas])
    setDraftIdea('')
  }

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar workspace-panel">
        <div className="workspace-brand">
          <Link className="back-link" to="/">
            Home
          </Link>
          <div>
            <p className="eyebrow">Reader Workspace</p>
            <h1>{pdfFile?.name ?? 'Phase 2 Reader Core'}</h1>
          </div>
        </div>

        <div className="workspace-controls">
          <label className="control-group">
            <span>Reading Intent</span>
            <select value={intent} onChange={handleIntentChange}>
              {readingIntents.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="control-group control-group-wide">
            <span>Repo Source</span>
            <input
              placeholder="GitHub URL or local path"
              value={repoSource}
              onChange={(event) => setRepoSource(event.target.value)}
            />
          </label>

          <div className="control-group control-group-file">
            <span>Paper PDF</span>
            <input
              id={fileInputId}
              accept="application/pdf"
              hidden
              type="file"
              onChange={handleFileChange}
            />
            <label className="upload-button" htmlFor={fileInputId}>
              {pdfFile ? 'Replace PDF' : 'Upload PDF'}
            </label>
          </div>
        </div>
      </header>

      {error ? <p className="status-banner status-error">{error}</p> : null}

      <div className="workspace-grid">
        <section className="workspace-panel reader-panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Paper Reader</p>
              <h2>{pageStatus}</h2>
            </div>
            <div className="reader-actions">
              <button
                className="ghost-button"
                disabled={!documentProxy || currentPage <= 1 || isRenderingPage}
                onClick={handlePreviousPage}
                type="button"
              >
                Previous
              </button>
              <button
                className="ghost-button"
                disabled={!documentProxy || currentPage >= (documentProxy?.numPages ?? 1) || isRenderingPage}
                onClick={handleNextPage}
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          {!documentProxy ? (
            <div className="empty-reader-state">
              <p className="empty-reader-label">Phase 2 target</p>
              <h3>Load a PDF to activate the reading workspace.</h3>
              <p>
                This milestone focuses on stable PDF rendering and current-page
                paragraph anchors. Once a paper is loaded, the right-side panels
                bind to the selected paragraph instead of floating independently.
              </p>
              <label className="primary-link" htmlFor={fileInputId}>
                Choose a PDF
              </label>
            </div>
          ) : (
            <div className="reader-body">
              <div className="reader-stage">
                <div className="reader-canvas-shell">
                  {isLoadingDocument || isRenderingPage ? (
                    <div className="reader-loading-chip">
                      {isLoadingDocument ? 'Loading PDF...' : 'Rendering page...'}
                    </div>
                  ) : null}
                  <canvas ref={canvasRef} className="reader-canvas" />
                  <div className="paragraph-anchor-rail" aria-label="Paragraph anchors">
                    {pageSnapshot?.paragraphs.map((paragraph, index) => (
                      <button
                        key={paragraph.id}
                        className={
                          paragraph.id === selectedParagraph?.id
                            ? 'paragraph-anchor paragraph-anchor-active'
                            : 'paragraph-anchor'
                        }
                        onClick={() => handleParagraphSelect(paragraph.id)}
                        style={{ top: `${paragraph.anchorTop}%` }}
                        type="button"
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="paragraph-list-shell">
                <div className="panel-subhead">
                  <h3>Current page paragraphs</h3>
                  <span>{pageSnapshot?.paragraphs.length ?? 0} anchors</span>
                </div>

                <div className="paragraph-list">
                  {pageSnapshot?.paragraphs.length ? (
                    pageSnapshot.paragraphs.map((paragraph) => (
                      <button
                        key={paragraph.id}
                        className={
                          paragraph.id === selectedParagraph?.id
                            ? 'paragraph-card paragraph-card-active'
                            : 'paragraph-card'
                        }
                        onClick={() => handleParagraphSelect(paragraph.id)}
                        type="button"
                      >
                        <div className="paragraph-card-head">
                          <span>{paragraph.evidenceLabel}</span>
                          <strong>Priority {paragraph.importance}/10</strong>
                        </div>
                        <p>{paragraph.preview}</p>
                        <small>{paragraph.rationale}</small>
                      </button>
                    ))
                  ) : (
                    <div className="empty-inline-state">
                      No paragraph anchors were extracted from this page. Try a
                      text-based paper PDF instead of a scanned document.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="workspace-panel assist-panel">
          <div className="panel-head panel-head-tight">
            <div>
              <p className="section-kicker">Near-Field Assist</p>
              <h2>Context and code stay tied to the paragraph.</h2>
            </div>
          </div>

          <div className="tab-switcher">
            <button
              className={assistTab === 'context' ? 'tab-button tab-button-active' : 'tab-button'}
              onClick={() => setAssistTab('context')}
              type="button"
            >
              Context
            </button>
            <button
              className={assistTab === 'code' ? 'tab-button tab-button-active' : 'tab-button'}
              onClick={() => setAssistTab('code')}
              type="button"
            >
              Code
            </button>
          </div>

          {assistTab === 'context' ? (
            <div className="context-panel-content">
              {selectedParagraph && contextCard ? (
                <>
                  <div className="selection-chip">Focused on {selectedParagraph.evidenceLabel}</div>
                  <section className="context-card-block">
                    <h3>Anchor Summary</h3>
                    <p>{contextCard.summary}</p>
                  </section>
                  <section className="context-card-block">
                    <h3>Intent Lens</h3>
                    <p>{contextCard.focusNote}</p>
                  </section>
                  <section className="context-card-block">
                    <h3>Why It Matters</h3>
                    <p>{contextCard.whyItMatters}</p>
                  </section>
                  <section className="context-card-block">
                    <h3>Key Terms</h3>
                    <div className="term-list">
                      {contextCard.terms.map((term) => (
                        <span key={term} className="term-chip">
                          {term}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section className="context-card-block">
                    <h3>Evidence</h3>
                    <p>{contextCard.evidence}</p>
                  </section>
                </>
              ) : (
                <div className="empty-inline-state">
                  Select a paragraph anchor from the reader to populate the
                  context panel.
                </div>
              )}
            </div>
          ) : (
            <div className="code-panel-content">
              <div className="panel-subhead panel-subhead-column">
                <h3>Repository mapping candidates</h3>
                <span>{repoSource || 'Connect a repo source to ground the mapping view.'}</span>
              </div>
              {selectedParagraph ? (
                <>
                  <p className="code-panel-note">
                    Candidate mappings are heuristic in this milestone. The
                    important part here is that the panel is already bound to the
                    current paragraph and ready for later indexing work.
                  </p>
                  <div className="candidate-list">
                    {codeCandidates.map((candidate) => (
                      <article key={candidate.id} className="candidate-card">
                        <div className="candidate-head">
                          <strong>{candidate.symbol}</strong>
                          <span>{candidate.confidence}</span>
                        </div>
                        <p className="candidate-path">{candidate.path}</p>
                        <p>{candidate.reason}</p>
                        <div className="candidate-actions">
                          <button className="ghost-button" type="button">
                            Confirm
                          </button>
                          <button className="ghost-button" type="button">
                            Reject
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-inline-state">
                  Pick a paragraph first. Code candidates are generated from the
                  active paragraph context.
                </div>
              )}
            </div>
          )}
        </aside>

        <aside className="workspace-panel idea-panel">
          <div className="panel-head panel-head-tight">
            <div>
              <p className="section-kicker">Idea Workspace</p>
              <h2>Capture thoughts without leaving the paper.</h2>
            </div>
            <span className="idea-count">{ideas.length} saved</span>
          </div>

          <div className="idea-input-shell">
            <p className="idea-source-label">
              {selectedParagraph
                ? `Bound to ${selectedParagraph.evidenceLabel}`
                : 'Select a paragraph to bind a new idea.'}
            </p>
            <textarea
              placeholder="This paragraph suggests a stronger baseline, a missing ablation, or a project direction..."
              rows={5}
              value={draftIdea}
              onChange={(event) => setDraftIdea(event.target.value)}
            />
            <div className="idea-form-row">
              <label className="control-group">
                <span>Tag</span>
                <select value={draftTag} onChange={(event) => setDraftTag(event.target.value as IdeaTag)}>
                  {ideaTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary-link primary-link-button"
                disabled={!selectedParagraph || !draftIdea.trim()}
                onClick={handleSaveIdea}
                type="button"
              >
                Save Idea
              </button>
            </div>
          </div>

          <div className="panel-subhead">
            <h3>Recent ideas</h3>
            <span>Stored locally for the upcoming composer flow.</span>
          </div>
          <div className="idea-list">
            {ideas.length ? (
              ideas.map((idea) => (
                <article key={idea.id} className="idea-card">
                  <div className="idea-card-head">
                    <span className="term-chip">{idea.tag}</span>
                    <small>{formatIdeaTime(idea.createdAt)}</small>
                  </div>
                  <p>{idea.text}</p>
                  <small>{`From p.${idea.pageNumber} / ${idea.paragraphId}`}</small>
                </article>
              ))
            ) : (
              <div className="empty-inline-state">
                No ideas yet. Save one from a paragraph and it will stay in local
                storage for the next document-composer milestone.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function buildContextCard(
  paragraph: ReaderParagraph | null,
  intent: ReadingIntent,
): ContextCardData | null {
  if (!paragraph) {
    return null
  }

  const sentences = paragraph.text.split(/(?<=[.!?])\s+/)
  const summary = sentences[0] ?? paragraph.preview
  const focusByIntent: Record<ReadingIntent, string> = {
    'Quick overview': 'Prioritize contribution framing, problem definition, and headline outcome.',
    'Method deep dive': 'Stay on operators, modules, architecture terms, and how the paragraph fits the pipeline.',
    'Reproduction path': 'Focus on datasets, configs, training details, and any implementation-sensitive phrasing.',
    'Critical review': 'Look for assumptions, baselines, limitations, and any language that hints at scope mismatch.',
  }

  return {
    summary,
    focusNote: `${focusByIntent[intent]} Current score: ${paragraph.importance}/10.`,
    whyItMatters: paragraph.rationale,
    evidence: `Bound to ${paragraph.evidenceLabel}. This is the minimum evidence hook the later inline card will rely on.`,
    terms: extractTerms(paragraph.text),
  }
}

function buildCodeCandidates(
  paragraph: ReaderParagraph | null,
  repoSource: string,
): CodeCandidate[] {
  if (!paragraph) {
    return []
  }

  const scope = extractTerms(paragraph.text)
  const primaryTerm = scope[0] ?? 'ReaderModule'
  const secondaryTerm = scope[1] ?? 'Config'
  const repoHint = normalizeRepoHint(repoSource)

  return [
    {
      id: `${paragraph.id}-candidate-1`,
      symbol: `${primaryTerm}Block`,
      path: `${repoHint}/src/${slugify(primaryTerm)}/core.py`,
      reason: `Name overlap between the paragraph focus and ${primaryTerm}. The paragraph carries the highest current-page priority score.`,
      confidence: 'High',
    },
    {
      id: `${paragraph.id}-candidate-2`,
      symbol: `${secondaryTerm.toLowerCase()}.yaml`,
      path: `${repoHint}/configs/train.yaml`,
      reason: `Useful when the paragraph mixes implementation details and experiment setup language.`,
      confidence: 'Medium',
    },
    {
      id: `${paragraph.id}-candidate-3`,
      symbol: `${primaryTerm}Runner`,
      path: `${repoHint}/scripts/evaluate.py`,
      reason: `Fallback candidate to support the planned manual confirmation flow.`,
      confidence: 'Low',
    },
  ]
}

function extractTerms(text: string): string[] {
  const titleCaseMatches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const lowercaseKeywords = text
    .toLowerCase()
    .match(/\b(model|dataset|training|module|loss|encoder|decoder|experiment|prompt|retrieval)\b/g) ?? []

  const uniqueTerms = new Set([...titleCaseMatches, ...lowercaseKeywords])
  return Array.from(uniqueTerms).slice(0, 5)
}

function loadStoredIdeas(): StoredIdea[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(ideaStorageKey)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredIdea)
  } catch {
    return []
  }
}

function loadStoredRepo(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(repoStorageKey) ?? ''
}

function isStoredIdea(value: unknown): value is StoredIdea {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredIdea>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.tag === 'string' &&
    typeof candidate.pageNumber === 'number' &&
    typeof candidate.paragraphId === 'string' &&
    typeof candidate.quote === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}

function formatIdeaTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time'
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeRepoHint(repoSource: string): string {
  const trimmed = repoSource.trim()
  if (!trimmed) {
    return 'repo'
  }

  const normalized = trimmed
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .split('/')
    .filter(Boolean)
    .slice(-2)
    .join('/')

  return normalized || 'repo'
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'module'
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
