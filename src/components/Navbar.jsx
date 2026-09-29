import React from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onAbrirCrearProducto }) {
  const { totalItems, setMostrarModal } = useCarrito();
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      {/* Logo / Marca */}
      <Link to="/" style={styles.brand}>
        🏷️ Sticker Store
      </Link>

      {/* Navegación */}
      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          📦 Catálogo
        </Link>

        {/* Botón exclusivo para administradores */}
        {user && user.es_admin && (
          <button
            type="button"
            onClick={onAbrirCrearProducto}
            style={styles.adminBtn}
          >
            ➕ Crear Producto
          </button>
        )}

        {/* Usuario */}
        {user ? (
          <>
            <span style={styles.userName}>
              {user.es_admin
                ? `👑 ${user.nombre} (Admin)`
                : `👤 ${user.nombre}`}
            </span>

            <button
              type="button"
              onClick={logout}
              style={styles.userBtn}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>
            👤 Mi Cuenta
          </Link>
        )}

        {/* Carrito */}
        <button
          type="button"
          onClick={() => setMostrarModal(true)}
          style={styles.cartBtn}
        >
          🛒 Carrito ({totalItems})
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#0f172a",
    color: "#fff",
    gap: "1rem",
    flexWrap: "wrap",
  },

  brand: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#fff",
    textDecoration: "none",
  },

  links: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },

  link: {
    color: "#f8fafc",
    textDecoration: "none",
    fontWeight: "500",
  },

  adminBtn: {
    backgroundColor: "#f59e0b",
    color: "#0f172a",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  userName: {
    color: "#f8fafc",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  userBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#cbd5e1",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },

  cartBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};