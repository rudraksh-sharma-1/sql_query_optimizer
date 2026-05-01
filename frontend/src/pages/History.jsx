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

    const planPreview = entry.query_plan
        ?.split('\n')
        .slice(0, 2)
        .join('\n')

    return (
        <>
            <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 flex flex-col gap-3 transition-colors shadow-sm">

                {/* top row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">

                        {/* date */}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-400">
                                {formatDate(entry.created_at)}
                            </span>
                        </div>

                        {/* plan preview */}
                        <p className="text-xs text-gray-600 font-mono truncate max-w-xs">
                            {planPreview}
                        </p>

                    </div>

                    {/* issue badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-lg border shrink-0 font-medium
                        ${isSuccess
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : rootCauses > 0
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}
                    >
                        {isSuccess ? 'No issues' : `${totalIssues} issue${totalIssues > 1 ? 's' : ''}`}
                    </span>
                </div>

                {/* issues summary */}
                {!isSuccess && (
                    <div className="flex gap-2 flex-wrap">
                        {rootCauses > 0 && (
                            <span className="text-xs bg-red-50 border border-red-200 text-red-500 px-2 py-0.5 rounded-lg font-medium">
                                {rootCauses} root cause{rootCauses > 1 ? 's' : ''}
                            </span>
                        )}
                        {secondary > 0 && (
                            <span className="text-xs bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-lg font-medium">
                                {secondary} secondary
                            </span>
                        )}
                    </div>
                )}

                {/* action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button
                        onClick={() => navigate(`/history/${entry.id}`)}
                        className="flex-1 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
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
        const delta = 1

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
            <span className="text-xs text-gray-400">
                {total} {total === 1 ? 'entry' : 'entries'} total
            </span>
            <div className="flex items-center gap-1">

                {/* prev */}
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-lg hover:bg-gray-100"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* page numbers */}
                {getPages().map((p, i) => (
                    p === '...'
                        ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                        : <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                ${p === page
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            {p}
                        </button>
                ))}

                {/* next */}
                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-lg hover:bg-gray-100"
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">

                {/* header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">History</h1>
                    <p className="text-sm text-gray-500">
                        Your past query plan analyses
                    </p>
                </div>

                {/* loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                )}

                {/* error */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* empty state */}
                {!loading && !error && history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No analyses yet</p>
                        <p className="text-gray-400 text-xs">
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