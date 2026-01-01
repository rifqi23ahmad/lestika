import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getBasicUser = (authUser) => ({
    id: authUser.id,
    email: authUser.email,
    role: "siswa",
    name: authUser.user_metadata?.name || authUser.email,
    isPartial: true,
  });

  const getEnrichedUser = async (authUser) => {
    if (!authUser) return null;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      return {
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || "siswa",
        name:
          profile?.full_name || authUser.user_metadata?.name || authUser.email,
        jenjang: profile?.jenjang,
        kelas: profile?.kelas,
        whatsapp: profile?.whatsapp,
        isPartial: false,
      };
    } catch (err) {
      console.warn("Profile load failed, using basic:", err);
      return getBasicUser(authUser);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const hasLocalToken = Object.keys(localStorage).some(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );

        if (!hasLocalToken) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const sessionData = await authService.getSession();

        if (sessionData && mounted) {
          setUser(getBasicUser(sessionData)); // UI Instant Load
          getEnrichedUser(sessionData).then((fullUser) => {
            if (mounted) setUser(fullUser);
          });
        }
      } catch (error) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_IN" && session?.user) {
          setUser(getBasicUser(session.user));
          getEnrichedUser(session.user).then((fullUser) => {
            if (mounted) setUser(fullUser);
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = (email, password) => authService.login(email, password);
  const register = (email, password, name, detailData) =>
    authService.register(email, password, name, detailData);
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
