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
  targetUrl?: string
  lineNumber?: number
  reason: string
  signals?: string[]
  snippet?: string
  confidence: CodeCandidate['confidence']
  createdAt: string
}

export type CodeBacklinkGroup = {
  key: string
  symbol: string
  path: string
  targetUrl?: string
  lineNumber?: number
  snippet?: string
  paragraphs: StoredCodeLinkDecision[]
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
    targetUrl: candidate.targetUrl,
    lineNumber: candidate.lineNumber,
    reason: candidate.reason,
    signals: candidate.signals,
    snippet: candidate.snippet,
    confidence: candidate.confidence,
    createdAt: new Date().toISOString(),
  }
}

export function getCandidateDecisionKey(candidate: CodeCandidate, paragraph: ReaderParagraph): string {
  return `${paragraph.id}::${candidate.symbol}::${candidate.path}::${candidate.lineNumber ?? 'file'}`
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

export function getParagraphDecisionKeys(
  decisions: StoredCodeLinkDecision[],
  repoSource: string,
  paragraphId: string,
): Set<string> {
  return new Set(
    decisions
      .filter((decision) => decision.repoSource === repoSource && decision.paragraphId === paragraphId)
      .map((decision) => decision.candidateKey),
  )
}

export function getConfirmedCodeLinkDecisions(
  decisions: StoredCodeLinkDecision[],
  repoSource: string,
): StoredCodeLinkDecision[] {
  return decisions.filter((decision) => decision.repoSource === repoSource && decision.decision === 'confirmed')
}

export function countRejectedCodeLinkDecisions(
  decisions: StoredCodeLinkDecision[],
  repoSource: string,
  paragraphId: string,
): number {
  return decisions.filter(
    (decision) =>
      decision.repoSource === repoSource &&
      decision.paragraphId === paragraphId &&
      decision.decision === 'rejected',
  ).length
}

export function buildCodeBacklinkGroups(decisions: StoredCodeLinkDecision[]): CodeBacklinkGroup[] {
  const groups = new Map<string, CodeBacklinkGroup>()

  for (const decision of decisions) {
    const groupKey = decision.targetUrl ?? `${decision.path}::${decision.symbol}::${decision.lineNumber ?? 'file'}`
    const group = groups.get(groupKey)
    if (!group) {
      groups.set(groupKey, {
        key: groupKey,
        symbol: decision.symbol,
        path: decision.path,
        targetUrl: decision.targetUrl,
        lineNumber: decision.lineNumber,
        snippet: decision.snippet,
        paragraphs: [decision],
      })
      continue
    }

    if (!group.targetUrl && decision.targetUrl) {
      group.targetUrl = decision.targetUrl
    }

    if (!group.lineNumber && decision.lineNumber) {
      group.lineNumber = decision.lineNumber
    }

    if (!group.snippet && decision.snippet) {
      group.snippet = decision.snippet
    }

    if (!group.paragraphs.some((paragraph) => paragraph.paragraphId === decision.paragraphId)) {
      group.paragraphs.push(decision)
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      paragraphs: [...group.paragraphs].sort((left, right) => left.pageNumber - right.pageNumber),
    }))
    .sort(
      (left, right) =>
        right.paragraphs.length - left.paragraphs.length ||
        left.path.localeCompare(right.path) ||
        (left.lineNumber ?? 0) - (right.lineNumber ?? 0),
    )
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
    (candidate.targetUrl === undefined || typeof candidate.targetUrl === 'string') &&
    (candidate.lineNumber === undefined || typeof candidate.lineNumber === 'number') &&
    typeof candidate.reason === 'string' &&
    (candidate.signals === undefined ||
      (Array.isArray(candidate.signals) && candidate.signals.every((signal) => typeof signal === 'string'))) &&
    (candidate.snippet === undefined || typeof candidate.snippet === 'string') &&
    typeof candidate.confidence === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}
