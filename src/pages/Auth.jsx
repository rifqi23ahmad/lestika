import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // State Form
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State Data Diri (Hanya untuk Register)
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenjang, setJenjang] = useState('SD'); 
  const [usia, setUsia] = useState('');
  const [namaOrangTua, setNamaOrangTua] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
        alert('Password dan Ulangi Password tidak sama!');
        setLoading(false);
        return;
    }

    // --- RAHASIA AGAR DITERIMA SUPABASE ---
    // Kita tempelkan @mapa.com di belakang nomor WA
    // User tidak akan melihat ini, hanya sistem yang tahu.
    const waLogin = `${phone}@mapa.com`;
    
    let error;
    
    if (isLogin) {
        // --- LOGIKA LOGIN ---
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
            email: waLogin, 
            password 
        });
        error = signInError;
    } else {
        // --- LOGIKA REGISTER ---
        const { error: signUpError } = await supabase.auth.signUp({ 
            email: waLogin, 
            password,
            options: {
                data: {
                    nama: nama,
                    kelas: kelas,
                    jenjang: jenjang,
                    usia: usia,
                    nama_orang_tua: namaOrangTua,
                    phone: phone // Simpan nomor asli di sini
                }
            }
        });
        error = signUpError;
    }

    if (error) {
        // Pesan error kita ubah bahasanya agar user tidak bingung soal "email"
        if (error.message.includes('Invalid login credentials')) {
            alert('Nomor WhatsApp atau Password salah.');
        } else if (error.message.includes('already registered')) {
            alert('Nomor WhatsApp ini sudah terdaftar. Silakan login.');
        } else {
            alert('Gagal: ' + error.message);
        }
    } else {
        navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="container section-padding text-center">
      <div className="auth-container" style={{maxWidth: '500px', margin: '0 auto'}}>
          <h2>{isLogin ? 'Masuk Siswa' : 'Pendaftaran Siswa Baru'}</h2>
          
          <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap:'15px', textAlign:'left'}}>
            
            {/* --- Form Khusus Register --- */}
            {!isLogin && (
                <>
                    <div>
                        <label>Nama Lengkap Siswa</label>
                        <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Contoh: Budi Santoso" style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
                    </div>

                    <div style={{display:'flex', gap:'10px'}}>
                        <div style={{flex:1}}>
                            <label>Jenjang</label>
                            <select value={jenjang} onChange={(e) => setJenjang(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}>
                                <option value="TK">TK</option>
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            <label>Kelas</label>
                            <input type="text" value={kelas} onChange={(e) => setKelas(e.target.value)} required placeholder="Cth: 5 SD" style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
                        </div>
                    </div>

                    <div>
                        <label>Usia (Tahun)</label>
                        <input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} required placeholder="Contoh: 10" style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
                    </div>

                    <div>
                        <label>Nama Orang Tua</label>
                        <input type="text" value={namaOrangTua} onChange={(e) => setNamaOrangTua(e.target.value)} required placeholder="Nama Ayah/Ibu" style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
                    </div>
                </>
            )}

            {/* --- Form Login & Register --- */}
            <div>
                <label>Nomor WhatsApp</label>
                <input 
                    type="number" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    placeholder="Contoh: 08123456789"
                    style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} 
                />
            </div>

            <div>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
            </div>

            {!isLogin && (
                <div>
                    <label>Ulangi Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} />
                </div>
            )}

            <button className="btn-primary" disabled={loading} style={{marginTop:'10px', width:'100%'}}>
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
            </button>
          </form>

          <p style={{marginTop: '20px'}}>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <span 
                style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Daftar disini' : 'Masuk disini'}
            </span>
          </p>
      </div>
    </div>
  );
}