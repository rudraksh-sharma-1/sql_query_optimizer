import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHistory from '../hooks/useHistory'

// format date nicely
const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// single history card
const HistoryCard = ({ entry, onDelete }) => {
    const navigate = useNavigate()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const rootCauses = entry.suggestions?.rootCause?.length || 0
    const secondary = entry.suggestions?.secondary?.length || 0
    const totalIssues = rootCauses + secondary
    const isSuccess = entry.suggestions?.success === true

    // show first 3 lines of query plan as preview
    const planPreview = entry.query_plan
        ?.split('\n')
        .slice(0, 2)
        .join('\n')

    return (
        <>
            <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 transition-colors">

                {/* top row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">

                        {/* date */}
                        <span className="text-xs text-gray-500">
                            {formatDate(entry.created_at)}
                        </span>

                        {/* plan preview */}
                        <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                            {planPreview}
                        </p>

                    </div>

                    {/* issue badge */}
                    <span className={`text-xs px-2 py-1 rounded-lg border shrink-0 font-medium
                        ${isSuccess
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : rootCauses > 0
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        }`}
                    >
                        {isSuccess ? 'No issues' : `${totalIssues} issue${totalIssues > 1 ? 's' : ''}`}
                    </span>
                </div>

                {/* issues summary */}
                {!isSuccess && (
                    <div className="flex gap-2 flex-wrap">
                        {rootCauses > 0 && (
                            <span className="text-xs bg-red-500/5 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg">
                                {rootCauses} root cause{rootCauses > 1 ? 's' : ''}
                            </span>
                        )}
                        {secondary > 0 && (
                            <span className="text-xs bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-lg">
                                {secondary} secondary
                            </span>
                        )}
                    </div>
                )}

                {/* action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                    <button
                        onClick={() => navigate(`/history/${entry.id}`)}
                        className="flex-1 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                    >
                        View Details
                    </button>
                </div>

            </div>
        </>
    )
}

// pagination controls
const Pagination = ({ pagination, page, goToPage }) => {
    if (!pagination || pagination.totalPages <= 1) return null

    const { totalPages, total } = pagination

    const getPages = () => {
        const pages = []
        const delta = 1 // pages around current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - delta && i <= page + delta)
            ) {
                pages.push(i)
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...')
            }
        }
        return pages
    }

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
                {total} {total === 1 ? 'entry' : 'entries'} total
            </span>
            <div className="flex items-center gap-1">

                {/* prev */}
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-lg hover:bg-gray-800"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* page numbers */}
                {getPages().map((p, i) => (
                    p === '...'
                        ? <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">...</span>
                        : <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                ${p === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {p}
                        </button>
                ))}

                {/* next */}
                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-lg hover:bg-gray-800"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

            </div>
        </div>
    )
}

// main history page
const History = () => {
    const { history, loading, error, pagination, page, goToPage, deleteEntry } = useHistory()

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">

                {/* header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-white">History</h1>
                    <p className="text-sm text-gray-500">
                        Your past query plan analyses
                    </p>
                </div>

                {/* loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-6 h-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                )}

                {/* error */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                {/* empty state */}
                {!loading && !error && history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No analyses yet</p>
                        <p className="text-gray-700 text-xs">
                            Go to the home page and analyze your first query plan
                        </p>
                    </div>
                )}

                {/* history list */}
                {!loading && history.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {history.map(entry => (
                            <HistoryCard
                                key={entry.id}
                                entry={entry}
                                onDelete={deleteEntry}
                            />
                        ))}
                    </div>
                )}

                {/* pagination */}
                {!loading && (
                    <Pagination pagination={pagination} page={page} goToPage={goToPage} />
                )}

            </div>
        </div>
    )
}

export default History