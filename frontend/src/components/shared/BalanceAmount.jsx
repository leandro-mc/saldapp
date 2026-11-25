import { formatSignedMoney } from '../../utils/moneyUtils'

/**
 * What someone is owed or owes. The meaning is in the text ("Recibe" / "Debe") and the sign as
 * well as in the color, so it does not depend on telling green from red.
 */
function BalanceAmount({ amount, currency }) {
    const cents = Math.round((Number(amount) || 0) * 100)
    const { label, tone } =
        cents > 0 ? { label: 'Recibe', tone: 'text-green-800' }
        : cents < 0 ? { label: 'Debe', tone: 'text-red-800' }
        : { label: 'Al día', tone: 'text-gray-700' }

    return (
        <div className="text-right">
            <p className={`font-bold ${tone}`}>{formatSignedMoney(amount, currency)}</p>
            <p className="text-xs text-gray-600">{label}</p>
        </div>
    )
}

export default BalanceAmount
