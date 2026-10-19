import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get("modo") === "registro";

  const [esRegistro, setEsRegistro] = useState(initialMode);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceptoTratamiento, setAceptoTratamiento] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login, register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (esRegistro) {
        if (!aceptoTratamiento) {
          setError("Debes aceptar el tratamiento de datos personales para registrarte.");
          setCargando(false);
          return;
        }

        const res = await register({
          nombre,
          email,
          password,
          rol: "cliente", // 🔒 Siempre rol cliente
          acepto_tratamiento: aceptoTratamiento,
        });

        if (res.success) {
          success(`🎉 ¡Cuenta creada con éxito! Bienvenido, ${nombre}`);
          navigate("/");
        } else {
          setError(res.error || "No se pudo crear la cuenta.");
          toastError(res.error || "No se pudo crear la cuenta.");
        }
      } else {
        const res = await login(email, password);

        if (res.success) {
          success(`🎉 ¡Bienvenido/a ${res.user?.nombre || ""}!`);
          if (res.user?.es_admin || res.user?.rol === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          setError(res.error || "Correo o contraseña incorrectos.");
          toastError(res.error || "Error al iniciar sesión.");
        }
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("No se pudo conectar con el servidor.");
      toastError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = (nuevoModo) => {
    setEsRegistro(nuevoModo);
    setError("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandBadge}>
          <span>✨ STICKER LAB AUTH</span>
        </div>

        <h2 style={styles.title}>
          {esRegistro ? "Crear Nueva Cuenta" : "Iniciar Sesión"}
        </h2>
        <p style={styles.subtitle}>
          {esRegistro
            ? "Únete para comprar tus stickers favoritos"
            : "Ingresa tus credenciales para acceder a tu cuenta"}
        </p>

        <div style={styles.modeSwitcher}>
          <button
            type="button"
            onClick={() => cambiarModo(false)}
            style={{
              ...styles.switchBtn,
              ...(!esRegistro ? styles.switchBtnActive : {}),
            }}
          >
            👤 Ingresar
          </button>
          <button
            type="button"
            onClick={() => cambiarModo(true)}
            style={{
              ...styles.switchBtn,
              ...(esRegistro ? styles.switchBtnActive : {}),
            }}
          >
            📝 Registrarse
          </button>
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {esRegistro && (
            <div style={styles.field}>
              <label style={styles.label}>Nombre Completo *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={styles.input}
                placeholder="Ej: Martín Rodríguez"
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Correo Electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="alumno@iresm.edu.ar"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </div>

          {esRegistro && (
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="consentimiento_check"
                checked={aceptoTratamiento}
                onChange={(e) => setAceptoTratamiento(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="consentimiento_check" style={styles.checkboxLabel}>
                Acepto el tratamiento de datos personales conforme a la ley de privacidad vigente. *
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...styles.submitBtn,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando
              ? "Procesando solicitud..."
              : esRegistro
                ? "Crear Cuenta"
                : "Iniciar Sesión"}
          </button>
        </form>

        <div style={styles.footerNote}>
          <Link to="/" style={styles.backLink}>
            ← Volver al Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "75vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3.5rem 1.5rem",
  },
  card: {
    backgroundColor: "#131b2e",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2.5rem 2rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)",
  },
  brandBadge: {
    display: "inline-block",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    color: "#a5b4fc",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    marginBottom: "1rem",
  },
  title: {
    margin: "0 0 0.35rem 0",
    color: "#ffffff",
    fontSize: "1.6rem",
    fontWeight: "900",
    fontFamily: "var(--font-heading)",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 0,
    marginBottom: "1.5rem",
    fontSize: "0.88rem",
    lineHeight: "1.4",
  },
  modeSwitcher: {
    display: "flex",
    backgroundColor: "rgba(9, 13, 22, 0.6)",
    padding: "0.3rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  switchBtn: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#94a3b8",
    padding: "0.55rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  switchBtnActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#cbd5e1",
  },
  input: {
    backgroundColor: "rgba(9, 13, 22, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    padding: "0.7rem 0.9rem",
    color: "#ffffff",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    marginTop: "0.25rem",
  },
  checkbox: {
    marginTop: "0.2rem",
    cursor: "pointer",
  },
  checkboxLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    lineHeight: "1.4",
    cursor: "pointer",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.85rem",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
    marginTop: "0.5rem",
  },
  footerNote: {
    marginTop: "1.5rem",
    textAlign: "center",
  },
  backLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
};