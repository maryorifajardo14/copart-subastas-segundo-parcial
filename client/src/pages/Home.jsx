import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import Filters from '../components/Filters';
import VehicleCard from '../components/VehicleCard';

export default function Home() {
  const [filtros, setFiltros] = useState({});
  const [subastas, setSubastas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api
      .listarSubastas(filtros)
      .then((data) => setSubastas(data.subastas))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [filtros]);

  useEffect(() => {
    cargar();
    // Refresco periódico del listado (precio actual / conteo de ofertas) sin recargar la página.
    const id = setInterval(cargar, 4000);
    return () => clearInterval(id);
  }, [cargar]);

  return (
    <div className="pagina">
      <section className="hero">
        <h1>Subasta tu próximo vehículo, en tiempo real</h1>
        <p>Explora el inventario global de vehículos en subasta estilo Copart. Regístrate para ofertar o publicar el tuyo.</p>
      </section>

      <Filters valores={filtros} onChange={setFiltros} />

      {error && <p className="mensaje mensaje--error">{error}</p>}
      {cargando && <p className="mensaje">Cargando inventario...</p>}

      {!cargando && subastas.length === 0 && (
        <p className="mensaje">No hay vehículos que coincidan con esos filtros.</p>
      )}

      <div className="grid-cards">
        {subastas.map((s) => (
          <VehicleCard key={s.subasta_id} subasta={s} />
        ))}
      </div>
    </div>
  );
}
