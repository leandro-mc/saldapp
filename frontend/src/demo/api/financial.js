import { calculateGroupBalances, calculateIntegrantBalance } from '../domain/balanceCalculator.js'
import { centsToAmount } from '../domain/money.js'
import { calculateSettlements } from '../domain/settlementCalculator.js'
import { expensesOf, findGroup, findIntegrantInGroup, integrantsOf } from './queries.js'
import { ok } from './responses.js'

/** Expenses in the shape the calculators take. */
const paidExpenses = (state, groupId) =>
    expensesOf(state, groupId).map(expense => ({ payedBy: expense.payedBy, amount: expense.amountCents }))

/** BalanceResponse */
const toBalanceResponse = (balance, integrantName) => ({
    integrantId: balance.integrantId,
    integrantName,
    totalPaid: centsToAmount(balance.totalPaid),
    balance: centsToAmount(balance.balance),
})

/** Balances of a group, in the order the backend lists them. */
function groupBalances(state, groupId) {
    const integrantIds = integrantsOf(state, groupId).map(integrant => integrant.id)
    return calculateGroupBalances(integrantIds, paidExpenses(state, groupId))
}

/** Name lookup for response bodies. */
const integrantNames = (state, groupId) =>
    new Map(integrantsOf(state, groupId).map(integrant => [integrant.id, integrant.name]))

/** GET /groups/:groupId/balances */
function listBalances({ state, params }) {
    const group = findGroup(state, params.groupId)
    const names = integrantNames(state, group.id)

    return ok(groupBalances(state, group.id).map(balance => toBalanceResponse(balance, names.get(balance.integrantId))))
}

/** GET /groups/:groupId/balances/:integrantId */
function getIntegrantBalance({ state, params }) {
    const group = findGroup(state, params.groupId)
    const integrant = findIntegrantInGroup(state, group.id, params.integrantId)

    const balance = calculateIntegrantBalance(
        integrant.id,
        paidExpenses(state, group.id),
        integrantsOf(state, group.id).length
    )
    return ok(toBalanceResponse(balance, integrant.name))
}

/** GET /groups/:groupId/settlements: the fewest-payments plan to settle the group's debts. */
function listSettlements({ state, params }) {
    const group = findGroup(state, params.groupId)
    const names = integrantNames(state, group.id)

    const settlements = calculateSettlements(groupBalances(state, group.id)).map(transaction => ({
        fromIntegrantId: transaction.fromIntegrantId,
        fromIntegrantName: names.get(transaction.fromIntegrantId),
        toIntegrantId: transaction.toIntegrantId,
        toIntegrantName: names.get(transaction.toIntegrantId),
        amount: centsToAmount(transaction.amount),
    }))
    return ok(settlements)
}

export const financialRoutes = [
    { method: 'GET', pattern: '/groups/:groupId/balances', handler: listBalances },
    { method: 'GET', pattern: '/groups/:groupId/balances/:integrantId', handler: getIntegrantBalance },
    { method: 'GET', pattern: '/groups/:groupId/settlements', handler: listSettlements },
]
