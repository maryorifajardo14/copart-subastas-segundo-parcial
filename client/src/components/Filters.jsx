const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'];
const TRENES = ['AWD', 'FWD', 'RWD', '4WD'];
const DANOS = [
  { valor: 'verde', texto: 'Verde' },
  { valor: 'amarillo', texto: 'Amarillo' },
  { valor: 'rojo', texto: 'Rojo' },
];
const ESTADOS = [
  { valor: 'activa', texto: 'En subasta' },
  { valor: 'pendiente', texto: 'Próximamente' },
  { valor: 'cerrada_vendida', texto: 'Vendidas' },
  { valor: 'cerrada_desierta', texto: 'Desiertas' },
];

export default function Filters({ valores, onChange }) {
  const set = (campo) => (e) => onChange({ ...valores, [campo]: e.target.value });

  return (
    <div className="filtros">
      <input
        className="filtros__buscar"
        type="text"
        placeholder="Buscar por marca, modelo o tipo..."
        value={valores.q || ''}
        onChange={set('q')}
      />
      <input type="text" placeholder="Marca" value={valores.marca || ''} onChange={set('marca')} />
      <input type="text" placeholder="Modelo" value={valores.modelo || ''} onChange={set('modelo')} />
      <input type="number" placeholder="Año" value={valores.anio || ''} onChange={set('anio')} />

      <select value={valores.tipo_combustible || ''} onChange={set('tipo_combustible')}>
        <option value="">Combustible (todos)</option>
        {COMBUSTIBLES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select value={valores.tren_manejo || ''} onChange={set('tren_manejo')}>
        <option value="">Tren de manejo (todos)</option>
        {TRENES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select value={valores.nivel_dano || ''} onChange={set('nivel_dano')}>
        <option value="">Nivel de daño (todos)</option>
        {DANOS.map((d) => <option key={d.valor} value={d.valor}>{d.texto}</option>)}
      </select>

      <select value={valores.estado || ''} onChange={set('estado')}>
        <option value="">Estado (todos)</option>
        {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.texto}</option>)}
      </select>

      <button className="btn btn--ghost" type="button" onClick={() => onChange({})}>Limpiar filtros</button>
    </div>
  );
}
