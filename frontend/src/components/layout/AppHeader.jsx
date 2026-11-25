import { Link } from 'react-router-dom'

/** Always-available way back home, and the app's name on every page. */
function AppHeader() {
    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
                <Link to="/" className="rounded text-xl font-extrabold text-blue-700">SaldApp</Link>
                <p className="hidden text-sm text-gray-600 sm:block">División inteligente de gastos grupales</p>
            </div>
        </header>
    )
}

export default AppHeader
