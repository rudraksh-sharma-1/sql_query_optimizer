import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchHistoryById } from '../api/historyApi'
import PlanTree from '../components/analyzer/PlanTree'
import SuggestionPanel from '../components/analyzer/SuggestionPanel'

const HistoryDetail = () => {
    const { id } = useParams()
    const { session } = useAuth()
    const navigate = useNavigate()

    const [entry, setEntry] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const token = session?.access_token
                const data = await fetchHistoryById(token, id)
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

    // loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <svg className="w-6 h-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            </div>
        )
    }

    // error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={() => navigate('/history')}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">

                {/* back button */}
                <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer w-fit"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to history
                </button>

                {/* header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-white">
                            Analysis Detail
                        </h1>
                        <p className="text-sm text-gray-500">
                            {formatDate(entry.created_at)}
                        </p>
                    </div>

                    {/* issue badge */}
                    <span className={`text-xs px-3 py-1.5 rounded-xl border font-medium shrink-0
                        ${isSuccess
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : totalIssues > 0 && entry.suggestions?.rootCause?.length > 0
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        }`}
                    >
                        {isSuccess ? 'No issues found' : `${totalIssues} issue${totalIssues > 1 ? 's' : ''} found`}
                    </span>
                </div>

                {/* original query plan */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white">
                            Original Query Plan
                        </h2>
                    </div>
                    <pre className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        {entry.query_plan}
                    </pre>
                </div>

                {/* plan tree */}
                {entry.tree && (
                    <PlanTree
                        tree={entry.tree}
                        totalExecutionTime={entry.tree?.executionTime}
                    />
                )}

                {/* suggestions */}
                {entry.suggestions && (
                    <SuggestionPanel suggestions={entry.suggestions} historyId={entry.id} />
                )}

            </div>
        </div>
    )
}

export default HistoryDetail