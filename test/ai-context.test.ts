import test from 'node:test'
import assert from 'node:assert/strict'

import { generateAiContextCard } from '../src/features/ai/context.ts'
import type { StoredAiConfig } from '../src/features/ai/storage.ts'
import type { ReaderParagraph } from '../src/features/reader/types.ts'

const config: StoredAiConfig = {
  provider: 'openai-compatible',
  baseUrl: 'https://proxy.example/v1',
  model: 'gpt-test',
  apiKey: 'secret',
  responseLanguage: 'Simplified Chinese',
  temperature: 0.2,
}

const paragraph: ReaderParagraph = {
  id: 'paragraph-1',
  pageNumber: 4,
  text: 'The mask decoder predicts multiple candidate masks for each prompt and ranks them by quality.',
  preview: 'The mask decoder predicts multiple candidate masks.',
  lineCount: 4,
  sentenceCount: 1,
  anchorTop: 45,
  importance: 9,
  rationale: 'This paragraph links the paper claim to a concrete module and ranking behavior.',
  evidenceLabel: 'P4',
}

test('generateAiContextCard sanitizes provider JSON and preserves evidence refs', async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: {
                  text: '模型在每个 prompt 下预测多个候选 mask。',
                  attribution: 'summary',
                },
                translation: {
                  text: '该段描述了 mask decoder 如何为每个提示生成并排序多个候选掩码。',
                  attribution: 'summary',
                },
                focusNote: {
                  text: '方法阅读时应重点看 candidate masks、quality ranking 与 decoder 接口。',
                  attribution: 'inference',
                },
                whyItMatters: {
                  text: '这决定了论文里的多 mask 输出如何映射到实现模块。',
                  attribution: 'summary',
                },
                terms: ['mask decoder', 'candidate masks', 'quality ranking'],
              }),
            },
          },
        ],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

  try {
    const card = await generateAiContextCard(paragraph, 'Method deep dive', config)

    assert.equal(card.summary.text, '模型在每个 prompt 下预测多个候选 mask。')
    assert.equal(card.translation?.text.includes('mask decoder'), true)
    assert.equal(card.providerLabel, 'OpenAI-compatible / gpt-test')
    assert.equal(card.source, 'ai')
    assert.deepEqual(card.terms, ['mask decoder', 'candidate masks', 'quality ranking'])
    assert.equal(card.evidenceRefs.length, 1)
    assert.equal(card.evidenceRefs[0]?.paragraphId, paragraph.id)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateAiContextCard surfaces malformed JSON as a user-facing error', async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: 'not-json',
            },
          },
        ],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

  try {
    await assert.rejects(
      generateAiContextCard(paragraph, 'Method deep dive', config),
      /malformed JSON/,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})
