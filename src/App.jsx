import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Catalog from "./components/Catalog";
import CarritoDrawer from "./components/CarritoDrawer";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import { CarritoProvider } from "./context/CarritoContext";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

function LoginView() {
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
        const res = await register(
          nombre,
          email,
          password
        );

        if (res.success) {
          alert("🎉 ¡Cuenta creada!");
          navigate("/");
        } else {
          setError(
            res.error || "No se pudo crear la cuenta."
          );
        }
      } else {
        const res = await login(
          email,
          password
        );

        if (res.success) {
          alert("🎉 ¡Bienvenid@!");
          navigate("/");
        } else {
          setError(
            res.error || "Error al iniciar sesión."
          );
        }
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = () => {
    setEsRegistro(!esRegistro);
    setError("");
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <h2 style={styles.loginTitle}>
          {esRegistro
            ? "📝 Registro"
            : "👤 Iniciar Sesión"}
        </h2>

        <p style={styles.loginSub}>
          IRESM StickerLab
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={styles.loginForm}
        >
          {esRegistro && (
            <div style={styles.field}>
              <label style={styles.label}>
                Nombre Completo
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                placeholder="Juan Pérez"
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="alumno@iresm.edu.ar"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...styles.submitBtn,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {cargando
              ? "Procesando..."
              : esRegistro
                ? "Registrarse"
                : "Ingresar"}
          </button>
        </form>

        <button
          type="button"
          onClick={cambiarModo}
          style={styles.toggleBtn}
        >
          {esRegistro
            ? "¿Ya tenés cuenta? Iniciar Sesión"
            : "¿No tenés cuenta? Registrarse"}
        </button>
      </div>
    </div>
  );
}

function MainContent() {
  const [mostrarModalProducto, setMostrarModalProducto] =
    useState(false);

  const [nuevoNombre, setNuevoNombre] =
    useState("");

  const [nuevoPrecio, setNuevoPrecio] =
    useState("");

  const [nuevaDesc, setNuevaDesc] =
    useState("");

  const [nuevaImg, setNuevaImg] =
    useState("");

  const { user } = useAuth();

  const handleCrearProducto = async (e) => {
    e.preventDefault();

    if (!user?.es_admin) {
      alert(
        "Tenés que iniciar sesión como Administrador para crear productos."
      );
      return;
    }

    const token =
      localStorage.getItem("token") ||
      user?.token ||
      user?.access_token;

    if (!token) {
      alert(
        "No se encontró el token de autenticación."
      );
      return;
    }

    if (!nuevoNombre.trim()) {
      alert("Ingresá un nombre para el producto.");
      return;
    }

    if (!nuevoPrecio || Number(nuevoPrecio) <= 0) {
      alert("Ingresá un precio válido.");
      return;
    }

    const nuevoProducto = {
      nombre: nuevoNombre.trim(),
      descripcion:
        nuevaDesc.trim() ||
        "Sticker personalizado",
      precio_final: parseFloat(nuevoPrecio),
      cuotas_cantidad: 3,
      stock: 50,
      imagen_url:
        nuevaImg.trim() ||
        "https://via.placeholder.com/300x200?text=Sticker",
    };

    try {
      const response = await fetch(
        `${API_URL}/productos/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nuevoProducto),
        }
      );

      let errorData = null;

      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      if (!response.ok) {
        console.error(
          "Error del backend:",
          errorData
        );

        throw new Error(
          errorData?.detail ||
          errorData?.message ||
          "Error al crear producto."
        );
      }

      alert(
        "🎉 ¡Producto creado exitosamente!"
      );

      setNuevoNombre("");
      setNuevoPrecio("");
      setNuevaDesc("");
      setNuevaImg("");

      setMostrarModalProducto(false);

      window.location.reload();
    } catch (error) {
      console.error(
        "Error de conexión:",
        error
      );

      alert(
        error.message ||
        "No se pudo conectar con el backend."
      );
    }
  };

  return (
    <>
      <Navbar
        onAbrirCrearProducto={() =>
          setMostrarModalProducto(true)
        }
      />

      <Routes>
        <Route
          path="/"
          element={<Catalog />}
        />

        <Route
          path="/login"
          element={<LoginView />}
        />
      </Routes>

      <CarritoDrawer />

      {mostrarModalProducto &&
        user?.es_admin && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  ➕ Crear Nuevo Sticker (Admin)
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarModalProducto(false)
                  }
                  style={styles.closeBtn}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCrearProducto}
                style={styles.productForm}
              >
                <div>
                  <label style={styles.label}>
                    Nombre del producto
                  </label>

                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) =>
                      setNuevoNombre(
                        e.target.value
                      )
                    }
                    placeholder="Ej: Pack x20 Stickers F1"
                    style={styles.input}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Precio
                  </label>

                  <input
                    type="number"
                    value={nuevoPrecio}
                    onChange={(e) =>
                      setNuevoPrecio(
                        e.target.value
                      )
                    }
                    placeholder="4500"
                    min="0"
                    step="0.01"
                    style={styles.input}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Descripción
                  </label>

                  <textarea
                    value={nuevaDesc}
                    onChange={(e) =>
                      setNuevaDesc(
                        e.target.value
                      )
                    }
                    placeholder="Sticker vinilo impermeable..."
                    rows="3"
                    style={styles.textarea}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    URL de imagen
                  </label>

                  <input
                    type="url"
                    value={nuevaImg}
                    onChange={(e) =>
                      setNuevaImg(
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    style={styles.input}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="submit"
                    style={styles.saveBtn}
                  >
                    💾 Guardar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarModalProducto(false)
                    }
                    style={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CarritoProvider>
          <MainContent />
        </CarritoProvider>
      </AuthProvider>
    </Router>
  );
}

const styles = {
  loginContainer: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem 1rem",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },

  loginCard: {
    width: "100%",
    maxWidth: "380px",
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },

  loginTitle: {
    margin: "0 0 0.2rem 0",
    color: "#0f172a",
    textAlign: "center",
  },

  loginSub: {
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

  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  field: {
    display: "flex",
    flexDirection: "column",
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
  },

  textarea: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },

  submitBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "0.5rem",
  },

  toggleBtn: {
    display: "block",
    width: "100%",
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginTop: "1rem",
    padding: 0,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 2000,
  },

  modal: {
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "1.5rem",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.2rem",
    gap: "1rem",
  },

  modalTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.25rem",
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#64748b",
  },

  productForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  modalActions: {
    display: "flex",
    gap: "0.7rem",
    marginTop: "0.5rem",
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "0.7rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#64748b",
    color: "#ffffff",
    padding: "0.7rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};