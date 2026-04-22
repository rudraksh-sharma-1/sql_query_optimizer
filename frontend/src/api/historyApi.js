import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const fetchHistory = async (token, page = 1, limit = 10) => {
    const response = await axios.get(
        `${API_URL}/queryRoute/history?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

export const fetchHistoryById = async (token, id) => {
    const response = await axios.get(
        `${API_URL}/queryRoute/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

/* export const deleteHistoryEntry = async (token, id) => {
    const response = await axios.delete(
        `${API_URL}/queryRoute/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
} */