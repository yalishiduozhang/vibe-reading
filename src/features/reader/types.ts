export const readingIntents = [
  'Quick overview',
  'Method deep dive',
  'Reproduction path',
  'Critical review',
] as const

export type ReadingIntent = (typeof readingIntents)[number]

export type ReaderParagraph = {
  id: string
  pageNumber: number
  text: string
  preview: string
  lineCount: number
  sentenceCount: number
  anchorTop: number
  importance: number
  rationale: string
  evidenceLabel: string
}

export type ReaderPageSnapshot = {
  pageNumber: number
  width: number
  height: number
  paragraphs: ReaderParagraph[]
}

export type EvidenceAttribution = 'quoted' | 'summary' | 'inference'

export type EvidenceRef = {
  pageNumber: number
  paragraphId: string
  sentenceStart: number
  sentenceEnd: number
  excerpt: string
  label: string
}

export type ContextCardField = {
  text: string
  attribution: EvidenceAttribution
}

export type ContextCardData = {
  summary: ContextCardField
  translation?: ContextCardField
  focusNote: ContextCardField
  whyItMatters: ContextCardField
  evidenceRefs: EvidenceRef[]
  terms: string[]
  source?: 'rule' | 'ai'
  providerLabel?: string
  generatedAt?: string
}

export type IdeaTag = 'Improvement' | 'Question' | 'Experiment' | 'Project'

export const ideaTags: IdeaTag[] = [
  'Improvement',
  'Question',
  'Experiment',
  'Project',
]

export type StoredIdea = {
  id: string
  text: string
  tag: IdeaTag
  pageNumber: number
  paragraphId: string
  quote: string
  createdAt: string
  updatedAt?: string
  documentName?: string
}

export type CodeCandidate = {
  id: string
  symbol: string
  path: string
  reason: string
  signals?: string[]
  snippet?: string
  confidence: 'High' | 'Medium' | 'Low'
  targetUrl?: string
  lineNumber?: number
}
