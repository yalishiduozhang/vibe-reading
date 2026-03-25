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
  const selectedIdeas = sortedIdeas
    .map(
      (idea, index) =>
        `${index + 1}. [${idea.tag}] ${idea.text} (anchor: p.${idea.pageNumber} / ${idea.paragraphId})`,
    )
    .join('\n')
  const evidenceAnchors = sortedIdeas
    .map((idea) => `- p.${idea.pageNumber} / ${idea.paragraphId}: ${idea.quote}`)
    .join('\n')
  const title = `${mode}: ${sortedIdeas[0].tag} driven draft`
  const sections = buildSections(mode, sortedIdeas.length, focusTags, selectedIdeas, evidenceAnchors, sortedIdeas)
  const markdown = [`# ${title}`, '', ...sections].join('\n')

  return {
    title,
    markdown,
  }
}

export function buildIdeaDraftFileName(title: string): string {
  const stem = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${stem || 'idea-draft'}.md`
}

function buildSections(
  mode: DraftMode,
  count: number,
  focusTags: string,
  selectedIdeas: string,
  evidenceAnchors: string,
  ideas: StoredIdea[],
): string[] {
  if (mode === 'Project proposal') {
    return [
      '## Problem Framing',
      `This proposal grows from ${count} reading-time ideas. The strongest signals currently cluster around: ${focusTags}. The goal is to turn those signals into a project direction with clear motivation and scope.`,
      '',
      '## Candidate Direction',
      'State the one-sentence project thesis here. Use the selected ideas below as the argument spine for the proposal.',
      '',
      '## Selected Ideas',
      selectedIdeas,
      '',
      '## Evidence Anchors',
      evidenceAnchors,
      '',
      '## Next Steps',
      buildNextSteps(mode, ideas),
    ]
  }

  if (mode === 'Experiment plan') {
    return [
      '## Experiment Goal',
      `This plan consolidates ${count} reading-time ideas into a testable experiment path. The current idea mix emphasizes: ${focusTags}. The goal is to move from observation to executable validation.`,
      '',
      '## Working Hypotheses',
      'Turn each selected idea into a falsifiable claim, ablation, or measurement target before implementation starts.',
      '',
      '## Selected Ideas',
      selectedIdeas,
      '',
      '## Evidence Anchors',
      evidenceAnchors,
      '',
      '## Experiment Checklist',
      buildNextSteps(mode, ideas),
    ]
  }

  return [
    '## Reading Summary',
    `This memo condenses ${count} reading-time ideas into a structured reading note. The recurring tags are: ${focusTags}. The goal is to preserve interpretation, critique, and follow-up questions in one place.`,
    '',
    '## Key Observations',
    selectedIdeas,
    '',
    '## Evidence Anchors',
    evidenceAnchors,
    '',
    '## Follow-up',
    buildNextSteps(mode, ideas),
  ]
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
