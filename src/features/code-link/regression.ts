import type { CodeCandidate, ReaderParagraph } from '../reader/types'
import { buildCodeCandidates } from './candidates'
import { demoSamples, type DemoSample, type DemoSampleId } from './demoSamples'
import type { GitHubRepoIndex } from './github'

export type RepoIndexSource = 'none' | 'cache' | 'network'

export type SampleRegressionDiagnosticReason = 'network' | 'not-found' | 'rate-limit' | 'unsupported' | 'unknown'

export type SampleRegressionDiagnostic = {
  status: 'cached' | 'refreshed' | 'failed'
  detail?: string
  reason?: SampleRegressionDiagnosticReason
}

export type SampleRegressionPreview = {
  sample: DemoSample
  focusMatchCount: number
  topCandidate: CodeCandidate | null
  candidateCount: number
  usesIndexedRepo: boolean
  cacheSignals: string[]
  diagnosticDetail?: string
  refreshHint?: string
}

export function classifySampleRegressionDiagnosticReason(detail: string): SampleRegressionDiagnosticReason {
  const loweredDetail = detail.toLowerCase()

  if (/rate limit|api limit|too many requests|403/.test(loweredDetail)) {
    return 'rate-limit'
  }

  if (/404|not found|no such repo/.test(loweredDetail)) {
    return 'not-found'
  }

  if (/not a supported github repository url|unsupported github repository url/.test(loweredDetail)) {
    return 'unsupported'
  }

  if (/failed to fetch|network|load failed|timed out|timeout|temporarily unavailable|dns/.test(loweredDetail)) {
    return 'network'
  }

  return 'unknown'
}

export function buildRepoIndexStatusSignals(
  index: GitHubRepoIndex,
  source: RepoIndexSource,
  formatRelativeTime: (value: string) => string,
): string[] {
  const generatedAt = new Date(index.generatedAt).getTime()
  const elapsedMs = Date.now() - generatedAt
  const freshness =
    Number.isNaN(generatedAt) || elapsedMs >= 24 * 60 * 60 * 1000
      ? 'stale cache'
      : elapsedMs >= 60 * 60 * 1000
        ? 'recent cache'
        : 'fresh cache'
  const sourceLabel = source === 'network' ? 'live refresh' : 'cache hit'

  return [sourceLabel, freshness, `updated ${formatRelativeTime(index.generatedAt)}`]
}

export function buildSampleRegressionCacheSignals(
  index: GitHubRepoIndex | null,
  source: RepoIndexSource,
  diagnostic: SampleRegressionDiagnostic | undefined,
  formatRelativeTime: (value: string) => string,
): string[] {
  const prefix =
    diagnostic?.status === 'failed'
      ? ['warm failed', `error: ${formatSampleRegressionDiagnosticReason(diagnostic.reason)}`]
      : diagnostic?.status === 'refreshed'
        ? ['warm refreshed']
        : diagnostic?.status === 'cached'
          ? ['warm reused cache']
          : []

  if (!index) {
    return [...prefix, 'preset fallback']
  }

  return [...prefix, ...buildRepoIndexStatusSignals(index, source, formatRelativeTime)]
}

export function buildSampleRegressionRefreshHint(
  index: GitHubRepoIndex | null,
  diagnostic?: SampleRegressionDiagnostic,
): string | undefined {
  if (diagnostic?.status === 'failed') {
    switch (diagnostic.reason) {
      case 'rate-limit':
        return 'Try Refresh Sample Indexes later or reduce repeated refreshes to avoid the current GitHub API limit.'
      case 'not-found':
        return 'Check whether the sample repo URL or upstream default branch changed before retrying.'
      case 'unsupported':
        return 'Switch back to a supported GitHub repo URL before warming sample indexes again.'
      case 'network':
        return 'Try Refresh Sample Indexes after checking network availability or the upstream repo response.'
      default:
        return 'Try Refresh Sample Indexes again and inspect the diagnostic detail if the same failure repeats.'
    }
  }

  if (!index) {
    return 'Warm sample indexes to compare this paragraph against real repo artifacts instead of preset fallbacks.'
  }

  return undefined
}

export function buildSampleRegressionRepoIndexes(
  matchedDemoSample: DemoSample,
  activeRepoIndex: GitHubRepoIndex | null,
  repoIndexCache: Record<string, GitHubRepoIndex>,
): Partial<Record<DemoSampleId, GitHubRepoIndex>> {
  const indexes: Partial<Record<DemoSampleId, GitHubRepoIndex>> = {}

  for (const sample of demoSamples) {
    if (sample.id === matchedDemoSample.id && activeRepoIndex) {
      indexes[sample.id] = activeRepoIndex
      continue
    }

    const cachedIndex = repoIndexCache[sample.repoUrl]
    if (cachedIndex) {
      indexes[sample.id] = cachedIndex
    }
  }

  return indexes
}

export function buildSampleRegressionPreviews(
  paragraph: ReaderParagraph | null,
  sampleRepoIndexes: Partial<Record<DemoSampleId, GitHubRepoIndex>>,
  matchedDemoSample: DemoSample,
  activeRepoIndexSource: RepoIndexSource,
  diagnostics: Partial<Record<DemoSampleId, SampleRegressionDiagnostic>>,
  formatRelativeTime: (value: string) => string,
): SampleRegressionPreview[] {
  if (!paragraph) {
    return []
  }

  return demoSamples.map((sample) => {
    const sampleRepoIndex = sampleRepoIndexes[sample.id] ?? null
    const diagnostic = diagnostics[sample.id]
    const usesIndexedRepo = sampleRepoIndex !== null
    const candidates = buildCodeCandidates(
      paragraph,
      sample.repoUrl,
      sample,
      sampleRepoIndex,
    )

    return {
      sample,
      focusMatchCount: countSampleFocusMatches(sample, paragraph.text),
      topCandidate: candidates[0] ?? null,
      candidateCount: candidates.length,
      usesIndexedRepo,
      cacheSignals: buildSampleRegressionCacheSignals(
        sampleRepoIndex,
        sample.id === matchedDemoSample.id ? activeRepoIndexSource : 'cache',
        diagnostic,
        formatRelativeTime,
      ),
      diagnosticDetail: diagnostic?.detail,
      refreshHint: buildSampleRegressionRefreshHint(sampleRepoIndex, diagnostic),
    }
  })
}

function formatSampleRegressionDiagnosticReason(
  reason: SampleRegressionDiagnosticReason | undefined,
): string {
  switch (reason) {
    case 'rate-limit':
      return 'rate limit'
    case 'not-found':
      return 'repo not found'
    case 'unsupported':
      return 'unsupported source'
    case 'network':
      return 'network issue'
    default:
      return 'unknown'
  }
}

function countSampleFocusMatches(sample: DemoSample, paragraphText: string): number {
  const loweredParagraph = paragraphText.toLowerCase()

  return sample.mappingFocus.filter((focus) => {
    const loweredFocus = focus.toLowerCase()
    if (loweredParagraph.includes(loweredFocus)) {
      return true
    }

    return loweredFocus
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2)
      .some((token) => loweredParagraph.includes(token))
  }).length
}
