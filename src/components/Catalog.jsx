import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export default function Catalog() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [lento, setLento] = useState(false);

  useEffect(() => {
    let timer;
    if (cargando) {
      timer = setTimeout(() => {
        setLento(true);
      }, 5000);
    } else {
      setLento(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cargando]);

  useEffect(() => {
    fetch(`${API_URL}/productos/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        return res.json();
      })
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al traer los productos:", err);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div style={styles.loading}>
        {lento
          ? "Despertando el servidor, la primera visita puede tardar un minuto…"
          : "Cargando productos…"}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        📦 Catálogo de Stickers
      </h2>

      {productos.length === 0 ? (
        <p style={styles.empty}>
          No hay stickers disponibles.
        </p>
      ) : (
        <div style={styles.grid}>
          {productos.map((prod, index) => (
            <ProductCard
              key={prod.id ?? index}
              product={prod}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },

  title: {
    margin: "0 0 1.5rem 0",
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.5rem",
  },

  loading: {
    padding: "4rem 2rem",
    textAlign: "center",
    color: "#64748b",
    fontSize: "1.1rem",
    fontWeight: "600",
  },

  empty: {
    color: "#64748b",
    fontSize: "1rem",
  },
};