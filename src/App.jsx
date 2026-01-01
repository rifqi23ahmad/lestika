import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Hapus AuthProvider dari import
import { APP_CONFIG } from './config/constants'; 

// Components
import PackageManager from './components/admin/PackageManager';
import AppNavbar from './components/layout/Navbar'; 
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomeView from './pages/HomeView';
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView'; 
import RegisterView from './pages/RegisterView'; 
import InvoiceView from './pages/InvoiceView';
import ScheduleView from './pages/ScheduleView';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import DashboardManager from './pages/dashboard/DashboardManager'; 

export default function App() {
  const { loading } = useAuth(); // Langsung ambil status loading

  // TAMPILAN LOADING (Spinner)
  // Jika sedang memuat user, tampilkan ini DULUAN agar tidak blank/error
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // TAMPILAN UTAMA (Setelah loading selesai)
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AppNavbar />
      <main className="flex-grow-1">
        <Routes>
          {/* === Public Routes === */}
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} /> 
          
          {/* === Protected Routes === */}
          <Route 
            path="/register" 
            element={<ProtectedRoute><RegisterView /></ProtectedRoute>} 
          />
          <Route 
            path="/invoice" 
            element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} 
          />
          
          {/* === DASHBOARD === */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardManager /></ProtectedRoute>} 
          />
          <Route 
            path="/student/dashboard" 
            element={<ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.SISWA]}><StudentDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/dashboard" 
            element={<ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.GURU]}><TeacherDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.ADMIN]}><PackageManager /></ProtectedRoute>} 
          />

          {/* === JADWAL === */}
          <Route 
            path="/jadwal" 
            element={
              <ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.ADMIN, APP_CONFIG.ROLES.GURU, APP_CONFIG.ROLES.SISWA]}>
                <ScheduleView />
              </ProtectedRoute>
            } 
          />

          <Route path="/admin/paket" element={<ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.ADMIN]}><PackageManager /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}