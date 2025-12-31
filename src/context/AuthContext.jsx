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

    // 2. Listener Auth (DIPERBAIKI)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        
        // FETCH ULANG PROFILE DARI DB AGAR ROLE AKURAT
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
            id: session.user.id,
            email: session.user.email,
            // Pakai role dari database!
            role: profile?.role || 'siswa', 
            name: profile?.full_name || session.user.email
        });

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

  const register = async (email, password, name, role) => {
    await authService.register(email, password, name, role);
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);