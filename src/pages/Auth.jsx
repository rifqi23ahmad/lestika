import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle antara Login dan Register
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    
    if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        error = signInError;
    } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        error = signUpError;
    }

    if (error) {
        alert(error.message);
    } else {
        if (!isLogin) alert('Cek email untuk verifikasi!');
        navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="container section-padding text-center">
      <div style={{maxWidth: '400px', margin: '0 auto', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px'}}>
          <h2>{isLogin ? 'Masuk' : 'Daftar Baru'}</h2>
          <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
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
            <button className="btn-primary" disabled={loading}>
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