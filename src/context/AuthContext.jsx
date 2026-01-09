// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydratedRef = useRef(false);

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
      role: rawRole?.toLowerCase() ?? "siswa",
      name: rawName,
      jenjang: profile?.jenjang,
      kelas: profile?.kelas,
      whatsapp: profile?.whatsapp,
      avatar_url: profile?.avatar_url || "",
    };
  };

  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("Profile fetch error:", error);
      }

      return data ?? null;
    } catch {
      return null;
    }
  };

  const hydrateUser = async (sessionUser) => {
    if (!sessionUser) return null;
    const profile = await getProfile(sessionUser.id);
    return formatUser(sessionUser, profile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user && !hydratedRef.current) {
          hydratedRef.current = true;

          setUser(formatUser(session.user));

          const fullUser = await hydrateUser(session.user);
          if (mounted && fullUser) setUser(fullUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        hydratedRef.current = false;
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
        return;
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser((prev) =>
          !prev || prev.id !== session.user.id
            ? formatUser(session.user)
            : prev
        );
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
      hydratedRef.current = true;
      setUser(await hydrateUser(data.user));
    }
    return data;
  };

  const register = (email, password, name, detailData) =>
    authService.register(email, password, name, detailData);

  const verifySignupOtp = async (email, token) => {
    const data = await authService.verifyRegistration(email, token);
    if (data.user) {
      hydratedRef.current = true;
      setUser(await hydrateUser(data.user));
    }
    return data;
  };

  const sendLoginOtp = (email) => authService.sendOtp(email);

  const verifyLoginOtp = async (email, token) => {
    const data = await authService.verifyOtp(email, token);
    if (data.user) {
      hydratedRef.current = true;
      setUser(await hydrateUser(data.user));
    }
    return data;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
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
    } finally {
      hydratedRef.current = false;
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  // ===== ENHANCEMENT =====
  const updateUserProfileData = async (formData, avatarFile) => {
    if (!user) return;

    let avatarUrl = user.avatar_url;

    if (avatarFile) {
      avatarUrl = await authService.uploadAvatar(user.id, avatarFile);
    }

    const updates = {
      full_name: formData.fullName,
      jenjang: formData.jenjang,
      kelas: formData.kelas,
      whatsapp: formData.whatsapp,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    await authService.updateProfile(user.id, updates);

    setUser((prev) => ({
      ...prev,
      name: updates.full_name,
      jenjang: updates.jenjang,
      kelas: updates.kelas,
      whatsapp: updates.whatsapp,
      avatar_url: updates.avatar_url,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifySignupOtp,
        sendLoginOtp,
        verifyLoginOtp,
        resetPassword,
        updateUserPassword,
        logout,
        updateUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
