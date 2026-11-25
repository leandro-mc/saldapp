import Button from './Button'
import ErrorMessage from './ErrorMessage'
import Modal from './Modal'

/**
 * Asks for confirmation before something that can't be undone. Focus starts on the safe option
 * ("Cancelar"), so an accidental Enter doesn't destroy anything.
 *
 * Without `onConfirm` it only informs (for something that can't be done) and offers "Entendido".
 * `error` keeps the dialog useful when the action fails: the reason is shown right there.
 */
function ConfirmDialog({ isOpen, title = 'Confirmar acción', message, confirmLabel = 'Confirmar', error, onConfirm, onCancel }) {
    return (
        <Modal isOpen={isOpen} title={title} onClose={onCancel}>
            <p className="text-gray-700">{message}</p>
            <ErrorMessage error={error} />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={onCancel} data-autofocus>{onConfirm ? 'Cancelar' : 'Entendido'}</Button>
                {onConfirm && <Button variant="dangerSolid" onClick={onConfirm}>{confirmLabel}</Button>}
            </div>
        </Modal>
    )
}

export default ConfirmDialog
