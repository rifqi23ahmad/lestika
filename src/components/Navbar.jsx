import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ session }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header>
      <nav>
        <div className="logo">MAPA</div>
        <ul>
          <li><Link to="/">Beranda</Link></li>
          {!session ? (
             // Menu untuk pengunjung umum
             <>
               <li><a href="#programs">Program</a></li>
               <li><a href="#features">Fitur</a></li>
               <li><Link to="/login" className="btn">Masuk / Daftar</Link></li>
             </>
          ) : (
             // Menu untuk user yang sudah login
             <>
               <li><Link to="/dashboard">Dashboard</Link></li>
               <li><button onClick={handleLogout} className="btn-secondary" style={{border:'none', cursor:'pointer'}}>Logout</button></li>
             </>
          )}
        </ul>
      </nav>
    </header>
  );
}