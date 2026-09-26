import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const VACIO = { nombre: '', apellido: '', correo: '', telefono: '', password: '' };

export default function Register() {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const data = await api.register(form);
      iniciarSesion(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina pagina--angosta">
      <h1>Crear cuenta</h1>
      <form className="formulario" onSubmit={onSubmit}>
        {error && <p className="mensaje mensaje--error">{error}</p>}
        <label>Nombre<input value={form.nombre} onChange={set('nombre')} required /></label>
        <label>Apellido<input value={form.apellido} onChange={set('apellido')} required /></label>
        <label>Correo electrónico<input type="email" value={form.correo} onChange={set('correo')} required /></label>
        <label>Teléfono<input value={form.telefono} onChange={set('telefono')} required /></label>
        <label>Contraseña segura<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
        <button className="btn btn--primario" type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link></p>
    </div>
  );
}
