import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useBalance } from '../hooks/useBalance'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useExpense } from '../hooks/useExpense'
import { useGroup } from '../hooks/useGroup'
import { useIntegrant } from '../hooks/useIntegrant'
import { useNotice } from '../hooks/useNotice'
import GroupDetail from '../components/group/GroupDetail'
import GroupStats from '../components/group/GroupStats'
import GroupToolbar from '../components/group/GroupToolbar'
import LoadingState from '../components/shared/LoadingState'
import ErrorMessage from '../components/shared/ErrorMessage'
import Card from '../components/shared/Card'
import Notice from '../components/shared/Notice'
import { buttonClassName } from '../components/shared/buttonStyles'
import IntegrantsSection from '../components/integrant/IntegrantsSection'
import ExpensesSection from '../components/expense/ExpensesSection'
import SettlementSection from '../components/settlement/SettlementSection'

function GroupPage() {
    const { id } = useParams()
    const { group, loading, actionLoading, error, actionError, update, close, refresh: refreshGroup } = useGroup(id)
    const { integrantsBalances, loading: balancesLoading, error: balancesError, refresh: refreshBalances } = useBalance(id)
    const integrantApi = useIntegrant(id)
    const expenseApi = useExpense(id)

    const [selectedIntegrantId, setSelectedIntegrantId] = useState(null)
    const [settlementVersion, setSettlementVersion] = useState(0)
    const [notice, setNotice] = useNotice()

    useDocumentTitle(group?.name)

    if (loading) return <LoadingState />
    if (error) return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Card title="No pudimos abrir el grupo">
                <ErrorMessage error={error} />
                <Link to="/" className={`${buttonClassName('primary')} mt-4`}>Volver al inicio</Link>
            </Card>
        </div>
    )
    if (!group) return null

    const isClosed = group.endDate !== null && group.endDate !== undefined
    // Looked up by id, so renaming the integrant on screen is reflected in the expenses title
    const selectedIntegrant = integrantApi.integrants.find(i => i.id === selectedIntegrantId)

    // Everything a change can alter is read again in the background: group totals, balances, payments
    async function handleMutation(message) {
        if (message) setNotice(message)
        await Promise.all([refreshGroup(), refreshBalances()])
        setSettlementVersion(version => version + 1)
    }

    async function handleUpdateGroup(data) {
        const updated = await update(data)
        if (updated) setNotice('Grupo actualizado.')
        return updated
    }

    async function handleCloseGroup() {
        const closed = await close()
        if (closed) handleMutation('El grupo se cerró: ya no se puede modificar.')
        return Boolean(closed)
    }

    async function handleAddIntegrant(data) {
        const added = await integrantApi.addIntegrant(data)
        if (added) handleMutation()
        return added
    }

    async function handleAddExpense(data) {
        const created = await expenseApi.addExpense(data)
        if (created) handleMutation()
        return created
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
            <GroupDetail
                group={group}
                isClosed={isClosed}
                loading={actionLoading}
                error={actionError}
                onUpdate={handleUpdateGroup}
                onClose={handleCloseGroup}
            />

            <GroupStats group={group} />

            <Notice message={notice} />

            {!isClosed && (
                <GroupToolbar
                    integrants={integrantApi.integrants}
                    groupCurrency={group.currency}
                    selectedIntegrantId={selectedIntegrantId}
                    expenseApi={expenseApi}
                    integrantApi={integrantApi}
                    onAddExpense={handleAddExpense}
                    onAddIntegrant={handleAddIntegrant}
                />
            )}

            <div className="grid items-start gap-6 lg:grid-cols-5">
                <div className="space-y-6 lg:col-span-3">
                    <IntegrantsSection
                        balances={integrantsBalances}
                        loading={balancesLoading}
                        error={balancesError}
                        groupCurrency={group.currency}
                        isClosed={isClosed}
                        selectedId={selectedIntegrantId}
                        integrantApi={integrantApi}
                        onSelect={setSelectedIntegrantId}
                        onMutation={handleMutation}
                    />
                    <ExpensesSection
                        groupCurrency={group.currency}
                        isClosed={isClosed}
                        integrants={integrantApi.integrants}
                        selectedIntegrant={selectedIntegrant}
                        expenseApi={expenseApi}
                        onClear={() => setSelectedIntegrantId(null)}
                        onMutation={handleMutation}
                    />
                </div>

                {/* Stays in view next to the lists while scrolling on wide screens */}
                <div className="lg:sticky lg:top-24 lg:col-span-2">
                    <SettlementSection
                        groupId={id}
                        isClosed={isClosed}
                        groupCurrency={group.currency}
                        version={settlementVersion}
                    />
                </div>
            </div>
        </div>
    )
}

export default GroupPage
