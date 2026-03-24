import type { StoredIdea } from '../reader/types'

export const draftModes = [
  'Project proposal',
  'Experiment plan',
  'Reading memo',
] as const

export type DraftMode = (typeof draftModes)[number]

export type IdeaDraft = {
  title: string
  markdown: string
}

export function buildIdeaDocumentDraft(ideas: StoredIdea[], mode: DraftMode): IdeaDraft {
  if (!ideas.length) {
    return {
      title: 'No ideas selected',
      markdown: '',
    }
  }

  const sortedIdeas = [...ideas].sort((left, right) =>
    left.createdAt < right.createdAt ? -1 : left.createdAt > right.createdAt ? 1 : 0,
  )
  const focusTags = Array.from(new Set(sortedIdeas.map((idea) => idea.tag))).join(', ')
  const opening = buildOpening(mode, sortedIdeas.length, focusTags)
  const observations = sortedIdeas
    .map((idea, index) =>
      `${index + 1}. [${idea.tag}] ${idea.text} (anchor: p.${idea.pageNumber} / ${idea.paragraphId})`,
    )
    .join('\n')
  const evidence = sortedIdeas
    .map((idea) => `- p.${idea.pageNumber} / ${idea.paragraphId}: ${idea.quote}`)
    .join('\n')
  const nextSteps = buildNextSteps(mode, sortedIdeas)
  const title = `${mode}: ${sortedIdeas[0].tag} driven draft`
  const markdown = [
    `# ${title}`,
    '',
    '## Framing',
    opening,
    '',
    '## Selected Ideas',
    observations,
    '',
    '## Evidence Anchors',
    evidence,
    '',
    '## Next Steps',
    nextSteps,
  ].join('\n')

  return {
    title,
    markdown,
  }
}

function buildOpening(mode: DraftMode, count: number, focusTags: string): string {
  if (mode === 'Project proposal') {
    return `This draft grows from ${count} reading-time ideas. The strongest signals currently cluster around: ${focusTags}. The goal is to convert those signals into a project direction with clear motivation and scope.`
  }

  if (mode === 'Experiment plan') {
    return `This plan consolidates ${count} reading-time ideas into a testable experiment path. The current idea mix emphasizes: ${focusTags}. The goal is to move from observation to executable validation.`
  }

  return `This memo condenses ${count} reading-time ideas into a structured reading note. The recurring tags are: ${focusTags}. The goal is to preserve interpretation, critique, and follow-up questions in one place.`
}

function buildNextSteps(mode: DraftMode, ideas: StoredIdea[]): string {
  const anchorSummary = ideas
    .slice(0, 3)
    .map((idea) => `revisit p.${idea.pageNumber} / ${idea.paragraphId}`)
    .join(', ')

  if (mode === 'Project proposal') {
    return `1. Turn the strongest idea into a single-sentence project thesis.\n2. Compare it against the original paper claims and identify the most defensible gap.\n3. Use the bound anchors to ground the proposal narrative: ${anchorSummary}.`
  }

  if (mode === 'Experiment plan') {
    return `1. Convert each selected idea into a concrete hypothesis or ablation.\n2. Decide which repo modules or configs would need inspection first.\n3. Use the bound anchors as the evidence checklist for the first experiment cycle: ${anchorSummary}.`
  }

  return `1. Group the ideas into insight, question, and follow-up buckets.\n2. Keep the bound anchors visible while writing the final memo.\n3. Use the highest-signal anchors as the summary spine: ${anchorSummary}.`
}
