import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/layout/Navbar'; 
import Footer from './components/layout/Footer';

// Import Halaman
import HomeView from './pages/HomeView';
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView'; 
import RegisterView from './pages/RegisterView'; 
import InvoiceView from './pages/InvoiceView';
import ScheduleView from './pages/ScheduleView'; // IMPORT BARU
import DashboardManager from './pages/dashboard/DashboardManager';

export default function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <AppNavbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} /> 
            <Route path="/register" element={<RegisterView />} />
            <Route path="/invoice" element={<InvoiceView />} />
            <Route path="/jadwal" element={<ScheduleView />} /> {/* ROUTE BARU */}
            <Route path="/dashboard" element={<DashboardManager />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}