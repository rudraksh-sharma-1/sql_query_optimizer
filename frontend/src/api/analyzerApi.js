import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const analyzeQueryPlan = async (token, { queryPlan, sqlQuery, dbType }) => {
    const response = await axios.post(
        `${API_URL}/analyze`,
        { queryPlan, sqlQuery, dbType },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}