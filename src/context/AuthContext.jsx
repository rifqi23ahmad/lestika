import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat aplikasi dimuat
    const initSession = async () => {
      try {
        const currentUser = await authService.getSession();
        setUser(currentUser);
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };
    initSession();

    // 2. Listener Auth
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // FETCH ULANG PROFILE DARI DB AGAR ROLE AKURAT
        // Menggunakan try-catch agar jika fetch profile gagal, user tetap login dengan data basic
        try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
                id: session.user.id,
                email: session.user.email,
                role: profile?.role || 'siswa', 
                name: profile?.full_name || session.user.email,
                // Tambahkan data detail jika diperlukan komponen lain
                jenjang: profile?.jenjang,
                kelas: profile?.kelas,
                whatsapp: profile?.whatsapp
            });
        } catch (err) {
            console.error("Error fetching profile on auth change:", err);
            // Fallback jika fetch profile gagal
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
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
  };

  const register = async (email, password, name, detailData) => {
    // Pastikan parameter sesuai dengan authService.register
    await authService.register(email, password, name, detailData);
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {/* PERBAIKAN: Tampilkan Loading Spinner daripada null/kosong */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
           <div className="text-center">
             <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
             </div>
             <p className="mt-3 text-muted fw-medium">Memuat Aplikasi...</p>
           </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);