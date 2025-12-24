import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
// Import Ikon dari Lucide React
import { Home, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      {/* 1. DESKTOP NAVBAR */}
      <nav className="desktop-nav" style={{
          background: 'white', padding: '16px 0', borderBottom: '1px solid #E2E8F0',
          position: 'sticky', top: 0, zIndex: 50
      }}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{fontSize:'1.5rem', fontWeight:'800', color:'#4F46E5', textDecoration:'none', display:'flex', alignItems:'center', gap:'8px'}}>
            <LayoutDashboard size={28}/> MAPA
          </Link>
          <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
            <Link to="/" className="btn-ghost">Beranda</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                <button onClick={handleLogout} className="btn-secondary">
                   <LogOut size={16}/> Keluar
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. MOBILE BOTTOM NAVBAR */}
      <div className="mobile-nav-bar">
        <Link to="/" className={isActive('/')}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        
        {user ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>
              <LayoutDashboard size={24} />
              <span>Dashboard</span>
            </Link>
            <div onClick={handleLogout} className="nav-item">
              <LogOut size={24} />
              <span>Keluar</span>
            </div>
          </>
        ) : (
          <Link to="/login" className={isActive('/login')}>
            <LogIn size={24} />
            <span>Masuk</span>
          </Link>
        )}
      </div>

      <style>{`
        @media (min-width: 769px) { .mobile-nav-bar { display: none !important; } }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
      `}</style>
    </>
  );
}