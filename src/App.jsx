import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { APP_CONFIG } from "./config/constants";
import AppNavbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomeView from "./pages/HomeView";
import LoginView from "./pages/LoginView";
import SignupView from "./pages/SignupView";
import RegisterView from "./pages/RegisterView";
import InvoiceView from "./pages/InvoiceView";
import ScheduleView from "./pages/ScheduleView";
import DashboardManager from "./pages/dashboard/DashboardManager";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

import WhatsAppBubble from "./components/layout/WhatsAppBubble";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AppNavbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />

          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <RegisterView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute>
                <InvoiceView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.SISWA]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.GURU]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jadwal"
            element={
              <ProtectedRoute
                allowedRoles={[
                  APP_CONFIG.ROLES.ADMIN,
                  APP_CONFIG.ROLES.GURU,
                  APP_CONFIG.ROLES.SISWA,
                ]}
              >
                <ScheduleView />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      <WhatsAppBubble />
    </div>
  );
}
