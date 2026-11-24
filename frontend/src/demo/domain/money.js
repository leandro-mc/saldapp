/**
 * Money helpers for the demo backend.
 *
 * The real backend uses BigDecimal. Here every amount is an integer number of cents
 * (so sums and comparisons are exact) and the only rounding is the one the backend
 * applies: HALF_UP, at 2 decimals.
 */

/** Largest value the `expenses.amount` column (NUMERIC(12,2)) can hold, in cents. */
const MAX_STORED_CENTS = 999_999_999_999n

// Accepts what Jackson accepts for a BigDecimal: optional sign, digits with an optional
// fraction, optional exponent ("12", "12.5", ".5", "1e3").
const DECIMAL = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/

// Keeps absurd exponents ("1e999999999") from building gigantic BigInts.
const MAX_EXPONENT = 1000

/**
 * @typedef {Object} ParsedAmount
 * @property {bigint} cents            Value rounded HALF_UP to 2 decimals, as stored by the backend.
 * @property {boolean} atLeastOneCent  Whether the exact value is >= 0.01 (`@DecimalMin("0.01")` runs on the exact value).
 */

/**
 * Parses an amount from a request body (the UI sends it as a string, other clients may send a number).
 *
 * @param {unknown} input
 * @returns {ParsedAmount | null} null when it is not a decimal number at all (the backend answers 400 "Invalid request body")
 */
export function parseAmount(input) {
    const text = typeof input === 'number' ? String(input) : input
    if (typeof text !== 'string') return null

    const match = DECIMAL.exec(text.trim())
    if (!match) return null

    const [, sign, integerPart = '', fractionPart = '', exponentText = '0'] = match
    if (integerPart === '' && fractionPart === '') return null

    const exponent = Number(exponentText)
    if (Math.abs(exponent) > MAX_EXPONENT) return null

    // value = digits * 10^(exponent - fractionPart.length), so in cents it is that times 10^2
    const digits = BigInt(integerPart + fractionPart)
    const shift = exponent - fractionPart.length + 2
    const numerator = shift >= 0 ? digits * 10n ** BigInt(shift) : digits
    const denominator = shift >= 0 ? 1n : 10n ** BigInt(-shift)

    let cents = numerator / denominator
    if (2n * (numerator % denominator) >= denominator) cents += 1n

    const isNegative = sign === '-'
    return {
        cents: isNegative ? -cents : cents,
        atLeastOneCent: !isNegative && numerator >= denominator,
    }
}

/**
 * Whether an amount fits the database column. The backend answers 500 when it does not.
 *
 * @param {bigint} cents
 * @returns {boolean}
 */
export function fitsAmountColumn(cents) {
    return cents <= MAX_STORED_CENTS
}

/**
 * Integer division rounded HALF_UP, like `BigDecimal.divide(x, 2, RoundingMode.HALF_UP)` on a cents value.
 * Only valid for a non-negative dividend and a positive divisor, which is all the balance calculation needs.
 *
 * @param {number} dividend  Cents
 * @param {number} divisor
 * @returns {number} Cents
 */
export function divideHalfUp(dividend, divisor) {
    const remainder = dividend % divisor
    const quotient = (dividend - remainder) / divisor
    return 2 * remainder >= divisor ? quotient + 1 : quotient
}

/**
 * Converts cents to the number the API serializes (a BigDecimal with 2 decimals reads back as this double).
 *
 * @param {number} cents
 * @returns {number}
 */
export function centsToAmount(cents) {
    return cents / 100
}
