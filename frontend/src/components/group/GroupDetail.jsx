import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/dateUtils'
import Button from '../shared/Button'
import ConfirmDialog from '../shared/ConfirmDialog'
import Modal from '../shared/Modal'
import GroupForm from './GroupForm'
import StatusBadge from './StatusBadge'

/**
 * Title block of the group page: where you are, its state, and the actions on the group itself.
 *
 * @param {Object} props
 * @param {(data: Object) => Promise<Object | undefined>} props.onUpdate  Resolves to the updated group
 * @param {() => Promise<boolean>} props.onClose  Resolves to true when the group was closed
 */
function GroupDetail({ group, isClosed, onUpdate, onClose, loading, error }) {
    const [dialog, setDialog] = useState(null)   // 'edit' | 'close' | null
    const [closeAttempted, setCloseAttempted] = useState(false)   // so an old failed edit isn't shown in the close dialog

    async function handleUpdate(data) {
        const updated = await onUpdate(data)
        if (updated) closeDialog()
    }

    function closeDialog() {
        setDialog(null)
        setCloseAttempted(false)
    }

    async function handleConfirmClose() {
        setCloseAttempted(true)
        if (await onClose()) closeDialog()
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <Link to="/" className="rounded text-sm font-medium text-blue-700 hover:underline">← Inicio</Link>

            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="break-words text-2xl font-extrabold text-gray-900 md:text-3xl">{group.name}</h1>
                        <StatusBadge isClosed={isClosed} />
                    </div>
                    {group.description && <p className="mt-1 text-gray-700">{group.description}</p>}
                    <p className="mt-2 text-sm text-gray-600">
                        ID del grupo: {group.id} · Inicio: {formatDate(group.startDate)}
                        {isClosed && ` · Cierre: ${formatDate(group.endDate)}`}
                    </p>
                </div>

                {!isClosed && (
                    <div className="flex gap-2">
                        <Button onClick={() => setDialog('edit')}>Editar grupo</Button>
                        <Button variant="danger" onClick={() => setDialog('close')}>Cerrar grupo</Button>
                    </div>
                )}
            </div>

            {isClosed && (
                <p className="mt-4 rounded-md bg-gray-100 p-3 text-sm text-gray-800">
                    Este grupo está cerrado: podés consultar todo, pero ya no se puede modificar.
                </p>
            )}

            <Modal isOpen={dialog === 'edit'} title="Editar grupo" onClose={closeDialog}>
                <GroupForm
                    isEditing
                    initialData={group}
                    loading={loading}
                    error={error}
                    onSubmit={handleUpdate}
                    onCancel={closeDialog}
                />
            </Modal>

            <ConfirmDialog
                isOpen={dialog === 'close'}
                title="Cerrar grupo"
                message="¿Seguro que querés cerrar el grupo? Después no se podrán agregar ni editar gastos ni integrantes, y esta acción no se puede deshacer."
                confirmLabel="Cerrar grupo"
                error={closeAttempted ? error : null}
                onConfirm={handleConfirmClose}
                onCancel={closeDialog}
            />
        </div>
    )
}

export default GroupDetail
