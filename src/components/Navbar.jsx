import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onAbrirCrearProducto }) {
  const { totalItems, setMostrarModal } = useCarrito();
  const { user, esAdmin, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [badgeAnim, setBadgeAnim] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Bouncing effect on cart badge update
  useEffect(() => {
    if (totalItems > 0) {
      setBadgeAnim(true);
      const timer = setTimeout(() => setBadgeAnim(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (esAdmin) {
      navigate("/admin");
    } else {
      // Directs to admin panel which displays the role guard / admin login
      navigate("/admin");
    }
  };

  const handleCerrarSesion = () => {
    logout();
    setMenuAbierto(false);
    navigate("/");
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand / Logo */}
        <Link to="/" style={styles.brand}>
          <div style={styles.brandIcon}>
            <span>✨</span>
          </div>
          <div style={styles.brandText}>
            <span style={styles.brandName}>STICKER<span style={styles.brandAccent}>LAB</span></span>
            <span style={styles.brandTagline}>STUDIO PRO</span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav style={styles.navLinks}>
          <Link
            to="/"
            style={{
              ...styles.navLink,
              ...(isCurrent("/") ? styles.navLinkActive : {}),
            }}
          >
            📦 Catálogo
          </Link>

          <Link
            to="/arrepentimiento"
            style={{
              ...styles.navLink,
              ...(isCurrent("/arrepentimiento") ? styles.navLinkActive : {}),
            }}
          >
            🛡️ Revocación (10d)
          </Link>

          {/* Botón destacado "Panel de Administración" visible en cabecera */}
          <button
            type="button"
            onClick={handleAdminClick}
            style={{
              ...styles.adminPanelBtn,
              ...(esAdmin ? styles.adminPanelBtnActive : {}),
            }}
            title={esAdmin ? "Acceder a tu Panel de Administrador" : "Acceso al Panel de Administración"}
          >
            <span style={styles.adminIcon}>👑</span>
            <span>Panel de Administración</span>
            {esAdmin && <span style={styles.adminLiveBadge}>ACTIVO</span>}
          </button>
        </nav>

        {/* Right Actions: Auth & Cart */}
        <div style={styles.actionsGroup}>
          {user ? (
            <div style={styles.userMenuContainer} ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={styles.userAvatarBtn}
                aria-expanded={menuAbierto}
              >
                <div style={styles.avatarCircle}>
                  {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                </div>
                <div style={styles.userInfoCol}>
                  <span style={styles.userNameText}>{user.nombre || "Usuario"}</span>
                  <span style={esAdmin ? styles.roleBadgeAdmin : styles.roleBadgeClient}>
                    {esAdmin ? "ADMIN" : "CLIENTE"}
                  </span>
                </div>
                <span style={styles.arrowIcon}>{menuAbierto ? "▲" : "▼"}</span>
              </button>

              {menuAbierto && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownUser}>{user.nombre}</p>
                    <p style={styles.dropdownEmail}>{user.email || "usuario@stickerlab.com"}</p>
                    <span style={esAdmin ? styles.dropdownRoleAdmin : styles.dropdownRoleClient}>
                      Rol: {esAdmin ? "Administrador" : "Cliente"}
                    </span>
                  </div>

                  <div style={styles.dropdownDivider} />

                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMenuAbierto(false)}
                    style={styles.dropdownItem}
                  >
                    📦 Mis Pedidos
                  </Link>

                  <Link
                    to="/mis-datos"
                    onClick={() => setMenuAbierto(false)}
                    style={styles.dropdownItem}
                  >
                    👤 Mis Datos & Privacidad
                  </Link>

                  {esAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuAbierto(false)}
                      style={{ ...styles.dropdownItem, ...styles.dropdownItemAdmin }}
                    >
                      ⚙️ Dashboard Administrativo
                    </Link>
                  )}

                  <div style={styles.dropdownDivider} />

                  <button
                    type="button"
                    onClick={handleCerrarSesion}
                    style={styles.dropdownLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              <span>👤</span> Iniciar Sesión
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            style={styles.cartButton}
            aria-label="Ver Carrito de Compras"
          >
            <span style={styles.cartIcon}>🛒</span>
            <span style={styles.cartLabel}>Carrito</span>
            <span
              style={{
                ...styles.cartBadge,
                ...(badgeAnim ? styles.cartBadgeBounce : {}),
              }}
            >
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(9, 13, 22, 0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
  },
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "0.85rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.2rem",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textDecoration: "none",
    color: "#fff",
  },
  brandIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    boxShadow: "0 0 16px rgba(99, 102, 241, 0.5)",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
  },
  brandName: {
    fontSize: "1.25rem",
    fontWeight: "900",
    letterSpacing: "-0.03em",
    lineHeight: "1.1",
    color: "#ffffff",
    fontFamily: "var(--font-heading)",
  },
  brandAccent: {
    color: "#ec4899",
  },
  brandTagline: {
    fontSize: "0.65rem",
    letterSpacing: "0.18em",
    fontWeight: "700",
    color: "#94a3b8",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  navLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.92rem",
    padding: "0.5rem 0.85rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  navLinkActive: {
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  adminPanelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.18) 100%)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.45)",
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 10px rgba(245, 158, 11, 0.15)",
  },
  adminPanelBtnActive: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#090d16",
    borderColor: "#f59e0b",
    boxShadow: "0 0 16px rgba(245, 158, 11, 0.4)",
  },
  adminIcon: {
    fontSize: "1rem",
  },
  adminLiveBadge: {
    backgroundColor: "#090d16",
    color: "#f59e0b",
    fontSize: "0.65rem",
    fontWeight: "900",
    padding: "0.15rem 0.45rem",
    borderRadius: "999px",
    letterSpacing: "0.05em",
  },
  actionsGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  loginBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  },
  userMenuContainer: {
    position: "relative",
  },
  userAvatarBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "0.35rem 0.75rem 0.35rem 0.35rem",
    borderRadius: "999px",
    cursor: "pointer",
    color: "#fff",
    transition: "all 0.2s ease",
  },
  avatarCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "0.85rem",
  },
  userInfoCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    lineHeight: "1.2",
  },
  userNameText: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#f8fafc",
    maxWidth: "110px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  roleBadgeAdmin: {
    fontSize: "0.65rem",
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: "0.04em",
  },
  roleBadgeClient: {
    fontSize: "0.65rem",
    fontWeight: "700",
    color: "#94a3b8",
  },
  arrowIcon: {
    fontSize: "0.6rem",
    color: "#94a3b8",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "240px",
    backgroundColor: "#131b2e",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "14px",
    padding: "0.6rem",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
    zIndex: 200,
    animation: "fadeIn 0.2s ease",
  },
  dropdownHeader: {
    padding: "0.6rem 0.8rem",
  },
  dropdownUser: {
    margin: 0,
    fontWeight: "800",
    color: "#f8fafc",
    fontSize: "0.95rem",
  },
  dropdownEmail: {
    margin: "0.15rem 0 0.4rem 0",
    fontSize: "0.78rem",
    color: "#64748b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownRoleAdmin: {
    display: "inline-block",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
  },
  dropdownRoleClient: {
    display: "inline-block",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    color: "#a5b4fc",
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    margin: "0.4rem 0",
  },
  dropdownItem: {
    display: "block",
    padding: "0.55rem 0.8rem",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "background 0.15s ease",
  },
  dropdownItemAdmin: {
    color: "#fbbf24",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
  },
  dropdownLogout: {
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "0.55rem 0.8rem",
    color: "#fda4af",
    fontSize: "0.88rem",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background 0.15s ease",
  },
  cartButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.55rem",
    backgroundColor: "#6366f1",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.55rem 1.15rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.92rem",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
    transition: "all 0.2s ease",
  },
  cartIcon: {
    fontSize: "1.1rem",
  },
  cartLabel: {
    display: "inline-block",
  },
  cartBadge: {
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    fontWeight: "900",
    fontSize: "0.78rem",
    padding: "0.15rem 0.5rem",
    borderRadius: "999px",
    minWidth: "20px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
  },
  cartBadgeBounce: {
    transform: "scale(1.3)",
  },
};