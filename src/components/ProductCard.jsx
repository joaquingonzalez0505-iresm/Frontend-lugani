import React from "react";
import { useCarrito } from "../context/CarritoContext";

export default function ProductCard({ product }) {
  const { agregarAlCarrito, setMostrarModal } = useCarrito();

  if (!product) return null;

  const precio = Number(
    product.precio_final || product.precio || 0
  ).toLocaleString("es-AR");

  const handleAgregar = () => {
    agregarAlCarrito(product);
    setMostrarModal(true);
  };

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre || "Producto"}
            style={styles.img}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.innerHTML = "🏷️";
            }}
          />
        ) : (
          <span style={styles.placeholder}>
            🏷️
          </span>
        )}
      </div>

      <div style={styles.body}>
        <h3 style={styles.title}>
          {product.nombre}
        </h3>

        <p style={styles.desc}>
          {product.descripcion ||
            "Sticker vinilo impreso de alta durabilidad"}
        </p>

        <div style={styles.price}>
          ${precio}
        </div>

        <button
          type="button"
          onClick={handleAgregar}
          style={styles.btn}
        >
          Agregar al Carrito 🛒
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
  },

  imgBox: {
    height: "180px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  placeholder: {
    fontSize: "3rem",
  },

  body: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#0f172a",
  },

  desc: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#64748b",
  },

  price: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#16a34a",
    margin: "0.5rem 0",
  },

  btn: {
    marginTop: "auto",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.6rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};