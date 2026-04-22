import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { analyzeQueryPlan } from '../api/analyzerApi'

const useAnalyzer = () => {
    const { session } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)

    const analyze = async ({ queryPlan, sqlQuery, dbType }) => {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const token = session?.access_token
            const data = await analyzeQueryPlan(token, { queryPlan, sqlQuery, dbType })
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return { analyze, loading, error, result }
}

export default useAnalyzer