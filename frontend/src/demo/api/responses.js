import { centsToAmount } from '../domain/money.js'
import { expensesOf, integrantsOf } from './queries.js'

/*
 * Response bodies, in the shape of the backend's response DTOs (see src/types), plus the HTTP
 * status wrappers handlers return.
 */

/** @typedef {import('../../types/demoState.js').DemoState} DemoState */

export const ok = data => ({ status: 200, data })
export const created = data => ({ status: 201, data })
export const noContent = () => ({ status: 204, data: '' })

/**
 * GroupResponse: the group plus its integrant count and expense total.
 *
 * @param {DemoState} state
 * @param {import('../../types/demoState.js').DemoGroup} group
 */
export function toGroupResponse(state, group) {
    const totalCents = expensesOf(state, group.id).reduce((sum, expense) => sum + expense.amountCents, 0)
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        currency: group.currency,
        integrantCount: integrantsOf(state, group.id).length,
        totalExpenses: centsToAmount(totalCents),
        startDate: group.startDate,
        endDate: group.endDate,
    }
}

/** @param {import('../../types/demoState.js').DemoIntegrant} integrant */
export const toIntegrantResponse = integrant => ({ id: integrant.id, groupId: integrant.groupId, name: integrant.name })

/** @param {import('../../types/demoState.js').DemoExpense} expense */
export const toExpenseResponse = expense => ({
    id: expense.id,
    groupId: expense.groupId,
    payedBy: expense.payedBy,
    description: expense.description,
    amount: centsToAmount(expense.amountCents),
    date: expense.date,
})
