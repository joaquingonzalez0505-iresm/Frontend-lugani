import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          {/* Brand info */}
          <div style={styles.brandCol}>
            <div style={styles.brandTitle}>
              <span style={styles.brandIcon}>✨</span> STICKER<span style={{ color: '#ec4899' }}>LAB</span>
            </div>
            <p style={styles.brandDesc}>
              Stickers de vinilo de alta densidad para desarrolladores, laptops, termos y gadgets.
              Diseños únicos, impermeabilidad total y protección UV.
            </p>
          </div>

          {/* Quick links */}
          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Navegación</h4>
            <div style={styles.linksList}>
              <Link to="/" style={styles.link}>Catálogo de Stickers</Link>
              <Link to="/mis-pedidos" style={styles.link}>Mis Pedidos</Link>
              <Link to="/mis-datos" style={styles.link}>Mis Datos Personales</Link>
              <Link to="/admin" style={styles.linkAdmin}>👑 Panel Administrador</Link>
            </div>
          </div>

          {/* Legal Arrepentimiento */}
          <div style={styles.legalCol}>
            <h4 style={styles.colTitle}>Defensa del Consumidor</h4>
            <p style={styles.legalNotice}>
              Conforme a la Ley N° 24.240 y Resoluciones de Comercio, cuentas con el derecho irrenunciable a cancelar tus compras online sin costo alguno dentro de los 10 días corridos.
            </p>
            <Link to="/arrepentimiento" style={styles.arrepentimientoLink}>
              🛡️ Botón de Arrepentimiento (10 Días)
            </Link>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <p style={styles.copy}>
            © {new Date().getFullYear()} StickerLab Studio // E-Commerce IRESM. Todos los derechos reservados.
          </p>
          <div style={styles.badgesRow}>
            <span style={styles.badgeMini}>PostgreSQL en Render</span>
            <span style={styles.badgeMini}>Deploy en Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#090d16',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '3.5rem 1.5rem 2rem 1.5rem',
    marginTop: 'auto',
    color: '#94a3b8',
  },
  container: {
    maxWidth: '1320px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '900',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-heading)',
  },
  brandIcon: {
    fontSize: '1.2rem',
  },
  brandDesc: {
    fontSize: '0.88rem',
    lineHeight: '1.6',
    color: '#94a3b8',
    margin: 0,
    maxWidth: '340px',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  colTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.88rem',
    transition: 'color 0.2s ease',
  },
  linkAdmin: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: '700',
  },
  legalCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  legalNotice: {
    fontSize: '0.82rem',
    lineHeight: '1.5',
    color: '#64748b',
    margin: 0,
  },
  arrepentimientoLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.85rem',
    alignSelf: 'flex-start',
    transition: 'all 0.2s ease',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.82rem',
  },
  copy: {
    margin: 0,
    color: '#64748b',
  },
  badgesRow: {
    display: 'flex',
    gap: '0.6rem',
  },
  badgeMini: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
};

export default Footer;
