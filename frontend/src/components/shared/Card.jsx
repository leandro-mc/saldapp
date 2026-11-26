import { useId } from 'react'

/**
 * A titled section of a page. The title labels the section for screen readers and sets the heading level.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {'h1' | 'h2' | 'h3'} [props.headingLevel]
 * @param {import('react').ReactNode} [props.actions]  Shown at the right of the title
 */
function Card({ title, headingLevel: Heading = 'h2', actions, className = '', children }) {
    const titleId = useId()

    return (
        <section aria-labelledby={titleId} className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-5 ${className}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Heading id={titleId} className="text-lg font-bold text-gray-900">{title}</Heading>
                {actions}
            </div>
            {children}
        </section>
    )
}

export default Card
