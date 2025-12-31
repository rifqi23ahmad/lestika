import React, { useState } from 'react';
import { BookOpen, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNav('home');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-2xl text-blue-900 tracking-tighter">MAPA</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => handleNav('home')} className="hover:text-blue-600 px-3 py-2 font-medium">Beranda</button>
            
            {user ? (
               <div className="flex items-center space-x-4 ml-4">
                 <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                   Hi, {user.name}
                 </span>
                 <button onClick={() => handleNav('dashboard')} className="flex items-center text-gray-600 hover:text-blue-600">
                   <LayoutDashboard className="w-4 h-4 mr-1"/> Dashboard
                 </button>
                 <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition flex items-center">
                   <LogOut className="w-4 h-4 mr-1" /> Keluar
                 </button>
               </div>
            ) : (
              <button onClick={() => handleNav('login')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition ml-4">
                Login Portal
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2">
          <button onClick={() => handleNav('home')} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Beranda</button>
          {user ? (
            <>
              <button onClick={() => handleNav('dashboard')} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Dashboard</button>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600">Keluar</button>
            </>
          ) : (
            <button onClick={() => handleNav('login')} className="block w-full text-left px-3 py-2 text-blue-600 font-bold">Login</button>
          )}
        </div>
      )}
    </nav>
  );
}