import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import History from './pages/History'
import HistoryDetail from './pages/HistoryDetail'

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    return children
}

const App = () => {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <Routes>

                {/* home is now public */}
                <Route path="/" element={<Home />} />

                {/* auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/history" element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } />

                <Route path="/history/:id" element={
                    <ProtectedRoute>
                        <HistoryDetail />
                    </ProtectedRoute>
                } />

                {/* catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </div>
    )
}

export default App