import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatMoney, formatSignedMoney } from '../src/utils/moneyUtils.js'

// Digits and separators depend on the machine's locale; these tests only check what must not vary.
describe('formatMoney', () => {
    it('puts the sign of a negative amount in front of the currency symbol', () => {
        assert.ok(formatMoney(-0.03, '€').startsWith('-€'))
        assert.ok(formatMoney(-1234.5, '$').startsWith('-$'))
    })

    it('does not show a minus for amounts that display as zero', () => {
        assert.ok(!formatMoney(-0.001, '€').includes('-'))
        assert.ok(!formatMoney(-0, '€').includes('-'))
    })

    it('keeps two decimals and the symbol for positive amounts', () => {
        assert.match(formatMoney(5, '€'), /^€5[.,]00$/)
        assert.match(formatMoney('7.5', '$'), /^\$7[.,]50$/)
    })

    it('treats missing or invalid values as zero', () => {
        assert.match(formatMoney(undefined, '€'), /^€0[.,]00$/)
        assert.match(formatMoney('abc'), /^0[.,]00$/)
    })
})

describe('formatSignedMoney', () => {
    it('adds a plus only to positive amounts', () => {
        assert.ok(formatSignedMoney(10, '€').startsWith('+€'))
        assert.ok(formatSignedMoney(-10, '€').startsWith('-€'))
        assert.ok(!formatSignedMoney(0, '€').startsWith('+'))
        assert.ok(!formatSignedMoney(0.001, '€').startsWith('+'))
    })
})
