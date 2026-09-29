import React, {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch(
        "http://localhost:8000/auth/login",
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

      // Guardar token para futuras peticiones
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
        "http://localhost:8000/auth/register",
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

      // Si el registro devuelve token,
      // también lo guardamos.
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