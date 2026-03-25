import { demoSamples, type DemoSampleId } from './demoSamples'
import { fetchGitHubRepoIndex, type GitHubRepoIndex } from './github'
import {
  classifySampleRegressionDiagnosticReason,
  type RepoIndexSource,
  type SampleRegressionDiagnostic,
} from './regression'
import { enrichRepoIndex } from './storage'

export type RepoIndexResolution = {
  index: GitHubRepoIndex
  source: RepoIndexSource
  cacheUpdated: boolean
}

export type WarmSampleRegressionIndexesResult = {
  activeRepoResolution: RepoIndexResolution | null
  diagnostics: Partial<Record<DemoSampleId, SampleRegressionDiagnostic>>
  indexedCount: number
  reusedCount: number
  failedSamples: string[]
}

export function getCachedRepoIndex(
  cache: Record<string, GitHubRepoIndex>,
  repoSource: string,
): GitHubRepoIndex | null {
  return cache[repoSource] ?? null
}

export function storeRepoIndexInCache(
  cache: Record<string, GitHubRepoIndex>,
  nextIndex: GitHubRepoIndex,
): GitHubRepoIndex {
  const normalizedIndex = enrichRepoIndex(nextIndex)
  cache[normalizedIndex.repoUrl] = normalizedIndex
  return normalizedIndex
}

export function buildCachedSampleRegressionDiagnostic(
  index: GitHubRepoIndex,
  formatRelativeTime: (value: string) => string,
): SampleRegressionDiagnostic {
  return {
    status: 'cached',
    detail: `Reused cached index from ${formatRelativeTime(index.generatedAt)}.`,
  }
}

export function buildRefreshedSampleRegressionDiagnostic(
  index: GitHubRepoIndex,
  formatIdeaTime: (value: string) => string,
): SampleRegressionDiagnostic {
  return {
    status: 'refreshed',
    detail: `Fetched a fresh index at ${formatIdeaTime(index.generatedAt)}.`,
  }
}

export function buildSampleRegressionWarmStatus(
  indexedCount: number,
  reusedCount: number,
  failedSamples: string[],
): string {
  if (failedSamples.length) {
    return `Indexed ${indexedCount} sample repos, reused ${reusedCount}, failed: ${failedSamples.join(', ')}.`
  }

  if (indexedCount || reusedCount) {
    return `Indexed ${indexedCount} sample repos and reused ${reusedCount} cached indexes.`
  }

  return 'No sample indexes were updated.'
}

export async function resolveRepoIndex(
  cache: Record<string, GitHubRepoIndex>,
  repoSource: string,
  forceRefresh = false,
): Promise<RepoIndexResolution> {
  if (!forceRefresh) {
    const cachedIndex = getCachedRepoIndex(cache, repoSource)
    if (cachedIndex) {
      return {
        index: cachedIndex,
        source: 'cache',
        cacheUpdated: false,
      }
    }
  }

  return {
    index: storeRepoIndexInCache(cache, await fetchGitHubRepoIndex(repoSource)),
    source: 'network',
    cacheUpdated: true,
  }
}

export async function warmSampleRegressionIndexes(
  cache: Record<string, GitHubRepoIndex>,
  activeRepoSource: string,
  activeSampleId: DemoSampleId,
  forceRefresh: boolean,
  formatRelativeTime: (value: string) => string,
  formatIdeaTime: (value: string) => string,
  getErrorMessage: (error: unknown, fallbackMessage: string) => string,
): Promise<WarmSampleRegressionIndexesResult> {
  let indexedCount = 0
  let reusedCount = 0
  let activeRepoResolution: RepoIndexResolution | null = null
  const failedSamples: string[] = []
  const diagnostics: Partial<Record<DemoSampleId, SampleRegressionDiagnostic>> = {}

  for (const sample of demoSamples) {
    if (!forceRefresh) {
      const cachedIndex = getCachedRepoIndex(cache, sample.repoUrl)
      if (cachedIndex) {
        reusedCount += 1
        diagnostics[sample.id] = buildCachedSampleRegressionDiagnostic(cachedIndex, formatRelativeTime)

        if (sample.id === activeSampleId && activeRepoSource === sample.repoUrl) {
          activeRepoResolution = {
            index: cachedIndex,
            source: 'cache',
            cacheUpdated: false,
          }
        }
        continue
      }
    }

    try {
      const nextResolution = await resolveRepoIndex(cache, sample.repoUrl, true)
      indexedCount += 1
      diagnostics[sample.id] = buildRefreshedSampleRegressionDiagnostic(nextResolution.index, formatIdeaTime)

      if (sample.id === activeSampleId && activeRepoSource === sample.repoUrl) {
        activeRepoResolution = nextResolution
      }
    } catch (indexError: unknown) {
      const detail = getErrorMessage(indexError, 'Failed to index this sample repository.')
      failedSamples.push(sample.label)
      diagnostics[sample.id] = {
        status: 'failed',
        detail,
        reason: classifySampleRegressionDiagnosticReason(detail),
      }
    }
  }

  return {
    activeRepoResolution,
    diagnostics,
    indexedCount,
    reusedCount,
    failedSamples,
  }
}
