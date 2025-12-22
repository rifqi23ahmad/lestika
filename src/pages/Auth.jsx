import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // State baru untuk Nama Lengkap
  const [isLogin, setIsLogin] = useState(true); // Toggle antara Login dan Register
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    
    if (isLogin) {
        // Logika Login
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        error = signInError;
    } else {
        // Logika Register (Daftar Baru)
        // Kita kirim full_name sebagai meta data agar ditangkap Trigger SQL
        const { error: signUpError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName 
                }
            }
        });
        error = signUpError;
    }

    if (error) {
        alert(error.message);
    } else {
        if (!isLogin) {
            alert('Registrasi berhasil! Silakan cek email untuk verifikasi sebelum login.');
            setIsLogin(true); // Kembali ke mode login
        } else {
            navigate('/dashboard');
        }
    }
    setLoading(false);
  };

  return (
    <div className="container section-padding text-center">
      <div style={{maxWidth: '400px', margin: '0 auto', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px'}}>
          <h2>{isLogin ? 'Masuk' : 'Daftar Baru'}</h2>
          <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            
            {/* Input Nama Lengkap hanya muncul saat Register */}
            {!isLogin && (
                <input
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
                />
            )}

            <input
              type="email"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
            <button className="btn-primary" disabled={loading} style={{cursor:'pointer'}}>
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            </button>
          </form>
          <p style={{marginTop: '20px'}}>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <span 
                style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Daftar disini' : 'Login disini'}
            </span>
          </p>
      </div>
    </div>
  );
}