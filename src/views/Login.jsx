import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (esRegistro) {
        const res = await register(nombre, email, password);

        if (res.success) {
          alert("🎉 ¡Cuenta creada e inicio de sesión exitoso!");
          navigate("/");
        } else {
          setError(res.error || "No se pudo crear la cuenta.");
        }
      } else {
        const res = await login(email, password);

        if (res.success) {
          alert("🎉 ¡Bienvenido/a!");
          navigate("/");
        } else {
          setError(res.error || "Correo o contraseña incorrectos.");
        }
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = () => {
    setEsRegistro(!esRegistro);
    setError("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {esRegistro
            ? "📝 Crear Cuenta"
            : "👤 Iniciar Sesión"}
        </h2>

        <p style={styles.sub}>
          IRESM StickerLab
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {esRegistro && (
            <div>
              <label style={styles.label}>
                Nombre completo
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
          )}

          <div>
            <label style={styles.label}>
              Correo Electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={styles.input}
              placeholder="alumno@iresm.edu.ar"
              required
            />
          </div>

          <div>
            <label style={styles.label}>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={styles.input}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando
                ? "not-allowed"
                : "pointer",
            }}
            disabled={cargando}
          >
            {cargando
              ? "Procesando..."
              : esRegistro
                ? "Registrarse"
                : "Ingresar"}
          </button>
        </form>

        <div style={styles.toggleText}>
          {esRegistro
            ? "¿Ya tenés cuenta?"
            : "¿No tenés cuenta?"}

          <button
            type="button"
            onClick={cambiarModo}
            style={styles.toggleBtn}
          >
            {esRegistro
              ? " Iniciar Sesión"
              : " Registrarse"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem 1rem",
    boxSizing: "border-box",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  title: {
    margin: "0 0 0.2rem 0",
    color: "#0f172a",
    textAlign: "center",
  },

  sub: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 0,
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },

  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "0.6rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "1rem",
    border: "1px solid #fecaca",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  label: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#334155",
    marginBottom: "0.3rem",
  },

  input: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    outline: "none",
  },

  btn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "0.5rem",
  },

  toggleText: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#64748b",
    marginTop: "1.2rem",
  },

  toggleBtn: {
    color: "#2563eb",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    fontSize: "inherit",
  },
};