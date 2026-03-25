import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getAiConfigIssue,
  normalizeAiConfig,
  type StoredAiConfig,
} from '../src/features/ai/storage.ts'
import { buildAiContextCacheKey, shouldResetAiBaseUrl } from '../src/features/ai/utils.ts'
import type { ReaderParagraph } from '../src/features/reader/types.ts'

const baseConfig: StoredAiConfig = {
  provider: 'openai-compatible',
  baseUrl: ' https://api.openai.com/v1/ ',
  model: ' gpt-test ',
  apiKey: '  secret  ',
  responseLanguage: 'Simplified Chinese',
  temperature: 1.7,
}

const paragraph: ReaderParagraph = {
  id: 'p1',
  pageNumber: 1,
  text: 'Mask decoder predicts multiple segmentation masks from prompt embeddings.',
  preview: 'Mask decoder predicts multiple segmentation masks.',
  lineCount: 3,
  sentenceCount: 1,
  anchorTop: 20,
  importance: 8,
  rationale: 'Connects the paper claim to the core implementation target.',
  evidenceLabel: 'P1',
}

test('normalizeAiConfig trims strings and clamps temperature', () => {
  const normalized = normalizeAiConfig(baseConfig)

  assert.equal(normalized.baseUrl, 'https://api.openai.com/v1')
  assert.equal(normalized.model, 'gpt-test')
  assert.equal(normalized.apiKey, 'secret')
  assert.equal(normalized.temperature, 1)
})

test('getAiConfigIssue requires api key for official OpenAI endpoint only', () => {
  assert.equal(
    getAiConfigIssue({
      ...baseConfig,
      apiKey: '',
    }),
    'Set an API key before using the official OpenAI-compatible endpoint.',
  )

  assert.equal(
    getAiConfigIssue({
      ...baseConfig,
      provider: 'ollama',
      baseUrl: 'http://127.0.0.1:11434',
      apiKey: '',
    }),
    null,
  )
})

test('buildAiContextCacheKey includes normalized base url and temperature', () => {
  const keyA = buildAiContextCacheKey(paragraph, 'Method deep dive', {
    ...baseConfig,
    temperature: 0.2,
  })
  const keyB = buildAiContextCacheKey(paragraph, 'Method deep dive', {
    ...baseConfig,
    baseUrl: 'https://api.openai.com/v1/',
    temperature: 0.2,
  })
  const keyC = buildAiContextCacheKey(paragraph, 'Method deep dive', {
    ...baseConfig,
    temperature: 0.7,
  })

  assert.equal(keyA, keyB)
  assert.notEqual(keyA, keyC)
})

test('shouldResetAiBaseUrl respects normalized default url matching', () => {
  assert.equal(
    shouldResetAiBaseUrl({
      ...baseConfig,
      baseUrl: 'https://api.openai.com/v1/',
    }),
    true,
  )

  assert.equal(
    shouldResetAiBaseUrl({
      ...baseConfig,
      baseUrl: 'https://example.com/proxy',
    }),
    false,
  )
})
