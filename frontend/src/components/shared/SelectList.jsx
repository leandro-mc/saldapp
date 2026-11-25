import { controlClassName } from './controlStyles'

/** `...controlProps` are the id and aria-* props FormField hands to its control. */
function SelectList({ options, getLabel, getValue, value, onChange, placeholder, disabled, ...controlProps }){
    const handleChange = (e) => {
        const index = e.target.value
        if (index === '') return onChange(null)
        onChange(getValue(options[index]))
    }

    const selectedIndex = options.findIndex(
        opt => JSON.stringify(getValue(opt)) === JSON.stringify(value)
    )

    return (
        <select
            value={selectedIndex === -1 ? '' : selectedIndex}
            onChange={handleChange}
            disabled={disabled}
            className={controlClassName}
            {...controlProps}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt, i) => (
                <option key={i} value={i}>
                    {getLabel(opt)}
                </option>
            ))}
        </select>
    )
}

export default SelectList
