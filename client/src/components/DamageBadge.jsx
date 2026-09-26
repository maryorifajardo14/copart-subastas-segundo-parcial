const ETIQUETAS = {
  verde: { texto: 'Daño menor / Limpio', clase: 'badge badge--verde' },
  amarillo: { texto: 'Daño medio / Reparable', clase: 'badge badge--amarillo' },
  rojo: { texto: 'Daño severo / Salvamento', clase: 'badge badge--rojo' },
};

export default function DamageBadge({ nivel }) {
  const info = ETIQUETAS[nivel] || ETIQUETAS.verde;
  return <span className={info.clase}>{info.texto}</span>;
}
