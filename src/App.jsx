// File: src/App.jsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer'; // Pastikan import ini ada

// Import Halaman (Pastikan file-file ini sudah dibuat sesuai instruksi Bagian 2)
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
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

// HAPUS function Footer() {...} yang ada di sini sebelumnya