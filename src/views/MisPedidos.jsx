import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMisPedidos, revocarPedido } from '../services/api';

export function MisPedidos() {
  const { token, user } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Código de solicitud para mostrar explícitamente con role="status"
  const [codigoStatusMsg, setCodigoStatusMsg] = useState(null);
  const [revocandoId, setRevocandoId] = useState(null);

  const cargarPedidos = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMisPedidos(token);
      setPedidos(data || []);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar el historial de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [token]);

  const esRevocable = (fechaCreacionIso) => {
    if (!fechaCreacionIso) return false;
    const fechaPedido = new Date(fechaCreacionIso);
    const ahora = new Date();
    const diffTiempo = ahora.getTime() - fechaPedido.getTime();
    const diffDias = diffTiempo / (1000 * 3600 * 24);
    return diffDias <= 10;
  };

  const handleSolicitarRevocacion = async (pedidoId) => {
    // Primera confirmación
    const confirm1 = window.confirm(
      '¿Estás seguro de que deseas solicitar la revocación (botón de arrepentimiento) de este pedido?'
    );
    if (!confirm1) return;

    // Segunda confirmación obligatoria
    const confirm2 = window.confirm(
      '⚠️ Confirmación Final: Se procesará la cancelación del pedido bajo el derecho de arrepentimiento de 10 días sin costo. ¿Deseas emitir la solicitud?'
    );
    if (!confirm2) return;

    setRevocandoId(pedidoId);
    setCodigoStatusMsg(null);

    try {
      const res = await revocarPedido(pedidoId, token);
      const codigoGenerado = res.codigo_solicitud || 'REV-OK';
      
      // Mostrar en pantalla el código de solicitud generado empleando role="status"
      setCodigoStatusMsg(
        `✅ Solicitud de arrepentimiento registrada. Código de trámite: ${codigoGenerado}`
      );

      // Refrescar la vista
      await cargarPedidos();
    } catch (err) {
      alert(err.message || 'Error al procesar la revocación del pedido.');
    } finally {
      setRevocandoId(null);
    }
  };

  // 1. Pantalla explícita de Carga
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerCard} role="status">
          <div style={styles.spinner}>⏳</div>
          <h2 style={styles.loadingTitle}>Cargando pedidos...</h2>
          <p style={styles.subtext}>Por favor espera un momento mientras consultamos tu historial.</p>
        </div>
      </div>
    );
  }

  // 2. Pantalla explícita de Error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard} role="alert">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <h2 style={styles.errorTitle}>Error al cargar los pedidos</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={cargarPedidos} style={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 3. Pantalla explícita de Lista Vacía
  if (!pedidos || pedidos.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <h2 style={styles.emptyTitle}>No tienes pedidos registrados</h2>
          <p style={styles.emptySubtext}>
            Actualmente no has realizado ninguna compra en la tienda. Visita el catálogo para agregar tus productos preferidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Historial de Mis Pedidos</h1>
      <p style={styles.pageSubtitle}>
        Consulta el estado de tus compras y gestiona devoluciones bajo el derecho de arrepentimiento (10 días corridos).
      </p>

      {/* Banner con código de solicitud generado empleando el atributo role="status" */}
      {codigoStatusMsg && (
        <div style={styles.statusBanner} role="status">
          {codigoStatusMsg}
        </div>
      )}

      <div style={styles.pedidosList}>
        {pedidos.map((pedido) => {
          const puedeRevocar = esRevocable(pedido.fecha_creacion) && pedido.estado !== 'revocado';

          return (
            <div key={pedido.id} style={styles.pedidoCard}>
              <div style={styles.pedidoHeader}>
                <div>
                  <h3 style={styles.pedidoId}>Pedido #{pedido.id}</h3>
                  <span style={styles.fechaText}>
                    Realizado el: {new Date(pedido.fecha_creacion).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div style={styles.estadoGroup}>
                  <span
                    style={{
                      ...styles.estadoBadge,
                      backgroundColor: pedido.estado === 'revocado' ? '#fef2f2' : '#ecfdf5',
                      color: pedido.estado === 'revocado' ? '#dc2626' : '#047857',
                      borderColor: pedido.estado === 'revocado' ? '#fecaca' : '#a7f3d0',
                    }}
                  >
                    {pedido.estado === 'revocado' ? '⛔ Revocado' : '✔ Completado'}
                  </span>

                  <span style={styles.totalText}>
                    ${(pedido.total || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {pedido.codigo_solicitud_revocacion && (
                <div style={styles.codigoBox} role="status">
                  <strong>Código de Solicitud de Revocación:</strong> {pedido.codigo_solicitud_revocacion}
                </div>
              )}

              <div style={styles.itemsSection}>
                <h4 style={styles.itemsTitle}>Productos:</h4>
                <ul style={styles.itemsList}>
                  {pedido.items && pedido.items.map((item, idx) => (
                    <li key={item.id || idx} style={styles.itemRow}>
                      <span>
                        {item.cantidad}x <strong>{item.producto_nombre || 'Producto'}</strong>
                      </span>
                      <span>${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.pedidoFooter}>
                {/* Botón de revocar exclusivamente en aquellas compras creadas hace 10 días o menos */}
                {puedeRevocar ? (
                  <button
                    onClick={() => handleSolicitarRevocacion(pedido.id)}
                    disabled={revocandoId === pedido.id}
                    style={styles.revocarBtn}
                  >
                    {revocandoId === pedido.id ? 'Procesando...' : '🛡️ Botón de Arrepentimiento (Revocar compra)'}
                  </button>
                ) : (
                  <span style={styles.noRevocarInfo}>
                    {pedido.estado === 'revocado'
                      ? 'Compra revocada'
                      : 'Plazo de 10 días para revocación vencido'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 16px',
    minHeight: '75vh',
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    color: '#64748b',
    margin: '0 0 24px 0',
    fontSize: '0.95rem',
  },
  centerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  spinner: {
    fontSize: '2.5rem',
    marginBottom: '12px',
  },
  loadingTitle: {
    fontSize: '1.3rem',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtext: {
    color: '#64748b',
    margin: 0,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    padding: '36px 24px',
    textAlign: 'center',
    border: '1px solid #fecaca',
    color: '#991b1b',
  },
  errorTitle: {
    fontSize: '1.3rem',
    margin: '12px 0 8px 0',
  },
  errorText: {
    margin: '0 0 16px 0',
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '56px 24px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  emptyTitle: {
    fontSize: '1.4rem',
    color: '#1e293b',
    margin: '16px 0 8px 0',
  },
  emptySubtext: {
    color: '#64748b',
    maxWidth: '460px',
    margin: '0 auto',
    fontSize: '0.95rem',
  },
  statusBanner: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '14px 18px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    marginBottom: '24px',
  },
  pedidosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  pedidoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
  },
  pedidoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
    marginBottom: '14px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  pedidoId: {
    margin: '0 0 4px 0',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  fechaText: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  estadoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  estadoBadge: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '700',
    border: '1px solid transparent',
  },
  totalText: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#059669',
  },
  codigoBox: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    border: '1px solid #bfdbfe',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '14px',
  },
  itemsSection: {
    marginBottom: '16px',
  },
  itemsTitle: {
    margin: '0 0 8px 0',
    fontSize: '0.9rem',
    color: '#475569',
  },
  itemsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: '6px 10px',
    borderRadius: '6px',
  },
  pedidoFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  revocarBtn: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  noRevocarInfo: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
};

export default MisPedidos;
