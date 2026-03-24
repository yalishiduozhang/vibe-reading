import type { CodeCandidate, ReaderParagraph } from '../reader/types'
import type { DemoSample } from './demoSamples'
import type { GitHubRepoFile, GitHubRepoIndex } from './github'

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
      confidence: 'High',
    },
    {
      id: `${paragraph.id}-candidate-2`,
      symbol: `${secondaryTerm.toLowerCase()}.yaml`,
      path: buildRepoPath(repoSource, 'configs/train.yaml'),
      reason: 'Useful when the paragraph mixes implementation details and experiment setup language.',
      confidence: 'Medium',
    },
    {
      id: `${paragraph.id}-candidate-3`,
      symbol: `${primaryTerm}Runner`,
      path: buildRepoPath(repoSource, 'scripts/evaluate.py'),
      reason: 'Fallback candidate to support the planned manual confirmation flow.',
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
    symbol: artifact.file.name,
    path: buildRepoPath(repoIndex.repoUrl, artifact.file.path),
    reason: buildIndexedReason(artifact.matches, artifact.file.path),
    confidence: mapScoreToConfidence(artifact.score),
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

  return {
    file,
    matches,
    score,
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
        confidence: 'High',
      },
      {
        id: `${paragraph.id}-candidate-sam-2`,
        symbol: 'SamAutomaticMaskGenerator',
        path: buildRepoPath(repoSource, 'segment_anything/automatic_mask_generator.py'),
        reason: 'Good fit for paragraphs about automatic mask generation, large-scale segmentation output, or prompt-free usage.',
        confidence: 'High',
      },
      {
        id: `${paragraph.id}-candidate-sam-3`,
        symbol: 'export_onnx_model.py',
        path: buildRepoPath(repoSource, 'scripts/export_onnx_model.py'),
        reason: 'Useful when the paragraph references deployment, lightweight decoding, browser inference, or the web demo path.',
        confidence: 'Medium',
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
        confidence: 'High',
      },
      {
        id: `${paragraph.id}-candidate-lora-2`,
        symbol: 'MergedLinear',
        path: buildRepoPath(repoSource, 'loralib/layers.py'),
        reason: 'Useful when the paragraph mentions fused qkv projections or implementation-specific attention projections.',
        confidence: 'Medium',
      },
      {
        id: `${paragraph.id}-candidate-lora-3`,
        symbol: 'examples/NLG',
        path: buildRepoPath(repoSource, 'examples/NLG/'),
        reason: 'Useful when the paragraph shifts from method description to reproduction and downstream experiment setup.',
        confidence: 'Medium',
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
        confidence: 'High',
      },
      {
        id: `${paragraph.id}-candidate-clip-2`,
        symbol: 'encode_text',
        path: buildRepoPath(repoSource, 'clip/model.py'),
        reason: 'Useful when the paragraph emphasizes text supervision, prompt text, or language-side embeddings.',
        confidence: 'High',
      },
      {
        id: `${paragraph.id}-candidate-clip-3`,
        symbol: 'clip.load',
        path: buildRepoPath(repoSource, 'clip/clip.py'),
        reason: 'Useful when the paragraph is closer to zero-shot evaluation or quickstart-style usage rather than architecture details.',
        confidence: 'Medium',
      },
    ]
  }

  return []
}

function extractTerms(text: string): string[] {
  const titleCaseMatches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const lowercaseKeywords =
    text
      .toLowerCase()
      .match(/\b(model|dataset|training|module|loss|encoder|decoder|experiment|prompt|retrieval)\b/g) ?? []

  const uniqueTerms = new Set([...titleCaseMatches, ...lowercaseKeywords])
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

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'module'
}
