import type { CodeCandidate, ReaderParagraph } from '../reader/types'
import type { DemoSample } from './demoSamples'
import type { GitHubRepoFile, GitHubRepoIndex } from './github'

type ExtractedCodeSymbol = {
  name: string
  lineNumber: number
}

type RankedSymbolMatch = {
  name: string
  lineNumber: number
  score: number
  matches: string[]
}

export function buildCodeCandidates(
  paragraph: ReaderParagraph | null,
  repoSource: string,
  sample: DemoSample | null,
  repoIndex: GitHubRepoIndex | null,
): CodeCandidate[] {
  if (!paragraph) {
    return []
  }

  const indexedCandidates = repoIndex ? buildIndexedCodeCandidates(paragraph, repoIndex) : []
  if (indexedCandidates.length) {
    return indexedCandidates
  }

  const sampleCandidates = sample ? buildSampleCodeCandidates(sample, paragraph, repoSource) : []
  if (sampleCandidates.length) {
    return sampleCandidates
  }

  const scope = extractTerms(paragraph.text)
  const primaryTerm = scope[0] ?? 'ReaderModule'
  const secondaryTerm = scope[1] ?? 'Config'

  return [
    {
      id: `${paragraph.id}-candidate-1`,
      symbol: `${primaryTerm}Block`,
      path: buildRepoPath(repoSource, `src/${slugify(primaryTerm)}/core.py`),
      reason: `Name overlap between the paragraph focus and ${primaryTerm}. The paragraph carries the highest current-page priority score.`,
      signals: [`term overlap: ${primaryTerm}`, 'fallback structure guess'],
      confidence: 'High',
    },
    {
      id: `${paragraph.id}-candidate-2`,
      symbol: `${secondaryTerm.toLowerCase()}.yaml`,
      path: buildRepoPath(repoSource, 'configs/train.yaml'),
      reason: 'Useful when the paragraph mixes implementation details and experiment setup language.',
      signals: [`term overlap: ${secondaryTerm}`, 'config / experiment fallback'],
      confidence: 'Medium',
    },
    {
      id: `${paragraph.id}-candidate-3`,
      symbol: `${primaryTerm}Runner`,
      path: buildRepoPath(repoSource, 'scripts/evaluate.py'),
      reason: 'Fallback candidate to support the planned manual confirmation flow.',
      signals: [`term overlap: ${primaryTerm}`, 'runner / evaluation fallback'],
      confidence: 'Low',
    },
  ]
}

function buildIndexedCodeCandidates(
  paragraph: ReaderParagraph,
  repoIndex: GitHubRepoIndex,
): CodeCandidate[] {
  const paragraphTerms = extractTerms(paragraph.text)
  const paragraphText = paragraph.text.toLowerCase()
  const readmeText = repoIndex.readme.toLowerCase()

  const rankedArtifacts = repoIndex.keyFiles
    .map((file) => rankFileAgainstParagraph(file, paragraphTerms, paragraphText, readmeText))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)

  return rankedArtifacts.map((artifact, index) => ({
    id: `${paragraph.id}-indexed-${index + 1}`,
    symbol: artifact.symbolMatch?.name ?? artifact.file.name,
    path: buildRepoPath(repoIndex.repoUrl, artifact.file.path),
    reason: buildIndexedReason(artifact.matches, artifact.file.path),
    signals: artifact.matches.slice(0, 3),
    confidence: mapScoreToConfidence(artifact.score),
    targetUrl: buildArtifactTargetUrl(artifact.file.htmlUrl, artifact.symbolMatch?.lineNumber),
    lineNumber: artifact.symbolMatch?.lineNumber,
  }))
}

function rankFileAgainstParagraph(
  file: GitHubRepoFile,
  paragraphTerms: string[],
  paragraphText: string,
  readmeText: string,
) {
  const loweredPath = file.path.toLowerCase()
  const loweredText = file.text.toLowerCase()
  const matches: string[] = []
  let score = 0

  for (const term of paragraphTerms) {
    const loweredTerm = term.toLowerCase()

    if (loweredPath.includes(loweredTerm)) {
      score += 5
      matches.push(`${term} matched path`)
      continue
    }

    if (loweredText.includes(loweredTerm)) {
      score += 3
      matches.push(`${term} matched file text`)
      continue
    }

    if (readmeText.includes(loweredTerm)) {
      score += 1
      matches.push(`${term} matched README`)
    }
  }

  if (paragraphText.includes('method') && loweredPath.includes('model')) {
    score += 2
    matches.push('method language matched a model file')
  }

  if (paragraphText.includes('experiment') && /config|train|eval/.test(loweredPath)) {
    score += 2
    matches.push('experiment language matched a config or run file')
  }

  if (paragraphText.includes('prompt') && /prompt|predictor/.test(loweredPath)) {
    score += 3
    matches.push('prompt language matched an interaction file')
  }

  const symbolMatch = rankSymbolsAgainstParagraph(file, paragraphTerms, paragraphText)
  if (symbolMatch) {
    score += symbolMatch.score
    matches.push(...symbolMatch.matches)
  }

  return {
    file,
    matches,
    score,
    symbolMatch,
  }
}

function buildIndexedReason(matches: string[], path: string): string {
  if (!matches.length) {
    return `Indexed from ${path} using repo structure and README context.`
  }

  return `Indexed from ${path}; ${matches.slice(0, 3).join('; ')}.`
}

function mapScoreToConfidence(score: number): CodeCandidate['confidence'] {
  if (score >= 8) {
    return 'High'
  }

  if (score >= 4) {
    return 'Medium'
  }

  return 'Low'
}

function buildSampleCodeCandidates(
  sample: DemoSample,
  paragraph: ReaderParagraph,
  repoSource: string,
): CodeCandidate[] {
  const paragraphTerms = extractTerms(paragraph.text).join(', ') || 'the active paragraph focus'

  if (sample.id === 'segment-anything') {
    return [
      {
        id: `${paragraph.id}-candidate-sam-1`,
        symbol: 'SamPredictor',
        path: buildRepoPath(repoSource, 'segment_anything/predictor.py'),
        reason: `Strong candidate when the paragraph discusses promptable interaction, prediction flow, or user-guided masks. Current paragraph terms: ${paragraphTerms}.`,
        signals: ['preset: segment-anything', 'prompt / prediction flow', 'user-guided masks'],
        confidence: 'High',
        targetUrl: buildRepoTargetUrl(repoSource, 'segment_anything/predictor.py'),
      },
      {
        id: `${paragraph.id}-candidate-sam-2`,
        symbol: 'SamAutomaticMaskGenerator',
        path: buildRepoPath(repoSource, 'segment_anything/automatic_mask_generator.py'),
        reason: 'Good fit for paragraphs about automatic mask generation, large-scale segmentation output, or prompt-free usage.',
        signals: ['preset: segment-anything', 'automatic masks', 'prompt-free usage'],
        confidence: 'High',
        targetUrl: buildRepoTargetUrl(repoSource, 'segment_anything/automatic_mask_generator.py'),
      },
      {
        id: `${paragraph.id}-candidate-sam-3`,
        symbol: 'export_onnx_model.py',
        path: buildRepoPath(repoSource, 'scripts/export_onnx_model.py'),
        reason: 'Useful when the paragraph references deployment, lightweight decoding, browser inference, or the web demo path.',
        signals: ['preset: segment-anything', 'deployment / browser path', 'ONNX export'],
        confidence: 'Medium',
        targetUrl: buildRepoTargetUrl(repoSource, 'scripts/export_onnx_model.py'),
      },
    ]
  }

  if (sample.id === 'lora') {
    return [
      {
        id: `${paragraph.id}-candidate-lora-1`,
        symbol: 'loralib.Linear',
        path: buildRepoPath(repoSource, 'loralib/layers.py'),
        reason: 'Best candidate for paragraphs that discuss rank decomposition, injected trainable matrices, or adapted linear layers.',
        signals: ['preset: lora', 'rank decomposition', 'adapted linear layers'],
        confidence: 'High',
        targetUrl: buildRepoTargetUrl(repoSource, 'loralib/layers.py'),
      },
      {
        id: `${paragraph.id}-candidate-lora-2`,
        symbol: 'MergedLinear',
        path: buildRepoPath(repoSource, 'loralib/layers.py'),
        reason: 'Useful when the paragraph mentions fused qkv projections or implementation-specific attention projections.',
        signals: ['preset: lora', 'qkv / attention projection', 'merged linear layer'],
        confidence: 'Medium',
        targetUrl: buildRepoTargetUrl(repoSource, 'loralib/layers.py'),
      },
      {
        id: `${paragraph.id}-candidate-lora-3`,
        symbol: 'examples/NLG',
        path: buildRepoPath(repoSource, 'examples/NLG/'),
        reason: 'Useful when the paragraph shifts from method description to reproduction and downstream experiment setup.',
        signals: ['preset: lora', 'reproduction path', 'NLG example'],
        confidence: 'Medium',
        targetUrl: buildRepoTargetUrl(repoSource, 'examples/NLG/'),
      },
    ]
  }

  if (sample.id === 'clip') {
    return [
      {
        id: `${paragraph.id}-candidate-clip-1`,
        symbol: 'encode_image',
        path: buildRepoPath(repoSource, 'clip/model.py'),
        reason: 'Strong candidate when the paragraph talks about image representation extraction or visual encoder behavior.',
        signals: ['preset: clip', 'image representation', 'visual encoder'],
        confidence: 'High',
        targetUrl: buildRepoTargetUrl(repoSource, 'clip/model.py'),
      },
      {
        id: `${paragraph.id}-candidate-clip-2`,
        symbol: 'encode_text',
        path: buildRepoPath(repoSource, 'clip/model.py'),
        reason: 'Useful when the paragraph emphasizes text supervision, prompt text, or language-side embeddings.',
        signals: ['preset: clip', 'text supervision', 'language embedding'],
        confidence: 'High',
        targetUrl: buildRepoTargetUrl(repoSource, 'clip/model.py'),
      },
      {
        id: `${paragraph.id}-candidate-clip-3`,
        symbol: 'clip.load',
        path: buildRepoPath(repoSource, 'clip/clip.py'),
        reason: 'Useful when the paragraph is closer to zero-shot evaluation or quickstart-style usage rather than architecture details.',
        signals: ['preset: clip', 'zero-shot usage', 'quickstart path'],
        confidence: 'Medium',
        targetUrl: buildRepoTargetUrl(repoSource, 'clip/clip.py'),
      },
    ]
  }

  return []
}

function extractTerms(text: string): string[] {
  const titleCaseMatches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const codeStyleMatches = text.match(/\b(?:[a-z]+_[a-z0-9_]+|[a-z]+(?:[A-Z][a-z0-9]+)+)\b/g) ?? []
  const lowercaseKeywords =
    text
      .toLowerCase()
      .match(
        /\b(model|dataset|training|module|loss|encoder|decoder|experiment|prompt|retrieval|mask|attention|adapter|segmentation|image|text)\b/g,
      ) ?? []

  const uniqueTerms = new Set([...titleCaseMatches, ...codeStyleMatches, ...lowercaseKeywords])
  return Array.from(uniqueTerms).slice(0, 5)
}

function buildRepoPath(repoSource: string, relativePath: string): string {
  const trimmedSource = repoSource.trim().replace(/\/+$/, '')
  const trimmedPath = relativePath.replace(/^\/+/, '')

  if (!trimmedSource) {
    return `repo/${trimmedPath}`
  }

  return `${trimmedSource}/${trimmedPath}`
}

function buildRepoTargetUrl(
  repoSource: string,
  relativePath: string,
  lineNumber?: number,
): string | undefined {
  const trimmedSource = repoSource.trim().replace(/\/+$/, '')
  if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+$/i.test(trimmedSource)) {
    return undefined
  }

  const normalizedPath = relativePath.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!normalizedPath) {
    return trimmedSource
  }

  const route = relativePath.endsWith('/') ? 'tree' : 'blob'
  const baseUrl = `${trimmedSource}/${route}/HEAD/${normalizedPath}`
  return lineNumber ? `${baseUrl}#L${lineNumber}` : baseUrl
}

function buildArtifactTargetUrl(fileHtmlUrl: string, lineNumber?: number): string {
  return lineNumber ? `${fileHtmlUrl}#L${lineNumber}` : fileHtmlUrl
}

function rankSymbolsAgainstParagraph(
  file: GitHubRepoFile,
  paragraphTerms: string[],
  paragraphText: string,
): RankedSymbolMatch | null {
  const symbols = extractCodeSymbols(file.text)
  if (!symbols.length) {
    return null
  }

  const rankedSymbols = symbols
    .map((symbol) => rankSymbolAgainstParagraph(symbol, paragraphTerms, paragraphText))
    .filter((symbol) => symbol.score > 0)
    .sort((left, right) => right.score - left.score || left.lineNumber - right.lineNumber)

  return rankedSymbols[0] ?? null
}

function rankSymbolAgainstParagraph(
  symbol: ExtractedCodeSymbol,
  paragraphTerms: string[],
  paragraphText: string,
): RankedSymbolMatch {
  const loweredParagraphText = paragraphText.toLowerCase()
  const loweredSymbol = symbol.name.toLowerCase()
  const symbolTokens = splitSymbolTokens(symbol.name)
  const matches = new Set<string>()
  let score = 0

  if (loweredParagraphText.includes(loweredSymbol)) {
    score += 8
    matches.add(`${symbol.name} matched paragraph text at L${symbol.lineNumber}`)
  }

  for (const term of paragraphTerms) {
    const loweredTerm = term.toLowerCase()

    if (loweredSymbol === loweredTerm) {
      score += 6
      matches.add(`${term} matched symbol name at L${symbol.lineNumber}`)
      continue
    }

    if (loweredSymbol.includes(loweredTerm) || symbolTokens.includes(loweredTerm)) {
      score += 4
      matches.add(`${term} matched symbol token at L${symbol.lineNumber}`)
    }
  }

  if (loweredParagraphText.includes('decoder') && symbolTokens.includes('decoder')) {
    score += 2
    matches.add(`decoder language matched ${symbol.name} at L${symbol.lineNumber}`)
  }

  if (loweredParagraphText.includes('encoder') && symbolTokens.includes('encoder')) {
    score += 2
    matches.add(`encoder language matched ${symbol.name} at L${symbol.lineNumber}`)
  }

  if (loweredParagraphText.includes('mask') && symbolTokens.includes('mask')) {
    score += 2
    matches.add(`mask language matched ${symbol.name} at L${symbol.lineNumber}`)
  }

  if (loweredParagraphText.includes('prompt') && symbolTokens.some((token) => /prompt|predict/.test(token))) {
    score += 2
    matches.add(`prompt language matched ${symbol.name} at L${symbol.lineNumber}`)
  }

  return {
    name: symbol.name,
    lineNumber: symbol.lineNumber,
    score,
    matches: Array.from(matches).slice(0, 3),
  }
}

function extractCodeSymbols(text: string): ExtractedCodeSymbol[] {
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

function splitSymbolTokens(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_./-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'module'
}
