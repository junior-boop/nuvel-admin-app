import { type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Login from '@/pages/Login'
import Overview from '@/pages/Overview'
import Errors from '@/pages/Errors'
import Notifications from '@/pages/Notifications'
import Comments from '@/pages/Comments'
import Users from '@/pages/Users'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="errors" element={<Errors />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="comments" element={<Comments />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  )
}
