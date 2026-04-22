import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import queryRoutes from './routes/queryRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import sharedReportRoutes from './routes/sharedReportRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

app.use('/api', queryRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/shared-reports', sharedReportRoutes)

// for local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`)
    })
}

export default app