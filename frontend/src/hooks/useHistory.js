import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchHistory} from '../api/historyApi'

const useHistory = () => {
    const { session } = useAuth()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    const limit = 10

    const loadHistory = async (pageNum = 1) => {
        setLoading(true)
        setError(null)
        try {
            const token = session?.access_token
            const data = await fetchHistory(token, pageNum, limit)
            setHistory(data.history)
            setPagination(data.pagination)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

   /*  const deleteEntry = async (id) => {
        try {
            const token = session?.access_token
            await deleteHistoryEntry(token, id)
            // remove from local state instantly
            setHistory(prev => prev.filter(h => h.id !== id))
            setPagination(prev => ({
                ...prev,
                total: prev.total - 1,
                totalPages: Math.ceil((prev.total - 1) / limit)
            }))
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete entry')
        }
    } */

    const goToPage = (pageNum) => {
        setPage(pageNum)
        loadHistory(pageNum)
    }

    useEffect(() => {
        if (session) loadHistory(1)
    }, [session])

    return { history, loading, error, pagination, page, goToPage}
}

export default useHistory