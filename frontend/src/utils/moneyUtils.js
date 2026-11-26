const numberFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Amount in whole cents, so that "-0.001" is treated as the zero it displays as. */
const toCents = amount => Math.round((Number(amount) || 0) * 100)

/** "€1,234.50". A negative amount keeps its sign in front of the symbol: "-€0.03". */
export function formatMoney(amount, currency = '') {
  const cents = toCents(amount)
  return `${cents < 0 ? '-' : ''}${currency}${numberFormat.format(Math.abs(cents) / 100)}`
}

/** Like formatMoney, with an explicit "+" on positive amounts (balances). */
export function formatSignedMoney(amount, currency = '') {
  return `${toCents(amount) > 0 ? '+' : ''}${formatMoney(amount, currency)}`
}
