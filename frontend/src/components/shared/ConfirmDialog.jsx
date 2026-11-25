import Button from './Button'
import Modal from './Modal'

/**
 * Asks for confirmation before something that can't be undone. Focus starts on "Cancelar",
 * the safe choice, so an accidental Enter doesn't destroy anything.
 */
function ConfirmDialog({ isOpen, title = 'Confirmar acción', message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
    return (
        <Modal isOpen={isOpen} title={title} onClose={onCancel}>
            <p className="text-gray-700">{message}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={onCancel} data-autofocus>Cancelar</Button>
                <Button variant="dangerSolid" onClick={onConfirm}>{confirmLabel}</Button>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
