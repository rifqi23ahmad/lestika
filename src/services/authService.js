import { supabase } from '../lib/supabaseClient';

export const authService = {
  login: async (phone, password) => {
    const email = `${phone.trim()}@mapa.com`;
    return await supabase.auth.signInWithPassword({ email, password });
  },

  register: async (data) => {
    const email = `${data.phone.trim()}@mapa.com`;
    return await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          full_name: data.nama,
          phone: data.phone,
          jenjang: data.jenjang,
          kelas: data.kelas,
          usia: data.usia,
          nama_orang_tua: data.namaOrangTua
        }
      }
    });
  },

  logout: async () => {
    return await supabase.auth.signOut();
  },

  getUserProfile: async (userId) => {
    return await supabase.from('profiles').select('*').eq('id', userId).single();
  }
};