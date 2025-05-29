import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Auth } from './pages/auth'
import StudentDashboard from './pages/studentDashboard'
import TeacherDashboard from './pages/teacherDashboard'
import CoordinatorDashboard from './pages/coordinatorDashboard'
import ProtectedRoute from './routes/protectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/student-dashboard"
          element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/teacher-dashboard"
          element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
        />
        <Route
          path="/coordinator-dashboard"
          element={<ProtectedRoute role="coordinator"><CoordinatorDashboard /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App