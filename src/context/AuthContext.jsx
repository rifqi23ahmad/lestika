import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // FUNGSI 1: Cek Sesi dengan Timeout (Anti-Macet)
    const initSession = async () => {
      try {
        // Balapan: Mana lebih cepat? Data Sesi atau Timer 5 Detik?
        const sessionPromise = authService.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const currentUser = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (mounted) setUser(currentUser);
      } catch (error) {
        console.warn("Sesi bermasalah/timeout, reset ke mode tamu.", error);
        if (mounted) setUser(null);
        // Opsional: Hapus token lokal jika rusak parah
        // localStorage.clear(); 
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // FUNGSI 2: Listener Perubahan Auth (Login/Logout Realtime)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        try {
            // Ambil data profile dengan timeout 3 detik agar tidak macet
            const fetchProfile = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            const timeoutProfile = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile timeout')), 3000)
            );

            const { data: profile } = await Promise.race([fetchProfile, timeoutProfile])
                                     .catch(() => ({ data: null })); // Fallback jika timeout

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
            console.error("Gagal load profile:", err);
            setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'siswa',
                name: session.user.email
            });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Tambahkan timeout juga saat Login
    const loginAction = authService.login(email, password);
    const timeoutAction = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - periksa koneksi internet')), 10000)
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
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
           <div className="text-center">
             <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
             </div>
             <p className="mt-3 text-muted fw-medium">Memuat Aplikasi...</p>
             <small className="text-secondary" style={{ fontSize: '0.8rem' }}>
               Jika macet, coba refresh halaman.
             </small>
           </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);