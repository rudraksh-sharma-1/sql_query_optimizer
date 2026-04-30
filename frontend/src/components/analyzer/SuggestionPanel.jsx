import { useState } from 'react'
import FeedbackBar from './FeedbackBar.jsx'

const SuggestionCard = ({ item, type }) => {
    const styles = {
        rootCause: {
            border: 'border-red-500/20',
            bg: 'bg-red-500/5',
            badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
            icon: (
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        secondary: {
            border: 'border-yellow-500/20',
            bg: 'bg-yellow-500/5',
            badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
            icon: (
                <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            )
        }
    }

    const s = styles[type]

    return (
        <div className={`border ${s.border} ${s.bg} rounded-xl px-4 py-3 flex flex-col gap-2`}>
            <div className="flex items-start gap-2">
                {s.icon}
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white">
                        {item.issue}
                    </span>
                    {item.explanation && (
                        <p className="text-xs text-gray-400">{item.explanation}</p>
                    )}
                    <p className="text-xs text-gray-400">{item.suggestion}</p>
                </div>
            </div>
        </div>
    )
}

const SuggestionPanel = ({ suggestions, historyId }) => {
    const [collapsed, setCollapsed] = useState(false)

    if (!suggestions) return null

    // handle success case
    if (suggestions.success) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-400 font-medium">{suggestions.message}</p>
                </div>
                {historyId && <FeedbackBar historyId={historyId} />}
            </div>
        )
    }

    const rootCauses = suggestions.rootCause || []
    const secondary = suggestions.secondary || []
    const totalIssues = rootCauses.length + secondary.length

    return (
        <div className="flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-white">
                        Suggestions
                    </h3>
                    <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-lg">
                        {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
                    </span>
                </div>
                <button
                    onClick={() => setCollapsed(prev => !prev)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                >
                    {collapsed ? 'Expand' : 'Collapse'}
                </button>
            </div>

            {!collapsed && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-4">

                    {/* root causes */}
                    {rootCauses.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                                Root Cause
                            </span>
                            {rootCauses.map((item, i) => (
                                <SuggestionCard key={i} item={item} type="rootCause" />
                            ))}
                        </div>
                    )}

                    {/* secondary */}
                    {secondary.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                                Secondary Issues
                            </span>
                            {secondary.map((item, i) => (
                                <SuggestionCard key={i} item={item} type="secondary" />
                            ))}
                        </div>
                    )}

                    {/* Feedback */}
                    {historyId && <FeedbackBar historyId={historyId} />}

                </div>
            )}

        </div>
    )
}

export default SuggestionPanel