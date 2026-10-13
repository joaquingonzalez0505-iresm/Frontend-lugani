import React, {
  createContext,
  useContext,
  useState,
} from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Error al iniciar sesión"
        );
      }

      if (data.access_token) {
        localStorage.setItem(
          "token",
          data.access_token
        );
      }

      const usuarioCompleto = {
        ...(data.user || {}),
        token: data.access_token,
      };

      setUser(usuarioCompleto);

      return {
        success: true,
        user: usuarioCompleto,
      };
    } catch (err) {
      console.error(
        "Error al iniciar sesión:",
        err
      );

      return {
        success: false,
        error:
          err.message ||
          "Error al iniciar sesión",
      };
    }
  };

  const register = async (
    nombre,
    email,
    password
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Error en el registro"
        );
      }

      const usuarioRegistrado =
        data.user || data;

      if (data.access_token) {
        localStorage.setItem(
          "token",
          data.access_token
        );
      }

      const usuarioCompleto = {
        ...usuarioRegistrado,
        ...(data.access_token
          ? { token: data.access_token }
          : {}),
      };

      setUser(usuarioCompleto);

      return {
        success: true,
        user: usuarioCompleto,
      };
    } catch (err) {
      console.error(
        "Error en el registro:",
        err
      );

      return {
        success: false,
        error:
          err.message ||
          "Error en el registro",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};