import { supabase } from "../lib/supabase";

export const authService = {
  // --- LOGIN ---
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Validasi khusus jika akun belum verifikasi OTP
      if (error.message.includes("Email not confirmed")) {
        throw new Error("UNVERIFIED_ACCOUNT"); // Kita tangkap keyword ini di UI
      }
      throw error;
    }
    return data;
  },

  sendOtp: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
    return true;
  },

  verifyOtp: async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  },

  // --- REGISTER (PERBAIKAN VALIDASI) ---
  register: async (email, password, fullName, detailData) => {
    // 1. Cek User Baru via SignUp
    // PENTING: "Enable Email Enumeration Protection" di Supabase HARUS OFF agar ini error jika duplikat
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "siswa",
          jenjang: detailData.jenjang,
          kelas: detailData.kelas,
          whatsapp: detailData.whatsapp,
        },
      },
    });

    // 2. Tangkap Error Duplikat
    if (error) {
       // Cek berbagai kemungkinan pesan error dari Supabase
       const msg = error.message.toLowerCase();
       if (msg.includes("already registered") || msg.includes("unique constraint") || error.status === 422) {
           throw new Error("EMAIL_EXISTS"); // Keyword khusus untuk UI
       }
       throw error;
    }

    // 3. Jika user terbentuk (user ada, session null karena belum verify), kirim OTP
    if (data.user && !data.session) {
       // Kita gunakan signInWithOtp agar user menerima KODE ANGKA (bukan link)
       // untuk memverifikasi akun yang baru dibuat tadi.
       const { error: otpError } = await supabase.auth.signInWithOtp({
         email,
         options: { shouldCreateUser: false } 
       });
       
       if (otpError) {
         console.error("Gagal kirim OTP susulan:", otpError);
         // Opsional: throw error jika ingin strict
       }
    } else if (data.user && data.session) {
       // Edge case: Jika setting "Confirm Email" OFF, user langsung login.
       // Kita throw error agar developer sadar settingnya salah.
       throw new Error("SETTING_ERROR: Harap nyalakan 'Confirm Email' di Supabase.");
    }

    return data;
  },

  verifyRegistration: async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email", // Memverifikasi email & mengaktifkan akun
    });

    if (error) throw error;

    if (data.user) {
      const metadata = data.user.user_metadata;
      // Buat profile di database hanya setelah verifikasi sukses
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: metadata.full_name,
          role: "siswa",
          jenjang: metadata.jenjang,
          kelas: metadata.kelas,
          whatsapp: metadata.whatsapp,
          email: data.user.email,
          avatar_url: ""
        });
        
      if (profileError) console.error("Profile creation error:", profileError);
    }
    return data;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.code !== "session_not_found") throw error;
    return true;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    return {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role || "siswa",
      name: profile?.full_name || session.user.email,
      jenjang: profile?.jenjang,
      kelas: profile?.kelas,
      whatsapp: profile?.whatsapp,
      avatar_url: profile?.avatar_url,
    };
  },
};