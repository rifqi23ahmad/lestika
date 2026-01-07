import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk format data user
  const formatUser = (sessionUser, profile = null) => {
    const rawRole =
      profile?.role ||
      sessionUser.user_metadata?.role ||
      sessionUser.app_metadata?.role;

    const rawName =
      profile?.full_name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email;

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      role: rawRole ? rawRole.toLowerCase() : "siswa",
      name: rawName,
      jenjang: profile?.jenjang,
      kelas: profile?.kelas,
      whatsapp: profile?.whatsapp,
    };
  };

  // Helper untuk ambil data profile dari DB
  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116")
        console.warn("Profile fetch error:", error);
      return data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (mounted) setUser(formatUser(session.user));

          const profile = await getProfile(session.user.id);
          if (mounted && profile) {
            setUser(formatUser(session.user, profile));
          }
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser((prev) => {
            if (event === "TOKEN_REFRESHED") return formatUser(session.user);
            return prev || formatUser(session.user);
          });
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        sessionStorage.clear();
        localStorage.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- LOGIN BIASA ---
  const login = async (email, password) => {
    const data = await authService.login(email, password);

    if (data.user) {
      const profile = await getProfile(data.user.id);
      const fixedUser = formatUser(data.user, profile);
      setUser(fixedUser);
    }

    return data;
  };

  // --- LOGIN OTP ---
  const sendLoginOtp = (email) => authService.sendOtp(email);

  const verifyLoginOtp = async (email, token) => {
    const data = await authService.verifyOtp(email, token);

    if (data.user) {
      const profile = await getProfile(data.user.id);
      const fixedUser = formatUser(data.user, profile);
      setUser(fixedUser);
    }
    return data;
  };

  // --- REGISTER ---
  const register = (email, password, name, detailData) =>
    authService.register(email, password, name, detailData);

  // --- VERIFIKASI SIGNUP (Ini yang error "is not a function" sebelumnya) ---
  const verifySignupOtp = async (email, token) => {
    const data = await authService.verifyRegistration(email, token);

    if (data.user) {
      const profile = await getProfile(data.user.id);
      const fixedUser = formatUser(data.user, profile);
      setUser(fixedUser);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error (ignored):", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        sendLoginOtp,    // Pastikan ini ada
        verifyLoginOtp,  // Pastikan ini ada
        verifySignupOtp, // Pastikan ini ada
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);