import type { CodeCandidate, ReaderParagraph } from '../reader/types'
import type { DemoSampleId } from './demoSamples'

const codeLinkStorageKey = 'openviberead.code-links.v1'

export type CodeLinkDecisionKind = 'confirmed' | 'rejected'

export type StoredCodeLinkDecision = {
  id: string
  candidateKey: string
  decision: CodeLinkDecisionKind
  repoSource: string
  sampleId: DemoSampleId | null
  pageNumber: number
  paragraphId: string
  paragraphLabel: string
  symbol: string
  path: string
  reason: string
  confidence: CodeCandidate['confidence']
  createdAt: string
}

export function buildCodeLinkDecision(
  candidate: CodeCandidate,
  paragraph: ReaderParagraph,
  repoSource: string,
  sampleId: DemoSampleId | null,
  decision: CodeLinkDecisionKind,
): StoredCodeLinkDecision {
  return {
    id: crypto.randomUUID(),
    candidateKey: getCandidateDecisionKey(candidate, paragraph),
    decision,
    repoSource,
    sampleId,
    pageNumber: paragraph.pageNumber,
    paragraphId: paragraph.id,
    paragraphLabel: paragraph.evidenceLabel,
    symbol: candidate.symbol,
    path: candidate.path,
    reason: candidate.reason,
    confidence: candidate.confidence,
    createdAt: new Date().toISOString(),
  }
}

export function getCandidateDecisionKey(candidate: CodeCandidate, paragraph: ReaderParagraph): string {
  return `${paragraph.id}::${candidate.symbol}::${candidate.path}`
}

export function loadStoredCodeLinkDecisions(): StoredCodeLinkDecision[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(codeLinkStorageKey)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredCodeLinkDecision)
  } catch {
    return []
  }
}

export function saveStoredCodeLinkDecisions(decisions: StoredCodeLinkDecision[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(codeLinkStorageKey, JSON.stringify(decisions))
}

function isStoredCodeLinkDecision(value: unknown): value is StoredCodeLinkDecision {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredCodeLinkDecision>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.candidateKey === 'string' &&
    (candidate.decision === 'confirmed' || candidate.decision === 'rejected') &&
    typeof candidate.repoSource === 'string' &&
    (candidate.sampleId === null || typeof candidate.sampleId === 'string') &&
    typeof candidate.pageNumber === 'number' &&
    typeof candidate.paragraphId === 'string' &&
    typeof candidate.paragraphLabel === 'string' &&
    typeof candidate.symbol === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.reason === 'string' &&
    typeof candidate.confidence === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}
