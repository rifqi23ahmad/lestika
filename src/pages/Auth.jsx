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
  
  // State Data Diri
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenjang, setJenjang] = useState('SD'); 
  const [usia, setUsia] = useState('');
  const [namaOrangTua, setNamaOrangTua] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = phone.trim(); 
    const cleanPassword = password.trim();

    if (!cleanPhone || !cleanPassword) {
        alert("Nomor WA dan Password wajib diisi.");
        setLoading(false);
        return;
    }

    if (!isLogin && cleanPassword !== confirmPassword) {
        alert('Password dan Ulangi Password tidak sama!');
        setLoading(false);
        return;
    }

    // Email palsu untuk login
    const waLogin = `${cleanPhone}@mapa.com`;
    
    try {
        if (isLogin) {
            // --- LOGIN ---
            const { error } = await supabase.auth.signInWithPassword({ 
                email: waLogin, 
                password: cleanPassword 
            });
            if (error) throw error;
            navigate('/dashboard');

        } else {
            // --- REGISTER (Disederhanakan) ---
            // Kita kirim SEMUA data ke 'options.data'.
            // Trigger database akan otomatis memindahkannya ke tabel 'profiles'.
            const { error } = await supabase.auth.signUp({ 
                email: waLogin, 
                password: cleanPassword,
                options: {
                    data: { 
                        full_name: nama, 
                        phone: cleanPhone,
                        jenjang: jenjang,
                        kelas: kelas,
                        usia: usia,
                        nama_orang_tua: namaOrangTua
                    }
                }
            });

            if (error) throw error;
            
            alert("Pendaftaran berhasil! Silakan login.");
            setIsLogin(true); // Pindah ke mode login
        }

    } catch (error) {
        console.error("Auth Error:", error);
        if (error.message.includes('Invalid login credentials')) {
            alert('Nomor WhatsApp atau Password salah.');
        } else if (error.message.includes('already registered')) {
            alert('Nomor WhatsApp ini sudah terdaftar. Silakan login.');
        } else {
            alert('Gagal: ' + error.message);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container section-padding text-center">
      <div className="auth-container" style={{maxWidth: '500px', margin: '0 auto'}}>
          <h2>{isLogin ? 'Masuk Siswa' : 'Pendaftaran Siswa Baru'}</h2>
          
          <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap:'15px', textAlign:'left'}}>
            
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