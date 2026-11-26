import axios from 'axios'
import { apiBaseUrl, loadDemo } from './env'
import { parseApiError } from '../utils/errorParser'

const httpClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
})

if (loadDemo) {
    // Answer from the in-browser mock instead of the network. The mock is loaded on the first
    // request and only exists in demo builds (see `loadDemo`).
    let mockAdapter
    httpClient.defaults.adapter = async config => {
        mockAdapter ??= (await loadDemo()).createMockAdapter()
        return mockAdapter(config)
    }
}

// Add a response interceptor to handle errors globally
httpClient.interceptors.response.use(
    response => response.data,                      // successful response, return the data directly
    error => Promise.reject(parseApiError(error))   // parse the error and reject with a standardized ApiError instance
)

export default httpClient