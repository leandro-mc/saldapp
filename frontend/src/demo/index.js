/**
 * Entry point of everything that only exists in demo mode. It is loaded through `loadDemo`
 * (src/config/env.js), the single gate, so a build with the demo off contains none of it.
 */
export { createMockAdapter } from './mockAdapter.js'
export { default as DemoBanner } from '../components/demo/DemoBanner.jsx'
export { default as DemoSampleGroups } from '../components/demo/DemoSampleGroups.jsx'
