import React from 'react';
import { Link } from 'react-router-dom';

export function Arrepentimiento() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.shieldIcon}>🛡️</div>
          <div>
            <div style={styles.badge}>Marco Normativo Ley N° 24.240</div>
            <h1 style={styles.title}>Botón de Arrepentimiento y Derecho de Revocación</h1>
          </div>
        </div>

        <p style={styles.lead}>
          Conforme a la legislación argentina vigente (Ley N° 24.240 de Defensa del Consumidor y Resoluciones conexas de Comercio), 
          tienes derecho a revocar la aceptación del contrato o cancelar tus compras realizadas en esta tienda online 
          dentro del plazo perentorio de <strong>10 (diez) días corridos</strong> contados a partir de la fecha de realización de la compra o de la entrega del producto, lo que ocurra último.
        </p>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>✨ Condiciones del Trámite de Revocación:</h2>
          <ul style={styles.list}>
            <li>
              <strong>Sin Costos ni Penalizaciones:</strong> La revocación no genera ningún tipo de gasto, penalidad ni deducción para el consumidor.
            </li>
            <li>
              <strong>Devolución Íntegra de los Fondos:</strong> Al procesarse la cancelación del pedido, se reitera el reembolso total de los montos abonados a través del mismo canal de pago empleado.
            </li>
            <li>
              <strong>Generación Automática de Comprobante:</strong> Al presionar el botón de revocación en la sección <em>Mis Pedidos</em>, el sistema emitirá un código único de solicitud (ej. <code>REV-XXXXXX</code>) con estado audible y visual para su seguimiento.
            </li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>📋 ¿Cómo solicitar la revocación en esta tienda?</h2>
          <ol style={styles.stepsList}>
            <li>Inicia sesión con tu cuenta de usuario registrada en <strong>Sticker Lab</strong>.</li>
            <li>Ingresa a la sección <strong>Mis Pedidos</strong> desde el menú de usuario de la barra superior.</li>
            <li>Identifica la compra efectuada en los últimos 10 días y presiona el botón <strong>"🛡️ Botón de Arrepentimiento"</strong>.</li>
            <li>Confirma la solicitud en el diálogo de seguridad. Una vez procesada, el sistema registrará la cancelación y mostrará tu código de trámite de revocación.</li>
          </ol>
        </div>

        <div style={styles.actions}>
          <Link to="/mis-pedidos" style={styles.btnPrimary}>
            📦 Ir a Mis Pedidos
          </Link>
          <Link to="/" style={styles.btnSecondary}>
            ← Volver al Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '880px',
    margin: '0 auto',
    padding: '3.5rem 1.5rem 5rem 1.5rem',
    minHeight: '75vh',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '1.25rem',
    marginBottom: '1.5rem',
  },
  shieldIcon: {
    fontSize: '2.8rem',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    marginBottom: '0.35rem',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  lead: {
    fontSize: '1rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '1.75rem',
  },
  section: {
    marginBottom: '1.75rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.75rem',
  },
  list: {
    color: '#94a3b8',
    lineHeight: '1.7',
    fontSize: '0.92rem',
    paddingLeft: '1.25rem',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  stepsList: {
    color: '#cbd5e1',
    lineHeight: '1.7',
    fontSize: '0.92rem',
    paddingLeft: '1.25rem',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2.5rem',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.5rem',
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.92rem',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.92rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

export default Arrepentimiento;
