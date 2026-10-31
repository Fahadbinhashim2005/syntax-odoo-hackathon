import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import {
  CustomerDetailsPage,
  CustomersPage,
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  StaffPage,
  WorkspaceLayout,
} from './views'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/staff" element={<StaffPage />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'staff']} />}>
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
