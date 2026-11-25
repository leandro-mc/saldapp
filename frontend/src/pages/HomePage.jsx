import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCreateGroup } from '../hooks/useCreateGroup'
import GroupForm from '../components/group/GroupForm'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import FormField from '../components/shared/FormField'
import { controlClassName } from '../components/shared/controlStyles'
import { DemoSampleGroups } from '../components/demo/lazyDemo.jsx'

function HomePage() {
    const navigate = useNavigate()
    const { create, loading, error } = useCreateGroup()
    const [groupId, setGroupId] = useState('')

    async function handleCreate(data) {
        const group = await create(data)
        if (group) navigate(`/groups/${group.id}`)        
    }

    function handleAccess(e) {
        e.preventDefault()
        if (groupId.trim()) navigate(`/groups/${groupId.trim()}`)
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-12">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Gastos en grupo, cuentas claras</h1>
                <p className="mt-2 text-gray-700">
                    Creá un grupo, cargá lo que pagó cada persona y SaldApp calcula quién le debe a quién.
                </p>
            </div>

            {/* Demo only: the quickest way in comes first, ahead of the forms */}
            <DemoSampleGroups />

            <div className="grid items-start gap-6 lg:grid-cols-5">
                <Card title="Crear un grupo nuevo" className="lg:col-span-3">
                    <GroupForm onSubmit={handleCreate} loading={loading} error={error} />
                </Card>

                <Card title="Entrar a un grupo existente" className="lg:col-span-2">
                    <form onSubmit={handleAccess} className="space-y-4">
                        <FormField label="ID del grupo" hint="Lo ves en la parte superior de la página del grupo.">
                            {props => (
                                <input
                                    {...props}
                                    value={groupId}
                                    onChange={e => setGroupId(e.target.value)}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="Ej: 1024"
                                    className={controlClassName}
                                />
                            )}
                        </FormField>
                        <Button type="submit" disabled={!groupId.trim()} className="w-full">Entrar</Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default HomePage
