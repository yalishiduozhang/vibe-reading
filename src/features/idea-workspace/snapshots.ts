import type { DraftMode } from './composer.ts'
import type { StoredComposerSnapshot } from './storage.ts'

export type SnapshotComparisonSummary = {
  note: string
  signals: string[]
}

export type SnapshotLineage = {
  parent: StoredComposerSnapshot | null
  derivedSnapshots: StoredComposerSnapshot[]
}

export function buildDuplicateSnapshotName(
  snapshot: StoredComposerSnapshot,
  snapshots: StoredComposerSnapshot[],
): string {
  const baseName = snapshot.name.replace(/\s+\(copy(?:\s+\d+)?\)$/i, '')
  const existingNames = new Set(
    snapshots
      .filter((currentSnapshot) => currentSnapshot.selectionKey === snapshot.selectionKey)
      .map((currentSnapshot) => currentSnapshot.name.toLowerCase()),
  )

  const firstCopyName = `${baseName} (copy)`
  if (!existingNames.has(firstCopyName.toLowerCase())) {
    return firstCopyName
  }

  let duplicateIndex = 2
  while (existingNames.has(`${baseName} (copy ${duplicateIndex})`.toLowerCase())) {
    duplicateIndex += 1
  }

  return `${baseName} (copy ${duplicateIndex})`
}

export function buildSnapshotRelationSignals(
  snapshot: StoredComposerSnapshot,
  snapshots: StoredComposerSnapshot[],
): string[] {
  const signals: string[] = []
  const parentSnapshot = snapshot.parentSnapshotId
    ? snapshots.find((candidate) => candidate.id === snapshot.parentSnapshotId) ?? null
    : null
  const derivedCount = snapshots.filter((candidate) => candidate.parentSnapshotId === snapshot.id).length

  if (parentSnapshot) {
    signals.push(`derived from ${parentSnapshot.name}`)
  } else if (snapshot.parentSnapshotName) {
    signals.push(`derived from ${snapshot.parentSnapshotName} (source missing)`)
  }

  if (derivedCount > 0) {
    signals.push(`${derivedCount} derived ${derivedCount === 1 ? 'copy' : 'copies'}`)
  }

  return signals
}

export function buildSnapshotLineage(
  snapshot: StoredComposerSnapshot,
  snapshots: StoredComposerSnapshot[],
): SnapshotLineage {
  return {
    parent: snapshot.parentSnapshotId
      ? snapshots.find((candidate) => candidate.id === snapshot.parentSnapshotId) ?? null
      : null,
    derivedSnapshots: snapshots
      .filter((candidate) => candidate.parentSnapshotId === snapshot.id)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
  }
}

export function buildSnapshotComparisonSummary(
  snapshot: StoredComposerSnapshot,
  activeSelectedIdeaIds: string[],
  activeDraftMode: DraftMode,
  activeMarkdown: string,
): SnapshotComparisonSummary {
  if (!activeSelectedIdeaIds.length && !activeMarkdown.trim()) {
    return {
      note: 'No active draft is loaded in the composer, so this snapshot is currently being viewed on its own.',
      signals: ['no active draft loaded'],
    }
  }

  const snapshotSelection = new Set(snapshot.selectedIdeaIds)
  const activeSelection = new Set(activeSelectedIdeaIds)
  const sharedSelectionCount = activeSelectedIdeaIds.filter((ideaId) => snapshotSelection.has(ideaId)).length
  const selectionExactMatch =
    sharedSelectionCount === snapshot.selectedIdeaIds.length && snapshot.selectedIdeaIds.length === activeSelection.size
  const modeExactMatch = snapshot.draftMode === activeDraftMode
  const markdownExactMatch = snapshot.markdown.trim() === activeMarkdown.trim()
  const snapshotLineCount = snapshot.markdown.trim() ? snapshot.markdown.trim().split('\n').length : 0
  const activeLineCount = activeMarkdown.trim() ? activeMarkdown.trim().split('\n').length : 0
  const lineDelta = snapshotLineCount - activeLineCount

  const signals = [
    selectionExactMatch
      ? 'selection: exact match'
      : `selection: ${sharedSelectionCount}/${snapshot.selectedIdeaIds.length} snapshot ideas shared`,
    modeExactMatch ? `mode: same (${snapshot.draftMode})` : `mode: ${snapshot.draftMode} vs ${activeDraftMode}`,
    markdownExactMatch
      ? `markdown: exact match (${snapshotLineCount} lines)`
      : `markdown: ${lineDelta >= 0 ? '+' : ''}${lineDelta} lines vs active`,
  ]

  return {
    note:
      selectionExactMatch && modeExactMatch && markdownExactMatch
        ? 'This snapshot currently matches the active composer draft.'
        : 'This snapshot differs from the active composer draft in at least one of selection, mode, or markdown size.',
    signals,
  }
}
