import React, {
  createContext,
  useContext,
  useState,
} from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Inicialización mejorada para asegurar la recuperación del token
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) return savedToken;
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser).token || "" : "";
    } catch {
      return "";
    }
  });

  const login = async (email, password) => {
    try {
      let res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Error al iniciar sesión"
        );
      }

      const response = { data };
      localStorage.setItem('token', response.data.access_token || response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data.usuario || response.data));

      const accessToken = response.data.access_token || response.data.token || "";
      setToken(accessToken);

      const rawUser = response.data.user || response.data.usuario || response.data;
      const isAdmin = rawUser?.rol === 'admin' || rawUser?.role === 'admin' || rawUser?.is_admin === true || rawUser?.es_admin === true;

      const usuarioCompleto = {
        ...rawUser,
        token: accessToken,
        es_admin: isAdmin,
        is_admin: isAdmin,
        isAdmin: isAdmin,
        rol: rawUser.rol || (isAdmin ? "admin" : "cliente"),
        role: rawUser.role || (isAdmin ? "admin" : "cliente"),
      };

      setUser(usuarioCompleto);
      localStorage.setItem("user", JSON.stringify(usuarioCompleto));

      return {
        success: true,
        user: usuarioCompleto,
      };
    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      return {
        success: false,
        error: err.message || "Error al iniciar sesión",
      };
    }
  };

  const register = async (nombreOrObj, email, password, rol = "cliente") => {
    try {
      let payload;
      if (typeof nombreOrObj === "object" && nombreOrObj !== null) {
        payload = nombreOrObj;
      } else {
        payload = {
          nombre: nombreOrObj,
          email,
          password,
          rol,
          acepto_tratamiento: true,
        };
      }

      let res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Error en el registro"
        );
      }

      const response = { data };
      localStorage.setItem('token', response.data.access_token || response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data.usuario || response.data));

      const usuarioRegistrado = response.data.user || response.data.usuario || response.data;
      const accessToken = response.data.access_token || response.data.token || "";

      if (accessToken) {
        setToken(accessToken);
      }

      const isAdmin = usuarioRegistrado?.rol === 'admin' || usuarioRegistrado?.role === 'admin' || usuarioRegistrado?.is_admin === true || usuarioRegistrado?.es_admin === true || payload.rol === 'admin';

      const usuarioCompleto = {
        ...usuarioRegistrado,
        token: accessToken,
        es_admin: isAdmin,
        is_admin: isAdmin,
        isAdmin: isAdmin,
        rol: usuarioRegistrado.rol || (isAdmin ? "admin" : "cliente"),
        role: usuarioRegistrado.role || (isAdmin ? "admin" : "cliente"),
      };

      setUser(usuarioCompleto);
      localStorage.setItem("user", JSON.stringify(usuarioCompleto));

      return {
        success: true,
        user: usuarioCompleto,
      };
    } catch (err) {
      console.error("Error en el registro:", err);

      return {
        success: false,
        error: err.message || "Error en el registro",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
  };

  const isAdmin = Boolean(
    user?.rol === 'admin' ||
    user?.role === 'admin' ||
    user?.is_admin === true ||
    user?.es_admin === true
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        esAdmin: isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};