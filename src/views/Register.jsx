import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Register() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [aceptoTratamiento, setAceptoTratamiento] = useState(true);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!aceptoTratamiento) {
      setError('Debes aceptar el tratamiento de datos personales para registrarte.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        nombre,
        email,
        password,
        acepto_tratamiento: aceptoTratamiento,
        rol,
      });

      if (res.success) {
        success(`🎉 ¡Cuenta creada con éxito! Bienvenido, ${nombre}`);
        if (res.user?.es_admin || rol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(res.error || 'Error al registrar usuario.');
        toastError(res.error || 'Error al registrar usuario.');
      }
    } catch (err) {
      const msg = err.message || 'Error al registrar usuario.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandBadge}>
          <span>✨ NUEVO USUARIO</span>
        </div>

        <h1 style={styles.title}>Crear Cuenta</h1>
        <p style={styles.subtitle}>Únete a la plataforma Sticker Lab // Merch & Devs</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre Completo *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Correo Electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumno@iresm.edu.ar"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña *</label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tipo de Usuario / Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={styles.select}
            >
              <option value="cliente">Cliente (Catálogo y Compras)</option>
              <option value="admin">Administrador (Gestor Completo CRUD)</option>
            </select>
            <span style={styles.hintText}>
              💡 Podés elegir Administrador para evaluar el panel de control.
            </span>
          </div>

          {/* Checkbox obligatorio de Aceptación de Tratamiento de Datos */}
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="acepto_tratamiento"
              checked={aceptoTratamiento}
              onChange={(e) => setAceptoTratamiento(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="acepto_tratamiento" style={styles.checkboxLabel}>
              Acepto explícitamente el tratamiento de mis datos personales y los términos de privacidad *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !aceptoTratamiento}
            style={{
              ...styles.submitBtn,
              opacity: loading || !aceptoTratamiento ? 0.6 : 1,
              cursor: loading || !aceptoTratamiento ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creando Cuenta...' : 'Registrarse en Sticker Lab'}
          </button>
        </form>

        <p style={styles.footerText}>
          ¿Ya posees una cuenta?{' '}
          <Link to="/login" style={styles.link}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '480px',
    margin: '3.5rem auto 5rem auto',
    padding: '0 1.25rem',
    minHeight: '65vh',
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2.5rem 2rem',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
  },
  brandBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.4rem 0',
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    margin: '0 0 1.5rem 0',
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    marginBottom: '1.25rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
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
    padding: '0.7rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    color: '#ffffff',
    fontSize: '0.92rem',
    outline: 'none',
  },
  select: {
    padding: '0.7rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    color: '#ffffff',
    fontSize: '0.92rem',
    outline: 'none',
    cursor: 'pointer',
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.2rem',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    marginTop: '0.25rem',
  },
  checkbox: {
    marginTop: '0.2rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '0.85rem',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    marginTop: '0.5rem',
  },
  footerText: {
    marginTop: '1.5rem',
    fontSize: '0.88rem',
    color: '#94a3b8',
    textAlign: 'center',
  },
  link: {
    color: '#a5b4fc',
    fontWeight: '700',
    textDecoration: 'none',
  },
};

export default Register;
