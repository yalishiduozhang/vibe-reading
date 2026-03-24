import type {
  ContextCardData,
  EvidenceAttribution,
  EvidenceRef,
  ReaderParagraph,
  ReadingIntent,
} from './types'

const focusByIntent: Record<ReadingIntent, string> = {
  'Quick overview': 'Prioritize contribution framing, problem definition, and headline outcome.',
  'Method deep dive': 'Stay on operators, modules, architecture terms, and how the paragraph fits the pipeline.',
  'Reproduction path': 'Focus on datasets, configs, training details, and any implementation-sensitive phrasing.',
  'Critical review': 'Look for assumptions, baselines, limitations, and any language that hints at scope mismatch.',
}

export function buildContextCard(
  paragraph: ReaderParagraph | null,
  intent: ReadingIntent,
): ContextCardData | null {
  if (!paragraph) {
    return null
  }

  const sentences = splitSentences(paragraph.text)
  const summaryText = sentences[0] ?? paragraph.preview
  const summaryAttribution: EvidenceAttribution =
    summaryText === paragraph.preview ? 'summary' : 'quoted'

  return {
    summary: {
      text: summaryText,
      attribution: summaryAttribution,
    },
    focusNote: {
      text: `${focusByIntent[intent]} Current score: ${paragraph.importance}/10.`,
      attribution: 'inference',
    },
    whyItMatters: {
      text: paragraph.rationale,
      attribution: 'summary',
    },
    evidenceRefs: buildEvidenceRefs(paragraph, sentences),
    terms: extractTerms(paragraph.text),
  }
}

export function formatEvidenceRef(reference: EvidenceRef): string {
  return `${reference.label} / sentences ${reference.sentenceStart}-${reference.sentenceEnd}`
}

function buildEvidenceRefs(
  paragraph: ReaderParagraph,
  sentences: string[],
): EvidenceRef[] {
  const excerpt = sentences.slice(0, 2).join(' ').trim() || paragraph.preview
  const sentenceEnd = Math.max(1, Math.min(sentences.length || 1, 2))

  return [
    {
      pageNumber: paragraph.pageNumber,
      paragraphId: paragraph.id,
      sentenceStart: 1,
      sentenceEnd,
      excerpt,
      label: paragraph.evidenceLabel,
    },
  ]
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function extractTerms(text: string): string[] {
  const titleCaseMatches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const lowercaseKeywords = text
    .toLowerCase()
    .match(/\b(model|dataset|training|module|loss|encoder|decoder|experiment|prompt|retrieval)\b/g) ?? []

  const uniqueTerms = new Set([...titleCaseMatches, ...lowercaseKeywords])
  return Array.from(uniqueTerms).slice(0, 5)
}
