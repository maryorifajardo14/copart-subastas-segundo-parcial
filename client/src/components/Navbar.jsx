import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__marca">🚗 Copart<span>GT</span></Link>
      <nav className="navbar__links">
        <Link to="/">Inventario</Link>
        {usuario && <Link to="/publicar">Publicar vehículo</Link>}
        {usuario && <Link to="/mis-publicaciones">Mis publicaciones</Link>}
      </nav>
      <div className="navbar__auth">
        {usuario ? (
          <>
            <span className="navbar__usuario">Hola, {usuario.nombre}</span>
            <button
              className="btn btn--ghost"
              onClick={() => {
                cerrarSesion();
                navigate('/');
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn--ghost" to="/iniciar-sesion">Iniciar sesión</Link>
            <Link className="btn btn--primario" to="/registro">Registrarse</Link>
          </>
        )}
      </div>
    </header>
  );
}
