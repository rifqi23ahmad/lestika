import { supabase } from '../lib/supabase';

export const authService = {
  // Login (Tetap sama)
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Register (UPDATE: Menambah field detail)
  register: async (email, password, fullName, detailData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'siswa',
          // Simpan data detail di metadata juga untuk backup/easy access
          jenjang: detailData.jenjang,
          kelas: detailData.kelas,
          whatsapp: detailData.whatsapp
        }
      }
    });

    if (error) throw error;
    
    // Kita perlu update tabel profiles manual karena trigger bawaan mungkin hanya simpan nama/email
    // (Opsional: Jika trigger SQL Anda sudah canggih, ini tidak perlu. Tapi untuk aman, kita update manual)
    if (data.user) {
        await supabase.from('profiles').update({
            jenjang: detailData.jenjang,
            kelas: detailData.kelas,
            whatsapp: detailData.whatsapp
        }).eq('id', data.user.id);
    }

    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role || 'siswa',
      name: profile?.full_name || session.user.email,
      // Return data detail juga
      jenjang: profile?.jenjang,
      kelas: profile?.kelas,
      whatsapp: profile?.whatsapp,
      avatar_url: profile?.avatar_url
    };
  }
};