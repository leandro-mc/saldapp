import { nextId } from '../data/store.js'
import { fitsAmountColumn } from '../domain/money.js'
import { serverError } from './errors.js'
import { findExpenseInGroup, findGroup, findIntegrantInGroup, findOpenGroup } from './queries.js'
import { created, noContent, ok, toExpenseResponse } from './responses.js'
import { validateCreateExpense, validateUpdateExpense } from './validation.js'

/**
 * The amount as stored: rounded to the cent. A value too large for the database column makes the
 * backend fail at save time, after every other check has passed, hence the late 500.
 */
function storedAmountCents({ cents }) {
    if (!fitsAmountColumn(cents)) throw serverError()
    return Number(cents)
}

/** POST /groups/:groupId/expenses */
function createExpense({ state, params, body }) {
    const data = validateCreateExpense(body)

    const group = findOpenGroup(state, params.groupId)
    const payer = findIntegrantInGroup(state, group.id, data.payedBy)

    const expense = {
        id: nextId(state, 'expenses'),
        groupId: group.id,
        payedBy: payer.id,
        description: data.description,
        amountCents: storedAmountCents(data.amount),
        date: data.date,
    }
    state.expenses.push(expense)

    return created(toExpenseResponse(expense))
}

/** PATCH /groups/:groupId/expenses/:expenseId. The date can't be changed. */
function updateExpense({ state, params, body }) {
    const data = validateUpdateExpense(body)

    const group = findOpenGroup(state, params.groupId)
    const expense = findExpenseInGroup(state, group.id, params.expenseId)
    const payer = findIntegrantInGroup(state, group.id, data.payedBy)

    expense.payedBy = payer.id
    expense.description = data.description
    expense.amountCents = storedAmountCents(data.amount)

    return ok(toExpenseResponse(expense))
}

/** DELETE /groups/:groupId/expenses/:expenseId */
function deleteExpense({ state, params }) {
    const group = findOpenGroup(state, params.groupId)
    const expense = findExpenseInGroup(state, group.id, params.expenseId)

    state.expenses = state.expenses.filter(candidate => candidate.id !== expense.id)

    return noContent()
}

/** GET /groups/:groupId/expenses/:integrantId (the expenses an integrant paid; the path segment is an integrant id, not an expense id) */
function listExpensesByIntegrant({ state, params }) {
    const group = findGroup(state, params.groupId)
    const integrant = findIntegrantInGroup(state, group.id, params.integrantId)

    return ok(state.expenses.filter(expense => expense.payedBy === integrant.id).map(toExpenseResponse))
}

export const expenseRoutes = [
    { method: 'POST', pattern: '/groups/:groupId/expenses', handler: createExpense },
    { method: 'PATCH', pattern: '/groups/:groupId/expenses/:expenseId', handler: updateExpense },
    { method: 'DELETE', pattern: '/groups/:groupId/expenses/:expenseId', handler: deleteExpense },
    { method: 'GET', pattern: '/groups/:groupId/expenses/:integrantId', handler: listExpensesByIntegrant },
]
