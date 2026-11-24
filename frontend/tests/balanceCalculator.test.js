import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calculateGroupBalances, calculateIntegrantBalance } from '../src/demo/domain/balanceCalculator.js'
import { calculateSettlements } from '../src/demo/domain/settlementCalculator.js'

const expense = (payedBy, amount) => ({ payedBy, amount })
const asTuples = balances => balances.map(b => [b.integrantId, b.totalPaid, b.balance])

describe('calculateGroupBalances', () => {
    it('returns nothing for a group without integrants', () => {
        assert.deepEqual(calculateGroupBalances([], [expense(1, 1000)]), [])
    })

    it('splits the total evenly and credits each payer', () => {
        const balances = calculateGroupBalances([1, 2, 3], [expense(1, 9000), expense(2, 3000)])

        // total 120.00 / 3 = 40.00 each
        assert.deepEqual(asTuples(balances), [[1, 9000, 5000], [2, 3000, -1000], [3, 0, -4000]])
    })

    it('leaves a group with no expenses at zero', () => {
        const balances = calculateGroupBalances([1, 2], [])

        assert.deepStrictEqual(asTuples(balances), [[1, 0, 0], [2, 0, 0]])   // strict: a -0 would fail
    })

    it('rounds the equal share HALF_UP, leaving the leftover cents unassigned', () => {
        // 100.00 / 3 = 33.333... -> 33.33; the three balances add up to +0.01, not 0
        const balances = calculateGroupBalances([1, 2, 3], [expense(1, 10000)])

        assert.deepEqual(asTuples(balances), [[1, 10000, 6667], [2, 0, -3333], [3, 0, -3333]])
        assert.equal(balances.reduce((sum, b) => sum + b.balance, 0), 1)
    })

    it('rounds a share that ends exactly in half a cent up', () => {
        // 10.01 / 2 = 5.005 -> 5.01
        const balances = calculateGroupBalances([1, 2], [expense(1, 1001)])

        assert.deepEqual(asTuples(balances), [[1, 1001, 500], [2, 0, -501]])
    })

    it('lists balances in HashMap order, not by id', () => {
        const ids = balances => balances.map(b => b.integrantId)

        assert.deepEqual(ids(calculateGroupBalances([15, 16, 17], [])), [16, 17, 15])
        assert.deepEqual(ids(calculateGroupBalances([12, 13, 14, 15, 16], [])), [16, 12, 13, 14, 15])
        assert.deepEqual(ids(calculateGroupBalances([1, 2, 3, 4], [])), [1, 2, 3, 4])
    })

    // The fixtures come from the Java backend logic (see tests/oracle): same HashMap, same BigDecimal rounding.
    describe('parity with the Java implementation', () => {
        const { groups } = JSON.parse(readFileSync(new URL('./oracle/fixtures.json', import.meta.url), 'utf8'))

        it('has fixtures to compare against', () => {
            assert.ok(groups.length > 0)
        })

        groups.forEach((scenario, index) => {
            it(`matches Java on group ${index + 1} (${scenario.integrantIds.length} integrants, ${scenario.expenses.length} expenses)`, () => {
                const balances = calculateGroupBalances(scenario.integrantIds, scenario.expenses)

                assert.deepStrictEqual(asTuples(balances), scenario.balances)

                const settlements = calculateSettlements(balances).map(t => [t.fromIntegrantId, t.toIntegrantId, t.amount])
                assert.deepStrictEqual(settlements, scenario.settlements)
            })
        })
    })
})

describe('calculateIntegrantBalance', () => {
    it('agrees with the group balance of the same integrant', () => {
        const ids = [4, 5, 6]
        const expenses = [expense(4, 12345), expense(5, 999), expense(4, 1), expense(6, 50)]
        const fromGroup = calculateGroupBalances(ids, expenses)

        for (const id of ids) {
            assert.deepEqual(calculateIntegrantBalance(id, expenses, ids.length), fromGroup.find(b => b.integrantId === id))
        }
    })

    it('owes the whole share when the integrant paid nothing', () => {
        assert.deepStrictEqual(calculateIntegrantBalance(2, [expense(1, 3000)], 3), { integrantId: 2, totalPaid: 0, balance: -1000 })
    })
})
