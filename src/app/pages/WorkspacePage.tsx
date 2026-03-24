import { startTransition, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { buildCodeCandidates } from '../../features/code-link/candidates'
import {
  demoSamples,
  getDemoSampleById,
  matchDemoSampleBySource,
  primaryDemoSampleId,
  type DemoSampleId,
} from '../../features/code-link/demoSamples'
import {
  fetchGitHubRepoIndex,
  type GitHubRepoIndex,
} from '../../features/code-link/github'
import {
  buildCodeLinkDecision,
  getCandidateDecisionKey,
  loadStoredCodeLinkDecisions,
  saveStoredCodeLinkDecisions,
  type CodeLinkDecisionKind,
  type StoredCodeLinkDecision,
} from '../../features/code-link/mappings'
import { buildIdeaDocumentDraft, draftModes, type DraftMode } from '../../features/idea-workspace/composer'
import { analyzeRepoSource } from '../../features/code-link/source'
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
  const repoIndexCacheRef = useRef<Record<string, GitHubRepoIndex>>({})
  const selectedByPageRef = useRef<Record<number, string>>({})
  const pendingJumpRef = useRef<PendingJump>(null)
  const fileInputId = useId()

  const [intent, setIntent] = useState<ReadingIntent>('Method deep dive')
  const [assistTab, setAssistTab] = useState<AssistTab>('context')
  const [selectedDemoSampleId, setSelectedDemoSampleId] = useState<DemoSampleId>(primaryDemoSampleId)
  const [repoSource, setRepoSource] = useState(() => loadStoredRepo())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [documentProxy, setDocumentProxy] = useState<LoadedPdfDocument | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSnapshot, setPageSnapshot] = useState<ReaderPageSnapshot | null>(null)
  const [renderedIntent, setRenderedIntent] = useState<ReadingIntent | null>(null)
  const [selectedParagraphId, setSelectedParagraphId] = useState('')
  const [ideas, setIdeas] = useState<StoredIdea[]>(() => loadStoredIdeas())
  const [codeLinkDecisions, setCodeLinkDecisions] = useState<StoredCodeLinkDecision[]>(() =>
    loadStoredCodeLinkDecisions(),
  )
  const [cachedPageCount, setCachedPageCount] = useState(0)
  const [draftIdea, setDraftIdea] = useState('')
  const [draftTag, setDraftTag] = useState<IdeaTag>('Improvement')
  const [draftMode, setDraftMode] = useState<DraftMode>('Project proposal')
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([])
  const [repoIndex, setRepoIndex] = useState<GitHubRepoIndex | null>(null)
  const [repoIndexError, setRepoIndexError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [isIndexingRepo, setIsIndexingRepo] = useState(false)

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

  useEffect(() => {
    saveStoredCodeLinkDecisions(codeLinkDecisions)
  }, [codeLinkDecisions])

  useEffect(() => {
    const validIds = new Set(ideas.map((idea) => idea.id))
    setSelectedIdeaIds((currentIds) => currentIds.filter((ideaId) => validIds.has(ideaId)))
  }, [ideas])

  const selectedParagraph =
    pageSnapshot?.paragraphs.find((paragraph) => paragraph.id === selectedParagraphId) ??
    pageSnapshot?.paragraphs[0] ??
    null
  const selectedDemoSample = getDemoSampleById(selectedDemoSampleId)
  const contextCard = buildContextCard(selectedParagraph, intent)
  const repoAnalysis = analyzeRepoSource(repoSource)
  const matchedDemoSample =
    matchDemoSampleBySource(repoAnalysis.normalizedSource || repoSource) ?? selectedDemoSample
  const effectiveRepoSource = repoAnalysis.normalizedSource || repoSource.trim() || matchedDemoSample.repoUrl
  const codeCandidates = buildCodeCandidates(
    selectedParagraph,
    effectiveRepoSource,
    matchedDemoSample,
    repoIndex,
  )
  const paragraphDecisionKeys = new Set(
    selectedParagraph
      ? codeLinkDecisions
          .filter(
            (decision) =>
              decision.repoSource === effectiveRepoSource && decision.paragraphId === selectedParagraph.id,
          )
          .map((decision) => decision.candidateKey)
      : [],
  )
  const visibleCodeCandidates = selectedParagraph
    ? codeCandidates.filter(
        (candidate) => !paragraphDecisionKeys.has(getCandidateDecisionKey(candidate, selectedParagraph)),
      )
    : []
  const repoConfirmedDecisions = codeLinkDecisions.filter(
    (decision) => decision.repoSource === effectiveRepoSource && decision.decision === 'confirmed',
  )
  const paragraphRejectedCount = selectedParagraph
    ? codeLinkDecisions.filter(
        (decision) =>
          decision.repoSource === effectiveRepoSource &&
          decision.paragraphId === selectedParagraph.id &&
          decision.decision === 'rejected',
      ).length
    : 0
  const selectedIdeas = ideas.filter((idea) => selectedIdeaIds.includes(idea.id))
  const ideaDraft = buildIdeaDocumentDraft(selectedIdeas, draftMode)
  const pageStatus = documentProxy ? `Page ${currentPage} / ${documentProxy.numPages}` : 'No PDF loaded'
  const isRenderingPage =
    Boolean(documentProxy) &&
    (pageSnapshot?.pageNumber !== currentPage || renderedIntent !== intent)

  useEffect(() => {
    if (repoAnalysis.kind !== 'github') {
      setRepoIndex(null)
      setRepoIndexError(null)
      return
    }

    setRepoIndex(repoIndexCacheRef.current[effectiveRepoSource] ?? null)
    setRepoIndexError(null)
  }, [effectiveRepoSource, repoAnalysis.kind])

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

  function handleDemoSampleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSampleId = event.target.value as DemoSampleId
    const nextSample = getDemoSampleById(nextSampleId)

    setSelectedDemoSampleId(nextSampleId)
    setAssistTab('code')
    setRepoSource(nextSample.repoUrl)
  }

  async function handleIndexRepo(forceRefresh = false) {
    if (repoAnalysis.kind !== 'github') {
      return
    }

    if (!forceRefresh) {
      const cachedIndex = repoIndexCacheRef.current[effectiveRepoSource]
      if (cachedIndex) {
        setRepoIndex(cachedIndex)
        setRepoIndexError(null)
        return
      }
    }

    setIsIndexingRepo(true)
    setRepoIndexError(null)

    try {
      const nextIndex = await fetchGitHubRepoIndex(effectiveRepoSource)
      repoIndexCacheRef.current[effectiveRepoSource] = nextIndex
      setRepoIndex(nextIndex)
    } catch (indexError: unknown) {
      setRepoIndexError(getErrorMessage(indexError, 'Failed to index this GitHub repository.'))
    } finally {
      setIsIndexingRepo(false)
    }
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

  function jumpToParagraph(pageNumber: number, paragraphId: string, nextTab: AssistTab) {
    setAssistTab(nextTab)

    if (pageNumber === currentPage) {
      handleParagraphSelect(paragraphId, nextTab)
      return
    }

    selectedByPageRef.current[pageNumber] = paragraphId
    pendingJumpRef.current = {
      pageNumber,
      paragraphId,
    }
    hydrateCachedSnapshot(pageNumber, intent, paragraphId)
    setCurrentPage(pageNumber)
  }

  function handleJumpToIdea(idea: StoredIdea) {
    jumpToParagraph(idea.pageNumber, idea.paragraphId, 'context')
  }

  function handleJumpToEvidence(pageNumber: number, paragraphId: string) {
    jumpToParagraph(pageNumber, paragraphId, 'context')
  }

  function handleJumpToConfirmedCodeLink(decision: StoredCodeLinkDecision) {
    jumpToParagraph(decision.pageNumber, decision.paragraphId, 'code')
  }

  function handleCodeDecision(candidate: CodeCandidate, decision: CodeLinkDecisionKind) {
    if (!selectedParagraph) {
      return
    }

    const nextDecision = buildCodeLinkDecision(
      candidate,
      selectedParagraph,
      effectiveRepoSource,
      matchedDemoSample.id,
      decision,
    )

    setCodeLinkDecisions((currentDecisions) => [
      nextDecision,
      ...currentDecisions.filter(
        (currentDecision) =>
          !(
            currentDecision.repoSource === nextDecision.repoSource &&
            currentDecision.candidateKey === nextDecision.candidateKey
          ),
      ),
    ])
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

  function handleToggleIdeaSelection(ideaId: string) {
    setSelectedIdeaIds((currentIds) =>
      currentIds.includes(ideaId)
        ? currentIds.filter((currentId) => currentId !== ideaId)
        : [ideaId, ...currentIds],
    )
  }

  function handleClearIdeaSelection() {
    setSelectedIdeaIds([])
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
                            onClick={() => handleJumpToEvidence(reference.pageNumber, reference.paragraphId)}
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
                <span>{repoAnalysis.displayLabel}</span>
              </div>
              <section className="context-card-block repo-analysis-block">
                <div className="context-block-head">
                  <h3>Demo Pair</h3>
                  <span
                    className={`attribution-chip ${
                      matchedDemoSample.badge === 'Primary'
                        ? 'attribution-chip-summary'
                        : 'attribution-chip-inference'
                    }`}
                  >
                    {matchedDemoSample.badge}
                  </span>
                </div>
                <label className="control-group">
                  <span>Preset Sample</span>
                  <select value={selectedDemoSampleId} onChange={handleDemoSampleChange}>
                    {demoSamples.map((sample) => (
                      <option key={sample.id} value={sample.id}>
                        {sample.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p>{matchedDemoSample.selectionSummary}</p>
                <div className="demo-link-row">
                  <a
                    className="secondary-link secondary-link-inline"
                    href={matchedDemoSample.paperUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Paper
                  </a>
                  <a
                    className="secondary-link secondary-link-inline"
                    href={matchedDemoSample.repoUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Repo
                  </a>
                </div>
                <div className="repo-signal-list">
                  {matchedDemoSample.mappingFocus.map((focus) => (
                    <span key={focus} className="repo-signal-item">
                      {focus}
                    </span>
                  ))}
                </div>
                <ul className="demo-strength-list">
                  {matchedDemoSample.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
                <p className="repo-analysis-note">{matchedDemoSample.watchOut}</p>
              </section>
              <section className="context-card-block repo-analysis-block">
                <div className="context-block-head">
                  <h3>Source Analysis</h3>
                  <span className={`attribution-chip attribution-chip-${mapRepoKindToAttribution(repoAnalysis.kind)}`}>
                    {repoAnalysis.kind}
                  </span>
                </div>
                <p>{repoAnalysis.readiness}</p>
                <p className="repo-analysis-note">{repoAnalysis.normalizationNote}</p>
                <p className="repo-analysis-note">{repoAnalysis.limitation}</p>
                <div className="repo-signal-list">
                  {repoAnalysis.indexSignals.map((signal) => (
                    <span key={signal} className="repo-signal-item">
                      {signal}
                    </span>
                  ))}
                </div>
              </section>
              <section className="context-card-block repo-analysis-block">
                <div className="context-block-head">
                  <h3>Remote Repo Index</h3>
                  <span>{repoIndex ? `${repoIndex.keyFiles.length} files` : 'idle'}</span>
                </div>
                {repoAnalysis.kind === 'github' ? (
                  <>
                    <div className="candidate-actions">
                      <button
                        className="ghost-button ghost-button-small"
                        disabled={isIndexingRepo}
                        onClick={() => void handleIndexRepo(Boolean(repoIndex))}
                        type="button"
                      >
                        {isIndexingRepo ? 'Indexing...' : repoIndex ? 'Refresh Index' : 'Index Repo'}
                      </button>
                    </div>
                    {repoIndexError ? <p className="repo-analysis-note">{repoIndexError}</p> : null}
                    {repoIndex ? (
                      <>
                        <p className="repo-analysis-note">
                          {`Indexed ${repoIndex.scannedDirectories.length} directories and ${repoIndex.keyFiles.length} key files at ${formatIdeaTime(repoIndex.generatedAt)}.`}
                        </p>
                        <div className="repo-signal-list">
                          {repoIndex.rootEntries
                            .filter((entry) => entry.type === 'dir')
                            .slice(0, 6)
                            .map((entry) => (
                              <span key={entry.path} className="repo-signal-item">
                                {entry.path}
                              </span>
                            ))}
                        </div>
                        <div className="saved-mapping-list">
                          {repoIndex.keyFiles.slice(0, 4).map((file) => (
                            <article key={file.path} className="candidate-card candidate-card-compact">
                              <div className="candidate-head">
                                <strong>{file.name}</strong>
                                <span>{file.size} B</span>
                              </div>
                              <p className="candidate-path">{file.path}</p>
                              <p>{summarizeRepoSnippet(file.text)}</p>
                            </article>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="empty-inline-state">
                        Run indexing to pull README, root contents, and a small
                        set of key files from the public GitHub repo.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-inline-state">
                    Remote indexing is only available for GitHub repo sources in
                    the web-first prototype.
                  </div>
                )}
              </section>
              <section className="context-card-block repo-analysis-block">
                <div className="context-block-head">
                  <h3>Confirmation Memory</h3>
                  <span>{repoConfirmedDecisions.length} confirmed</span>
                </div>
                {repoConfirmedDecisions.length ? (
                  <div className="saved-mapping-list">
                    {repoConfirmedDecisions.slice(0, 5).map((decision) => (
                      <article key={decision.id} className="candidate-card candidate-card-compact">
                        <div className="candidate-head">
                          <strong>{decision.symbol}</strong>
                          <span>{decision.confidence}</span>
                        </div>
                        <p className="candidate-path">{decision.path}</p>
                        <p>{decision.paragraphLabel}</p>
                        <button
                          className="ghost-button ghost-button-small"
                          onClick={() => handleJumpToConfirmedCodeLink(decision)}
                          type="button"
                        >
                          Jump to Paragraph
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-inline-state">
                    No confirmed mappings yet. Save one candidate and it will
                    become reusable repo memory for this sample.
                  </div>
                )}
              </section>
              {selectedParagraph ? (
                <>
                  <p className="code-panel-note">
                    Candidate mappings are still heuristic, but the repo-source
                    boundary is now explicit: GitHub roots are normalized, local
                    paths are accepted as future bridge targets, and decisions
                    are persisted as confirmation memory.
                  </p>
                  <div className="panel-subhead">
                    <h3>Active candidates</h3>
                    <span>{visibleCodeCandidates.length} visible / {paragraphRejectedCount} dismissed</span>
                  </div>
                  <div className="candidate-list">
                    {visibleCodeCandidates.length ? (
                      visibleCodeCandidates.map((candidate) => (
                        <article key={candidate.id} className="candidate-card">
                          <div className="candidate-head">
                            <strong>{candidate.symbol}</strong>
                            <span>{candidate.confidence}</span>
                          </div>
                          <p className="candidate-path">{candidate.path}</p>
                          <p>{candidate.reason}</p>
                          <div className="candidate-actions">
                            <button
                              className="ghost-button ghost-button-small"
                              onClick={() => handleCodeDecision(candidate, 'confirmed')}
                              type="button"
                            >
                              Confirm
                            </button>
                            <button
                              className="ghost-button ghost-button-small"
                              onClick={() => handleCodeDecision(candidate, 'rejected')}
                              type="button"
                            >
                              Dismiss
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-inline-state">
                        All current candidates already have a saved decision for
                        this paragraph. Switch repo, sample, or paragraph to
                        generate a fresh candidate set.
                      </div>
                    )}
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
            <span>{selectedIdeas.length} selected for composer</span>
          </div>
          <div className="idea-list">
            {ideas.length ? (
              ideas.map((idea) => {
                const isSelected = selectedIdeaIds.includes(idea.id)
                return (
                  <article key={idea.id} className="idea-card">
                    <div className="idea-card-head">
                      <span className="term-chip">{idea.tag}</span>
                      <small>{formatIdeaTime(idea.createdAt)}</small>
                    </div>
                    <p>{idea.text}</p>
                    <small>{`From p.${idea.pageNumber} / ${idea.paragraphId}`}</small>
                    <div className="candidate-actions idea-card-actions">
                      <button
                        className="ghost-button ghost-button-small"
                        onClick={() => handleJumpToIdea(idea)}
                        type="button"
                      >
                        Jump to Source
                      </button>
                      <button
                        className="ghost-button ghost-button-small"
                        onClick={() => handleToggleIdeaSelection(idea.id)}
                        type="button"
                      >
                        {isSelected ? 'Remove from Draft' : 'Add to Draft'}
                      </button>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="empty-inline-state">
                No ideas yet. Save one from a paragraph and it will stay in local
                storage for the next document-composer milestone.
              </div>
            )}
          </div>

          <div className="panel-subhead panel-subhead-column">
            <h3>Composer Preview</h3>
            <span>{selectedIdeas.length ? `${selectedIdeas.length} ideas selected` : 'Select ideas to assemble a draft'}</span>
          </div>
          <div className="idea-composer-shell">
            <div className="idea-form-row">
              <label className="control-group">
                <span>Draft Mode</span>
                <select value={draftMode} onChange={(event) => setDraftMode(event.target.value as DraftMode)}>
                  {draftModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="ghost-button ghost-button-small"
                disabled={!selectedIdeas.length}
                onClick={handleClearIdeaSelection}
                type="button"
              >
                Clear Selection
              </button>
            </div>
            {selectedIdeas.length ? (
              <article className="context-card-block composer-card">
                <div className="context-block-head">
                  <h3>{ideaDraft.title}</h3>
                  <span>{draftMode}</span>
                </div>
                <pre className="composer-markdown-preview">{ideaDraft.markdown}</pre>
              </article>
            ) : (
              <div className="empty-inline-state">
                Select one or more ideas and the composer will assemble a
                structured draft preview here.
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

function mapRepoKindToAttribution(kind: 'github' | 'local' | 'unknown'): EvidenceAttribution {
  if (kind === 'github') {
    return 'quoted'
  }

  if (kind === 'local') {
    return 'summary'
  }

  return 'inference'
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

function summarizeRepoSnippet(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return 'No text preview available.'
  }

  if (normalized.length <= 180) {
    return normalized
  }

  return `${normalized.slice(0, 177)}...`
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
