import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMisDatos, exportarMisDatos, eliminarCuenta } from '../services/api';

export function MisDatos() {
  const { token, logout, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inputEliminar, setInputEliminar] = useState('');
  const [descargando, setDescargando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const cargarPerfil = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMisDatos(token);
      setPerfil(data);
    } catch (err) {
      setError(err.message || 'Error al cargar perfil de usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, [token]);

  // Habilitando la descarga de información en formato JSON mediante fetch y un blob
  const handleDescargarDatos = async () => {
    setDescargando(true);
    try {
      const data = await exportarMisDatos(token);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `mis_datos_personales_${perfil?.id || 'usuario'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      success("✓ Archivo JSON con tus datos descargado correctamente.");
    } catch (err) {
      const msg = err.message || 'Error al exportar los datos en formato JSON.';
      toastError(msg);
      alert(msg);
    } finally {
      setDescargando(false);
    }
  };

  // Eliminación de cuenta que requiere escribir la palabra "ELIMINAR"
  const handleEliminarCuenta = async (e) => {
    e.preventDefault();
    setErrorEliminar(null);

    if (inputEliminar.trim() !== 'ELIMINAR') {
      setErrorEliminar('Debes escribir exactamente la palabra "ELIMINAR" para confirmar.');
      return;
    }

    if (!window.confirm('⚠️ ¿Estás completamente seguro de eliminar tu cuenta? Esta acción borrará permanentemente tus datos.')) {
      return;
    }

    setEliminando(true);
    try {
      await eliminarCuenta(token);
      logout();
      success("Tu cuenta ha sido eliminada permanentemente.");
      navigate('/');
    } catch (err) {
      setErrorEliminar(err.message || 'Error al procesar la eliminación de la cuenta');
      toastError('Error al eliminar cuenta.');
    } finally {
      setEliminando(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.centerBox}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Inicia sesión para gestionar tus datos</h2>
          <Link to="/login" style={styles.primaryBtn}>
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerBox}>
          <span style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</span>
          <p style={styles.loadingText}>Cargando datos personales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button onClick={cargarPerfil} style={styles.retryBtn}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.tagBadge}>🛡️ Privacidad & Datos</div>
          <h1 style={styles.title}>Mis Datos Personales</h1>
          <p style={styles.subtitle}>Gestión de privacidad, consentimiento y exportación de información</p>
        </div>
        <Link to="/" style={styles.backBtn}>
          ← Volver a la Tienda
        </Link>
      </div>

      {perfil && (
        <div style={styles.grid}>
          {/* Tarjeta de Información General */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👤 Información de Perfil</h2>
            <div style={styles.infoRow}>
              <span style={styles.label}>Nombre completo:</span>
              <span style={styles.value}>{perfil.nombre}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Correo electrónico:</span>
              <span style={styles.value}>{perfil.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Rol asignado:</span>
              <span style={styles.valueRole}>{perfil.rol}</span>
            </div>
          </div>

          {/* Tarjeta de Consentimiento Legal */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📜 Consentimiento de Datos</h2>
            <div style={styles.infoRow}>
              <span style={styles.label}>Tratamiento de datos aceptado:</span>
              <span style={{ color: perfil.acepto_tratamiento ? '#34d399' : '#f87171', fontWeight: '700' }}>
                {perfil.acepto_tratamiento ? '✔ Aceptado' : '❌ No Aceptado'}
              </span>
            </div>

            {/* Exponiendo la fecha en que se dio el consentimiento */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Fecha de consentimiento:</span>
              <span style={styles.valueHighlight}>
                {perfil.fecha_consentimiento
                  ? new Date(perfil.fecha_consentimiento).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Fecha no registrada'}
              </span>
            </div>

            <div style={styles.exportSection}>
              <p style={styles.exportDesc}>
                Puedes descargar una copia íntegra de toda tu información registrada en formato estructurado JSON.
              </p>
              <button
                onClick={handleDescargarDatos}
                disabled={descargando}
                style={styles.downloadBtn}
              >
                {descargando ? 'Generando archivo JSON...' : '📥 Descargar mis datos (JSON)'}
              </button>
            </div>
          </div>

          {/* Tarjeta de Eliminación de Cuenta */}
          <div style={{ ...styles.card, borderColor: 'rgba(239, 68, 68, 0.3)', gridColumn: '1 / -1' }}>
            <h2 style={{ ...styles.cardTitle, color: '#f87171' }}>⚠️ Zona de Peligro: Eliminar Cuenta</h2>
            <p style={styles.deleteWarning}>
              Al eliminar tu cuenta se borrarán permanentemente tus datos personales y se cerrará la sesión de forma inmediata.
              Para confirmar, escribe la palabra <strong style={{ color: '#f87171' }}>ELIMINAR</strong> a continuación:
            </p>

            {errorEliminar && <div style={styles.errorBoxAlert}>⚠️ {errorEliminar}</div>}

            <form onSubmit={handleEliminarCuenta} style={styles.deleteForm}>
              <input
                type="text"
                value={inputEliminar}
                onChange={(e) => setInputEliminar(e.target.value)}
                placeholder="Escribe ELIMINAR"
                style={styles.deleteInput}
              />
              <button
                type="submit"
                disabled={eliminando || inputEliminar.trim() !== 'ELIMINAR'}
                style={{
                  ...styles.deleteBtn,
                  opacity: inputEliminar.trim() === 'ELIMINAR' ? 1 : 0.45,
                  cursor: inputEliminar.trim() === 'ELIMINAR' ? 'pointer' : 'not-allowed',
                }}
              >
                {eliminando ? 'Eliminando...' : '🗑️ Confirmar y Eliminar Mi Cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
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
  title: {
    fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 0.4rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '0.95rem',
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
  },
  centerBox: {
    textAlign: 'center',
    padding: '4rem 1rem',
    backgroundColor: '#131b2e',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    maxWidth: '520px',
    margin: '3rem auto',
  },
  primaryBtn: {
    display: 'inline-block',
    backgroundColor: '#6366f1',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  loadingText: {
    color: '#a5b4fc',
    fontWeight: '600',
    marginTop: '1rem',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '1.5rem',
    borderRadius: '14px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  retryBtn: {
    marginTop: '10px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.75rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    margin: '0 0 1.25rem 0',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '0.92rem',
  },
  label: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  value: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  valueRole: {
    textTransform: 'uppercase',
    fontWeight: '800',
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
  },
  valueHighlight: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: '0.88rem',
  },
  exportSection: {
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  exportDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: '0 0 1rem 0',
    lineHeight: '1.4',
  },
  downloadBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.25rem',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  deleteWarning: {
    color: '#cbd5e1',
    fontSize: '0.92rem',
    lineHeight: '1.5',
    marginBottom: '1.25rem',
  },
  errorBoxAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  deleteForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  deleteInput: {
    flexGrow: 1,
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    color: '#fff',
    fontSize: '0.95rem',
    minWidth: '220px',
    outline: 'none',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.4rem',
    fontWeight: '800',
    fontSize: '0.92rem',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
  },
};

export default MisDatos;
