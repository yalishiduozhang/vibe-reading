import { normalizeGitHubUrl } from './source'

export type DemoSampleId = 'segment-anything' | 'lora' | 'clip'

export type DemoSample = {
  id: DemoSampleId
  label: string
  badge: 'Primary' | 'Backup'
  paperTitle: string
  paperUrl: string
  repoUrl: string
  selectionSummary: string
  strengths: string[]
  mappingFocus: string[]
  watchOut: string
}

export const primaryDemoSampleId: DemoSampleId = 'segment-anything'

export const demoSamples: DemoSample[] = [
  {
    id: 'segment-anything',
    label: 'Segment Anything',
    badge: 'Primary',
    paperTitle: 'Segment Anything',
    paperUrl: 'https://arxiv.org/abs/2304.02643',
    repoUrl: 'https://github.com/facebookresearch/segment-anything',
    selectionSummary:
      'Best first demo pair because the paper and repo share concrete module language, the repo tree is easy to inspect, and the project already exposes notebooks, scripts, and a web demo.',
    strengths: [
      'Paper and repo both name concrete parts such as prompt encoder, mask decoder, and automatic mask generation.',
      'The repo structure is compact and readable: demo, notebooks, scripts, and segment_anything.',
      'The first MVP can stay at structure-level analysis without running heavyweight training.',
    ],
    mappingFocus: [
      'promptable segmentation flow',
      'mask decoder',
      'automatic mask generation',
      'ONNX export and web demo',
    ],
    watchOut:
      'It is a vision paper, so later NLP-oriented backups are still useful for testing cross-domain generality.',
  },
  {
    id: 'lora',
    label: 'LoRA',
    badge: 'Backup',
    paperTitle: 'LoRA: Low-Rank Adaptation of Large Language Models',
    paperUrl: 'https://arxiv.org/abs/2106.09685',
    repoUrl: 'https://github.com/microsoft/LoRA',
    selectionSummary:
      'Strong backup for NLP-oriented demos because the repo exposes loralib plus NLG and NLU examples, but the paper-to-code mapping is more layer-level than module-level.',
    strengths: [
      'The official repo clearly separates loralib and examples.',
      'README gives direct clues for qkv projection and lora.Linear style adaptation.',
      'Useful for later testing code-link behavior on parameter-efficient fine-tuning papers.',
    ],
    mappingFocus: ['loralib', 'qkv projection', 'examples/NLG', 'examples/NLU'],
    watchOut:
      'Many mappings are concept-to-layer rather than paper-section-to-file, so it is a better backup than the first MVP showcase.',
  },
  {
    id: 'clip',
    label: 'CLIP',
    badge: 'Backup',
    paperTitle: 'Learning Transferable Visual Models From Natural Language Supervision',
    paperUrl: 'https://arxiv.org/abs/2103.00020',
    repoUrl: 'https://github.com/openai/CLIP',
    selectionSummary:
      'Compact and famous repo with clear encode_image and encode_text APIs, but the mapping surface is narrower than Segment Anything for the first end-to-end demo.',
    strengths: [
      'Official repo is small and easy to browse.',
      'README exposes concrete API calls such as model.encode_image and model.encode_text.',
      'Good fallback when we want a lighter repo than Segment Anything.',
    ],
    mappingFocus: ['clip.load', 'encode_image', 'encode_text', 'zero-shot prediction'],
    watchOut:
      'The repo is intentionally compact, so it offers fewer distinct structural mapping cues than SAM.',
  },
]

export function getDemoSampleById(sampleId: DemoSampleId): DemoSample {
  return demoSamples.find((sample) => sample.id === sampleId) ?? demoSamples[0]
}

export function matchDemoSampleBySource(input: string): DemoSample | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  const normalizedInput =
    trimmed.startsWith('http') || trimmed.startsWith('git@github.com:')
      ? normalizeGitHubUrl(trimmed)
      : trimmed

  return demoSamples.find((sample) => normalizeGitHubUrl(sample.repoUrl) === normalizedInput) ?? null
}
