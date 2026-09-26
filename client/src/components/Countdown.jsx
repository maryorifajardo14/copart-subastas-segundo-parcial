import { useEffect, useState } from 'react';

function formatear(msRestante) {
  if (msRestante <= 0) return 'Finalizada';
  const totalSeg = Math.floor(msRestante / 1000);
  const d = Math.floor(totalSeg / 86400);
  const h = Math.floor((totalSeg % 86400) / 3600);
  const m = Math.floor((totalSeg % 3600) / 60);
  const s = totalSeg % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m ${s}s`;
}

// Temporizador calculado en el cliente a partir de fechaCierre: se actualiza cada
// segundo sin necesidad de refrescar la página ni de pedirlo al servidor.
export default function Countdown({ fechaCierre, onFinalizar }) {
  const [restante, setRestante] = useState(() => new Date(fechaCierre).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const nuevo = new Date(fechaCierre).getTime() - Date.now();
      setRestante(nuevo);
      if (nuevo <= 0 && onFinalizar) onFinalizar();
    }, 1000);
    return () => clearInterval(id);
  }, [fechaCierre, onFinalizar]);

  return <span className={restante <= 0 ? 'countdown countdown--finalizada' : 'countdown'}>{formatear(restante)}</span>;
}
