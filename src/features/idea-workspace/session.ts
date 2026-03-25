import type { StoredIdea } from '../reader/types.ts'
import type { DraftMode } from './composer.ts'
import { deriveSnapshotDocumentName, deriveSnapshotIdeaTags } from './selectors.ts'
import { buildDuplicateSnapshotName } from './snapshots.ts'
import type { StoredComposerDraft, StoredComposerSnapshot } from './storage.ts'

type ComposerDraftRestoreResult =
  | {
      kind: 'noop'
    }
  | {
      kind: 'clear' | 'pending-snapshot' | 'stored-draft' | 'baseline'
      markdown: string
      pendingSnapshot: StoredComposerSnapshot | null
      restoredSelectionKey: string
      snapshotName: string
      snapshotNote: string
      status: string | null
    }

export type SaveComposerSnapshotResult = {
  savedSnapshot: StoredComposerSnapshot
  snapshots: StoredComposerSnapshot[]
  status: string
}

export type ComposerSnapshotLoadPlan = {
  markdown: string | null
  nextDraftMode: DraftMode | null
  nextSelectedIdeaIds: string[] | null
  pendingSnapshot: StoredComposerSnapshot | null
  snapshotName: string
  snapshotNote: string
  status: string
}

export type DuplicateComposerSnapshotResult = {
  duplicatedSnapshot: StoredComposerSnapshot
  snapshots: StoredComposerSnapshot[]
  status: string
}

export type RenameComposerSnapshotResult =
  | {
      kind: 'error'
      status: string
    }
  | {
      kind: 'success'
      renamedSnapshot: StoredComposerSnapshot
      snapshots: StoredComposerSnapshot[]
      status: string
    }

export type ToggleComposerSnapshotArchiveResult = {
  snapshot: StoredComposerSnapshot | null
  snapshots: StoredComposerSnapshot[]
  status: string | null
}

export type DeleteComposerSnapshotResult = {
  deletedSnapshot: StoredComposerSnapshot | null
  snapshots: StoredComposerSnapshot[]
  status: string
}

export function resolveComposerDraftRestore(params: {
  ideaDraftMarkdown: string
  pendingSnapshot: StoredComposerSnapshot | null
  previousSelectionKey: string
  selectedIdeaCount: number
  selectionKey: string
  storedDraft: StoredComposerDraft | null
}): ComposerDraftRestoreResult {
  const {
    ideaDraftMarkdown,
    pendingSnapshot,
    previousSelectionKey,
    selectedIdeaCount,
    selectionKey,
    storedDraft,
  } = params

  if (!selectedIdeaCount) {
    return {
      kind: 'clear',
      markdown: '',
      pendingSnapshot: null,
      restoredSelectionKey: selectionKey,
      snapshotName: '',
      snapshotNote: '',
      status: null,
    }
  }

  if (previousSelectionKey === selectionKey) {
    return {
      kind: 'noop',
    }
  }

  if (pendingSnapshot && pendingSnapshot.selectionKey === selectionKey) {
    return {
      kind: 'pending-snapshot',
      markdown: pendingSnapshot.markdown,
      pendingSnapshot: null,
      restoredSelectionKey: selectionKey,
      snapshotName: pendingSnapshot.name,
      snapshotNote: pendingSnapshot.note ?? '',
      status: `Loaded snapshot "${pendingSnapshot.name}".`,
    }
  }

  if (storedDraft && storedDraft.selectionKey === selectionKey) {
    return {
      kind: 'stored-draft',
      markdown: storedDraft.markdown,
      pendingSnapshot,
      restoredSelectionKey: selectionKey,
      snapshotName: '',
      snapshotNote: '',
      status: 'Restored saved draft.',
    }
  }

  return {
    kind: 'baseline',
    markdown: ideaDraftMarkdown,
    pendingSnapshot,
    restoredSelectionKey: selectionKey,
    snapshotName: '',
    snapshotNote: '',
    status: null,
  }
}

export function saveComposerSnapshot(params: {
  createId?: () => string
  draftMode: DraftMode
  fallbackTitle: string
  markdown: string
  now: string
  selectedIdeaIds: string[]
  selectedIdeas: StoredIdea[]
  selectionKey: string
  snapshotNameInput: string
  snapshotNoteInput: string
  snapshots: StoredComposerSnapshot[]
}): SaveComposerSnapshotResult {
  const {
    createId = () => crypto.randomUUID(),
    draftMode,
    fallbackTitle,
    markdown,
    now,
    selectedIdeaIds,
    selectedIdeas,
    selectionKey,
    snapshotNameInput,
    snapshotNoteInput,
    snapshots,
  } = params
  const snapshotName = snapshotNameInput.trim() || fallbackTitle
  const snapshotNote = snapshotNoteInput.trim() || undefined
  const documentName = deriveSnapshotDocumentName(selectedIdeas)
  const ideaTags = deriveSnapshotIdeaTags(selectedIdeas)
  const existingSnapshot =
    snapshots.find(
      (snapshot) => snapshot.name === snapshotName && snapshot.selectionKey === selectionKey,
    ) ?? null

  const savedSnapshot: StoredComposerSnapshot = existingSnapshot
    ? {
        ...existingSnapshot,
        archivedAt: undefined,
        draftMode,
        documentName,
        ideaTags,
        markdown,
        note: snapshotNote,
        selectedIdeaIds: [...selectedIdeaIds],
        updatedAt: now,
      }
    : {
        id: createId(),
        name: snapshotName,
        selectionKey,
        selectedIdeaIds: [...selectedIdeaIds],
        draftMode,
        markdown,
        updatedAt: now,
        documentName,
        ideaTags,
        note: snapshotNote,
      }

  return {
    savedSnapshot,
    snapshots: [savedSnapshot, ...snapshots.filter((snapshot) => snapshot.id !== savedSnapshot.id)],
    status: `Saved snapshot "${snapshotName}".`,
  }
}

export function planComposerSnapshotLoad(
  snapshot: StoredComposerSnapshot,
  activeSelectionKey: string,
): ComposerSnapshotLoadPlan {
  if (snapshot.selectionKey === activeSelectionKey) {
    return {
      markdown: snapshot.markdown,
      nextDraftMode: null,
      nextSelectedIdeaIds: null,
      pendingSnapshot: null,
      snapshotName: snapshot.name,
      snapshotNote: snapshot.note ?? '',
      status: `Loaded snapshot "${snapshot.name}".`,
    }
  }

  return {
    markdown: null,
    nextDraftMode: snapshot.draftMode,
    nextSelectedIdeaIds: [...snapshot.selectedIdeaIds],
    pendingSnapshot: snapshot,
    snapshotName: snapshot.name,
    snapshotNote: snapshot.note ?? '',
    status: `Loading snapshot "${snapshot.name}"...`,
  }
}

export function duplicateComposerSnapshot(params: {
  createId?: () => string
  now: string
  snapshot: StoredComposerSnapshot
  snapshots: StoredComposerSnapshot[]
}): DuplicateComposerSnapshotResult {
  const { createId = () => crypto.randomUUID(), now, snapshot, snapshots } = params
  const duplicatedSnapshot: StoredComposerSnapshot = {
    ...snapshot,
    id: createId(),
    name: buildDuplicateSnapshotName(snapshot, snapshots),
    updatedAt: now,
    archivedAt: undefined,
    parentSnapshotId: snapshot.id,
    parentSnapshotName: snapshot.name,
  }

  return {
    duplicatedSnapshot,
    snapshots: [duplicatedSnapshot, ...snapshots],
    status: `Duplicated snapshot as "${duplicatedSnapshot.name}".`,
  }
}

export function renameComposerSnapshot(params: {
  nextNameInput: string
  nextNoteInput: string
  now: string
  snapshot: StoredComposerSnapshot
  snapshots: StoredComposerSnapshot[]
}): RenameComposerSnapshotResult {
  const { nextNameInput, nextNoteInput, now, snapshot, snapshots } = params
  const nextName = nextNameInput.trim()

  if (!nextName) {
    return {
      kind: 'error',
      status: 'Snapshot name cannot be empty.',
    }
  }

  const hasConflict = snapshots.some(
    (currentSnapshot) =>
      currentSnapshot.id !== snapshot.id &&
      currentSnapshot.selectionKey === snapshot.selectionKey &&
      currentSnapshot.name === nextName,
  )

  if (hasConflict) {
    return {
      kind: 'error',
      status: `A snapshot named "${nextName}" already exists for this draft selection.`,
    }
  }

  const renamedSnapshot: StoredComposerSnapshot = {
    ...snapshot,
    name: nextName,
    note: nextNoteInput.trim() || undefined,
    updatedAt: now,
  }

  return {
    kind: 'success',
    renamedSnapshot,
    snapshots: snapshots.map((currentSnapshot) => {
      if (currentSnapshot.id === snapshot.id) {
        return renamedSnapshot
      }

      if (currentSnapshot.parentSnapshotId === snapshot.id) {
        return {
          ...currentSnapshot,
          parentSnapshotName: nextName,
        }
      }

      return currentSnapshot
    }),
    status: `Renamed snapshot to "${nextName}".`,
  }
}

export function toggleComposerSnapshotArchive(params: {
  now: string
  snapshotId: string
  snapshots: StoredComposerSnapshot[]
}): ToggleComposerSnapshotArchiveResult {
  const { now, snapshotId, snapshots } = params
  const targetSnapshot = snapshots.find((snapshot) => snapshot.id === snapshotId) ?? null

  if (!targetSnapshot) {
    return {
      snapshot: null,
      snapshots,
      status: null,
    }
  }

  const nextArchivedAt = targetSnapshot.archivedAt ? undefined : now
  const updatedSnapshot: StoredComposerSnapshot = {
    ...targetSnapshot,
    archivedAt: nextArchivedAt,
    updatedAt: now,
  }

  return {
    snapshot: updatedSnapshot,
    snapshots: snapshots.map((snapshot) => (snapshot.id === snapshotId ? updatedSnapshot : snapshot)),
    status: nextArchivedAt ? 'Snapshot archived.' : 'Snapshot restored.',
  }
}

export function deleteComposerSnapshot(params: {
  snapshotId: string
  snapshots: StoredComposerSnapshot[]
}): DeleteComposerSnapshotResult {
  const { snapshotId, snapshots } = params
  const deletedSnapshot = snapshots.find((snapshot) => snapshot.id === snapshotId) ?? null

  if (!deletedSnapshot) {
    return {
      deletedSnapshot: null,
      snapshots,
      status: 'Snapshot deleted.',
    }
  }

  return {
    deletedSnapshot,
    snapshots: snapshots
      .filter((snapshot) => snapshot.id !== snapshotId)
      .map((snapshot) =>
        snapshot.parentSnapshotId === snapshotId
          ? {
              ...snapshot,
              parentSnapshotName: snapshot.parentSnapshotName ?? deletedSnapshot.name,
            }
          : snapshot,
      ),
    status: 'Snapshot deleted.',
  }
}
