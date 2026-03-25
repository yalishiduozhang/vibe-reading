import type { IdeaTag, StoredIdea } from '../reader/types'
import type { DraftMode } from './composer'

const ideaStorageKey = 'openviberead.ideas.v1'
const composerStorageKey = 'openviberead.composer-draft.v1'
const composerSnapshotsStorageKey = 'openviberead.composer-snapshots.v1'

export type StoredComposerDraft = {
  selectionKey: string
  selectedIdeaIds: string[]
  draftMode: DraftMode
  markdown: string
  updatedAt: string
}

export type StoredComposerSnapshot = {
  id: string
  name: string
  selectionKey: string
  selectedIdeaIds: string[]
  draftMode: DraftMode
  markdown: string
  updatedAt: string
  documentName?: string
  ideaTags?: IdeaTag[]
}

export function loadStoredIdeas(): StoredIdea[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(ideaStorageKey)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredIdea)
  } catch {
    return []
  }
}

export function saveStoredIdeas(ideas: StoredIdea[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ideaStorageKey, JSON.stringify(ideas))
}

export function loadStoredComposerDraft(): StoredComposerDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(composerStorageKey)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isStoredComposerDraft(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveStoredComposerDraft(draft: StoredComposerDraft) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(composerStorageKey, JSON.stringify(draft))
}

export function clearStoredComposerDraft() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(composerStorageKey)
}

export function loadStoredComposerSnapshots(): StoredComposerSnapshot[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(composerSnapshotsStorageKey)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredComposerSnapshot)
  } catch {
    return []
  }
}

export function saveStoredComposerSnapshots(snapshots: StoredComposerSnapshot[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(composerSnapshotsStorageKey, JSON.stringify(snapshots))
}

function isStoredIdea(value: unknown): value is StoredIdea {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredIdea>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.tag === 'string' &&
    typeof candidate.pageNumber === 'number' &&
    typeof candidate.paragraphId === 'string' &&
    typeof candidate.quote === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.updatedAt === undefined || typeof candidate.updatedAt === 'string') &&
    (candidate.documentName === undefined || typeof candidate.documentName === 'string')
  )
}

function isStoredComposerDraft(value: unknown): value is StoredComposerDraft {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredComposerDraft>
  return (
    typeof candidate.selectionKey === 'string' &&
    Array.isArray(candidate.selectedIdeaIds) &&
    candidate.selectedIdeaIds.every((ideaId) => typeof ideaId === 'string') &&
    typeof candidate.draftMode === 'string' &&
    typeof candidate.markdown === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

function isStoredComposerSnapshot(value: unknown): value is StoredComposerSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<StoredComposerSnapshot>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.selectionKey === 'string' &&
    Array.isArray(candidate.selectedIdeaIds) &&
    candidate.selectedIdeaIds.every((ideaId) => typeof ideaId === 'string') &&
    typeof candidate.draftMode === 'string' &&
    typeof candidate.markdown === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    (candidate.documentName === undefined || typeof candidate.documentName === 'string') &&
    (candidate.ideaTags === undefined ||
      (Array.isArray(candidate.ideaTags) && candidate.ideaTags.every((tag) => typeof tag === 'string')))
  )
}
