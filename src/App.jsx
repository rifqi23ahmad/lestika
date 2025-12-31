import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/layout/Navbar'; // Pastikan nama import sesuai export di Navbar.jsx
import Footer from './components/layout/Footer';

// Import Halaman
import HomeView from './pages/HomeView';
import LoginView from './pages/LoginView';
import RegisterView from './pages/RegisterView';
import InvoiceView from './pages/InvoiceView';
import DashboardManager from './pages/dashboard/DashboardManager';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleRegisterClick = (pkg) => {
    setSelectedPackage(pkg);
    handleNavigate('register');
  };

  const handleInvoiceCreated = (invoice) => {
    setInvoiceData(invoice);
    handleNavigate('invoice');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} onRegister={handleRegisterClick} />;
      case 'login':
        return <LoginView onNavigate={handleNavigate} />;
      case 'register':
        return (
          <RegisterView 
            selectedPackage={selectedPackage} 
            onSuccess={handleInvoiceCreated}
            onCancel={() => handleNavigate('home')} 
          />
        );
      case 'invoice':
        return <InvoiceView data={invoiceData} onHome={() => handleNavigate('home')} />;
      case 'dashboard':
        return <DashboardManager />;
      default:
        return <HomeView onNavigate={handleNavigate} onRegister={handleRegisterClick} />;
    }
  };

  return (
    <AuthProvider>
      {/* Menggunakan class Bootstrap 'd-flex flex-column min-vh-100' agar footer selalu di bawah */}
      <div className="d-flex flex-column min-vh-100 bg-light">
        <AppNavbar onNavigate={handleNavigate} />
        <main className="flex-grow-1">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}