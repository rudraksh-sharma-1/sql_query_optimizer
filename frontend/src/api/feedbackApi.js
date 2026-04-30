import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const submitFeedback = async (token, { historyId, isHelpful, comment = null }) => {
    const response = await axios.post(
        `${API_URL}/feedback/addfeedback`,
        {
            history_id: historyId,
            suggestion_issue: 'overall',
            is_helpful: isHelpful,
            comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

export const fetchFeedbackByHistory = async (token, historyId) => {
    const response = await axios.get(
        `${API_URL}/feedback/getfeedback/${historyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

export const deleteFeedback = async (token, feedbackId) => {
    const response = await axios.delete(
        `${API_URL}/feedback/deletefeedback/${feedbackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}