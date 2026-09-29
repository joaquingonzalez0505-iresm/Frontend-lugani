import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.infoGroup}>
          <p style={styles.copy}>
            © {new Date().getFullYear()} E-Commerce IRESM. Todos los derechos reservados.
          </p>
          <p style={styles.legalNotice}>
            Conforme a la Ley de Defensa del Consumidor, cuentas con el derecho de cancelar tus compras realizadas en línea dentro de los 10 días corridos sin costo alguno.
          </p>
        </div>

        <div style={styles.linkGroup}>
          <Link to="/arrepentimiento" style={styles.arrepentimientoLink}>
            🛡️ Botón de Arrepentimiento (Derecho de Revocación)
          </Link>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    borderTop: '1px solid #1e293b',
    padding: '28px 20px',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  infoGroup: {
    maxWidth: '700px',
  },
  copy: {
    margin: '0 0 6px 0',
    fontWeight: '600',
    color: '#e2e8f0',
    fontSize: '0.9rem',
  },
  legalNotice: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  linkGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  arrepentimientoLink: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
    transition: 'background-color 0.2s ease',
  },
};

export default Footer;
