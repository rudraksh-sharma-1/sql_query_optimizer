import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchHistoryById } from '../api/historyApi'
import PlanTree from '../components/analyzer/PlanTree'
import SuggestionPanel from '../components/analyzer/SuggestionPanel'

// module-level cache keyed by entry id — survives tab switches
const cache = {}

const HistoryDetail = () => {
    const { id } = useParams()
    const { session } = useAuth()
    const navigate = useNavigate()

    const [entry, setEntry] = useState(cache[id] || null)
    const [loading, setLoading] = useState(!cache[id])
    const [error, setError] = useState(null)

    useEffect(() => {
        // already cached for this id — skip fetch
        if (cache[id]) return

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const token = session?.access_token
                const data = await fetchHistoryById(token, id)
                cache[id] = data.history
                setEntry(data.history)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load history entry')
            } finally {
                setLoading(false)
            }
        }

        if (session && id) load()
    }, [session, id])

    const formatDate = (iso) => {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                        onClick={() => navigate('/history')}
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        ← Back to history
                    </button>
                </div>
            </div>
        )
    }

    if (!entry) return null

    const totalIssues = (entry.suggestions?.rootCause?.length || 0) +
        (entry.suggestions?.secondary?.length || 0)
    const isSuccess = entry.suggestions?.success === true

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">

                <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer w-fit"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to history
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-gray-900">Analysis Detail</h1>
                        <p className="text-sm text-gray-400">{formatDate(entry.created_at)}</p>
                    </div>

                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium shrink-0
                        ${isSuccess
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : totalIssues > 0 && entry.suggestions?.rootCause?.length > 0
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}
                    >
                        {!isSuccess && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        )}
                        {isSuccess ? 'No issues found' : `${totalIssues} issue${totalIssues > 1 ? 's' : ''} found`}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                        </svg>
                        <h2 className="text-sm font-semibold text-gray-800">Original Query Plan</h2>
                    </div>
                    <pre className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap break-words shadow-sm leading-relaxed">
                        {entry.query_plan}
                    </pre>
                </div>

                {entry.tree && (
                    <PlanTree tree={entry.tree} totalExecutionTime={entry.tree?.executionTime} />
                )}

                {entry.suggestions && (
                    <SuggestionPanel suggestions={entry.suggestions} historyId={entry.id} />
                )}

            </div>
        </div>
    )
}

export default HistoryDetail