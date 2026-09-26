import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="pagina"><p className="mensaje">Cargando...</p></div>;
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  return children;
}
