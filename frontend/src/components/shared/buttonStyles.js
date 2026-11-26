const VARIANTS = {
    primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
    danger: 'border-red-300 bg-white text-red-700 hover:bg-red-50',
    dangerSolid: 'border-transparent bg-red-700 text-white hover:bg-red-800',
    quiet: 'border-transparent bg-transparent text-blue-700 hover:bg-blue-50',
}

// 44px tall on touch screens (WCAG 2.5.5 recommendation); `sm` is compact only where a mouse is expected.
const SIZES = {
    md: 'min-h-11 px-4',
    sm: 'min-h-11 px-3 md:min-h-9',
}

/**
 * Classes of a button. Exported apart from the component so that a link (a navigation, not an
 * action) can look like one.
 *
 * @param {'primary' | 'secondary' | 'danger' | 'dangerSolid' | 'quiet'} [variant]
 * @param {'md' | 'sm'} [size]
 */
export function buttonClassName(variant = 'secondary', size = 'md') {
    return `inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors
            disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}`
}
