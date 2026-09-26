import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import DamageBadge from '../components/DamageBadge';

const TEXTO_ESTADO = {
  pendiente: 'Próximamente',
  activa: 'En subasta',
  cerrada_vendida: 'Vendida',
  cerrada_desierta: 'Desierta',
};

export default function MyListings() {
  const [q, setQ] = useState('');
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api.misPublicaciones(q).then((d) => setVehiculos(d.vehiculos)).catch((err) => setError(err.message));
  }, [q]);

  useEffect(() => { cargar(); }, [cargar]);

  async function onEliminar(id) {
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    try {
      await api.eliminarVehiculo(id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="pagina">
      <h1>Mis publicaciones</h1>
      <input
        className="filtros__buscar"
        type="text"
        placeholder="Buscar en mis publicaciones por marca o modelo..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {error && <p className="mensaje mensaje--error">{error}</p>}
      {vehiculos.length === 0 && <p className="mensaje">Aún no tienes publicaciones.</p>}

      <div className="tabla-contenedor">
        <table className="tabla-publicaciones">
          <thead>
            <tr>
              <th></th><th>Vehículo</th><th>Daño</th><th>Estado</th><th>Precio base</th><th>Puja actual</th><th></th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.vehiculo_id}>
                <td><img src={v.foto_portada} alt="" className="tabla-publicaciones__miniatura" /></td>
                <td><Link to={`/subastas/${v.subasta_id}`}>{v.marca} {v.modelo} ({v.anio})</Link></td>
                <td><DamageBadge nivel={v.nivel_dano} /></td>
                <td>{TEXTO_ESTADO[v.estado]}</td>
                <td>Q {Number(v.precio_base).toLocaleString('es-GT')}</td>
                <td>Q {Number(v.precio_actual).toLocaleString('es-GT')}</td>
                <td className="tabla-publicaciones__acciones">
                  {v.estado === 'pendiente' ? (
                    <>
                      <Link className="btn btn--ghost btn--pequeno" to={`/editar/${v.vehiculo_id}`}>Editar</Link>
                      <button className="btn btn--ghost btn--pequeno" onClick={() => onEliminar(v.vehiculo_id)}>Eliminar</button>
                    </>
                  ) : (
                    <span className="tabla-publicaciones__nota">No editable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
