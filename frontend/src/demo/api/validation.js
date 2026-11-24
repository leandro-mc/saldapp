import { isLocalDateTime } from '../domain/dates.js'
import { parseAmount } from '../domain/money.js'
import { invalidBody, validationFailed } from './errors.js'
import { parseLong } from './longs.js'

/*
 * Request body validation, mirroring the backend in its two stages:
 *   1. "Reading" a field (Jackson): a value that cannot be converted to the field's type
 *      makes the whole request fail with 400 "Invalid request body".
 *   2. Constraints (Bean Validation): every violated constraint is reported at once in `errors`.
 * The messages are the ones declared in the backend's request DTOs.
 */

// ── stage 1: reading fields ──────────────────────────────────────────────────

/** Jackson turns an empty string into null for numbers and dates. */
const isMissing = value => value === undefined || value === null || value === ''

function requireObject(body) {
    if (body === null || typeof body !== 'object' || Array.isArray(body)) throw invalidBody()
    return body
}

/** String field. Numbers and booleans are coerced to text, like Jackson does. */
function readText(value) {
    if (value === undefined || value === null) return null
    if (typeof value === 'object') throw invalidBody()
    return String(value)
}

/** Long field (an integrant id). */
function readLong(value) {
    if (isMissing(value)) return null
    const long = typeof value === 'number' && Number.isInteger(value) ? value : parseLong(value)
    if (long === null) throw invalidBody()
    return long
}

/** "yyyy-MM-dd'T'HH:mm:ss" field. */
function readDateTime(value) {
    if (isMissing(value)) return null
    if (typeof value !== 'string' || !isLocalDateTime(value)) throw invalidBody()
    return value
}

/** BigDecimal field. */
function readAmount(value) {
    if (isMissing(value)) return null
    const amount = parseAmount(value)
    if (amount === null) throw invalidBody()
    return amount
}

// ── stage 2: constraints ─────────────────────────────────────────────────────

/** Collects violations per field. */
class Violations {
    #byField = new Map()

    /** Several violations on one field are joined with ", ", as the backend does. */
    add(field, message) {
        const previous = this.#byField.get(field)
        this.#byField.set(field, previous === undefined ? message : `${previous}, ${message}`)
    }

    /** @NotNull */
    notNull(field, value, message) {
        if (value === null) this.add(field, message)
    }

    /** @NotBlank: null or only characters up to U+0020 (what Java's String.trim() strips). */
    notBlank(field, value, message) {
        if (value === null || ![...value].some(character => character > ' ')) this.add(field, message)
    }

    /** @Size: null passes; length counts UTF-16 units like Java. */
    size(field, value, { min = 0, max }, message) {
        if (value !== null && (value.length < min || value.length > max)) this.add(field, message)
    }

    /** @DecimalMin("0.01") */
    atLeastOneCent(field, amount, message) {
        if (amount !== null && !amount.atLeastOneCent) this.add(field, message)
    }

    /** Throws the 400 response if anything was violated. */
    throwIfAny() {
        if (this.#byField.size > 0) throw validationFailed(this.#byField)
    }
}

// Constraints in the order the backend DTOs declare them. When one field violates two of them the
// backend's order is undefined (Hibernate Validator returns a Set); the one used here is stable.

const checkGroupName = (violations, name) => {
    violations.notBlank('name', name, 'Group name is required')
    violations.size('name', name, { min: 1, max: 200 }, 'Group name must be between 1 and 200 characters')
}
const checkGroupDescription = (violations, description) =>
    violations.size('description', description, { max: 500 }, 'Group description must be at most 500 characters')
const checkCurrency = (violations, currency) => {
    violations.notBlank('currency', currency, 'Currency is required')
    violations.size('currency', currency, { max: 5 }, 'Currency code must be at most 5 characters')
}
const checkExpense = (violations, { payedBy, description, amount }) => {
    violations.notNull('payedBy', payedBy, 'Payed by is required')
    violations.notBlank('description', description, 'Description is required')
    violations.size('description', description, { min: 4, max: 500 }, 'Description must be between 4 and 500 characters')
    violations.notNull('amount', amount, 'Amount is required')
    violations.atLeastOneCent('amount', amount, 'Amount must be greater than 0')
}

// ── request DTOs ─────────────────────────────────────────────────────────────

/**
 * @param {unknown} body  CreateGroupRequest
 * @returns {{ name: string, description: string | null, currency: string, startDate: string }}
 */
export function validateCreateGroup(body) {
    const json = requireObject(body)
    const name = readText(json.name)
    const description = readText(json.description)
    const currency = readText(json.currency)
    const startDate = readDateTime(json.startDate)

    const violations = new Violations()
    checkGroupName(violations, name)
    checkGroupDescription(violations, description)
    checkCurrency(violations, currency)
    violations.notNull('startDate', startDate, 'Start date is required')
    violations.throwIfAny()

    return { name, description, currency, startDate }
}

/**
 * @param {unknown} body  UpdateGroupRequest
 * @returns {{ name: string, description: string | null, currency: string }}
 */
export function validateUpdateGroup(body) {
    const json = requireObject(body)
    const name = readText(json.name)
    const description = readText(json.description)
    const currency = readText(json.currency)

    const violations = new Violations()
    checkGroupName(violations, name)
    checkGroupDescription(violations, description)
    checkCurrency(violations, currency)
    violations.throwIfAny()

    return { name, description, currency }
}

/**
 * @param {unknown} body  IntegrantRequest
 * @returns {{ name: string }}
 */
export function validateIntegrant(body) {
    const name = readText(requireObject(body).name)

    const violations = new Violations()
    violations.notBlank('name', name, 'Name is required')
    violations.size('name', name, { min: 1, max: 200 }, 'Integrant name must be between 1 and 200 characters')
    violations.throwIfAny()

    return { name }
}

/**
 * @param {unknown} body  CreateExpenseRequest
 * @returns {{ payedBy: number | bigint, description: string, amount: import('../domain/money.js').ParsedAmount, date: string }}
 */
export function validateCreateExpense(body) {
    const json = requireObject(body)
    const fields = {
        payedBy: readLong(json.payedBy),
        description: readText(json.description),
        amount: readAmount(json.amount),
    }
    const date = readDateTime(json.date)

    const violations = new Violations()
    checkExpense(violations, fields)
    violations.notNull('date', date, 'Date is required')
    violations.throwIfAny()

    return { ...fields, date }
}

/**
 * @param {unknown} body  UpdateExpenseRequest
 * @returns {{ payedBy: number | bigint, description: string, amount: import('../domain/money.js').ParsedAmount }}
 */
export function validateUpdateExpense(body) {
    const json = requireObject(body)
    const fields = {
        payedBy: readLong(json.payedBy),
        description: readText(json.description),
        amount: readAmount(json.amount),
    }

    const violations = new Violations()
    checkExpense(violations, fields)
    violations.throwIfAny()

    return fields
}
