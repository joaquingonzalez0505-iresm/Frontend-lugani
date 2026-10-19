import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { crearProducto, actualizarProducto, subirImagenProducto } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export function AdminProductModal({ productoEditar, onClose, onSaveSuccess }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [nombre, setNombre] = useState(productoEditar?.nombre || '');
  const [precioFinal, setPrecioFinal] = useState(productoEditar?.precio_final || '');
  const [cuotasCantidad, setCuotasCantidad] = useState(productoEditar?.cuotas_cantidad || 1);
  const [cuotasValor, setCuotasValor] = useState(productoEditar?.cuotas_valor || 0);
  const [garantiaMeses, setGarantiaMeses] = useState(productoEditar?.garantia_meses || 0);
  const [stock, setStock] = useState(productoEditar?.stock || 0);
  const [imagenUrl, setImagenUrl] = useState(productoEditar?.imagen || '');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  // Generación de vista previa y liberación de memoria con URL.revokeObjectURL en useEffect
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Función de limpieza para liberar memoria
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // Selección del archivo con validaciones preventivas de tamaño y tipo
  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validación preventiva de tipo
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      return;
    }

    // Validación preventiva de tamaño (Máx 5MB)
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
      fileInputRef.current.value = ''; // Limpiado mediante la referencia useRef
    }
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubiendo(true);

    try {
      let finalImagenPath = imagenUrl;

      // Si hay un archivo seleccionado, primero subimos la imagen enviando FormData con el campo exacto "archivo"
      if (selectedFile) {
        const uploadRes = await subirImagenProducto(selectedFile, token);
        finalImagenPath = uploadRes.url;
      }

      const prodPayload = {
        nombre,
        precio_final: parseFloat(precioFinal),
        cuotas_cantidad: parseInt(cuotasCantidad, 10),
        cuotas_valor: parseFloat(cuotasValor),
        garantia_meses: parseInt(garantiaMeses, 10),
        stock: parseInt(stock, 10),
        imagen: finalImagenPath,
      };

      if (productoEditar && productoEditar.id) {
        await actualizarProducto(productoEditar.id, prodPayload, token);
      } else {
        await crearProducto(prodPayload, token);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el producto.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {productoEditar ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre del Producto *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
              placeholder="Ej: Sticker Laptop Pro"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Precio Final ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={precioFinal}
                onChange={(e) => setPrecioFinal(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Stock Disponible *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Cantidad de Cuotas</label>
              <input
                type="number"
                value={cuotasCantidad}
                onChange={(e) => setCuotasCantidad(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Valor de Cuota ($)</label>
              <input
                type="number"
                step="0.01"
                value={cuotasValor}
                onChange={(e) => setCuotasValor(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Garantía (Meses)</label>
              <input
                type="number"
                value={garantiaMeses}
                onChange={(e) => setGarantiaMeses(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Subida de Imagen con input de tipo file SIN atributo value */}
          <div style={styles.field}>
            <label style={styles.label}>Imagen del Producto</label>
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
                Limpiar selección
              </button>
            )}
          </div>

          {/* Vista previa con URL.createObjectURL liberando memoria */}
          {previewUrl && (
            <div style={styles.previewContainer}>
              <p style={styles.previewLabel}>Vista previa de la nueva imagen:</p>
              <img src={previewUrl} alt="Previsualización" style={styles.previewImg} />
            </div>
          )}

          {!previewUrl && imagenUrl && (
            <div style={styles.previewContainer}>
              <p style={styles.previewLabel}>Imagen actual:</p>
              <img src={imagenUrl.startsWith('http') ? imagenUrl : `${API_URL}${imagenUrl}`} alt="Actual" style={styles.previewImg} />
            </div>
          )}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={subiendo} style={styles.submitBtn}>
              {subiendo ? 'Guardando...' : 'Guardar Producto'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  label: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  fileInput: {
    fontSize: '0.9rem',
  },
  clearFileBtn: {
    marginTop: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  previewContainer: {
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
  },
  previewLabel: {
    margin: '0 0 6px 0',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  previewImg: {
    maxHeight: '120px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default AdminProductModal;
