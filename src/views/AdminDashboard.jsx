import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AdminProductModal from '../components/AdminProductModal';
import { getProductos, eliminarProducto, getPedidosAdmin } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export default function AdminDashboard() {
  const { user, token, esAdmin, login, logout } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  // Admin login form states (if user not authenticated)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'productos' | 'pedidos'
  const [tabActiva, setTabActiva] = useState('productos');

  // Products state
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [searchProd, setSearchProd] = useState('');

  // Orders state
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState('todos');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  // Modals state
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Load products
  const cargarProductos = async () => {
    setLoadingProductos(true);
    try {
      const data = await getProductos({ limit: 100 });
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar productos para admin:", err);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Load orders
  const cargarPedidos = async () => {
    if (!token) return;
    setLoadingPedidos(true);
    try {
      const data = await getPedidosAdmin(token);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar pedidos para admin:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    if (esAdmin) {
      cargarProductos();
      cargarPedidos();
    }
  }, [esAdmin, token]);

  // Handler for Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await login(adminEmail, adminPassword);
      if (res.success) {
        if (!res.user?.es_admin && res.user?.rol !== 'admin') {
          setLoginError('Esta cuenta no posee rol de Administrador. Contacta a un administrador o crea una cuenta con rol admin en Registro.');
        } else {
          success(`¡Bienvenido al Panel, ${res.user.nombre}!`);
        }
      } else {
        setLoginError(res.error || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Delete product action
  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;
    setEliminando(true);

    try {
      await eliminarProducto(productoAEliminar.id, token);
      success(`✓ Sticker "${productoAEliminar.nombre}" eliminado correctamente.`);
      setProductoAEliminar(null);
      await cargarProductos();
    } catch (err) {
      const msg = err.message || 'Error al eliminar producto.';
      toastError(msg);
      alert(msg);
    } finally {
      setEliminando(false);
    }
  };

  // Filtered products
  const productosFiltrados = useMemo(() => {
    if (!searchProd.trim()) return productos;
    const q = searchProd.toLowerCase();
    return productos.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.id && p.id.toString().includes(q))
    );
  }, [productos, searchProd]);

  // Filtered orders
  const pedidosFiltrados = useMemo(() => {
    if (filtroEstadoPedido === 'todos') return pedidos;
    return pedidos.filter((p) => (p.estado || '').toLowerCase() === filtroEstadoPedido.toLowerCase());
  }, [pedidos, filtroEstadoPedido]);

  // Calculations for KPI summary cards
  const totalFacturacion = useMemo(() => {
    return pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  }, [pedidos]);

  const totalStock = useMemo(() => {
    return productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  }, [productos]);

  // 1. SCENARIO: NOT LOGGED IN -> Show Admin Login Form
  if (!user) {
    return (
      <div style={styles.accessContainer}>
        <div style={styles.loginCard}>
          <div style={styles.loginBadge}>
            <span>👑 ACCESO ADMINISTRATIVO</span>
          </div>
          <h2 style={styles.loginTitle}>Panel de Administrador</h2>
          <p style={styles.loginSubtitle}>
            Ingresa con tus credenciales autorizadas para gestionar stickers, catálogo y pedidos.
          </p>

          {loginError && <div style={styles.errorAlert}>⚠️ {loginError}</div>}

          <form onSubmit={handleAdminLogin} style={styles.loginForm}>
            <div style={styles.field}>
              <label style={styles.label}>Correo Electrónico (Admin)</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@stickerlab.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                ...styles.adminSubmitBtn,
                opacity: loginLoading ? 0.7 : 1,
              }}
            >
              {loginLoading ? 'Verificando privilegios...' : '🚀 Ingresar al Panel de Admin'}
            </button>
          </form>

          <div style={styles.demoNotice}>
            <p style={{ margin: 0, fontWeight: '700', color: '#f59e0b' }}>
              💡 ¿Estás en modo de evaluación o pruebas?
            </p>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Podés crear una cuenta con rol <strong>Administrador (Demo)</strong> desde la sección de{' '}
              <Link to="/register" style={{ color: '#6366f1', fontWeight: '700' }}>
                Registro
              </Link>.
            </p>
          </div>

          <Link to="/" style={styles.backLink}>
            ← Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  // 2. SCENARIO: LOGGED IN AS REGULAR CLIENT -> Access Denied / Guard
  if (user && !esAdmin) {
    return (
      <div style={styles.accessContainer}>
        <div style={styles.deniedCard}>
          <div style={styles.deniedIcon}>🛡️</div>
          <h2 style={styles.deniedTitle}>Acceso Denegado / Privilegios Insuficientes</h2>
          <p style={styles.deniedDesc}>
            Hola <strong>{user.nombre}</strong>. Has iniciado sesión con una cuenta de perfil{' '}
            <span style={styles.roleTagClient}>CLIENTE</span>. Las funciones de gestión de productos y pedidos globales están reservadas exclusivamente para administradores.
          </p>

          <div style={styles.clientOptionsBox}>
            <p style={styles.clientOptionsTitle}>Tus accesos habilitados:</p>
            <ul style={styles.clientOptionsList}>
              <li>✓ Navegar y comprar en el Catálogo de Stickers</li>
              <li>✓ Gestión de tu Carrito de compras</li>
              <li>✓ Consultar el historial de Mis Pedidos y Derecho de Revocación</li>
              <li>✓ Gestionar Mis Datos Personales y Consentimiento legal</li>
            </ul>
          </div>

          <div style={styles.deniedActions}>
            <Link to="/" style={styles.btnReturnStore}>
              🛍️ Ir a la Tienda
            </Link>
            <Link to="/mis-pedidos" style={styles.btnSecondaryNav}>
              📦 Mis Pedidos
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                info("Sesión cerrada. Ahora puedes ingresar con una cuenta Admin.");
              }}
              style={styles.btnSwitchAccount}
            >
              🔄 Cerrar Sesión para Cambiar de Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. SCENARIO: AUTHENTICATED AS ADMIN -> Full Admin Dashboard
  return (
    <div style={styles.dashboardContainer}>
      {/* Top Banner */}
      <div style={styles.topBanner}>
        <div>
          <div style={styles.adminBadgeRow}>
            <span style={styles.crownBadge}>👑 ADMINISTRADOR</span>
            <span style={styles.serverStatus}>● Render DB Conectado</span>
          </div>
          <h1 style={styles.dashboardTitle}>Panel de Administración</h1>
          <p style={styles.dashboardSubtitle}>
            Gestión en tiempo real de inventario de stickers, precios, stock y pedidos entrantes.
          </p>
        </div>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={() => {
              setProductoAEditar(null);
              setModalProductoAbierto(true);
            }}
            style={styles.btnAddSticker}
          >
            <span>➕</span> Agregar Nuevo Sticker
          </button>
          <Link to="/" style={styles.btnViewSite}>
            <span>👁️</span> Ver Tienda
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}>🏷️</div>
          <div>
            <span style={styles.statLabel}>Stickers en Catálogo</span>
            <div style={styles.statValue}>{productos.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>📦</div>
          <div>
            <span style={styles.statLabel}>Pedidos Registrados</span>
            <div style={styles.statValue}>{pedidos.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>💰</div>
          <div>
            <span style={styles.statLabel}>Facturación Global</span>
            <div style={styles.statValue}>${totalFacturacion.toLocaleString('es-AR')}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>⚡</div>
          <div>
            <span style={styles.statLabel}>Stock Total Unidades</span>
            <div style={styles.statValue}>{totalStock}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={styles.tabsBar}>
        <button
          type="button"
          onClick={() => setTabActiva('productos')}
          style={{
            ...styles.tabBtn,
            ...(tabActiva === 'productos' ? styles.tabBtnActive : {}),
          }}
        >
          <span>🏷️</span> Gestor de Productos (CRUD)
          <span style={styles.tabCount}>{productos.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('pedidos')}
          style={{
            ...styles.tabBtn,
            ...(tabActiva === 'pedidos' ? styles.tabBtnActive : {}),
          }}
        >
          <span>📦</span> Gestor de Pedidos
          <span style={styles.tabCount}>{pedidos.length}</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGER (CRUD) */}
      {tabActiva === 'productos' && (
        <div style={styles.sectionCard}>
          {/* Controls Bar */}
          <div style={styles.tableControls}>
            <div style={styles.searchBox}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Buscar por ID o nombre de sticker..."
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                style={styles.tableSearchInput}
              />
              {searchProd && (
                <button
                  type="button"
                  onClick={() => setSearchProd('')}
                  style={styles.clearBtn}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.tableStatsInfo}>
              Mostrando {productosFiltrados.length} de {productos.length} productos
            </div>
          </div>

          {loadingProductos ? (
            <div style={styles.loadingBox}>
              <span style={{ fontSize: '2rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</span>
              <p>Actualizando lista de productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div style={styles.emptyTableBox}>
              <p style={{ margin: 0, color: '#94a3b8' }}>No se encontraron productos con el filtro aplicado.</p>
            </div>
          ) : (
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Sticker</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Precio Final</th>
                    <th style={styles.th}>Cuotas</th>
                    <th style={styles.th}>Stock</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((prod) => {
                    const img = prod.imagen || prod.imagen_url || '';
                    const fullImg = img.startsWith('http') ? img : `${API_URL}/${img}`;
                    const precioNum = Number(prod.precio_final || prod.precio || 0);

                    return (
                      <tr key={prod.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.thumbWrapper}>
                            {img ? (
                              <img
                                src={fullImg}
                                alt={prod.nombre}
                                style={styles.tableImg}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerText = '✨';
                                }}
                              />
                            ) : (
                              <span>✨</span>
                            )}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{prod.nombre}</strong>
                          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>ID #{prod.id}</div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.priceHighlight}>
                            ${precioNum.toLocaleString('es-AR')}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.cuotasBadge}>
                            {prod.cuotas_cantidad || 1}x ${Number(prod.cuotas_valor || (precioNum / (prod.cuotas_cantidad || 1))).toFixed(0)}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.stockPill,
                              ...(prod.stock < 10 ? styles.stockPillLow : styles.stockPillOk),
                            }}
                          >
                            {prod.stock} unidades
                          </span>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionsRow}>
                            <button
                              type="button"
                              onClick={() => {
                                setProductoAEditar(prod);
                                setModalProductoAbierto(true);
                              }}
                              style={styles.btnEdit}
                              title="Editar producto"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductoAEliminar(prod)}
                              style={styles.btnDelete}
                              title="Eliminar producto"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDER MANAGER */}
      {tabActiva === 'pedidos' && (
        <div style={styles.sectionCard}>
          {/* Filter Bar */}
          <div style={styles.tableControls}>
            <div style={styles.filterGroup}>
              {['todos', 'completado', 'pendiente', 'revocado'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFiltroEstadoPedido(st)}
                  style={{
                    ...styles.chipFilter,
                    ...(filtroEstadoPedido === st ? styles.chipFilterActive : {}),
                  }}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={cargarPedidos}
              style={styles.btnRefresh}
            >
              🔄 Refrescar Pedidos
            </button>
          </div>

          {loadingPedidos ? (
            <div style={styles.loadingBox}>
              <span style={{ fontSize: '2rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</span>
              <p>Consultando pedidos en Render...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div style={styles.emptyTableBox}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
              <p style={{ margin: 0, color: '#94a3b8' }}>No hay pedidos registrados con el estado seleccionado.</p>
            </div>
          ) : (
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID Pedido</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Fecha & Hora</th>
                    <th style={styles.th}>Items</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Estado</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const fecha = pedido.fecha_creacion
                      ? new Date(pedido.fecha_creacion).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Fecha N/D';

                    const itemsCount = pedido.items ? pedido.items.length : 0;
                    const estado = (pedido.estado || 'completado').toLowerCase();

                    return (
                      <tr key={pedido.id} style={styles.tr}>
                        <td style={styles.td}>
                          <strong style={{ color: '#ffffff' }}>#{pedido.id}</strong>
                        </td>

                        <td style={styles.td}>
                          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>
                            {pedido.nombre_cliente || `Usuario ID #${pedido.usuario_id || 'N/D'}`}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{fecha}</span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.itemCountBadge}>
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <strong style={{ color: '#10b981', fontSize: '1rem' }}>
                            ${Number(pedido.total || 0).toLocaleString('es-AR')}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badgeStatus,
                              ...(estado === 'revocado'
                                ? styles.badgeRevocado
                                : estado === 'pendiente'
                                ? styles.badgePendiente
                                : styles.badgeCompletado),
                            }}
                          >
                            {estado === 'revocado' ? '⛔ Revocado' : estado === 'pendiente' ? '⏳ Pendiente' : '✓ Completado'}
                          </span>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setPedidoDetalle(pedido)}
                            style={styles.btnViewDetail}
                          >
                            👁️ Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {modalProductoAbierto && (
        <AdminProductModal
          productoEditar={productoAEditar}
          onClose={() => {
            setModalProductoAbierto(false);
            setProductoAEditar(null);
          }}
          onSaveSuccess={() => {
            cargarProductos();
          }}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {productoAEliminar && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmCard}>
            <span style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>⚠️</span>
            <h3 style={styles.confirmTitle}>¿Eliminar este sticker?</h3>
            <p style={styles.confirmDesc}>
              Estás por eliminar permanentemente <strong>"{productoAEliminar.nombre}"</strong> (ID #{productoAEliminar.id}) de la base de datos de Render. Esta acción no se puede deshacer.
            </p>

            <div style={styles.confirmActions}>
              <button
                type="button"
                onClick={() => setProductoAEliminar(null)}
                style={styles.btnCancelConfirm}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                style={styles.btnDangerConfirm}
              >
                {eliminando ? 'Eliminando...' : '🗑️ Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Pedido */}
      {pedidoDetalle && (
        <div style={styles.confirmOverlay}>
          <div style={{ ...styles.confirmCard, maxWidth: '540px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>
                Detalle del Pedido #{pedidoDetalle.id}
              </h3>
              <button
                type="button"
                onClick={() => setPedidoDetalle(null)}
                style={styles.closeModalBtn}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.88rem', color: '#94a3b8' }}>
              <span>Cliente: <strong style={{ color: '#fff' }}>{pedidoDetalle.nombre_cliente || 'N/D'}</strong></span>
              <span>Total: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>${Number(pedidoDetalle.total || 0).toLocaleString('es-AR')}</strong></span>
            </div>

            {pedidoDetalle.codigo_solicitud_revocacion && (
              <div style={styles.revocationNoticeBox}>
                <strong>⚠️ Código de Revocación Emitido:</strong> {pedidoDetalle.codigo_solicitud_revocacion}
              </div>
            )}

            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Artículos:</h4>
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pedidoDetalle.items && pedidoDetalle.items.length > 0 ? (
                pedidoDetalle.items.map((item, idx) => (
                  <div key={idx} style={styles.orderItemRow}>
                    <span>{item.cantidad}x <strong>{item.producto_nombre || item.nombre || `Producto #${item.producto_id}`}</strong></span>
                    <span>${((item.precio_unitario || item.precio_final || 0) * (item.cantidad || 1)).toLocaleString('es-AR')}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No se registraron items en el pedido.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPedidoDetalle(null)}
              style={styles.btnCloseDetail}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  dashboardContainer: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem 1.5rem',
  },
  topBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  adminBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '0.5rem',
  },
  crownBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    color: '#fbbf24',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
  },
  serverStatus: {
    color: '#10b981',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  dashboardTitle: {
    fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 0.4rem 0',
  },
  dashboardSubtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    margin: 0,
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    flexWrap: 'wrap',
  },
  btnAddSticker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.35rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  btnViewSite: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    padding: '0.75rem 1.2rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.92rem',
    textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: 'rgba(19, 27, 46, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    color: '#a5b4fc',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  tabsBar: {
    display: 'flex',
    gap: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '1.5rem',
    overflowX: 'auto',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '0.85rem 1.25rem',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    color: '#ffffff',
    borderBottomColor: '#6366f1',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
  },
  sectionCard: {
    backgroundColor: 'rgba(19, 27, 46, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '1.5rem',
  },
  tableControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 280px',
  },
  tableSearchInput: {
    width: '100%',
    backgroundColor: 'rgba(9, 13, 22, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.6rem 2rem 0.6rem 2.2rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.6rem',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  tableStatsInfo: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.85rem 1rem',
    color: '#94a3b8',
    fontSize: '0.78rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.15s ease',
  },
  td: {
    padding: '1rem',
    verticalAlign: 'middle',
  },
  thumbWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tableImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  priceHighlight: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#10b981',
  },
  cuotasBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  stockPill: {
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  stockPillOk: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#6ee7b7',
  },
  stockPillLow: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  btnEdit: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnDelete: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    color: '#fda4af',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  chipFilter: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    padding: '0.4rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  chipFilterActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    color: '#fff',
  },
  btnRefresh: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  itemCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  badgeStatus: {
    padding: '0.25rem 0.7rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
  },
  badgeCompletado: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  badgePendiente: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  badgeRevocado: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    color: '#fda4af',
    border: '1px solid rgba(244, 63, 94, 0.3)',
  },
  btnViewDetail: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f8fafc',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#94a3b8',
  },
  emptyTableBox: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  // Access Guard / Login styles
  accessContainer: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
  },
  loginCard: {
    backgroundColor: '#131b2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '2.5rem',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.15)',
  },
  loginBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    marginBottom: '1rem',
  },
  loginTitle: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 0.4rem 0',
  },
  loginSubtitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.4',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '0.75rem',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#cbd5e1',
  },
  input: {
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '0.7rem 0.9rem',
    color: '#ffffff',
    fontSize: '0.92rem',
    outline: 'none',
  },
  adminSubmitBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#090d16',
    border: 'none',
    padding: '0.85rem',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
    marginTop: '0.5rem',
  },
  demoNotice: {
    marginTop: '1.5rem',
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    borderRadius: '12px',
    padding: '0.9rem',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '1.25rem',
  },
  deniedCard: {
    backgroundColor: '#131b2e',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  deniedIcon: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  deniedTitle: {
    fontSize: '1.45rem',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 0.75rem 0',
  },
  deniedDesc: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    margin: '0 0 1.5rem 0',
  },
  roleTagClient: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '800',
  },
  clientOptionsBox: {
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    textAlign: 'left',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  clientOptionsTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#cbd5e1',
    textTransform: 'uppercase',
  },
  clientOptionsList: {
    margin: 0,
    paddingLeft: '1.2rem',
    color: '#94a3b8',
    fontSize: '0.88rem',
    lineHeight: '1.6',
  },
  deniedActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  btnReturnStore: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    padding: '0.75rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.92rem',
  },
  btnSecondaryNav: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.75rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.92rem',
  },
  btnSwitchAccount: {
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  // Modal confirm delete
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2100,
    padding: '1rem',
  },
  confirmCard: {
    backgroundColor: '#131b2e',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '18px',
    padding: '2rem',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
  },
  confirmTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  confirmDesc: {
    color: '#94a3b8',
    fontSize: '0.92rem',
    lineHeight: '1.5',
    margin: '0 0 1.5rem 0',
  },
  confirmActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
  },
  btnCancelConfirm: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#cbd5e1',
    padding: '0.65rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnDangerConfirm: {
    backgroundColor: '#ef4444',
    border: 'none',
    color: '#ffffff',
    padding: '0.65rem 1.4rem',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.1rem',
    cursor: 'pointer',
  },
  revocationNoticeBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.85rem',
    marginBottom: '0.85rem',
  },
  orderItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.88rem',
    color: '#cbd5e1',
  },
  btnCloseDetail: {
    width: '100%',
    marginTop: '1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    padding: '0.65rem',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
