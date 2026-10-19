import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { crearProducto, actualizarProducto, subirImagenProducto } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export function AdminProductModal({ productoEditar, onClose, onSaveSuccess }) {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef(null);

  const [nombre, setNombre] = useState(productoEditar?.nombre || '');
  const [descripcion, setDescripcion] = useState(productoEditar?.descripcion || '');
  const [precioFinal, setPrecioFinal] = useState(productoEditar?.precio_final || '');
  const [cuotasCantidad, setCuotasCantidad] = useState(productoEditar?.cuotas_cantidad ?? 3);
  const [stock, setStock] = useState(productoEditar?.stock ?? 50);
  const [imagenUrl, setImagenUrl] = useState(productoEditar?.imagen_url || productoEditar?.imagen || '');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  // (cuotas_valor y garantia_meses no forman parte del schema ProductoCreate de la API)

  // Preview generation & memory cleanup
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen supera el tamaño máximo permitido de 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleLimpiarArchivo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubiendo(true);

    try {
      let finalImagenPath = imagenUrl.trim() || null;

      // Upload file with exact 'archivo' FormData field
      if (selectedFile) {
        const uploadRes = await subirImagenProducto(selectedFile, token);
        finalImagenPath = uploadRes.url || null;
      }

      // ⚠️ Payload exacto según el schema ProductoCreate de FastAPI:
      //   Requeridos: nombre (str), descripcion (str), precio_final (float)
      //   Opcionales: cuotas_cantidad (int), stock (int), imagen_url (str|null)
      //   Campos que NO existen en la API: cuotas_valor, garantia_meses, imagen
      const prodPayload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || nombre.trim(), // descripcion es requerida
        precio_final: Number(precioFinal),
        cuotas_cantidad: Number(cuotasCantidad) || 3,
        stock: Number(stock) || 0,
        imagen_url: finalImagenPath,  // 'imagen_url' es el nombre exacto de la API
      };

      if (productoEditar && productoEditar.id) {
        await actualizarProducto(productoEditar.id, prodPayload, token);
        success(`✓ Sticker "${nombre}" actualizado con éxito.`);
      } else {
        await crearProducto(prodPayload, token);
        success(`✓ Sticker "${nombre}" creado exitosamente.`);
      }

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      const msg = err.message || 'Error al guardar el producto.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <span style={styles.headerIcon}>{productoEditar ? '✏️' : '✨'}</span>
            <div>
              <h2 style={styles.title}>
                {productoEditar ? 'Editar Sticker' : 'Nuevo Sticker en Catálogo'}
              </h2>
              <p style={styles.subtitle}>
                {productoEditar ? `Modificando ID #${productoEditar.id}` : 'Crear un nuevo producto en Render PostgreSQL'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Nombre */}
          <div style={styles.field}>
            <label style={styles.label}>Nombre del Sticker *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
              placeholder="Ej: Sticker React Holographic Pro"
            />
          </div>

          {/* Descripción (requerida por el schema de la API) */}
          <div style={styles.field}>
            <label style={styles.label}>Descripción *</label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={styles.input}
              placeholder="Ej: Sticker holográfico premium resistente al agua"
            />
          </div>

          {/* Precio y Stock */}
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Precio Final ($ ARS) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={precioFinal}
                onChange={(e) => setPrecioFinal(e.target.value)}
                style={styles.input}
                placeholder="4500"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Stock Disponible (Unidades) *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={styles.input}
                placeholder="50"
              />
            </div>
          </div>

          {/* Cuotas (solo cant. cuotas existe en la API) */}
          <div style={styles.field}>
            <label style={styles.label}>Cantidad de Cuotas</label>
            <input
              type="number"
              min="1"
              max="24"
              value={cuotasCantidad}
              onChange={(e) => setCuotasCantidad(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Subida de Imagen con input file y URL alternativa */}
          <div style={styles.imageUploadSection}>
            <label style={styles.label}>Imagen del Producto</label>
            <div style={styles.uploadControls}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleLimpiarArchivo}
                  style={styles.clearFileBtn}
                >
                  ✕ Limpiar selección
                </button>
              )}
            </div>

            {/* URL manual si no se sube archivo */}
            <div style={{ marginTop: '0.65rem' }}>
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                style={styles.input}
                placeholder="O pegar URL directa de imagen (https://...)"
              />
            </div>
          </div>

          {/* Previsualización */}
          {previewUrl && (
            <div style={styles.previewBox}>
              <span style={styles.previewLabel}>Vista previa de nueva imagen:</span>
              <img src={previewUrl} alt="Preview" style={styles.previewImg} />
            </div>
          )}

          {!previewUrl && imagenUrl && (
            <div style={styles.previewBox}>
              <span style={styles.previewLabel}>Imagen actual:</span>
              <img
                src={imagenUrl.startsWith('http') ? imagenUrl : `${API_URL}/${imagenUrl}`}
                alt="Actual"
                style={styles.previewImg}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Botones de Acción */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={subiendo}
              style={{
                ...styles.submitBtn,
                opacity: subiendo ? 0.7 : 1,
                cursor: subiendo ? 'not-allowed' : 'pointer',
              }}
            >
              {subiendo ? 'Guardando en Servidor...' : (productoEditar ? 'Guardar Cambios' : 'Crear Sticker')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1.25rem',
  },
  modal: {
    backgroundColor: '#131b2e',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    maxWidth: '580px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.75rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.25)',
    animation: 'fadeIn 0.25s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '1rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerIcon: {
    fontSize: '1.8rem',
  },
  title: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    marginBottom: '1.25rem',
    fontSize: '0.88rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.85rem',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#cbd5e1',
  },
  input: {
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '0.65rem 0.9rem',
    color: '#ffffff',
    fontSize: '0.92rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  imageUploadSection: {
    backgroundColor: 'rgba(9, 13, 22, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '0.85rem',
  },
  uploadControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.35rem',
  },
  fileInput: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  clearFileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
    alignSelf: 'flex-start',
  },
  previewImg: {
    maxHeight: '130px',
    borderRadius: '8px',
    objectFit: 'contain',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.85rem',
    marginTop: '0.85rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1rem',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.65rem 1.25rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.65rem 1.5rem',
    fontWeight: '800',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
};

export default AdminProductModal;
