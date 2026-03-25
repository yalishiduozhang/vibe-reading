import type { SampleRegressionDiagnostic } from './regression'
import type { GitHubRepoIndex } from './github'
import { enrichRepoIndex } from './storage'

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
