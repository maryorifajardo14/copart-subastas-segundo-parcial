import { Link } from 'react-router-dom';
import DamageBadge from './DamageBadge';
import Countdown from './Countdown';

const ESTADOS = {
  pendiente: { texto: 'Próximamente', clase: 'estado estado--pendiente' },
  activa: { texto: 'En subasta', clase: 'estado estado--activa' },
  cerrada_vendida: { texto: 'Vendida', clase: 'estado estado--vendida' },
  cerrada_desierta: { texto: 'Desierta', clase: 'estado estado--desierta' },
};

export default function VehicleCard({ subasta }) {
  const estado = ESTADOS[subasta.estado] || ESTADOS.pendiente;

  return (
    <Link to={`/subastas/${subasta.subasta_id}`} className="card">
      <div className="card__imagen">
        <img src={subasta.foto_portada} alt={`${subasta.marca} ${subasta.modelo}`} loading="lazy" />
        <span className={estado.clase}>{estado.texto}</span>
      </div>
      <div className="card__body">
        <h3>{subasta.marca} {subasta.modelo} <small>{subasta.anio}</small></h3>
        <p className="card__meta">{subasta.tipo_articulo} · {subasta.tipo_combustible} · {subasta.tren_manejo}</p>
        <DamageBadge nivel={subasta.nivel_dano} />
        <div className="card__precio">
          <span className="card__precio-label">Puja actual</span>
          <strong>Q {Number(subasta.precio_actual).toLocaleString('es-GT')}</strong>
        </div>
        <div className="card__footer">
          <span>{subasta.total_pujas} {Number(subasta.total_pujas) === 1 ? 'oferta' : 'ofertas'}</span>
          {subasta.estado === 'activa' && <Countdown fechaCierre={subasta.fecha_cierre} />}
        </div>
      </div>
    </Link>
  );
}
