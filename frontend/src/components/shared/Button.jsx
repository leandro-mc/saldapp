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
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'dangerSolid' | 'quiet'} [props.variant]
 * @param {'md' | 'sm'} [props.size]
 */
function Button({ variant = 'secondary', size = 'md', type = 'button', className = '', ...props }) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors
                        disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
            {...props}
        />
    )
}

export default Button
