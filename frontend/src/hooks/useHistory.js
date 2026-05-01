import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchHistory } from '../api/historyApi'

// module-level cache — survives tab switches, cleared on logout
const cache = {
    history: null,
    pagination: null,
    page: 1,
}

const useHistory = () => {
    const { session } = useAuth()
    const [history, setHistory] = useState(cache.history || [])
    const [loading, setLoading] = useState(cache.history === null) // only show loading if no cache yet
    const [error, setError] = useState(null)
    const [page, setPage] = useState(cache.page || 1)
    const [pagination, setPagination] = useState(cache.pagination || null)

    const limit = 10

    const loadHistory = async (pageNum = 1, force = false) => {
        // skip fetch if we already have cached data for this page
        if (!force && cache.history !== null && cache.page === pageNum) return

        setLoading(true)
        setError(null)
        try {
            const token = session?.access_token
            const data = await fetchHistory(token, pageNum, limit)

            // update cache
            cache.history = data.history
            cache.pagination = data.pagination
            cache.page = pageNum

            setHistory(data.history)
            setPagination(data.pagination)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    const goToPage = (pageNum) => {
        setPage(pageNum)
        loadHistory(pageNum)
    }

    useEffect(() => {
        if (!session) {
            // clear cache on logout
            cache.history = null
            cache.pagination = null
            cache.page = 1
            return
        }
        loadHistory(cache.page)
    }, [session])

    return { history, loading, error, pagination, page, goToPage }
}

export default useHistory