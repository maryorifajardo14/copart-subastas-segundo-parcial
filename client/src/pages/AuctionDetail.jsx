import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Carousel from '../components/Carousel';
import DamageBadge from '../components/DamageBadge';
import Countdown from '../components/Countdown';

const TEXTO_ESTADO = {
  pendiente: 'Esta subasta aún no ha iniciado.',
  activa: 'Subasta en curso.',
  cerrada_vendida: 'Subasta finalizada: vehículo vendido.',
  cerrada_desierta: 'Subasta finalizada: se declaró desierta (sin ofertas suficientes).',
};

export default function AuctionDetail() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(() => {
    api
      .obtenerSubasta(id)
      .then(setDatos)
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    cargar();
    // Sondeo periódico: refleja nuevas pujas de otros usuarios sin recargar la página (F5 prohibido).
    const intervalo = setInterval(cargar, 2500);
    return () => clearInterval(intervalo);
  }, [cargar]);

  if (error) return <div className="pagina"><p className="mensaje mensaje--error">{error}</p></div>;
  if (!datos) return <div className="pagina"><p className="mensaje">Cargando subasta...</p></div>;

  const { subasta, vehiculo, mi_estado: miEstado } = datos;

  async function onOfertar(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!usuario) {
      navigate('/iniciar-sesion');
      return;
    }

    setEnviando(true);
    try {
      await api.ofertar(id, Number(monto));
      setMensaje('¡Oferta registrada con éxito!');
      setMonto('');
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const puedeOfertar = usuario && !miEstado.soy_dueno && subasta.estado === 'activa';

  return (
    <div className="pagina">
      <div className="detalle">
        <div className="detalle__galeria">
          <Carousel fotos={vehiculo.fotos} />
        </div>

        <div className="detalle__info">
          <h1>{vehiculo.marca} {vehiculo.modelo} <small>{vehiculo.anio}</small></h1>
          <DamageBadge nivel={vehiculo.nivel_dano} />
          {vehiculo.descripcion_dano && <p className="detalle__descripcion-dano">{vehiculo.descripcion_dano}</p>}

          <table className="ficha-tecnica">
            <tbody>
              <tr><th>Tipo de artículo</th><td>{vehiculo.tipo_articulo}</td></tr>
              <tr><th>Motor</th><td>{vehiculo.motor}</td></tr>
              <tr><th>Transmisión</th><td>{vehiculo.transmision}</td></tr>
              <tr><th>Combustible</th><td>{vehiculo.tipo_combustible}</td></tr>
              <tr><th>Tren de manejo</th><td>{vehiculo.tren_manejo}</td></tr>
              <tr><th>Cilindros</th><td>{vehiculo.num_cilindros}</td></tr>
            </tbody>
          </table>

          <div className="subasta-box">
            <p className="subasta-box__estado">{TEXTO_ESTADO[subasta.estado]}</p>

            <div className="subasta-box__precio">
              <span>Puja actual</span>
              <strong>Q {Number(subasta.precio_actual).toLocaleString('es-GT')}</strong>
            </div>

            {subasta.estado === 'activa' && (
              <p className="subasta-box__tiempo">Cierra en: <Countdown fechaCierre={subasta.fecha_cierre} onFinalizar={cargar} /></p>
            )}

            <p className="subasta-box__total">{subasta.total_pujas} {subasta.total_pujas === 1 ? 'oferta registrada' : 'ofertas registradas'}</p>

            {miEstado.voy_ganando && (
              <div className="indicador indicador--ganando">¡Vas ganando esta subasta!</div>
            )}
            {miEstado.fui_superado && (
              <div className="indicador indicador--superado">Tu oferta ha sido superada. ¡Haz tu oferta ahora antes de que termine el tiempo!</div>
            )}
            {miEstado.soy_dueno && (
              <div className="indicador indicador--info">Este es tu vehículo publicado. No puedes ofertar en él.</div>
            )}

            {puedeOfertar && (
              <form className="formulario formulario--oferta" onSubmit={onOfertar}>
                {error && <p className="mensaje mensaje--error">{error}</p>}
                {mensaje && <p className="mensaje mensaje--exito">{mensaje}</p>}
                <label>
                  Tu oferta (mínimo Q {Number(subasta.precio_minimo_siguiente).toLocaleString('es-GT')})
                  <input
                    type="number"
                    step="0.01"
                    min={subasta.precio_minimo_siguiente}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                  />
                </label>
                <button className="btn btn--primario" type="submit" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Ofertar'}
                </button>
              </form>
            )}

            {!usuario && subasta.estado === 'activa' && (
              <p className="mensaje">Debes <a onClick={() => navigate('/iniciar-sesion')}>iniciar sesión</a> para poder ofertar.</p>
            )}

            <details className="historial">
              <summary>Historial de ofertas ({subasta.total_pujas})</summary>
              <ul>
                {subasta.historial.map((h, i) => (
                  <li key={i} className={h.es_mia ? 'historial__item historial__item--mia' : 'historial__item'}>
                    Q {Number(h.monto).toLocaleString('es-GT')} {h.es_mia && '(tu oferta)'}
                  </li>
                ))}
                {subasta.historial.length === 0 && <li>Aún no hay ofertas.</li>}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
