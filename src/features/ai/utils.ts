import { normalizeAiBaseUrl, getDefaultAiBaseUrl, type StoredAiConfig } from './storage.ts'
import type { ReaderParagraph, ReadingIntent } from '../reader/types.ts'

export function buildAiContextCacheKey(
  paragraph: ReaderParagraph,
  intent: ReadingIntent,
  config: StoredAiConfig,
): string {
  return [
    paragraph.id,
    intent,
    config.provider,
    config.responseLanguage,
    normalizeAiBaseUrl(config.baseUrl).toLowerCase(),
    config.model.trim().toLowerCase(),
    String(config.temperature),
  ].join('::')
}

export function shouldResetAiBaseUrl(config: StoredAiConfig): boolean {
  return (
    !normalizeAiBaseUrl(config.baseUrl) ||
    normalizeAiBaseUrl(config.baseUrl) === normalizeAiBaseUrl(getDefaultAiBaseUrl(config.provider))
  )
}
