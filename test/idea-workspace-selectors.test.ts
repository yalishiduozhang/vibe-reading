import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildComposerSelectionKey,
  deriveSnapshotDocumentName,
  deriveSnapshotIdeaTags,
  getErrorMessage,
  matchesIdeaTimeFilter,
  matchesSnapshotSearch,
  matchesSnapshotVisibility,
} from '../src/features/idea-workspace/selectors.ts'
import type { StoredIdea } from '../src/features/reader/types.ts'
import type { StoredComposerSnapshot } from '../src/features/idea-workspace/storage.ts'

const now = Date.now()

const ideas: StoredIdea[] = [
  {
    id: 'idea-2',
    text: 'Try a stronger baseline for prompt encoder ablations.',
    tag: 'Experiment',
    pageNumber: 2,
    paragraphId: 'p2',
    quote: 'Prompt encoder conditions the mask decoder.',
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    documentName: 'Segment Anything',
  },
  {
    id: 'idea-1',
    text: 'Explore a follow-up project around mask ranking.',
    tag: 'Project',
    pageNumber: 3,
    paragraphId: 'p3',
    quote: 'The model predicts multiple masks.',
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    documentName: 'CLIP',
  },
]

const snapshot: StoredComposerSnapshot = {
  id: 'snap-1',
  name: 'Mask decoder branch',
  selectionKey: 'Project proposal::idea-1,idea-2',
  selectedIdeaIds: ['idea-2', 'idea-1'],
  draftMode: 'Project proposal',
  markdown: '# Draft',
  updatedAt: new Date(now).toISOString(),
  documentName: 'Segment Anything',
  note: 'Focus on decoder and ranking',
  ideaTags: ['Experiment', 'Project'],
}

test('buildComposerSelectionKey sorts ids for stable persistence', () => {
  assert.equal(
    buildComposerSelectionKey(['idea-2', 'idea-1'], 'Project proposal'),
    'Project proposal::idea-1,idea-2',
  )
})

test('deriveSnapshotDocumentName handles mixed papers and deriveSnapshotIdeaTags preserves known order', () => {
  assert.equal(deriveSnapshotDocumentName(ideas), 'Mixed papers (2)')
  assert.deepEqual(deriveSnapshotIdeaTags(ideas), ['Experiment', 'Project'])
})

test('snapshot search and visibility helpers behave as expected', () => {
  assert.equal(matchesSnapshotSearch(snapshot, 'decoder'), true)
  assert.equal(matchesSnapshotSearch(snapshot, 'nonexistent'), false)
  assert.equal(matchesSnapshotVisibility(snapshot, 'Active only'), true)
  assert.equal(
    matchesSnapshotVisibility(
      {
        ...snapshot,
        archivedAt: new Date(now).toISOString(),
      },
      'Archived only',
    ),
    true,
  )
})

test('matchesIdeaTimeFilter distinguishes 24h and 7d windows', () => {
  assert.equal(matchesIdeaTimeFilter(ideas[0], 'Last 24h'), true)
  assert.equal(matchesIdeaTimeFilter(ideas[1], 'Last 24h'), false)
  assert.equal(matchesIdeaTimeFilter(ideas[1], 'Last 7d'), true)
})

test('getErrorMessage falls back when the value is not an Error', () => {
  assert.equal(getErrorMessage(new Error('boom'), 'fallback'), 'boom')
  assert.equal(getErrorMessage('bad', 'fallback'), 'fallback')
})
