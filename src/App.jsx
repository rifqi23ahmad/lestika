import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { APP_CONFIG } from './config/constants'; // Import Config

import AppNavbar from './components/layout/Navbar'; 
import Footer from './components/layout/Footer';
import GlobalLoadingHandler from './components/layout/GlobalLoadingHandler'; // Asumsi component loading dipisah/inline

import HomeView from './pages/HomeView';
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView'; 
import RegisterView from './pages/RegisterView'; 
import InvoiceView from './pages/InvoiceView';
import ScheduleView from './pages/ScheduleView';
import DashboardManager from './pages/dashboard/DashboardManager';

import ProtectedRoute from './components/auth/ProtectedRoute';

const LoadingWrapper = ({ children }) => {
    const { loading } = useAuth();
    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center">Loading...</div>;
    return children;
};

export default function App() {
  return (
    <AuthProvider>
      <LoadingWrapper>
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
                path="/jadwal" 
                element={
                  <ProtectedRoute allowedRoles={[APP_CONFIG.ROLES.ADMIN, APP_CONFIG.ROLES.GURU]}>
                    <ScheduleView />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </main>
          <Footer />
        </div>
      </LoadingWrapper>
    </AuthProvider>
  );
}