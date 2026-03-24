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
}

export type CodeCandidate = {
  id: string
  symbol: string
  path: string
  reason: string
  confidence: 'High' | 'Medium' | 'Low'
}

export type ContextCardData = {
  summary: string
  focusNote: string
  whyItMatters: string
  evidence: string
  terms: string[]
}
