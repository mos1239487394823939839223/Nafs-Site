import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  AuthProvider,
  useAuth,
  Roles,
  RoleDashboards,
} from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Layout from "./components/layout/Layout";

import { PatientHomePage } from "./Pages/patient-home-page";
import PatientSettings from "./views/patient/Settings";
import PatientProfile from "./views/patient/Profile";
import ReserveAppointment from "./views/patient/ReserveAppointment";
import MeetingRoom from "./views/patient/MeetingRoom";
import PatientTests from "./views/patient/Tests";
import PatientTestDetailPage from "./views/patient/TestDetailPage";
import TreatmentProgramDetails from "./views/patient/TreatmentProgramDetails";
import PatientArticles from "./views/patient/Articles";
import Schedule from "./views/doctor/Schedule";
import PatientQueue from "./views/doctor/PatientQueue";
import SessionHistory from "./views/doctor/SessionHistory";
import MedicalHistory from "./views/doctor/MedicalHistory";
import Settings from "./views/doctor/Settings";
import UserManagement from "./views/admin/UserManagement";
import AdminProfile from "./views/admin/Profile";
import CustomerServiceDashboard from "./views/customer-service/Dashboard";
import StaffProfile from "./views/customer-service/Profile";

import Login from "./views/auth/Login";
import RoleSelection from "./views/auth/RoleSelection";
import PatientRegistration from "./views/auth/patient/PatientRegistration";
import DoctorRegistration from "./views/auth/doctor/DoctorRegistration";
import PendingApproval from "./views/auth/PendingApproval";
import ForgotPassword from "./views/auth/ForgotPassword";

import AdminBookings from "./views/admin/Bookings";
import AdminDashboard from "./views/admin/Dashboard";
import AdminBlogs from "./views/admin/Blogs";
import BlogDetail from "./views/admin/BlogDetail";
import AdminTests from "./views/admin/Tests";
import AdminPaymentDetails from "./views/admin/PaymentDetails";
import DoctorFinance from "./views/admin/DoctorFinance";
import PatientBlogs from "./views/patient/Blogs";
import MessagesPage from "./views/shared/MessagesPage";
import DocumentViewer from "./views/shared/DocumentViewer";
import NotificationsPage from "./views/shared/NotificationsPage";
import LandingPage from "./Pages/landing-home-final/LandingPage";
import MainDoctorDashboard from "./Pages/land-new-page/main-doctor-dashboard";

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  // Wait for auth to load from localStorage before redirecting
  if (loading) {
    return null;
  }

  if (isAuthenticated && role) {
    const dashboardRoute = RoleDashboards[role] || "/auth/login";
    return <Navigate to={dashboardRoute} replace />;
  }

  return <LandingPage />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/role-selection" element={<RoleSelection />} />
        <Route
          path="/auth/register/patient"
          element={<PatientRegistration />}
        />
        <Route path="/auth/register/doctor" element={<DoctorRegistration />} />
        <Route path="/auth/pending-approval" element={<PendingApproval />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Protected Patient Routes */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Navigate to="/dashboard/patient/home" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/home"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientHomePage />
              </Layout>
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
                <MessagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/meeting/:bookingId"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <MeetingRoom />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/tests/:testId"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientTestDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/tests"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientTests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/treatment-program"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <TreatmentProgramDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/blogs"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <AdminBlogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/blogs/:id"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <BlogDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/profile"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT]}>
              <Layout>
                <PatientProfile />
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
                <MainDoctorDashboard />
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
              <Navigate to="/dashboard/doctor/medical-records" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/medical-records"
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
        <Route
          path="/dashboard/doctor/blogs"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <AdminBlogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/blogs/:id"
          element={
            <ProtectedRoute allowedRoles={[Roles.DOCTOR]}>
              <Layout>
                <BlogDetail />
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
          path="/dashboard/staff/blogs"
          element={
            <ProtectedRoute allowedRoles={[Roles.STAFF]}>
              <Layout>
                <AdminBlogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff/blogs/:id"
          element={
            <ProtectedRoute allowedRoles={[Roles.STAFF]}>
              <Layout>
                <BlogDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
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
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <MessagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminBlogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/:blogId"
          element={
            <ProtectedRoute
              allowedRoles={[
                Roles.ADMIN,
                Roles.PATIENT,
                Roles.DOCTOR,
                Roles.STAFF,
              ]}
            >
              <Layout>
                <BlogDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminTests />
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
        <Route
          path="/admin/payment-details"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <AdminPaymentDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:doctorId/finance"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <Layout>
                <DoctorFinance />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Legacy redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RootRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/document-viewer"
          element={
            <ProtectedRoute
              allowedRoles={[
                Roles.PATIENT,
                Roles.DOCTOR,
                Roles.ADMIN,
                Roles.STAFF,
              ]}
            >
              <DocumentViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={[Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN, Roles.STAFF]}>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
