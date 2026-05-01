import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { analyzeQueryPlan } from '../api/analyzerApi'

// module-level cache — persists across tab switches
const cache = {
    result: null,
    error: null,
}

const useAnalyzer = () => {
    const { session } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(cache.error)
    const [result, setResult] = useState(cache.result)

    const analyze = async ({ queryPlan, sqlQuery, dbType }) => {
        setLoading(true)
        setError(null)
        setResult(null)
        cache.result = null
        cache.error = null

        try {
            const token = session?.access_token
            const data = await analyzeQueryPlan(token, { queryPlan, sqlQuery, dbType })

            cache.result = data
            setResult(data)
        } catch (err) {
            const msg = err.response?.data?.error || 'Something went wrong'
            cache.error = msg
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return { analyze, loading, error, result }
}

export default useAnalyzer