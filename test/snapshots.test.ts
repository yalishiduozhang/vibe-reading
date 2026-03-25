import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDuplicateSnapshotName,
  buildSnapshotComparisonSummary,
  buildSnapshotLineage,
  buildSnapshotRelationSignals,
} from '../src/features/idea-workspace/snapshots.ts'
import type { StoredComposerSnapshot } from '../src/features/idea-workspace/storage.ts'

const snapshots: StoredComposerSnapshot[] = [
  {
    id: 'root',
    name: 'Decoder direction',
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Project proposal',
    markdown: '# Root\n\nline 1',
    updatedAt: '2026-03-25T10:00:00.000Z',
  },
  {
    id: 'copy-1',
    name: 'Decoder direction (copy)',
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Project proposal',
    markdown: '# Copy',
    updatedAt: '2026-03-25T11:00:00.000Z',
    parentSnapshotId: 'root',
    parentSnapshotName: 'Decoder direction',
  },
  {
    id: 'copy-2',
    name: 'Decoder direction (copy 2)',
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Experiment plan',
    markdown: '# Copy 2\n\nline 1\nline 2',
    updatedAt: '2026-03-25T12:00:00.000Z',
    parentSnapshotId: 'root',
    parentSnapshotName: 'Decoder direction',
  },
]

test('buildDuplicateSnapshotName increments copy suffix within a selection', () => {
  assert.equal(buildDuplicateSnapshotName(snapshots[0], snapshots), 'Decoder direction (copy 3)')
})

test('buildSnapshotRelationSignals and lineage expose parent and derived snapshots', () => {
  assert.deepEqual(buildSnapshotRelationSignals(snapshots[0], snapshots), ['2 derived copies'])
  assert.deepEqual(buildSnapshotRelationSignals(snapshots[2], snapshots), ['derived from Decoder direction'])

  const lineage = buildSnapshotLineage(snapshots[0], snapshots)
  assert.equal(lineage.parent, null)
  assert.deepEqual(
    lineage.derivedSnapshots.map((snapshot) => snapshot.id),
    ['copy-2', 'copy-1'],
  )
})

test('buildSnapshotComparisonSummary distinguishes exact and changed drafts', () => {
  const exact = buildSnapshotComparisonSummary(
    snapshots[0],
    ['idea-1', 'idea-2'],
    'Project proposal',
    '# Root\n\nline 1',
  )
  assert.equal(exact.note, 'This snapshot currently matches the active composer draft.')
  assert.equal(exact.signals[0], 'selection: exact match')

  const changed = buildSnapshotComparisonSummary(
    snapshots[2],
    ['idea-2'],
    'Project proposal',
    '# Active',
  )
  assert.equal(
    changed.note,
    'This snapshot differs from the active composer draft in at least one of selection, mode, or markdown size.',
  )
  assert.equal(changed.signals[1], 'mode: Experiment plan vs Project proposal')
})
