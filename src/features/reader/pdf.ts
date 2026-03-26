import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

import type { ReaderPageSnapshot, ReaderParagraph, ReadingIntent } from './types'

GlobalWorkerOptions.workerSrc = workerUrl

const DEFAULT_SCALE = 1.28

export type LoadedPdfDocument = {
  numPages: number
  getPage: (pageNumber: number) => Promise<PdfPageLike>
  destroy: () => Promise<void>
}

type PdfPageLike = {
  getViewport: (options: { scale: number }) => { width: number; height: number }
  render: (options: {
    canvasContext: CanvasRenderingContext2D
    viewport: { width: number; height: number }
    transform?: [number, number, number, number, number, number]
  }) => { promise: Promise<void> }
  getTextContent: () => Promise<{ items: unknown[] }>
  cleanup: () => void
}

type RawTextItem = {
  str: string
  transform: number[]
  height?: number
}

type LineRecord = {
  y: number
  x: number
  height: number
  text: string
}

type ParagraphAccumulator = {
  lines: LineRecord[]
}

const intentKeywords: Record<ReadingIntent, string[]> = {
  'Quick overview': ['abstract', 'overview', 'contribution', 'result', 'problem'],
  'Method deep dive': ['method', 'model', 'architecture', 'module', 'approach'],
  'Reproduction path': ['experiment', 'training', 'dataset', 'config', 'implementation'],
  'Critical review': ['limitation', 'however', 'baseline', 'assumption', 'failure'],
}

export async function loadPdfDocument(file: File): Promise<LoadedPdfDocument> {
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: new Uint8Array(buffer) })
  const documentProxy = await loadingTask.promise

  return documentProxy as unknown as LoadedPdfDocument
}

export async function renderPdfPage(options: {
  canvas: HTMLCanvasElement
  document: LoadedPdfDocument
  pageNumber: number
  intent: ReadingIntent
}): Promise<ReaderPageSnapshot> {
  const page = await options.document.getPage(options.pageNumber)
  const viewport = page.getViewport({ scale: DEFAULT_SCALE })
  const context = options.canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context is unavailable.')
  }

  const ratio = window.devicePixelRatio || 1
  options.canvas.width = Math.floor(viewport.width * ratio)
  options.canvas.height = Math.floor(viewport.height * ratio)
  options.canvas.style.width = `${viewport.width}px`
  options.canvas.style.height = `${viewport.height}px`
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, options.canvas.width, options.canvas.height)

  const renderTask = page.render({
    canvasContext: context,
    viewport,
    transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
  })

  await renderTask.promise

  const textContent = await page.getTextContent()
  const paragraphs = extractParagraphs(textContent.items, options.pageNumber, viewport.height, options.intent)
  page.cleanup()

  return {
    pageNumber: options.pageNumber,
    width: viewport.width,
    height: viewport.height,
    paragraphs,
  }
}

function extractParagraphs(
  items: unknown[],
  pageNumber: number,
  pageHeight: number,
  intent: ReadingIntent,
): ReaderParagraph[] {
  const textItems = items.filter(isRawTextItem)
  const lines = groupIntoLines(textItems)

  if (!lines.length) {
    return []
  }

  const lineGapThreshold = calculateGapThreshold(lines)
  const buckets: ParagraphAccumulator[] = []

  for (const line of lines) {
    const current = buckets.at(-1)

    if (!current) {
      buckets.push({ lines: [line] })
      continue
    }

    const previousLine = current.lines.at(-1)
    if (!previousLine) {
      current.lines.push(line)
      continue
    }

    const gap = Math.abs(previousLine.y - line.y)
    if (gap > lineGapThreshold) {
      buckets.push({ lines: [line] })
      continue
    }

    current.lines.push(line)
  }

  return buckets
    .map((bucket) => finalizeParagraph(bucket, pageNumber, pageHeight, intent))
    .filter((paragraph): paragraph is ReaderParagraph => paragraph !== null)
}

function groupIntoLines(items: RawTextItem[]): LineRecord[] {
  const sorted = items
    .filter((item) => item.str.trim().length > 0)
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform[4] ?? 0,
      y: item.transform[5] ?? 0,
      height: item.height ?? (Math.abs(item.transform[3] ?? 0) || 12),
    }))
    .sort((left, right) => {
      const yDelta = right.y - left.y
      if (Math.abs(yDelta) > 3) {
        return yDelta
      }

      return left.x - right.x
    })

  const lines: Array<{ y: number; x: number; height: number; fragments: string[] }> = []

  for (const item of sorted) {
    const existingLine = lines.at(-1)
    if (!existingLine || Math.abs(existingLine.y - item.y) > 4) {
      lines.push({ y: item.y, x: item.x, height: item.height, fragments: [item.text] })
      continue
    }

    existingLine.fragments.push(item.text)
    existingLine.x = Math.min(existingLine.x, item.x)
    existingLine.height = Math.max(existingLine.height, item.height)
  }

  return lines.map((line) => ({
    y: line.y,
    x: line.x,
    height: line.height,
    text: stitchFragments(line.fragments),
  }))
}

function calculateGapThreshold(lines: LineRecord[]): number {
  if (lines.length < 2) {
    return 18
  }

  const gaps: number[] = []
  for (let index = 1; index < lines.length; index += 1) {
    gaps.push(Math.abs(lines[index - 1].y - lines[index].y))
  }

  const averageGap = gaps.reduce((total, gap) => total + gap, 0) / gaps.length
  return Math.max(averageGap * 1.5, 18)
}

function finalizeParagraph(
  bucket: ParagraphAccumulator,
  pageNumber: number,
  pageHeight: number,
  intent: ReadingIntent,
): ReaderParagraph | null {
  const text = bucket.lines.map((line) => line.text).join(' ').replace(/\s+/g, ' ').trim()

  if (text.length < 40) {
    return null
  }

  const topLine = bucket.lines[0]
  const anchorTop = clamp(((pageHeight - topLine.y) / pageHeight) * 100, 6, 92)
  const sentenceCount = splitSentences(text).length
  const importance = scoreParagraph(text, intent)
  const matchedTerms = collectKeyTerms(text)
  const preview = text.length > 180 ? `${text.slice(0, 177)}...` : text
  const id = buildParagraphId(pageNumber, text, anchorTop, bucket.lines.length)

  return {
    id,
    pageNumber,
    text,
    preview,
    lineCount: bucket.lines.length,
    sentenceCount,
    anchorTop,
    importance,
    rationale: buildRationale(text, matchedTerms, intent),
    evidenceLabel: `p.${pageNumber} / ${id}`,
  }
}

function buildParagraphId(
  pageNumber: number,
  text: string,
  anchorTop: number,
  lineCount: number,
): string {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()
  const seed = `${pageNumber}|${normalized.slice(0, 220)}|${normalized.length}|${Math.round(anchorTop * 10)}|${lineCount}`
  return `p${pageNumber}-${hashSeed(seed)}`
}

function hashSeed(seed: string): string {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return Math.abs(hash).toString(36).slice(0, 8)
}

function scoreParagraph(text: string, intent: ReadingIntent): number {
  const normalized = text.toLowerCase()
  const matchedCount = intentKeywords[intent].filter((keyword) => normalized.includes(keyword)).length
  const structuralBoost = /section|figure|table|algorithm|dataset|training|result/.test(normalized) ? 2 : 0
  const lengthBoost = text.length > 280 ? 2 : text.length > 140 ? 1 : 0

  return clamp(matchedCount * 2 + structuralBoost + lengthBoost, 1, 10)
}

function buildRationale(text: string, terms: string[], intent: ReadingIntent): string {
  if (terms.length > 0) {
    return `Aligned with ${intent.toLowerCase()} through ${terms.slice(0, 2).join(' and ')}.`
  }

  if (text.length > 240) {
    return `A dense paragraph likely worth attention under ${intent.toLowerCase()}.`
  }

  return `Useful contextual paragraph for ${intent.toLowerCase()}.`
}

function collectKeyTerms(text: string): string[] {
  const matches = text.match(/\b[A-Z][A-Za-z0-9-]{2,}\b/g) ?? []
  const unique = new Set(matches)
  return Array.from(unique).slice(0, 4)
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean)
}

function stitchFragments(fragments: string[]): string {
  return fragments.reduce((result, fragment) => {
    if (!result) {
      return fragment
    }

    if (/^[,.;:!?)]/.test(fragment) || /[(]$/.test(result)) {
      return `${result}${fragment}`
    }

    return `${result} ${fragment}`
  }, '')
}

function isRawTextItem(value: unknown): value is RawTextItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<RawTextItem>
  return typeof candidate.str === 'string' && Array.isArray(candidate.transform)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
