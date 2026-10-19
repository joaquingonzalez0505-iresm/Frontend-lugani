import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMisPedidos, revocarPedido } from '../services/api';

export function MisPedidos() {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status code display with role="status"
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

      const msg = `✅ Solicitud de arrepentimiento registrada. Código de trámite: ${codigoGenerado}`;
      setCodigoStatusMsg(msg);
      success(msg);

      // Refrescar la vista
      await cargarPedidos();
    } catch (err) {
      const errorMsg = err.message || 'Error al procesar la revocación del pedido.';
      toastError(errorMsg);
      alert(errorMsg);
    } finally {
      setRevocandoId(null);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.centerCard}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={styles.title}>Inicia sesión para ver tus pedidos</h2>
          <p style={styles.subtext}>Debes estar autenticado para consultar tu historial de compras y realizar devoluciones.</p>
          <Link to="/login" style={styles.primaryBtn}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // 1. Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerCard} role="status">
          <div style={styles.spinner}>⏳</div>
          <h2 style={styles.loadingTitle}>Cargando pedidos...</h2>
          <p style={styles.subtext}>Por favor espera un momento mientras consultamos tu historial en Render PostgreSQL.</p>
        </div>
      </div>
    );
  }

  // 2. Error
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

  // 3. Empty
  if (!pedidos || pedidos.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>
          <span style={{ fontSize: '3.5rem' }}>📦</span>
          <h2 style={styles.emptyTitle}>No tienes pedidos registrados</h2>
          <p style={styles.emptySubtext}>
            Actualmente no has realizado ninguna compra con tu cuenta. Explora el catálogo de stickers para agregar tus productos preferidos.
          </p>
          <Link to="/" style={styles.primaryBtn}>
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.tagBadge}>📦 Tus Compras</div>
          <h1 style={styles.pageTitle}>Historial de Mis Pedidos</h1>
          <p style={styles.pageSubtitle}>
            Consulta el estado de tus compras y gestiona devoluciones bajo el derecho de arrepentimiento (10 días corridos según Ley N° 24.240).
          </p>
        </div>
        <Link to="/" style={styles.backStoreBtn}>
          ← Volver a la Tienda
        </Link>
      </div>

      {/* Banner con código de solicitud generado empleando role="status" */}
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
                    Realizado el:{' '}
                    {new Date(pedido.fecha_creacion).toLocaleDateString('es-AR', {
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
                      backgroundColor:
                        pedido.estado === 'revocado'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      color: pedido.estado === 'revocado' ? '#fca5a5' : '#34d399',
                      borderColor:
                        pedido.estado === 'revocado'
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(16, 185, 129, 0.3)',
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
                  <strong>Código de Solicitud de Revocación:</strong>{' '}
                  <code style={styles.codeHighlight}>{pedido.codigo_solicitud_revocacion}</code>
                </div>
              )}

              <div style={styles.itemsSection}>
                <h4 style={styles.itemsTitle}>Artículos adquiridos:</h4>
                <ul style={styles.itemsList}>
                  {pedido.items &&
                    pedido.items.map((item, idx) => (
                      <li key={item.id || idx} style={styles.itemRow}>
                        <span>
                          {item.cantidad}x{' '}
                          <strong style={{ color: '#fff' }}>
                            {item.producto_nombre || item.nombre || 'Sticker'}
                          </strong>
                        </span>
                        <span style={{ color: '#10b981', fontWeight: '700' }}>
                          ${((item.precio_unitario || item.precio_final || 0) * item.cantidad).toLocaleString('es-AR')}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              <div style={styles.pedidoFooter}>
                {puedeRevocar ? (
                  <button
                    onClick={() => handleSolicitarRevocacion(pedido.id)}
                    disabled={revocandoId === pedido.id}
                    style={styles.revocarBtn}
                  >
                    {revocandoId === pedido.id
                      ? 'Procesando revocación...'
                      : '🛡️ Botón de Arrepentimiento (Revocar compra sin costo)'}
                  </button>
                ) : (
                  <span style={styles.noRevocarInfo}>
                    {pedido.estado === 'revocado'
                      ? '✓ Compra revocada con éxito'
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '3rem 1.5rem 5rem 1.5rem',
    minHeight: '75vh',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tagBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    marginBottom: '0.4rem',
  },
  pageTitle: {
    fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 0.4rem 0',
  },
  pageSubtitle: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '0.95rem',
    maxWidth: '650px',
    lineHeight: '1.5',
  },
  backStoreBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
  },
  centerCard: {
    backgroundColor: '#131b2e',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '3.5rem 2rem',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    maxWidth: '540px',
    margin: '3rem auto',
  },
  spinner: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    animation: 'spin 2s linear infinite',
  },
  loadingTitle: {
    fontSize: '1.3rem',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  subtext: {
    color: '#94a3b8',
    margin: '0 0 1.5rem 0',
    fontSize: '0.92rem',
    lineHeight: '1.5',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: '16px',
    padding: '2.5rem',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    maxWidth: '540px',
    margin: '3rem auto',
  },
  errorTitle: {
    fontSize: '1.3rem',
    margin: '12px 0 8px 0',
  },
  errorText: {
    margin: '0 0 16px 0',
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#131b2e',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '4rem 2rem',
    textAlign: 'center',
    maxWidth: '560px',
    margin: '3rem auto',
  },
  emptyTitle: {
    fontSize: '1.4rem',
    color: '#ffffff',
    margin: '16px 0 8px 0',
  },
  emptySubtext: {
    color: '#94a3b8',
    maxWidth: '440px',
    margin: '0 auto 1.75rem auto',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  primaryBtn: {
    display: 'inline-block',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    padding: '0.75rem 1.6rem',
    borderRadius: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  statusBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '0.95rem',
    marginBottom: '2rem',
  },
  pedidosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  pedidoCard: {
    backgroundColor: '#131b2e',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  pedidoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  pedidoId: {
    margin: '0 0 4px 0',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  fechaText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  estadoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  estadoBadge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '800',
    border: '1px solid transparent',
  },
  totalText: {
    fontSize: '1.35rem',
    fontWeight: '900',
    color: '#10b981',
    fontFamily: 'var(--font-heading)',
  },
  codigoBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '0.65rem 1rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    marginBottom: '1rem',
  },
  codeHighlight: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '0.15rem 0.4rem',
    borderRadius: '6px',
    fontWeight: '700',
  },
  itemsSection: {
    marginBottom: '1.25rem',
  },
  itemsTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.92rem',
    color: '#cbd5e1',
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    padding: '0.65rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  pedidoFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1rem',
  },
  revocarBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '10px',
    padding: '0.65rem 1.25rem',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  noRevocarInfo: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
};

export default MisPedidos;
