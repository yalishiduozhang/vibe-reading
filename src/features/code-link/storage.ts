import type { GitHubDirectorySnapshot, GitHubRepoEntry, GitHubRepoFile, GitHubRepoIndex } from './github'

const repoIndexCacheStorageKey = 'openviberead.repo-index-cache.v1'
const maxStoredRepoIndexes = 6

export function loadStoredRepoIndexCache(): Record<string, GitHubRepoIndex> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(repoIndexCacheStorageKey)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return {}
    }

    const indexes = parsed.filter(isGitHubRepoIndex)
    return Object.fromEntries(indexes.map((index) => [index.repoUrl, index]))
  } catch {
    return {}
  }
}

export function saveStoredRepoIndexCache(cache: Record<string, GitHubRepoIndex>) {
  if (typeof window === 'undefined') {
    return
  }

  const trimmedIndexes = Object.values(cache)
    .filter(isGitHubRepoIndex)
    .sort(
      (left, right) =>
        new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime() ||
        left.repoUrl.localeCompare(right.repoUrl),
    )
    .slice(0, maxStoredRepoIndexes)

  window.localStorage.setItem(repoIndexCacheStorageKey, JSON.stringify(trimmedIndexes))
}

function isGitHubRepoIndex(value: unknown): value is GitHubRepoIndex {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<GitHubRepoIndex>
  return (
    typeof candidate.source === 'string' &&
    typeof candidate.repoUrl === 'string' &&
    typeof candidate.owner === 'string' &&
    typeof candidate.repo === 'string' &&
    typeof candidate.readme === 'string' &&
    Array.isArray(candidate.rootEntries) &&
    candidate.rootEntries.every(isGitHubRepoEntry) &&
    Array.isArray(candidate.scannedDirectories) &&
    candidate.scannedDirectories.every(isGitHubDirectorySnapshot) &&
    Array.isArray(candidate.keyFiles) &&
    candidate.keyFiles.every(isGitHubRepoFile) &&
    typeof candidate.generatedAt === 'string'
  )
}

function isGitHubRepoEntry(value: unknown): value is GitHubRepoEntry {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<GitHubRepoEntry>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.path === 'string' &&
    (candidate.type === 'dir' || candidate.type === 'file') &&
    (candidate.size === null || typeof candidate.size === 'number') &&
    typeof candidate.htmlUrl === 'string'
  )
}

function isGitHubDirectorySnapshot(value: unknown): value is GitHubDirectorySnapshot {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<GitHubDirectorySnapshot>
  return (
    typeof candidate.path === 'string' &&
    Array.isArray(candidate.entries) &&
    candidate.entries.every(isGitHubRepoEntry)
  )
}

function isGitHubRepoFile(value: unknown): value is GitHubRepoFile {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<GitHubRepoFile>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.htmlUrl === 'string' &&
    typeof candidate.text === 'string'
  )
}
