import { PriorityQueue } from './javaCollections.js'

/**
 * @typedef {Object} Balance
 * @property {number} integrantId
 * @property {number} totalPaid   Cents
 * @property {number} balance     Cents. Positive: the integrant should receive money; negative: should pay.
 */

/**
 * @typedef {Object} Transaction
 * @property {number} fromIntegrantId
 * @property {number} toIntegrantId
 * @property {number} amount  Cents
 */

/**
 * Port of backend SettlementCalculator.java: greedy settlement that repeatedly makes the biggest
 * debtor pay the biggest creditor. Any change here must keep matching that class, including the
 * order of the result (see the tests, which compare against the Java implementation).
 *
 * Unlike the Java method, this does not mutate the balances it receives.
 *
 * @param {Balance[]} balances
 * @returns {Transaction[]}
 */
export function calculateSettlements(balances) {
    if (balances == null) throw new Error("balances can't be null")

    for (const balance of balances) {
        if (balance == null) throw new Error("balance can't be null")
        if (balance.balance == null || balance.integrantId == null) throw new Error("balance's fields can't be null")
    }

    const pending = balances.map(balance => ({ ...balance }))

    const debtors = new PriorityQueue((a, b) => a.balance - b.balance)    // most negative first
    const creditors = new PriorityQueue((a, b) => b.balance - a.balance)  // most positive first

    for (const balance of pending) {
        if (balance.balance < 0) debtors.offer(balance)
        else if (balance.balance > 0) creditors.offer(balance)
    }

    const transactions = []

    while (!debtors.isEmpty() && !creditors.isEmpty()) {
        const debtor = debtors.poll()
        const creditor = creditors.poll()

        const amount = Math.min(Math.abs(debtor.balance), creditor.balance)
        debtor.balance += amount
        creditor.balance -= amount

        transactions.push({ fromIntegrantId: debtor.integrantId, toIntegrantId: creditor.integrantId, amount })

        // Whoever still has something pending goes back into its queue (at most one of them does)
        if (debtor.balance < 0) debtors.offer(debtor)
        else if (creditor.balance > 0) creditors.offer(creditor)
    }

    return transactions
}
