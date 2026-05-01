import { useState, useEffect } from 'react'
import supabase from '../../utils/supabaseClient.js'
import { submitFeedback, fetchFeedbackByHistory, deleteFeedback } from '../../api/feedbackApi.js'

// module-level cache keyed by historyId — survives tab switches
const cache = {}

const FeedbackBar = ({ historyId }) => {
    const [existing, setExisting] = useState(cache[historyId] !== undefined ? cache[historyId] : undefined)
    const [loadingExisting, setLoadingExisting] = useState(cache[historyId] === undefined)

    const [vote, setVote] = useState(null)
    const [comment, setComment] = useState('')
    const [showComment, setShowComment] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // already cached for this historyId — skip fetch
        if (cache[historyId] !== undefined) return

        const load = async () => {
            setLoadingExisting(true)
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return
                const data = await fetchFeedbackByHistory(session.access_token, historyId)
                const overall = data.feedback?.find(f => f.suggestion_issue === 'overall') || null
                cache[historyId] = overall
                setExisting(overall)
            } catch {
                cache[historyId] = null
                setExisting(null)
            } finally {
                setLoadingExisting(false)
            }
        }

        if (historyId) load()
    }, [historyId])

    const handleVote = (direction) => {
        setVote(direction)
        setShowComment(true)
    }

    const handleSubmit = async () => {
        if (!vote || submitting) return
        setSubmitting(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const data = await submitFeedback(session.access_token, {
                historyId,
                isHelpful: vote === 'up',
                comment: comment.trim() || null
            })

            // update cache with new feedback
            cache[historyId] = data.feedback
            setExisting(data.feedback)
            setVote(null)
            setComment('')
            setShowComment(false)
        } catch (err) {
            setError('Failed to submit. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!existing || deleting) return
        setDeleting(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            await deleteFeedback(session.access_token, existing.id)

            // clear from cache
            cache[historyId] = null
            setExisting(null)
        } catch {
            setError('Failed to delete. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    if (loadingExisting) {
        return (
            <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-xs text-gray-400">Loading...</span>
            </div>
        )
    }

    // existing feedback
    if (existing) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {existing.is_helpful ? (
                            <div className="p-1.5 rounded-lg bg-green-100">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                            </div>
                        ) : (
                            <div className="p-1.5 rounded-lg bg-red-100">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                                Rated {existing.is_helpful ? 'helpful' : 'not helpful'}
                            </span>
                            {existing.comment && (
                                <span className="text-xs text-gray-400 italic">"{existing.comment}"</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                    >
                        {deleting ? 'Removing...' : 'Remove & redo'}
                    </button>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        )
    }

    // no feedback yet
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">Were these suggestions helpful?</span>
                <div className="flex items-center gap-2">

                    <button
                        onClick={() => handleVote('up')}
                        className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer
                            ${vote === 'up'
                                ? 'bg-green-100 border-green-300 text-green-600'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500'
                            }`}
                        aria-label="Helpful"
                    >
                        <svg className="w-4 h-4" fill={vote === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    </button>

                    <button
                        onClick={() => handleVote('down')}
                        className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer
                            ${vote === 'down'
                                ? 'bg-red-100 border-red-300 text-red-500'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                            }`}
                        aria-label="Not helpful"
                    >
                        <svg className="w-4 h-4" fill={vote === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                    </button>

                </div>
            </div>

            {showComment && (
                <div className="flex flex-col gap-2">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Any additional comments? (optional)"
                        rows={2}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                            text-gray-700 placeholder-gray-400 resize-none
                            focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                    />
                    <div className="flex items-center justify-between">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="ml-auto text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                                text-white px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer font-medium"
                        >
                            {submitting ? 'Submitting…' : 'Submit'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FeedbackBar