import React, { useState } from "react";
import { useCarrito } from "../context/CarritoContext";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export default function ProductCard({ product }) {
  const { agregarAlCarrito, setMostrarModal } = useCarrito();
  const [agregadoAnim, setAgregadoAnim] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const precioNum = Number(product.precio_final ?? product.precio ?? product.precioFinal ?? 0);
  const precioFormateado = precioNum.toLocaleString("es-AR");

  // Format cuotas
  const cuotasCant = Number(product.cuotas_cantidad ?? product.cuotas ?? 3) || 3;
  const cuotasVal = product.cuotas_valor
    ? Number(product.cuotas_valor).toLocaleString("es-AR")
    : (precioNum / cuotasCant).toFixed(0);

  // Determine correct image URL
  const rawImg = product.imagen_url || product.imagen || "";
  let finalImgUrl = rawImg;
  if (rawImg && !rawImg.startsWith("http") && !rawImg.startsWith("data:")) {
    finalImgUrl = `${API_URL}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;
  }

  const handleAgregar = (e) => {
    e.stopPropagation();
    agregarAlCarrito(product);
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 1200);
    // Open drawer
    setMostrarModal(true);
  };

  return (
    <div style={styles.card}>
      {/* Image Container with Badges */}
      <div style={styles.imgContainer}>
        {/* Floating badge for cuotas or stock */}
        <div style={styles.topBadges}>
          {product.stock > 0 ? (
            <span style={styles.stockBadge}>
              <span style={styles.greenDot} /> {product.stock} disp.
            </span>
          ) : (
            <span style={styles.outOfStockBadge}>Agotado</span>
          )}

          {cuotasCant > 1 && (
            <span style={styles.cuotasBadge}>
              {cuotasCant} cuotas
            </span>
          )}
        </div>

        {finalImgUrl && !imgError ? (
          <img
            src={finalImgUrl}
            alt={product.nombre || "Sticker"}
            style={styles.image}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div style={styles.fallbackGraphic}>
            <span style={styles.stickerEmoji}>✨</span>
            <span style={styles.fallbackLabel}>Sticker Lab</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={styles.body}>
        <div style={styles.header}>
          <h3 style={styles.title} title={product.nombre}>
            {product.nombre}
          </h3>
          <p style={styles.desc}>
            {product.descripcion || "Sticker de vinilo impermeable ultra resistente."}
          </p>
        </div>

        {/* Pricing Block */}
        <div style={styles.pricingBox}>
          <div style={styles.priceRow}>
            <span style={styles.currencySymbol}>$</span>
            <span style={styles.priceValue}>{precioFormateado}</span>
            <span style={styles.arsPill}>ARS</span>
          </div>

          {cuotasCant > 1 && (
            <p style={styles.cuotasText}>
              💳 {cuotasCant} cuotas de <strong>${cuotasVal}</strong>
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAgregar}
          disabled={product.stock === 0}
          style={{
            ...styles.addButton,
            ...(agregadoAnim ? styles.addButtonSuccess : {}),
            ...(product.stock === 0 ? styles.addButtonDisabled : {}),
          }}
        >
          {agregadoAnim ? (
            <>
              <span>✓</span> ¡Agregado!
            </>
          ) : (
            <>
              <span>🛒</span> Agregar al Carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "rgba(19, 27, 46, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "18px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  },
  imgContainer: {
    position: "relative",
    width: "100%",
    height: "210px",
    backgroundColor: "rgba(9, 13, 22, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  topBadges: {
    position: "absolute",
    top: "12px",
    left: "12px",
    right: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
    pointerEvents: "none",
  },
  stockBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    backdropFilter: "blur(8px)",
    color: "#6ee7b7",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  greenDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },
  outOfStockBadge: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    color: "#fda4af",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  cuotasBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.18)",
    backdropFilter: "blur(8px)",
    color: "#a5b4fc",
    border: "1px solid rgba(99, 102, 241, 0.35)",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "1rem",
    transition: "transform 0.4s ease",
  },
  fallbackGraphic: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
  },
  stickerEmoji: {
    fontSize: "3.5rem",
    filter: "drop-shadow(0 0 16px rgba(99, 102, 241, 0.5))",
  },
  fallbackLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#64748b",
    textTransform: "uppercase",
  },
  body: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: 1,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  title: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "var(--font-heading)",
    lineHeight: "1.3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  desc: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#94a3b8",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "2.4em",
  },
  pricingBox: {
    backgroundColor: "rgba(9, 13, 22, 0.4)",
    borderRadius: "12px",
    padding: "0.75rem 0.9rem",
    border: "1px solid rgba(255, 255, 255, 0.04)",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.25rem",
  },
  currencySymbol: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#10b981",
  },
  priceValue: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#ffffff",
    fontFamily: "var(--font-heading)",
    letterSpacing: "-0.02em",
  },
  arsPill: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#64748b",
    marginLeft: "auto",
  },
  cuotasText: {
    margin: "0.35rem 0 0 0",
    fontSize: "0.78rem",
    color: "#a5b4fc",
  },
  addButton: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "0.92rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  addButtonSuccess: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.5)",
    transform: "scale(1.02)",
  },
  addButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};