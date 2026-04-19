import { supabaseWithToken } from '../db/supabaseClient.js'

// submit feedback for a suggestion
export const submitFeedback = async (req, res) => {
    const { history_id, suggestion_issue, is_helpful, comment } = req.body
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    // validate required fields
    if (!history_id || suggestion_issue === undefined || is_helpful === undefined) {
        return res.status(400).json({ error: 'history_id, suggestion_issue and is_helpful are required' })
    }

    /* console.log('Received history_id:', history_id)
    console.log('Type of history_id:', typeof history_id)
    console.log('User ID:', userId) */

    // check history entry belongs to user
    const { data: historyEntry, error: historyError } = await client
        .from('history')
        .select('id')
        .eq('id', history_id)
        .eq('user_id', userId)
        .Single()

    /* console.log('History Entry:', historyEntry)
    console.log('History Error:', historyError) */

    if (historyError || !historyEntry) {
        return res.status(404).json({ error: 'History entry not found' })
    }

    // check if feedback already exists for this suggestion
    const { data: existing } = await client
        .from('feedback')
        .select('id')
        .eq('history_id', history_id)
        .eq('suggestion_issue', suggestion_issue)
        .eq('user_id', userId)
        .single()

    if (existing) {
        return res.status(409).json({ error: 'Feedback already submitted for this suggestion' })
    }

    // insert feedback
    const { data, error } = await client
        .from('feedback')
        .insert({
            user_id: userId,
            history_id,
            suggestion_issue,
            is_helpful,
            comment: comment || null
        })
        .select()
        .single()

    if (error) {
        return res.status(500).json({ error: 'Failed to submit feedback' })
    }

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: data })
}

// get all feedback for a specific history entry
export const getFeedbackByHistory = async (req, res) => {
    const { history_id } = req.params
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    // verify history belongs to user
    const { data: historyEntry, error: historyError } = await client
        .from('history')
        .select('id')
        .eq('id', history_id)
        .eq('user_id', userId)
        .single()

    if (historyError || !historyEntry) {
        return res.status(404).json({ error: 'History entry not found' })
    }

    const { data, error } = await client
        .from('feedback')
        .select('*')
        .eq('history_id', history_id)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch feedback' })
    }

    res.json({ feedback: data })
}

// update existing feedback
/* export const updateFeedback = async (req, res) => {
    const { id } = req.params
    const { is_helpful, comment } = req.body
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    if (is_helpful === undefined) {
        return res.status(400).json({ error: 'is_helpful is required' })
    }

    const { data, error } = await client
        .from('feedback')
        .update({ is_helpful, comment: comment || null })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error || !data) {
        return res.status(404).json({ error: 'Feedback not found' })
    }

    res.json({ message: 'Feedback updated successfully', feedback: data })
} */

// delete feedback
export const deleteFeedback = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    const { error } = await client
        .from('feedback')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) {
        return res.status(500).json({ error: 'Failed to delete feedback' })
    }

    res.json({ message: 'Feedback deleted successfully' })
}