import { startTransition, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { buildContextCard, formatEvidenceRef } from '../../features/reader/context'
import { loadPdfDocument, renderPdfPage } from '../../features/reader/pdf'
import type { LoadedPdfDocument } from '../../features/reader/pdf'
import type {
  CodeCandidate,
  EvidenceAttribution,
  IdeaTag,
  ReaderPageSnapshot,
  ReaderParagraph,
  ReadingIntent,
  StoredIdea,
} from '../../features/reader/types'
import { ideaTags, readingIntents } from '../../features/reader/types'

const ideaStorageKey = 'openviberead.ideas.v1'
const repoStorageKey = 'openviberead.repo-source.v1'

type AssistTab = 'context' | 'code'
type PendingJump = {
  pageNumber: number
  paragraphId: string
} | null

export default function WorkspacePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const readerShellRef = useRef<HTMLDivElement | null>(null)
  const snapshotCacheRef = useRef<Record<string, ReaderPageSnapshot>>({})
  const selectedByPageRef = useRef<Record<number, string>>({})
  const pendingJumpRef = useRef<PendingJump>(null)
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
  const [cachedPageCount, setCachedPageCount] = useState(0)
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
    const cacheKey = makeCacheKey(currentPage, intent)

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

        snapshotCacheRef.current[cacheKey] = nextSnapshot
        setCachedPageCount(countCachedPages(snapshotCacheRef.current))
        const preferredParagraphId =
          pendingJumpRef.current?.pageNumber === nextSnapshot.pageNumber
            ? pendingJumpRef.current.paragraphId
            : selectedByPageRef.current[nextSnapshot.pageNumber]
        const nextSelectedParagraphId = resolveParagraphId(nextSnapshot, preferredParagraphId)
        const targetParagraph =
          nextSnapshot.paragraphs.find((paragraph) => paragraph.id === nextSelectedParagraphId) ?? null

        selectedByPageRef.current[nextSnapshot.pageNumber] = nextSelectedParagraphId
        if (pendingJumpRef.current?.pageNumber === nextSnapshot.pageNumber) {
          pendingJumpRef.current = null
        }

        startTransition(() => {
          setPageSnapshot(nextSnapshot)
          setRenderedIntent(intent)
          setSelectedParagraphId(nextSelectedParagraphId)
        })

        queueParagraphScroll(targetParagraph, preferredParagraphId ? 'smooth' : 'auto', {
          canvas: canvasRef.current,
          shell: readerShellRef.current,
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
  const isRenderingPage =
    Boolean(documentProxy) &&
    (pageSnapshot?.pageNumber !== currentPage || renderedIntent !== intent)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    event.target.value = ''

    if (!nextFile) {
      return
    }

    snapshotCacheRef.current = {}
    setCachedPageCount(0)
    selectedByPageRef.current = {}
    pendingJumpRef.current = null

    setError(null)
    setIsLoadingDocument(true)
    setDocumentProxy((currentDocument) => {
      if (currentDocument) {
        void currentDocument.destroy().catch(() => undefined)
      }

      return null
    })
    setCurrentPage(1)
    setPageSnapshot(null)
    setRenderedIntent(null)
    setSelectedParagraphId('')
    setPdfFile(nextFile)
  }

  function handleIntentChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextIntent = event.target.value as ReadingIntent
    if (nextIntent === intent) {
      return
    }

    setError(null)
    hydrateCachedSnapshot(currentPage, nextIntent)
    setIntent(nextIntent)
  }

  function handlePreviousPage() {
    if (!documentProxy) {
      return
    }

    const nextPage = Math.max(currentPage - 1, 1)
    if (nextPage === currentPage) {
      return
    }

    setError(null)
    hydrateCachedSnapshot(nextPage, intent)
    setCurrentPage(nextPage)
  }

  function handleNextPage() {
    if (!documentProxy) {
      return
    }

    const nextPage = Math.min(currentPage + 1, documentProxy.numPages)
    if (nextPage === currentPage) {
      return
    }

    setError(null)
    hydrateCachedSnapshot(nextPage, intent)
    setCurrentPage(nextPage)
  }

  function handleParagraphSelect(
    paragraphId: string,
    nextTab: AssistTab = 'context',
    scrollBehavior: ScrollBehavior = 'smooth',
  ) {
    if (!pageSnapshot) {
      return
    }

    const targetParagraph =
      pageSnapshot.paragraphs.find((paragraph) => paragraph.id === paragraphId) ?? null

    selectedByPageRef.current[currentPage] = paragraphId
    setSelectedParagraphId(paragraphId)
    setAssistTab(nextTab)
    queueParagraphScroll(targetParagraph, scrollBehavior, {
      canvas: canvasRef.current,
      shell: readerShellRef.current,
    })
  }

  function handleJumpToIdea(idea: StoredIdea) {
    setAssistTab('context')

    if (idea.pageNumber === currentPage) {
      handleParagraphSelect(idea.paragraphId, 'context')
      return
    }

    selectedByPageRef.current[idea.pageNumber] = idea.paragraphId
    pendingJumpRef.current = {
      pageNumber: idea.pageNumber,
      paragraphId: idea.paragraphId,
    }
    hydrateCachedSnapshot(idea.pageNumber, intent, idea.paragraphId)
    setCurrentPage(idea.pageNumber)
  }

  function handleJumpToEvidence(paragraphId: string) {
    handleParagraphSelect(paragraphId, 'context')
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

  function hydrateCachedSnapshot(
    pageNumber: number,
    nextIntent: ReadingIntent,
    preferredParagraphId?: string,
  ) {
    const cachedSnapshot = snapshotCacheRef.current[makeCacheKey(pageNumber, nextIntent)]
    if (!cachedSnapshot) {
      if (pageNumber !== pageSnapshot?.pageNumber) {
        setPageSnapshot(null)
        setRenderedIntent(null)
        setSelectedParagraphId('')
      }
      return
    }

    const nextSelectedParagraphId = resolveParagraphId(
      cachedSnapshot,
      preferredParagraphId ?? selectedByPageRef.current[pageNumber],
    )
    const targetParagraph =
      cachedSnapshot.paragraphs.find((paragraph) => paragraph.id === nextSelectedParagraphId) ?? null

    selectedByPageRef.current[pageNumber] = nextSelectedParagraphId
    setPageSnapshot(cachedSnapshot)
    setRenderedIntent(nextIntent)
    setSelectedParagraphId(nextSelectedParagraphId)
    queueParagraphScroll(targetParagraph, 'auto', {
      canvas: canvasRef.current,
      shell: readerShellRef.current,
    })
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
              <p className="reader-meta">Cached snapshots: {cachedPageCount}</p>
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
                <div ref={readerShellRef} className="reader-canvas-shell">
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
                        <div className="paragraph-card-meta">
                          <span>{paragraph.lineCount} lines</span>
                          <span>{paragraph.sentenceCount} sentences</span>
                        </div>
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
                  <ContextFieldBlock
                    attribution={contextCard.summary.attribution}
                    body={contextCard.summary.text}
                    title="Anchor Summary"
                  />
                  <ContextFieldBlock
                    attribution={contextCard.focusNote.attribution}
                    body={contextCard.focusNote.text}
                    title="Intent Lens"
                  />
                  <ContextFieldBlock
                    attribution={contextCard.whyItMatters.attribution}
                    body={contextCard.whyItMatters.text}
                    title="Why It Matters"
                  />
                  <section className="context-card-block">
                    <div className="context-block-head">
                      <h3>Key Terms</h3>
                    </div>
                    <div className="term-list">
                      {contextCard.terms.map((term) => (
                        <span key={term} className="term-chip">
                          {term}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section className="context-card-block">
                    <div className="context-block-head">
                      <h3>Evidence Chain</h3>
                      <span className="attribution-chip attribution-chip-quoted">quoted</span>
                    </div>
                    <div className="evidence-list">
                      {contextCard.evidenceRefs.map((reference) => (
                        <article key={`${reference.paragraphId}-${reference.sentenceStart}`} className="evidence-card">
                          <p className="evidence-label">{formatEvidenceRef(reference)}</p>
                          <p>{reference.excerpt}</p>
                          <button
                            className="ghost-button ghost-button-small"
                            onClick={() => handleJumpToEvidence(reference.paragraphId)}
                            type="button"
                          >
                            Jump to Paragraph
                          </button>
                        </article>
                      ))}
                    </div>
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
                    Candidate mappings are still heuristic. This layer is now
                    stable enough for the next step: replacing mock candidates
                    with real repo indexing while keeping the paragraph binding
                    intact.
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
                          <button className="ghost-button ghost-button-small" type="button">
                            Confirm
                          </button>
                          <button className="ghost-button ghost-button-small" type="button">
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
            <span>Ideas can now jump back to their bound paragraph anchor.</span>
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
                  <button
                    className="ghost-button ghost-button-small"
                    onClick={() => handleJumpToIdea(idea)}
                    type="button"
                  >
                    Jump to Source
                  </button>
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

type ContextFieldBlockProps = {
  attribution: EvidenceAttribution
  body: string
  title: string
}

function ContextFieldBlock({ attribution, body, title }: ContextFieldBlockProps) {
  return (
    <section className="context-card-block">
      <div className="context-block-head">
        <h3>{title}</h3>
        <span className={`attribution-chip attribution-chip-${attribution}`}>{attribution}</span>
      </div>
      <p>{body}</p>
    </section>
  )
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

function resolveParagraphId(
  snapshot: ReaderPageSnapshot,
  preferredParagraphId?: string,
): string {
  if (preferredParagraphId) {
    const match = snapshot.paragraphs.find((paragraph) => paragraph.id === preferredParagraphId)
    if (match) {
      return match.id
    }
  }

  return snapshot.paragraphs[0]?.id ?? ''
}

function queueParagraphScroll(
  paragraph: ReaderParagraph | null,
  behavior: ScrollBehavior,
  refs: {
    canvas: HTMLCanvasElement | null
    shell: HTMLDivElement | null
  },
) {
  if (!paragraph || !refs.canvas || !refs.shell) {
    return
  }

  const canvas = refs.canvas
  const shell = refs.shell

  window.requestAnimationFrame(() => {
    const canvasTop = canvas.offsetTop
    const anchorPosition = canvasTop + (canvas.clientHeight * paragraph.anchorTop) / 100
    const targetTop = Math.max(anchorPosition - shell.clientHeight * 0.28, 0)

    shell.scrollTo({
      top: targetTop,
      behavior,
    })
  })
}

function extractTerms(text: string): string[] {
  const titleCaseMatches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const lowercaseKeywords = text
    .toLowerCase()
    .match(/\b(model|dataset|training|module|loss|encoder|decoder|experiment|prompt|retrieval)\b/g) ?? []

  const uniqueTerms = new Set([...titleCaseMatches, ...lowercaseKeywords])
  return Array.from(uniqueTerms).slice(0, 5)
}

function countCachedPages(cache: Record<string, ReaderPageSnapshot>): number {
  return new Set(Object.keys(cache).map((key) => key.split(':')[0])).size
}

function makeCacheKey(pageNumber: number, intent: ReadingIntent): string {
  return `${pageNumber}:${intent}`
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
