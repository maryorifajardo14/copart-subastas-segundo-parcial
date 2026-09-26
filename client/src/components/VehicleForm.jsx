import { useState } from 'react';

const TRENES = ['AWD', 'FWD', 'RWD', '4WD'];
const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'];
const DANOS = [
  { valor: 'verde', texto: 'Verde — Daño menor / Limpio' },
  { valor: 'amarillo', texto: 'Amarillo — Daño medio / Reparable' },
  { valor: 'rojo', texto: 'Rojo — Daño severo / Salvamento' },
];

function aInputLocal(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function valoresIniciales(vehiculo) {
  if (!vehiculo) {
    return {
      anio: '', tipo_articulo: '', marca: '', modelo: '', motor: '', transmision: '',
      tipo_combustible: '', tren_manejo: '', num_cilindros: '', nivel_dano: 'verde', descripcion_dano: '',
      fotos: ['', '', '', '', ''], precio_base: '', fecha_inicio: '', fecha_cierre: '',
    };
  }
  return {
    anio: vehiculo.anio, tipo_articulo: vehiculo.tipo_articulo, marca: vehiculo.marca, modelo: vehiculo.modelo,
    motor: vehiculo.motor, transmision: vehiculo.transmision, tipo_combustible: vehiculo.tipo_combustible,
    tren_manejo: vehiculo.tren_manejo, num_cilindros: vehiculo.num_cilindros, nivel_dano: vehiculo.nivel_dano,
    descripcion_dano: vehiculo.descripcion_dano || '',
    fotos: vehiculo.fotos && vehiculo.fotos.length ? vehiculo.fotos : ['', '', '', '', ''],
    precio_base: vehiculo.precio_base,
    fecha_inicio: aInputLocal(vehiculo.fecha_inicio),
    fecha_cierre: aInputLocal(vehiculo.fecha_cierre),
  };
}

export default function VehicleForm({ inicial, onSubmit, textoBoton, deshabilitado }) {
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });
  const setFoto = (i) => (e) => {
    const fotos = [...form.fotos];
    fotos[i] = e.target.value;
    setForm({ ...form, fotos });
  };
  const agregarFoto = () => setForm({ ...form, fotos: [...form.fotos, ''] });
  const quitarFoto = (i) => setForm({ ...form, fotos: form.fotos.filter((_, idx) => idx !== i) });

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    const fotosLimpias = form.fotos.map((f) => f.trim()).filter(Boolean);
    if (fotosLimpias.length < 5) {
      setError('Debes incluir al menos 5 fotografías (URLs de imagen).');
      return;
    }

    const payload = {
      ...form,
      anio: Number(form.anio),
      num_cilindros: Number(form.num_cilindros),
      precio_base: Number(form.precio_base),
      fotos: fotosLimpias,
      fecha_inicio: new Date(form.fecha_inicio).toISOString(),
      fecha_cierre: new Date(form.fecha_cierre).toISOString(),
    };

    setEnviando(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario--vehiculo" onSubmit={manejarEnvio}>
      {error && <p className="mensaje mensaje--error">{error}</p>}

      <fieldset disabled={deshabilitado}>
        <legend>Ficha técnica</legend>
        <div className="formulario__grid">
          <label>Año<input type="number" min="1900" max="2100" value={form.anio} onChange={set('anio')} required /></label>
          <label>Tipo de artículo<input value={form.tipo_articulo} onChange={set('tipo_articulo')} placeholder="Sedán, Pickup, SUV..." required /></label>
          <label>Marca<input value={form.marca} onChange={set('marca')} required /></label>
          <label>Modelo<input value={form.modelo} onChange={set('modelo')} required /></label>
          <label>Motor<input value={form.motor} onChange={set('motor')} placeholder="1.8L 4 cilindros" required /></label>
          <label>Transmisión<input value={form.transmision} onChange={set('transmision')} placeholder="Automática / Manual" required /></label>
          <label>
            Tipo de combustible
            <select value={form.tipo_combustible} onChange={set('tipo_combustible')} required>
              <option value="">Selecciona...</option>
              {COMBUSTIBLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Tren de manejo
            <select value={form.tren_manejo} onChange={set('tren_manejo')} required>
              <option value="">Selecciona...</option>
              {TRENES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Número de cilindros<input type="number" min="1" value={form.num_cilindros} onChange={set('num_cilindros')} required /></label>
        </div>

        <legend>Clasificación por estado de daño</legend>
        <div className="formulario__danos">
          {DANOS.map((d) => (
            <label key={d.valor} className="formulario__dano-opcion">
              <input type="radio" name="nivel_dano" value={d.valor} checked={form.nivel_dano === d.valor} onChange={set('nivel_dano')} />
              {d.texto}
            </label>
          ))}
        </div>
        <label>Descripción del daño (opcional)<textarea value={form.descripcion_dano} onChange={set('descripcion_dano')} rows={2} /></label>

        <legend>Galería fotográfica (mínimo 5 fotos, usa URLs de imagen)</legend>
        {form.fotos.map((f, i) => (
          <div className="formulario__foto-fila" key={i}>
            <input value={f} onChange={setFoto(i)} placeholder={`https://... (foto ${i + 1})`} />
            {form.fotos.length > 5 && (
              <button type="button" className="btn btn--ghost btn--pequeno" onClick={() => quitarFoto(i)}>Quitar</button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--pequeno" onClick={agregarFoto}>+ Agregar otra foto</button>

        <legend>Parámetros de la subasta</legend>
        <div className="formulario__grid">
          <label>Precio base (Q, mínimo 20,000)<input type="number" min="20000" step="0.01" value={form.precio_base} onChange={set('precio_base')} required /></label>
          <label>Fecha y hora de inicio<input type="datetime-local" value={form.fecha_inicio} onChange={set('fecha_inicio')} required /></label>
          <label>Fecha y hora de cierre<input type="datetime-local" value={form.fecha_cierre} onChange={set('fecha_cierre')} required /></label>
        </div>

        <button className="btn btn--primario" type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : textoBoton}
        </button>
      </fieldset>
    </form>
  );
}
