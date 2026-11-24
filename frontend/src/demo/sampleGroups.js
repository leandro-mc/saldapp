import { toGroupResponse } from './api/responses.js'
import { loadState } from './data/store.js'

/**
 * The groups the demo was seeded with, as the home page lists them. Read from the live state, so
 * edits (a renamed or closed group) show up. There is no "list groups" endpoint to ask instead.
 *
 * @returns {import('../types/group.js').GroupResponse[]}
 */
export function getSampleGroups() {
    const state = loadState()
    return state.sampleGroupIds
        .map(id => state.groups.find(group => group.id === id))
        .filter(Boolean)
        .map(group => toGroupResponse(state, group))
}
