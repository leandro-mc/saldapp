import { expenseNotInGroup, groupClosed, integrantNotInGroup, notFound } from './errors.js'

/*
 * Lookups shared by the handlers. They mirror the private helpers of the backend's use cases
 * (findOpenGroup, findAndValidateIntegrant, findAndValidateExpense), including which error each
 * failure produces and in which order the checks run.
 */

/** @typedef {import('../../types/demoState.js').DemoState} DemoState */

/**
 * @param {DemoState} state
 * @param {number | bigint} groupId
 */
export const integrantsOf = (state, groupId) => state.integrants.filter(integrant => integrant.groupId === groupId)

/**
 * @param {DemoState} state
 * @param {number | bigint} groupId
 */
export const expensesOf = (state, groupId) => state.expenses.filter(expense => expense.groupId === groupId)

/**
 * @param {DemoState} state
 * @param {number | bigint} groupId
 */
export function findGroup(state, groupId) {
    const group = state.groups.find(candidate => candidate.id === groupId)
    if (!group) throw notFound('Group', groupId)
    return group
}

/**
 * The group, only if it exists (404) and is still open (409).
 *
 * @param {DemoState} state
 * @param {number | bigint} groupId
 */
export function findOpenGroup(state, groupId) {
    const group = findGroup(state, groupId)
    if (group.endDate !== null) throw groupClosed(group.id)
    return group
}

/**
 * The integrant, only if it exists (404) and belongs to the group (409).
 *
 * @param {DemoState} state
 * @param {number | bigint} groupId
 * @param {number | bigint} integrantId
 */
export function findIntegrantInGroup(state, groupId, integrantId) {
    const integrant = state.integrants.find(candidate => candidate.id === integrantId)
    if (!integrant) throw notFound('Integrant', integrantId)
    if (integrant.groupId !== groupId) throw integrantNotInGroup(integrant.id, groupId)
    return integrant
}

/**
 * The expense, only if it exists (404) and belongs to the group (409).
 *
 * @param {DemoState} state
 * @param {number | bigint} groupId
 * @param {number | bigint} expenseId
 */
export function findExpenseInGroup(state, groupId, expenseId) {
    const expense = state.expenses.find(candidate => candidate.id === expenseId)
    if (!expense) throw notFound('Expense', expenseId)
    if (expense.groupId !== groupId) throw expenseNotInGroup(expense.id, groupId)
    return expense
}
