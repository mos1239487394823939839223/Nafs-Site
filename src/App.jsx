import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth, Roles } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Layout from './components/layout/Layout'

import PatientSettings from './views/patient/Settings'
import PatientMessages from './views/patient/PatientMessages'
import ReserveAppointment from './views/patient/ReserveAppointment'
import DoctorDashboard from './views/doctor/Dashboard'
import Schedule from './views/doctor/Schedule'
import PatientQueue from './views/doctor/PatientQueue'
import SessionHistory from './views/doctor/SessionHistory'
import Settings from './views/doctor/Settings'
import UserManagement from './views/admin/UserManagement'
import AdminProfile from './views/admin/Profile'
import CustomerServiceDashboard from './views/customer-service/Dashboard'
import StaffProfile from './views/customer-service/Profile'

import Login from './views/auth/Login'
import RoleSelection from './views/auth/RoleSelection'
import PatientRegistration from './views/auth/patient/PatientRegistration'
import DoctorRegistration from './views/auth/doctor/DoctorRegistration'
import PendingApproval from './views/auth/PendingApproval'

import InviteStaff from './views/admin/InviteStaff'

import MessagesPage from './views/shared/MessagesPage'

function RootRedirect() {
  const { isAuthenticated, getDashboardRoute } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute()} replace />
  }

  return <Navigate to="/auth/login" replace />
}

function AppRoutes() {
  const [isRTL, setIsRTL] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'appointment', message: 'Upcoming appointment with Dr. Ahmed in 2 hours', time: '2 hours' },
    { id: 2, type: 'reminder', message: 'Complete your pre-session health quiz', time: '1 day' },
  ])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/role-selection" element={<RoleSelection />} />
        <Route path="/auth/register/patient" element={<PatientRegistration />} />
        <Route path="/auth/register/doctor" element={<DoctorRegistration />} />
        <Route path="/auth/pending-approval" element={<PendingApproval />} />

        {/* Protected Patient Routes */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Navigate to="/dashboard/patient/reserve" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/reserve"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <ReserveAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/messages"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientMessages />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/profile"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Routes */}
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/schedule"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <Schedule />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/queue"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <PatientQueue />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/history"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <SessionHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/settings"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/messages"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Staff Routes */}
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute allowedRoles={[Roles.STAFF]}>
              <Layout>
                <CustomerServiceDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff/messages"
          element={
            <ProtectedRoute allowedRoles={[Roles.STAFF]}>
              <Layout>
                <MessagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff/profile"
          element={
            <ProtectedRoute allowedRoles={[Roles.STAFF]}>
              <Layout>
                <StaffProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Navigate to="/admin/users" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Legacy dashboard route - redirect to role-specific dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RootRedirect />
            </ProtectedRoute>
          }
        />

        {/* Root Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* 404 - Redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
