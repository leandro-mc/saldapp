import { useEffect, useState } from "react"
import { useSettlement } from "../../hooks/useSettlement"
import Card from "../shared/Card"
import ErrorMessage from "../shared/ErrorMessage"
import LoadingState from "../shared/LoadingState"
import SettlementList from "./SettlementList"

/**
 * The payments that settle the group. Always visible: it is what people open the group to find out.
 * It is read again whenever `version` changes (the page bumps it after any change).
 */
function SettlementSection({ groupId, isClosed, groupCurrency, version }) {
    const { settlements, loading, error, loadSettlement } = useSettlement(groupId)
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        loadSettlement().then(() => setHasLoaded(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version])

    return (
        <Card title={isClosed ? 'Liquidación final' : 'Cómo saldar las cuentas'}>
            <p className="-mt-2 mb-3 text-sm text-gray-600">
                {isClosed
                    ? 'Los pagos con los que quedó saldado el grupo.'
                    : 'Pagos sugeridos para saldar las deudas con pocas transferencias.'}
            </p>

            {/* On a re-read the previous payments stay (dimmed) instead of being replaced by a loader */}
            <div aria-busy={loading} className={loading && hasLoaded ? 'opacity-60' : ''}>
                {error ? <ErrorMessage error={error} />
                    : !hasLoaded ? <LoadingState />
                    : <SettlementList settlements={settlements} groupCurrency={groupCurrency} />}
            </div>
        </Card>
    )
}

export default SettlementSection
