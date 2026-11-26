import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { handleRequest } from '../src/demo/router.js'
import { resetDemoData } from '../src/demo/data/store.js'
import { getSampleGroups } from '../src/demo/sampleGroups.js'

beforeEach(() => resetDemoData())

describe('getSampleGroups', () => {
    it('lists the three seeded groups with their live summary', () => {
        const groups = getSampleGroups()

        assert.deepEqual(groups.map(g => [g.id, g.name, g.currency, g.integrantCount]), [
            [1, 'Viaje a Madrid', '€', 7],
            [2, 'Casa compartida', '$', 4],
            [3, 'Asado del equipo', '₡', 5],
        ])
        assert.deepEqual(groups.map(g => g.endDate !== null), [false, false, true])
    })

    it('reflects changes, and resetting brings the original data back', () => {
        handleRequest({ method: 'POST', path: '/groups/2/close' })
        handleRequest({ method: 'PATCH', path: '/groups/1', data: JSON.stringify({ name: 'Madrid 2', description: '', currency: '€' }) })

        const changed = getSampleGroups()
        assert.deepEqual([changed[0].name, changed[1].endDate !== null], ['Madrid 2', true])

        resetDemoData()

        const restored = getSampleGroups()
        assert.deepEqual([restored[0].name, restored[1].endDate], ['Viaje a Madrid', null])
    })

    it('does not list groups the visitor creates', () => {
        const data = JSON.stringify({ name: 'Mío', description: '', currency: '$', startDate: '2026-05-01T00:00:00' })
        assert.equal(handleRequest({ method: 'POST', path: '/groups', data }).status, 201)

        assert.equal(getSampleGroups().length, 3)
    })

    it('all sample dates are coherent: expenses fall between the start and the closing of their group', () => {
        for (const group of [1, 2, 3]) {
            const { data: summary } = handleRequest({ method: 'GET', path: `/groups/${group}` })
            const { data: integrants } = handleRequest({ method: 'GET', path: `/groups/${group}/integrants` })
            for (const integrant of integrants) {
                const { data: expenses } = handleRequest({ method: 'GET', path: `/groups/${group}/expenses/${integrant.id}` })
                for (const expense of expenses) {
                    assert.ok(expense.date >= summary.startDate, `${summary.name}: ${expense.description} starts before the group`)
                    if (summary.endDate) assert.ok(expense.date <= summary.endDate, `${summary.name}: ${expense.description} is after the closing`)
                }
            }
        }
    })
})
