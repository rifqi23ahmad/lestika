import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;

    if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        error = signInError;
    } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { full_name: fullName } }
        });
        error = signUpError;
    }

    if (error) {
        alert(error.message);
    } else {
        if (!isLogin) {
            alert('Registrasi berhasil! Cek email untuk verifikasi.');
            setIsLogin(true);
        } else {
            navigate('/dashboard');
        }
    }
    setLoading(false);
  };

  return (
    <div className="container section-padding text-center">
      <div className="auth-container">
          <h2>{isLogin ? 'Masuk' : 'Daftar Baru'}</h2>
          <form onSubmit={handleAuth}>
            {!isLogin && (
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
            )}
            <input
              type="email"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn-primary" disabled={loading} style={{width: '100%', marginTop: '10px'}}>
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