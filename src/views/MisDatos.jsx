import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMisDatos, exportarMisDatos, eliminarCuenta } from '../services/api';

export function MisDatos() {
  const { token, logout } = useAuth();
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
    } catch (err) {
      alert(err.message || 'Error al exportar los datos en formato JSON.');
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
      // Vaciar la sesión y volver al inicio
      logout();
      navigate('/');
    } catch (err) {
      setErrorEliminar(err.message || 'Error al procesar la eliminación de la cuenta');
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerBox}>
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
      <h1 style={styles.title}>Mis Datos Personales</h1>
      <p style={styles.subtitle}>Gestión de privacidad, consentimiento y exportación de información</p>

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
              <span style={{ color: perfil.acepto_tratamiento ? '#059669' : '#dc2626', fontWeight: '700' }}>
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
                {descargando ? 'Generando JSON...' : '📥 Descargar mis datos (JSON)'}
              </button>
            </div>
          </div>

          {/* Tarjeta de Eliminación de Cuenta */}
          <div style={{ ...styles.card, borderColor: '#fecaca', gridColumn: '1 / -1' }}>
            <h2 style={{ ...styles.cardTitle, color: '#dc2626' }}>⚠️ Zona de Peligro: Eliminar Cuenta</h2>
            <p style={styles.deleteWarning}>
              Al eliminar tu cuenta se borrarán permanentemente tus datos personales y se cerrará la sesión de forma inmediata.
              Para confirmar, escribe la palabra <strong style={{ color: '#dc2626' }}>ELIMINAR</strong> a continuación:
            </p>

            {errorEliminar && <div style={styles.errorBoxAlert}>{errorEliminar}</div>}

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
                  opacity: inputEliminar.trim() === 'ELIMINAR' ? 1 : 0.5,
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 16px',
    minHeight: '75vh',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#64748b',
    margin: '0 0 28px 0',
    fontSize: '0.95rem',
  },
  centerBox: {
    textAlign: 'center',
    padding: '48px 0',
  },
  loadingText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '10px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '10px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '0.95rem',
  },
  label: {
    color: '#64748b',
    fontWeight: '500',
  },
  value: {
    color: '#0f172a',
    fontWeight: '600',
  },
  valueRole: {
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#2563eb',
    fontSize: '0.85rem',
  },
  valueHighlight: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  exportSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  exportDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  downloadBtn: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
  },
  deleteWarning: {
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  errorBoxAlert: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '12px',
    border: '1px solid #fecaca',
  },
  deleteForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  deleteInput: {
    flexGrow: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    minWidth: '200px',
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
};

export default MisDatos;
