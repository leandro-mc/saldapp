import { lazy, Suspense } from 'react'
import { loadDemo } from '../../config/env'

/**
 * Renders a component of the demo bundle, or nothing when the demo is off. This is how the rest of
 * the app mounts demo UI without importing it: the code is fetched on demand through `loadDemo`.
 *
 * @param {'DemoBanner' | 'DemoSampleGroups'} name  Export of src/demo/index.js
 */
function demoComponent(name) {
    if (!loadDemo) return () => null

    const Component = lazy(async () => ({ default: (await loadDemo())[name] }))
    return function DemoComponent() {
        return (
            <Suspense fallback={null}>
                <Component />
            </Suspense>
        )
    }
}

export const DemoBanner = demoComponent('DemoBanner')
export const DemoSampleGroups = demoComponent('DemoSampleGroups')
