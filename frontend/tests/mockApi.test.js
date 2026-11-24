import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { createMockAdapter } from '../src/demo/mockAdapter.js'
import { resetDemoData } from '../src/demo/data/store.js'
import { ApiError } from '../src/utils/ApiError.js'
import { parseApiError } from '../src/utils/errorParser.js'

// Same wiring as src/config/httpClient.js (which can't be imported here: it reads import.meta.env)
const client = axios.create({ adapter: createMockAdapter({ minDelayMs: 0, maxDelayMs: 0 }) })
client.interceptors.response.use(response => response.data, error => Promise.reject(parseApiError(error)))

/** Resolves with the error the UI would receive. */
async function failure(request) {
    try {
        await request
    } catch (error) {
        return error
    }
    assert.fail('the request should have failed')
}

const isoDay = day => `${day}T00:00:00`
const newGroup = (extra = {}) => client.post('/groups', { name: 'Paseo', description: '', currency: '$', startDate: isoDay('2026-05-01'), ...extra })
const addIntegrant = (groupId, name) => client.post(`/groups/${groupId}/integrants`, { name })
const addExpense = (groupId, payedBy, amount, description = 'Gasto de prueba') =>
    client.post(`/groups/${groupId}/expenses`, { payedBy, description, amount, date: isoDay('2026-05-02') })

beforeEach(() => resetDemoData())

describe('sample data', () => {
    it('starts with three groups: a trip, a shared house and a closed, settled dinner', async () => {
        const [trip, house, dinner] = await Promise.all([1, 2, 3].map(id => client.get(`/groups/${id}`)))

        assert.equal(trip.integrantCount, 7)
        assert.equal(trip.totalExpenses, 4656.3)
        assert.equal(trip.endDate, null)
        assert.equal(house.integrantCount, 4)
        assert.equal(house.endDate, null)
        assert.equal(dinner.integrantCount, 5)
        assert.equal(dinner.totalExpenses, 102900)
        assert.notEqual(dinner.endDate, null)
    })

    it('lists balances in the backend order and settles the closed dinner like a hand calculation', async () => {
        // 102900 / 5 = 20580 each. Sofía(12) +25920, Mateo(13) +2545, Camila(14) -4505, Andrés(15) -13830, Paula(16) -10130
        const balances = await client.get('/groups/3/balances')
        assert.deepEqual(balances.map(b => [b.integrantId, b.balance]), [[16, -10130], [12, 25920], [13, 2545], [14, -4505], [15, -13830]])

        const settlements = await client.get('/groups/3/settlements')
        assert.deepEqual(
            settlements.map(s => [s.fromIntegrantName, s.toIntegrantName, s.amount]),
            [['Andrés Brenes', 'Sofía Ramírez', 13830], ['Paula Chaves', 'Sofía Ramírez', 10130], ['Camila Solís', 'Mateo Vargas', 2545], ['Camila Solís', 'Sofía Ramírez', 1960]]
        )
    })

    it('rounds the trip share HALF_UP (4656.30 / 7 = 665.19) and keeps the leftover cents unassigned', async () => {
        const balances = await client.get('/groups/1/balances')

        const ana = balances.find(b => b.integrantName === 'Ana Torres')   // paid 1890 + 98.40
        assert.equal(ana.totalPaid, 1988.4)
        assert.equal(ana.balance, 1323.21)
        const sum = balances.reduce((total, b) => total + Math.round(b.balance * 100), 0)
        assert.equal(sum, -3)   // 7 * 665.19 = 4656.33, three cents more than was spent
    })
})

describe('working on a new group', () => {
    it('creates a group, integrants and expenses, and computes balances and payments by hand', async () => {
        const group = await newGroup()
        assert.equal(group.id, 4)
        assert.deepEqual([group.integrantCount, group.totalExpenses, group.endDate], [0, 0, null])

        const [ana, ben, caro] = await Promise.all(['Ana', 'Ben', 'Caro'].map(name => addIntegrant(group.id, name)))
        assert.deepEqual([ana.id, ben.id, caro.id], [17, 18, 19])   // ids are global, like DB sequences

        await addExpense(group.id, ana.id, '100')
        await addExpense(group.id, ben.id, 20.5)

        // total 120.50 / 3 = 40.1666 -> 40.17 each
        const balances = await client.get(`/groups/${group.id}/balances`)
        assert.deepEqual(
            balances.map(b => [b.integrantName, b.totalPaid, b.balance]),
            [['Ana', 100, 59.83], ['Ben', 20.5, -19.67], ['Caro', 0, -40.17]]
        )

        const settlements = await client.get(`/groups/${group.id}/settlements`)
        assert.deepEqual(settlements.map(s => [s.fromIntegrantName, s.toIntegrantName, s.amount]), [['Caro', 'Ana', 40.17], ['Ben', 'Ana', 19.66]])
    })

    it('edits an expense and moves it to another payer', async () => {
        const group = await newGroup()
        const ana = await addIntegrant(group.id, 'Ana')
        const ben = await addIntegrant(group.id, 'Ben')
        const expense = await addExpense(group.id, ana.id, 30)

        const updated = await client.patch(`/groups/${group.id}/expenses/${expense.id}`, { payedBy: ben.id, description: 'Cena', amount: 50 })

        assert.deepEqual([updated.payedBy, updated.description, updated.amount, updated.date], [ben.id, 'Cena', 50, isoDay('2026-05-02')])
        assert.deepEqual(await client.get(`/groups/${group.id}/expenses/${ana.id}`), [])
        assert.equal((await client.get(`/groups/${group.id}/expenses/${ben.id}`)).length, 1)
        assert.equal((await client.get(`/groups/${group.id}`)).totalExpenses, 50)
    })

    it('computes the balance of a single integrant', async () => {
        const balance = await client.get('/groups/2/balances/9')   // Lucía Herrera

        // total 1641.75 / 4 = 410.4375 -> 410.44; she paid 84.35 + 29.90
        assert.deepEqual(balance, { integrantId: 9, integrantName: 'Lucía Herrera', totalPaid: 114.25, balance: -296.19 })
    })

    it('updates a group and closes it, after which it is read-only', async () => {
        const group = await newGroup()
        const ana = await addIntegrant(group.id, 'Ana')

        const renamed = await client.patch(`/groups/${group.id}`, { name: 'Paseo 2', description: 'x', currency: '€' })
        assert.deepEqual([renamed.name, renamed.currency, renamed.startDate], ['Paseo 2', '€', isoDay('2026-05-01')])

        const closed = await client.post(`/groups/${group.id}/close`)
        assert.notEqual(closed.endDate, null)

        const message = `Group with id ${group.id} is closed and cannot accept new transactions.`
        for (const request of [
            client.patch(`/groups/${group.id}`, { name: 'Otro', description: '', currency: '$' }),
            client.post(`/groups/${group.id}/close`),
            addIntegrant(group.id, 'Ben'),
            addExpense(group.id, ana.id, 10),
            client.delete(`/groups/${group.id}/integrants/${ana.id}`),
        ]) {
            const error = await failure(request)
            assert.deepEqual([error.status, error.error, error.message], [409, 'Conflict', message])
        }
        assert.deepEqual(await client.get(`/groups/${group.id}/integrants`), [{ id: ana.id, groupId: group.id, name: 'Ana' }])   // reads still work
    })
})

describe('errors, as the UI receives them', () => {
    it('answers 404 with the backend message and the ApiError fields', async () => {
        const error = await failure(client.get('/groups/999'))

        assert.ok(error instanceof ApiError)
        assert.deepEqual([error.status, error.error, error.message, error.path], [404, 'Resource Not Found', 'Group with id 999 not found.', '/groups/999'])
        assert.deepEqual(error.errors, {})
        assert.match(error.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('answers 400 with one message per invalid field', async () => {
        const error = await failure(client.post('/groups', { name: '', description: 'd', currency: null, startDate: '' }))

        assert.deepEqual([error.status, error.message], [400, 'Validation failed for one or more fields.'])
        assert.deepEqual(error.errors, {
            name: 'Group name is required, Group name must be between 1 and 200 characters',
            currency: 'Currency is required',
            startDate: 'Start date is required',
        })
    })

    it('lists the invalid fields in the backend HashMap order', async () => {
        const group = (await client.get('/groups/1'))
        const error = await failure(client.post(`/groups/${group.id}/expenses`, { payedBy: '', description: 'ab', amount: '0', date: '' }))

        // Java HashMap order of these keys (verified with java.util.HashMap): date, amount, payedBy, description
        assert.deepEqual(Object.keys(error.errors), ['date', 'amount', 'payedBy', 'description'])
        assert.deepEqual(error.errors, {
            payedBy: 'Payed by is required',
            description: 'Description must be between 4 and 500 characters',
            amount: 'Amount must be greater than 0',
            date: 'Date is required',
        })
    })

    it('answers 400 "Invalid request body" for values that are not the right type', async () => {
        const error = await failure(client.post('/groups/1/expenses', { payedBy: 1, description: 'Algo', amount: 'doce', date: isoDay('2026-05-02') }))
        assert.deepEqual([error.status, error.message, error.errors], [400, 'Invalid request body: check field formats', {}])

        const badDate = await failure(client.post('/groups', { name: 'x', currency: '$', startDate: '2026-05-01' }))
        assert.equal(badDate.status, 400)
        assert.equal(badDate.message, 'Invalid request body: check field formats')
    })

    it('answers 409 when an integrant or an expense belongs to another group', async () => {
        const wrongPayer = await failure(addExpense(1, 8, 10))   // integrant 8 belongs to group 2
        assert.deepEqual([wrongPayer.status, wrongPayer.message], [409, 'Integrant with id 8 does not belong to group with id 1.'])

        const wrongExpense = await failure(client.delete('/groups/2/expenses/1'))   // expense 1 belongs to group 1
        assert.deepEqual([wrongExpense.status, wrongExpense.message], [409, 'Expense with id 1 does not belong to group with id 2.'])
    })

    it('does not delete an integrant who paid something, but deletes one who did not', async () => {
        const paid = await failure(client.delete('/groups/1/integrants/1'))
        assert.deepEqual([paid.status, paid.message], [409, 'Integrant with id 1 has expenses and cannot be deleted.'])

        const ben = await addIntegrant(2, 'Nuevo')
        await client.delete(`/groups/2/integrants/${ben.id}`)
        assert.equal((await client.get('/groups/2')).integrantCount, 4)
    })

    it('answers 404 for an unknown integrant and 404 before 409 for a missing group', async () => {
        assert.equal((await failure(addExpense(1, 12345, 10))).message, 'Integrant with id 12345 not found.')
        assert.equal((await failure(client.get('/groups/77/balances'))).message, 'Group with id 77 not found.')
    })

    it('answers 500 for ids that are not numbers, like the backend does', async () => {
        const error = await failure(client.get('/groups/abc'))

        assert.deepEqual([error.status, error.error, error.message], [500, 'Internal Server Error', 'An unexpected error occurred. Please try again later.'])
        assert.equal((await client.get('/groups/001')).id, 1)   // leading zeros are fine for a Long
    })

    it('answers 500 for an amount that overflows NUMERIC(12,2), and accepts the largest one', async () => {
        assert.equal((await failure(addExpense(1, 1, '10000000000'))).status, 500)
        assert.equal((await addExpense(1, 1, '9999999999.99')).amount, 9999999999.99)
    })

    it('answers 501 for a route with no handler', async () => {
        const warnings = []
        const original = console.warn
        console.warn = (...args) => warnings.push(args.join(' '))
        try {
            const error = await failure(client.get('/groups'))
            assert.deepEqual([error.status, error.message], [501, 'Demo mode has no mock for GET /groups'])
        } finally {
            console.warn = original
        }
        assert.equal(warnings.length, 1)
    })
})
