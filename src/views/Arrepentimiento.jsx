import React from 'react';
import { Link } from 'react-router-dom';

export function Arrepentimiento() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.icon}>🛡️</span>
          <h1 style={styles.title}>Botón de Arrepentimiento y Derecho de Revocación</h1>
        </div>

        <p style={styles.lead}>
          Conforme a la legislación vigente (Ley N° 24.240 de Defensa del Consumidor y Resoluciones de Comercio), 
          tienes derecho a revocar la aceptación del contrato o cancelar tus compras realizadas en este sitio web 
          dentro del plazo de <strong>10 (diez) días corridos</strong> contados a partir de la fecha de realización de la compra o de la entrega del producto, lo que ocurra último.
        </p>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>Condiciones del Trámite:</h2>
          <ul style={styles.list}>
            <li><strong>Sin Costos Adicionales:</strong> La revocación no genera ningún costo o penalización para el comprador.</li>
            <li><strong>Devolución de Dinero:</strong> Al procesarse la cancelación, se reitera el reembolso total de los montos abonados a través del mismo medio de pago utilizado.</li>
            <li><strong>Generación de Comprobante:</strong> Al presionar el botón de revocación en tu historial de pedidos, el sistema emitirá un código único de solicitud (ej. <code>REV-XXXXXX</code>) para que puedas realizar el seguimiento.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>¿Cómo solicitar la cancelación?</h2>
          <ol style={styles.list}>
            <li>Inicia sesión con tu cuenta de usuario.</li>
            <li>Ingresa a la sección <strong>Mis Pedidos</strong> desde la barra superior de navegación.</li>
            <li>Ubica el pedido realizado en los últimos 10 días y presiona el botón rojo <strong>"🛡️ Botón de Arrepentimiento"</strong>.</li>
            <li>Confirma la solicitud en pantalla. Al completarse, recibirás tu código de trámite generado con confirmación visual.</li>
          </ol>
        </div>

        <div style={styles.actions}>
          <Link to="/mis-pedidos" style={styles.btnPrimary}>
            Ir a Mis Pedidos
          </Link>
          <Link to="/" style={styles.btnSecondary}>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '36px 16px',
    minHeight: '75vh',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '2.2rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  lead: {
    fontSize: '1.05rem',
    color: '#334155',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '10px',
  },
  list: {
    color: '#475569',
    lineHeight: '1.6',
    fontSize: '0.95rem',
    paddingLeft: '20px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    border: '1px solid #cbd5e1',
  },
};

export default Arrepentimiento;
