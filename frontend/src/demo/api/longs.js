const LONG_MIN = -(2n ** 63n)
const LONG_MAX = 2n ** 63n - 1n

/**
 * Reads a Java `Long` the way Spring converts it: optional sign and digits (so "007" is 7),
 * limited to 64 bits.
 *
 * Returns a number when it is safe to hold in one. Otherwise the BigInt is returned: it
 * never equals a stored id (ids are small), and it still prints exactly in "id ... not found" messages.
 *
 * @param {unknown} value
 * @returns {number | bigint | null} null when it is not a valid Long
 */
export function parseLong(value) {
    if (typeof value !== 'string' || !/^\s*[+-]?\d+\s*$/.test(value)) return null

    const long = BigInt(value.trim())
    if (long < LONG_MIN || long > LONG_MAX) return null

    return Number.isSafeInteger(Number(long)) ? Number(long) : long
}
