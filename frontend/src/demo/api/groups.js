import { nextId } from '../data/store.js'
import { toLocalDateTime } from '../domain/dates.js'
import { findGroup, findOpenGroup } from './queries.js'
import { created, ok, toGroupResponse } from './responses.js'
import { validateCreateGroup, validateUpdateGroup } from './validation.js'

/** POST /groups */
function createGroup({ state, body }) {
    const data = validateCreateGroup(body)

    const group = { id: nextId(state, 'groups'), ...data, endDate: null }
    state.groups.push(group)

    return created(toGroupResponse(state, group))
}

/** GET /groups/:groupId */
function getGroup({ state, params }) {
    return ok(toGroupResponse(state, findGroup(state, params.groupId)))
}

/** PATCH /groups/:groupId. Only name, description and currency change; the start date is fixed. */
function updateGroup({ state, params, body }) {
    const data = validateUpdateGroup(body)

    const group = findOpenGroup(state, params.groupId)
    Object.assign(group, data)

    return ok(toGroupResponse(state, group))
}

/** POST /groups/:groupId/close. A closed group is read-only from then on. */
function closeGroup({ state, params }) {
    const group = findOpenGroup(state, params.groupId)
    group.endDate = toLocalDateTime(new Date())

    return ok(toGroupResponse(state, group))
}

export const groupRoutes = [
    { method: 'POST', pattern: '/groups', handler: createGroup },
    { method: 'GET', pattern: '/groups/:groupId', handler: getGroup },
    { method: 'PATCH', pattern: '/groups/:groupId', handler: updateGroup },
    { method: 'POST', pattern: '/groups/:groupId/close', handler: closeGroup },
]
