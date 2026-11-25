import { useState, useEffect } from 'react'
import { getBalancesByGroup, getIntegrantBalance } from '../services/balanceService'

export function useBalance(groupId) {
    const [integrantsBalances, setIntegrantsBalances] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchBalancesIntegrantsByGroup() {
            setLoading(true)
            setError(null)
            try{
                const foundBalancesIntegrants = await getBalancesByGroup(groupId)
                setIntegrantsBalances(foundBalancesIntegrants)
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }                        
        }

        if (groupId) fetchBalancesIntegrantsByGroup()

    }, [groupId])

    // Background re-read: keeps the current list on screen instead of going back to a loading state
    async function refresh() {
        try{
            setIntegrantsBalances(await getBalancesByGroup(groupId))
        } catch (error) {
            setError(error)
        }
    }

    async function findIntegrantBalance(integrantId) {
        setLoading(true)
        setError(null)
        try{
            const foundIntegrantBalance = await getIntegrantBalance(groupId, integrantId)
            return foundIntegrantBalance
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }            
    }

    return { integrantsBalances, loading, error, refresh, findIntegrantBalance }

}

