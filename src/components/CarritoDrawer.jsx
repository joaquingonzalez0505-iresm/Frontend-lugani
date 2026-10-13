import React from "react";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

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

  const { user } = useAuth();

  if (!mostrarModal) return null;

  const handleRealizarPedido = async () => {
    if (!carrito || carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const pedidoData = {
      nombre_cliente: user?.nombre || "Cliente Web",

      items: carrito.map((item) => ({
        nombre: item.nombre,
        precio_final: parseFloat(
          item.precio_final || item.precio || 0
        ),
        cantidad: parseInt(item.cantidad || 1),
      })),

      total: parseFloat(totalPrecio || 0),
    };

    try {
      const response = await fetch(
        `${API_URL}/pedidos/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedidoData),
        }
      );

      if (response.ok) {
        alert(
          "🎉 ¡Pedido registrado y guardado en la Base de Datos!"
        );

        if (vaciarCarrito) {
          vaciarCarrito();
        }

        setMostrarModal(false);
      } else {
        const errorData = await response.json();

        console.error(
          "Error del backend:",
          errorData
        );

        alert(
          "Error al procesar la compra: " +
          (errorData.detail ||
            "Verificá los datos")
        );
      }
    } catch (error) {
      console.error(
        "Error de conexión:",
        error
      );

      alert(
        "No se pudo conectar con el servidor."
      );
    }
  };

  return (
    <div style={styles.overlay}>
      <div
        style={styles.backdrop}
        onClick={() => setMostrarModal(false)}
      />

      <div style={styles.drawer}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>
            🛒 Tu Carrito
          </h2>

          <button
            type="button"
            onClick={() =>
              setMostrarModal(false)
            }
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {carrito.length === 0 ? (
            <p style={styles.empty}>
              El carrito está vacío.
            </p>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id}
                style={styles.item}
              >
                <div style={{ flex: 1 }}>
                  <strong>
                    {item.nombre}
                  </strong>

                  <div style={styles.price}>
                    $
                    {Number(
                      item.precio_final ||
                      item.precio ||
                      0
                    ).toLocaleString("es-AR")}
                  </div>
                </div>

                <div style={styles.controls}>
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(
                        item.id,
                        -1
                      )
                    }
                    style={styles.quantityBtn}
                  >
                    -
                  </button>

                  <span style={styles.quantity}>
                    {item.cantidad}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(
                        item.id,
                        1
                      )
                    }
                    style={styles.quantityBtn}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarDelCarrito(
                        item.id
                      )
                    }
                    style={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div style={styles.footer}>
            <h3 style={styles.total}>
              Total: $
              {Number(
                totalPrecio
              ).toLocaleString("es-AR")}
            </h3>

            <button
              type="button"
              onClick={handleRealizarPedido}
              style={styles.checkoutBtn}
            >
              🚀 Realizar Pedido
            </button>
          </div>
        )}
      </div>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  drawer: {
    position: "relative",
    zIndex: 1001,
    width: "100%",
    maxWidth: "380px",
    height: "100%",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "-8px 0 20px rgba(0,0,0,0.15)",
  },

  header: {
    padding: "1rem",
    borderBottom:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
  },

  body: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
  },

  empty: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "2rem",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    borderBottom:
      "1px solid #f1f5f9",
    paddingBottom: "0.75rem",
  },

  price: {
    marginTop: "4px",
    color: "#16a34a",
    fontWeight: "700",
  },

  controls: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  },

  quantityBtn: {
    width: "28px",
    height: "28px",
    border:
      "1px solid #cbd5e1",
    backgroundColor: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
  },

  quantity: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: "700",
  },

  deleteBtn: {
    color: "red",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginLeft: "4px",
  },

  footer: {
    padding: "1rem",
    borderTop:
      "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },

  total: {
    margin: "0 0 1rem 0",
    color: "#0f172a",
  },

  checkoutBtn: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};