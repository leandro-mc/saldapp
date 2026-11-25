import { useEffect, useId, useRef } from 'react'
import Button from './Button'

/**
 * Modal window on the native <dialog>: the browser traps focus inside, makes the rest of the page
 * inert, closes on Escape and returns focus to the trigger. `isOpen` stays the source of truth:
 * Escape and clicks on the backdrop only ask to close through `onClose`.
 *
 * The content is mounted only while open, so every opening starts from a clean form.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string} props.title
 * @param {() => void} props.onClose
 */
function Modal({ isOpen, title, onClose, children }) {
    const dialogRef = useRef(null)
    const titleId = useId()

    useEffect(() => {
        const dialog = dialogRef.current
        if (isOpen && !dialog.open) {
            dialog.showModal()
            // Land on what the user is about to use: an explicitly marked element, else the first field
            dialog.querySelector('[data-autofocus], input, select, textarea')?.focus()
        } else if (!isOpen && dialog.open) {
            dialog.close()
        }
    }, [isOpen])

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={event => {
                event.preventDefault()
                onClose()
            }}
            // A click on the backdrop lands on the dialog element itself; clicks inside land on its content
            onClick={event => event.target === dialogRef.current && onClose()}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg p-0 shadow-xl backdrop:bg-black/50"
        >
            {isOpen && (
                <div className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <h2 id={titleId} className="text-lg font-bold text-gray-900">{title}</h2>
                        <Button variant="quiet" size="sm" aria-label="Cerrar ventana" onClick={onClose} className="-mr-2 -mt-1 text-xl">
                            ×
                        </Button>
                    </div>
                    {children}
                </div>
            )}
        </dialog>
    )
}

export default Modal
