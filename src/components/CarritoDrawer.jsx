import React, { useState, useEffect } from "react";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export default function CarritoDrawer() {
  const {
    carrito,
    mostrarModal,
    setMostrarModal,
    cambiarCantidad,
    eliminarDelCarrito,
    totalPrecio,
    vaciarCarrito,
  } = useCarrito();

  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();

  const [nombreCliente, setNombreCliente] = useState(user?.nombre || "");
  const [procesando, setProcesando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(false);

  // Sincroniza dinámicamente el nombre del cliente con el usuario actualmente autenticado
  useEffect(() => {
    setNombreCliente(user?.nombre || "");
  }, [user]);

  // Cierra con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mostrarModal) {
        setMostrarModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarModal, setMostrarModal]);

  if (!mostrarModal) return null;

  const handleRealizarPedido = async (e) => {
    e.preventDefault();
    if (!carrito || carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const authToken = token || localStorage.getItem("token") || user?.token || user?.access_token;
    const clienteFinal = nombreCliente.trim() || user?.nombre || "Cliente Web";

    const pedidoData = {
      nombre_cliente: clienteFinal,
      items: carrito.map((item) => ({
        id: item.id,
        producto_id: item.id,
        nombre: item.nombre,
        precio_final: parseFloat(item.precio_final || item.precio || 0),
        cantidad: parseInt(item.cantidad || 1),
      })),
      total: parseFloat(totalPrecio || 0),
    };

    setProcesando(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/pedidos/`, {
        method: "POST",
        headers,
        body: JSON.stringify(pedidoData),
      });

      if (response.ok) {
        setPedidoExitoso(true);
        success("🎉 ¡Pedido registrado y guardado en la Base de Datos!");

        if (vaciarCarrito) {
          vaciarCarrito();
        }

        setTimeout(() => {
          setPedidoExitoso(false);
          setMostrarModal(false);
        }, 2200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error del backend al crear pedido:", errorData);
        const msg = errorData.detail || errorData.message || "Verificá los datos del pedido.";
        toastError(`Error: ${msg}`);
        alert("Error al procesar la compra: " + msg);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      toastError("No se pudo conectar con el servidor.");
      alert("No se pudo conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  const totalNum = Number(totalPrecio || 0);

  return (
    <div style={styles.overlay}>
      {/* Fondo oscuro */}
      <div
        style={styles.backdrop}
        onClick={() => setMostrarModal(false)}
        aria-hidden="true"
      />

      {/* Drawer deslizante */}
      <aside style={styles.drawer} role="dialog" aria-modal="true" aria-label="Carrito de compras">
        {/* Cabecera */}
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <div style={styles.cartIconWrapper}>🛒</div>
            <div>
              <h2 style={styles.drawerTitle}>Tu Carrito</h2>
              <p style={styles.drawerSubtitle}>
                {carrito.length} {carrito.length === 1 ? "artículo" : "artículos"} seleccionados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMostrarModal(false)}
            style={styles.closeBtn}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        {pedidoExitoso ? (
          <div style={styles.successBox}>
            <span style={styles.successEmoji}>🎉</span>
            <h3 style={styles.successTitle}>¡Pedido Confirmado!</h3>
            <p style={styles.successText}>
              Tu orden ha sido registrada en la base de datos de Render a nombre de <strong>{nombreCliente}</strong>.
            </p>
            <div style={styles.successPill}>Guardado en PostgreSQL</div>
          </div>
        ) : (
          <>
            <div style={styles.body}>
              {carrito.length === 0 ? (
                <div style={styles.emptyContainer}>
                  <span style={styles.emptyIcon}>🛍️</span>
                  <h4 style={styles.emptyTitle}>Tu carrito está vacío</h4>
                  <p style={styles.emptySubtitle}>
                    Explora el catálogo y agrega tus stickers favoritos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    style={styles.emptyBtn}
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div style={styles.itemsList}>
                  {carrito.map((item) => {
                    const precioItem = Number(item.precio_final ?? item.precio ?? 0);
                    return (
                      <div key={item.id} style={styles.itemRow}>
                        <div style={styles.itemImg}>
                          {item.imagen_url || item.imagen ? (
                            <img
                              src={
                                (item.imagen_url || item.imagen).startsWith("http")
                                  ? item.imagen_url || item.imagen
                                  : `${API_URL}/${item.imagen_url || item.imagen}`
                              }
                              alt={item.nombre}
                              style={styles.thumb}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement.innerText = "✨";
                              }}
                            />
                          ) : (
                            <span>✨</span>
                          )}
                        </div>

                        <div style={styles.itemInfo}>
                          <h4 style={styles.itemName} title={item.nombre}>
                            {item.nombre}
                          </h4>
                          <span style={styles.itemUnitPrice}>
                            ${precioItem.toLocaleString("es-AR")} c/u
                          </span>

                          <div style={styles.itemControls}>
                            <div style={styles.stepper}>
                              <button
                                type="button"
                                onClick={() => cambiarCantidad(item.id, -1)}
                                style={styles.stepBtn}
                                aria-label="Disminuir cantidad"
                              >
                                -
                              </button>
                              <span style={styles.stepValue}>{item.cantidad}</span>
                              <button
                                type="button"
                                onClick={() => cambiarCantidad(item.id, 1)}
                                style={styles.stepBtn}
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => eliminarDelCarrito(item.id)}
                              style={styles.deleteBtn}
                              title="Eliminar del carrito"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div style={styles.itemSubtotal}>
                          ${(precioItem * item.cantidad).toLocaleString("es-AR")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulario de Checkout */}
            {carrito.length > 0 && (
              <div style={styles.footer}>
                <form onSubmit={handleRealizarPedido} style={styles.checkoutForm}>
                  <div style={styles.fieldRow}>
                    <label style={styles.fieldLabel}>
                      👤 Comprador {user ? `(Logueado como ${user.nombre})` : ""}
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      placeholder="Ej: Sofía Gómez"
                      style={styles.fieldInput}
                    />
                  </div>

                  <div style={styles.summaryBox}>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Subtotal:</span>
                      <span style={styles.summaryValue}>
                        ${totalNum.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Envío Express:</span>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>GRATIS</span>
                    </div>
                    <div style={styles.summaryDivider} />
                    <div style={styles.totalRow}>
                      <span style={styles.totalLabel}>Total a Pagar:</span>
                      <span style={styles.totalValue}>
                        ${totalNum.toLocaleString("es-AR")} <span style={styles.arsSmall}>ARS</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={procesando}
                    style={{
                      ...styles.checkoutBtn,
                      opacity: procesando ? 0.7 : 1,
                      cursor: procesando ? "not-allowed" : "pointer",
                    }}
                  >
                    {procesando ? (
                      <>
                        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                        Procesando pedido en Render...
                      </>
                    ) : (
                      <>
                        <span>🚀</span> Confirmar Pedido (Guardar en DB)
                      </>
                    )}
                  </button>

                  <p style={styles.securityNotice}>
                    🔒 Compra segura con garantía de revocación de 10 días corridos.
                  </p>
                </form>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(9, 13, 22, 0.75)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },
  drawer: {
    position: "relative",
    zIndex: 1001,
    width: "100%",
    maxWidth: "460px",
    height: "100%",
    backgroundColor: "#0f172a",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-12px 0 35px rgba(0, 0, 0, 0.6)",
  },
  header: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(19, 27, 46, 0.6)",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  cartIconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
  },
  drawerTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "var(--font-heading)",
  },
  drawerSubtitle: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#94a3b8",
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#94a3b8",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "1.25rem",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "100%",
    padding: "2rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  emptySubtitle: {
    fontSize: "0.88rem",
    color: "#94a3b8",
    marginBottom: "1.5rem",
    maxWidth: "260px",
  },
  emptyBtn: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    padding: "0.65rem 1.4rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "14px",
    padding: "0.85rem",
  },
  itemImg: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    backgroundColor: "rgba(9, 13, 22, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    fontSize: "1.4rem",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    margin: "0 0 0.2rem 0",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#ffffff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemUnitPrice: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    display: "block",
    marginBottom: "0.4rem",
  },
  itemControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(9, 13, 22, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  stepBtn: {
    background: "none",
    border: "none",
    color: "#cbd5e1",
    width: "26px",
    height: "26px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    minWidth: "24px",
    textAlign: "center",
    fontSize: "0.85rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "0.2rem",
    opacity: 0.7,
  },
  itemSubtotal: {
    fontSize: "1rem",
    fontWeight: "800",
    color: "#10b981",
    flexShrink: 0,
  },
  footer: {
    padding: "1.25rem 1.5rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(19, 27, 46, 0.95)",
  },
  checkoutForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  fieldLabel: {
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#cbd5e1",
  },
  fieldInput: {
    backgroundColor: "rgba(9, 13, 22, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    padding: "0.65rem 0.9rem",
    color: "#ffffff",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit",
  },
  summaryBox: {
    backgroundColor: "rgba(9, 13, 22, 0.6)",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    marginBottom: "0.4rem",
  },
  summaryLabel: {
    color: "#94a3b8",
  },
  summaryValue: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  summaryDivider: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    margin: "0.5rem 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: "1rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: "1.4rem",
    fontWeight: "900",
    color: "#10b981",
    fontFamily: "var(--font-heading)",
  },
  arsSmall: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  checkoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.9rem",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(16, 185, 129, 0.4)",
  },
  securityNotice: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.3",
  },
  successBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },
  successEmoji: {
    fontSize: "4.5rem",
    marginBottom: "1rem",
  },
  successTitle: {
    fontSize: "1.6rem",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: "0.5rem",
    fontFamily: "var(--font-heading)",
  },
  successText: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    lineHeight: "1.5",
    maxWidth: "320px",
    marginBottom: "1.5rem",
  },
  successPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "#34d399",
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
};