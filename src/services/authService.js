import { supabase } from '../lib/supabase';

export const authService = {
  // Login
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Register
  register: async (email, password, fullName, role = 'siswa') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role 
        }
      }
    });
    if (error) throw error;
    return data;
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  // Cek Sesi (DIPERBAIKI)
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // STEP PENTING: Ambil data Role yang ASLI dari tabel 'profiles'
    // Jangan percaya metadata session karena bisa usang
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email,
      // Prioritaskan role dari tabel profiles, jika null baru fallback ke metadata/siswa
      role: profile?.role || session.user.user_metadata?.role || 'siswa',
      name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email
    };
  }
};