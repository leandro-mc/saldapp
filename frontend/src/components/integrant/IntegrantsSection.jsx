import { useState } from 'react'
import IntegrantForm from '../integrant/IntegrantForm'
import Card from '../shared/Card'
import IntegrantList from '../integrant/IntegrantList'
import LoadingState from '../shared/LoadingState'
import ErrorMessage from '../shared/ErrorMessage'
import { useBalance } from '../../hooks/useBalance'

function IntegrantsSection({ 
        groupId, groupCurrency, isClosed, integrants, integrantLoading, integrantError, 
        addIntegrant, updateIntegrant, removeIntegrant, onDetails, onMutation 
}) {
    const { integrantsBalances, loading, error, refresh } = useBalance(groupId)

    const [editingIntegrant, setEditingIntegrant] = useState(null)

    async function handleMutation() {
        await refresh()
        onMutation?.()
    }

    if (loading) return <LoadingState />
    if (error) return <ErrorMessage error={error} />
    
    if (editingIntegrant) return (
        <Card title="Editar integrante" className="flex-1 w-full">
            <IntegrantForm 
                key={editingIntegrant.id}
                initialData={editingIntegrant}
                loading={integrantLoading}
                error={integrantError}
                onCancel={() => setEditingIntegrant(null)}
                onSubmit={async (data) => {
                    const updated = await updateIntegrant(editingIntegrant.id, data)
                    if (updated) {
                        setEditingIntegrant(null)
                        handleMutation()
                    }
                    return updated
                }}
            />
        </Card>
    )

    return (
        <div className="flex-1 w-full bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            {!isClosed &&(
                <div className="mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-3">Agregar integrante</h3>
                    <IntegrantForm
                        loading={integrantLoading}
                        error={integrantError}
                        onSubmit={async (data) => {
                            const added = await addIntegrant(data)
                            if (added) handleMutation()
                            return added
                        }}
                    />
                </div>
            )}
            <IntegrantList 
                groupCurrency={groupCurrency}
                integrantsBalances={integrantsBalances}
                onEdit={ (integrantId) => {
                    const integrant = integrants.find(i => i.id === integrantId)
                    setEditingIntegrant(integrant)
                    }
                }
                onDelete={async (integrantId) => {
                    const check = await removeIntegrant(integrantId)
                    if (check) handleMutation()
                }}
                onDetails={onDetails}
                disabled={isClosed}
            />
        </div>
    )
}

export default IntegrantsSection