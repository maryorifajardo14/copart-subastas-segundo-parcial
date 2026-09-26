import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import VehicleForm, { valoresIniciales } from '../components/VehicleForm';

export default function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.obtenerVehiculo(id).then((d) => setVehiculo(d.vehiculo)).catch((err) => setError(err.message));
  }, [id]);

  async function onSubmit(payload) {
    await api.actualizarVehiculo(id, payload);
    navigate('/mis-publicaciones');
  }

  if (error) return <div className="pagina"><p className="mensaje mensaje--error">{error}</p></div>;
  if (!vehiculo) return <div className="pagina"><p className="mensaje">Cargando...</p></div>;

  const bloqueado = vehiculo.estado !== 'pendiente';

  return (
    <div className="pagina">
      <h1>Editar publicación</h1>
      {bloqueado && (
        <p className="mensaje mensaje--error">
          Esta subasta ya inició o finalizó, por lo tanto ya no puede editarse. <Link to="/mis-publicaciones">Volver a mis publicaciones</Link>
        </p>
      )}
      <VehicleForm inicial={valoresIniciales(vehiculo)} onSubmit={onSubmit} textoBoton="Guardar cambios" deshabilitado={bloqueado} />
    </div>
  );
}
