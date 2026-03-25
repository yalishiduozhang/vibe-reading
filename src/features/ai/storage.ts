const aiConfigStorageKey = 'openviberead.ai-config.v1'

export const aiProviderKinds = ['disabled', 'openai-compatible', 'ollama'] as const
export type AiProviderKind = (typeof aiProviderKinds)[number]

export const aiResponseLanguages = ['English', 'Simplified Chinese'] as const
export type AiResponseLanguage = (typeof aiResponseLanguages)[number]

export type StoredAiConfig = {
  provider: AiProviderKind
  baseUrl: string
  model: string
  apiKey: string
  responseLanguage: AiResponseLanguage
  temperature: number
}

const defaultAiConfig: StoredAiConfig = {
  provider: 'disabled',
  baseUrl: '',
  model: '',
  apiKey: '',
  responseLanguage: 'Simplified Chinese',
  temperature: 0.2,
}

export function loadStoredAiConfig(): StoredAiConfig {
  if (typeof window === 'undefined') {
    return defaultAiConfig
  }

  try {
    const raw = window.localStorage.getItem(aiConfigStorageKey)
    if (!raw) {
      return defaultAiConfig
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isStoredAiConfig(parsed)) {
      return defaultAiConfig
    }

    return normalizeAiConfig(parsed)
  } catch {
    return defaultAiConfig
  }
}

export function saveStoredAiConfig(config: StoredAiConfig) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(aiConfigStorageKey, JSON.stringify(normalizeAiConfig(config)))
}

export function normalizeAiConfig(config: StoredAiConfig): StoredAiConfig {
  return {
    provider: config.provider,
    baseUrl: config.baseUrl.trim(),
    model: config.model.trim(),
    apiKey: config.apiKey.trim(),
    responseLanguage: config.responseLanguage,
    temperature: clampTemperature(config.temperature),
  }
}

export function getDefaultAiBaseUrl(provider: AiProviderKind): string {
  if (provider === 'openai-compatible') {
    return 'https://api.openai.com/v1'
  }

  if (provider === 'ollama') {
    return 'http://127.0.0.1:11434'
  }

  return ''
}

export function getAiProviderLabel(config: Pick<StoredAiConfig, 'provider' | 'model'>): string {
  if (config.provider === 'disabled') {
    return 'Rule baseline only'
  }

  const providerLabel = config.provider === 'ollama' ? 'Ollama' : 'OpenAI-compatible'
  return config.model ? `${providerLabel} / ${config.model}` : providerLabel
}

export function getAiConfigIssue(config: StoredAiConfig): string | null {
  if (config.provider === 'disabled') {
    return 'Choose an AI provider to enable live context generation and draft expansion.'
  }

  if (!config.baseUrl.trim()) {
    return 'Set a base URL before sending live AI requests.'
  }

  if (!config.model.trim()) {
    return 'Set a model name before sending live AI requests.'
  }

  return null
}

function clampTemperature(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultAiConfig.temperature
  }

  return Math.min(1, Math.max(0, Number(value.toFixed(2))))
}

function isStoredAiConfig(value: unknown): value is StoredAiConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredAiConfig>
  return (
    typeof candidate.provider === 'string' &&
    aiProviderKinds.includes(candidate.provider as AiProviderKind) &&
    typeof candidate.baseUrl === 'string' &&
    typeof candidate.model === 'string' &&
    typeof candidate.apiKey === 'string' &&
    typeof candidate.responseLanguage === 'string' &&
    aiResponseLanguages.includes(candidate.responseLanguage as AiResponseLanguage) &&
    typeof candidate.temperature === 'number'
  )
}
