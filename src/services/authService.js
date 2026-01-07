import { supabase } from "../lib/supabase";

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        throw new Error("UNVERIFIED_ACCOUNT");
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

    if (error) {
      if (
        error.code === "otp_disabled" ||
        error.message.includes("Signups not allowed")
      ) {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
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

  register: async (email, password, fullName, detailData) => {
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

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("unique constraint") ||
        error.status === 422
      ) {
        throw new Error("EMAIL_EXISTS");
      }
      throw error;
    }

    return data;
  },

  verifyRegistration: async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.code !== "session_not_found") throw error;
    return true;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("Warning fetching profile:", error.message);
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role || "siswa",
      name:
        profile?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email,
      jenjang: profile?.jenjang || "-",
      kelas: profile?.kelas || "-",
      whatsapp: profile?.whatsapp || "-",
      avatar_url: profile?.avatar_url || "",
    };
  },
};
