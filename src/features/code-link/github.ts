import { normalizeGitHubUrl } from './source'

const githubApiBase = 'https://api.github.com'
const directoryAccept = 'application/vnd.github.object+json'
const rawAccept = 'application/vnd.github.raw+json'
const maxScannedDirectories = 4
const maxInspectedFiles = 6
const maxFileSizeBytes = 180_000

const prioritizedDirectoryNames = [
  'segment_anything',
  'scripts',
  'src',
  'clip',
  'loralib',
  'examples',
  'configs',
  'config',
  'models',
  'model',
]

const preferredFileFragments = [
  'predictor',
  'automatic_mask_generator',
  'model',
  'clip',
  'layers',
  'config',
  'train',
  'eval',
  'readme',
]

const supportedFileExtensions = ['.py', '.ts', '.tsx', '.js', '.jsx', '.md', '.yaml', '.yml', '.ipynb']

export type GitHubRepoReference = {
  owner: string
  repo: string
  repoUrl: string
}

export type GitHubRepoEntry = {
  name: string
  path: string
  type: 'dir' | 'file'
  size: number | null
  htmlUrl: string
}

export type GitHubDirectorySnapshot = {
  path: string
  entries: GitHubRepoEntry[]
}

export type GitHubRepoFile = {
  name: string
  path: string
  size: number
  htmlUrl: string
  text: string
}

export type GitHubRepoIndex = {
  source: string
  repoUrl: string
  owner: string
  repo: string
  readme: string
  rootEntries: GitHubRepoEntry[]
  scannedDirectories: GitHubDirectorySnapshot[]
  keyFiles: GitHubRepoFile[]
  generatedAt: string
}

type GitHubFetch = typeof fetch

type RawContentsEntry = {
  type: string
  name: string
  path: string
  size?: number
  html_url?: string
}

type RawDirectoryResponse = {
  entries?: RawContentsEntry[]
}

function isDirectoryOrFileEntry(
  entry: RawContentsEntry,
): entry is RawContentsEntry & { type: 'dir' | 'file' } {
  return entry.type === 'dir' || entry.type === 'file'
}

export function parseGitHubRepoSource(source: string): GitHubRepoReference | null {
  const normalizedSource = normalizeGitHubUrl(source.trim())
  const match = normalizedSource.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i)

  if (!match) {
    return null
  }

  return {
    owner: match[1],
    repo: match[2],
    repoUrl: normalizedSource,
  }
}

export async function fetchGitHubRepoIndex(
  source: string,
  fetchImpl: GitHubFetch = fetch,
): Promise<GitHubRepoIndex> {
  const reference = parseGitHubRepoSource(source)
  if (!reference) {
    throw new Error('This repo source is not a supported GitHub repository URL.')
  }

  const rootEntries = await fetchDirectory(reference, '', fetchImpl)
  const readme = await fetchReadme(reference, fetchImpl)
  const directoriesToScan = pickDirectories(rootEntries)
  const scannedDirectories: GitHubDirectorySnapshot[] = []

  for (const directory of directoriesToScan) {
    const entries = await fetchDirectory(reference, directory.path, fetchImpl)
    scannedDirectories.push({
      path: directory.path,
      entries,
    })
  }

  const keyEntries = pickFiles(rootEntries, scannedDirectories)
  const keyFiles: GitHubRepoFile[] = []

  for (const entry of keyEntries) {
    const text = await fetchFileText(reference, entry.path, fetchImpl)
    keyFiles.push({
      name: entry.name,
      path: entry.path,
      size: entry.size ?? text.length,
      htmlUrl: entry.htmlUrl,
      text,
    })
  }

  return {
    source,
    repoUrl: reference.repoUrl,
    owner: reference.owner,
    repo: reference.repo,
    readme,
    rootEntries,
    scannedDirectories,
    keyFiles,
    generatedAt: new Date().toISOString(),
  }
}

async function fetchDirectory(
  reference: GitHubRepoReference,
  path: string,
  fetchImpl: GitHubFetch,
): Promise<GitHubRepoEntry[]> {
  const apiUrl = makeContentsApiUrl(reference, path)
  const response = await fetchImpl(apiUrl, {
    headers: {
      Accept: directoryAccept,
    },
  })

  if (!response.ok) {
    throw new Error(buildGitHubError(response.status, path || reference.repoUrl))
  }

  const payload = (await response.json()) as RawDirectoryResponse | RawContentsEntry[]
  const rawEntries = Array.isArray(payload) ? payload : payload.entries ?? []

  return rawEntries
    .filter(isDirectoryOrFileEntry)
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type,
      size: typeof entry.size === 'number' ? entry.size : null,
      htmlUrl: entry.html_url ?? buildFallbackHtmlUrl(reference.repoUrl, entry.path, entry.type),
    }))
}

async function fetchReadme(reference: GitHubRepoReference, fetchImpl: GitHubFetch): Promise<string> {
  const response = await fetchImpl(`${githubApiBase}/repos/${reference.owner}/${reference.repo}/readme`, {
    headers: {
      Accept: rawAccept,
    },
  })

  if (!response.ok) {
    return ''
  }

  return (await response.text()).trim()
}

async function fetchFileText(
  reference: GitHubRepoReference,
  path: string,
  fetchImpl: GitHubFetch,
): Promise<string> {
  const response = await fetchImpl(makeContentsApiUrl(reference, path), {
    headers: {
      Accept: rawAccept,
    },
  })

  if (!response.ok) {
    throw new Error(buildGitHubError(response.status, path))
  }

  return (await response.text()).trim()
}

function pickDirectories(entries: GitHubRepoEntry[]): GitHubRepoEntry[] {
  return entries
    .filter((entry) => entry.type === 'dir')
    .sort((left, right) => scoreDirectory(right.name) - scoreDirectory(left.name) || left.name.localeCompare(right.name))
    .slice(0, maxScannedDirectories)
}

function pickFiles(
  rootEntries: GitHubRepoEntry[],
  directories: GitHubDirectorySnapshot[],
): GitHubRepoEntry[] {
  const candidates = [...rootEntries, ...directories.flatMap((directory) => directory.entries)]

  return candidates
    .filter((entry) => entry.type === 'file')
    .filter((entry) => hasSupportedExtension(entry.path))
    .filter((entry) => (entry.size ?? 0) <= maxFileSizeBytes)
    .sort((left, right) => scoreFile(right.path) - scoreFile(left.path) || left.path.localeCompare(right.path))
    .slice(0, maxInspectedFiles)
}

function scoreDirectory(name: string): number {
  const exactIndex = prioritizedDirectoryNames.indexOf(name)
  if (exactIndex !== -1) {
    return 100 - exactIndex * 4
  }

  return 10
}

function scoreFile(path: string): number {
  const loweredPath = path.toLowerCase()
  let score = 0

  for (const fragment of preferredFileFragments) {
    if (loweredPath.includes(fragment)) {
      score += 20
    }
  }

  if (loweredPath.endsWith('.md')) {
    score += 6
  }

  if (loweredPath.endsWith('.py')) {
    score += 10
  }

  if (loweredPath.endsWith('.yaml') || loweredPath.endsWith('.yml')) {
    score += 8
  }

  return score
}

function hasSupportedExtension(path: string): boolean {
  const loweredPath = path.toLowerCase()
  return supportedFileExtensions.some((extension) => loweredPath.endsWith(extension))
}

function makeContentsApiUrl(reference: GitHubRepoReference, path: string): string {
  const encodedPath = encodeGitHubPath(path)
  if (!encodedPath) {
    return `${githubApiBase}/repos/${reference.owner}/${reference.repo}/contents`
  }

  return `${githubApiBase}/repos/${reference.owner}/${reference.repo}/contents/${encodedPath}`
}

function encodeGitHubPath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function buildFallbackHtmlUrl(repoUrl: string, path: string, type: 'dir' | 'file'): string {
  if (!path) {
    return repoUrl
  }

  if (type === 'dir') {
    return `${repoUrl}/tree/HEAD/${path}`
  }

  return `${repoUrl}/blob/HEAD/${path}`
}

function buildGitHubError(status: number, target: string): string {
  if (status === 403) {
    return `GitHub API refused access for ${target}. You may have hit the public rate limit.`
  }

  if (status === 404) {
    return `GitHub API could not find ${target}.`
  }

  return `GitHub API returned status ${status} while indexing ${target}.`
}
