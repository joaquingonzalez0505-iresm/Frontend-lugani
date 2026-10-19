import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "./ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export default function Catalog() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [lento, setLento] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("destacados");
  const [categoria, setCategoria] = useState("todos");

  useEffect(() => {
    let timer;
    if (cargando) {
      timer = setTimeout(() => {
        setLento(true);
      }, 4000);
    } else {
      setLento(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cargando]);

  const cargarProductos = () => {
    setCargando(true);
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
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Filter & Sort
  const productosFiltrados = useMemo(() => {
    let lista = [...productos];

    // Search query
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          (p.nombre && p.nombre.toLowerCase().includes(q)) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    }

    // Category mock filter
    if (categoria !== "todos") {
      lista = lista.filter((p) => {
        const text = `${p.nombre} ${p.descripcion || ""}`.toLowerCase();
        if (categoria === "dev") return text.includes("react") || text.includes("git") || text.includes("code") || text.includes("dev") || text.includes("python");
        if (categoria === "pack") return text.includes("pack") || text.includes("x");
        return true;
      });
    }

    // Sort
    if (orden === "menor-precio") {
      lista.sort((a, b) => (a.precio_final || a.precio || 0) - (b.precio_final || b.precio || 0));
    } else if (orden === "mayor-precio") {
      lista.sort((a, b) => (b.precio_final || b.precio || 0) - (a.precio_final || a.precio || 0));
    } else if (orden === "nombre") {
      lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    }

    return lista;
  }, [productos, busqueda, orden, categoria]);

  return (
    <section id="catalogo-section" style={styles.section}>
      <div style={styles.container}>
        {/* Section Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.tagBadge}>🔥 Catálogo Oficial</div>
            <h2 style={styles.title}>
              Explora Nuestro <span className="gradient-text">Sticker Lab</span>
            </h2>
            <p style={styles.subtitle}>
              Colecciones exclusivas con acabado mate, holográfico y laminado UV.
            </p>
          </div>

          <div style={styles.totalBadge}>
            <span style={styles.pulseDot} />
            <span>{productos.length} stickers cargados</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={styles.filterBar}>
          {/* Search Input */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre (ej: React, Python, Laptop)..."
              style={styles.searchInput}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                style={styles.clearSearchBtn}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div style={styles.categoryChips}>
            {[
              { id: "todos", label: "✨ Todos" },
              { id: "dev", label: "💻 Dev & Tech" },
              { id: "pack", label: "📦 Packs x10/x20" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                style={{
                  ...styles.chip,
                  ...(categoria === cat.id ? styles.chipActive : {}),
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={styles.sortWrapper}>
            <label style={styles.sortLabel}>Ordenar:</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="destacados">Destacados</option>
              <option value="menor-precio">Menor Precio</option>
              <option value="mayor-precio">Mayor Precio</option>
              <option value="nombre">Alfabético (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Catalog Body */}
        {cargando ? (
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinner}>⏳</div>
            <h3 style={styles.loadingTitle}>Cargando catálogo en tiempo real...</h3>
            <p style={styles.loadingDesc}>
              {lento
                ? "💡 Despertando el servidor en Render (el primer inicio en frío puede demorar hasta 50s)..."
                : "Conectando con la base de datos PostgreSQL de Render..."}
            </p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={styles.emptyIcon}>📦</span>
            <h3 style={styles.emptyTitle}>No encontramos stickers que coincidan</h3>
            <p style={styles.emptyDesc}>
              Prueba cambiando el término de búsqueda o restableciendo los filtros de categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setCategoria("todos");
              }}
              style={styles.resetBtn}
            >
              Ver todos los stickers
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {productosFiltrados.map((prod, index) => (
              <ProductCard
                key={prod.id ?? index}
                product={prod}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "3.5rem 1.5rem 5rem 1.5rem",
    position: "relative",
  },
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1.5rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  tagBadge: {
    display: "inline-block",
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    color: "#f472b6",
    border: "1px solid rgba(236, 72, 153, 0.3)",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: "-0.02em",
    margin: "0 0 0.4rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    margin: 0,
  },
  totalBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(19, 27, 46, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    color: "#cbd5e1",
    fontWeight: "600",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 10px #10b981",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "1rem",
    marginBottom: "2.5rem",
    flexWrap: "wrap",
  },
  searchWrapper: {
    position: "relative",
    flex: "1 1 280px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    fontSize: "1rem",
    pointerEvents: "none",
    color: "#64748b",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "rgba(9, 13, 22, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "0.65rem 2.2rem 0.65rem 2.5rem",
    color: "#ffffff",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "0.8rem",
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  categoryChips: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    padding: "0.5rem 0.9rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  chipActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "#6366f1",
    color: "#ffffff",
  },
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginLeft: "auto",
  },
  sortLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: "600",
  },
  sortSelect: {
    backgroundColor: "rgba(9, 13, 22, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "0.55rem 0.9rem",
    color: "#cbd5e1",
    fontSize: "0.85rem",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  loadingBox: {
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "4rem 2rem",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },
  loadingSpinner: {
    fontSize: "3rem",
    marginBottom: "1rem",
    animation: "spin 2s linear infinite",
    display: "inline-block",
  },
  loadingTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  loadingDesc: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    margin: 0,
  },
  emptyBox: {
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "4rem 2rem",
    textAlign: "center",
    maxWidth: "520px",
    margin: "0 auto",
  },
  emptyIcon: {
    fontSize: "3.5rem",
    marginBottom: "1rem",
    display: "block",
  },
  emptyTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  emptyDesc: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  resetBtn: {
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "0.65rem 1.25rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};