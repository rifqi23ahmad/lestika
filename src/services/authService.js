import { supabase } from "../lib/supabase";

export const authService = {
  async login(email, password) {
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

  async sendOtp(email) {
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

  async verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  },

  async register(email, password, fullName, detailData) {
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

  async verifyRegistration(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error && error.code !== "session_not_found") throw error;
    return true;
  },

  async getSession() {
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

  async uploadAvatar(userId, file) {
    if (!file) throw new Error("NO_FILE");

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    return data.publicUrl;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    if (updates.full_name) {
      await supabase.auth.updateUser({
        data: { full_name: updates.full_name },
      });
    }

    return data;
  },
};
