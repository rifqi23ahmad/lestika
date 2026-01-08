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
          if (mounted && fullUser) {
            setUser(fullUser);
          }
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
        setUser((prev) => {
          if (!prev || prev.id !== session.user.id) {
            return formatUser(session.user);
          }
          return prev;
        });
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
      const fullUser = await hydrateUser(data.user);
      setUser(fullUser);
    }

    return data;
  };

  const register = (email, password, name, detailData) =>
    authService.register(email, password, name, detailData);

  const verifySignupOtp = async (email, token) => {
    const data = await authService.verifyRegistration(email, token);

    if (data.user) {
      hydratedRef.current = true;
      const fullUser = await hydrateUser(data.user);
      setUser(fullUser);
    }

    return data;
  };

  const sendLoginOtp = (email) => authService.sendOtp(email);

  const verifyLoginOtp = async (email, token) => {
    const data = await authService.verifyOtp(email, token);

    if (data.user) {
      hydratedRef.current = true;
      const fullUser = await hydrateUser(data.user);
      setUser(fullUser);
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
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
