import { ideaTags, type IdeaTag, type StoredIdea } from '../reader/types.ts'
import type { DraftMode } from './composer.ts'
import type { StoredComposerSnapshot } from './storage.ts'

export const snapshotVisibilityFilters = ['All snapshots', 'Active only', 'Archived only'] as const
export type SnapshotVisibilityFilter = (typeof snapshotVisibilityFilters)[number]

export const timeFilters = ['All time', 'Last 24h', 'Last 7d'] as const
export type IdeaTimeFilter = (typeof timeFilters)[number]

export function getIdeaDocumentName(idea: StoredIdea): string {
  return idea.documentName?.trim() || 'Unknown paper'
}

export function getSnapshotDocumentName(snapshot: StoredComposerSnapshot): string {
  return snapshot.documentName?.trim() || 'Unknown paper'
}

export function getSnapshotTagSummary(snapshot: StoredComposerSnapshot): string {
  if (!snapshot.ideaTags?.length) {
    return 'No tags'
  }

  return snapshot.ideaTags.join(', ')
}

export function matchesIdeaSearch(idea: StoredIdea, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (!query) {
    return true
  }

  return [
    idea.text,
    idea.quote,
    idea.paragraphId,
    getIdeaDocumentName(idea),
    idea.tag,
  ].some((field) => field.toLowerCase().includes(query))
}

export function matchesSnapshotSearch(snapshot: StoredComposerSnapshot, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (!query) {
    return true
  }

  return [
    snapshot.name,
    snapshot.draftMode,
    getSnapshotDocumentName(snapshot),
    snapshot.note ?? '',
    ...(snapshot.ideaTags ?? []),
  ].some((field) => field.toLowerCase().includes(query))
}

export function matchesSnapshotVisibility(
  snapshot: StoredComposerSnapshot,
  filterLabel: SnapshotVisibilityFilter,
): boolean {
  if (filterLabel === 'All snapshots') {
    return true
  }

  if (filterLabel === 'Active only') {
    return !snapshot.archivedAt
  }

  return Boolean(snapshot.archivedAt)
}

export function matchesIdeaTimeFilter(idea: StoredIdea, filterLabel: IdeaTimeFilter): boolean {
  if (filterLabel === 'All time') {
    return true
  }

  const activityAt = new Date(idea.updatedAt ?? idea.createdAt).getTime()
  if (Number.isNaN(activityAt)) {
    return false
  }

  const elapsed = Date.now() - activityAt
  if (filterLabel === 'Last 24h') {
    return elapsed <= 24 * 60 * 60 * 1000
  }

  return elapsed <= 7 * 24 * 60 * 60 * 1000
}

export function buildComposerSelectionKey(selectedIds: string[], mode: DraftMode): string {
  const normalizedIds = [...selectedIds].sort((left, right) => left.localeCompare(right))
  return `${mode}::${normalizedIds.join(',')}`
}

export function deriveSnapshotDocumentName(ideas: StoredIdea[]): string {
  const documents = Array.from(new Set(ideas.map((idea) => getIdeaDocumentName(idea))))
  if (!documents.length) {
    return 'Unknown paper'
  }

  if (documents.length === 1) {
    return documents[0]
  }

  return `Mixed papers (${documents.length})`
}

export function deriveSnapshotIdeaTags(ideas: StoredIdea[]): IdeaTag[] {
  const tags = Array.from(new Set(ideas.map((idea) => idea.tag)))
  return ideaTags.filter((tag) => tags.includes(tag))
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
