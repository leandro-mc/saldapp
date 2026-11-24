import { expenseRoutes } from './api/expenses.js'
import { notImplemented, serverError } from './api/errors.js'
import { financialRoutes } from './api/financial.js'
import { groupRoutes } from './api/groups.js'
import { integrantRoutes } from './api/integrants.js'
import { parseLong } from './api/longs.js'
import { loadState, saveState } from './data/store.js'

/**
 * Route table: `METHOD pattern` -> handler. `:name` segments are path variables, all of them Long ids.
 * Each pattern is compiled once into a regular expression with one named group per variable.
 */
const routes = [...groupRoutes, ...integrantRoutes, ...expenseRoutes, ...financialRoutes].map(route => ({
    ...route,
    regex: new RegExp(`^${route.pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
}))

/** An unreadable body is treated as missing; the validators then answer 400 like the backend. */
function parseBody(data) {
    if (typeof data !== 'string' || data === '') return undefined
    try {
        return JSON.parse(data)
    } catch {
        return undefined
    }
}

/**
 * Answers a request from the in-browser state.
 *
 * @param {{ method: string, path: string, data?: unknown }} request  `data` is the serialized JSON body
 * @returns {{ status: number, data: unknown }}
 * @throws {import('./api/errors.js').HttpError} for every error response (404, 409, 400, 500, 501)
 */
export function handleRequest({ method, path, data }) {
    for (const route of routes) {
        const match = route.method === method ? route.regex.exec(path) : null
        if (!match) continue

        // Spring can't convert a path variable that is not a Long; the backend's catch-all handler answers 500
        const params = {}
        for (const [name, value] of Object.entries(match.groups ?? {})) {
            params[name] = parseLong(value)
            if (params[name] === null) throw serverError()
        }

        const state = loadState()
        const response = route.handler({ state, params, body: parseBody(data) })

        // Handlers validate before they change anything, so a failed request never reaches this line
        if (method !== 'GET') saveState(state)
        return response
    }

    console.warn(`[demo] No mock handler for ${method} ${path}. Add one in src/demo/api.`)
    throw notImplemented(method, path)
}
