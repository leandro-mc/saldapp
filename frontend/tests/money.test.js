import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { centsToAmount, divideHalfUp, fitsAmountColumn, parseAmount } from '../src/demo/domain/money.js'

describe('parseAmount', () => {
    it('reads what the UI sends (a numeric string) and plain numbers', () => {
        assert.deepEqual(parseAmount('1150.5'), { cents: 115050n, atLeastOneCent: true })
        assert.deepEqual(parseAmount(87.9), { cents: 8790n, atLeastOneCent: true })
        assert.deepEqual(parseAmount('1890'), { cents: 189000n, atLeastOneCent: true })
    })

    it('rounds HALF_UP to the cent, without floating point surprises', () => {
        assert.equal(parseAmount('10.005').cents, 1001n)   // 10.005 as a float is 10.00499999...
        assert.equal(parseAmount('0.014').cents, 1n)
        assert.equal(parseAmount('2.675').cents, 268n)
    })

    it('applies the 0.01 minimum to the exact value, not to the rounded one', () => {
        assert.equal(parseAmount('0.01').atLeastOneCent, true)
        assert.equal(parseAmount('0.0149').atLeastOneCent, true)
        assert.equal(parseAmount('0.009').atLeastOneCent, false)   // would round up to 0.01, but is invalid
        assert.equal(parseAmount('0').atLeastOneCent, false)
        assert.equal(parseAmount('-5').atLeastOneCent, false)
    })

    it('accepts the other forms Jackson reads as BigDecimal', () => {
        assert.equal(parseAmount('.5').cents, 50n)
        assert.equal(parseAmount('5.').cents, 500n)
        assert.equal(parseAmount('1e3').cents, 100000n)
        assert.equal(parseAmount('+7').cents, 700n)
        assert.equal(parseAmount(' 12 ').cents, 1200n)
    })

    it('rejects anything that is not a decimal number', () => {
        for (const input of ['', ' ', 'abc', '1,5', '--1', '1e', '.', null, undefined, {}, true]) {
            assert.equal(parseAmount(input), null, `input: ${JSON.stringify(input)}`)
        }
        assert.equal(parseAmount('1e999999999'), null)
    })
})

describe('fitsAmountColumn', () => {
    it('allows up to NUMERIC(12,2) and no more', () => {
        assert.equal(fitsAmountColumn(parseAmount('9999999999.99').cents), true)
        assert.equal(fitsAmountColumn(parseAmount('10000000000').cents), false)
    })
})

describe('divideHalfUp', () => {
    it('rounds halves up and everything else to the nearest', () => {
        assert.equal(divideHalfUp(1001, 2), 501)   // 500.5
        assert.equal(divideHalfUp(10000, 3), 3333) // 3333.33
        assert.equal(divideHalfUp(20000, 3), 6667) // 6666.66
        assert.equal(divideHalfUp(0, 4), 0)
    })

    it('stays exact for large amounts', () => {
        const nearLimit = 999_999_999_999 * 40
        assert.equal(divideHalfUp(nearLimit, 40), 999_999_999_999)
    })
})

describe('centsToAmount', () => {
    it('gives the double the API would serialize', () => {
        assert.equal(centsToAmount(115050), 1150.5)
        assert.equal(centsToAmount(1), 0.01)
        assert.equal(centsToAmount(0), 0)
    })
})
