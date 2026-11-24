import { hashMapOrder, stringHashCode } from '../domain/javaCollections.js'
import { toLocalDateTime } from '../domain/dates.js'

/**
 * An error response of the mocked API. The factories below carry the same status, `error`
 * label and message the backend's GlobalExceptionHandler produces for the equivalent case,
 * because the UI shows `message` and `errors` straight from the response.
 */
export class HttpError extends Error {
    /**
     * @param {number} status
     * @param {string} error     Short label ("Conflict", "Bad Request", ...)
     * @param {string} message
     * @param {Record<string, string>} [errors]  Field errors, only for validation failures
     */
    constructor(status, error, message, errors = {}) {
        super(message)
        this.name = 'HttpError'
        this.status = status
        this.error = error
        this.errors = errors
    }
}

/**
 * Builds the JSON body of the backend's ErrorResponse.
 *
 * @param {HttpError} httpError
 * @param {string} path  Request path
 */
export function toErrorBody(httpError, path) {
    return {
        timestamp: toLocalDateTime(new Date()),
        status: httpError.status,
        error: httpError.error,
        message: httpError.message,
        path,
        errors: httpError.errors,
    }
}

const conflict = message => new HttpError(409, 'Conflict', message)

export const notFound = (resource, id) => new HttpError(404, 'Resource Not Found', `${resource} with id ${id} not found.`)

export const groupClosed = groupId =>
    conflict(`Group with id ${groupId} is closed and cannot accept new transactions.`)

export const integrantNotInGroup = (integrantId, groupId) =>
    conflict(`Integrant with id ${integrantId} does not belong to group with id ${groupId}.`)

export const expenseNotInGroup = (expenseId, groupId) =>
    conflict(`Expense with id ${expenseId} does not belong to group with id ${groupId}.`)

export const integrantHasExpenses = integrantId =>
    conflict(`Integrant with id ${integrantId} has expenses and cannot be deleted.`)

/** Body that does not deserialize (malformed JSON, wrong field format). */
export const invalidBody = () => new HttpError(400, 'Bad Request', 'Invalid request body: check field formats')

/**
 * Bean Validation failure.
 *
 * The backend builds `errors` with a HashMap, so the fields reach the UI in HashMap order
 * (by String.hashCode), not in declaration order.
 *
 * @param {Map<string, string>} violations  Message per field, in the order they were found
 */
export function validationFailed(violations) {
    const errors = {}
    for (const field of hashMapOrder([...violations.keys()], stringHashCode)) {
        errors[field] = violations.get(field)
    }
    return new HttpError(400, 'Bad Request', 'Validation failed for one or more fields.', errors)
}

/** Anything the backend does not handle explicitly (unparseable path ids, database errors) ends up here. */
export const serverError = () =>
    new HttpError(500, 'Internal Server Error', 'An unexpected error occurred. Please try again later.')

/** The demo has no handler for this route: say so loudly instead of pretending. */
export const notImplemented = (method, path) =>
    new HttpError(501, 'Not Implemented', `Demo mode has no mock for ${method} ${path}`)
