export type RepoSourceKind = 'github' | 'local' | 'unknown'

export type RepoSourceAnalysis = {
  kind: RepoSourceKind
  normalizedSource: string
  displayLabel: string
  normalizationNote: string
  indexSignals: string[]
  readiness: string
  limitation: string
}

export function analyzeRepoSource(input: string): RepoSourceAnalysis {
  const trimmed = input.trim()

  if (!trimmed) {
    return {
      kind: 'unknown',
      normalizedSource: '',
      displayLabel: 'No repo connected',
      normalizationNote: 'No normalization yet because the repo source is still empty.',
      indexSignals: [
        'Need a GitHub URL or a local repo path before code-link indexing can start.',
      ],
      readiness: 'Waiting for input',
      limitation: 'No repo source provided yet.',
    }
  }

  if (isGitHubUrl(trimmed)) {
    const normalizedSource = normalizeGitHubUrl(trimmed)
    return {
      kind: 'github',
      normalizedSource,
      displayLabel: extractRepoSlug(normalizedSource),
      normalizationNote:
        normalizedSource === trimmed
          ? 'GitHub repo root kept as entered.'
          : 'Normalized to the GitHub repo root for first-pass indexing.',
      indexSignals: [
        'Repo tree for folder and file-level terminology alignment.',
        'README for project-level method naming and setup hints.',
        'Config files for experiment settings and hyper-parameter mentions.',
        'Key source files for symbol candidates that echo the paper paragraph.',
      ],
      readiness: 'Ready for remote repo metadata indexing',
      limitation: 'Current prototype classifies and normalizes the source first; full remote indexing is the next milestone.',
    }
  }

  if (looksLikeLocalPath(trimmed)) {
    return {
      kind: 'local',
      normalizedSource: trimmed,
      displayLabel: trimmed.split('/').filter(Boolean).at(-1) ?? trimmed,
      normalizationNote: 'Local path is preserved as entered and waits for a desktop or backend bridge.',
      indexSignals: [
        'Repo tree and key directories once a local bridge is available.',
        'README and config scan for paper terminology overlap.',
        'Targeted source-file indexing for candidate symbols and modules.',
      ],
      readiness: 'Blocked on local bridge in web-first mode',
      limitation: 'Pure web mode cannot read arbitrary local folders directly; a backend or desktop bridge is needed.',
    }
  }

  return {
    kind: 'unknown',
    normalizedSource: trimmed,
    displayLabel: trimmed,
    normalizationNote: 'Input kept as entered because it does not match the supported repo-source patterns yet.',
    indexSignals: [
      'Try a GitHub repo URL such as https://github.com/owner/repo',
      'Or provide a local repo path once local-bridge support exists.',
    ],
    readiness: 'Input format not recognized yet',
    limitation: 'The current parser only recognizes GitHub URLs and path-like local repo inputs.',
  }
}

function isGitHubUrl(value: string): boolean {
  return (
    /^https?:\/\/(?:www\.)?github\.com\/[\w.-]+\/[\w.-]+(?:\/(?:tree|blob)\/[^?#]+)?\/?$/i.test(value) ||
    /^git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(value)
  )
}

export function normalizeGitHubUrl(value: string): string {
  if (value.startsWith('git@github.com:')) {
    const slug = value.replace(/^git@github\.com:/, '').replace(/\.git$/, '')
    return `https://github.com/${slug}`
  }

  const normalized = value
    .replace(/^https?:\/\/www\./i, 'https://')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')
  const match = normalized.match(/^https?:\/\/github\.com\/([\w.-]+\/[\w.-]+)/i)

  if (match) {
    return `https://github.com/${match[1]}`
  }

  return normalized
}

function extractRepoSlug(value: string): string {
  return value.replace(/^https?:\/\/github\.com\//, '')
}

function looksLikeLocalPath(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('~/') ||
    /^[A-Za-z]:\\/.test(value)
  )
}
