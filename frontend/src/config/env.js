/**
 * Single source of runtime configuration.
 *
 * Vite bakes every VITE_* variable into the bundle at build time, so changing any
 * of them requires a rebuild/redeploy. This is the only module that reads
 * `import.meta.env`; the rest of the app imports what it needs from here.
 *
 * Each variable is read with a plain `import.meta.env.NAME` access (no destructuring)
 * so Vite can replace it with a literal and drop the demo code from non-demo builds.
 */

/** True when the app must run against the in-browser mock instead of a real backend. */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

/** Base URL of the real API. Unused while `isDemoMode` is true. */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// A production build with neither a backend nor the demo would silently send requests
// to the page's own origin (or to a stale localhost URL), so fail loudly instead.
if (!isDemoMode && import.meta.env.PROD && !apiBaseUrl) {
    throw new Error(
        'Missing VITE_API_BASE_URL: set it to the backend URL, or set VITE_DEMO_MODE=true ' +
        'to run the frontend with the in-browser mock. Rebuild after changing either variable.'
    )
}
