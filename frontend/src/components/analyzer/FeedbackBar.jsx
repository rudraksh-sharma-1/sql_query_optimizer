import { useState, useEffect } from 'react'
import supabase from '../../utils/supabaseClient.js'
import { submitFeedback, fetchFeedbackByHistory, deleteFeedback } from '../../api/feedbackApi.js'

const FeedbackBar = ({ historyId }) => {
    const [existing, setExisting] = useState(null)   // existing feedback object
    const [loadingExisting, setLoadingExisting] = useState(true)

    const [vote, setVote] = useState(null)
    const [comment, setComment] = useState('')
    const [showComment, setShowComment] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(null)

    // fetch existing feedback on mount
    useEffect(() => {
        const load = async () => {
            setLoadingExisting(true)
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return
                const data = await fetchFeedbackByHistory(session.access_token, historyId)
                // find the 'overall' feedback entry if it exists
                const overall = data.feedback?.find(f => f.suggestion_issue === 'overall') || null
                setExisting(overall)
            } catch {
                // no feedback yet or error — either way start fresh
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
            setExisting(null)
        } catch {
            setError('Failed to delete. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    if (loadingExisting) {
        return (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                <svg className="w-3.5 h-3.5 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-xs text-gray-600">Loading feedback...</span>
            </div>
        )
    }

    // existing feedback — show what was submitted + delete option
    if (existing) {
        return (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {existing.is_helpful ? (
                            <div className="p-1.5 rounded-lg bg-green-500/20">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                            </div>
                        ) : (
                            <div className="p-1.5 rounded-lg bg-red-500/20">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">
                                You rated this {existing.is_helpful ? 'helpful' : 'not helpful'}
                            </span>
                            {existing.comment && (
                                <span className="text-xs text-gray-600 italic">"{existing.comment}"</span>
                            )}
                        </div>
                    </div>

                    {/* delete to re-submit */}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                    >
                        {deleting ? 'Removing...' : 'Remove & redo'}
                    </button>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
        )
    }

    // no feedback yet — show voting UI
    return (
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Were these suggestions helpful?</span>
                <div className="flex items-center gap-1">

                    {/* Thumbs Up */}
                    <button
                        onClick={() => handleVote('up')}
                        className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer
                            ${vote === 'up'
                                ? 'bg-green-500/20 text-green-400'
                                : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                        aria-label="Helpful"
                    >
                        <svg className="w-4 h-4" fill={vote === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    </button>

                    {/* Thumbs Down */}
                    <button
                        onClick={() => handleVote('down')}
                        className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer
                            ${vote === 'down'
                                ? 'bg-red-500/20 text-red-400'
                                : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800'
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

            {/* comment + submit */}
            {showComment && (
                <div className="flex flex-col gap-2">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Any additional comments? (optional)"
                        rows={2}
                        className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                            text-gray-300 placeholder-gray-600 resize-none
                            focus:outline-none focus:border-gray-500 transition-colors duration-150"
                    />
                    <div className="flex items-center justify-between">
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50
                                text-white px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
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