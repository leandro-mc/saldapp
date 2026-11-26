import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calculateSettlements } from '../src/demo/domain/settlementCalculator.js'

// Ports of backend SettlementCalculatorTest. Amounts are cents here, so "100" becomes 10000.
const balance = (id, units) => ({ integrantId: id, totalPaid: 0, balance: Number(units) * 100 })
const totalOf = transactions => transactions.reduce((sum, t) => sum + t.amount, 0)

describe('calculateSettlements', () => {
    describe('input validation', () => {
        it('throws when list is null', () => {
            assert.throws(() => calculateSettlements(null), { message: "balances can't be null" })
        })

        it('throws when list contains a null element', () => {
            assert.throws(() => calculateSettlements([null]), { message: /null/ })
        })

        it('throws when balance field is null', () => {
            assert.throws(
                () => calculateSettlements([{ integrantId: 1, totalPaid: null, balance: null }]),
                { message: /null/ }
            )
        })

        it('throws when integrantId is null', () => {
            assert.throws(
                () => calculateSettlements([{ integrantId: null, totalPaid: 10000, balance: 0 }]),
                { message: /null/ }
            )
        })
    })

    describe('edge cases', () => {
        it('returns empty list when input is empty', () => {
            assert.deepEqual(calculateSettlements([]), [])
        })

        it('returns empty list when all balances are zero', () => {
            assert.deepEqual(calculateSettlements([balance(1, '0'), balance(2, '0')]), [])
        })

        it("returns empty list when there is only one participant with non-zero balance", () => {
            // without a counterparty, the single non-zero balance can't be settled
            assert.deepEqual(calculateSettlements([balance(1, '-100')]), [])
        })
    })

    describe('algorithm correctness', () => {
        it('one debtor and one creditor with equal amounts settle in one transaction', () => {
            const result = calculateSettlements([balance(1, '-100'), balance(2, '100')])

            assert.deepEqual(result, [{ fromIntegrantId: 1, toIntegrantId: 2, amount: 10000 }])
        })

        it('debtor owes more than creditor is owed: creditor settles first', () => {
            const result = calculateSettlements([balance(1, '-100'), balance(2, '+60'), balance(3, '+40')])

            assert.equal(result.length, 2)   // 3 participants -> at most 2 transactions
            assert.equal(totalOf(result), 10000)
        })

        it('creditor is owed more than debtor owes: debtor settles first', () => {
            const result = calculateSettlements([balance(1, '-40'), balance(2, '-60'), balance(3, '+100')])

            assert.equal(result.length, 2)
            assert.equal(totalOf(result), 10000)
        })

        it('multiple debtors and creditors resolve correctly', () => {
            const result = calculateSettlements([
                balance(1, '-90'), balance(2, '-60'), balance(3, '-30'),
                balance(4, '+90'), balance(5, '+60'), balance(6, '+30'),
            ])

            assert.ok(result.length <= 5)   // 6 participants -> at most 5 transactions
            assert.equal(totalOf(result), 18000)
            assert.ok(result.every(t => t.amount > 0))
        })

        it('exact pairs cancel in minimum transactions (double elimination)', () => {
            const result = calculateSettlements([balance(1, '-50'), balance(2, '-30'), balance(3, '+50'), balance(4, '+30')])

            assert.equal(result.length, 2)   // exact pairs -> 2 transactions instead of 3
        })

        it('all transaction amounts are positive', () => {
            const result = calculateSettlements([balance(1, '-200'), balance(2, '+80'), balance(3, '+70'), balance(4, '+50')])

            assert.ok(result.every(t => t.amount > 0))
        })
    })

    describe('beyond the Java tests', () => {
        it('does not mutate the balances it receives', () => {
            const balances = [balance(1, '-100'), balance(2, '+60'), balance(3, '+40')]
            const before = structuredClone(balances)

            calculateSettlements(balances)

            assert.deepEqual(balances, before)
        })

        it('settles the biggest debtor with the biggest creditor first', () => {
            const result = calculateSettlements([balance(1, '-10'), balance(2, '-50'), balance(3, '+20'), balance(4, '+40')])

            assert.deepEqual(result[0], { fromIntegrantId: 2, toIntegrantId: 4, amount: 4000 })
        })
    })

    // The fixtures come from running the real SettlementCalculator.java (see tests/oracle).
    // With equal balances the output order depends on PriorityQueue internals, so this only
    // passes if those are reproduced exactly.
    describe('parity with the Java implementation', () => {
        const { settlements } = JSON.parse(readFileSync(new URL('./oracle/fixtures.json', import.meta.url), 'utf8'))

        it('has fixtures to compare against', () => {
            assert.ok(settlements.length > 0)
        })

        settlements.forEach((scenario, index) => {
            it(`matches Java on scenario ${index + 1} (${scenario.balances.length} balances)`, () => {
                const balances = scenario.balances.map(b => ({ ...b, totalPaid: 0 }))

                const result = calculateSettlements(balances).map(t => [t.fromIntegrantId, t.toIntegrantId, t.amount])

                assert.deepStrictEqual(result, scenario.settlements)
            })
        })
    })
})
