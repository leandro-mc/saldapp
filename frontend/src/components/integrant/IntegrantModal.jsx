import { useState } from 'react'
import Modal from '../shared/Modal'
import IntegrantForm from './IntegrantForm'

/**
 * Window to add an integrant, or to edit one (`integrant`).
 * Adding keeps the window open and confirms each person added, so a whole group can be entered in
 * one go ("Listo" closes it); editing closes it as soon as it is saved.
 *
 * @param {Object} props
 * @param {{ name: string } | null} [props.integrant]  The one being edited; null to add
 * @param {(data: { name: string }) => Promise<{ name: string } | undefined>} props.onSubmit  Resolves to the saved integrant
 */
function IntegrantModal({ isOpen, integrant = null, onClose, onSubmit, loading, error }) {
    const [lastAdded, setLastAdded] = useState(null)
    const [attempted, setAttempted] = useState(false)   // hides an old failure when the window is opened again
    const isEditing = integrant !== null

    function close() {
        setLastAdded(null)
        setAttempted(false)
        onClose()
    }

    async function handleSubmit(data) {
        setAttempted(true)
        const saved = await onSubmit(data)
        if (!saved) return false

        setAttempted(false)
        if (isEditing) close()
        else setLastAdded(saved.name)
        return true
    }

    return (
        <Modal isOpen={isOpen} title={isEditing ? 'Editar integrante' : 'Agregar integrante'} onClose={close}>
            {/* Always present so the confirmation is announced when its text appears */}
            <div role="status">
                {lastAdded && (
                    <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-900">
                        «{lastAdded}» se agregó al grupo.
                    </p>
                )}
            </div>
            <IntegrantForm
                initialData={integrant ?? {}}
                onSubmit={handleSubmit}
                onCancel={close}
                cancelLabel={isEditing ? 'Cancelar' : 'Listo'}
                loading={loading}
                error={attempted ? error : null}
            />
        </Modal>
    )
}

export default IntegrantModal
