import { divideHalfUp } from './money.js'
import { hashMapOrder, longHashCode } from './javaCollections.js'

/**
 * @typedef {import('./settlementCalculator.js').Balance} Balance
 */

/**
 * @typedef {Object} PaidExpense
 * @property {number} payedBy  Integrant id
 * @property {number} amount   Cents
 */

/**
 * What every integrant owes: the group total split evenly, rounded HALF_UP to the cent.
 * The rounded shares don't always add up to the total; the remaining cents stay unassigned,
 * exactly like in the backend.
 *
 * @param {PaidExpense[]} expenses  Every expense of the group
 * @param {number} integrantCount
 * @returns {number} Cents
 */
function equalShare(expenses, integrantCount) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return divideHalfUp(total, integrantCount)
}

/**
 * Port of GroupFinancialUseCaseImp.calculateGroupBalances.
 *
 * The list comes out in the iteration order of the backend's HashMap, not sorted by id
 * (e.g. ids 15, 16, 17 are listed as 16, 17, 15), and the settlement tie-breaking depends on it.
 *
 * @param {number[]} integrantIds  Ids of the group's integrants, in the order the backend reads them
 * @param {PaidExpense[]} expenses  Every expense of the group
 * @returns {Balance[]}
 */
export function calculateGroupBalances(integrantIds, expenses) {
    if (integrantIds.length === 0) return []

    const share = equalShare(expenses, integrantIds.length)

    // Everyone starts owing their share; each expense then credits its payer.
    // `0 - share` instead of `-share`: JSON would turn -0 into 0, but Intl.NumberFormat shows "-0.00".
    const balances = new Map(integrantIds.map(id => [id, 0 - share]))
    const totalPaid = new Map(integrantIds.map(id => [id, 0]))

    for (const { payedBy, amount } of expenses) {
        balances.set(payedBy, (balances.get(payedBy) ?? 0) + amount)
        totalPaid.set(payedBy, (totalPaid.get(payedBy) ?? 0) + amount)
    }

    return hashMapOrder([...balances.keys()], longHashCode).map(integrantId => ({
        integrantId,
        totalPaid: totalPaid.get(integrantId),
        balance: balances.get(integrantId),
    }))
}

/**
 * Port of GroupFinancialUseCaseImp.calculateIntegrantBalance.
 *
 * @param {number} integrantId
 * @param {PaidExpense[]} groupExpenses  Every expense of the group
 * @param {number} integrantCount  Integrants in the group
 * @returns {Balance}
 */
export function calculateIntegrantBalance(integrantId, groupExpenses, integrantCount) {
    const totalPaid = groupExpenses
        .filter(expense => expense.payedBy === integrantId)
        .reduce((sum, expense) => sum + expense.amount, 0)

    return { integrantId, totalPaid, balance: totalPaid - equalShare(groupExpenses, integrantCount) }
}
