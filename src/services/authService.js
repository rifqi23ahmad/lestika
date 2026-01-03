import { supabase } from "../lib/supabase";

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

    if (error) throw error;

    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          jenjang: detailData.jenjang,
          kelas: detailData.kelas,
          whatsapp: detailData.whatsapp,
        })
        .eq("id", data.user.id);
    }

    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error && error.code !== "session_not_found") {
      throw error;
    }

    return true;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
