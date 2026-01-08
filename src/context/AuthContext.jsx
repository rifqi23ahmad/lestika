import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";
import { APP_CONFIG } from "../config/constants"; // Pastikan import ini ada

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (sessionUser, profile = null) => {
    if (!sessionUser) return null;

    const identityData = sessionUser.identities?.[0]?.identity_data || {};

    const rawRole =
      profile?.role ||
      sessionUser.user_metadata?.role ||
      identityData?.role ||
      sessionUser.app_metadata?.role;

    const validRoles = Object.values(APP_CONFIG.ROLES); // ['admin', 'guru', 'siswa']
    let finalRole = "siswa";

    if (rawRole && validRoles.includes(rawRole.toLowerCase())) {
      finalRole = rawRole.toLowerCase();
    }

    const rawName =
      profile?.full_name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      identityData?.full_name ||
      sessionUser.email;

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      role: finalRole,
      name: rawName,
      jenjang: profile?.jenjang || identityData?.jenjang,
      kelas: profile?.kelas || identityData?.kelas,
      whatsapp: profile?.whatsapp || identityData?.whatsapp,
    };
  };

  const getProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    } catch (err) {
      return null;
    }
  };

  const fetchUserFromServer = async () => {
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !authUser) {
        return null;
      }

      const profile = await getProfile(authUser.id);
      return formatUser(authUser, profile);
    } catch (error) {
      console.error("Fetch user error:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const serverUser = await fetchUserFromServer();

        if (mounted) {
          setUser(serverUser);

          if (!serverUser) {
            await supabase.auth.signOut();
            localStorage.clear();
          }
        }
      } catch (err) {
        if (mounted) setUser(null);
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
          const profile = await getProfile(session.user.id);
          setUser(formatUser(session.user, profile));
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        sessionStorage.clear();
        localStorage.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.user) {
      const profile = await getProfile(data.user.id);
      setUser(formatUser(data.user, profile));
    }
    return data;
  };

  const register = (email, password, name, detailData) =>
    authService.register(email, password, name, detailData);

  const verifySignupOtp = async (email, token) => {
    const data = await authService.verifyRegistration(email, token);
    if (data.user) {
      const profile = await getProfile(data.user.id);
      setUser(formatUser(data.user, profile));
    }
    return data;
  };

  const sendLoginOtp = async (email) => authService.sendOtp(email);

  const verifyLoginOtp = async (email, token) => {
    const data = await authService.verifyOtp(email, token);
    if (data.user) {
      const profile = await getProfile(data.user.id);
      setUser(formatUser(data.user, profile));
    }
    return data;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update-password",
    });
    if (error) throw error;
  };

  const updateUserPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    await logout();
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
        login,
        register,
        verifySignupOtp,
        sendLoginOtp,
        verifyLoginOtp,
        resetPassword,
        updateUserPassword,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
