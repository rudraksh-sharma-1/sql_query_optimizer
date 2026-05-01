import { useState } from 'react'
import FeedbackBar from './FeedbackBar.jsx'

const SuggestionCard = ({ item, type }) => {
    const styles = {
        rootCause: {
            card: 'bg-red-50 border-red-200',
            label: 'text-red-500',
            labelText: 'Root Cause',
            icon: (
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            )
        },
        secondary: {
            card: 'bg-amber-50 border-amber-200',
            label: 'text-amber-500',
            labelText: 'Secondary Issue',
            icon: (
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            )
        }
    }

    const s = styles[type]

    return (
        <div className={`border ${s.card} rounded-xl px-4 py-3.5 flex flex-col gap-2`}>
            {/* type label */}
            <div className={`flex items-center gap-1.5 ${s.label}`}>
                {s.icon}
                <span className="text-xs font-semibold">{s.labelText}</span>
            </div>

            {/* issue title */}
            <span className="text-sm font-bold text-gray-900">
                {item.issue}
            </span>

            {/* explanation + suggestion */}
            <div className="flex flex-col gap-1">
                {item.explanation && (
                    <p className="text-xs text-gray-500 leading-relaxed">{item.explanation}</p>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">{item.suggestion}</p>
            </div>
        </div>
    )
}

const SuggestionPanel = ({ suggestions, historyId }) => {
    const [collapsed, setCollapsed] = useState(false)

    if (!suggestions) return null

    // success case
    if (suggestions.success) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">{suggestions.message}</p>
                </div>
                {historyId && <FeedbackBar historyId={historyId} />}
            </div>
        )
    }

    const rootCauses = suggestions.rootCause || []
    const secondary = suggestions.secondary || []
    const totalIssues = rootCauses.length + secondary.length

    // flatten all cards into one ordered array: root causes first, then secondary
    const allCards = [
        ...rootCauses.map(item => ({ item, type: 'rootCause' })),
        ...secondary.map(item => ({ item, type: 'secondary' })),
    ]

    return (
        <div className="flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Suggestions
                    </h3>
                    <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2.5 py-0.5 rounded-lg font-medium">
                        {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
                    </span>
                </div>
                <button
                    onClick={() => setCollapsed(prev => !prev)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer font-medium"
                >
                    {collapsed ? 'Expand' : 'Collapse'}
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {!collapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allCards.map(({ item, type }, i) => (
                        <SuggestionCard key={i} item={item} type={type} />
                    ))}

                    {/* feedback card — occupies one grid cell */}
                    {historyId && (
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm">
                            <FeedbackBar historyId={historyId} />
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

export default SuggestionPanel