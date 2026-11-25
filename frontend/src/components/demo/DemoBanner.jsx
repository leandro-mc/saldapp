import { useState } from 'react'
import { resetDemoData } from '../../demo/data/store.js'
import ConfirmDialog from '../shared/ConfirmDialog'

const REPOSITORY_URL = 'https://github.com/leandro-mc/saldapp'

/**
 * Notice shown on every page of the demo, with the way back to the original data.
 * It is sticky, so on a phone it stays short: the explanation is one line and the actions open on demand.
 */
function DemoBanner() {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)   // actions on small screens; always visible from md up

    function handleReset() {
        resetDemoData()
        // A full load from the home page: hooks keep data in memory and the group on screen may no longer exist
        window.location.assign('/')
    }

    return (
        <div role="status" className="sticky top-0 z-40 border-b border-amber-300 bg-amber-100 text-amber-950">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm md:px-8">
                <p className="min-w-0 flex-1 basis-56">
                    <strong>Modo demo:</strong> estás viendo datos ficticios
                    <span className="hidden md:inline"> porque este despliegue no tiene un backend conectado (proyecto de portafolio, sin costos de hosting)</span>.
                    {' '}Tus cambios se guardan solo en tu navegador.
                </p>

                <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls="demo-banner-actions"
                    onClick={() => setIsExpanded(expanded => !expanded)}
                    className="min-h-11 rounded-md px-3 font-medium underline md:hidden"
                >
                    {isExpanded ? 'Menos' : 'Más'}
                </button>

                <div id="demo-banner-actions" className={`${isExpanded ? 'flex' : 'hidden'} w-full flex-wrap items-center gap-x-4 gap-y-1 md:flex md:w-auto`}>
                    <a
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded font-medium underline hover:text-amber-800 md:min-h-9"
                    >
                        Ver el código en GitHub
                    </a>
                    <button
                        type="button"
                        onClick={() => setIsConfirming(true)}
                        className="min-h-11 whitespace-nowrap rounded-md border border-amber-800 bg-white px-3 font-medium
                                    text-amber-950 transition-colors hover:bg-amber-50 md:min-h-9"
                    >
                        Restablecer datos de demo
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={isConfirming}
                title="Restablecer datos de demo"
                message="Se perderán tus cambios y volverás a los grupos de ejemplo."
                confirmLabel="Restablecer"
                onConfirm={handleReset}
                onCancel={() => setIsConfirming(false)}
            />
        </div>
    )
}

export default DemoBanner
