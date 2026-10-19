import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Hero({ onExplorarClick }) {
  const { esAdmin } = useAuth();

  const handleScrollCatalog = () => {
    if (onExplorarClick) {
      onExplorarClick();
    } else {
      const el = document.getElementById("catalogo-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section style={styles.heroSection}>
      <div style={styles.glowCircle1} />
      <div style={styles.glowCircle2} />

      <div style={styles.container}>
        <div style={styles.heroContent}>
          {/* Tag pill */}
          <div style={styles.heroBadge}>
            <span style={styles.badgePulse} />
            <span>Colección Dev & Geek 2025 // Edición Limitada</span>
          </div>

          {/* Heading */}
          <h1 style={styles.title}>
            Los mejores stickers para <span className="gradient-text">devs, laptops</span> y más.
          </h1>

          {/* Subtitle */}
          <p style={styles.subtitle}>
            Diseñados con precisión e impresos en vinilo holográfico de alta densidad.
            100% impermeables, resistentes a rayones y al calor de tu laptop.
          </p>

          {/* Features Highlights */}
          <div style={styles.highlightsGrid}>
            <div style={styles.highlightItem}>
              <span style={styles.hlIcon}>💧</span>
              <span>100% Impermeables</span>
            </div>
            <div style={styles.highlightItem}>
              <span style={styles.hlIcon}>⚡</span>
              <span>Vinilo Mate & Holográfico</span>
            </div>
            <div style={styles.highlightItem}>
              <span style={styles.hlIcon}>🛡️</span>
              <span>Cero Residuos al despegar</span>
            </div>
            <div style={styles.highlightItem}>
              <span style={styles.hlIcon}>🚀</span>
              <span>Envíos a todo el país</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={styles.ctaGroup}>
            <button
              type="button"
              onClick={handleScrollCatalog}
              style={styles.ctaPrimary}
            >
              <span>🔥</span> Explorar Catálogo
            </button>

            <Link to="/admin" style={styles.ctaSecondary}>
              <span>👑</span> {esAdmin ? "Administrar Productos" : "Acceso Administrador"}
            </Link>
          </div>

          {/* Trust proof */}
          <div style={styles.trustProof}>
            <div style={styles.avatarsGroup}>
              <span style={{ ...styles.avatarDot, background: "#6366f1" }}>💻</span>
              <span style={{ ...styles.avatarDot, background: "#ec4899" }}>⚡</span>
              <span style={{ ...styles.avatarDot, background: "#10b981" }}>🚀</span>
              <span style={{ ...styles.avatarDot, background: "#f59e0b" }}>🎨</span>
            </div>
            <p style={styles.trustText}>
              Más de <strong>1,500+ dev packs</strong> enviados con garantía total.
            </p>
          </div>
        </div>

        {/* Hero Visual Card / Floating Stickers Showcase */}
        <div style={styles.visualWrapper}>
          <div style={styles.visualCard}>
            <div style={styles.visualHeader}>
              <span style={styles.windowDotRed} />
              <span style={styles.windowDotYellow} />
              <span style={styles.windowDotGreen} />
              <span style={styles.visualTitle}>stickerlab-terminal.sh</span>
            </div>

            <div style={styles.visualBody}>
              <div style={styles.codeSnippet}>
                <span style={{ color: "#ec4899" }}>$</span> npx create-stickerlab-pack
                <br />
                <span style={{ color: "#10b981" }}>✓</span> Quality: <strong style={{ color: "#fff" }}>Ultra HD 1200 DPI</strong>
                <br />
                <span style={{ color: "#10b981" }}>✓</span> Lamination: <strong style={{ color: "#fff" }}>UV Protection</strong>
                <br />
                <span style={{ color: "#10b981" }}>✓</span> Ready to stick anywhere!
              </div>

              {/* Floating stickers gallery */}
              <div style={styles.stickersCluster}>
                <div style={{ ...styles.stickerPill, ...styles.stickerPill1 }}>
                  <span>⚛️ React Pro</span>
                </div>
                <div style={{ ...styles.stickerPill, ...styles.stickerPill2 }}>
                  <span>🐍 Pythonista</span>
                </div>
                <div style={{ ...styles.stickerPill, ...styles.stickerPill3 }}>
                  <span>⚡ Vite Fast</span>
                </div>
                <div style={{ ...styles.stickerPill, ...styles.stickerPill4 }}>
                  <span>🚀 Git Push</span>
                </div>
                <div style={{ ...styles.stickerPill, ...styles.stickerPill5 }}>
                  <span>☕ Coffee.exe</span>
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <span style={styles.statusLive}>● En stock permanente</span>
              <span style={styles.shippingBadge}>📦 Envío 24-48hs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  heroSection: {
    position: "relative",
    padding: "3.5rem 1.5rem 2.5rem 1.5rem",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  glowCircle1: {
    position: "absolute",
    top: "-10%",
    left: "10%",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowCircle2: {
    position: "absolute",
    bottom: "0%",
    right: "5%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "3rem",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#a5b4fc",
    alignSelf: "flex-start",
  },
  badgePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ec4899",
    boxShadow: "0 0 10px #ec4899",
  },
  title: {
    fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
    fontWeight: "900",
    lineHeight: "1.15",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "560px",
  },
  highlightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.8rem",
    margin: "0.5rem 0",
  },
  highlightItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  hlIcon: {
    fontSize: "1.1rem",
  },
  ctaGroup: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "0.5rem",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.85rem 1.6rem",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    padding: "0.85rem 1.4rem",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  trustProof: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    marginTop: "0.75rem",
  },
  avatarsGroup: {
    display: "flex",
    alignItems: "center",
  },
  avatarDot: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px solid #090d16",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    marginLeft: "-8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
  trustText: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },
  visualWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  visualCard: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "rgba(19, 27, 46, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "1.25rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)",
  },
  visualHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "0.8rem",
    marginBottom: "1rem",
  },
  windowDotRed: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#ef4444",
  },
  windowDotYellow: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
  },
  windowDotGreen: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },
  visualTitle: {
    marginLeft: "auto",
    fontSize: "0.78rem",
    color: "#64748b",
    fontFamily: "monospace",
  },
  visualBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  codeSnippet: {
    backgroundColor: "rgba(9, 13, 22, 0.7)",
    borderRadius: "10px",
    padding: "0.85rem 1rem",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    color: "#cbd5e1",
    lineHeight: "1.7",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  stickersCluster: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "center",
    padding: "0.5rem 0",
  },
  stickerPill: {
    padding: "0.5rem 0.9rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.88rem",
    boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
    cursor: "default",
    transition: "transform 0.2s ease",
  },
  stickerPill1: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    transform: "rotate(-3deg)",
  },
  stickerPill2: {
    backgroundColor: "#1e293b",
    color: "#fbbf24",
    border: "1px solid #fbbf24",
    transform: "rotate(4deg)",
  },
  stickerPill3: {
    backgroundColor: "#1e293b",
    color: "#a855f7",
    border: "1px solid #a855f7",
    transform: "rotate(-2deg)",
  },
  stickerPill4: {
    backgroundColor: "#1e293b",
    color: "#f43f5e",
    border: "1px solid #f43f5e",
    transform: "rotate(3deg)",
  },
  stickerPill5: {
    backgroundColor: "#1e293b",
    color: "#10b981",
    border: "1px solid #10b981",
    transform: "rotate(-4deg)",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.25rem",
    paddingTop: "0.85rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    fontSize: "0.8rem",
  },
  statusLive: {
    color: "#10b981",
    fontWeight: "700",
  },
  shippingBadge: {
    color: "#94a3b8",
  },
};
