import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicHomePage } from './PublicHomePage'
import { AccountSelectionPage } from './AccountSelectionPage'
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
  InitialPasswordChangePage,
} from './views'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/account" element={<AccountSelectionPage />} />
          <Route path="/login" element={<Navigate to="/account" replace />} />
          <Route path="/register" element={<Navigate to="/customer/register" replace />} />
          <Route path="/admin/login" element={<LoginPage portalRole="admin" />} />
          <Route path="/customer/login" element={<LoginPage portalRole="customer" />} />
          <Route path="/customer/register" element={<RegisterPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage portalRole="admin" />} />
          <Route path="/customer/forgot-password" element={<ForgotPasswordPage portalRole="customer" />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage portalRole="admin" />} />
          <Route path="/customer/reset-password" element={<ResetPasswordPage portalRole="customer" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/change-password" element={<InitialPasswordChangePage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/customer/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['admin', 'staff']} />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['admin', 'staff', 'customer']} />}>
            <Route element={<WorkspaceLayout />}><Route path="/profile" element={<ProfilePage />} /></Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
