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
        if (groupId) navigate(`/groups/${groupId}`)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 md:px-8">
            <div className="text-center mb-10">
                {/* Title */}
                <h1 className="text-4xl font-extrabold text-blue-600">SaldApp</h1>
                <p className="text-gray-500 mt-2">División inteligente de gastos grupales</p>
            </div>

            {/* Two cards: side to side */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">

                {/* Card create group */}
                <Card title="Agregar grupo" className="w-full md:w-1/2">
                    <GroupForm onSubmit={handleCreate} loading={loading} error={error} />
                </Card>

                {/* Group access card  */}
                <Card title="Ingresar a grupo existente" className="w-full md:w-1/3">
                    <form onSubmit={handleAccess} className="space-y-4">
                        <FormField label="ID del grupo">
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
                        <Button type="submit" className="w-full">Ingresar</Button>
                    </form>
                </Card>
                
            </div>

            {/* Only renders in demo mode */}
            <DemoSampleGroups />
        </div>
    )
}

export default HomePage