import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Ambil session saat pertama kali load
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth session error:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen perubahan status (Login, Logout, Auto-refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription saat unmount
    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
};