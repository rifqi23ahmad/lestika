import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // --- 1. JALUR CEPAT (INSTANT CHECK) ---
        // Cek apakah ada jejak token Supabase di LocalStorage browser.
        // Format key Supabase: 'sb-<project-id>-auth-token'
        const hasLocalToken = Object.keys(localStorage).some(key => 
          key.startsWith('sb-') && key.endsWith('-auth-token')
        );

        // Jika TIDAK ADA token di HP/Laptop, user pasti Guest/Belum Login.
        // Langsung stop loading DETIK INI JUGA (0 ms). Jangan tunggu server!
        if (!hasLocalToken) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return; // Stop di sini, tidak perlu request network
        }

        // --- 2. JALUR NORMAL (VALIDASI SERVER) ---
        // Hanya jalan jika ditemukan token. Kita beri waktu maksimal 2 detik.
        // Jika koneksi > 2 detik, kita anggap gagal agar user tidak bengong lama.
        const sessionPromise = authService.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Slow connection')), 2000)
        );

        // Balapan: Mana lebih cepat? Data Server atau Timer 2 Detik?
        const currentUser = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (mounted) setUser(currentUser);

      } catch (error) {
        // Jika error/timeout, force logout agar user bisa login ulang segera
        console.warn("Fast load fallback:", error.message);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // --- LISTENER AUTH REALTIME ---
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        // Ambil data detail user (profile)
        try {
            // Timeout pendek untuk profile fetch (3s)
            const fetchProfile = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            const timeoutProfile = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile timeout')), 3000)
            );

            const { data: profile } = await Promise.race([fetchProfile, timeoutProfile])
                                     .catch(() => ({ data: null }));

            setUser({
                id: session.user.id,
                email: session.user.email,
                role: profile?.role || 'siswa', 
                name: profile?.full_name || session.user.email,
                jenjang: profile?.jenjang,
                kelas: profile?.kelas,
                whatsapp: profile?.whatsapp
            });
        } catch (err) {
            console.error("Profile load error:", err);
            // Fallback user basic jika profile gagal load
            setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'siswa',
                name: session.user.email
            });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Opsional: Bersihkan cache jika logout
        // localStorage.clear(); 
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Timeout login tetap agak panjang (5s) karena user sadar sedang menunggu
    const loginAction = authService.login(email, password);
    const timeoutAction = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - periksa sinyal Anda')), 5000)
    );
    await Promise.race([loginAction, timeoutAction]);
  };

  const register = async (email, password, name, detailData) => {
    await authService.register(email, password, name, detailData);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {loading ? (
        // Loading Screen Minimalis (Hanya muncul jika user punya token tapi sinyal lambat)
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
           <div className="text-center">
             <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
                <span className="visually-hidden">Loading...</span>
             </div>
           </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);