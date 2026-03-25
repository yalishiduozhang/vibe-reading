import type { StoredAiConfig } from './storage'

export type AiChatMessage = {
  role: 'system' | 'user'
  content: string
}

type RequestAiTextOptions = {
  jsonMode?: boolean
}

type ParsedResponseBody = {
  rawText: string
  value: unknown
}

export async function requestAiText(
  config: StoredAiConfig,
  messages: AiChatMessage[],
  options: RequestAiTextOptions = {},
): Promise<string> {
  if (config.provider === 'disabled') {
    throw new Error('Choose an AI provider before sending live requests.')
  }

  if (!config.baseUrl.trim()) {
    throw new Error('Set a base URL before sending live AI requests.')
  }

  if (!config.model.trim()) {
    throw new Error('Set a model name before sending live AI requests.')
  }

  if (config.provider === 'ollama') {
    return requestOllamaText(config, messages, options)
  }

  return requestOpenAiCompatibleText(config, messages, options)
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

async function requestOpenAiCompatibleText(
  config: StoredAiConfig,
  messages: AiChatMessage[],
  options: RequestAiTextOptions,
): Promise<string> {
  const endpoint = `${normalizeBaseUrl(config.baseUrl)}/chat/completions`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.apiKey.trim()) {
    headers.Authorization = `Bearer ${config.apiKey.trim()}`
  }

  const basePayload = {
    model: config.model,
    temperature: config.temperature,
    messages,
  }

  let response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...basePayload,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  let body = await readResponseBody(response)

  if (
    options.jsonMode &&
    !response.ok &&
    /response_format|json_object|json mode|unsupported/i.test(body.rawText.toLowerCase())
  ) {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(basePayload),
    })
    body = await readResponseBody(response)
  }

  if (!response.ok) {
    throw new Error(
      readProviderError(body.value) ||
        body.rawText ||
        `OpenAI-compatible request failed with status ${response.status}.`,
    )
  }

  const content = extractOpenAiCompatibleContent(body.value)
  if (!content.trim()) {
    throw new Error('The AI model returned an empty response.')
  }

  return content.trim()
}

async function requestOllamaText(
  config: StoredAiConfig,
  messages: AiChatMessage[],
  options: RequestAiTextOptions,
): Promise<string> {
  const endpoint = `${normalizeBaseUrl(config.baseUrl)}/api/chat`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      stream: false,
      messages,
      options: {
        temperature: config.temperature,
      },
      ...(options.jsonMode ? { format: 'json' } : {}),
    }),
  })
  const body = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(
      readProviderError(body.value) ||
        body.rawText ||
        `Ollama request failed with status ${response.status}.`,
    )
  }

  const payload = body.value as { message?: { content?: unknown }; response?: unknown }
  const content = extractTextContent(payload.message?.content) || extractTextContent(payload.response)
  if (!content.trim()) {
    throw new Error('The AI model returned an empty response.')
  }

  return content.trim()
}

async function readResponseBody(response: Response): Promise<ParsedResponseBody> {
  const rawText = await response.text()
  if (!rawText.trim()) {
    return {
      rawText,
      value: null,
    }
  }

  try {
    return {
      rawText,
      value: JSON.parse(rawText) as unknown,
    }
  } catch {
    return {
      rawText,
      value: rawText,
    }
  }
}

function extractOpenAiCompatibleContent(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) {
    return ''
  }

  const candidate = payload as {
    choices?: Array<{
      message?: {
        content?: unknown
      }
    }>
  }

  return extractTextContent(candidate.choices?.[0]?.message?.content)
}

function extractTextContent(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (!Array.isArray(value)) {
    return ''
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }

      if (typeof item !== 'object' || item === null) {
        return ''
      }

      const contentPart = item as { text?: unknown }
      return typeof contentPart.text === 'string' ? contentPart.text : ''
    })
    .join('\n')
}

function readProviderError(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value !== 'object' || value === null) {
    return ''
  }

  const candidate = value as {
    error?: { message?: unknown } | string
    message?: unknown
  }

  if (typeof candidate.error === 'string') {
    return candidate.error.trim()
  }

  if (typeof candidate.error === 'object' && candidate.error !== null) {
    const nestedError = candidate.error as { message?: unknown }
    if (typeof nestedError.message === 'string') {
      return nestedError.message.trim()
    }
  }

  if (typeof candidate.message === 'string') {
    return candidate.message.trim()
  }

  return ''
}
