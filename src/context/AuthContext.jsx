import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const lastUserId = useRef(null);

  const getBasicUser = (authUser) => ({
    id: authUser.id,
    email: authUser.email,
    role: authUser.user_metadata?.role || "siswa",
    name: authUser.user_metadata?.name || authUser.email,
    isPartial: true,
  });

  const fetchProfileAndSetUser = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      const fullUser = {
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || authUser.user_metadata?.role || "siswa",
        name:
          profile?.full_name || authUser.user_metadata?.name || authUser.email,
        jenjang: profile?.jenjang,
        kelas: profile?.kelas,
        whatsapp: profile?.whatsapp,
        isPartial: false,
      };

      setUser(fullUser);
      lastUserId.current = authUser.id; // Simpan ID user yang sudah di-load
    } catch (err) {
      console.warn("Gagal mengambil profil, menggunakan data dasar:", err);
      setUser((prev) =>
        prev ? { ...prev, isPartial: true } : getBasicUser(authUser)
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const hasLocalToken = Object.keys(sessionStorage).some(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );

        if (!hasLocalToken) {
          if (mounted) {
            setUser(null);
            setLoading(false);
            lastUserId.current = null;
          }
          return;
        }

        const sessionData = await authService.getSession();

        if (sessionData?.user && mounted) {
          if (lastUserId.current !== sessionData.user.id) {
            setUser(getBasicUser(sessionData.user));
            await fetchProfileAndSetUser(sessionData.user);
          }
        } else {
          if (mounted) {
            setUser(null);
            lastUserId.current = null;
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        if (mounted) {
          setUser(null);
          lastUserId.current = null;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            if (lastUserId.current === session.user.id) {
              setLoading(false);
              return;
            }

            setUser(getBasicUser(session.user));
            await fetchProfileAndSetUser(session.user);
          }
          setLoading(false);
        } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          setUser(null);
          lastUserId.current = null;
          setLoading(false);
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
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      lastUserId.current = null;
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
