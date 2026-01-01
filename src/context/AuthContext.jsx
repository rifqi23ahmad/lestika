import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- HELPER 1: Buat User Dasar (Instan) ---
  // Data ini dipakai agar user bisa langsung masuk tanpa menunggu loading DB
  const getBasicUser = (authUser) => {
    return {
      id: authUser.id,
      email: authUser.email,
      role: 'siswa', // Default sementara agar tidak crash
      name: authUser.user_metadata?.name || authUser.email, // Pakai nama dari metadata atau email dulu
      isPartial: true // Penanda bahwa data ini belum lengkap
    };
  };

  // --- HELPER 2: Ambil Data Profile Lengkap (Background) ---
  const getEnrichedUser = async (authUser) => {
    if (!authUser) return null;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Gabungkan data auth + profile
      return {
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || 'siswa', 
        name: profile?.full_name || authUser.user_metadata?.name || authUser.email,
        jenjang: profile?.jenjang,
        kelas: profile?.kelas,
        whatsapp: profile?.whatsapp,
        isPartial: false // Data sudah lengkap
      };
    } catch (err) {
      console.warn("Gagal load profile, tetap gunakan data basic.");
      return getBasicUser(authUser);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Cek Token LocalStorage
        const hasLocalToken = Object.keys(localStorage).some(key => 
          key.startsWith('sb-') && key.endsWith('-auth-token')
        );

        if (!hasLocalToken) {
          if (mounted) { setUser(null); setLoading(false); }
          return;
        }

        // Ambil sesi tanpa timeout (biarkan Supabase bekerja)
        const sessionData = await authService.getSession();
        
        if (sessionData && mounted) {
            // 1. Tampilkan User Basic DULU (Instan)
            const basicUser = getBasicUser(sessionData);
            setUser(basicUser);
            
            // 2. Ambil Profile Lengkap (Background)
            getEnrichedUser(sessionData).then(fullUser => {
                if (mounted) setUser(fullUser);
            });
        }

      } catch (error) {
        console.warn("Session init error:", error.message);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // --- LISTENER AUTH REALTIME (Logika Dipercepat) ---
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // PERUBAHAN UTAMA DISINI:
        // 1. Jangan tunggu await getEnrichedUser. Langsung set user basic!
        const basicUser = getBasicUser(session.user);
        setUser(basicUser); 

        // 2. Fetch profile di background, update user setelah selesai
        getEnrichedUser(session.user).then((fullUser) => {
            if (mounted) setUser(fullUser);
        });

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
    // Tidak ada timeout, tidak ada blocking berlebih
    // Begitu fungsi ini selesai, onAuthStateChange di atas akan menangkap event SIGNED_IN
    await authService.login(email, password);
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
        // Loading hanya muncul saat inisialisasi awal (refresh halaman).
        // Saat klik login, loading ini TIDAK muncul, jadi transisi lebih mulus.
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