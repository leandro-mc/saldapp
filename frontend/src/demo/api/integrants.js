import { nextId } from '../data/store.js'
import { integrantHasExpenses } from './errors.js'
import { expensesOf, findGroup, findIntegrantInGroup, findOpenGroup, integrantsOf } from './queries.js'
import { created, noContent, ok, toIntegrantResponse } from './responses.js'
import { validateIntegrant } from './validation.js'

/** POST /groups/:groupId/integrants */
function createIntegrant({ state, params, body }) {
    const { name } = validateIntegrant(body)

    const group = findOpenGroup(state, params.groupId)
    const integrant = { id: nextId(state, 'integrants'), groupId: group.id, name }
    state.integrants.push(integrant)

    return created(toIntegrantResponse(integrant))
}

/** PATCH /groups/:groupId/integrants/:integrantId */
function updateIntegrant({ state, params, body }) {
    const { name } = validateIntegrant(body)

    const group = findOpenGroup(state, params.groupId)
    const integrant = findIntegrantInGroup(state, group.id, params.integrantId)
    integrant.name = name

    return ok(toIntegrantResponse(integrant))
}

/** DELETE /groups/:groupId/integrants/:integrantId. Whoever paid something can't be removed. */
function deleteIntegrant({ state, params }) {
    const group = findOpenGroup(state, params.groupId)
    const integrant = findIntegrantInGroup(state, group.id, params.integrantId)

    if (expensesOf(state, group.id).some(expense => expense.payedBy === integrant.id)) {
        throw integrantHasExpenses(integrant.id)
    }
    state.integrants = state.integrants.filter(candidate => candidate.id !== integrant.id)

    return noContent()
}

/** GET /groups/:groupId/integrants */
function listIntegrants({ state, params }) {
    const group = findGroup(state, params.groupId)
    return ok(integrantsOf(state, group.id).map(toIntegrantResponse))
}

export const integrantRoutes = [
    { method: 'POST', pattern: '/groups/:groupId/integrants', handler: createIntegrant },
    { method: 'PATCH', pattern: '/groups/:groupId/integrants/:integrantId', handler: updateIntegrant },
    { method: 'DELETE', pattern: '/groups/:groupId/integrants/:integrantId', handler: deleteIntegrant },
    { method: 'GET', pattern: '/groups/:groupId/integrants', handler: listIntegrants },
]
