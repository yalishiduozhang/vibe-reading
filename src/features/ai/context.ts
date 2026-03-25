import { buildContextCard } from '../reader/context.ts'
import type {
  ContextCardData,
  ContextCardField,
  EvidenceAttribution,
  ReaderParagraph,
  ReadingIntent,
} from '../reader/types.ts'
import { requestAiText } from './client.ts'
import { getAiProviderLabel, type StoredAiConfig } from './storage.ts'

type AiContextPayload = {
  summary?: Partial<ContextCardField>
  translation?: Partial<ContextCardField>
  focusNote?: Partial<ContextCardField>
  whyItMatters?: Partial<ContextCardField>
  terms?: unknown
}

export async function generateAiContextCard(
  paragraph: ReaderParagraph,
  intent: ReadingIntent,
  config: StoredAiConfig,
): Promise<ContextCardData> {
  const baselineCard = buildContextCard(paragraph, intent)
  if (!baselineCard) {
    throw new Error('Select a paragraph before generating AI context.')
  }

  const rawResponse = await requestAiText(
    config,
    [
      {
        role: 'system',
        content: [
          'You are generating grounded context cards for a research paper reading workbench.',
          'Use only the provided paragraph.',
          'Return strict JSON with keys: summary, translation, focusNote, whyItMatters, terms.',
          'Each field except terms must be an object with text and attribution.',
          'Allowed attribution values: quoted, summary, inference.',
          'The translation field should translate the paragraph into the requested language.',
          'If the paragraph already appears to be in that language, rewrite it more plainly instead of copying it.',
          'Keep the summary concise and keep the focus note aligned with the reading intent.',
          'Do not include markdown fences.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          `Response language: ${config.responseLanguage}`,
          `Reading intent: ${intent}`,
          `Paragraph label: ${paragraph.evidenceLabel}`,
          `Page number: ${paragraph.pageNumber}`,
          `Importance score: ${paragraph.importance}/10`,
          'Paragraph text:',
          paragraph.text,
        ].join('\n'),
      },
    ],
    {
      jsonMode: true,
    },
  )

  const parsedPayload = parseAiContextPayload(rawResponse)
  return {
    summary: sanitizeContextField(parsedPayload.summary, baselineCard.summary),
    translation: sanitizeOptionalContextField(parsedPayload.translation),
    focusNote: sanitizeContextField(parsedPayload.focusNote, baselineCard.focusNote),
    whyItMatters: sanitizeContextField(parsedPayload.whyItMatters, baselineCard.whyItMatters),
    evidenceRefs: baselineCard.evidenceRefs,
    terms: sanitizeTerms(parsedPayload.terms, baselineCard.terms),
    source: 'ai',
    providerLabel: getAiProviderLabel(config),
    generatedAt: new Date().toISOString(),
  }
}

function parseAiContextPayload(rawResponse: string): AiContextPayload {
  const trimmed = rawResponse.trim()
  const jsonCandidate = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
  const firstBraceIndex = jsonCandidate.indexOf('{')
  const lastBraceIndex = jsonCandidate.lastIndexOf('}')
  const normalized =
    firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex
      ? jsonCandidate.slice(firstBraceIndex, lastBraceIndex + 1)
      : jsonCandidate

  try {
    return JSON.parse(normalized) as AiContextPayload
  } catch {
    throw new Error('The AI model returned malformed JSON for the context card.')
  }
}

function sanitizeContextField(
  field: Partial<ContextCardField> | undefined,
  fallback: ContextCardField,
): ContextCardField {
  const nextText = typeof field?.text === 'string' ? field.text.trim() : ''
  return {
    text: nextText || fallback.text,
    attribution: sanitizeAttribution(field?.attribution, fallback.attribution),
  }
}

function sanitizeOptionalContextField(
  field: Partial<ContextCardField> | undefined,
): ContextCardField | undefined {
  const nextText = typeof field?.text === 'string' ? field.text.trim() : ''
  if (!nextText) {
    return undefined
  }

  return {
    text: nextText,
    attribution: sanitizeAttribution(field?.attribution, 'summary'),
  }
}

function sanitizeAttribution(
  attribution: unknown,
  fallback: EvidenceAttribution,
): EvidenceAttribution {
  if (attribution === 'quoted' || attribution === 'summary' || attribution === 'inference') {
    return attribution
  }

  return fallback
}

function sanitizeTerms(terms: unknown, fallback: string[]): string[] {
  if (!Array.isArray(terms)) {
    return fallback
  }

  const normalizedTerms = terms
    .filter((term): term is string => typeof term === 'string')
    .map((term) => term.trim())
    .filter(Boolean)

  return normalizedTerms.length ? Array.from(new Set(normalizedTerms)).slice(0, 6) : fallback
}
