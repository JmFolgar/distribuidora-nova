import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  setToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarSesion = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      setUsuario(res.data);
    } catch {
      clearToken();
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);

  const login = useCallback(async (correo, contrasena) => {
    const res = await apiLogin(correo, contrasena);
    setToken(res.data.token);
    setUsuario(res.data.usuario);
    return res.data.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) {
        await apiLogout();
      }
    } catch {
      // El token se limpia de todas formas
    } finally {
      clearToken();
      setUsuario(null);
    }
  }, []);

  /** Vuelve a consultar /auth/me (p. ej. tras editar el usuario de la sesión). */
  const refrescarUsuario = useCallback(async () => {
    if (!getToken()) return null;
    const res = await getMe();
    setUsuario(res.data);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      loading,
      isAuthenticated: Boolean(usuario),
      login,
      logout,
      refrescarUsuario,
    }),
    [usuario, loading, login, logout, refrescarUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
