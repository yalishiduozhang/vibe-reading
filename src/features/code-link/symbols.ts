import type { GitHubRepoFile, GitHubRepoIndex } from './github'

export type ExtractedCodeSymbol = {
  name: string
  lineNumber: number
}

export type RepoSymbolCacheEntry = {
  id: string
  symbol: string
  path: string
  fileName: string
  lineNumber: number
  targetUrl: string
  snippet?: string
}

export function buildRepoSymbolCache(
  repoIndex: GitHubRepoIndex,
  options: {
    maxSymbolsPerFile?: number
    maxEntries?: number
  } = {},
): RepoSymbolCacheEntry[] {
  const maxSymbolsPerFile = options.maxSymbolsPerFile ?? 2
  const maxEntries = options.maxEntries ?? 10
  const entries: RepoSymbolCacheEntry[] = []

  for (const file of repoIndex.keyFiles) {
    const symbols = extractCodeSymbols(file.text).slice(0, maxSymbolsPerFile)

    for (const symbol of symbols) {
      entries.push({
        id: `${file.path}:${symbol.name}:${symbol.lineNumber}`,
        symbol: symbol.name,
        path: file.path,
        fileName: file.name,
        lineNumber: symbol.lineNumber,
        targetUrl: buildGitHubLineTargetUrl(file.htmlUrl, symbol.lineNumber),
        snippet: buildSnippetWindow(file.text, symbol.lineNumber),
      })

      if (entries.length >= maxEntries) {
        return entries
      }
    }
  }

  return entries
}

export function buildIndexedSnippet(
  file: GitHubRepoFile,
  paragraphTerms: string[],
  preferredLineNumber?: number,
): string | undefined {
  const lines = file.text.split('\n')
  if (!lines.length) {
    return undefined
  }

  const centerLineNumber =
    preferredLineNumber ?? findSnippetAnchorLine(lines, paragraphTerms) ?? findFirstMeaningfulLine(lines)
  if (!centerLineNumber) {
    return undefined
  }

  return buildSnippetWindow(file.text, centerLineNumber)
}

export function buildGitHubLineTargetUrl(fileHtmlUrl: string, lineNumber?: number): string {
  return lineNumber ? `${fileHtmlUrl}#L${lineNumber}` : fileHtmlUrl
}

export function extractCodeSymbols(text: string): ExtractedCodeSymbol[] {
  const symbols: ExtractedCodeSymbol[] = []
  const seen = new Set<string>()
  const lines = text.split('\n')

  for (const [index, line] of lines.entries()) {
    const patterns = [
      /^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/,
      /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /^\s*(?:export\s+default\s+)?(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/,
      /^\s*(?:export\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?(?:\(|<)/,
    ]

    for (const pattern of patterns) {
      const match = line.match(pattern)
      const name = match?.[1]
      if (!name) {
        continue
      }

      const key = `${name}:${index + 1}`
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      symbols.push({
        name,
        lineNumber: index + 1,
      })
      break
    }
  }

  return symbols
}

export function splitSymbolTokens(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_./-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function buildSnippetWindow(text: string, centerLineNumber: number, radius = 2): string | undefined {
  const lines = text.split('\n')
  if (!lines.length) {
    return undefined
  }

  const startLine = Math.max(centerLineNumber - radius, 1)
  const endLine = Math.min(centerLineNumber + radius, lines.length)
  const snippetLines: string[] = []

  for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
    const line = lines[lineNumber - 1]?.replace(/\t/g, '  ').trimEnd() ?? ''
    snippetLines.push(`${String(lineNumber).padStart(4, ' ')} | ${truncateSnippetLine(line)}`)
  }

  if (!snippetLines.some((line) => line.trim())) {
    return undefined
  }

  return snippetLines.join('\n')
}

function findSnippetAnchorLine(lines: string[], paragraphTerms: string[]): number | null {
  for (const term of paragraphTerms) {
    const loweredTerm = term.toLowerCase()
    const matchedLineNumber = lines.findIndex((line) => line.toLowerCase().includes(loweredTerm))
    if (matchedLineNumber >= 0) {
      return matchedLineNumber + 1
    }
  }

  const definitionLineNumber = lines.findIndex((line) =>
    /^\s*(?:def|class|function|export\s+function|export\s+class|const\s+[A-Za-z_])/i.test(line),
  )
  if (definitionLineNumber >= 0) {
    return definitionLineNumber + 1
  }

  return null
}

function findFirstMeaningfulLine(lines: string[]): number | null {
  const lineNumber = lines.findIndex((line) => line.trim().length > 0)
  return lineNumber >= 0 ? lineNumber + 1 : null
}

function truncateSnippetLine(line: string): string {
  if (line.length <= 120) {
    return line
  }

  return `${line.slice(0, 117)}...`
}
