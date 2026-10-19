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

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
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

      const accessToken = data.access_token || data.token || "";
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
      }

      const rawUser = data.user || data.usuario || data;
      const esAdmin = Boolean(
        rawUser.es_admin ||
        rawUser.is_admin ||
        rawUser.rol === "admin" ||
        rawUser.role === "admin"
      );

      const usuarioCompleto = {
        ...rawUser,
        token: accessToken,
        es_admin: esAdmin,
        rol: rawUser.rol || (esAdmin ? "admin" : "cliente"),
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

      const usuarioRegistrado = data.user || data.usuario || data;
      const accessToken = data.access_token || data.token || "";

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
      }

      const esAdmin = Boolean(
        usuarioRegistrado.es_admin ||
        usuarioRegistrado.is_admin ||
        usuarioRegistrado.rol === "admin" ||
        payload.rol === "admin"
      );

      const usuarioCompleto = {
        ...usuarioRegistrado,
        token: accessToken,
        es_admin: esAdmin,
        rol: usuarioRegistrado.rol || (esAdmin ? "admin" : "cliente"),
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

  const esAdmin = Boolean(
    user?.es_admin ||
    user?.is_admin ||
    user?.rol === "admin" ||
    user?.role === "admin"
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        esAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};