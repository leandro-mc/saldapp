import { buttonClassName } from './buttonStyles'

/**
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'dangerSolid' | 'quiet'} [props.variant]
 * @param {'md' | 'sm'} [props.size]
 */
function Button({ variant = 'secondary', size = 'md', type = 'button', className = '', ...props }) {
    return <button type={type} className={`${buttonClassName(variant, size)} ${className}`} {...props} />
}

export default Button
