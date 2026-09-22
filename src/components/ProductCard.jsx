import React from 'react';

/**
 * Componente ProductCard
 * Muestra la información de un producto individual del catálogo.
 * 
 * @param {Object} props
 * @param {Object} props.producto - Objeto del producto con sus propiedades reales.
 */
export default function ProductCard({ producto }) {
  if (!producto) return null;

  const {
    nombre,
    precio_final,
    cuotas_cantidad,
    cuotas_valor,
    garantia_meses
  } = producto;

  // Formateador de moneda para ARS / USD
  const formatPrecio = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(valor || 0);
  };

  return (
    <div style={styles.card}>
      <div style={styles.badgeGarantia}>
        🛡️ {garantia_meses} {garantia_meses === 1 ? 'mes' : 'meses'} de garantía
      </div>

      <h3 style={styles.nombre}>{nombre || 'Producto sin nombre'}</h3>

      <div style={styles.priceContainer}>
        <span style={styles.precioLabel}>Precio final:</span>
        <span style={styles.precioValue}>{formatPrecio(precio_final)}</span>
      </div>

      {cuotas_cantidad > 0 && (
        <div style={styles.cuotasContainer}>
          <span style={styles.cuotasTag}>
            💳 {cuotas_cantidad} cuotas de {formatPrecio(cuotas_valor)}
          </span>
        </div>
      )}
    </div>
  );
}

// Estilos inline con estética moderna y limpia
const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeGarantia: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '0.78rem',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '12px',
  },
  nombre: {
    margin: '0 0 12px 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.4',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '14px',
  },
  precioLabel: {
    fontSize: '0.82rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  precioValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  cuotasContainer: {
    marginTop: 'auto',
    paddingTop: '10px',
    borderTop: '1px stroke #f1f5f9',
  },
  cuotasTag: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    padding: '6px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
};
