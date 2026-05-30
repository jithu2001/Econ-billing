import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/dashboard/Dashboard'
import CustomerList from './pages/customers/CustomerList'
import CustomerDetails from './pages/customers/CustomerDetails'
import RoomList from './pages/rooms/RoomList'
import ReservationList from './pages/reservations/ReservationList'
import BillList from './pages/bills/BillList'
import SettingsPage from './pages/settings/Settings'
import Login from './pages/Login'
import { authService } from './services/auth.service'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'pending' | 'authed' | 'guest'>('pending')
  useEffect(() => {
    authService.isAuthenticated().then(ok => setState(ok ? 'authed' : 'guest'))
  }, [])
  if (state === 'pending') return null
  if (state === 'guest') return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="reservations" element={<ReservationList />} />
          <Route path="bills" element={<BillList />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
