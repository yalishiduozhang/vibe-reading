import test from 'node:test'
import assert from 'node:assert/strict'

import {
  deleteComposerSnapshot,
  duplicateComposerSnapshot,
  planComposerSnapshotLoad,
  renameComposerSnapshot,
  resolveComposerDraftRestore,
  saveComposerSnapshot,
  toggleComposerSnapshotArchive,
} from '../src/features/idea-workspace/session.ts'
import type { StoredComposerDraft, StoredComposerSnapshot } from '../src/features/idea-workspace/storage.ts'
import type { StoredIdea } from '../src/features/reader/types.ts'

const ideas: StoredIdea[] = [
  {
    id: 'idea-1',
    text: 'Turn the decoder branch into a cleaner proposal.',
    tag: 'Project',
    pageNumber: 2,
    paragraphId: 'p2',
    quote: 'Decoder predicts multiple mask candidates.',
    createdAt: '2026-03-25T10:00:00.000Z',
    documentName: 'Segment Anything',
  },
  {
    id: 'idea-2',
    text: 'Test a stronger ablation around prompt conditioning.',
    tag: 'Experiment',
    pageNumber: 3,
    paragraphId: 'p3',
    quote: 'Prompt encoder provides sparse tokens.',
    createdAt: '2026-03-25T10:05:00.000Z',
    documentName: 'Segment Anything',
  },
]

const baseSnapshots: StoredComposerSnapshot[] = [
  {
    id: 'root',
    name: 'Decoder direction',
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Project proposal',
    markdown: '# Root',
    updatedAt: '2026-03-25T10:30:00.000Z',
    note: 'Focus on decoder path',
  },
  {
    id: 'child',
    name: 'Decoder direction (copy)',
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Project proposal',
    markdown: '# Child',
    updatedAt: '2026-03-25T11:30:00.000Z',
    parentSnapshotId: 'root',
    parentSnapshotName: 'Decoder direction',
  },
]

test('resolveComposerDraftRestore clears stale snapshot meta and prioritizes pending snapshots', () => {
  const pendingRestore = resolveComposerDraftRestore({
    selectionKey: 'Project proposal::idea-1,idea-2',
    previousSelectionKey: 'Project proposal::idea-2',
    selectedIdeaCount: 2,
    ideaDraftMarkdown: '# Baseline',
    pendingSnapshot: baseSnapshots[0],
    storedDraft: null,
  })
  assert.equal(pendingRestore.kind, 'pending-snapshot')
  assert.equal(pendingRestore.snapshotName, 'Decoder direction')
  assert.equal(pendingRestore.snapshotNote, 'Focus on decoder path')
  assert.equal(pendingRestore.pendingSnapshot, null)

  const storedDraft: StoredComposerDraft = {
    selectionKey: 'Project proposal::idea-1,idea-2',
    selectedIdeaIds: ['idea-1', 'idea-2'],
    draftMode: 'Project proposal',
    markdown: '# Stored draft',
    updatedAt: '2026-03-25T12:00:00.000Z',
  }
  const storedRestore = resolveComposerDraftRestore({
    selectionKey: storedDraft.selectionKey,
    previousSelectionKey: 'Project proposal::idea-2',
    selectedIdeaCount: 2,
    ideaDraftMarkdown: '# Baseline',
    pendingSnapshot: null,
    storedDraft,
  })
  assert.equal(storedRestore.kind, 'stored-draft')
  assert.equal(storedRestore.markdown, '# Stored draft')
  assert.equal(storedRestore.snapshotName, '')
  assert.equal(storedRestore.snapshotNote, '')

  const clearRestore = resolveComposerDraftRestore({
    selectionKey: '',
    previousSelectionKey: storedDraft.selectionKey,
    selectedIdeaCount: 0,
    ideaDraftMarkdown: '# Baseline',
    pendingSnapshot: baseSnapshots[0],
    storedDraft,
  })
  assert.equal(clearRestore.kind, 'clear')
  assert.equal(clearRestore.markdown, '')
  assert.equal(clearRestore.snapshotName, '')
})

test('saveComposerSnapshot restores archived snapshots and toggleComposerSnapshotArchive flips archive state', () => {
  const archivedSnapshot: StoredComposerSnapshot = {
    ...baseSnapshots[0],
    archivedAt: '2026-03-25T13:00:00.000Z',
  }
  const nextSave = saveComposerSnapshot({
    snapshots: [archivedSnapshot],
    selectionKey: archivedSnapshot.selectionKey,
    selectedIdeaIds: ['idea-1', 'idea-2'],
    selectedIdeas: ideas,
    draftMode: 'Project proposal',
    markdown: '# Updated root',
    snapshotNameInput: archivedSnapshot.name,
    snapshotNoteInput: 'Refreshed note',
    fallbackTitle: 'Fallback',
    now: '2026-03-25T13:10:00.000Z',
  })

  assert.equal(nextSave.savedSnapshot.id, archivedSnapshot.id)
  assert.equal(nextSave.savedSnapshot.archivedAt, undefined)
  assert.equal(nextSave.savedSnapshot.note, 'Refreshed note')
  assert.equal(nextSave.savedSnapshot.documentName, 'Segment Anything')
  assert.deepEqual(nextSave.savedSnapshot.ideaTags, ['Experiment', 'Project'])

  const archivedAgain = toggleComposerSnapshotArchive({
    snapshots: nextSave.snapshots,
    snapshotId: archivedSnapshot.id,
    now: '2026-03-25T13:20:00.000Z',
  })
  assert.equal(archivedAgain.snapshot?.archivedAt, '2026-03-25T13:20:00.000Z')
  assert.equal(archivedAgain.status, 'Snapshot archived.')
})

test('planComposerSnapshotLoad and duplicateComposerSnapshot preserve selection-aware workflow', () => {
  const sameSelection = planComposerSnapshotLoad(baseSnapshots[0], baseSnapshots[0].selectionKey)
  assert.equal(sameSelection.markdown, '# Root')
  assert.equal(sameSelection.pendingSnapshot, null)

  const differentSelection = planComposerSnapshotLoad(baseSnapshots[0], 'Experiment plan::idea-1')
  assert.equal(differentSelection.markdown, null)
  assert.deepEqual(differentSelection.nextSelectedIdeaIds, ['idea-1', 'idea-2'])
  assert.equal(differentSelection.nextDraftMode, 'Project proposal')

  const duplicated = duplicateComposerSnapshot({
    snapshots: baseSnapshots,
    snapshot: baseSnapshots[0],
    now: '2026-03-25T14:00:00.000Z',
    createId: () => 'copy-2',
  })
  assert.equal(duplicated.duplicatedSnapshot.id, 'copy-2')
  assert.equal(duplicated.duplicatedSnapshot.parentSnapshotId, 'root')
  assert.equal(duplicated.duplicatedSnapshot.parentSnapshotName, 'Decoder direction')
  assert.equal(duplicated.duplicatedSnapshot.name, 'Decoder direction (copy 2)')
})

test('renameComposerSnapshot syncs child parent labels and deleteComposerSnapshot preserves missing parent names', () => {
  const renamed = renameComposerSnapshot({
    snapshots: baseSnapshots,
    snapshot: baseSnapshots[0],
    nextNameInput: 'Decoder thesis',
    nextNoteInput: 'Sharper focus',
    now: '2026-03-25T15:00:00.000Z',
  })
  assert.equal(renamed.kind, 'success')
  if (renamed.kind !== 'success') {
    return
  }

  const renamedChild = renamed.snapshots.find((snapshot) => snapshot.id === 'child')
  assert.equal(renamed.renamedSnapshot.name, 'Decoder thesis')
  assert.equal(renamedChild?.parentSnapshotName, 'Decoder thesis')

  const deleted = deleteComposerSnapshot({
    snapshotId: 'root',
    snapshots: [
      baseSnapshots[0],
      {
        ...baseSnapshots[1],
        parentSnapshotName: undefined,
      },
    ],
  })
  assert.equal(deleted.deletedSnapshot?.id, 'root')
  assert.equal(deleted.snapshots[0].parentSnapshotName, 'Decoder direction')
})
