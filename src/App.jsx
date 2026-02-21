import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth, Roles } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/auth/ProtectedRoute'

import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import Layout from './components/layout/Layout'

import PatientSettings from './views/patient/Settings'
import PatientMessages from './views/patient/PatientMessages'
import ReserveAppointment from './views/patient/ReserveAppointment'
import DoctorDashboard from './views/doctor/Dashboard'
import Schedule from './views/doctor/Schedule'
import PatientQueue from './views/doctor/PatientQueue'
import SessionHistory from './views/doctor/SessionHistory'
import MedicalHistory from './views/doctor/MedicalHistory'
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
import ForgotPassword from './views/auth/ForgotPassword'

import InviteStaff from './views/admin/InviteStaff'
import AdminMessages from './views/admin/Messages'
import AdminBookings from './views/admin/Bookings'
import AdminDashboard from './views/admin/Dashboard'
import MessagesPage from './views/shared/MessagesPage'

function RootRedirect() {
  const { isAuthenticated, getDashboardRoute } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute()} replace />
  }

  return <Navigate to="/auth/login" replace />
}

function AppRoutes() {
  const { isRTL } = useLanguage()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/role-selection" element={<RoleSelection />} />
        <Route path="/auth/register/patient" element={<PatientRegistration />} />
        <Route path="/auth/register/doctor" element={<DoctorRegistration />} />
        <Route path="/auth/pending-approval" element={<PendingApproval />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

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
          path="/dashboard/doctor/medical-history"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <MedicalHistory />
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
              <Layout>
                <MessagesPage />
              </Layout>
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
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminDashboard />
              </Layout>
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
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminBookings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invite-staff"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <InviteStaff />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminMessages />
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
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
