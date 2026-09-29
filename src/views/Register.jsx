import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [aceptoTratamiento, setAceptoTratamiento] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación preventiva en cliente
    if (!aceptoTratamiento) {
      setError('Debes aceptar el tratamiento de datos personales para registrarte.');
      return;
    }

    setLoading(true);

    try {
      await register({
        nombre,
        email,
        password,
        acepto_tratamiento: aceptoTratamiento,
        rol,
      });

      // Iniciar sesión automáticamente tras registro exitoso
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear Cuenta</h1>
        <p style={styles.subtitle}>Únete a la plataforma IRESM E-Commerce</p>

        {error && <div style={styles.errorBox}>{error}</div>}

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
              placeholder="ejemplo@correo.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña *</label>
            <input
              type="password"
              required
              minLength={6}
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
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador (Demo)</option>
            </select>
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
            {loading ? 'Creando Cuenta...' : 'Registrarse'}
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
    margin: '40px auto',
    padding: '0 16px',
    minHeight: '65vh',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#64748b',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    marginBottom: '16px',
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
  label: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    backgroundColor: '#ffffff',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '4px',
  },
  checkbox: {
    marginTop: '3px',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '700',
    fontSize: '1rem',
    marginTop: '8px',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '0.9rem',
    color: '#64748b',
    textAlign: 'center',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;
