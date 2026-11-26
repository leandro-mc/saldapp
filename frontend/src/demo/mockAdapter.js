import { AxiosError } from 'axios'
import { HttpError, serverError, toErrorBody } from './api/errors.js'
import { handleRequest } from './router.js'

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

/**
 * Creates an axios adapter that answers every request from the in-browser mock instead of the network.
 * Being an adapter, it sits below axios' interceptors: responses and errors go through the same
 * `response.data` unwrapping and `parseApiError` as real ones, so nothing above it changes.
 *
 * @param {{ minDelayMs?: number, maxDelayMs?: number }} [options]  Artificial latency range, so loading states are visible
 * @returns {(config: import('axios').InternalAxiosRequestConfig) => Promise<import('axios').AxiosResponse>}
 */
export function createMockAdapter({ minDelayMs = 150, maxDelayMs = 400 } = {}) {
    return async function mockAdapter(config) {
        await wait(minDelayMs + Math.random() * (maxDelayMs - minDelayMs))

        const method = config.method.toUpperCase()
        const path = config.url.split('?')[0]

        let result
        try {
            result = handleRequest({ method, path, data: config.data })
        } catch (error) {
            const httpError = error instanceof HttpError ? error : unexpected(error)
            result = { status: httpError.status, data: toErrorBody(httpError, path) }
        }

        const response = { data: result.data, status: result.status, statusText: '', headers: {}, config, request: null }
        if (!config.validateStatus || config.validateStatus(result.status)) return response

        const code = result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST
        throw new AxiosError(`Request failed with status code ${result.status}`, code, config, null, response)
    }
}

/** A bug in the mock: log it for whoever is developing, and answer like the backend's catch-all handler. */
function unexpected(error) {
    console.error('[demo] Unexpected error in the mock API', error)
    return serverError()
}
