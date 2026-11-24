import { buildSeedData } from './seedGroups.js'

/** Bump this (it is part of the storage key) whenever the shape of the state changes, so old browsers reseed. */
const STATE_VERSION = 1

/** localStorage key holding the whole demo state. */
export const STORAGE_KEY = `saldapp-demo:v${STATE_VERSION}`

/**
 * Set when localStorage can't be used (blocked, private mode): the state then lives in memory
 * for the rest of the session instead of failing.
 *
 * @type {import('../../types/demoState.js').DemoState | null}
 */
let inMemoryState = null

const createInitialState = () => ({ version: STATE_VERSION, ...buildSeedData(new Date()) })

/** Returns null for a missing, corrupt or outdated value. */
function parseStored(raw) {
    try {
        const state = JSON.parse(raw)
        return state?.version === STATE_VERSION ? state : null
    } catch {
        return null
    }
}

/**
 * Reads the current state (seeding it on first use). The caller gets its own copy: nothing
 * changes until it hands the copy back to `saveState`, so a request that fails halfway changes nothing.
 * Reading from storage on every call also keeps several open tabs consistent.
 *
 * @returns {import('../../types/demoState.js').DemoState}
 */
export function loadState() {
    if (inMemoryState) return structuredClone(inMemoryState)

    let raw
    try {
        raw = localStorage.getItem(STORAGE_KEY)
    } catch {
        inMemoryState = createInitialState()
        return structuredClone(inMemoryState)
    }

    const stored = parseStored(raw)
    if (stored) return stored

    const initial = createInitialState()
    saveState(initial)
    return initial
}

/** @param {import('../../types/demoState.js').DemoState} state */
export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        inMemoryState = structuredClone(state)
    }
}

/** Forgets every change. The next `loadState` starts again from the seed data. */
export function resetDemoData() {
    inMemoryState = null
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // nothing stored, nothing to forget
    }
}

/**
 * Hands out the next id of a table, like a database sequence: ids are global, never reused.
 *
 * @param {import('../../types/demoState.js').DemoState} state
 * @param {'groups' | 'integrants' | 'expenses'} table
 * @returns {number}
 */
export function nextId(state, table) {
    return state.nextIds[table]++
}
