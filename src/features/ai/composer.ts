import type { DraftMode } from '../idea-workspace/composer'
import type { StoredIdea } from '../reader/types'
import { requestAiText } from './client'
import type { StoredAiConfig } from './storage'

type ExpandIdeaDraftInput = {
  config: StoredAiConfig
  ideas: StoredIdea[]
  draftMode: DraftMode
  currentMarkdown: string
}

export async function expandIdeaDraftWithAi(input: ExpandIdeaDraftInput): Promise<string> {
  const { config, currentMarkdown, draftMode, ideas } = input
  if (!ideas.length) {
    throw new Error('Select at least one idea before expanding the draft with AI.')
  }

  const selectedIdeas = ideas
    .map(
      (idea, index) =>
        `${index + 1}. [${idea.tag}] ${idea.text}\n   anchor: p.${idea.pageNumber} / ${idea.paragraphId}\n   quote: ${idea.quote}`,
    )
    .join('\n')

  const response = await requestAiText(config, [
    {
      role: 'system',
      content: [
        'You are expanding a draft inside a research reading workbench.',
        'Return markdown only.',
        'Preserve explicit anchor references such as p.X / paragraph-id.',
        'Stay grounded in the selected ideas and quotes.',
        'If you extend beyond the direct evidence, label it as a hypothesis or next step instead of presenting it as fact.',
        `Write the final markdown in ${config.responseLanguage}.`,
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Draft mode: ${draftMode}`,
        'Selected ideas:',
        selectedIdeas,
        '',
        'Current markdown draft:',
        currentMarkdown,
        '',
        'Rewrite the draft so it is clearer, better structured, and more actionable without dropping the anchor references.',
      ].join('\n'),
    },
  ])

  const normalized = stripMarkdownFence(response).trim()
  if (!normalized) {
    throw new Error('The AI model returned an empty markdown draft.')
  }

  return normalized
}

function stripMarkdownFence(value: string): string {
  const trimmed = value.trim()
  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim()
}
